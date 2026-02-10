import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { endpoints } from '../utils/apiStatic'

export default function AdminNoticias(){
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({ title:'', summary:'', featured_media_id:'', published:true, published_at:'' })
  const [editingId, setEditingId] = useState(null)

  const token = localStorage.getItem('etp_token')
  const headers = token ? { Authorization: `Bearer ${token}`, 'Content-Type':'application/json' } : { 'Content-Type':'application/json' }

  useEffect(()=>{ fetch() }, [])

  const fetch = async () => {
    setLoading(true); setError(null)
    try{
      const res = await axios.get(endpoints.NEWS, { headers })
      setItems(res.data || [])
    }catch(err){ console.error('fetch noticias', err); setError('No se pudieron cargar noticias') }
    finally{ setLoading(false) }
  }

  const startEdit = (n) => setEditingId(n.id) || setForm({ title:n.title||'', summary:n.summary||'', featured_media_id: n.featured_media_id||'', published: !!n.published, published_at: n.published_at || '' })
  const cancelEdit = () => { setEditingId(null); setForm({ title:'', summary:'', featured_media_id:'', published:true, published_at:'' }) }

  const save = async (e) => {
    e && e.preventDefault()
    setSaving(true); setError(null)
    try{
      const payload = { title: form.title, summary: form.summary, featured_media_id: form.featured_media_id || null, published: !!form.published, published_at: form.published_at || null }
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
                <div className="mb-2"><label className="form-label">Featured media id</label><input className="form-control" value={form.featured_media_id} onChange={e=>setForm(f=>({...f,featured_media_id:e.target.value}))} /></div>
                <div className="mb-2"><label className="form-label">Published at</label><input className="form-control" type="datetime-local" value={form.published_at} onChange={e=>setForm(f=>({...f,published_at:e.target.value}))} /></div>
                <div className="form-check form-switch mb-2"><input className="form-check-input" type="checkbox" checked={form.published} onChange={e=>setForm(f=>({...f,published:e.target.checked}))} /><label className="form-check-label">Publicado</label></div>
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="d-flex gap-2"><button className="btn btn-accent" type="submit" disabled={saving}>{saving ? 'Guardando...' : (editingId ? 'Guardar' : 'Crear')}</button><button type="button" className="btn btn-outline-secondary" onClick={cancelEdit}>Cancelar</button></div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-7">
          <h5>Noticias</h5>
          {loading && <div> Cargando...</div>}
          <div className="list-group">
            {items.map(n => (
              <div key={n.id} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <strong>{n.title}</strong>
                  <div className="text-muted small">{n.summary}</div>
                  <div className="text-muted small">{n.published_at}</div>
                </div>
                <div className="d-flex gap-2">
                  <button className="btn btn-sm btn-outline-primary" onClick={()=>{ setEditingId(n.id); setForm({ title:n.title||'', summary:n.summary||'', featured_media_id:n.featured_media_id||'', published:!!n.published, published_at: n.published_at||'' }) }}>Editar</button>
                  <button className="btn btn-sm btn-danger" onClick={()=>remove(n.id)}>{n.active === false ? 'Eliminar' : 'Desactivar'}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
