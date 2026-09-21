import React, { useContext, useEffect, useState } from 'react'
import { Link, Outlet, Navigate, useLocation } from 'react-router-dom'
import { ShopContext } from '../../Context/ShopContext'
import { Icon, Logo } from '../UI/Icon'
import { Avatar } from '../UI/Bits'

const NAV = [
    { to: '/book', label: 'Book a ride', icon: 'car', match: (p) => p === '/book' || p.startsWith('/book/') },
    { to: '/bookings', label: 'My bookings', icon: 'list', match: (p) => p.startsWith('/bookings') || p.startsWith('/booking/') },
    { to: '/profile', label: 'Profile', icon: 'user', match: (p) => p.startsWith('/profile') },
]

// Sends signed-out visitors to /login and remembers where they were going.
export function RequireAuth({ children }) {
    const { currentUser } = useContext(ShopContext)
    const location = useLocation()
    if (!currentUser) return <Navigate to='/login' replace state={{ from: location.pathname }} />
    return children
}

export default function AppShell() {
    const { currentUser } = useContext(ShopContext)
    const { pathname } = useLocation()
    const [dark, setDark] = useState(() => document.documentElement.dataset.theme === 'dark')

    useEffect(() => {
        const saved = localStorage.getItem('orban_theme')
        if (saved) {
            document.documentElement.dataset.theme = saved
            setDark(saved === 'dark')
        }
    }, [])

    const toggleTheme = () => {
        const isDark =
            document.documentElement.dataset.theme
                ? document.documentElement.dataset.theme === 'dark'
                : window.matchMedia?.('(prefers-color-scheme: dark)').matches
        const next = isDark ? 'light' : 'dark'
        document.documentElement.dataset.theme = next
        localStorage.setItem('orban_theme', next)
        setDark(next === 'dark')
    }

    return (
        <>
            <header className='topbar'>
                <Link to='/book' className='brand' style={{ color: 'inherit', textDecoration: 'none' }}>
                    <Logo />
                    <span>Orban</span>
                </Link>
                <button className='icon-btn' style={{ marginLeft: 'auto' }} onClick={toggleTheme} aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
                    <Icon name='moon' />
                </button>
            </header>
            <div className='shell'>
                <nav className='side' aria-label='Main'>
                    {NAV.map((n) => (
                        <Link key={n.to} to={n.to} className='nav-item' aria-current={n.match(pathname) ? 'page' : undefined}>
                            <Icon name={n.icon} />
                            <span className='t'>{n.label}</span>
                        </Link>
                    ))}
                    <div className='side-user'>
                        <Avatar name={currentUser.name} />
                        <div>
                            <b>{currentUser.name}</b>
                            <small>Rider</small>
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
