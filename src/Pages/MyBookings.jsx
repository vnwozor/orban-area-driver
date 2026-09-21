import React, { useCallback, useContext, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShopContext } from '../Context/ShopContext'
import BookingCard from '../Components/Bookings/BookingCard'
import { Empty } from '../Components/UI/Bits'
import { useToast } from '../Components/Toast/Toast'
import { usePolling } from '../hooks/usePolling'

const TABS = [
    ['upcoming', 'Upcoming'],
    ['completed', 'Completed'],
    ['cancelled', 'Cancelled'],
]
const EMPTY = {
    upcoming: ['No upcoming rides', 'Book a ride and it will show up here.'],
    completed: ['No completed rides yet', 'Finished trips appear here.'],
    cancelled: ['Nothing cancelled', 'Cancelled bookings appear here.'],
}

// My Bookings: upcoming, completed and cancelled
export default function MyBookings() {
    const { api, setTrip } = useContext(ShopContext)
    const navigate = useNavigate()
    const toast = useToast()
    const [data, setData] = useState(null)
    const [error, setError] = useState('')
    const [tab, setTab] = useState('upcoming')
    const [confirmId, setConfirmId] = useState(null)

    const load = useCallback(() => api.myBookings().then((d) => { setData(d); setError('') }).catch((e) => setError(e.message)), [api])
    useEffect(() => { load() }, [load])
    usePolling(load, 10000) // picks up "driver accepted" etc.

    const cancel = async (b) => {
        try {
            await api.cancelBooking(b.id)
            setConfirmId(null)
            toast(`Booking ${b.code} cancelled`)
            load()
        } catch (e) {
            toast(e.message)
            setConfirmId(null)
        }
    }

    const rebook = (b) => {
        setTrip({
            pickup: { name: b.pickup.address.split(',')[0], ...b.pickup },
            destination: { name: b.destination.address.split(',')[0], ...b.destination },
            passengers: b.passengers,
        })
        navigate('/book')
    }

    const list = data?.[tab] || []
    return (
        <>
            <div className='page-head'>
                <div>
                    <h1>My bookings</h1>
                    <p className='lede'>Every ride you have booked, in one place.</p>
                </div>
            </div>
            <div className='tabs' role='tablist'>
                {TABS.map(([id, label]) => (
                    <button key={id} role='tab' aria-selected={tab === id} onClick={() => { setTab(id); setConfirmId(null) }}>
                        {label}<em>{data ? data[id].length : ''}</em>
                    </button>
                ))}
            </div>
            {error && !data ? (
                <Empty title="Couldn't load your bookings" action={<button className='btn btn-dark' onClick={load}>Try again</button>}>{error}</Empty>
            ) : !data ? (
                <div className='list'><div className='skel' style={{ minHeight: 200 }} /></div>
            ) : list.length ? (
                <div className='list'>
                    {list.map((b) => (
                        <BookingCard key={b.id} booking={b} confirming={confirmId === b.id} onAskCancel={setConfirmId} onKeep={() => setConfirmId(null)} onCancel={cancel} onRebook={rebook} />
                    ))}
                </div>
            ) : (
                <Empty title={EMPTY[tab][0]} action={<Link to='/book' className='btn btn-primary'>Book a ride</Link>}>{EMPTY[tab][1]}</Empty>
            )}
        </>
    )
}
