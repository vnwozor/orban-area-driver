import React, { useContext, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ShopContext } from '../Context/ShopContext'
import BookingSteps from '../Components/BookingSteps/BookingSteps'
import { CarArt } from '../Components/CarArt/CarArt'
import { Icon } from '../Components/UI/Icon'
import { Empty, Spinner } from '../Components/UI/Bits'
import { TripSummary, useCar } from './CarDetails'
import { naira } from '../utils/format'

const METHODS = [
    { id: 'card', title: 'Debit or credit card', note: 'Test card is filled in', icon: 'card' },
    { id: 'bank', title: 'Bank transfer', note: 'Pay from your bank app', icon: 'bank' },
    { id: 'cash', title: 'Pay the driver', note: 'Cash at pickup', icon: 'cash' },
]

// Step 3: payment summary + MOCK payment (nothing is charged)
export default function Payment() {
    const { carId } = useParams()
    const { api, trip, currentUser } = useContext(ShopContext)
    const navigate = useNavigate()
    const { loading, car, error, reload } = useCar(carId)
    const [method, setMethod] = useState('card')
    const [card, setCard] = useState({ name: currentUser.name, num: '4242 4242 4242 4242', exp: '12/30', cvv: '123' })
    const [formError, setFormError] = useState('')
    const [busy, setBusy] = useState(false)

    useEffect(() => {
        if (!trip.pickup || !trip.destination) navigate('/book', { replace: true })
    }, [trip, navigate])
    if (!trip.pickup || !trip.destination) return null

    const setCardField = (k, v) => setCard((c) => ({ ...c, [k]: v }))

    const submit = async (e) => {
        e.preventDefault()
        setFormError('')
        if (method === 'card') {
            if (!card.name.trim()) return setFormError('Enter the name on the card.')
            if (card.num.replace(/\D/g, '').length !== 16) return setFormError('Card number should have 16 digits.')
            if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(card.exp)) return setFormError('Enter the expiry as MM/YY.')
            if (!/^\d{3,4}$/.test(card.cvv)) return setFormError('Enter the 3 or 4 digit CVV.')
        }
        setBusy(true)
        try {
            const booking = await api.createBooking({
                carId: car.id,
                trip,
                expectedTotal: car.fare.total,
                payment: method === 'card' ? { method, cardNumber: card.num, exp: card.exp, cvv: card.cvv } : { method },
            })
            navigate(`/booking/${booking.id}`, { replace: true, state: { fresh: true } })
        } catch (err) {
            setFormError(err.message)
            if (err.status === 409) reload() // price or availability changed: show the fresh numbers
            setBusy(false)
        }
    }

    return (
        <>
            <BookingSteps current={2} />
            <Link to={`/book/cars/${carId}`} className='back'><Icon name='chevL' /> Back to car details</Link>
            {loading && !car ? (
                <div className='skel' style={{ minHeight: 420 }} />
            ) : error ? (
                <Empty title="Couldn't load this car" action={<Link to='/book/cars' className='btn btn-dark'>Back to cars</Link>}>{error}</Empty>
            ) : (
                <div className='pay-areas'>
                    <aside className='aside'>
                        <div className='card'>
                            <h3 style={{ marginBottom: 16 }}>Payment summary</h3>
                            <div className='mini-car' style={{ '--car': car.color, marginBottom: 18 }}>
                                <div className='thumb'><CarArt type={car.type} color={car.color} photo={car.image} alt={car.model} /></div>
                                <div>
                                    <b>{car.model}</b>
                                    <p className='muted' style={{ fontSize: 14 }}>{car.driver.name}</p>
                                </div>
                            </div>
                            <TripSummary trip={trip} car={car} totalLabel='Total to pay' />
                        </div>
                    </aside>
                    <form className='card payform' onSubmit={submit} noValidate>
                        <div>
                            <h2>Payment</h2>
                            <p className='muted' style={{ marginTop: 6 }}>Choose how you would like to pay.</p>
                        </div>
                        <div className='methods' role='radiogroup' aria-label='Payment method' style={{ margin: '18px 0' }}>
                            {METHODS.map((m) => (
                                <button type='button' key={m.id} className='method' role='radio' aria-checked={method === m.id} onClick={() => { setMethod(m.id); setFormError('') }}>
                                    <span className='ico'><Icon name={m.icon} /></span>
                                    <span><b>{m.title}</b><small>{m.note}</small></span>
                                    <span className='radio' />
                                </button>
                            ))}
                        </div>
                        <div className='mock' style={{ marginBottom: 18 }}>
                            <Icon name='info' />
                            <span>This is a mock payment for the prototype. No real money moves.</span>
                        </div>
                        <div className='stack' style={{ marginBottom: 18 }}>
                            {method === 'card' && (
                                <>
                                    <div className='field'>
                                        <label htmlFor='c-name'>Name on card</label>
                                        <div className='inp'><input id='c-name' autoComplete='cc-name' value={card.name} onChange={(e) => setCardField('name', e.target.value)} /></div>
                                    </div>
                                    <div className='field'>
                                        <label htmlFor='c-num'>Card number</label>
                                        <div className='inp'>
                                            <Icon name='card' />
                                            <input id='c-num' inputMode='numeric' autoComplete='cc-number' placeholder='0000 0000 0000 0000' value={card.num}
                                                onChange={(e) => setCardField('num', e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim())} />
                                        </div>
                                    </div>
                                    <div className='two'>
                                        <div className='field'>
                                            <label htmlFor='c-exp'>Expiry</label>
                                            <div className='inp'>
                                                <input id='c-exp' inputMode='numeric' autoComplete='cc-exp' placeholder='MM/YY' value={card.exp}
                                                    onChange={(e) => { let d = e.target.value.replace(/\D/g, '').slice(0, 4); if (d.length > 2) d = `${d.slice(0, 2)}/${d.slice(2)}`; setCardField('exp', d) }} />
                                            </div>
                                        </div>
                                        <div className='field'>
                                            <label htmlFor='c-cvv'>CVV</label>
                                            <div className='inp'><input id='c-cvv' inputMode='numeric' maxLength={4} autoComplete='cc-csc' placeholder='123' value={card.cvv} onChange={(e) => setCardField('cvv', e.target.value.replace(/\D/g, ''))} /></div>
                                        </div>
                                    </div>
                                </>
                            )}
                            {method === 'bank' && (
                                <div className='kv card' style={{ padding: '6px 18px', background: 'var(--panel-2)' }}>
                                    <div><div><small>Account name</small><b>Orban Rides (test)</b></div></div>
                                    <div><div><small>Account number</small><b className='num'>0123456789</b></div></div>
                                    <div><div><small>Amount</small><b className='num'>{naira(car.fare.total)}</b></div></div>
                                </div>
                            )}
                            {method === 'cash' && (
                                <p className='muted'>You will pay <b className='num' style={{ color: 'var(--ink)' }}>{naira(car.fare.total)}</b> in cash to {car.driver.name} when the trip starts.</p>
                            )}
                        </div>
                        {formError && <p className='form-err' role='alert' style={{ marginBottom: 14 }}>{formError}</p>}
                        <button className='btn btn-primary btn-block' type='submit' style={{ height: 54, fontSize: 16 }} disabled={busy || !car.available}>
                            {busy ? <><Spinner /> Processing payment</> : car.available ? (method === 'cash' ? 'Confirm booking' : `Pay ${naira(car.fare.total)}`) : car.unavailableReason}
                        </button>
                    </form>
                </div>
            )}
        </>
    )
}
