import React, { useCallback, useContext, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ShopContext } from '../Context/ShopContext'
import BookingSteps from '../Components/BookingSteps/BookingSteps'
import Ticket, { DriverContact } from '../Components/Ticket/Ticket'
import { Icon } from '../Components/UI/Icon'
import { Empty } from '../Components/UI/Bits'
import { usePolling } from '../hooks/usePolling'
import { ACTIVE } from '../utils/format'

// Booking confirmation (right after paying) and "View ticket" from My Bookings
export default function BookingTicket() {
    const { id } = useParams()
    const { api, resetTrip } = useContext(ShopContext)
    const location = useLocation()
    const navigate = useNavigate()
    const fresh = Boolean(location.state?.fresh)
    const [state, setState] = useState({ loading: true, booking: null, error: '' })

    const load = useCallback(
        () => api.getBooking(id).then((b) => setState({ loading: false, booking: b, error: '' })).catch((e) => setState((s) => ({ ...s, loading: false, error: e.message }))),
        [api, id]
    )
    useEffect(() => { load() }, [load])

    // Pick up the driver's answer (accepted, arrived...) without a refresh
    usePolling(load, 8000, Boolean(state.booking && ACTIVE.includes(state.booking.status)))

    const { booking } = state
    if (state.loading) return <div className='skel' style={{ minHeight: 360 }} />
    if (!booking) return <Empty title='Booking not found' action={<Link to='/bookings' className='btn btn-dark'>My bookings</Link>}>{state.error}</Empty>

    const cash = booking.payment.method === 'cash'
    return (
        <>
            {fresh ? (
                <>
                    <BookingSteps current={3} />
                    <div className='ok-head'>
                        <span className='ok-badge'><Icon name='check' /></span>
                        <div>
                            <h1 style={{ fontSize: 'clamp(26px,3.6vw,36px)' }}>{cash ? 'Booking placed' : 'Payment successful'}</h1>
                            <p className='lede' style={{ marginTop: 4 }}>Your request is with {booking.driver?.name}. The status updates here and in My bookings.</p>
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <Link to='/bookings' className='back'><Icon name='chevL' /> Back to my bookings</Link>
                    <div className='page-head'><h1>Your ticket</h1></div>
                </>
            )}
            <Ticket booking={booking} />
            <DriverContact booking={booking} />
            {fresh && (
                <div className='row' style={{ marginTop: 22 }}>
                    <button className='btn btn-primary' onClick={() => navigate('/bookings')}>View my bookings</button>
                    <button className='btn btn-ghost' onClick={() => { resetTrip(); navigate('/book') }}>Book another ride</button>
                </div>
            )}
        </>
    )
}
