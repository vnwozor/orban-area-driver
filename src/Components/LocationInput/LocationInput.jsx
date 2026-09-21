import React, { useEffect, useId, useRef, useState } from 'react'
import { PLACES, searchOSM } from '../../utils/places'

// A search box with a dropdown. Type a few letters: Abuja favourites appear at
// once, and OpenStreetMap results follow for anywhere else.
//
// value    = the chosen place { name, address, lat, lng } or null
// onSelect = called with the chosen place, or with null as soon as the text is edited
export default function LocationInput({ label, placeholder, value, onSelect, error, kind = 'from' }) {
    const id = useId()
    const [text, setText] = useState(value?.name || value?.address || '')
    const [open, setOpen] = useState(false)
    const [web, setWeb] = useState([])
    const [active, setActive] = useState(0)
    const abortRef = useRef(null)

    // The parent can change the value (swap, popular route) - follow it.
    useEffect(() => {
        setText(value?.name || value?.address || '')
    }, [value])

    const q = text.trim().toLowerCase()
    const local = PLACES.filter((p) => !q || p.name.toLowerCase().includes(q) || p.sub.toLowerCase().includes(q)).slice(0, 6)
    const extra = web.filter((w) => !local.some((l) => l.name === w.name))
    const options = [...local, ...extra]

    // Debounced internet search for anything that isn't on the Abuja list
    useEffect(() => {
        if (!open || q.length < 3) {
            setWeb([])
            return undefined
        }
        const timer = setTimeout(async () => {
            abortRef.current?.abort()
            abortRef.current = new AbortController()
            try {
                setWeb(await searchOSM(text.trim(), abortRef.current.signal))
            } catch {
                /* offline or rate limited: the Abuja list still works */
            }
        }, 350)
        return () => clearTimeout(timer)
    }, [text, open]) // eslint-disable-line react-hooks/exhaustive-deps

    const choose = (place) => {
        setText(place.name)
        setOpen(false)
        onSelect(place)
    }

    const onChange = (e) => {
        setText(e.target.value)
        setOpen(true)
        setActive(0)
        if (value) onSelect(null) // editing the text un-picks the place
    }

    const onKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setOpen(true)
            setActive((a) => Math.min(options.length - 1, a + 1))
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setActive((a) => Math.max(0, a - 1))
        } else if (e.key === 'Enter' && open && options[active]) {
            e.preventDefault()
            choose(options[active])
        } else if (e.key === 'Escape') {
            setOpen(false)
        }
    }

    return (
        <div className={`field loc ${error ? 'bad' : ''}`.trim()}>
            <label htmlFor={id}>{label}</label>
            <div className='inp'>
                <span className={`mk ${kind === 'to' ? 'sq' : ''}`.trim()} />
                <input
                    id={id}
                    value={text}
                    placeholder={placeholder}
                    autoComplete='off'
                    role='combobox'
                    aria-expanded={open}
                    aria-controls={`${id}-list`}
                    aria-autocomplete='list'
                    onChange={onChange}
                    onFocus={() => setOpen(true)}
                    onBlur={() => setOpen(false)}
                    onKeyDown={onKeyDown}
                />
            </div>
            {open && (
                <ul className='sug' id={`${id}-list`} role='listbox'>
                    {options.length ? (
                        options.map((p, i) => (
                            <li
                                key={`${p.name}-${p.lat}`}
                                role='option'
                                aria-selected={i === active}
                                className={i === active ? 'on' : ''}
                                // mousedown (not click) so the choice lands before the input loses focus
                                onMouseDown={(e) => {
                                    e.preventDefault()
                                    choose(p)
                                }}
                            >
                                <b>{p.name}</b>
                                <span>{p.sub}</span>
                            </li>
                        ))
                    ) : (
                        <li className='none'>No match yet. Keep typing a place in Nigeria.</li>
                    )}
                </ul>
            )}
            {error && <p className='err'>{error}</p>}
        </div>
    )
}
