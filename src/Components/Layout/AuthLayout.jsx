import React from 'react'
import { Link } from 'react-router-dom'
import { Icon, Logo } from '../UI/Icon'
import { CarArt } from '../CarArt/CarArt'
import ThemeToggle from '../UI/ThemeToggle'

// Shared frame for the Login and Signup pages.
export default function AuthLayout({ tab, title, subtitle, children }) {
    return (
        <>
            <header className='topbar'>
                <div className='brand'>
                    <Logo />
                    <span>Orban</span>
                </div>
                <ThemeToggle />
            </header>
            <div className='auth'>
                <section className='auth-art'>
                    <div className='brand'>
                        <Logo />
                        <span>Orban</span>
                    </div>
                    <h2>Your car, your schedule.</h2>
                    <ul>
                        {['Go online when you are ready to drive', 'Accept the trips you want', 'See your earnings after every trip'].map((t) => (
                            <li key={t}>
                                <Icon name='check' />
                                {t}
                            </li>
                        ))}
                    </ul>
                    <div>
                        <div className='car-wrap'>
                            <CarArt type='SUV' color='#A5222F' />
                        </div>
                        <div className='road' />
                    </div>
                </section>
                <section className='auth-card'>
                    <div>
                        <h2>{title}</h2>
                        <p className='muted' style={{ marginTop: 6 }}>{subtitle}</p>
                    </div>
                    <div className='tabs' style={{ margin: 0 }}>
                        <Link to='/login' role='tab' aria-selected={tab === 'login'} className='tab-link'>Log in</Link>
                        <Link to='/signup' role='tab' aria-selected={tab === 'signup'} className='tab-link'>Create account</Link>
                    </div>
                    {children}
                </section>
            </div>
        </>
    )
}

export const TextField = ({ label, icon, type = 'text', value, onChange, ...rest }) => (
    <div className='field'>
        <label>{label}</label>
        <div className='inp'>
            {icon && <Icon name={icon} />}
            <input type={type} value={value} onChange={(e) => onChange(e.target.value)} {...rest} />
        </div>
    </div>
)
