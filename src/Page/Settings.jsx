import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import './Settings.css'
import { DriverContext } from '../context/DriverContext'
import { Navbar } from '../Components/NavBar/Navbar'

const API_BASE = import.meta.env.VITE_API_URL

const Settings = () => {
    const { currentDriver, logout, updateProfile, updateEmergencyContact } = useContext(DriverContext)
    const navigate = useNavigate()
    const [completedRides, setCompletedRides] = useState(null)

    useEffect(() => {
        fetch(`${API_BASE}/api/drivers/${currentDriver._id}/stats`)
            .then((res) => res.json())
            .then((data) => setCompletedRides(data.completedRides))
            .catch((err) => console.error('Failed to load stats:', err))
    }, [currentDriver._id])

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const initial = currentDriver.name?.charAt(0).toUpperCase() || '?'

    // ---- Profile editing ----
    const [editingProfile, setEditingProfile] = useState(false)
    const [profileForm, setProfileForm] = useState({
        name: currentDriver.name || '',
        email: currentDriver.email || '',
        phone: currentDriver.phone || '',
        plateNumber: currentDriver.car?.plateNumber || '',
    })
    const [profileError, setProfileError] = useState('')
    const [profileSaving, setProfileSaving] = useState(false)

    const saveProfile = async (e) => {
        e.preventDefault()
        setProfileError('')
        setProfileSaving(true)
        try {
            await updateProfile({
                name: profileForm.name,
                email: profileForm.email,
                phone: profileForm.phone,
                car: { ...currentDriver.car, plateNumber: profileForm.plateNumber },
            })
            setEditingProfile(false)
        } catch (err) {
            setProfileError(err.message)
        } finally {
            setProfileSaving(false)
        }
    }

    // ---- Emergency contact ----
    const [editingContact, setEditingContact] = useState(false)
    const [contactForm, setContactForm] = useState({
        name: currentDriver.emergencyContact?.name || '',
        phone: currentDriver.emergencyContact?.phone || '',
        relationship: currentDriver.emergencyContact?.relationship || '',
    })
    const [contactError, setContactError] = useState('')
    const [contactSaving, setContactSaving] = useState(false)

    const saveContact = async (e) => {
        e.preventDefault()
        setContactError('')
        setContactSaving(true)
        try {
            await updateEmergencyContact(contactForm)
            setEditingContact(false)
        } catch (err) {
            setContactError(err.message)
        } finally {
            setContactSaving(false)
        }
    }

    return (
        <>
            <Navbar onLogout={handleLogout} driverName={currentDriver.name} />

            <main className='settings-page'>
                <Link to='/' className='settings-back-link'>&larr; Back to dashboard</Link>
                <h1>My Account</h1>

                <div className='settings-avatar'>{initial}</div>

                <div className='settings-card'>
                    {!editingProfile ? (
                        <>
                            <div className='settings-row'>
                                <span className='settings-row-label'>Name</span>
                                <span className='settings-row-value'>{currentDriver.name}</span>
                            </div>
                            <div className='settings-row'>
                                <span className='settings-row-label'>Email</span>
                                <span className='settings-row-value'>{currentDriver.email || '—'}</span>
                            </div>
                            <div className='settings-row'>
                                <span className='settings-row-label'>Phone</span>
                                <span className='settings-row-value'>
                                    {currentDriver.phone}
                                    {currentDriver.phoneVerified && <span className='verified-badge'>Verified</span>}
                                </span>
                            </div>
                            <div className='settings-row'>
                                <span className='settings-row-label'>Plate number</span>
                                <span className='settings-row-value'>{currentDriver.car?.plateNumber}</span>
                            </div>

                            <div className='settings-stat'>
                                <div className='settings-stat-number'>{completedRides ?? '—'}</div>
                                <div className='settings-stat-label'>Rides completed</div>
                            </div>

                            <button type='button' className='settings-edit-btn' onClick={() => setEditingProfile(true)}>
                                Edit profile
                            </button>
                        </>
                    ) : (
                        <form onSubmit={saveProfile} className='settings-form'>
                            <div className='form-group'>
                                <label>Name</label>
                                <input
                                    value={profileForm.name}
                                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className='form-group'>
                                <label>Email</label>
                                <input
                                    type='email'
                                    value={profileForm.email}
                                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                />
                            </div>
                            <div className='form-group'>
                                <label>Phone</label>
                                <input
                                    type='tel'
                                    value={profileForm.phone}
                                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                    required
                                />
                            </div>
                            <div className='form-group'>
                                <label>Plate number</label>
                                <input
                                    value={profileForm.plateNumber}
                                    onChange={(e) => setProfileForm({ ...profileForm, plateNumber: e.target.value })}
                                    required
                                />
                            </div>

                            {profileError && <p className='settings-error'>{profileError}</p>}

                            <div className='settings-form-actions'>
                                <button type='button' className='settings-cancel-btn' onClick={() => setEditingProfile(false)}>
                                    Cancel
                                </button>
                                <button type='submit' className='settings-save-btn' disabled={profileSaving}>
                                    {profileSaving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                <section className='settings-section'>
                    <h2>Emergency Contact</h2>

                    {!editingContact ? (
                        <div className='settings-card'>
                            {currentDriver.emergencyContact?.name ? (
                                <>
                                    <div className='settings-row'>
                                        <span className='settings-row-label'>Name</span>
                                        <span className='settings-row-value'>{currentDriver.emergencyContact.name}</span>
                                    </div>
                                    <div className='settings-row'>
                                        <span className='settings-row-label'>Phone</span>
                                        <span className='settings-row-value'>{currentDriver.emergencyContact.phone}</span>
                                    </div>
                                    {currentDriver.emergencyContact.relationship && (
                                        <div className='settings-row'>
                                            <span className='settings-row-label'>Relationship</span>
                                            <span className='settings-row-value'>{currentDriver.emergencyContact.relationship}</span>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p className='settings-empty'>No emergency contact saved yet.</p>
                            )}

                            <button type='button' className='settings-edit-btn' onClick={() => setEditingContact(true)}>
                                {currentDriver.emergencyContact?.name ? 'Edit contact' : 'Add emergency contact'}
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={saveContact} className='settings-card settings-form'>
                            <div className='form-group'>
                                <label>Name</label>
                                <input
                                    value={contactForm.name}
                                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className='form-group'>
                                <label>Phone</label>
                                <input
                                    type='tel'
                                    value={contactForm.phone}
                                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                                    required
                                />
                            </div>
                            <div className='form-group'>
                                <label>Relationship</label>
                                <input
                                    placeholder='e.g. Spouse, Sibling'
                                    value={contactForm.relationship}
                                    onChange={(e) => setContactForm({ ...contactForm, relationship: e.target.value })}
                                />
                            </div>

                            {contactError && <p className='settings-error'>{contactError}</p>}

                            <div className='settings-form-actions'>
                                <button type='button' className='settings-cancel-btn' onClick={() => setEditingContact(false)}>
                                    Cancel
                                </button>
                                <button type='submit' className='settings-save-btn' disabled={contactSaving}>
                                    {contactSaving ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    )}
                </section>

                <button onClick={handleLogout} className='settings-logout-btn'>
                    Logout
                </button>
            </main>
        </>
    )
}

export default Settings
