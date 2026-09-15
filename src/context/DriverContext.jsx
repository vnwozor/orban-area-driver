import React, { createContext, useState, useEffect } from 'react'

export const DriverContext = createContext()

export const DriverContextProvider = ({ children }) => {
    const [currentDriver, setCurrentDriverState] = useState(() => {
        const saved = localStorage.getItem('currentDriver')
        return saved ? JSON.parse(saved) : null
    })


    
    const setCurrentDriver = (driver) => {
        setCurrentDriverState(driver)
        if (driver) {
            localStorage.setItem('currentDriver', JSON.stringify(driver))
        } else {
            localStorage.removeItem('currentDriver')
        }
    }

    const logout = () => setCurrentDriver(null)

    return (
        <DriverContext.Provider value={{ currentDriver, setCurrentDriver, logout }}>
            {children}
        </DriverContext.Provider>
    )
}
