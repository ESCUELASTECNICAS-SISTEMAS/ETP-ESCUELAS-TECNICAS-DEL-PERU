import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { endpoints } from '../../utils/apiStatic'

const EMPTY_FORM = {
  nombres: '',
  apellidos: '',
  dni: '',
  telefono: '',
  email: '',
  course_id: '',
  sucursal_id: '',
  modalidad_id: '',
  nota: '',
  active: true
}

function normalizeId(value){
  const n = Number(value)
  return Number.isFinite(n) ? n : undefined
}

function cleanPayload(raw){
  return Object.entries(raw).reduce((acc, [k, v]) => {
    if (v === '' || v === undefined || v === null) return acc
    acc[k] = v
    return acc
  }, {})
}

export default function PreinscripcionesManager(){
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({ active: 'true', course_id: '', sucursal_id: '', modalidad_id: '' })
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [lookups, setLookups] = useState({ courses: [], sucursales: [] })
  const [message, setMessage] = useState('')

  const headers = useMemo(() => {
    const token = localStorage.getItem('etp_token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }, [])

  const baseApi = useMemo(() => {
    if (endpoints.PRE_INSCRIPCIONES) return endpoints.PRE_INSCRIPCIONES
    const base = import.meta.env.VITE_API_BASE || 'http://localhost:3000'
    return `${base.replace(/\/$/, '')}/pre-inscripciones`
  }, [])

  useEffect(() => { loadLookups() }, [])
  useEffect(() => { fetchItems() }, [filters])

  async function loadLookups(){
    try{
      const [coursesRes, sucursalesRes] = await Promise.allSettled([
        axios.get(endpoints.COURSES),
        axios.get(endpoints.SUCURSALES)
      ])
      const courses = coursesRes.status === 'fulfilled' ? (coursesRes.value.data || []) : []
      const sucursales = sucursalesRes.status === 'fulfilled' ? (sucursalesRes.value.data || []) : []
      setLookups({ courses: Array.isArray(courses) ? courses : [], sucursales: Array.isArray(sucursales) ? sucursales : [] })
    }catch(e){
      console.warn('No se pudieron cargar catálogos', e)
    }
  }

  async function fetchItems(){
    setLoading(true); setError(null)
    try{
      const params = {}
      if (filters.active === 'true') params.active = true
      else if (filters.active === 'false') params.active = false
      else params.include_inactive = true
      if (filters.course_id) params.course_id = filters.course_id
      if (filters.sucursal_id) params.sucursal_id = filters.sucursal_id
      if (filters.modalidad_id) params.modalidad_id = filters.modalidad_id

      const res = await axios.get(baseApi, { headers, params })
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || [])
      setItems(data)
    }catch(err){
      console.error('fetch pre-inscripciones', err)
      setError('No se pudo cargar la lista. Revisa el endpoint /pre-inscripciones.')
    }finally{
      setLoading(false)
    }
  }

  function startEdit(item){
    setEditingId(item?.id || null)
    setForm({
      nombres: item?.nombres || '',
      apellidos: item?.apellidos || '',
      dni: item?.dni || '',
      telefono: item?.telefono || '',
      email: item?.email || '',
      course_id: item?.course_id || item?.course?.id || '',
      sucursal_id: item?.sucursal_id || item?.sucursal?.id || '',
      modalidad_id: item?.modalidad_id || item?.modalidad?.id || '',
      nota: item?.nota || item?.mensaje || item?.message || '',
      active: item?.active !== false
    })
    setMessage('Editando pre-inscripción existente')
  }

  function resetForm(){
    setEditingId(null)
    setForm(EMPTY_FORM)
    setMessage('')
  }

  async function handleSubmit(e){
    e.preventDefault()
    setSaving(true); setError(null)
    const payload = cleanPayload({
      nombres: form.nombres,
      apellidos: form.apellidos,
      dni: form.dni,
      telefono: form.telefono,
      email: form.email,
      course_id: normalizeId(form.course_id),
      sucursal_id: normalizeId(form.sucursal_id),
      modalidad_id: normalizeId(form.modalidad_id),
      nota: form.nota,
      active: form.active
    })

    try{
      if (editingId) {
        await axios.put(`${baseApi}/${editingId}`, payload, { headers })
        setMessage('Pre-inscripción actualizada')
      } else {
        await axios.post(baseApi, payload, { headers })
        setMessage('Pre-inscripción creada')
      }
      await fetchItems()
      resetForm()
    }catch(err){
      console.error('save pre-inscripcion', err)
      setError('No se pudo guardar. Revisa los campos requeridos y el endpoint.')
    }finally{ setSaving(false) }
  }

  async function handleDelete(item){
    if (!item?.id) return
    const ok = window.confirm('¿Marcar como eliminada esta pre-inscripción?')
    if (!ok) return
    setError(null)
    try{
      await axios.delete(`${baseApi}/${item.id}`, { headers })
      setMessage('Pre-inscripción marcada como eliminada')
      await fetchItems()
      if (editingId === item.id) resetForm()
    }catch(err){
      console.error('delete pre-inscripcion', err)
      setError('No se pudo eliminar. Verifica permisos o endpoint.')
    }
  }

  function displayCourseName(id){
    const found = lookups.courses.find(c => String(c.id) === String(id))
    return found ? (found.nombre || found.title || `Curso #${id}`) : (id ? `Curso #${id}` : '—')
  }

  function displaySucursalName(id){
    const found = lookups.sucursales.find(s => String(s.id) === String(id))
    return found ? (found.nombre || found.name || `Sucursal #${id}`) : (id ? `Sucursal #${id}` : '—')
  }

  return (
    <div className="row g-3 justify-content-center">
      <div className="col-12 col-xl-10">
        <div className="card h-100">
          <div className="card-body">
            <div className="d-flex align-items-center gap-3 mb-3">
              <h5 className="mb-0">Pre-inscripciones</h5>
              <button className="btn btn-sm btn-outline-secondary" onClick={fetchItems} disabled={loading}>Refrescar</button>
            </div>

            <div className="row g-2 align-items-end mb-3">
              <div className="col-6 col-md-3">
                <label className="form-label small text-muted">Estado</label>
                <select className="form-select form-select-sm" value={filters.active} onChange={e=>setFilters(f=>({ ...f, active: e.target.value }))}>
                  <option value="true">Solo activas</option>
                  <option value="false">Solo inactivas</option>
                  <option value="all">Todas</option>
                </select>
              </div>
              <div className="col-6 col-md-3">
                <label className="form-label small text-muted">Curso</label>
                <select className="form-select form-select-sm" value={filters.course_id} onChange={e=>setFilters(f=>({ ...f, course_id: e.target.value }))}>
                  <option value="">Todos</option>
                  {lookups.courses.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre || c.title || `ID ${c.id}`}</option>
                  ))}
                </select>
              </div>
              <div className="col-6 col-md-3">
                <label className="form-label small text-muted">Sucursal</label>
                <select className="form-select form-select-sm" value={filters.sucursal_id} onChange={e=>setFilters(f=>({ ...f, sucursal_id: e.target.value }))}>
                  <option value="">Todas</option>
                  {lookups.sucursales.map(s => (
                    <option key={s.id} value={s.id}>{s.nombre || s.name || `ID ${s.id}`}</option>
                  ))}
                </select>
              </div>
              <div className="col-6 col-md-3">
                <label className="form-label small text-muted">Modalidad ID</label>
                <input className="form-control form-control-sm" value={filters.modalidad_id} onChange={e=>setFilters(f=>({ ...f, modalidad_id: e.target.value }))} />
              </div>
            </div>

            {loading && <div className="text-muted">Cargando...</div>}
            {error && <div className="alert alert-danger py-2">{error}</div>}
            {message && <div className="alert alert-success py-2">{message}</div>}

            <div className="table-responsive" style={{ maxHeight: 460 }}>
              <table className="table table-sm align-middle">
                <thead className="table-light" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Contacto</th>
                    <th>Curso</th>
                    <th>Sucursal</th>
                    <th>Modalidad</th>
                    <th>Estado</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {(!items || !items.length) && !loading && (
                    <tr><td colSpan={8} className="text-muted">Sin resultados</td></tr>
                  )}
                  {items.map(item => {
                    const nombre = [item.nombre, item.apellido].filter(Boolean).join(' ') || [item.nombres, item.apellidos].filter(Boolean).join(' ') || '—';
                    const contacto = [item.celular || item.telefono, item.email].filter(Boolean).join(' / ') || '—';
                    const courseName = item.course?.title || item.course?.nombre || displayCourseName(item.course_id || item.course?.id);
                    const sucursalName = item.sucursal?.nombre || item.sucursal?.name || displaySucursalName(item.sucursal_id || item.sucursal?.id);
                    const mod = item.modalidad?.nombre || item.modalidad_id || '—';
                    const badge = item.active === false ? 'bg-secondary' : 'bg-success';
                    return (
                      <tr key={item.id || nombre}>
                        <td className="small">{item.id || '—'}</td>
                        <td className="small">{nombre}</td>
                        <td className="small">{contacto}</td>
                        <td className="small">{courseName}</td>
                        <td className="small">{sucursalName}</td>
                        <td className="small">{mod}</td>
                        <td><span className={`badge ${badge}`}>{item.active === false ? 'Inactiva' : 'Activa'}</span></td>
                        <td className="text-end">
                          <div className="btn-group btn-group-sm">
                            <button className="btn btn-outline-primary" onClick={()=>startEdit(item)}>Editar</button>
                            <button className="btn btn-outline-danger" onClick={()=>handleDelete(item)} disabled={item.active === false}>Eliminar</button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>


    </div>
  )
}
