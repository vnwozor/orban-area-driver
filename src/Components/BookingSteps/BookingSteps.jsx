import React from 'react'
import { Icon } from '../UI/Icon'

const LABELS = ['Search', 'Choose car', 'Pay', 'Confirmed']

// current: 0 = search, 1 = choose car, 2 = pay, 3 = confirmed
export default function BookingSteps({ current }) {
    return (
        <ol className='steps' aria-label='Booking progress'>
            {LABELS.map((label, i) => (
                <li key={label} className={i < current ? 'done' : i === current ? 'now' : ''} aria-current={i === current ? 'step' : undefined}>
                    <span className='dot'>{i < current ? <Icon name='check' /> : i + 1}</span>
                    <span className='lbl'>{label}</span>
                </li>
            ))}
        </ol>
    )
}
