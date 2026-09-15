<<<<<<< HEAD
import React from 'react'
import "./Card.css"
import { Title } from '../Title/Title'

export const Card = ({ etaMinutes, driverName, carModel, plateNumber, pickupAddress, dropoffAddress }) => {
  return (
    <div className='ride-top-section'>

        <Title title="Driver is arriving" />

        <div className='card-driver-verify'>
            {etaMinutes != null ? `${etaMinutes}mins` : '...'}
        </div>

        <div className='card-div-top-section'>
            <div>

                <p className='card-driver-name'>
                    {driverName}
                </p>

                <div className='card-driver-verify'>
                    Verified by Orban
                </div>
            </div>

            <div>
                <p className='card-car-name'>
                    {carModel}
                </p>
                <p>
                    {plateNumber}
                </p>
            </div>


        </div>




        <div  className='card-div-bottom-section'>

            <div>
                <p >
                    {pickupAddress}
                </p>
                <p className='card-pickup'>
                    Pickup
                </p>
            </div>

            <div>
                <p>
                    {dropoffAddress}
                </p>
                <p className='card-dropoff'>
                    dropoff
                </p>
            </div>

        </div>



    </div>
  )
=======
import React from 'react'
import "./Card.css"
import { Title } from '../Title/Title'

export const Card = ({ etaMinutes, driverName, carModel, plateNumber, pickupAddress, dropoffAddress }) => {
  return (
    <div className='ride-top-section'>

        <Title title="Driver is arriving" />

        <div className='card-driver-verify'>
            {etaMinutes != null ? `${etaMinutes}mins` : '...'}
        </div>

        <div className='card-div-top-section'>
            <div>

                <p className='card-driver-name'>
                    {driverName}
                </p>

                <div className='card-driver-verify'>
                    Verified by Orban
                </div>
            </div>

            <div>
                <p className='card-car-name'>
                    {carModel}
                </p>
                <p>
                    {plateNumber}
                </p>
            </div>


        </div>




        <div  className='card-div-bottom-section'>

            <div>
                <p >
                    {pickupAddress}
                </p>
                <p className='card-pickup'>
                    Pickup
                </p>
            </div>

            <div>
                <p>
                    {dropoffAddress}
                </p>
                <p className='card-dropoff'>
                    dropoff
                </p>
            </div>

        </div>



    </div>
  )
>>>>>>> a88e7ad884e63cc5fd129b45974814f39519bb15
}