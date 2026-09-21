import React from 'react'
import { Icon } from '../UI/Icon'
import { RouteRail, StatusPill } from '../UI/Bits'
import { fmtDate, fmtTime, naira, placeName } from '../../utils/format'

// A little scannable code made from the booking code (decorative).
function Code({ value }) {
    let h = 7
    for (const ch of value) h = (h * 31 + ch.charCodeAt(0)) >>> 0
    const n = 9
    const cells = []
    for (let y = 0; y < n; y++) {
        for (let x = 0; x < n; x++) {
            h = (h * 1664525 + 1013904223) >>> 0
            const finder = (x < 3 && y < 3) || (x > n - 4 && y < 3) || (x < 3 && y > n - 4)
            const on = finder ? !(x % (n - 3) === 1 && y % (n - 3) === 1) : (h >>> 24) & 1
            if (on) cells.push(<rect key={`${x}-${y}`} x={x} y={y} width='1.02' height='1.02' fill='#0F1B2D' />)
        }
    }
    return (
        <svg viewBox={`0 0 ${n} ${n}`} shapeRendering='crispEdges' role='img' aria-label='Booking code'>
            {cells}
        </svg>
    )
}

// Booking confirmation as a ticket: booking ID, car, driver, pickup,
// destination, date/time, price and status.
export default function Ticket({ booking }) {
    const p = booking.payment
    const stubLabel = p.method === 'cash' ? 'Pay driver in cash' : p.status === 'refunded' ? 'Refunded' : 'Total paid'
    return (
        <div className='ticket'>
            <div className='tk-main'>
                <div className='tk-head'>
                    <div>
                        <span className='tk-k'>Booking ID</span>
                        <span className='tk-id num'>{booking.code}</span>
                    </div>
                    <StatusPill status={booking.status} />
                </div>
                <RouteRail dark from={placeName(booking.pickup)} to={placeName(booking.destination)} fromLabel='Pickup location' />
                <dl className='tk-grid' style={{ margin: 0 }}>
                    <div>
                        <span className='tk-k'>Date and time</span>
                        <b>
                            {fmtDate(booking.date)}, {fmtTime(booking.time)}
                        </b>
                    </div>
                    <div>
                        <span className='tk-k'>Passengers</span>
                        <b>{booking.passengers}</b>
                    </div>
                    <div>
                        <span className='tk-k'>Car</span>
                        <b>
                            {booking.car.model} <span style={{ fontWeight: 500, opacity: 0.75 }}>({booking.car.plateNumber})</span>
                        </b>
                    </div>
                    <div>
                        <span className='tk-k'>Driver</span>
                        <b>{booking.driver?.name || 'Driver'}</b>
                    </div>
                </dl>
            </div>
            <div className='tk-stub'>
                <div>
                    <span className='tk-k'>{stubLabel}</span>
                    <strong className='num'>{naira(booking.fare.total)}</strong>
                    {p.reference && <span className='tk-k' style={{ marginTop: 6 }}>Ref {p.reference}</span>}
                </div>
                <div className='qr'>
                    <Code value={booking.code} />
                </div>
            </div>
        </div>
    )
}

export const DriverContact = ({ booking }) =>
    booking.driver?.phone ? (
        <p className='tip' style={{ marginTop: 16 }}>
            <Icon name='phone' style={{ verticalAlign: 'middle', marginRight: 8 }} />
            Driver {booking.driver.name}: {booking.driver.phone}
        </p>
    ) : null
