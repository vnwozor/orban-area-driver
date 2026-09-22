import React, { useContext, useEffect } from 'react'
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import { DriverContext } from '../../Context/DriverContext'
import { usePolling } from '../../hooks/usePolling'
import { Icon, Logo } from '../UI/Icon'
import { Avatar } from '../UI/Bits'
import ThemeToggle from '../UI/ThemeToggle'

const NAV = [
    { to: '/', label: 'Home', icon: 'home', match: (p) => p === '/', badge: 'requests' },
    { to: '/trips', label: 'Trips', icon: 'route', match: (p) => p.startsWith('/trips') },
    { to: '/history', label: 'History', icon: 'history', match: (p) => p.startsWith('/history') },
    { to: '/vehicle', label: 'Vehicle', icon: 'car', match: (p) => p.startsWith('/vehicle') },
    { to: '/notifications', label: 'Notifications', icon: 'bell', match: (p) => p.startsWith('/notifications'), badge: 'unread', desk: true },
    { to: '/profile', label: 'Profile', icon: 'user', match: (p) => p.startsWith('/profile') },
]

export function RequireDriver({ children }) {
    const { driver } = useContext(DriverContext)
    const location = useLocation()
    if (!driver) return <Navigate to='/login' replace state={{ from: location.pathname }} />
    return children
}

export default function DriverShell() {
    const { driver, counts, refreshCounts } = useContext(DriverContext)
    const { pathname } = useLocation()
    useEffect(() => {
        refreshCounts()
    }, [refreshCounts])
    usePolling(refreshCounts, 15000)

    return (
        <>
            <header className='topbar'>
                <Link to='/' className='brand' style={{ color: 'inherit', textDecoration: 'none' }}>
                    <Logo />
                    <span>Orban Driver</span>
                </Link>
                <ThemeToggle />
            </header>
            <div className='shell'>
                <nav className='side' aria-label='Main'>
                    {NAV.map((n) => (
                        <Link key={n.to} to={n.to} className={`nav-item ${n.desk ? 'desk-only' : ''}`.trim()} aria-current={n.match(pathname) ? 'page' : undefined}>
                            <Icon name={n.icon} />
                            <span className='t'>{n.label}</span>
                            {n.badge && counts[n.badge] > 0 && <span className='nav-badge'>{counts[n.badge]}</span>}
                        </Link>
                    ))}
                    <div className='side-user'>
                        <Avatar name={driver.name} photo={driver.photo} />
                        <div>
                            <b>{driver.name}</b>
                            <small>Driver</small>
                        </div>
                    </div>
                </nav>
                <main className='main' id='main'>
                    <Outlet />
                </main>
            </div>
        </>
    )
}
