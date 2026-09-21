import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import DriverShell, { RequireDriver } from './Components/Layout/DriverShell'
import Login from './Pages/Login'
import Signup from './Pages/Signup'
import Home from './Pages/Home'
import Trips from './Pages/Trips'
import History from './Pages/History'
import Vehicle from './Pages/Vehicle'
import Notifications from './Pages/Notifications'
import Profile from './Pages/Profile'

export default function App() {
    return (
        <Routes>
            <Route path='/login' element={<Login />} />
            <Route path='/signup' element={<Signup />} />
            <Route
                element={
                    <RequireDriver>
                        <DriverShell />
                    </RequireDriver>
                }
            >
                <Route path='/' element={<Home />} />
                <Route path='/trips' element={<Trips />} />
                <Route path='/history' element={<History />} />
                <Route path='/vehicle' element={<Vehicle />} />
                <Route path='/notifications' element={<Notifications />} />
                <Route path='/profile' element={<Profile />} />
            </Route>
            <Route path='*' element={<Navigate to='/' replace />} />
        </Routes>
    )
}
