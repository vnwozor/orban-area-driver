import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import './App.css'
import App from './App.jsx'
import { DriverContextProvider } from './Context/DriverContext.jsx'
import { ToastProvider } from './Components/Toast/Toast.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <DriverContextProvider>
                <ToastProvider>
                    <App />
                </ToastProvider>
            </DriverContextProvider>
        </BrowserRouter>
    </React.StrictMode>
)
