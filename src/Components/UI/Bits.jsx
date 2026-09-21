import React from 'react'
import { Icon } from './Icon'
import { STATUS, hue, initials, naira } from '../../utils/format'

export const Avatar = ({ name, photo, size = '' }) => (
    <span className={`av ${size}`.trim()} style={{ '--h': hue(name) }}>
        {photo ? <img src={photo} alt='' /> : initials(name)}
    </span>
)

export const Stars = ({ rating }) => (
    <span className='stars'>
        <Icon name='star' fill />
        {Number(rating).toFixed(1)}
    </span>
)

export const StatusPill = ({ status }) => {
    const [label, kind] = STATUS[status] || [status, 'mute']
    return <span className={`pill pill-${kind}`}>{label}</span>
}

// Pickup -> destination, drawn as a route (circle = start, square = end).
export const RouteRail = ({ from, to, fromLabel = 'Pickup', toLabel = 'Destination', dark = false }) => (
    <div className={`route ${dark ? 'on-dark' : ''}`.trim()}>
        <div className='rstop from'>
            <small>{fromLabel}</small>
            <b>{from}</b>
        </div>
        <div className='rstop to'>
            <small>{toLabel}</small>
            <b>{to}</b>
        </div>
    </div>
)

export const Empty = ({ title, children, action }) => (
    <div className='empty'>
        <h3>{title}</h3>
        {children && <p>{children}</p>}
        {action}
    </div>
)

export const Spinner = () => <span className='spin' aria-label='Loading' />

export const FareBreakdown = ({ fare, label = 'Estimated total' }) => (
    <div className='fare'>
        <div className='ln'>
            <span>Base fare</span>
            <b className='num'>{naira(fare.base)}</b>
        </div>
        <div className='ln'>
            <span>
                Distance ({fare.distanceKm} km at {naira(fare.pricePerKm)}/km)
            </span>
            <b className='num'>{naira(fare.distance)}</b>
        </div>
        <div className='ln'>
            <span>Service fee</span>
            <b className='num'>{naira(fare.service)}</b>
        </div>
        <div className='ln tot'>
            <span>{label}</span>
            <strong className='num'>{naira(fare.total)}</strong>
        </div>
        <p className='tiny'>Based on the trip distance, about {fare.durationMin} min drive.</p>
    </div>
)
