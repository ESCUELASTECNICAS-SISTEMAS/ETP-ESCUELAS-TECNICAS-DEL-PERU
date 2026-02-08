import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { endpoints } from '../utils/apiStatic'

export default function AdminCarousel(){
  const [slides, setSlides] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [mediaId, setMediaId] = useState('')
  const [title, setTitle] = useState('')
  const [orderIndex, setOrderIndex] = useState(1)
  const [mediaList, setMediaList] = useState([])
  const [loadingMedia, setLoadingMedia] = useState(true)
  const [mediaUrl, setMediaUrl] = useState('')
  const [mediaAlt, setMediaAlt] = useState('')

  const token = localStorage.getItem('etp_token')

  const fetchSlides = async () => {
    setLoading(true)
    setError(null)
    try{
      const res = await axios.get(endpoints.CAROUSEL, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      setSlides(res.data || [])
    }catch(err){
      console.error(err)
      setError('No se pudieron cargar las diapositivas')
    }finally{setLoading(false)}
  }

  useEffect(()=>{ fetchSlides() }, [])

  const fetchMedia = async () => {
    setLoadingMedia(true)
    try{
      const res = await axios.get(endpoints.MEDIA, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      setMediaList(res.data || [])
    }catch(err){
      console.error('fetchMedia', err)
    }finally{setLoadingMedia(false)}
  }

  useEffect(()=>{ fetchMedia() }, [])

  const createMediaFromUrl = async (e) => {
    e.preventDefault()
    if(!mediaUrl) return setError('Ingresa la URL de la imagen')
    try{
      const payload = { url: mediaUrl, alt_text: mediaAlt }
      const res = await axios.post(endpoints.MEDIA, payload, { headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' } })
      // add to list and select
      const created = res.data
      setMediaList(prev => [created, ...prev])
      setMediaId(String(created.id))
      setMediaUrl(''); setMediaAlt('')
    }catch(err){
      console.error(err)
      setError('Error al crear media')
    }
  }

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

  const [editingSlideId, setEditingSlideId] = useState(null)
  const [editSlideTitle, setEditSlideTitle] = useState('')
  const [editSlideOrder, setEditSlideOrder] = useState(1)
  const [editSlideActive, setEditSlideActive] = useState(true)
  const [editSlideMediaId, setEditSlideMediaId] = useState('')
  const [savingSlide, setSavingSlide] = useState(false)
  const [showInactive, setShowInactive] = useState(false)

  const startEditSlide = (s) => {
    setEditingSlideId(s.id)
    setEditSlideTitle(s.title || '')
    setEditSlideOrder(s.order_index || 1)
    setEditSlideActive(Boolean(s.active))
    setEditSlideMediaId(s.media_id || (s.media && s.media.id) || '')
  }

  const cancelEditSlide = () => {
    setEditingSlideId(null); setEditSlideTitle(''); setEditSlideOrder(1); setEditSlideActive(true); setEditSlideMediaId('')
  }

  const saveSlide = async (id) => {
    setSavingSlide(true); setError(null)
    try{
      const payload = { media_id: Number(editSlideMediaId), title: editSlideTitle, order_index: Number(editSlideOrder), active: Boolean(editSlideActive) }
      await axios.put(`${endpoints.CAROUSEL}/${id}`, payload, { headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' } })
      cancelEditSlide()
      fetchSlides()
    }catch(err){ console.error('saveSlide', err); setError('No se pudo actualizar la slide') }
    finally{ setSavingSlide(false) }
  }

  const toggleSlideActive = async (s) => {
    setError(null)
    try{
      await axios.put(`${endpoints.CAROUSEL}/${s.id}`, { active: !s.active }, { headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' } })
      fetchSlides()
    }catch(err){ console.error('toggleSlideActive', err); setError('No se pudo cambiar activo') }
  }

  const deleteSlide = async (s) => {
    if(!confirm('Eliminar slide?')) return
    setError(null)
    try{
      await axios.delete(`${endpoints.CAROUSEL}/${s.id}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      fetchSlides()
    }catch(err){ console.error('deleteSlide', err); setError('No se pudo eliminar slide') }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setError(null)
    try{
      const payload = { media_id: Number(mediaId), title, order_index: Number(orderIndex) }
      const res = await axios.post(endpoints.CAROUSEL, payload, { headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' } })
      // refresh
      setMediaId(''); setTitle(''); setOrderIndex(1)
      fetchSlides()
    }catch(err){
      console.error(err)
      setError('Error al crear la diapositiva')
    }
  }

  return (
    <div className="container section-padding">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Gestión del Carousel</h3>
        <small className="text-muted">Administra las slides principales del home</small>
      </div>

      <div className="row">
        <div className="col-12 col-md-6">
          <div className="card mb-3">
            <div className="card-body">
              <h5 className="card-title">Crear nueva diapositiva</h5>
              <form onSubmit={handleCreate}>
                <div className="mb-3">
                  <label className="form-label">Seleccionar media</label>
                  <select className="form-select" value={mediaId} onChange={e => setMediaId(e.target.value)} required>
                    <option value="">-- Seleccionar media --</option>
                    {loadingMedia && <option>cargando...</option>}
                    {mediaList.map(m => (
                      <option key={m.id} value={m.id}>{m.id} — {m.alt_text || m.url}</option>
                    ))}
                  </select>
                  {mediaId && (
                    <div className="mt-2">
                      <img src={(mediaList.find(x=>String(x.id)===String(mediaId))||{}).url} alt="preview" style={{width: '100%', maxHeight:180, objectFit:'cover'}} />
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label">Crear media desde URL (opcional)</label>
                  <div className="d-flex gap-2">
                    <input className="form-control" placeholder="https://.../img.jpg" value={mediaUrl} onChange={e=>setMediaUrl(e.target.value)} />
                    <input className="form-control" placeholder="Alt text" value={mediaAlt} onChange={e=>setMediaAlt(e.target.value)} />
                    <button className="btn btn-outline-secondary" onClick={createMediaFromUrl}>Crear</button>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Título</label>
                  <input className="form-control" value={title} onChange={e => setTitle(e.target.value)} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Orden (order_index)</label>
                  <input type="number" min={1} className="form-control" value={orderIndex} onChange={e => setOrderIndex(e.target.value)} />
                </div>
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="d-grid">
                  <button className="btn btn-accent" type="submit">Crear diapositiva</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between">
                <h5 className="card-title mb-0">Diapositivas existentes</h5>
                <div>
                  <button className="btn btn-sm btn-outline-secondary me-2" onClick={()=>fetchSlides()}>Refrescar</button>
                  <button className="btn btn-sm btn-outline-primary" onClick={()=>setShowInactive(v=>!v)}>{showInactive ? 'Ocultar desactivados' : `Ver desactivados (${slides.filter(x=>!x.active).length})`}</button>
                </div>
              </div>
              {loading && <div className="mt-2">Cargando...</div>}
              {!loading && slides.length === 0 && <div className="text-muted mt-2">No hay diapositivas.</div>}
              <div className="list-group list-group-flush">
                {(() => {
                  const activeSlides = slides.filter(s => s.active).sort((a,b)=> (a.order_index||0) - (b.order_index||0)).slice(0,3)
                  return activeSlides.map(s => (
                  <div className="list-group-item" key={s.id}>
                    <div className="d-flex align-items-center">
                      <img src={s.media?.url} alt={s.media?.alt_text || s.title} style={{width:120,height:60,objectFit:'cover',marginRight:12}} />
                      <div style={{flex:1}}>
                        <div className="d-flex justify-content-between">
                          <div style={{flex:1}}>
                            {editingSlideId === s.id ? (
                              <div>
                                <input className="form-control form-control-sm mb-1" value={editSlideTitle} onChange={e=>setEditSlideTitle(e.target.value)} />
                                <div className="d-flex gap-2 align-items-center mb-1">
                                  <input type="number" className="form-control form-control-sm" style={{width:80}} value={editSlideOrder} onChange={e=>setEditSlideOrder(e.target.value)} />
                                  <select className="form-select form-select-sm" style={{maxWidth:300}} value={editSlideMediaId} onChange={e=>setEditSlideMediaId(e.target.value)}>
                                    <option value="">-- Seleccionar media --</option>
                                    {mediaList.map(m=> <option key={m.id} value={m.id}>{m.id} — {m.alt_text || m.url}</option>)}
                                  </select>
                                  <div className="form-check form-switch ms-2">
                                    <input className="form-check-input" type="checkbox" checked={editSlideActive} onChange={e=>setEditSlideActive(e.target.checked)} id={`slideActive${s.id}`} />
                                    <label className="form-check-label small" htmlFor={`slideActive${s.id}`}>Activo</label>
                                  </div>
                                </div>
                                <div className="d-flex gap-2">
                                  <button className="btn btn-sm btn-accent" onClick={()=>saveSlide(s.id)} disabled={savingSlide}>{savingSlide ? 'Guardando...' : 'Guardar'}</button>
                                  <button className="btn btn-sm btn-outline-secondary" onClick={cancelEditSlide}>Cancelar</button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <strong>{s.title || 'Sin título'}</strong>
                                <div className="text-muted small">Order: {s.order_index} • Active: {s.active ? 'Sí' : 'No'}</div>
                                {s.media && (
                                  <div className="text-muted small">Media: {s.media.id} • {s.media.alt_text || 'Sin alt'} • {s.media.active !== undefined ? (s.media.active ? 'Activo' : 'Inactivo') : ''} • {formatDateTime(s.media.created_at)}</div>
                                )}
                              </>
                            )}
                          </div>
                          <div>
                            <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => navigator.clipboard.writeText(JSON.stringify(s))}>Copiar</button>
                            {editingSlideId === s.id ? null : (
                              <>
                                <button className="btn btn-sm btn-outline-primary me-1" onClick={()=>startEditSlide(s)}>Editar</button>
                                <button className="btn btn-sm btn-outline-warning me-1" onClick={()=>toggleSlideActive(s)}>{s.active ? 'Desactivar' : 'Activar'}</button>
                                <button className="btn btn-sm btn-outline-danger" onClick={()=>deleteSlide(s)}>Eliminar</button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
                })()}
              </div>

              {/* Inactive section */}
              {showInactive && (
                <div className="mt-3">
                  <h6>Diapositivas desactivadas</h6>
                  <div className="list-group list-group-flush">
                    {slides.filter(s => !s.active).sort((a,b)=> (a.order_index||0) - (b.order_index||0)).map(s => (
                      <div className="list-group-item" key={`inactive-${s.id}`} style={{opacity: 0.55}}>
                        <div className="d-flex align-items-center">
                          <img src={s.media?.url} alt={s.media?.alt_text || s.title} style={{width:120,height:60,objectFit:'cover',marginRight:12,filter:'grayscale(10%)'}} />
                          <div style={{flex:1}}>
                            <div className="d-flex justify-content-between">
                              <div>
                                <strong>{s.title || 'Sin título'}</strong>
                                <div className="text-muted small">Order: {s.order_index} • Active: {s.active ? 'Sí' : 'No'}</div>
                                {s.media && (
                                  <div className="text-muted small">Media: {s.media.id} • {s.media.alt_text || 'Sin alt'} • {formatDateTime(s.media.created_at)}</div>
                                )}
                              </div>
                              <div>
                                <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => navigator.clipboard.writeText(JSON.stringify(s))}>Copiar</button>
                                <button className="btn btn-sm btn-outline-primary me-1" onClick={()=>startEditSlide(s)}>Editar</button>
                                <button className="btn btn-sm btn-outline-warning me-1" onClick={()=>toggleSlideActive(s)}>Activar</button>
                                <button className="btn btn-sm btn-outline-danger" onClick={()=>deleteSlide(s)}>Eliminar</button>
                              </div>
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
