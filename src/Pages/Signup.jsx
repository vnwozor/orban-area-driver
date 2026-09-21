import React, { useContext, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { DriverContext } from '../Context/DriverContext'
import AuthLayout, { TextField } from '../Components/Layout/AuthLayout'
import ImageField from '../Components/UI/ImageField'
import { Avatar } from '../Components/UI/Bits'
import { Icon } from '../Components/UI/Icon'
import { useToast } from '../Components/Toast/Toast'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// A suggested Driver ID. The server keeps it if it's free, otherwise it issues another.
const suggestId = () => `DRV-${Math.floor(10000 + Math.random() * 90000)}`

// Driver register: name, email, phone, password, Driver ID, profile photo
export default function Signup() {
    const { api, setSession, driver } = useContext(DriverContext)
    const navigate = useNavigate()
    const toast = useToast()
    const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', driverId: suggestId(), photo: null })
    const [error, setError] = useState('')
    const [busy, setBusy] = useState(false)
    const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }))

    if (driver) return <Navigate to='/' replace />

    const submit = async (e) => {
        e.preventDefault()
        if (form.name.trim().length < 2) return setError('Enter your full name.')
        if (!EMAIL.test(form.email.trim())) return setError('Enter a valid email address.')
        if (form.phone.replace(/\D/g, '').length < 10) return setError('Enter a phone number with at least 10 digits.')
        if (form.password.length < 6) return setError('Password must be at least 6 characters.')
        setBusy(true)
        setError('')
        try {
            const body = { ...form, name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() }
            if (!body.photo) delete body.photo
            const data = await api.register(body)
            setSession(data.driver, data.token)
            toast('Driver account created')
            navigate('/vehicle', { replace: true }) // next: add the car so riders can book you
        } catch (err) {
            setError(err.message)
        } finally {
            setBusy(false)
        }
    }

    return (
        <AuthLayout tab='signup' title='Create a driver account' subtitle='Then add your car so riders can book you.'>
            <form onSubmit={submit} noValidate style={{ display: 'grid', gap: 14 }}>
                {error && <p className='form-err' role='alert'>{error}</p>}
                <TextField label='Full name' icon='user' autoComplete='name' value={form.name} onChange={set('name')} />
                <TextField label='Email' icon='mail' type='email' autoComplete='email' value={form.email} onChange={set('email')} />
                <TextField label='Phone number' icon='phone' type='tel' autoComplete='tel' placeholder='0803 000 0000' value={form.phone} onChange={set('phone')} />
                <TextField label='Password' icon='lock' type='password' autoComplete='new-password' placeholder='At least 6 characters' value={form.password} onChange={set('password')} />
                <div className='field'>
                    <label htmlFor='driver-id'>Driver ID</label>
                    <div className='inp'>
                        <Icon name='id' />
                        <input id='driver-id' value={form.driverId} readOnly />
                    </div>
                    <p className='tiny'>Assigned to you when you sign up.</p>
                </div>
                <ImageField label='Profile photo' hasImage={Boolean(form.photo)} onChange={set('photo')} onRemove={() => set('photo')(null)}>
                    <Avatar name={form.name || 'Driver'} photo={form.photo} size='lg' />
                </ImageField>
                <button className='btn btn-primary btn-block' type='submit' disabled={busy}>{busy ? 'Creating account...' : 'Create driver account'}</button>
            </form>
        </AuthLayout>
    )
}
