import React, { useContext } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import { DriverContextProvider, DriverContext } from './context/DriverContext'
import { DriverLogin } from './Page/DriverLogin'
import DriverSignup from './Page/DriverSignup'
import Settings from './Page/Settings'
import { Driver } from './Components/Driver/Driver'


function RequireDriver({ children }) {
    const { currentDriver } = useContext(DriverContext)
    if (!currentDriver) return <Navigate to='/login' replace />
    return children
}

function AppRoutes() {
    return (
        <Routes>
            <Route path='/login' element={<DriverLogin />} />
            <Route path='/signup' element={<DriverSignup />} />
            <Route
                path='/'
                element={
                    <RequireDriver>
                        <Driver />
                    </RequireDriver>
                }
            />
            <Route
                path='/settings'
                element={
                    <RequireDriver>
                        <Settings />
                    </RequireDriver>
                }
            />
        </Routes>
    )
}

function App() {
    return (
        <DriverContextProvider>
            <BrowserRouter>
                <AppRoutes />
            </BrowserRouter>
        </DriverContextProvider>
    )
}

export default App
