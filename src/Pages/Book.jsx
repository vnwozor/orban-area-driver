import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShopContext } from '../Context/ShopContext'
import BookingSteps from '../Components/BookingSteps/BookingSteps'
import LocationInput from '../Components/LocationInput/LocationInput'
import MapView from '../Components/MapView/Map'
import { Icon } from '../Components/UI/Icon'
import { POPULAR_ROUTES, byName } from '../utils/places'
import { plural, todayISO } from '../utils/format'

// Step 1: pickup, destination, date, time, passengers -> search available cars
export default function Book() {
    const { currentUser, trip, setTrip } = useContext(ShopContext)
    const navigate = useNavigate()
    const [errors, setErrors] = useState({})

    const pick = (field) => (place) => {
        setTrip({ [field]: place })
        if (place) setErrors((e) => ({ ...e, [field]: undefined }))
    }

    const swap = () => setTrip({ pickup: trip.destination, destination: trip.pickup })

    const submit = (e) => {
        e.preventDefault()
        const err = {}
        if (!trip.pickup) err.pickup = 'Choose where the trip starts from the list.'
        if (!trip.destination) err.destination = 'Choose where you are going from the list.'
        if (trip.pickup && trip.destination && trip.pickup.lat === trip.destination.lat && trip.pickup.lng === trip.destination.lng) {
            err.destination = 'Destination must be different from pickup.'
        }
        if (!trip.date || trip.date < todayISO()) err.date = 'Choose today or a later date.'
        if (!trip.time) err.time = 'Choose a time.'
        setErrors(err)
        if (Object.keys(err).length === 0) navigate('/book/cars')
    }

    return (
        <>
            <BookingSteps current={0} />
            <div className='hero'>
                <h1>Where to, {currentUser.name.split(' ')[0]}?</h1>
                <p className='lede'>Pick your route and time. We will show the cars that fit your group, with the price up front.</p>
            </div>
            <div className='search-grid'>
                <form className='card search-card' onSubmit={submit} noValidate>
                    <div className='swap-wrap'>
                        <LocationInput label='Pickup location' placeholder='Search a place in Nigeria' value={trip.pickup} onSelect={pick('pickup')} error={errors.pickup} />
                        <LocationInput label='Destination' placeholder='Where are you going?' kind='to' value={trip.destination} onSelect={pick('destination')} error={errors.destination} />
                        <button type='button' className='swap' onClick={swap} aria-label='Swap pickup and destination'>
                            <Icon name='swap' />
                        </button>
                    </div>
                    <div className='two'>
                        <div className={`field ${errors.date ? 'bad' : ''}`.trim()}>
                            <label htmlFor='trip-date'>Date</label>
                            <div className='inp'>
                                <Icon name='calendar' />
                                <input id='trip-date' type='date' min={todayISO()} value={trip.date} onChange={(e) => setTrip({ date: e.target.value })} />
                            </div>
                            {errors.date && <p className='err'>{errors.date}</p>}
                        </div>
                        <div className={`field ${errors.time ? 'bad' : ''}`.trim()}>
                            <label htmlFor='trip-time'>Time</label>
                            <div className='inp'>
                                <Icon name='clock' />
                                <input id='trip-time' type='time' value={trip.time} onChange={(e) => setTrip({ time: e.target.value })} />
                            </div>
                            {errors.time && <p className='err'>{errors.time}</p>}
                        </div>
                    </div>
                    <div className='field'>
                        <span className='lbl'>Passengers</span>
                        <div className='step-inp'>
                            <button type='button' aria-label='One fewer passenger' disabled={trip.passengers <= 1} onClick={() => setTrip({ passengers: trip.passengers - 1 })}>
                                <Icon name='minus' />
                            </button>
                            <b>{plural(trip.passengers)}</b>
                            <button type='button' aria-label='One more passenger' disabled={trip.passengers >= 14} onClick={() => setTrip({ passengers: trip.passengers + 1 })}>
                                <Icon name='plus' />
                            </button>
                        </div>
                    </div>
                    <button className='btn btn-primary btn-block' type='submit'>
                        <Icon name='search' /> Search available cars
                    </button>
                    <div>
                        <p className='lbl' style={{ marginBottom: 8 }}>Popular routes</p>
                        <div className='chips'>
                            {POPULAR_ROUTES.map(([a, b]) => (
                                <button
                                    type='button'
                                    className='chip'
                                    key={`${a}-${b}`}
                                    onClick={() => {
                                        setTrip({ pickup: byName(a), destination: byName(b) })
                                        setErrors({})
                                    }}
                                >
                                    {a.replace('Central Business District', 'CBD').replace('Nnamdi Azikiwe Airport', 'Airport')} to {b.replace('Central Business District', 'CBD').replace('Nnamdi Azikiwe Airport', 'Airport')}
                                </button>
                            ))}
                        </div>
                    </div>
                </form>
                <div className='card map-card'>
                    <MapView pickup={trip.pickup} destination={trip.destination} />
                </div>
            </div>
        </>
    )
}

