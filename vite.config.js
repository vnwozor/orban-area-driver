import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The rider app runs on 5173 and the driver app on 5174, so you can run both at once.
export default defineConfig({
    plugins: [react()],
    server: { port: 5174 },
    preview: { port: 5174 },
})
