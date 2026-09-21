import React, { useContext, useState } from 'react'
import { DriverContext } from '../Context/DriverContext'
import PageHead from '../Components/Layout/PageHead'
import { CarArt } from '../Components/CarArt/CarArt'
import ImageField from '../Components/UI/ImageField'
import { useToast } from '../Components/Toast/Toast'

const TYPES = ['Compact', 'Sedan', 'SUV', 'Van']
const COLORS = [['#1F2937', 'Black'], ['#E8ECF1', 'White'], ['#AEB7C3', 'Silver'], ['#3B4A66', 'Slate blue'], ['#2F6FEB', 'Blue'], ['#A5222F', 'Red'], ['#2E7D5B', 'Green'], ['#C9A24A', 'Gold']]

// Vehicle management: car model, plate number, car type, number of seats, car image
export default function Vehicle() {
    const { api, driver, setDriver } = useContext(DriverContext)
    const toast = useToast()
    const car = driver.car || {}
    const [form, setForm] = useState({
        model: car.model || '',
        year: car.year || '',
        plateNumber: car.plateNumber || '',
        type: car.type || 'Sedan',
        seats: car.seats || 4,
        color: car.color || '#3B4A66',
        photo: car.photo || null,
    })
    const [error, setError] = useState('')
    const [busy, setBusy] = useState(false)
    const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }))

    const submit = async (e) => {
        e.preventDefault()
        if (!form.model.trim() || !form.plateNumber.trim()) return setError('Add the car model and plate number.')
        const seats = Number(form.seats)
        if (!(seats >= 1 && seats <= 14)) return setError('Seats should be between 1 and 14.')
        setBusy(true)
        setError('')
        try {
            const updated = await api.saveVehicle({ ...form, model: form.model.trim(), plateNumber: form.plateNumber.trim(), seats, year: form.year === '' ? null : Number(form.year) })
            setDriver({ ...driver, car: updated.car })
            toast('Vehicle saved. Riders now see the update.')
        } catch (err) {
            setError(err.message)
        } finally {
            setBusy(false)
        }
    }

    return (
        <>
            <PageHead title='Vehicle' lede='Riders see these details when they choose your car.' />
            <div className='two-col'>
                <div className='card'>
                    <div className='art-lg' style={{ '--car': form.color, paddingBottom: 6 }}>
                        <CarArt type={form.type} color={form.color} photo={form.photo} alt={form.model || 'Your car'} />
                    </div>
                    <div style={{ marginTop: 16 }}>
                        <ImageField label='Car image' hasImage={Boolean(form.photo)} onChange={set('photo')} onRemove={() => set('photo')(null)} />
                    </div>
                </div>
                <form className='card stack' onSubmit={submit} noValidate>
                    {error && <p className='form-err' role='alert'>{error}</p>}
                    <div className='field'>
                        <label htmlFor='v-model'>Car model</label>
                        <div className='inp'><input id='v-model' value={form.model} placeholder='e.g. Toyota Camry' onChange={(e) => set('model')(e.target.value)} /></div>
                    </div>
                    <div className='two'>
                        <div className='field'>
                            <label htmlFor='v-year'>Year</label>
                            <div className='inp'><input id='v-year' type='number' min='1990' max='2027' value={form.year} onChange={(e) => set('year')(e.target.value)} /></div>
                        </div>
                        <div className='field'>
                            <label htmlFor='v-plate'>Plate number</label>
                            <div className='inp'><input id='v-plate' value={form.plateNumber} placeholder='ABJ 123 AB' onChange={(e) => set('plateNumber')(e.target.value)} /></div>
                        </div>
                    </div>
                    <div className='two'>
                        <div className='field'>
                            <label htmlFor='v-type'>Car type</label>
                            <div className='inp'>
                                <select id='v-type' value={form.type} onChange={(e) => set('type')(e.target.value)}>
                                    {TYPES.map((t) => <option key={t}>{t}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className='field'>
                            <label htmlFor='v-seats'>Number of seats</label>
                            <div className='inp'><input id='v-seats' type='number' min='1' max='14' value={form.seats} onChange={(e) => set('seats')(e.target.value)} /></div>
                        </div>
                    </div>
                    <div className='field'>
                        <span className='lbl'>Colour</span>
                        <div className='chips' role='radiogroup' aria-label='Car colour'>
                            {COLORS.map(([hex, name]) => (
                                <button type='button' key={hex} role='radio' aria-checked={form.color === hex} aria-label={name} title={name} onClick={() => set('color')(hex)}
                                    style={{ width: 38, height: 38, borderRadius: '50%', background: hex, border: form.color === hex ? '3px solid var(--night)' : '2px solid var(--line)', boxShadow: form.color === hex ? '0 0 0 3px var(--amber)' : 'none' }} />
                            ))}
                        </div>
                    </div>
                    <button className='btn btn-primary' type='submit' disabled={busy}>{busy ? 'Saving...' : 'Save vehicle'}</button>
                </form>
            </div>
        </>
    )
}
