import React, { createContext, useCallback, useContext, useState } from 'react'
import { Icon } from '../UI/Icon'

const ToastContext = createContext(() => {})
export const useToast = () => useContext(ToastContext)

export function ToastProvider({ children }) {
    const [items, setItems] = useState([])

    const toast = useCallback((message) => {
        const id = Date.now() + Math.random()
        setItems((prev) => [...prev, { id, message }])
        setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 3400)
    }, [])

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <div id='toasts' role='status' aria-live='polite'>
                {items.map((t) => (
                    <div className='toast' key={t.id}>
                        <Icon name='check' />
                        <span>{t.message}</span>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}
