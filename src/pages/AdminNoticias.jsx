import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { endpoints } from '../utils/apiStatic'
import MediaPicker from '../components/admin/MediaPicker'

export default function AdminNoticias(){
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({ title:'', summary:'', featured_media_id:'', published:true, published_at:'' })
  const [mediaList, setMediaList] = useState([])
  const [loadingMedia, setLoadingMedia] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [showDeactivatedPanel, setShowDeactivatedPanel] = useState(false)
  const [showUnpublishedPanel, setShowUnpublishedPanel] = useState(false)

  const token = localStorage.getItem('etp_token')
  const headers = token ? { Authorization: `Bearer ${token}`, 'Content-Type':'application/json' } : { 'Content-Type':'application/json' }

  useEffect(()=>{ fetch() }, [])
  useEffect(()=>{ fetchMedia() }, [])

  const fetch = async () => {
    setLoading(true); setError(null)
    try{
      const res = await axios.get(endpoints.NEWS, { headers })
      setItems(res.data || [])
    }catch(err){ console.error('fetch noticias', err); setError('No se pudieron cargar noticias') }
    finally{ setLoading(false) }
  }

  const startEdit = (n) => setEditingId(n.id) || setForm({ title:n.title||'', summary:n.summary||'', featured_media_id: n.featured_media_id||'', published: !!n.published, published_at: n.published_at || '', active: n.active !== undefined ? !!n.active : true })
  const cancelEdit = () => { setEditingId(null); setForm({ title:'', summary:'', featured_media_id:'', published:true, published_at:'', active: true }) }

  const save = async (e) => {
    e && e.preventDefault()
    setSaving(true); setError(null)
    try{
      const payload = { title: form.title, summary: form.summary, featured_media_id: form.featured_media_id || null, published: !!form.published, published_at: form.published_at || null, active: form.active === undefined ? true : !!form.active }
      if (editingId) await axios.put(`${endpoints.NEWS}/${editingId}`, payload, { headers })
      else await axios.post(endpoints.NEWS, payload, { headers })
      await fetch(); cancelEdit()
    }catch(err){ console.error('save noticia', err); setError('Error guardando noticia') }
    finally{ setSaving(false) }
  }

  const remove = async (id) => {
    if (!confirm('Desactivar noticia?')) return
    setSaving(true); setError(null)
    try{ await axios.delete(`${endpoints.NEWS}/${id}`, { headers }); await fetch() }catch(err){ console.error('delete noticia', err); setError('Error desactivando noticia') }finally{ setSaving(false) }
  }

  const togglePublished = async (n) => {
    setSaving(true); setError(null)
    try{
      await axios.put(`${endpoints.NEWS}/${n.id}`, { published: !n.published }, { headers })
      await fetch()
    }catch(err){ console.error('togglePublished noticia', err); setError('No se pudo cambiar publicado') }
    finally{ setSaving(false) }
  }

  const toggleActive = async (n) => {
    setSaving(true); setError(null)
    try{
      await axios.put(`${endpoints.NEWS}/${n.id}`, { active: !n.active }, { headers })
      await fetch()
    }catch(err){ console.error('toggleActive noticia', err); setError('No se pudo cambiar activo') }
    finally{ setSaving(false) }
  }

  const fetchMedia = async () => {
    setLoadingMedia(true)
    try{
      const res = await axios.get(endpoints.MEDIA, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      setMediaList(res.data || [])
    }catch(err){ console.error('fetchMedia', err) }
    finally{ setLoadingMedia(false) }
  }

  return (
    <div className="container section-padding">
      <Link to="/admin" className="btn-back mb-3"><i className="bi bi-arrow-left"></i> Volver al Panel</Link>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Administrar Noticias</h3>
        <small className="text-muted">Crear, editar y desactivar noticias</small>
      </div>

      <div className="row">
        <div className="col-12 col-md-5">
          <div className="card mb-3">
            <div className="card-body">
              <h5 className="card-title">{editingId ? 'Editar noticia' : 'Nueva noticia'}</h5>
              <form onSubmit={save}>
                <div className="mb-2"><label className="form-label">Título</label><input className="form-control" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} required /></div>
                <div className="mb-2"><label className="form-label">Resumen</label><textarea className="form-control" rows={3} value={form.summary} onChange={e=>setForm(f=>({...f,summary:e.target.value}))} /></div>
                <div className="mb-2">
                  <label className="form-label">Imagen destacada</label>
                  <MediaPicker mediaList={mediaList} loading={loadingMedia} selectedId={form.featured_media_id} onSelect={id=>setForm(f=>({...f,featured_media_id:id}))} label="imagen" />
                </div>
                <div className="mb-2"><label className="form-label">Published at</label><input className="form-control" type="datetime-local" value={form.published_at} onChange={e=>setForm(f=>({...f,published_at:e.target.value}))} /></div>
                <div className="d-flex gap-3 align-items-center mb-2">
                  <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" checked={form.published} onChange={e=>setForm(f=>({...f,published:e.target.checked}))} id="publishedSwitch" />
                    <label className="form-check-label" htmlFor="publishedSwitch">Publicado</label>
                  </div>
                  <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" checked={form.active !== undefined ? !!form.active : true} onChange={e=>setForm(f=>({...f,active:e.target.checked}))} id="activeSwitch" />
                    <label className="form-check-label" htmlFor="activeSwitch">Activo</label>
                  </div>
                </div>
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="d-flex gap-2"><button className="btn btn-accent" type="submit" disabled={saving}>{saving ? 'Guardando...' : (editingId ? 'Guardar' : 'Crear')}</button><button type="button" className="btn btn-outline-secondary" onClick={cancelEdit}>Cancelar</button></div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-7">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="mb-0">Noticias publicadas y activas</h5>
            <div className="d-flex gap-2">
              <button className="btn btn-sm btn-outline-secondary" onClick={()=>setShowDeactivatedPanel(true)}>Ver eliminadas</button>
              <button className="btn btn-sm btn-outline-secondary" onClick={()=>setShowUnpublishedPanel(true)}>Ver despublicadas</button>
            </div>
          </div>
          {loading && <div> Cargando...</div>}
          <div className="list-group">
            {items.filter(i => i.published && i.active !== false).map(n => (
              <div key={n.id} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <strong>{n.title}</strong>
                  <div className="text-muted small">{n.summary}</div>
                  <div className="text-muted small">{n.published_at}</div>
                  <div className="mt-1">
                    <span className="badge bg-success me-1">Publicado</span>
                    <span className="badge bg-info text-dark">Activa</span>
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <button className="btn btn-sm btn-outline-primary" onClick={()=>{ startEdit(n) }}>Editar</button>
                  <button className="btn btn-sm btn-outline-warning" onClick={()=>togglePublished(n)}>{n.published ? 'Despublicar' : 'Publicar'}</button>
                  <button className="btn btn-sm btn-danger" onClick={()=>toggleActive(n)}>Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {showDeactivatedPanel && (
        <div style={{position:'fixed',top:0,right:0,height:'100vh',width:420,background:'#fff',zIndex:1090,boxShadow:'-8px 0 24px rgba(0,0,0,0.12)'}}>
          <div className="d-flex align-items-center justify-content-between p-3 border-bottom">
            <div>
              <h5 className="mb-0">Noticias desactivadas</h5>
              <small className="text-muted">Noticias con active=false</small>
            </div>
            <div>
              <button className="btn btn-sm btn-outline-secondary" onClick={()=>setShowDeactivatedPanel(false)}>Cerrar</button>
            </div>
          </div>
          <div style={{overflowY:'auto',height:'calc(100vh - 64px)'}} className="p-3">
            <div className="list-group list-group-flush">
              {items.filter(i=>i.active===false).map(n => (
                <div key={`d-${n.id}`} className="list-group-item">
                  <div className="d-flex align-items-center">
                    <div style={{flex:1}}>
                      <strong>{n.title}</strong>
                      <div className="text-muted small">{n.summary}</div>
                    </div>
                    <div>
                      <button className="btn btn-sm btn-outline-primary me-2" onClick={()=>{ setShowDeactivatedPanel(false); startEdit(n); }}>Editar</button>
                      <button className="btn btn-sm btn-outline-success" onClick={()=>{ toggleActive(n); setShowDeactivatedPanel(false); }}>Publicar</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {showUnpublishedPanel && (
        <div style={{position:'fixed',top:0,right:0,height:'100vh',width:420,background:'#fff',zIndex:1090,boxShadow:'-8px 0 24px rgba(0,0,0,0.12)'}}>
          <div className="d-flex align-items-center justify-content-between p-3 border-bottom">
            <div>
              <h5 className="mb-0">Noticias despublicadas</h5>
              <small className="text-muted">Noticias con published=false</small>
            </div>
            <div>
              <button className="btn btn-sm btn-outline-secondary" onClick={()=>setShowUnpublishedPanel(false)}>Cerrar</button>
            </div>
          </div>
          <div style={{overflowY:'auto',height:'calc(100vh - 64px)'}} className="p-3">
            <div className="list-group list-group-flush">
              {items.filter(i=>!i.published).map(n => (
                <div key={`u-${n.id}`} className="list-group-item">
                  <div className="d-flex align-items-center">
                    <div style={{flex:1}}>
                      <strong>{n.title}</strong>
                      <div className="text-muted small">{n.summary}</div>
                    </div>
                    <div>
                      <button className="btn btn-sm btn-outline-primary me-2" onClick={()=>{ setShowUnpublishedPanel(false); startEdit(n); }}>Editar</button>
                      <button className="btn btn-sm btn-outline-success" onClick={()=>{ togglePublished(n); setShowUnpublishedPanel(false); }}>Publicar</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
