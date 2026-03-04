// Keep-alive utility to prevent Render cold starts
// Pings the server every 14 minutes (before 15-minute timeout)

const BACKEND_URL = process.env.RENDER_EXTERNAL_URL || process.env.BACKEND_URL || 'https://paperchat-backend.onrender.com'

export const keepAlive = () => {
    if (process.env.NODE_ENV !== 'production') {
        console.log('[Keep-Alive] Disabled in development')
        return
    }

    const pingInterval = 14 * 60 * 1000 // 14 minutes

    setInterval(async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/api/health`)
            if (response.ok || response.status === 401) {
                console.log(`[Keep-Alive] Ping successful at ${new Date().toISOString()}`)
            }
        } catch (error) {
            console.error(`[Keep-Alive] Ping failed: ${error.message}`)
        }
    }, pingInterval)

    console.log('[Keep-Alive] Service started - pinging every 14 minutes')
}

export default keepAlive
