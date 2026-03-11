import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { endpoints } from '../../utils/apiStatic'

export default function VisitStats() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const token = localStorage.getItem('etp_token')
  const headers = token ? { Authorization: `Bearer ${token}` } : {}

  const fetchStats = async () => {
    setLoading(true); setError(null)
    try {
      const params = {}
      if (from) params.from = from
      if (to)   params.to   = to
      const res = await axios.get(endpoints.VISIT_STATS, { headers, params })
      setStats(res.data || null)
    } catch (e) {
      console.error('visit stats', e)
      setError('No se pudieron cargar las estadísticas de visitas')
    } finally {
      setLoading(false)
    }
  }

  // Load on mount with no date filter
  useEffect(() => { fetchStats() }, [])

  // Top country flags (simple emoji map)
  const flagMap = { PE: '🇵🇪', US: '🇺🇸', AR: '🇦🇷', CO: '🇨🇴', MX: '🇲🇽', CL: '🇨🇱', EC: '🇪🇨', BO: '🇧🇴' }

  return (
    <div className="card mb-4">
      <div className="card-header bg-white d-flex align-items-center justify-content-between">
        <div>
          <h5 className="mb-0"><i className="bi bi-bar-chart-fill text-primary me-2"></i>Visitas al sitio</h5>
          <small className="text-muted">Basado en <code>GET /visits/stats</code></small>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <input
            type="date"
            className="form-control form-control-sm"
            value={from}
            onChange={e => setFrom(e.target.value)}
            style={{ width: 145 }}
          />
          <span className="text-muted small">→</span>
          <input
            type="date"
            className="form-control form-control-sm"
            value={to}
            onChange={e => setTo(e.target.value)}
            style={{ width: 145 }}
          />
          <button className="btn btn-sm btn-primary" onClick={fetchStats} disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm" /> : <i className="bi bi-arrow-clockwise" />}
          </button>
        </div>
      </div>

      <div className="card-body">
        {error && <div className="alert alert-danger py-2 mb-3">{error}</div>}

        {stats && (
          <>
            {/* Period label */}
            {(stats.from || stats.to) && (
              <div className="text-muted small mb-3">
                Período: <strong>{stats.from || '?'}</strong> → <strong>{stats.to || '?'}</strong>
              </div>
            )}

            {/* Total visits big number */}
            <div className="d-flex align-items-center gap-4 mb-4 flex-wrap">
              <div className="text-center px-4 py-3 border rounded-3 shadow-sm">
                <div className="display-5 fw-bold text-primary">{stats.total ?? '—'}</div>
                <div className="small text-muted mt-1">Visitas totales</div>
              </div>

              {/* byCountry breakdown */}
              {Array.isArray(stats.byCountry) && stats.byCountry.length > 0 && (
                <div className="flex-grow-1">
                  <div className="small text-muted mb-2 fw-semibold">Por país</div>
                  <div className="d-flex flex-wrap gap-2">
                    {stats.byCountry.map(item => {
                      const code = item.country || '??'
                      const flag = flagMap[code] || '🌐'
                      const pct = stats.total ? Math.round((item.count / stats.total) * 100) : 0
                      return (
                        <div key={code} className="border rounded-3 px-3 py-2 d-flex align-items-center gap-2" style={{ minWidth: 130 }}>
                          <span style={{ fontSize: '1.4rem' }}>{flag}</span>
                          <div>
                            <div className="fw-semibold small">{code}</div>
                            <div className="text-muted" style={{ fontSize: '0.8rem' }}>{item.count} ({pct}%)</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  {/* Simple bar chart */}
                  <div className="mt-3">
                    {stats.byCountry.slice(0, 6).map(item => {
                      const code = item.country || '??'
                      const pct = stats.total ? Math.round((item.count / stats.total) * 100) : 0
                      const flag = flagMap[code] || '🌐'
                      return (
                        <div key={code} className="d-flex align-items-center gap-2 mb-1">
                          <div className="small text-muted" style={{ width: 60 }}>{flag} {code}</div>
                          <div className="flex-grow-1 bg-light rounded" style={{ height: 16 }}>
                            <div
                              className="bg-primary rounded"
                              style={{ width: `${pct}%`, height: '100%', transition: 'width .4s ease' }}
                            />
                          </div>
                          <div className="small text-muted" style={{ width: 50, textAlign: 'right' }}>{item.count}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {!stats && !loading && !error && (
          <div className="text-muted small">Pulsa el botón para cargar estadísticas.</div>
        )}
        {loading && <div className="text-muted small">Cargando estadísticas...</div>}
      </div>
    </div>
  )
}
