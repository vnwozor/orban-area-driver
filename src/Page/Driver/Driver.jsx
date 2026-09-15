import React, { useContext } from 'react'
import { Title } from '../../../../frontend/src/Components/Title/Title'
import { assets } from '../../../../frontend/src/assets/assets'
import { ShopContext } from '../../../../frontend/src/Context/ShopContext'
import { MapView } from '../../../../frontend/src/Components/MapView/Map'
import './Driver.css'

export const Driver = () => {
    const {
        requests,
        users,
        driverLocation,
        acceptRequest,
        rejectRequest,
        currentDriver,
        startTrackingDriver,
    } = useContext(ShopContext)


    const pendingRequests = requests.filter((r) => r.status === 'pending')


    const activeRequest = requests.find(
        (r) => r.driverId === currentDriver.id && (r.status === 'accepted' || r.status === 'ongoing')
    )

    const handleAccept = (request) => {
        acceptRequest(request.id)
        startTrackingDriver(currentDriver.currentLocation, {
            pickupLocation: request.pickupLocation,
            requestId: request.id,
        })
    }

    return (
        <div className='ride-main'>
            <div className='ride-sidebar'>
                <div className='ride-top-section'>
                    <Title title="Ride Requests" />

                    {pendingRequests.length === 0 && (
                        <p className='ride-car-p'>No ride requests right now.</p>
                    )}

                    {pendingRequests.map((request) => {
                        const rider = users.find((u) => u.id === request.userId)

                        return (
                            <div className='driver-div-each-request' key={request.id}>
                                <div className='driver-request-div'>
                                    <div>
                                        <p className='ride-car-h'>{rider?.name || 'Unknown rider'}</p>
                                        <p className='ride-car-p'>
                                            From: {request.pickupLocation?.address || 'Unknown'}
                                        </p>
                                        <p className='ride-car-p'>
                                            To: {request.dropoffLocation?.address || 'Unknown'}
                                        </p>
                                    </div>

                                    <div className='ride-car-price-div'>
                                        <img className='naira-icon' src={assets.naira_icon} />
                                        <p className='ride-price-p'>
                                            {request.fareEstimate?.toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                <div className='driver-btn-container'>
                                    <button
                                        className='driver-accept-btn'
                                        onClick={() => handleAccept(request)}
                                    >
                                        Accept
                                    </button>
                                    <button
                                        className='driver-reject-btn'
                                        onClick={() => rejectRequest(request.id)}
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className='ride-map-panel'>
                <MapView
                    pickup={activeRequest?.pickupLocation}
                    dropoff={activeRequest?.dropoffLocation}
                    driverLocation={driverLocation}
                />
            </div>
        </div>
    )
}