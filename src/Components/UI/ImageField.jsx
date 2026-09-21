import React, { useRef, useState } from 'react'
import { Icon } from './Icon'
import { readImage } from '../../utils/image'

// A "choose photo" button. Calls onChange(dataUrl) with a shrunken JPEG.
export default function ImageField({ label, onChange, onRemove, hasImage, children }) {
    const input = useRef(null)
    const [error, setError] = useState('')

    const pick = async (e) => {
        const file = e.target.files?.[0]
        e.target.value = ''
        if (!file) return
        try {
            setError('')
            onChange(await readImage(file))
        } catch (err) {
            setError(err.message)
        }
    }

    return (
        <div className='photo-pick'>
            {children}
            <div>
                <p className='lbl'>{label}</p>
                <div className='row' style={{ marginTop: 6 }}>
                    <button type='button' className='btn btn-ghost btn-sm' onClick={() => input.current.click()}>
                        <Icon name='camera' /> {hasImage ? 'Change' : 'Upload'}
                    </button>
                    {hasImage && onRemove && (
                        <button type='button' className='btn btn-ghost btn-sm' onClick={onRemove}>Remove</button>
                    )}
                </div>
                {error && <p className='err'>{error}</p>}
            </div>
            <input ref={input} type='file' accept='image/*' hidden onChange={pick} />
        </div>
    )
}
