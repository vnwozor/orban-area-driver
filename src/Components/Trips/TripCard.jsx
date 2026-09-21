import React from 'react'
import { Icon } from '../UI/Icon'
import { Avatar, RouteRail, StatusPill } from '../UI/Bits'
import { fmtDate, fmtTime, naira, placeName } from '../../utils/format'

const STEPS = ['Accepted', 'Arrived', 'Trip started', 'Completed']
const STEP_INDEX = { accepted: 0, arrived: 1, started: 2, completed: 3 }
// what the main button does next
const NEXT = { accepted: ['arrived', "I've arrived"], arrived: ['started', 'Start trip'], started: ['completed', 'Complete trip'] }

// An accepted trip: passenger, route, date/time, fare, status and the buttons to move it along
export default function TripCard({ booking: b, busy, confirming, onNext, onAskCancel, onKeep, onCancel }) {
    const i = STEP_INDEX[b.status]
    const next = NEXT[b.status]
    return (
        <article className='bk'>
            <div className='bk-top'>
                <span className='row' style={{ gap: 10 }}>
                    <Avatar name={b.passenger?.name || 'Passenger'} size='sm' />
                    <b>{b.passenger?.name}</b>
                </span>
                <StatusPill status={b.status} />
            </div>
            <div className='bk-body'>
                <RouteRail from={placeName(b.pickup)} to={placeName(b.destination)} />
                <div className='bk-facts'>
                    <div><Icon name='calendar' />{fmtDate(b.date)}</div>
                    <div><Icon name='clock' />{fmtTime(b.time)}</div>
                    <div><Icon name='phone' />{b.passenger?.phone}</div>
                    <div><Icon name='cash' /><b className='num' style={{ color: 'var(--ink)' }}>{naira(b.fare.total)}</b></div>
                </div>
            </div>
            <div style={{ padding: '0 20px 18px' }}>
                <ol className='stepper' aria-label='Trip status'>
                    {STEPS.map((s, k) => (
                        <li key={s} className={k < i ? 'done' : k === i ? 'now' : ''}>{s}</li>
                    ))}
                </ol>
            </div>
            {confirming && (
                <div className='confirm'>
                    <span>Cancel this trip? {b.passenger?.name} will be notified.</span>
                    <button className='btn btn-ghost btn-sm' onClick={onKeep}>Keep trip</button>
                    <button className='btn btn-danger btn-sm' disabled={busy} onClick={() => onCancel(b)}>Yes, cancel</button>
                </div>
            )}
            <div className='trip-actions' style={{ paddingTop: confirming ? 16 : 0 }}>
                {next && <button className='btn btn-primary' disabled={busy} onClick={() => onNext(b, next[0])}>{next[1]}</button>}
                <button className='btn btn-danger' onClick={() => onAskCancel(b.id)}>Cancel trip</button>
            </div>
        </article>
    )
}
