// Small formatting helpers used across the rider app.

export const naira = (n) => '\u20A6' + Number(n || 0).toLocaleString('en-US')
export const plural = (n) => `${n} ${n === 1 ? 'passenger' : 'passengers'}`

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// '2026-09-25' -> 'Fri 25 Sep'
export const fmtDate = (s) => {
    if (!s) return ''
    const [y, m, d] = s.split('-').map(Number)
    return `${DAYS[new Date(y, m - 1, d).getDay()]} ${d} ${MONTHS[m - 1]}`
}

// '14:00' -> '2:00 PM'
export const fmtTime = (t) => {
    if (!t) return ''
    const [h, m] = t.split(':').map(Number)
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}

const pad = (n) => String(n).padStart(2, '0')
export const toISODate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const todayISO = () => toISODate(new Date())
export const tomorrowISO = () => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return toISODate(d)
}

export const initials = (name = '') =>
    name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?'

export const hue = (s = '') => {
    let h = 0
    for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) % 360
    return h
}

// 'Wuse 2, Abuja' -> 'Wuse 2'
export const placeName = (loc) => (loc?.name || (loc?.address || '').split(',')[0] || 'Location').trim()

// Driver-facing status labels: [label, pill colour]
export const STATUS = {
    pending: ['New request', 'amber'],
    accepted: ['Accepted', 'go'],
    arrived: ['Arrived', 'info'],
    started: ['Trip started', 'info'],
    completed: ['Completed', 'mute'],
    cancelled: ['Cancelled', 'stop'],
    declined: ['Declined', 'stop'],
}

// '2026-09-25T10:00:00Z' -> '5 min ago' / '3 hr ago' / '12 Sep'
export const timeAgo = (iso) => {
    const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins} min ago`
    if (mins < 60 * 24) return `${Math.round(mins / 60)} hr ago`
    return fmtDate(toISODate(new Date(iso)))
}

// { address: 'Wuse 2, Abuja' } -> 'Wuse 2, Abuja' (first two parts of the address)
export const shortAddress = (loc) =>
    (loc?.address || '').split(',').slice(0, 2).map((x) => x.trim()).filter(Boolean).join(', ') || 'Location'
