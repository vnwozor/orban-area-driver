import React, { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './MapView.css'

// Round / square markers drawn with CSS, so there are no marker image files to load.
const startIcon = L.divIcon({ className: 'pin pin-a', iconSize: [22, 22], iconAnchor: [11, 11] })
const endIcon = L.divIcon({ className: 'pin pin-b', iconSize: [20, 20], iconAnchor: [10, 10] })

const ABUJA = [9.0765, 7.4739]

function FitTo({ points }) {
    const map = useMap()
    useEffect(() => {
        // The map's box can still be settling on first render, so re-measure before fitting.
        const t = setTimeout(() => {
            map.invalidateSize()
            if (points.length > 1) map.fitBounds(points, { padding: [48, 48] })
            else if (points.length === 1) map.setView(points[0], 14)
        }, 60)
        return () => clearTimeout(t)
    }, [map, points])
    return null
}

// Shows the pickup, the destination and the driving route between them.
export default function MapView({ pickup, destination }) {
    const [route, setRoute] = useState(null)

    useEffect(() => {
        setRoute(null)
        if (!pickup || !destination) return undefined
        const ctrl = new AbortController()
        const url = `https://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`
        fetch(url, { signal: ctrl.signal })
            .then((r) => r.json())
            .then((d) => {
                const coords = d?.routes?.[0]?.geometry?.coordinates
                if (coords) setRoute(coords.map(([lng, lat]) => [lat, lng]))
            })
            .catch(() => {})
        return () => ctrl.abort()
    }, [pickup, destination])

    const points = useMemo(() => [pickup, destination].filter(Boolean).map((p) => [p.lat, p.lng]), [pickup, destination])
    const line = route || (points.length === 2 ? points : null)

    return (
        <MapContainer center={ABUJA} zoom={12} scrollWheelZoom={false} className='leaflet-fill'>
            <TileLayer attribution='&copy; OpenStreetMap contributors' url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' />
            {pickup && <Marker position={[pickup.lat, pickup.lng]} icon={startIcon} />}
            {destination && <Marker position={[destination.lat, destination.lng]} icon={endIcon} />}
            {line && <Polyline positions={line} pathOptions={{ color: '#0F1B2D', weight: 5, opacity: 0.85 }} />}
            <FitTo points={points} />
        </MapContainer>
    )
}
