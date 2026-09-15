import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import './Settings.css'
import { DriverContext } from '../context/DriverContext'
import { Navbar } from '../Components/NavBar/Navbar'

const API_BASE = import.meta.env.VITE_API_URL

const Settings = () => {
    const { currentDriver, logout } = useContext(DriverContext)
    const navigate = useNavigate()
    const [completedRides, setCompletedRides] = useState(null)

    useEffect(() => {
        fetch(`${API_BASE}/drivers/${currentDriver._id}/stats`)
            .then((res) => res.json())
            .then((data) => setCompletedRides(data.completedRides))
            .catch((err) => console.error('Failed to load stats:', err))
    }, [currentDriver._id])

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const initial = currentDriver.name?.charAt(0).toUpperCase() || '?'

    return (
        <>
            <Navbar onLogout={handleLogout} driverName={currentDriver.name} />

            <main className='settings-page'>
                <Link to='/' className='settings-back-link'>&larr; Back to dashboard</Link>
                <h1>My Account</h1>

                <div className='settings-avatar'>{initial}</div>

                <div className='settings-card'>
                    <div className='settings-row'>
                        <span className='settings-row-label'>Name</span>
                        <span className='settings-row-value'>{currentDriver.name}</span>
                    </div>
                    <div className='settings-row'>
                        <span className='settings-row-label'>Email</span>
                        <span className='settings-row-value'>{currentDriver.email}</span>
                    </div>
                    <div className='settings-row'>
                        <span className='settings-row-label'>Phone</span>
                        <span className='settings-row-value'>{currentDriver.phone}</span>
                    </div>
                    <div className='settings-row'>
                        <span className='settings-row-label'>Plate number</span>
                        <span className='settings-row-value'>{currentDriver.car?.plateNumber}</span>
                    </div>

                    <div className='settings-stat'>
                        <div className='settings-stat-number'>{completedRides ?? '—'}</div>
                        <div className='settings-stat-label'>Rides completed</div>
                    </div>
                </div>

                <button onClick={handleLogout} className='settings-logout-btn'>
                    Logout
                </button>
            </main>
        </>
    )
}

export default Settings
