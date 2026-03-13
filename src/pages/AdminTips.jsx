import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { endpoints } from '../utils/apiStatic'

export default function AdminTips(){
  const [tips, setTips] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(null)
  const TIP_CATEGORIES = [
    'ofimatica',
    'diseño grafico',
    'administrativo',
    'contabilidad',
    'informatica general',
    'talleres practicos'
  ]

  const [form, setForm] = useState({ title:'', description:'', image_url:'', alt_text:'', category:TIP_CATEGORIES[0], meta_description:'' })
  const token = localStorage.getItem('etp_token')

  const headers = token ? { Authorization: `Bearer ${token}`, 'Content-Type':'application/json' } : { 'Content-Type':'application/json' }

  const fetchTips = async (category) => {
    setLoading(true); setError(null)
    try{
      const url = category ? `${endpoints.TIPS}?category=${encodeURIComponent(category)}` : endpoints.TIPS
      const res = await axios.get(url)
      setTips(Array.isArray(res.data) ? res.data : [])
    }catch(e){ console.error('fetch tips', e); setError('No se pudo cargar tips') }
    finally{ setLoading(false) }
  }

  useEffect(()=>{ fetchTips() }, [])

  const handleChange = (k,v) => setForm(f => ({ ...f, [k]: v }))

  const startEdit = (t) => { setEditing(t.id); setForm({ title:t.title||'', description:t.description||'', image_url:t.image_url||'', alt_text:t.alt_text||'', category: TIP_CATEGORIES.includes((t.category||'').toLowerCase()) ? t.category : TIP_CATEGORIES[0], meta_description:t.meta_description||'' }) }
  const cancelEdit = () => { setEditing(null); setForm({ title:'', description:'', image_url:'', alt_text:'', category:'', meta_description:'' }) }

  const createTip = async () => {
    try{
      // validate category
      if(!TIP_CATEGORIES.includes((form.category||'').toLowerCase())){
        setError('Categoría inválida. Selecciona una opción válida.')
        return
      }
      const payload = { ...form, category: form.category }
      const res = await axios.post(endpoints.TIPS, payload, { headers })
      fetchTips()
      setForm({ title:'', description:'', image_url:'', alt_text:'', category:TIP_CATEGORIES[0], meta_description:'' })
    }catch(e){ console.error('create tip', e); setError('No se pudo crear tip') }
  }

  const updateTip = async (id) => {
    try{
      if(!TIP_CATEGORIES.includes((form.category||'').toLowerCase())){
        setError('Categoría inválida. Selecciona una opción válida.')
        return
      }
      const res = await axios.put(`${endpoints.TIPS}/${id}`, form, { headers })
      cancelEdit(); fetchTips()
    }catch(e){ console.error('update tip', e); setError('No se pudo actualizar tip') }
  }

  const deleteTip = async (id) => {
    if(!confirm('¿Eliminar este tip?')) return
    try{
      await axios.delete(`${endpoints.TIPS}/${id}`, { headers })
      fetchTips()
    }catch(e){ console.error('delete tip', e); setError('No se pudo eliminar') }
  }

  return (
    <div className="container section-padding">
      <h3>Tips y recomendaciones - Administración</h3>
      <p className="text-muted">Crea, edita y elimina tips. El backend de producción es usado por `endpoints.TIPS`.</p>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card mb-4">
        <div className="card-body">
          <h5 className="mb-3">{editing ? 'Editar tip' : 'Nuevo tip'}</h5>
          <div className="row g-2">
            <div className="col-12 col-md-6"><input className="form-control" placeholder="Título" value={form.title} onChange={e=>handleChange('title', e.target.value)} /></div>
            <div className="col-12 col-md-6">
              <select className="form-select" value={form.category} onChange={e=>handleChange('category', e.target.value)}>
                {TIP_CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div className="col-12"><input className="form-control" placeholder="Imagen (URL)" value={form.image_url} onChange={e=>handleChange('image_url', e.target.value)} /></div>
            <div className="col-12 col-md-6"><input className="form-control" placeholder="Alt text" value={form.alt_text} onChange={e=>handleChange('alt_text', e.target.value)} /></div>
            <div className="col-12 col-md-6"><input className="form-control" placeholder="Meta description" value={form.meta_description} onChange={e=>handleChange('meta_description', e.target.value)} /></div>
            <div className="col-12"><textarea className="form-control" placeholder="Descripción" value={form.description} onChange={e=>handleChange('description', e.target.value)} rows={3}></textarea></div>
          </div>
          <div className="mt-3 d-flex gap-2">
            {editing ? (
              <>
                <button className="btn btn-accent" onClick={()=>updateTip(editing)}>Guardar</button>
                <button className="btn btn-outline-secondary" onClick={cancelEdit}>Cancelar</button>
              </>
            ) : (
              <button className="btn btn-accent" onClick={createTip}>Crear tip</button>
            )}
          </div>
        </div>
      </div>

      <div>
        <h5>Listado de tips</h5>
        {loading && <div>Cargando...</div>}
        {!loading && tips.length === 0 && <div className="text-muted">No hay tips.</div>}
        <div className="row g-3">
          {tips.map(t => (
            <div key={t.id} className="col-12 col-md-6 col-lg-4">
              <div className="card h-100">
                {t.image_url && <img src={t.image_url} alt={t.alt_text||''} className="card-img-top" style={{height:160,objectFit:'cover'}} />}
                <div className="card-body d-flex flex-column">
                  <h6 className="mb-1" style={{wordBreak:'break-word'}}>{t.title}</h6>
                  <small className="text-muted mb-2">{t.category}</small>
                  <p className="mb-2" style={{flex:1}}>{t.description}</p>
                  <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-primary" onClick={()=>startEdit(t)}>Editar</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={()=>deleteTip(t.id)}>Eliminar</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
