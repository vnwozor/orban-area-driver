import React, { useState } from 'react'
import { Icon } from './Icon'
import { currentTheme, setTheme } from '../../utils/theme'

// The sun / moon button that switches between light and dark mode.
export default function ThemeToggle() {
    const [theme, setLocal] = useState(currentTheme)
    const next = theme === 'dark' ? 'light' : 'dark'
    return (
        <button
            type='button'
            className='icon-btn theme-toggle'
            onClick={() => {
                setTheme(next)
                setLocal(next)
            }}
            aria-label={`Switch to ${next} mode`}
            title={`Switch to ${next} mode`}
        >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
            <span className='tt-label'>{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>
    )
}
