import React, { useContext, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { DriverContext } from '../Context/DriverContext'
import AuthLayout, { TextField } from '../Components/Layout/AuthLayout'
import { useToast } from '../Components/Toast/Toast'

export default function Login() {
    const { api, setSession, driver } = useContext(DriverContext)
    const navigate = useNavigate()
    const location = useLocation()
    const toast = useToast()
    const [identifier, setIdentifier] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [busy, setBusy] = useState(false)

    if (driver) return <Navigate to='/' replace />

    const submit = async (e) => {
        e.preventDefault()
        if (!identifier.trim() || !password) return setError('Enter your email or phone number and password.')
        setBusy(true)
        setError('')
        try {
            const data = await api.login(identifier.trim(), password)
            setSession(data.driver, data.token)
            toast(`Welcome back, ${data.driver.name.split(' ')[0]}`)
            navigate(location.state?.from || '/', { replace: true })
        } catch (err) {
            setError(err.message)
        } finally {
            setBusy(false)
        }
    }

    return (
        <AuthLayout tab='login' title='Driver sign in' subtitle='Log in to start accepting trips.'>
            <form onSubmit={submit} noValidate style={{ display: 'grid', gap: 14 }}>
                {error && <p className='form-err' role='alert'>{error}</p>}
                <TextField label='Email or phone number' icon='mail' autoComplete='username' value={identifier} onChange={setIdentifier} />
                <TextField label='Password' icon='lock' type='password' autoComplete='current-password' value={password} onChange={setPassword} />
                <button className='btn btn-primary btn-block' type='submit' disabled={busy}>{busy ? 'Logging in...' : 'Log in'}</button>
            </form>
        </AuthLayout>
    )
}
