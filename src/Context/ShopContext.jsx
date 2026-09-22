import React, { createContext, useCallback, useMemo, useRef, useState } from 'react'
import { tomorrowISO, todayISO } from '../utils/format'

export const ShopContext = createContext(null)

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')

const read = (store, key, fallback) => {
    try {
        const raw = store.getItem(key)
        return raw ? JSON.parse(raw) : fallback
    } catch {
        return fallback
    }
}

const freshTrip = () => ({ pickup: null, destination: null, date: tomorrowISO(), time: '09:00', passengers: 1 })

// The trip survives a page refresh (sessionStorage), but never keeps a date in the past.
const loadTrip = () => {
    const t = { ...freshTrip(), ...read(sessionStorage, 'orban_trip', {}) }
    if (!t.date || t.date < todayISO()) t.date = tomorrowISO()
    return t
}

// Turns a trip into the query string the cars API expects.
export const tripQuery = (trip, extra = {}) =>
    '?' +
    new URLSearchParams({
        pickupLat: trip.pickup.lat,
        pickupLng: trip.pickup.lng,
        pickupAddress: trip.pickup.address || trip.pickup.name || '',
        destLat: trip.destination.lat,
        destLng: trip.destination.lng,
        destAddress: trip.destination.address || trip.destination.name || '',
        date: trip.date,
        time: trip.time,
        passengers: trip.passengers,
        ...extra,
    }).toString()

const locBody = (l) => ({ address: l.address || l.name || '', lat: l.lat, lng: l.lng })

export function ShopContextProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(() => read(localStorage, 'orban_user', null))
    const [token, setToken] = useState(() => localStorage.getItem('orban_token') || '')
    const [trip, setTripState] = useState(loadTrip)
    const tokenRef = useRef(token)
    tokenRef.current = token

    // ----- session -----
    const setSession = useCallback((user, jwt) => {
        setCurrentUser(user)
        setToken(jwt)
        tokenRef.current = jwt
        localStorage.setItem('orban_user', JSON.stringify(user))
        localStorage.setItem('orban_token', jwt)
    }, [])

    const logout = useCallback(() => {
        setCurrentUser(null)
        setToken('')
        tokenRef.current = ''
        localStorage.removeItem('orban_user')
        localStorage.removeItem('orban_token')
        sessionStorage.removeItem('orban_trip')
        setTripState(freshTrip())
    }, [])

    // ----- the one place that talks to the API -----
    const request = useCallback(
        async (path, { method = 'GET', body } = {}) => {
            let res
            try {
                res = await fetch(`${API_BASE}${path}`, {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                        ...(tokenRef.current ? { Authorization: `Bearer ${tokenRef.current}` } : {}),
                    },
                    body: body ? JSON.stringify(body) : undefined,
                })
            } catch {
                throw Object.assign(new Error("Can't reach the server. Check your connection and try again."), { status: 0 })
            }
            const data = await res.json().catch(() => ({}))
            if (!res.ok) {
                // An expired token on a protected call = sign the rider out
                if (res.status === 401 && tokenRef.current && !path.includes('/login')) logout()
                throw Object.assign(new Error(data.message || 'Something went wrong'), { status: res.status })
            }
            return data
        },
        [logout]
    )

    // ----- trip (search) state -----
    const setTrip = useCallback((patch) => {
        setTripState((prev) => {
            const next = { ...prev, ...patch }
            sessionStorage.setItem('orban_trip', JSON.stringify(next))
            return next
        })
    }, [])

    // ----- API methods -----
    const api = useMemo(
        () => ({
            login: (email, password) => request('/api/users/login', { method: 'POST', body: { email, password } }),
            register: (form) => request('/api/users', { method: 'POST', body: form }),
            me: () => request('/api/users/me'),
            updateProfile: (id, updates) => request(`/api/users/${id}/profile`, { method: 'PATCH', body: updates }),
            searchCars: (t, type) => request(`/api/cars${tripQuery(t, type && type !== 'All' ? { type } : {})}`),
            getCar: (id, t) => request(`/api/cars/${id}${tripQuery(t)}`),
            createBooking: ({ carId, trip: t, expectedTotal, payment }) =>
                request('/api/bookings', {
                    method: 'POST',
                    body: {
                        carId,
                        pickup: locBody(t.pickup),
                        destination: locBody(t.destination),
                        date: t.date,
                        time: t.time,
                        passengers: t.passengers,
                        expectedTotal,
                        payment,
                    },
                }),
            myBookings: () => request('/api/bookings/mine'),
            getBooking: (id) => request(`/api/bookings/${id}`),
            cancelBooking: (id) => request(`/api/bookings/${id}/cancel`, { method: 'PATCH' }),
        }),
        [request]
    )

    const value = {
        currentUser,
        token,
        setSession,
        setCurrentUser: (u) => {
            setCurrentUser(u)
            localStorage.setItem('orban_user', JSON.stringify(u))
        },
        logout,
        trip,
        setTrip,
        resetTrip: () => {
            sessionStorage.removeItem('orban_trip')
            setTripState(freshTrip())
        },
        api,
    }

    return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}
