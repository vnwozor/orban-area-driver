import React, { useContext, useEffect, useState } from 'react'
import { MapView } from '../MapView/MapView'
import { Navbar } from '../NavBar/Navbar'
import { DriverContext } from '../../context/DriverContext'

const API_BASE = import.meta.env.VITE_API_URL

// ---- helper: straight-line distance ----
function getDistanceKm(a, b) {
    if (!a || !b) return 0
    const R = 6371
    const dLat = ((b.lat - a.lat) * Math.PI) / 180
    const dLng = ((b.lng - a.lng) * Math.PI) / 180
    const x =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((a.lat * Math.PI) / 180) *
            Math.cos((b.lat * Math.PI) / 180) *
            Math.sin(dLng / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

async function fetchPendingRequests() {
    const res = await fetch(`${API_BASE}/requests?status=pending`)
    if (!res.ok) throw new Error('Failed to load requests')
    return res.json()
}

async function submitAcceptRequest(requestId, driverId) {
    const res = await fetch(`${API_BASE}/requests/${requestId}/accept`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId }),
    })
    if (!res.ok) throw new Error('Failed to accept request')
    return res.json()
}

async function submitRejectRequest(requestId) {
    const res = await fetch(`${API_BASE}/requests/${requestId}/reject`, { method: 'PATCH' })
    if (!res.ok) throw new Error('Failed to reject request')
    return res.json()
}


async function submitDriverCancel(requestId) {
    const res = await fetch(`${API_BASE}/requests/${requestId}/driver-cancel`, { method: 'PATCH' })
    if (!res.ok) throw new Error('Failed to cancel')
    return res.json()
}


async function submitCompleteTrip(requestId) {
    const res = await fetch(`${API_BASE}/requests/${requestId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
    })
    if (!res.ok) throw new Error('Failed to complete trip')
    return res.json()
}

async function pushDriverLocation(driverId, location) {
    const res = await fetch(`${API_BASE}/drivers/${driverId}/location`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentLocation: location }),
    })
    if (!res.ok) throw new Error('Failed to update location')
    return res.json()
}

export const Driver = () => {
    const { currentDriver, setCurrentDriver, logout } = useContext(DriverContext)

    const storageKey = `orban_active_trip_${currentDriver._id}`

    const [pendingRequests, setPendingRequests] = useState([])
    const [activeRequest, setActiveRequest] = useState(null)
    const [driverLocation, setDriverLocation] = useState(currentDriver.currentLocation || null)
    const [routeInfo, setRouteInfo] = useState(null)


    const [restoring, setRestoring] = useState(true)

    useEffect(() => {
        const savedId = localStorage.getItem(storageKey)
        if (!savedId) {
            setRestoring(false)
            return
        }

        fetch(`${API_BASE}/requests/${savedId}`)
            .then((res) => {
                if (!res.ok) throw new Error('Saved trip no longer exists')
                return res.json()
            })
            .then((request) => {
                if (['accepted', 'ongoing'].includes(request.status)) {
                    setActiveRequest(request)
                    setDriverLocation(currentDriver.currentLocation || null)
                } else {
                    localStorage.removeItem(storageKey)
                }
            })
            .catch(() => localStorage.removeItem(storageKey))
            .finally(() => setRestoring(false))
    }, [storageKey])

    useEffect(() => {
        if (activeRequest && ['accepted', 'ongoing'].includes(activeRequest.status)) {
            localStorage.setItem(storageKey, activeRequest._id)
        } else {
            localStorage.removeItem(storageKey)
        }
    }, [activeRequest, storageKey])

    useEffect(() => {
        fetchPendingRequests()
            .then(setPendingRequests)
            .catch((err) => console.error(err))
    }, [])

    useEffect(() => {
        if (currentDriver.currentLocation || !navigator.geolocation) return

        navigator.geolocation.getCurrentPosition((pos) => {
            const location = { lat: pos.coords.latitude, lng: pos.coords.longitude }
            setDriverLocation(location)
            pushDriverLocation(currentDriver._id, location)
                .then(setCurrentDriver)
                .catch((err) => console.error('Failed to save location:', err))
        })
    }, [currentDriver._id])

    useEffect(() => {
        if (!activeRequest || !driverLocation) return
        if (activeRequest.status !== 'accepted') return

        const intervalId = setInterval(() => {
            setDriverLocation((prev) => {
                if (!prev) return prev
                const next = {
                    lat: prev.lat + (Math.random() - 0.5) * 0.001,
                    lng: prev.lng + (Math.random() - 0.5) * 0.001,
                }

                const distanceKm = getDistanceKm(next, activeRequest.pickupLocation)
                if (distanceKm < 0.3) {
                    fetch(`${API_BASE}/requests/${activeRequest._id}/status`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: 'ongoing' }),
                    }).catch((err) => console.error('Failed to mark ongoing:', err))

                    setActiveRequest((req) => ({ ...req, status: 'ongoing' }))
                }

                return next
            })
        }, 2000)

        return () => clearInterval(intervalId)
    }, [activeRequest, driverLocation])

    const handleAccept = async (request) => {
        try {
            const updated = await submitAcceptRequest(request._id, currentDriver._id)
            setActiveRequest(updated)
            setDriverLocation(currentDriver.currentLocation || driverLocation)
            setPendingRequests((prev) => prev.filter((r) => r._id !== request._id))
        } catch (err) {
            console.error(err)
        }
    }

    const handleReject = async (request) => {
        try {
            await submitRejectRequest(request._id)
            setPendingRequests((prev) => prev.filter((r) => r._id !== request._id))
        } catch (err) {
            console.error(err)
        }
    }

    const handleCancelTrip = async () => {
        if (!activeRequest) return
        try {
            await submitDriverCancel(activeRequest._id)
            setActiveRequest(null)
            fetchPendingRequests().then(setPendingRequests).catch((err) => console.error(err))
        } catch (err) {
            console.error(err)
        }
    }

    const handleCompleteTrip = async () => {
        if (!activeRequest) return
        try {
            await submitCompleteTrip(activeRequest._id)
            setActiveRequest(null)
            setDriverLocation(null)
        } catch (err) {
            console.error(err)
        }
    }


    const rider = activeRequest?.userId && typeof activeRequest.userId === 'object' ? activeRequest.userId : null

    const routeOrigin = driverLocation
    const routeDestination =
        activeRequest?.status === 'accepted'
            ? activeRequest.pickupLocation
            : activeRequest?.status === 'ongoing'
            ? activeRequest.dropoffLocation
            : null

    if (restoring) {
        return (
            <div className='app-main'>
                <Navbar onLogout={logout} driverName={currentDriver.name} />
                <div className='app-sidebar'>
                    <div className='app-section'>
                        <p>Loading...</p>
                    </div>
                </div>
                <div className='app-map-panel' />
            </div>
        )
    }

    return (
        <div className='app-main'>

            <Navbar onLogout={logout} driverName={currentDriver.name} />

            <div className='app-sidebar'>
                {!activeRequest && (
                    <div className='app-section'>
                        <h2>Ride Requests</h2>

                        {pendingRequests.length === 0 && <p>No ride requests right now.</p>}

                        {pendingRequests.map((request) => (
                            <div className='request-card' key={request._id}>
                                <p><strong>{request.userId?.name || 'Rider'}</strong></p>
                                <p>From: {request.pickupLocation.address}</p>
                                <p>To: {request.dropoffLocation.address}</p>
                                <p>₦{request.fareEstimate.toLocaleString()}</p>

                                <div className='request-btn-row'>
                                    <button onClick={() => handleAccept(request)}>Accept</button>
                                    <button onClick={() => handleReject(request)}>Reject</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeRequest && (
                    <>
                        {activeRequest.status === 'accepted' && (
                            <div className='app-section'>
                                <h2>Heading to pickup</h2>
                                {rider && (
                                    <>
                                        <p><strong>{rider.name}</strong></p>
                                        <p>{rider.phone}</p>
                                    </>
                                )}
                                <p>{activeRequest.pickupLocation.address}</p>
                                {routeInfo && <p>{routeInfo.durationMin} mins away</p>}
                                <p>Fare: ₦{activeRequest.fareEstimate.toLocaleString()}</p>
                                <button onClick={handleCancelTrip} className='app-danger-btn'>Cancel Trip</button>
                            </div>
                        )}

                        {activeRequest.status === 'ongoing' && (
                            <div className='app-section'>
                                <h2>Trip in progress</h2>
                                {rider && (
                                    <p>
                                        <strong>{rider.name}</strong> — {rider.phone}
                                    </p>
                                )}
                                <p>Dropping off at: {activeRequest.dropoffLocation.address}</p>
                                {routeInfo && <p>{routeInfo.durationMin} mins to destination</p>}
                                <button onClick={handleCompleteTrip} className='app-primary-btn'>
                                    Complete Trip
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            <div className='app-map-panel'>
                <MapView
                    pickup={activeRequest?.pickupLocation}
                    dropoff={activeRequest?.dropoffLocation}
                    driverLocation={driverLocation}
                    routeOrigin={routeOrigin}
                    routeDestination={routeDestination}
                    onRouteInfo={setRouteInfo}
                />
            </div>
        </div>
    )
}
