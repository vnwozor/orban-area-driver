import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DriverContext } from '../Context/DriverContext'
import PageHead from '../Components/Layout/PageHead'
import { Icon } from '../Components/UI/Icon'
import { Avatar, Stars } from '../Components/UI/Bits'
import ImageField from '../Components/UI/ImageField'
import { useToast } from '../Components/Toast/Toast'

const CHECKS = [
    ['license', 'Driver’s licence'],
    ['vehicleRegistration', 'Vehicle registration'],
    ['identity', 'Identity check'],
]
const PILL = { verified: ['pill-go', 'Verified'], pending: ['pill-amber', 'In review'], rejected: ['pill-stop', 'Rejected'] }

// Driver profile: name/photo, phone, rating, vehicle information, licence/verification status
export default function Profile() {
    const { api, driver, setDriver, logout } = useContext(DriverContext)
    const navigate = useNavigate()
    const toast = useToast()
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        api.me().then((d) => setDriver({ ...driver, ...d, stats: undefined })).catch(() => {})
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const changePhoto = async (photo) => {
        setSaving(true)
        try {
            const updated = await api.updateMe({ photo })
            setDriver({ ...driver, photo: updated.photo })
            toast(photo ? 'Photo updated' : 'Photo removed')
        } catch (err) {
            toast(err.message)
        } finally {
            setSaving(false)
        }
    }

    const car = driver.car || {}
    const v = driver.verification || {}
    const allVerified = CHECKS.every(([k]) => v[k] === 'verified')

    return (
        <>
            <PageHead title='Profile' />
            <div className='two-col'>
                <div className='card'>
                    <div className='profile-head' style={{ marginBottom: 8 }}>
                        <div>
                            <ImageField label={saving ? 'Saving...' : 'Profile photo'} hasImage={Boolean(driver.photo)} onChange={changePhoto} onRemove={() => changePhoto(null)}>
                                <Avatar name={driver.name} photo={driver.photo} size='lg' />
                            </ImageField>
                        </div>
                    </div>
                    <h2 style={{ margin: '10px 0 8px' }}>{driver.name}</h2>
                    <div className='row' style={{ gap: 12, marginBottom: 8 }}>
                        <Stars rating={driver.rating ?? 5} />
                        {allVerified ? <span className='pill pill-go plain'><Icon name='shield' /> Verified driver</span> : <span className='pill pill-amber plain'>Verification in progress</span>}
                    </div>
                    <div className='kv'>
                        <div><Icon name='phone' /><div><small>Phone number</small><b>{driver.phone}</b></div></div>
                        <div><Icon name='mail' /><div><small>Email</small><b>{driver.email}</b></div></div>
                        <div><Icon name='id' /><div><small>Driver ID</small><b>{driver.driverId}</b></div></div>
                        <div><Icon name='car' /><div><small>Vehicle</small><b>{car.plateNumber ? `${car.model}, ${car.plateNumber}` : 'No vehicle added yet'}</b></div></div>
                    </div>
                </div>
                <div className='stack'>
                    <div className='card'>
                        <h3 style={{ marginBottom: 14 }}>Licence and verification</h3>
                        <div className='veri'>
                            {CHECKS.map(([k, label]) => {
                                const [cls, text] = PILL[v[k]] || PILL.pending
                                return <div key={k}><b>{label}</b><span className={`pill ${cls}`}>{text}</span></div>
                            })}
                        </div>
                    </div>
                    <button className='btn btn-ghost btn-block' onClick={() => { logout(); navigate('/login') }}><Icon name='logout' /> Log out</button>
                </div>
            </div>
        </>
    )
}
