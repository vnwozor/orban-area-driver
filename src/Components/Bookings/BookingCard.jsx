import React from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../UI/Icon'
import { RouteRail, StatusPill } from '../UI/Bits'
import { ACTIVE, fmtDate, fmtTime, naira, placeName, plural } from '../../utils/format'

export default function BookingCard({ booking: b, confirming, onAskCancel, onKeep, onCancel, onRebook }) {
    const upcoming = ACTIVE.includes(b.status)
    const cancellable = ['pending', 'accepted'].includes(b.status)
    return (
        <article className='bk'>
            <div className='bk-top'>
                <b className='num'>{b.code}</b>
                <StatusPill status={b.status} />
            </div>
            <div className='bk-body'>
                <RouteRail from={placeName(b.pickup)} to={placeName(b.destination)} />
                <div className='bk-facts'>
                    <div><Icon name='calendar' />{fmtDate(b.date)}</div>
                    <div><Icon name='clock' />{fmtTime(b.time)}</div>
                    <div><Icon name='users' />{plural(b.passengers)}</div>
                    <div><Icon name='car' />{b.car.model}, {b.driver?.name}</div>
                </div>
            </div>
            {confirming && (
                <div className='confirm'>
                    <span>Cancel booking {b.code}?</span>
                    <button className='btn btn-ghost btn-sm' onClick={onKeep}>Keep booking</button>
                    <button className='btn btn-danger btn-sm' onClick={() => onCancel(b)}>Yes, cancel</button>
                </div>
            )}
            <div className='bk-foot'>
                <span className='fare-big num'>{naira(b.fare.total)}</span>
                <div className='row'>
                    {upcoming ? (
                        <>
                            <Link to={`/booking/${b.id}`} className='btn btn-ghost btn-sm'>View ticket</Link>
                            {cancellable && <button className='btn btn-danger btn-sm' onClick={() => onAskCancel(b.id)}>Cancel booking</button>}
                        </>
                    ) : (
                        <button className='btn btn-dark btn-sm' onClick={() => onRebook(b)}>Book again</button>
                    )}
                </div>
            </div>
        </article>
    )
}
