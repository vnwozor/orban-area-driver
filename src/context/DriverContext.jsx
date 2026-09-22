import React, { createContext, useCallback, useMemo, useRef, useState } from 'react'

export const DriverContext = createContext(null)

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')

const read = (key, fallback) => {
    try {
        const raw = localStorage.getItem(key)
        return raw ? JSON.parse(raw) : fallback
    } catch {
        return fallback
    }
}


// The apps expect { user, token } (or { driver, token }). If the server answers with something else
// (for example an older backend is running, or VITE_API_URL points at the wrong place) we stop with a
// clear message instead of crashing.
const BAD_REPLY =
    "The server's reply isn't what the app expects. Make sure the new Orban backend (orban-backend.zip) is running and VITE_API_URL in your .env points to it, then restart npm run dev."

const asSession = (data, key) => {
    const account = data?.[key] || data?.data || (data?._id ? data : null)
    const token = data?.token || data?.accessToken
    if (!account || typeof account !== 'object' || !token) {
        console.error('Unexpected login/register response:', data)
        throw Object.assign(new Error(BAD_REPLY), { status: 0 })
    }
    const { token: _ignored, ...rest } = account
    return { [key]: rest, token }
}

export function DriverContextProvider({ children }) {
    const [driver, setDriverState] = useState(() => read('orban_driver', null))
    const [token, setToken] = useState(() => localStorage.getItem('orban_driver_token') || '')
    const [counts, setCounts] = useState({ requests: 0, unread: 0 }) // sidebar badges
    const tokenRef = useRef(token)
    tokenRef.current = token

    const setDriver = useCallback((d) => {
        setDriverState(d)
        localStorage.setItem('orban_driver', JSON.stringify(d))
    }, [])

    const setSession = useCallback(
        (d, jwt) => {
            setDriver(d)
            setToken(jwt)
            tokenRef.current = jwt
            localStorage.setItem('orban_driver_token', jwt)
        },
        [setDriver]
    )

    const logout = useCallback(() => {
        setDriverState(null)
        setToken('')
        tokenRef.current = ''
        setCounts({ requests: 0, unread: 0 })
        localStorage.removeItem('orban_driver')
        localStorage.removeItem('orban_driver_token')
    }, [])

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
                if (res.status === 401 && tokenRef.current && !path.includes('/login')) logout() // expired token
                throw Object.assign(new Error(data.message || 'Something went wrong'), { status: res.status })
            }
            return data
        },
        [logout]
    )

    const api = useMemo(
        () => ({
            login: async (identifier, password) => asSession(await request('/api/drivers/login', { method: 'POST', body: { identifier, password } }), 'driver'),
            register: async (form) => asSession(await request('/api/drivers', { method: 'POST', body: form }), 'driver'),
            me: () => request('/api/driver/me'),
            updateMe: (updates) => request('/api/driver/me', { method: 'PUT', body: updates }),
            saveVehicle: (vehicle) => request('/api/driver/vehicle', { method: 'PUT', body: vehicle }),
            setOnline: (online) => request('/api/driver/availability', { method: 'PATCH', body: { online } }),
            requests: () => request('/api/driver/requests'),
            trips: () => request('/api/driver/trips'),
            history: (tab) => request(`/api/driver/history?tab=${tab}`),
            passengers: () => request('/api/driver/passengers'),
            earnings: () => request('/api/driver/earnings'),
            accept: (id) => request(`/api/driver/bookings/${id}/accept`, { method: 'PATCH' }),
            decline: (id) => request(`/api/driver/bookings/${id}/decline`, { method: 'PATCH' }),
            setStatus: (id, status) => request(`/api/driver/bookings/${id}/status`, { method: 'PATCH', body: { status } }),
            notifications: () => request('/api/notifications'),
            unreadCount: () => request('/api/notifications/unread-count'),
            markAllRead: () => request('/api/notifications/read-all', { method: 'PATCH' }),
        }),
        [request]
    )

    // Refreshes the sidebar badges (waiting requests + unread notifications)
    const refreshCounts = useCallback(async () => {
        if (!tokenRef.current) return
        try {
            const [reqs, unread] = await Promise.all([api.requests(), api.unreadCount()])
            setCounts({ requests: reqs.length, unread: unread.unread })
        } catch {
            /* the page itself shows errors; badges just stay as they were */
        }
    }, [api])

    const value = { driver, token, setDriver, setSession, logout, api, counts, refreshCounts }
    return <DriverContext.Provider value={value}>{children}</DriverContext.Provider>
}
