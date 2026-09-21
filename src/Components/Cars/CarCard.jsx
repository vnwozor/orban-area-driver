import React from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../UI/Icon'
import { CarArt } from '../CarArt/CarArt'
import { Avatar, Stars } from '../UI/Bits'
import { naira } from '../../utils/format'

// One car in the search results: image, model, type, seats, price, driver, availability.
export default function CarCard({ car }) {
    const off = !car.available
    const open = (
        <>
            <div className='car-art'>
                <CarArt type={car.type} color={car.color} photo={car.image} alt={car.model} />
                <span className='pill pill-mute plain'>{car.type}</span>
            </div>
            <div className='car-body'>
                <div className='car-top'>
                    <h3>
                        {car.model}
                        {car.year && <small>{car.year}</small>}
                    </h3>
                    <div className='price'>
                        <strong className='num'>{naira(car.fare.total)}</strong>
                        <span>est. total</span>
                    </div>
                </div>
                <ul className='meta'>
                    <li>
                        <Icon name='users' />
                        {car.seats} seats
                    </li>
                    <li>
                        <Icon name='car' />
                        {car.type}
                    </li>
                    <li>
                        <Icon name='cash' />
                        {naira(car.pricePerKm)}/km
                    </li>
                </ul>
                <div className='car-foot'>
                    <span className='drv'>
                        <Avatar name={car.driver.name} photo={car.driver.photo} size='sm' />
                        <span className='nm'>{car.driver.name}</span>
                        <Stars rating={car.driver.rating} />
                    </span>
                    {off ? <span className='pill pill-mute'>{car.unavailableReason || 'Unavailable'}</span> : <span className='pill pill-go'>Available</span>}
                </div>
            </div>
        </>
    )

    if (off) {
        return (
            <article className='car is-off' style={{ '--car': car.color }} aria-disabled='true'>
                {open}
            </article>
        )
    }
    return (
        <Link to={`/book/cars/${car.id}`} className='car' style={{ '--car': car.color, textDecoration: 'none', color: 'inherit' }} aria-label={`${car.model}, ${naira(car.fare.total)}`}>
            {open}
        </Link>
    )
}
