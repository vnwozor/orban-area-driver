import React, { useCallback, useContext, useEffect, useState } from 'react'
import { DriverContext } from '../Context/DriverContext'
import { Icon } from '../Components/UI/Icon'
import { Empty } from '../Components/UI/Bits'
import { usePolling } from '../hooks/usePolling'
import { timeAgo } from '../utils/format'

const ICON = { request: 'car', payment: 'cash', cancel: 'x', status: 'route', system: 'shield' }
const TONE = { request: 'req', payment: 'pay', cancel: 'bad', status: '', system: '' }

// Notifications: new requests, payments, cancellations and account updates
export default function Notifications() {
    const { api, refreshCounts } = useContext(DriverContext)
    const [data, setData] = useState(null)
    const [error, setError] = useState('')

    const load = useCallback(() => api.notifications().then((d) => { setData(d); setError('') }).catch((e) => setError(e.message)), [api])
    useEffect(() => { load() }, [load])
    usePolling(load, 15000)

    const readAll = async () => {
        await api.markAllRead().catch(() => {})
        load()
        refreshCounts()
    }

    return (
        <>
            <div className='page-head'>
                <div>
                    <h1>Notifications</h1>
                    <p className='lede'>Requests, payments and account updates.</p>
                </div>
                {data?.unread > 0 && <button className='btn btn-ghost btn-sm' onClick={readAll}>Mark all as read</button>}
            </div>
            {error && !data ? (
                <Empty title="Couldn't load notifications">{error}</Empty>
            ) : !data ? (
                <div className='skel' style={{ minHeight: 200 }} />
            ) : data.items.length === 0 ? (
                <Empty title='Nothing yet'>New ride requests and payments will appear here.</Empty>
            ) : (
                data.items.map((n) => (
                    <div className={`note ${n.read ? '' : 'unread'}`.trim()} key={n.id}>
                        <span className={`ico ${TONE[n.kind] || ''}`.trim()}><Icon name={ICON[n.kind] || 'bell'} /></span>
                        <div>
                            <b>{n.title}</b>
                            <p>{n.body}</p>
                        </div>
                        <small>{timeAgo(n.createdAt)}</small>
                    </div>
                ))
            )}
        </>
    )
}
