import React, { useContext, useEffect, useState } from 'react'
import { DriverContext } from '../Context/DriverContext'
import PageHead from '../Components/Layout/PageHead'
import { Avatar, Empty } from '../Components/UI/Bits'
import { fmtDate, naira, placeName, toISODate } from '../utils/format'

const TABS = [
    ['completed', 'Completed'],
    ['cancelled', 'Cancelled'],
    ['passengers', 'Previous passengers'],
]

// Trip history: completed trips (with earnings), cancelled trips and previous passengers
export default function History() {
    const { api } = useContext(DriverContext)
    const [tab, setTab] = useState('completed')
    const [rows, setRows] = useState(null)
    const [error, setError] = useState('')

    useEffect(() => {
        let cancelled = false
        setRows(null)
        setError('')
        const req = tab === 'passengers' ? api.passengers() : api.history(tab)
        req.then((r) => !cancelled && setRows(r)).catch((e) => !cancelled && setError(e.message))
        return () => { cancelled = true }
    }, [api, tab])

    const route = (b) => `${placeName(b.pickup)} to ${placeName(b.destination)}`

    return (
        <>
            <PageHead title='Trip history' lede='Completed trips, cancellations and the passengers you have driven.' />
            <div className='tabs' role='tablist'>
                {TABS.map(([id, label]) => (
                    <button key={id} role='tab' aria-selected={tab === id} onClick={() => setTab(id)}>{label}</button>
                ))}
            </div>
            {error ? (
                <Empty title="Couldn't load history">{error}</Empty>
            ) : !rows ? (
                <div className='skel' style={{ minHeight: 200 }} />
            ) : rows.length === 0 ? (
                <Empty title={tab === 'passengers' ? 'No passengers yet' : tab === 'cancelled' ? 'Nothing cancelled' : 'No completed trips yet'}>
                    {tab === 'cancelled' ? 'Cancelled and declined trips appear here.' : 'Finished trips appear here with what you earned.'}
                </Empty>
            ) : tab === 'passengers' ? (
                rows.map((p) => (
                    <div className='row-item' key={p.id}>
                        <Avatar name={p.name} />
                        <div className='grow'>
                            <b>{p.name}</b>
                            <small>{p.trips} {p.trips === 1 ? 'trip' : 'trips'}, last on {fmtDate(toISODate(new Date(p.lastTrip)))}</small>
                        </div>
                        <div className='earned num'>{naira(p.totalSpent)}</div>
                    </div>
                ))
            ) : (
                rows.map((b) => (
                    <div className='row-item' key={b.id}>
                        <Avatar name={b.passenger?.name || 'Passenger'} />
                        <div className='grow'>
                            <b>{b.passenger?.name}</b>
                            <small>{route(b)}</small>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            {tab === 'completed' ? (
                                <div className='earned num'>+{naira(b.fare.total)}</div>
                            ) : (
                                <span className='pill pill-stop'>{b.status === 'declined' ? 'Declined' : 'Cancelled'}</span>
                            )}
                            <small>{fmtDate(b.date)}</small>
                        </div>
                    </div>
                ))
            )}
        </>
    )
}
