import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { endpoints } from '../utils/apiStatic'

export default function AdminSeminarios(){
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [seminarios, setSeminarios] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({ titulo:'', descripcion:'', fecha:'', duracion_horas:1, orden:1, active:true })
  const [editingId, setEditingId] = useState(null)

  const token = localStorage.getItem('etp_token')
  const headers = token ? { Authorization: `Bearer ${token}`, 'Content-Type':'application/json' } : { 'Content-Type':'application/json' }

  useEffect(()=>{ fetchCourses() }, [])
  useEffect(()=>{ if (selectedCourse) fetchSeminarios(selectedCourse) }, [selectedCourse])

  const fetchCourses = async () => {
    setLoading(true); setError(null)
    try{
      const res = await axios.get(endpoints.COURSES, { headers })
      setCourses(res.data || [])
      if (!selectedCourse && (res.data||[]).length) setSelectedCourse((res.data||[])[0].id)
    }catch(err){ console.error('fetch courses', err); setError('No se pudieron cargar cursos') }
    finally{ setLoading(false) }
  }

  const fetchSeminarios = async (courseId) => {
    setLoading(true); setError(null)
    try{
      const res = await axios.get(`${endpoints.COURSES}/${courseId}`, { headers })
      const data = res.data || {}
      setSeminarios(data.seminarios || [])
    }catch(err){ console.error('fetch seminarios', err); setError('No se pudieron cargar seminarios del curso') }
    finally{ setLoading(false) }
  }

  const startEdit = (s) => { setEditingId(s.id); setForm({ titulo:s.titulo||'', descripcion:s.descripcion||'', fecha:s.fecha||'', duracion_horas:s.duracion_horas||1, orden:s.orden||1, active: s.active !== false }) }
  const cancelEdit = () => { setEditingId(null); setForm({ titulo:'', descripcion:'', fecha:'', duracion_horas:1, orden:1, active:true }) }

  const handleSave = async (e) => {
    e && e.preventDefault()
    if (!selectedCourse) return setError('Selecciona un curso primero')
    setSaving(true); setError(null)
    try{
      const payload = { titulo: form.titulo, descripcion: form.descripcion, fecha: form.fecha, duracion_horas: Number(form.duracion_horas) || 1, orden: Number(form.orden) || 1, active: !!form.active }
      if (editingId){
        await axios.put(`${endpoints.COURSE_SEMINARIOS(selectedCourse)}/${editingId}`, payload, { headers })
      }else{
        await axios.post(endpoints.COURSE_SEMINARIOS(selectedCourse), payload, { headers })
      }
      await fetchSeminarios(selectedCourse)
      cancelEdit()
    }catch(err){ console.error('save seminario', err); setError('Error guardando seminario') }
    finally{ setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Desactivar seminario?')) return
    setSaving(true); setError(null)
    try{
      await axios.delete(`${endpoints.COURSE_SEMINARIOS(selectedCourse)}/${id}`, { headers })
      await fetchSeminarios(selectedCourse)
    }catch(err){ console.error('delete seminario', err); setError('Error desactivando seminario') }
    finally{ setSaving(false) }
  }

  return (
    <div className="container section-padding">
      <Link to="/admin" className="btn-back mb-3"><i className="bi bi-arrow-left"></i> Volver al Panel</Link>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Administrar Seminarios</h3>
        <small className="text-muted">Crear y gestionar seminarios por curso</small>
      </div>

      <div className="row mb-3">
        <div className="col-12 col-md-6">
          <label className="form-label">Curso</label>
          <select className="form-select" value={selectedCourse||''} onChange={e=>setSelectedCourse(e.target.value)}>
            {(courses||[]).map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>
        <div className="col-12 col-md-6 d-flex align-items-end justify-content-end">
          <button className="btn btn-outline-secondary" onClick={()=>selectedCourse && fetchSeminarios(selectedCourse)}>Refrescar</button>
        </div>
      </div>

      <div className="row">
        <div className="col-12 col-md-5">
          <div className="card mb-3">
            <div className="card-body">
              <h5 className="card-title">{editingId ? 'Editar seminario' : 'Nuevo seminario'}</h5>
              <form onSubmit={handleSave}>
                <div className="mb-2"><label className="form-label">Título</label><input className="form-control" value={form.titulo} onChange={e=>setForm(f=>({...f,titulo:e.target.value}))} required /></div>
                <div className="mb-2"><label className="form-label">Descripción</label><textarea className="form-control" rows={3} value={form.descripcion} onChange={e=>setForm(f=>({...f,descripcion:e.target.value}))} /></div>
                <div className="mb-2"><label className="form-label">Fecha (ISO)</label><input className="form-control" type="datetime-local" value={form.fecha} onChange={e=>setForm(f=>({...f,fecha:e.target.value}))} /></div>
                <div className="mb-2"><label className="form-label">Duración (horas)</label><input className="form-control" type="number" value={form.duracion_horas} onChange={e=>setForm(f=>({...f,duracion_horas:e.target.value}))} /></div>
                <div className="mb-2"><label className="form-label">Orden</label><input className="form-control" type="number" value={form.orden} onChange={e=>setForm(f=>({...f,orden:e.target.value}))} /></div>
                <div className="form-check form-switch mb-2"><input className="form-check-input" type="checkbox" checked={form.active} onChange={e=>setForm(f=>({...f,active:e.target.checked}))} /><label className="form-check-label">Activo</label></div>
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="d-flex gap-2"><button className="btn btn-accent" type="submit" disabled={saving}>{saving ? 'Guardando...' : (editingId ? 'Guardar' : 'Crear')}</button><button type="button" className="btn btn-outline-secondary" onClick={cancelEdit}>Cancelar</button></div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-7">
          <h5>Seminarios del curso</h5>
          {loading && <div> Cargando...</div>}
          <div className="list-group">
            {(seminarios||[]).map(s => (
              <div key={s.id} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <strong>{s.titulo}</strong>
                  <div className="text-muted small">{s.descripcion}</div>
                  <div className="text-muted small">{s.fecha ? new Date(s.fecha).toLocaleString() : ''} · {s.duracion_horas}h</div>
                </div>
                <div className="d-flex gap-2">
                  <button className="btn btn-sm btn-outline-primary" onClick={()=>startEdit(s)}>Editar</button>
                  <button className="btn btn-sm btn-danger" onClick={()=>handleDelete(s.id)}>{s.active === false ? 'Eliminar' : 'Desactivar'}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
