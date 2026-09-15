import React from 'react'
import "./Navbar.css"
import { assets } from '../../assets/assets'
import { Link } from 'react-router-dom'

export const Navbar = ({ driverName, onLogout }) => {
  return (
    <div className='nav-main'>

        <div className='nav-left-section'>
            <img className='orban-nav-logo' src={assets.orban_logo} />
        </div>

        <div className='nav-types'>
            {driverName && <p>Hi, {driverName}</p>}
        </div>

        <div className='nav-right-section'>
            {onLogout ? (
                <>
                    <Link to='/settings' className='nav-icon-link'>
                        <img src={assets.settings_icon} alt="Settings" />
                    </Link>
                    <button onClick={onLogout} className='nav-logout-btn'>Logout</button>
                </>
            ) : (
                <img src={assets.settings_icon} alt="" />
            )}
        </div>
    </div>
  )
}
