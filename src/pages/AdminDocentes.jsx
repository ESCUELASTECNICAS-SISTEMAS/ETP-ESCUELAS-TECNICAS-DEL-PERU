import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { endpoints } from '../utils/apiStatic'

export default function AdminDocentes(){
  const [items, setItems] = useState([])
  const [courses, setCourses] = useState([])
  const [assignedCourses, setAssignedCourses] = useState([])
  const [assignCourseId, setAssignCourseId] = useState('')
  const [assignRole, setAssignRole] = useState('Profesor')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({ nombre:'', especialidad:'', bio:'', email:'', foto_media_id: '' })
  const [editingId, setEditingId] = useState(null)

  const token = localStorage.getItem('etp_token')
  const headers = token ? { Authorization: `Bearer ${token}` } : {}

  const fetch = async () => {
    setLoading(true); setError(null)
    try{
      const res = await axios.get(endpoints.DOCENTES, { headers })
      setItems(res.data || [])
    }catch(err){ console.error('fetch docentes', err); setError('No se pudieron cargar docentes') }
    finally{ setLoading(false) }
  }

  const fetchCourses = async () => {
    try{
      const res = await axios.get(endpoints.COURSES, { headers })
      setCourses(res.data || [])
    }catch(err){ console.error('fetch courses', err) }
  }

  const fetchAssignedCoursesFor = async (docenteId) => {
    try{
      const res = await axios.get(endpoints.COURSES, { headers })
      const list = (res.data || []).filter(c => (c.docentes||[]).some(d => d.id === docenteId || d.docente_id === docenteId))
      setAssignedCourses(list)
    }catch(err){ console.error('fetch assigned courses', err); setAssignedCourses([]) }
  }

  useEffect(()=>{ fetch() }, [])
  useEffect(()=>{ fetchCourses() }, [])

  const startEdit = (d) => { setEditingId(d.id); setForm({ nombre:d.nombre||'', especialidad:d.especialidad||'', bio:d.bio||'', email:d.email||'', foto_media_id: d.foto_media_id||'' }) }
  
  useEffect(()=>{ if (editingId) fetchAssignedCoursesFor(editingId) }, [editingId])
  const cancelEdit = () => { setEditingId(null); setForm({ nombre:'', especialidad:'', bio:'', email:'', foto_media_id: '' }) }

  const handleSave = async (e) => {
    e && e.preventDefault()
    setSaving(true); setError(null)
    try{
      const payload = { nombre: form.nombre, especialidad: form.especialidad, bio: form.bio, email: form.email, foto_media_id: form.foto_media_id || null }
      if (editingId){
        await axios.put(`${endpoints.DOCENTES}/${editingId}`, payload, { headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type':'application/json' } : {'Content-Type':'application/json'} })
      }else{
        await axios.post(endpoints.DOCENTES, payload, { headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type':'application/json' } : {'Content-Type':'application/json'} })
      }
      await fetch()
      cancelEdit()
    }catch(err){ console.error('save docente', err); setError('Error guardando docente') }
    finally{ setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Desactivar docente?')) return
    setSaving(true); setError(null)
    try{
      await axios.delete(`${endpoints.DOCENTES}/${id}`, { headers })
      await fetch()
    }catch(err){ console.error('delete docente', err); setError('Error desactivando docente') }
    finally{ setSaving(false) }
  }

  const handleAssignToCourse = async () => {
    if (!editingId) return setError('Selecciona un docente para asignar')
    if (!assignCourseId) return setError('Selecciona un curso')
    setSaving(true); setError(null)
    try{
      const payload = { docente_id: Number(editingId), rol: assignRole }
      await axios.post(endpoints.COURSE_DOCENTES(assignCourseId), payload, { headers })
      await fetchAssignedCoursesFor(editingId)
    }catch(err){ console.error('assign docente to course', err); setError('Error asignando docente al curso') }
    finally{ setSaving(false) }
  }

  const handleRemoveFromCourse = async (courseId) => {
    if (!editingId) return
    if (!confirm('Quitar docente del curso?')) return
    setSaving(true); setError(null)
    try{
      await axios.delete(`${endpoints.COURSE_DOCENTES(courseId)}/${editingId}`, { headers })
      await fetchAssignedCoursesFor(editingId)
    }catch(err){ console.error('remove docente from course', err); setError('Error removiendo del curso') }
    finally{ setSaving(false) }
  }

  return (
    <div className="container section-padding">
      <Link to="/admin" className="btn-back mb-3"><i className="bi bi-arrow-left"></i> Volver al Panel</Link>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Administrar Docentes</h3>
        <small className="text-muted">Crear, editar y desactivar docentes</small>
      </div>

      <div className="row">
        <div className="col-12 col-md-5">
          <div className="card mb-3">
            <div className="card-body">
              <h5 className="card-title">{editingId ? 'Editar docente' : 'Nuevo docente'}</h5>
              <form onSubmit={handleSave}>
                <div className="mb-2"><label className="form-label">Nombre</label><input className="form-control" value={form.nombre} onChange={e=>setForm(f=>({...f,nombre:e.target.value}))} required /></div>
                <div className="mb-2"><label className="form-label">Especialidad</label><input className="form-control" value={form.especialidad} onChange={e=>setForm(f=>({...f,especialidad:e.target.value}))} /></div>
                <div className="mb-2"><label className="form-label">Email</label><input className="form-control" type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} /></div>
                <div className="mb-2"><label className="form-label">Bio</label><textarea className="form-control" rows={3} value={form.bio} onChange={e=>setForm(f=>({...f,bio:e.target.value}))} /></div>
                <div className="mb-2"><label className="form-label">Foto (media id)</label><input className="form-control" value={form.foto_media_id} onChange={e=>setForm(f=>({...f,foto_media_id:e.target.value}))} /></div>
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="d-flex gap-2"><button className="btn btn-accent" type="submit" disabled={saving}>{saving ? 'Guardando...' : (editingId ? 'Guardar' : 'Crear')}</button><button type="button" className="btn btn-outline-secondary" onClick={cancelEdit}>Cancelar</button></div>
              </form>
            </div>
          </div>
          
            <div className="card mb-3">
              <div className="card-body">
                <h5 className="card-title">Asignar a curso</h5>
                {editingId ? (
                  <>
                    <div className="mb-2"><label className="form-label">Curso</label>
                      <select className="form-select" value={assignCourseId} onChange={e=>setAssignCourseId(e.target.value)}>
                        <option value="">-- selecciona --</option>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                      </select>
                    </div>
                    <div className="mb-2"><label className="form-label">Rol</label><input className="form-control" value={assignRole} onChange={e=>setAssignRole(e.target.value)} /></div>
                    <div className="d-flex gap-2"><button className="btn btn-accent" type="button" onClick={handleAssignToCourse} disabled={saving}>Asignar</button><button className="btn btn-outline-secondary" type="button" onClick={()=>{ setAssignCourseId(''); setAssignRole('Profesor') }}>Limpiar</button></div>

                    <hr />
                    <h6>Cursos donde está asignado</h6>
                    <div className="list-group">
                      {assignedCourses.map(c => (
                        <div key={c.id} className="list-group-item d-flex justify-content-between align-items-center">
                          <div>
                            <strong>{c.title}</strong>
                            <div className="text-muted small">{c.subtitle}</div>
                          </div>
                          <div><button className="btn btn-sm btn-danger" onClick={()=>handleRemoveFromCourse(c.id)}>Quitar</button></div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-muted">Selecciona un docente para ver o administrar sus cursos asignados.</div>
                )}
              </div>
            </div>
        </div>

        <div className="col-12 col-md-7">
          <h5>Docentes</h5>
          {loading && <div> Cargando...</div>}
          <div className="list-group">
            {items.map(d => (
              <div key={d.id} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <strong>{d.nombre}</strong>
                  <div className="text-muted small">{d.especialidad} {d.email && `· ${d.email}`}</div>
                </div>
                <div className="d-flex gap-2">
                  <button className="btn btn-sm btn-outline-primary" onClick={()=>startEdit(d)}>Editar</button>
                  <button className="btn btn-sm btn-danger" onClick={()=>handleDelete(d.id)}>Desactivar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
