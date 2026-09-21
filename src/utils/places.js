// Popular Abuja places. They show up instantly in the location dropdown (and
// keep working if the internet search is slow or unavailable). Anywhere else
// in Nigeria comes from OpenStreetMap search (see LocationInput).
export const PLACES = [
    { name: 'Wuse 2', sub: 'Markets and offices', lat: 9.0765, lng: 7.4739 },
    { name: 'Gwarinpa', sub: 'Residential estate', lat: 9.1113, lng: 7.4046 },
    { name: 'Maitama', sub: 'Diplomatic district', lat: 9.087, lng: 7.4986 },
    { name: 'Jabi Lake Mall', sub: 'Lakeside mall', lat: 9.072, lng: 7.429 },
    { name: 'Garki', sub: 'Business district', lat: 9.033, lng: 7.489 },
    { name: 'Asokoro', sub: 'Residential district', lat: 9.0396, lng: 7.529 },
    { name: 'Utako', sub: 'Business district', lat: 9.0655, lng: 7.441 },
    { name: 'Central Business District', sub: 'City centre', lat: 9.0579, lng: 7.4951 },
    { name: 'Nnamdi Azikiwe Airport', sub: 'Terminals 1 and 2', lat: 9.0068, lng: 7.2632 },
    { name: 'Kubwa', sub: 'Satellite town', lat: 9.155, lng: 7.323 },
    { name: 'Lugbe', sub: 'Airport Road', lat: 8.977, lng: 7.383 },
    { name: 'Life Camp', sub: 'Residential', lat: 9.093, lng: 7.42 },
].map((p) => ({ ...p, address: `${p.name}, Abuja` }))

export const byName = (name) => PLACES.find((p) => p.name === name)

// Shortcuts shown under the search form
export const POPULAR_ROUTES = [
    ['Wuse 2', 'Gwarinpa'],
    ['Maitama', 'Nnamdi Azikiwe Airport'],
    ['Garki', 'Central Business District'],
    ['Utako', 'Life Camp'],
]

// OpenStreetMap (Nominatim) search, limited to Nigeria.
export const searchOSM = async (q, signal) => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&countrycodes=ng&q=${encodeURIComponent(q)}`
    const res = await fetch(url, { signal, headers: { Accept: 'application/json' } })
    if (!res.ok) return []
    const rows = await res.json()
    return rows.map((r) => {
        const parts = r.display_name.split(',').map((s) => s.trim())
        return { name: parts[0], sub: parts.slice(1, 3).join(', '), address: r.display_name, lat: Number(r.lat), lng: Number(r.lon) }
    })
}
