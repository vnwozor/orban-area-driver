import React, { createContext, useState } from 'react'

export const DriverContext = createContext()

const API_BASE = import.meta.env.VITE_API_URL

export const DriverContextProvider = ({ children }) => {
    const [currentDriver, setCurrentDriverState] = useState(() => {
        const saved = localStorage.getItem('currentDriver')
        return saved ? JSON.parse(saved) : null
    })
    const [token, setTokenState] = useState(() => localStorage.getItem('driverAuthToken'))

    const setCurrentDriver = (driver) => {
        setCurrentDriverState(driver)
        if (driver) {
            localStorage.setItem('currentDriver', JSON.stringify(driver))
        } else {
            localStorage.removeItem('currentDriver')
        }
    }

    const setToken = (nextToken) => {
        setTokenState(nextToken)
        if (nextToken) {
            localStorage.setItem('driverAuthToken', nextToken)
        } else {
            localStorage.removeItem('driverAuthToken')
        }
    }

    // Called by every sign-up/login/OTP/OAuth flow once the backend returns
    // { driver, token }.
    const setSession = ({ driver, token: newToken }) => {
        setCurrentDriver(driver)
        setToken(newToken)
    }

    const logout = () => {
        setCurrentDriver(null)
        setToken(null)
    }

    const authFetch = async (path, options = {}) => {
        const res = await fetch(`${API_BASE}${path}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...(options.headers || {}),
            },
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.message || 'Request failed')
        return data
    }

    const updateProfile = async (updates) => {
        const driver = await authFetch(`/api/drivers/${currentDriver._id}/profile`, {
            method: 'PATCH',
            body: JSON.stringify(updates),
        })
        setCurrentDriver(driver)
        return driver
    }

    const updateEmergencyContact = async (contact) => {
        const driver = await authFetch(`/api/drivers/${currentDriver._id}/emergency-contact`, {
            method: 'PATCH',
            body: JSON.stringify(contact),
        })
        setCurrentDriver(driver)
        return driver
    }

    return (
        <DriverContext.Provider
            value={{
                currentDriver,
                setCurrentDriver,
                token,
                setSession,
                authFetch,
                logout,
                updateProfile,
                updateEmergencyContact,
            }}
        >
            {children}
        </DriverContext.Provider>
    )
}
