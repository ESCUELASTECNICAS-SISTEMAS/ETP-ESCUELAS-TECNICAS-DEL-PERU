import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { endpoints } from '../utils/apiStatic'

export default function AdminMedia(){
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [url, setUrl] = useState('')
  const [alt, setAlt] = useState('')

  const token = localStorage.getItem('etp_token')

  const [editingId, setEditingId] = useState(null)
  const [editUrl, setEditUrl] = useState('')
  const [editAlt, setEditAlt] = useState('')
  const [editActive, setEditActive] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showInactive, setShowInactive] = useState(false)

  const fetchMedia = async () => {
    setLoading(true)
    setError(null)
    try{
      const res = await axios.get(endpoints.MEDIA, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      setItems(res.data || [])
    }catch(err){
      console.error(err)
      setError('No se pudo cargar media')
    }finally{setLoading(false)}
  }

  useEffect(()=>{ fetchMedia() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setError(null)
    if(!url) return setError('Ingresa la URL de la imagen')
    try{
      const payload = { url, alt_text: alt }
      await axios.post(endpoints.MEDIA, payload, { headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' } })
      setUrl(''); setAlt('')
      fetchMedia()
    }catch(err){
      console.error(err)
      setError('Error al crear media')
    }
  }

  const handleCopy = (u) => navigator.clipboard.writeText(u)

  const formatDateTime = (iso) => {
    if (!iso) return ''
    try{
      const d = new Date(iso)
      return new Intl.DateTimeFormat('es-PE', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hour12: false,
        timeZone: 'America/Lima'
      }).format(d)
    }catch(e){ return iso }
  }

  const startEdit = (m) => {
    setEditingId(m.id)
    setEditUrl(m.url || '')
    setEditAlt(m.alt_text || '')
    setEditActive(Boolean(m.active))
  }

  const cancelEdit = () => {
    setEditingId(null); setEditUrl(''); setEditAlt(''); setEditActive(false)
  }

  const saveEdit = async (id) => {
    setSaving(true); setError(null)
    try{
      const payload = { url: editUrl, alt_text: editAlt, active: editActive }
      await axios.put(`${endpoints.MEDIA}/${id}`, payload, { headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' } })
      cancelEdit()
      fetchMedia()
    }catch(err){
      console.error('saveEdit', err)
      setError('Error al actualizar media')
    }finally{setSaving(false)}
  }

  const activeItems = items.filter(m => m.active)
  const inactiveItems = items.filter(m => !m.active)

  const toggleActive = async (m) => {
    setError(null)
    try{
      await axios.put(`${endpoints.MEDIA}/${m.id}`, { active: !m.active }, { headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' } })
      fetchMedia()
    }catch(err){ console.error('toggleActive', err); setError('No se pudo cambiar activo') }
  }

  const deleteMedia = async (m) => {
    // Deletion disabled for media via UI. Prefer soft-disable using toggleActive.
    // Kept for possible backend support, but not used in the UI.
    if(!confirm('¿Eliminar media permanentemente? Esta acción no es recomendada.')) return
    setError(null)
    try{
      await axios.delete(`${endpoints.MEDIA}/${m.id}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      fetchMedia()
    }catch(err){ console.error('deleteMedia', err); setError('No se pudo eliminar media') }
  }

  return (
    <div className="container section-padding">
      <Link to="/admin" className="btn-back mb-3"><i className="bi bi-arrow-left"></i> Volver al Panel</Link>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Media</h3>
        <small className="text-muted">Gestiona imágenes y recursos multimedia</small>
      </div>

      <div className="row">
        <div className="col-12 col-md-5">
          <div className="card mb-3">
            <div className="card-body">
              <h5 className="card-title">Agregar imagen por URL</h5>
              <form onSubmit={handleCreate}>
                <div className="mb-3">
                  <label className="form-label">URL de la imagen</label>
                  <input className="form-control" value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://.../imagen.jpg" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Texto alternativo</label>
                  <input className="form-control" value={alt} onChange={e=>setAlt(e.target.value)} placeholder="Descripción breve" />
                </div>
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="d-grid">
                  <button className="btn btn-accent" type="submit">Crear media</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-7">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h5 className="card-title mb-0">Media existente</h5>
                <div>
                  <button className="btn btn-sm btn-outline-secondary me-2" onClick={()=>fetchMedia()}>Refrescar</button>
                  <button className="btn btn-sm btn-outline-primary" onClick={()=>setShowInactive(v=>!v)}>{showInactive ? 'Ocultar desactivados' : `Ver desactivados (${inactiveItems.length})`}</button>
                </div>
              </div>
              {loading && <div>Cargando...</div>}
              {!loading && items.length === 0 && <div className="text-muted">No hay media.</div>}
              <div className="row g-3">
                {activeItems.map((m) => (
                  <div className="col-6 col-md-4" key={m.id}>
                    <div className="card h-100">
                      <img src={m.url} alt={m.alt_text || ''} className="card-img-top" style={{height:120,objectFit:'cover'}} />
                      <div className="card-body p-2">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className={`badge ${m.active ? 'bg-success' : 'bg-secondary'}`}>{m.active ? 'Activo' : 'Inactivo'}</span>
                          <small className="text-muted">{formatDateTime(m.created_at)}</small>
                        </div>

                        {editingId === m.id ? (
                          <div>
                            <div className="mb-2">
                              <input className="form-control form-control-sm mb-1" value={editUrl} onChange={e=>setEditUrl(e.target.value)} />
                              <input className="form-control form-control-sm" value={editAlt} onChange={e=>setEditAlt(e.target.value)} />
                            </div>
                            <div className="d-flex gap-2">
                              <div className="form-check form-switch">
                                <input className="form-check-input" type="checkbox" checked={editActive} onChange={e=>setEditActive(e.target.checked)} id={`activeSwitch${m.id}`} />
                                <label className="form-check-label small" htmlFor={`activeSwitch${m.id}`}>Activo</label>
                              </div>
                              <button className="btn btn-sm btn-accent" onClick={()=>saveEdit(m.id)} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
                              <button className="btn btn-sm btn-outline-secondary" onClick={cancelEdit}>Cancelar</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="small text-truncate mb-2">{m.alt_text || 'Sin alt'}</div>
                            <div className="d-flex gap-2">
                              <button className="btn btn-sm btn-outline-secondary" onClick={()=>handleCopy(m.url)}>Copiar URL</button>
                              <button className="btn btn-sm btn-outline-primary" onClick={()=>startEdit(m)}>Editar</button>
                              <button className="btn btn-sm btn-outline-warning" onClick={()=>toggleActive(m)}>{m.active ? 'Desactivar' : 'Activar'}</button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {showInactive && (
                <div className="mt-3">
                  <h6>Media desactivada</h6>
                  <div className="row g-3">
                    {inactiveItems.map(m => (
                      <div className="col-6 col-md-4" key={`inactive-${m.id}`}>
                        <div className="card h-100" style={{opacity:0.6}}>
                          <img src={m.url} alt={m.alt_text || ''} className="card-img-top" style={{height:120,objectFit:'cover',filter:'grayscale(10%)'}} />
                          <div className="card-body p-2">
                            <div className="small text-truncate mb-2">{m.alt_text || 'Sin alt'}</div>
                            <div className="d-flex gap-2">
                              <button className="btn btn-sm btn-outline-secondary" onClick={()=>handleCopy(m.url)}>Copiar URL</button>
                              <button className="btn btn-sm btn-outline-primary" onClick={()=>startEdit(m)}>Editar</button>
                              <button className="btn btn-sm btn-outline-success" onClick={()=>toggleActive(m)}>Activar</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
