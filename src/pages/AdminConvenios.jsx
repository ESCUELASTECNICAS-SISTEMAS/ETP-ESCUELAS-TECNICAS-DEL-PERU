import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { endpoints } from '../utils/apiStatic'

export default function AdminConvenios(){
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [convenios, setConvenios] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({ institucion:'', descripcion:'', url:'', logo_media_id:'', orden:1 })
  const [editingId, setEditingId] = useState(null)

  const token = localStorage.getItem('etp_token')
  const headers = token ? { Authorization: `Bearer ${token}`, 'Content-Type':'application/json' } : { 'Content-Type':'application/json' }

  useEffect(()=>{ fetchCourses() }, [])

  const fetchCourses = async () => {
    setLoading(true); setError(null)
    try{
      const res = await axios.get(endpoints.COURSES, { headers })
      setCourses(res.data || [])
      if (!selectedCourse && (res.data||[]).length) setSelectedCourse((res.data||[])[0].id)
    }catch(err){ console.error('fetch courses', err); setError('No se pudieron cargar cursos') }
    finally{ setLoading(false) }
  }

  useEffect(()=>{ if (selectedCourse) fetchConvenios(selectedCourse) }, [selectedCourse])

  const fetchConvenios = async (courseId) => {
    setLoading(true); setError(null)
    try{
      // fetch course detail and read convenios array if available
      const res = await axios.get(`${endpoints.COURSES}/${courseId}`, { headers })
      const data = res.data || {}
      setConvenios(data.convenios || [])
    }catch(err){ console.error('fetch convenios', err); setError('No se pudieron cargar convenios del curso') }
    finally{ setLoading(false) }
  }

  const startEdit = (c) => {
    setEditingId(c.id)
    setForm({ institucion:c.institucion||'', descripcion:c.descripcion||'', url:c.url||'', logo_media_id: c.logo_media_id||'', orden: c.orden || 1 })
  }
  const cancelEdit = () => { setEditingId(null); setForm({ institucion:'', descripcion:'', url:'', logo_media_id:'', orden:1 }) }

  const handleSave = async (e) => {
    e && e.preventDefault()
    if (!selectedCourse) return setError('Selecciona un curso primero')
    setSaving(true); setError(null)
    try{
      const payload = { institucion: form.institucion, descripcion: form.descripcion, url: form.url, logo_media_id: form.logo_media_id || null, orden: Number(form.orden) || 1 }
      if (editingId){
        await axios.put(`${endpoints.CONVENIOS_FOR_COURSE(selectedCourse)}/${editingId}`, payload, { headers })
      }else{
        await axios.post(endpoints.CONVENIOS_FOR_COURSE(selectedCourse), payload, { headers })
      }
      await fetchConvenios(selectedCourse)
      cancelEdit()
    }catch(err){ console.error('save convenio', err); setError('Error guardando convenio') }
    finally{ setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Desactivar convenio?')) return
    setSaving(true); setError(null)
    try{
      await axios.delete(`${endpoints.CONVENIOS_FOR_COURSE(selectedCourse)}/${id}`, { headers })
      await fetchConvenios(selectedCourse)
    }catch(err){ console.error('delete convenio', err); setError('Error desactivando convenio') }
    finally{ setSaving(false) }
  }

  return (
    <div className="container section-padding">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Administrar Convenios</h3>
        <small className="text-muted">Crear y gestionar convenios por curso</small>
      </div>
      

      <div className="row mb-3">
        <div className="col-12 col-md-6">
          <label className="form-label">Curso</label>
          <select className="form-select" value={selectedCourse||''} onChange={e=>setSelectedCourse(e.target.value)}>
            {(courses||[]).map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>
        <div className="col-12 col-md-6 d-flex align-items-end justify-content-end">
          <button className="btn btn-outline-secondary" onClick={()=>selectedCourse && fetchConvenios(selectedCourse)}>Refrescar</button>
        </div>
      </div>

      <div className="row">
        <div className="col-12 col-md-5">
          <div className="card mb-3">
            <div className="card-body">
              <h5 className="card-title">{editingId ? 'Editar convenio' : 'Nuevo convenio'}</h5>
              <form onSubmit={handleSave}>
                <div className="mb-2"><label className="form-label">Institución</label><input className="form-control" value={form.institucion} onChange={e=>setForm(f=>({...f,institucion:e.target.value}))} required /></div>
                <div className="mb-2"><label className="form-label">Descripción</label><textarea className="form-control" rows={3} value={form.descripcion} onChange={e=>setForm(f=>({...f,descripcion:e.target.value}))} /></div>
                <div className="mb-2"><label className="form-label">URL</label><input className="form-control" value={form.url} onChange={e=>setForm(f=>({...f,url:e.target.value}))} /></div>
                <div className="mb-2"><label className="form-label">Logo (media id)</label><input className="form-control" value={form.logo_media_id} onChange={e=>setForm(f=>({...f,logo_media_id:e.target.value}))} /></div>
                <div className="mb-2"><label className="form-label">Orden</label><input type="number" className="form-control" value={form.orden} onChange={e=>setForm(f=>({...f,orden:e.target.value}))} /></div>
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="d-flex gap-2"><button className="btn btn-accent" type="submit" disabled={saving}>{saving ? 'Guardando...' : (editingId ? 'Guardar' : 'Crear')}</button><button type="button" className="btn btn-outline-secondary" onClick={cancelEdit}>Cancelar</button></div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-7">
          <h5>Convenios del curso</h5>
          {loading && <div> Cargando...</div>}
          <div className="list-group">
            {(convenios||[]).map(c => (
              <div key={c.id} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <strong>{c.institucion}</strong>
                  <div className="text-muted small">{c.descripcion}</div>
                </div>
                <div className="d-flex gap-2">
                  <button className="btn btn-sm btn-outline-primary" onClick={()=>startEdit(c)}>Editar</button>
                  <button className="btn btn-sm btn-danger" onClick={()=>handleDelete(c.id)}>{c.active === false ? 'Eliminar' : 'Desactivar'}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
