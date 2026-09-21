import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShopContext } from '../Context/ShopContext'
import BookingSteps from '../Components/BookingSteps/BookingSteps'
import CarCard from '../Components/Cars/CarCard'
import { Icon } from '../Components/UI/Icon'
import { Empty, RouteRail } from '../Components/UI/Bits'
import { fmtDate, fmtTime, placeName, plural } from '../utils/format'

const TYPES = ['All', 'Compact', 'Sedan', 'SUV', 'Van']

// Step 2: every car that fits the trip, with the fare for this exact route
export default function Cars() {
    const { api, trip } = useContext(ShopContext)
    const navigate = useNavigate()
    const [state, setState] = useState({ loading: true, cars: [], error: '' })
    const [type, setType] = useState('All')
    const [sort, setSort] = useState('rating')

    useEffect(() => {
        if (!trip.pickup || !trip.destination) {
            navigate('/book', { replace: true })
            return undefined
        }
        let cancelled = false
        setState((s) => ({ ...s, loading: true, error: '' }))
        api.searchCars(trip, type)
            .then((d) => !cancelled && setState({ loading: false, cars: d.cars, error: '' }))
            .catch((e) => !cancelled && setState({ loading: false, cars: [], error: e.message }))
        return () => {
            cancelled = true
        }
    }, [api, trip, type, navigate])

    if (!trip.pickup || !trip.destination) return null

    const cars = [...state.cars].sort((a, b) => Number(b.available) - Number(a.available) || (sort === 'price' ? a.fare.total - b.fare.total : b.driver.rating - a.driver.rating))
    const open = cars.filter((c) => c.available).length

    return (
        <>
            <BookingSteps current={1} />
            <div className='card trip-sum'>
                <RouteRail from={placeName(trip.pickup)} to={placeName(trip.destination)} />
                <div className='facts'>
                    <span><Icon name='calendar' />{fmtDate(trip.date)}</span>
                    <span><Icon name='clock' />{fmtTime(trip.time)}</span>
                    <span><Icon name='users' />{plural(trip.passengers)}</span>
                </div>
                <Link to='/book' className='btn btn-ghost btn-sm' style={{ marginLeft: 'auto' }}><Icon name='edit' /> Edit trip</Link>
            </div>

            <div className='toolbar'>
                <div className='chips' role='group' aria-label='Filter by car type'>
                    {TYPES.map((t) => (
                        <button key={t} className='chip' aria-pressed={type === t} onClick={() => setType(t)}>{t}</button>
                    ))}
                </div>
                <label className='sort'>
                    Sort by
                    <select value={sort} onChange={(e) => setSort(e.target.value)}>
                        <option value='rating'>Top rated</option>
                        <option value='price'>Lowest price</option>
                    </select>
                </label>
            </div>

            {state.loading ? (
                <div className='cars'>{[0, 1, 2].map((i) => <div key={i} className='skel' />)}</div>
            ) : state.error ? (
                <Empty title="Couldn't load cars" action={<Link to='/book' className='btn btn-dark'>Change trip</Link>}>{state.error}</Empty>
            ) : cars.length === 0 ? (
                <Empty title='No cars match' action={<Link to='/book' className='btn btn-dark'>Change trip</Link>}>Try a different car type or fewer passengers.</Empty>
            ) : (
                <>
                    <p className='tiny' style={{ marginBottom: 12 }}>{open} available {open === 1 ? 'car' : 'cars'} for {plural(trip.passengers)}</p>
                    <div className='cars'>{cars.map((c) => <CarCard key={c.id} car={c} />)}</div>
                </>
            )}
        </>
    )
}
