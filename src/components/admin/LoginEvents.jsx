import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { endpoints } from '../../utils/apiStatic'

export default function LoginEvents(){
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [limit, setLimit] = useState(25)
  const [offset, setOffset] = useState(0)
  const [total, setTotal] = useState(null)
  const [stats, setStats] = useState(null)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const token = localStorage.getItem('etp_token')
  const headers = token ? { Authorization: `Bearer ${token}` } : {}

  const BASE = endpoints.LOGIN ? endpoints.LOGIN.replace('/auth/login','') : (import.meta.env.VITE_API_BASE || '')
  const API = `${BASE}/admin/login-events`

  const fetchEvents = async () => {
    setLoading(true); setError(null)
    try{
      const res = await axios.get(API, { headers, params: { limit: Math.min(100, Number(limit)||25), offset: Number(offset)||0 } })
      // expect { data: [...], total }
      setEvents(Array.isArray(res.data.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []))
      setTotal(res.data.total != null ? res.data.total : (res.data.meta && res.data.meta.total) || null)
    }catch(e){ console.error('fetch login events', e); setError('No se pudieron cargar eventos') }
    finally{ setLoading(false) }
  }

  const fetchStats = async () => {
    setError(null)
    try{
      const params = {}
      if (from) params.from = from
      if (to) params.to = to
      const res = await axios.get(`${API}/stats`, { headers, params })
      setStats(res.data || null)
    }catch(e){ console.error('fetch stats', e); setError('No se pudieron cargar estadísticas') }
  }

  useEffect(()=>{ fetchEvents() }, [limit, offset])

  return (
    <div className="card mb-3">
      <div className="card-body">
        <h5 className="card-title">Eventos de login</h5>
        <div className="mb-3 d-flex gap-2 align-items-center">
          <label className="small text-muted mb-0">Desde</label>
          <input type="date" className="form-control form-control-sm" value={from} onChange={e=>setFrom(e.target.value)} />
          <label className="small text-muted mb-0">Hasta</label>
          <input type="date" className="form-control form-control-sm" value={to} onChange={e=>setTo(e.target.value)} />
          <button className="btn btn-sm btn-outline-primary" onClick={fetchStats}>Actualizar stats</button>
        </div>

        {stats && (
          <div className="mb-3">
            <div className="small text-muted">Período: {stats.from || '—'} → {stats.to || '—'}</div>
            <div className="d-flex gap-3 mt-2 flex-wrap">
              <div className="p-2 border rounded">
                <div className="small text-muted">Total</div>
                <div className="fw-semibold">{stats.total ?? '—'}</div>
              </div>
              {stats.bySucursal && (
                Array.isArray(stats.bySucursal)
                  ? stats.bySucursal.map((item, idx) => {
                      const label = item && (item.nombre || item.id) ? (item.nombre || item.id) : String(idx)
                      const value = (item && typeof item === 'object') ? (item.count ?? item.total ?? JSON.stringify(item)) : item
                      return (
                        <div key={item && item.id ? item.id : idx} className="p-2 border rounded">
                          <div className="small text-muted">{label}</div>
                          <div className="fw-semibold">{value}</div>
                        </div>
                      )
                    })
                  : Object.keys(stats.bySucursal).map(k => {
                      const v = stats.bySucursal[k]
                      const display = (v && typeof v === 'object') ? (v.count ?? v.total ?? v.nombre ?? JSON.stringify(v)) : v
                      return (
                        <div key={k} className="p-2 border rounded">
                          <div className="small text-muted">{k}</div>
                          <div className="fw-semibold">{display}</div>
                        </div>
                      )
                    })
              )}
            </div>
          </div>
        )}

        <div className="mb-2 d-flex gap-2 align-items-center">
          <div className="small text-muted">Mostrar</div>
          <select className="form-select form-select-sm" style={{width: '100px'}} value={limit} onChange={e=>{ setLimit(Number(e.target.value)); setOffset(0) }}>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <button className="btn btn-sm btn-outline-secondary" onClick={()=>{ setOffset(Math.max(0, offset - limit)) }} disabled={offset===0}>Anterior</button>
          <button className="btn btn-sm btn-outline-secondary" onClick={()=>{ setOffset(offset + limit) }} disabled={total != null && offset + limit >= total}>Siguiente</button>
          <div className="ms-auto small text-muted">{total != null ? `Mostrando ${Math.min(total, offset+1)} - ${Math.min(total, offset+limit)} de ${total}` : ''}</div>
        </div>

        {loading && <div>Cargando...</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="table-responsive">
          <table className="table table-sm">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Usuario</th>
                <th>Correo</th>
                <th>Sucursal</th>
                <th>IP</th>
                <th>Resultado</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 && <tr><td colSpan={6} className="text-muted">No hay eventos</td></tr>}
              {events.map(ev => {
                const fecha = ev.created_at || ev.timestamp || ev.date
                  ? new Date(ev.created_at || ev.timestamp || ev.date).toLocaleString('es-PE')
                  : '-'
                const userName = ev.user?.name || ev.user_name || ev.name || '-'
                const userEmail = ev.user?.email || ev.email || '-'
                const sucursalDisplay = ev.sucursal
                  ? (ev.sucursal.nombre || String(ev.sucursal.id) || '-')
                  : '-'
                const ip = ev.ip || '-'
                const resultado = ev.success === false ? (ev.reason || 'FALLA') : (ev.success === true ? 'OK' : '-')
                return (
                  <tr key={ev.id}>
                    <td className="small">{fecha}</td>
                    <td className="small">{userName}</td>
                    <td className="small">{userEmail}</td>
                    <td className="small">{sucursalDisplay}</td>
                    <td className="small">{ip}</td>
                    <td className="small">
                      <span className={`badge ${resultado === 'OK' ? 'bg-success' : resultado === '-' ? 'bg-secondary' : 'bg-danger'}`}>
                        {resultado}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
