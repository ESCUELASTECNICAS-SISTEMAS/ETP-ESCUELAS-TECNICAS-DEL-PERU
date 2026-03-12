import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { endpoints } from '../utils/apiStatic'

export default function AdminGallery(){
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editCategory, setEditCategory] = useState('')
  const token = localStorage.getItem('etp_token')

  const fetchMedia = async () => {
    setLoading(true); setError(null)
    try{
      const res = await axios.get(endpoints.MEDIA, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      setItems(res.data || [])
    }catch(err){ console.error(err); setError('No se pudo cargar media') }
    finally{ setLoading(false) }
  }

  useEffect(()=>{ fetchMedia() }, [])

  const startEdit = (m) => { setEditingId(m.id); setEditCategory(m.category || '') }
  const cancelEdit = () => { setEditingId(null); setEditCategory('') }

  const save = async (id) => {
    try{
      const current = items.find(i => i.id === id) || {}
      const payload = { url: current.url, alt_text: current.alt_text, active: current.active ?? true, category: editCategory || null }
      console.log('AdminGallery: PUT payload', id, payload)
      const res = await axios.put(`${endpoints.MEDIA}/${id}`, payload, { headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' } })
      console.log('AdminGallery: PUT response', res && res.data)
      cancelEdit(); fetchMedia()
    }catch(e){ console.error('save admin gallery', e); if (e.response) console.log('AdminGallery: PUT error', e.response.data); setError('Error al guardar categoría') }
  }

  const toggleActive = async (m) => {
    try{
      const payload = { url: m.url, alt_text: m.alt_text, active: !m.active, category: m.category || null }
      console.log('AdminGallery: toggleActive PUT payload', m.id, payload)
      const res = await axios.put(`${endpoints.MEDIA}/${m.id}`, payload, { headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' } })
      console.log('AdminGallery: toggleActive response', res && res.data)
      fetchMedia()
    }catch(e){ console.error('toggle', e); if (e.response) console.log('AdminGallery: toggle error', e.response.data); setError('No se pudo cambiar activo') }
  }

  return (
    <div className="container section-padding">
      <Link to="/admin" className="btn-back mb-3"><i className="bi bi-arrow-left"></i> Volver al Panel</Link>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h3>Galería - Administración</h3>
          <p className="text-muted mb-0">Editar categorías y estado de las imágenes</p>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <div>Cargando...</div>}

      <div className="row g-3">
        {(items || []).map(m => (
          <div key={m.id} className="col-12 col-md-6 col-lg-4">
            <div className="card h-100">
              <img src={m.url} alt={m.alt_text || ''} className="card-img-top" style={{height:160,objectFit:'cover'}} />
              <div className="card-body">
                <div className="mb-2 small text-truncate">{m.alt_text || 'Sin alt'}</div>
                <div className="mb-2 small text-muted">{m.category || 'Sin categoría'}</div>
                {editingId === m.id ? (
                  <div className="d-flex gap-2">
                    <input className="form-control form-control-sm" value={editCategory} onChange={e=>setEditCategory(e.target.value)} />
                    <button className="btn btn-sm btn-accent" onClick={()=>save(m.id)}>Guardar</button>
                    <button className="btn btn-sm btn-outline-secondary" onClick={cancelEdit}>Cancelar</button>
                  </div>
                ) : (
                  <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-primary" onClick={()=>startEdit(m)}>Editar categoría</button>
                    <button className="btn btn-sm btn-outline-warning" onClick={()=>toggleActive(m)}>{m.active ? 'Desactivar' : 'Activar'}</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
