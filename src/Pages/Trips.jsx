import React, { useCallback, useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DriverContext } from '../Context/DriverContext'
import PageHead from '../Components/Layout/PageHead'
import TripCard from '../Components/Trips/TripCard'
import { Empty } from '../Components/UI/Bits'
import { useToast } from '../Components/Toast/Toast'
import { usePolling } from '../hooks/usePolling'
import { naira } from '../utils/format'

const LABELS = { arrived: 'Status updated: Arrived', started: 'Status updated: Trip started' }

// Upcoming trips + trip status: Accepted -> Arrived -> Trip Started -> Trip Completed (or Cancelled)
export default function Trips() {
    const { api, refreshCounts } = useContext(DriverContext)
    const toast = useToast()
    const [trips, setTrips] = useState(null)
    const [error, setError] = useState('')
    const [busyId, setBusyId] = useState(null)
    const [confirmId, setConfirmId] = useState(null)

    const load = useCallback(() => api.trips().then((t) => { setTrips(t); setError('') }).catch((e) => setError(e.message)), [api])
    useEffect(() => { load() }, [load])
    usePolling(load, 15000)

    const move = async (b, status) => {
        setBusyId(b.id)
        try {
            await api.setStatus(b.id, status)
            toast(status === 'completed' ? `Trip completed. ${naira(b.fare.total)} added to today's earnings.` : status === 'cancelled' ? 'Trip cancelled' : LABELS[status])
            setConfirmId(null)
        } catch (err) {
            toast(err.message)
        } finally {
            setBusyId(null)
            load()
            refreshCounts()
        }
    }

    return (
        <>
            <PageHead title='Upcoming trips' lede='Update the status as the trip moves along.' />
            {error && !trips ? (
                <Empty title="Couldn't load trips" action={<button className='btn btn-dark' onClick={load}>Try again</button>}>{error}</Empty>
            ) : trips?.length ? (
                <div className='list'>
                    {trips.map((b) => (
                        <TripCard key={b.id} booking={b} busy={busyId === b.id} confirming={confirmId === b.id}
                            onNext={move} onAskCancel={setConfirmId} onKeep={() => setConfirmId(null)} onCancel={(x) => move(x, 'cancelled')} />
                    ))}
                </div>
            ) : trips ? (
                <Empty title='No upcoming trips' action={<Link to='/' className='btn btn-dark'>See booking requests</Link>}>Trips you accept will show up here.</Empty>
            ) : (
                <div className='skel' style={{ minHeight: 240 }} />
            )}
        </>
    )
}
