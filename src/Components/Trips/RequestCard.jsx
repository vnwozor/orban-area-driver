import React from 'react'
import { Icon } from '../UI/Icon'
import { RouteRail } from '../UI/Bits'
import { fmtDate, fmtTime, naira, plural, shortAddress } from '../../utils/format'

// "New Ride Request": pickup, destination, date, time, estimated fare, Accept | Decline
export default function RequestCard({ booking: b, busy, onAccept, onDecline }) {
    return (
        <article className='req'>
            <div className='req-top'>
                <b>New ride request</b>
                <span className='tiny num'>{b.code}</span>
            </div>
            <div className='req-body'>
                <RouteRail from={shortAddress(b.pickup)} to={shortAddress(b.destination)} />
                <div className='bk-facts'>
                    <div><Icon name='calendar' />Date: {fmtDate(b.date)}</div>
                    <div><Icon name='clock' />Time: {fmtTime(b.time)}</div>
                    <div><Icon name='users' />{b.passenger?.name}, {plural(b.passengers)}</div>
                    <div>
                        <div>
                            <small className='tiny' style={{ display: 'block' }}>Estimated fare</small>
                            <span className='fare-big num'>{naira(b.fare.total)}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className='req-foot'>
                <button className='btn btn-ghost' disabled={busy} onClick={() => onDecline(b)}>Decline</button>
                <button className='btn btn-primary' disabled={busy} onClick={() => onAccept(b)}>Accept</button>
            </div>
        </article>
    )
}
