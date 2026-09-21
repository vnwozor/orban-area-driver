import React, { useCallback, useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DriverContext } from '../Context/DriverContext'
import PageHead from '../Components/Layout/PageHead'
import RequestCard from '../Components/Trips/RequestCard'
import { Empty } from '../Components/UI/Bits'
import { useToast } from '../Components/Toast/Toast'
import { usePolling } from '../hooks/usePolling'
import { naira } from '../utils/format'

const DAY_LABELS = 'MTWTFSS'

// Home: availability switch, earnings and new booking requests
export default function Home() {
    const { api, driver, setDriver, refreshCounts } = useContext(DriverContext)
    const toast = useToast()
    const [earnings, setEarnings] = useState(null)
    const [requests, setRequests] = useState(null)
    const [error, setError] = useState('')
    const [busyId, setBusyId] = useState(null)
    const online = driver.available !== false

    const load = useCallback(async () => {
        try {
            const [e, r] = await Promise.all([api.earnings(), api.requests()])
            setEarnings(e)
            setRequests(r)
            setError('')
        } catch (err) {
            setError(err.message)
        }
    }, [api])
    useEffect(() => { load() }, [load])
    usePolling(load, 10000) // new requests show up on their own

    const toggle = async () => {
        const next = !online
        setDriver({ ...driver, available: next }) // switch right away, undo if it fails
        try {
            await api.setOnline(next)
            toast(next ? 'You are online' : 'You are offline')
        } catch (err) {
            setDriver({ ...driver, available: online })
            toast(err.message)
        }
    }

    const answer = async (b, action) => {
        setBusyId(b.id)
        try {
            await (action === 'accept' ? api.accept(b.id) : api.decline(b.id))
            toast(action === 'accept' ? 'Request accepted. It is now in Trips.' : 'Request declined')
        } catch (err) {
            toast(err.message)
        } finally {
            setBusyId(null)
            load()
            refreshCounts()
        }
    }

    const max = Math.max(1, ...(earnings?.days || []).map((d) => d.total))
    const hasCar = Boolean(driver.car?.plateNumber)

    return (
        <>
            <PageHead title={`Hello, ${driver.name.split(' ')[0]}`} lede='Here is how your day is going.' />

            {!hasCar && (
                <div className='card' style={{ marginBottom: 16, borderColor: 'var(--amber)' }}>
                    <div className='spread'>
                        <div>
                            <h3>Add your vehicle</h3>
                            <p className='muted'>Riders can only book you once your car is saved.</p>
                        </div>
                        <Link to='/vehicle' className='btn btn-primary'>Add vehicle</Link>
                    </div>
                </div>
            )}

            <div className='card avail'>
                <div>
                    <h3><span className={`dot-live ${online ? 'on' : ''}`.trim()} />{online ? 'Online and available' : 'Offline and unavailable'}</h3>
                    <p className='muted'>{online ? 'Riders can see and book your car.' : 'Riders cannot book your car until you go online.'}</p>
                </div>
                <button className='switch' role='switch' aria-checked={online} aria-label='Available for bookings' onClick={toggle} />
            </div>

            <div className='earn'>
                <div className='earn-main'>
                    <div>
                        <small>Today’s earnings</small>
                        <div className='big num'>{naira(earnings?.today)}</div>
                    </div>
                    <div className='bars' role='img' aria-label='Earnings for each day this week'>
                        {(earnings?.days || Array.from({ length: 7 }, () => ({ total: 0 }))).map((d, i) => (
                            <div key={i} className={d.date && d.date === earnings.todayDate ? 'today' : ''}>
                                <i style={{ height: `${Math.round((d.total / max) * 64) + 4}px` }} />
                                <span>{DAY_LABELS[i]}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className='earn-side'>
                    <div className='stat'><small>This week</small><b className='num'>{naira(earnings?.week)}</b></div>
                    <div className='stat'><small>Completed trips</small><b className='num'>{earnings?.completedTrips ?? 0}</b></div>
                </div>
            </div>

            <section className='sect'>
                <div className='spread'>
                    <h2>Booking requests{requests?.length > 0 && <span className='count'>{requests.length}</span>}</h2>
                </div>
                {error && !requests ? (
                    <Empty title="Couldn't load requests" action={<button className='btn btn-dark' onClick={load}>Try again</button>}>{error}</Empty>
                ) : requests?.length ? (
                    <div className='list'>
                        {requests.map((b) => (
                            <RequestCard key={b.id} booking={b} busy={busyId === b.id} onAccept={(x) => answer(x, 'accept')} onDecline={(x) => answer(x, 'decline')} />
                        ))}
                    </div>
                ) : (
                    <Empty title='No new requests'>{online ? 'Stay online and new requests will show up here.' : 'Go online to start receiving requests.'}</Empty>
                )}
            </section>
        </>
    )
}
