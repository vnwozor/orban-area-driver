import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ShopContext } from '../Context/ShopContext'
import BookingSteps from '../Components/BookingSteps/BookingSteps'
import { CarArt } from '../Components/CarArt/CarArt'
import { Icon } from '../Components/UI/Icon'
import { Avatar, Empty, FareBreakdown, RouteRail, Stars } from '../Components/UI/Bits'
import { fmtDate, fmtTime, naira, placeName, plural } from '../utils/format'

export const useCar = (carId) => {
    const { api, trip } = useContext(ShopContext)
    const [state, setState] = useState({ loading: true, car: null, error: '' })
    const load = () => {
        setState((s) => ({ ...s, loading: true }))
        return api
            .getCar(carId, trip)
            .then((d) => setState({ loading: false, car: d.car, error: '' }))
            .catch((e) => setState({ loading: false, car: null, error: e.message }))
    }
    useEffect(() => {
        if (trip.pickup && trip.destination) load()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [carId, trip.date, trip.time, trip.passengers, trip.pickup, trip.destination])
    return { ...state, reload: load }
}

export const TripSummary = ({ trip, car, totalLabel }) => (
    <>
        <RouteRail from={placeName(trip.pickup)} to={placeName(trip.destination)} />
        <div className='row muted' style={{ margin: '16px 0', gap: '8px 16px', fontWeight: 600, fontSize: 14 }}>
            <span className='row' style={{ gap: 6 }}><Icon name='calendar' />{fmtDate(trip.date)}</span>
            <span className='row' style={{ gap: 6 }}><Icon name='clock' />{fmtTime(trip.time)}</span>
            <span className='row' style={{ gap: 6 }}><Icon name='users' />{plural(trip.passengers)}</span>
        </div>
        <FareBreakdown fare={car.fare} label={totalLabel} />
    </>
)

// Car details: larger image, car info, driver info, price, pickup/destination, Book now
export default function CarDetails() {
    const { carId } = useParams()
    const { trip } = useContext(ShopContext)
    const navigate = useNavigate()
    const { loading, car, error } = useCar(carId)

    useEffect(() => {
        if (!trip.pickup || !trip.destination) navigate('/book', { replace: true })
    }, [trip, navigate])

    if (!trip.pickup || !trip.destination) return null

    return (
        <>
            <BookingSteps current={1} />
            <Link to='/book/cars' className='back'><Icon name='chevL' /> Back to cars</Link>
            {loading && !car ? (
                <div className='skel' style={{ minHeight: 420 }} />
            ) : error ? (
                <Empty title="Couldn't load this car" action={<Link to='/book/cars' className='btn btn-dark'>Back to cars</Link>}>{error}</Empty>
            ) : (
                <div className='detail-grid'>
                    <div className='stack'>
                        <div className='art-lg' style={{ '--car': car.color }}>
                            <CarArt type={car.type} color={car.color} photo={car.image} alt={car.model} />
                            <span className={`pill ${car.available ? 'pill-go' : 'pill-mute'}`}>{car.available ? 'Available' : car.unavailableReason}</span>
                        </div>
                        <div className='card'>
                            <div className='spread'>
                                <div>
                                    <h2>{car.model} {car.year && <span className='muted' style={{ font: '500 18px var(--f-body)' }}>{car.year}</span>}</h2>
                                    <p className='muted'>{car.type}</p>
                                </div>
                                <div className='price'>
                                    <strong className='num'>{naira(car.pricePerKm)}</strong>
                                    <span>per km</span>
                                </div>
                            </div>
                            <div className='specs' style={{ marginTop: 16 }}>
                                <div><small>Seats</small><b>{car.seats}</b></div>
                                <div><small>Car type</small><b>{car.type}</b></div>
                                <div><small>Plate number</small><b>{car.plateNumber}</b></div>
                                {car.year && <div><small>Year</small><b>{car.year}</b></div>}
                            </div>
                            <ul className='feat'>
                                {car.features.map((f) => <li key={f}><Icon name='check' />{f}</li>)}
                            </ul>
                        </div>
                        <div className='card'>
                            <h3>Your driver</h3>
                            <div className='row' style={{ marginTop: 14, gap: 16, flexWrap: 'nowrap' }}>
                                <Avatar name={car.driver.name} photo={car.driver.photo} size='lg' />
                                <div>
                                    <b style={{ fontSize: 18 }}>{car.driver.name}</b>
                                    <div className='row' style={{ gap: 12, margin: '4px 0 8px' }}>
                                        <Stars rating={car.driver.rating} />
                                        <span className='muted'>{car.driver.tripsCompleted} trips</span>
                                    </div>
                                    {car.driver.verified ? (
                                        <span className='pill pill-go plain'><Icon name='shield' /> Verified driver</span>
                                    ) : (
                                        <span className='pill pill-mute plain'>Verification in progress</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <aside className='aside'>
                        <div className='card'>
                            <h3 style={{ marginBottom: 16 }}>Trip summary</h3>
                            <TripSummary trip={trip} car={car} />
                        </div>
                        <button className='btn btn-primary btn-block' style={{ height: 54, fontSize: 16 }} disabled={!car.available} onClick={() => navigate(`/book/cars/${car.id}/payment`)}>
                            {car.available ? 'Book now' : car.unavailableReason}
                        </button>
                    </aside>
                </div>
            )}
        </>
    )
}
