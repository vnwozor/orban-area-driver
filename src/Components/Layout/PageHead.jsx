import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { DriverContext } from '../../Context/DriverContext'
import { Icon } from '../UI/Icon'

// Page title + the notifications bell (with an unread badge)
export default function PageHead({ title, lede, children }) {
    const { counts } = useContext(DriverContext)
    return (
        <div className='page-head'>
            <div>
                <h1>{title}</h1>
                {lede && <p className='lede'>{lede}</p>}
            </div>
            <div className='row' style={{ flexWrap: 'nowrap' }}>
                {children}
                <Link to='/notifications' className='bell' aria-label={`Notifications${counts.unread ? `, ${counts.unread} unread` : ''}`}>
                    <Icon name='bell' />
                    {counts.unread > 0 && <i>{counts.unread}</i>}
                </Link>
            </div>
        </div>
    )
}
