import React, { useEffect, useMemo, useState, useCallback } from 'react'
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
  active: true,
  atendido: false
}

function normalizeId(value) {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? n : undefined
}

function cleanPayload(raw) {
  return Object.entries(raw).reduce((acc, [k, v]) => {
    if (v === '' || v === undefined || v === null) return acc
    acc[k] = v
    return acc
  }, {})
}

export default function PreinscripcionesManager() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({ active: 'true', course_id: '', sucursal_id: '', modalidad_id: '', atendido: '' })
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [lookups, setLookups] = useState({ courses: [], sucursales: [] })
  const [message, setMessage] = useState('')
  const [showForm, setShowForm] = useState(false)

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

  const filteredItems = useMemo(() => {
    const activeFilter = filters.active // 'true' | 'false' | 'all'
    const atendidoFilter = filters.atendido // '' | 'true' | 'false'
    const courseId = normalizeId(filters.course_id)
    const sucursalId = normalizeId(filters.sucursal_id)
    const modalidadId = normalizeId(filters.modalidad_id)

    return (items || []).filter((it) => {
      // Estado activo/inactivo
      if (activeFilter === 'true' && it?.active === false) return false
      if (activeFilter === 'false' && it?.active !== false) return false

      // Atendido (boolean)
      if (atendidoFilter === 'true' && it?.atendido !== true) return false
      if (atendidoFilter === 'false' && it?.atendido === true) return false

      // Curso
      if (courseId) {
        const itCourseId = normalizeId(it?.course_id ?? it?.course?.id)
        if (itCourseId !== courseId) return false
      }

      // Sucursal
      if (sucursalId) {
        const itSucursalId = normalizeId(it?.sucursal_id ?? it?.sucursal?.id)
        if (itSucursalId !== sucursalId) return false
      }

      // Modalidad
      if (modalidadId) {
        const itModalidadId = normalizeId(it?.modalidad_id ?? it?.modalidad?.id)
        if (itModalidadId !== modalidadId) return false
      }

      return true
    })
  }, [items, filters])

  async function loadLookups() {
    try {
      const [coursesRes, sucursalesRes] = await Promise.allSettled([
        axios.get(endpoints.COURSES),
        axios.get(endpoints.SUCURSALES)
      ])
      const courses = coursesRes.status === 'fulfilled' ? (coursesRes.value.data || []) : []
      const sucursales = sucursalesRes.status === 'fulfilled' ? (sucursalesRes.value.data || []) : []
      setLookups({ courses: Array.isArray(courses) ? courses : [], sucursales: Array.isArray(sucursales) ? sucursales : [] })
    } catch (e) {
      console.warn('No se pudieron cargar catálogos', e)
    }
  }

  async function fetchItems() {
    setLoading(true)
    setError(null)
    try {
      // Construir parámetros correctamente según el backend
      const params = {}
      
      // Filtro de estado activo/inactivo
      if (filters.active === 'true') {
        params.active = true
      } else if (filters.active === 'false') {
        params.active = false
      } else if (filters.active === 'all') {
        // Para todas, no enviar el parámetro active o enviar null/undefined
        // Algunos backends usan include_inactive=true
        params.include_inactive = true
      }
      
      // Filtro por curso
      if (filters.course_id && filters.course_id !== '') {
        params.course_id = parseInt(filters.course_id)
      }
      
      // Filtro por sucursal
      if (filters.sucursal_id && filters.sucursal_id !== '') {
        params.sucursal_id = parseInt(filters.sucursal_id)
      }
      

      // Filtro por modalidad
      if (filters.modalidad_id && filters.modalidad_id !== '') {
        params.modalidad_id = parseInt(filters.modalidad_id)
      }

      // Filtro por atendido
      if (filters.atendido !== undefined && filters.atendido !== '') {
        if (filters.atendido === 'true') params.atendido = true
        else if (filters.atendido === 'false') params.atendido = false
      }

      console.log('Enviando parámetros:', params) // Para debug

      const res = await axios.get(baseApi, { headers, params })
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || [])
      setItems(data)
    } catch (err) {
      console.error('fetch pre-inscripciones', err)
      setError('No se pudo cargar la lista. Revisa el endpoint /pre-inscripciones.')
    } finally {
      setLoading(false)
    }
  }

  // Función para limpiar filtros
  const clearFilters = useCallback(() => {
    setFilters({
      active: 'true',
      course_id: '',
      sucursal_id: '',
      modalidad_id: '',
      atendido: ''
    })
    setMessage('🔄 Filtros restablecidos')
    setTimeout(() => setMessage(''), 3000)
  }, [])

  const handleAtendidoToggle = useCallback(async (item, newAtendidoValue) => {
    try {
      setItems(prev => prev.map(it => 
        it.id === item.id ? { ...it, atendido: newAtendidoValue } : it
      ))
      
      await axios.put(`${baseApi}/${item.id}`, { atendido: newAtendidoValue }, { headers })
      
      setMessage(`✅ Pre-inscripción ${newAtendidoValue ? 'marcada como atendida' : 'marcada como no atendida'}`)
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      console.error('Error actualizando estado atendido', err)
      setItems(prev => prev.map(it => 
        it.id === item.id ? { ...it, atendido: !newAtendidoValue } : it
      ))
      setError('❌ No se pudo actualizar el estado atendido')
      setTimeout(() => setError(null), 3000)
    }
  }, [baseApi, headers])

  function startEdit(item) {
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
      active: item?.active !== false,
      atendido: item?.atendido === true
    })
    setShowForm(true)
    setMessage('✏️ Editando pre-inscripción')
    setTimeout(() => setMessage(''), 3000)
  }

  function resetForm() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setShowForm(false)
    setMessage('')
  }

  function openNewForm() {
    resetForm()
    setShowForm(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
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
      active: form.active,
      atendido: form.atendido === true
    })

    try {
      if (editingId) {
        await axios.put(`${baseApi}/${editingId}`, payload, { headers })
        setMessage('✅ Pre-inscripción actualizada exitosamente')
      } else {
        await axios.post(baseApi, payload, { headers })
        setMessage('✅ Pre-inscripción creada exitosamente')
      }
      await fetchItems()
      resetForm()
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      console.error('save pre-inscripcion', err)
      setError('❌ No se pudo guardar. Verifica los campos requeridos.')
      setTimeout(() => setError(null), 5000)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(item) {
    if (!item?.id) return
    const ok = window.confirm('¿Estás seguro de marcar como eliminada esta pre-inscripción?')
    if (!ok) return
    setError(null)
    try {
      await axios.delete(`${baseApi}/${item.id}`, { headers })
      setMessage('🗑️ Pre-inscripción marcada como eliminada')
      await fetchItems()
      if (editingId === item.id) resetForm()
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      console.error('delete pre-inscripcion', err)
      setError('❌ No se pudo eliminar. Verifica permisos.')
      setTimeout(() => setError(null), 5000)
    }
  }

  function displayCourseName(id) {
    const found = lookups.courses.find(c => String(c.id) === String(id))
    return found ? (found.nombre || found.title || `Curso #${id}`) : (id ? `Curso #${id}` : '—')
  }

  function displaySucursalName(id) {
    const found = lookups.sucursales.find(s => String(s.id) === String(id))
    return found ? (found.nombre || found.name || `Sucursal #${id}`) : (id ? `Sucursal #${id}` : '—')
  }

  return (
    <div className="container-fluid px-4 py-3">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="mb-1 fw-bold">📋 Pre-inscripciones</h3>
          <p className="text-muted mb-0 small">Gestión de solicitudes de inscripción</p>
        </div>
        <button 
          className="btn btn-primary shadow-sm"
          onClick={openNewForm}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Nueva Pre-inscripción
        </button>
      </div>

      {/* Alertas */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show shadow-sm" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}
      {message && (
        <div className="alert alert-success alert-dismissible fade show shadow-sm" role="alert">
          <i className="bi bi-check-circle-fill me-2"></i>
          {message}
          <button type="button" className="btn-close" onClick={() => setMessage('')}></button>
        </div>
      )}

      {/* Filtros */}
      <div className="card shadow-sm mb-4 border-0">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex align-items-center">
              <i className="bi bi-funnel-fill me-2 text-primary"></i>
              <h6 className="mb-0 fw-semibold">Filtros de búsqueda</h6>
            </div>
            <button 
              className="btn btn-sm btn-outline-secondary"
              onClick={clearFilters}
            >
              <i className="bi bi-arrow-repeat me-1"></i>
              Limpiar filtros
            </button>
          </div>
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label small fw-semibold">
                <i className="bi bi-toggle-on me-1"></i>Estado
              </label>
              <select 
                className="form-select form-select-sm" 
                value={filters.active} 
                onChange={e => setFilters(f => ({ ...f, active: e.target.value }))}
              >
                <option value="true">✅ Solo activas</option>
                <option value="false">⛔ Solo inactivas</option>
                <option value="all">📊 Todas (activas e inactivas)</option>
              </select>
              <small className="text-muted">Filtra por estado activo/inactivo</small>
            </div>
            <div className="col-md-3">
              <label className="form-label small fw-semibold">
                <i className="bi bi-person-check me-1"></i>Atendido
              </label>
              <select
                className="form-select form-select-sm"
                value={filters.atendido}
                onChange={e => setFilters(f => ({ ...f, atendido: e.target.value }))}
              >
                <option value="">👤 Todos</option>
                <option value="true">✓ Atendidos</option>
                <option value="false">○ Pendientes</option>
              </select>
              <small className="text-muted">Filtra por estado de atención</small>
            </div>
            <div className="col-md-3">
              <label className="form-label small fw-semibold">
                <i className="bi bi-book me-1"></i>Curso
              </label>
              <select 
                className="form-select form-select-sm" 
                value={filters.course_id} 
                onChange={e => setFilters(f => ({ ...f, course_id: e.target.value }))}
              >
                <option value="">📚 Todos los cursos</option>
                {lookups.courses.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre || c.title || `ID ${c.id}`}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label small fw-semibold">
                <i className="bi bi-building me-1"></i>Sucursal
              </label>
              <select 
                className="form-select form-select-sm" 
                value={filters.sucursal_id} 
                onChange={e => setFilters(f => ({ ...f, sucursal_id: e.target.value }))}
              >
                <option value="">🏢 Todas las sucursales</option>
                {lookups.sucursales.map(s => (
                  <option key={s.id} value={s.id}>{s.nombre || s.name || `ID ${s.id}`}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label small fw-semibold">
                <i className="bi bi-grid me-1"></i>Modalidad ID
              </label>
              <input 
                type="number"
                className="form-control form-control-sm" 
                value={filters.modalidad_id} 
                onChange={e => setFilters(f => ({ ...f, modalidad_id: e.target.value }))}
                placeholder="🔢 ID de modalidad"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de datos */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          <div className="table-responsive" style={{ maxHeight: '500px' }}>
            <table className="table table-hover mb-0">
              <thead className="table-light sticky-top">
                <tr>
                  <th className="small fw-semibold" style={{ width: '5%' }}>ID</th>
                  <th className="small fw-semibold" style={{ width: '15%' }}>Nombre completo</th>
                  <th className="small fw-semibold" style={{ width: '15%' }}>Contacto</th>
                  <th className="small fw-semibold" style={{ width: '15%' }}>Curso</th>
                  <th className="small fw-semibold" style={{ width: '12%' }}>Sucursal</th>
                  <th className="small fw-semibold" style={{ width: '8%' }}>Modalidad</th>
                  <th className="small fw-semibold" style={{ width: '8%' }}>Estado</th>
                  <th className="small fw-semibold" style={{ width: '12%' }}>Atendido</th>
                  <th className="small fw-semibold" style={{ width: '10%' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan="9" className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                      </div>
                      <p className="text-muted mt-2 mb-0">Cargando pre-inscripciones...</p>
                    </td>
                  </tr>
                )}
                {!loading && (!items || items.length === 0) && (
                  <tr>
                    <td colSpan="9" className="text-center py-5">
                      <i className="bi bi-inbox display-4 text-muted"></i>
                      <p className="text-muted mt-2 mb-0">No hay pre-inscripciones registradas</p>
                      <button className="btn btn-sm btn-primary mt-3" onClick={openNewForm}>
                        <i className="bi bi-plus-circle me-1"></i>
                        Crear primera pre-inscripción
                      </button>
                    </td>
                  </tr>
                )}
                {!loading && items?.length > 0 && filteredItems.length === 0 && (
                  <tr>
                    <td colSpan="9" className="text-center py-5">
                      <i className="bi bi-funnel display-4 text-muted"></i>
                      <p className="text-muted mt-2 mb-0">No hay resultados con los filtros actuales</p>
                      <button className="btn btn-sm btn-outline-secondary mt-3" onClick={clearFilters}>
                        <i className="bi bi-arrow-repeat me-1"></i>
                        Limpiar filtros
                      </button>
                    </td>
                  </tr>
                )}
                {!loading && filteredItems.map(item => {
                  const nombre = [item.nombre, item.apellido].filter(Boolean).join(' ') || 
                                [item.nombres, item.apellidos].filter(Boolean).join(' ') || '—';
                  const contacto = [item.celular || item.telefono, item.email].filter(Boolean).join(' / ') || '—';
                  const courseName = item.course?.title || item.course?.nombre || displayCourseName(item.course_id || item.course?.id);
                  const sucursalName = item.sucursal?.nombre || item.sucursal?.name || displaySucursalName(item.sucursal_id || item.sucursal?.id);
                  const mod = item.modalidad?.nombre || item.modalidad_id || '—';
                  
                  return (
                    <tr key={item.id} className="align-middle">
                      <td className="small fw-medium text-muted">#{item.id || '—'}</td>
                      <td className="small fw-semibold">{nombre}</td>
                      <td className="small">
                        <div>{item.telefono || item.celular || '—'}</div>
                        <small className="text-muted">{item.email || '—'}</small>
                      </td>
                      <td className="small">{courseName}</td>
                      <td className="small">{sucursalName}</td>
                      <td className="small">{mod}</td>
                      <td>
                        <span className={`badge ${item.active === false ? 'bg-secondary' : 'bg-success'} px-2 py-1`}>
                          {item.active === false ? 'Inactiva' : 'Activa'}
                        </span>
                      </td>
                      <td>
                        <div className="form-check form-switch d-flex align-items-center gap-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            id={`atendidoSwitch${item.id}`}
                            checked={!!item.atendido}
                            onChange={(e) => {
                              e.stopPropagation()
                              handleAtendidoToggle(item, e.target.checked)
                            }}
                          />
                          <label 
                            className={`form-check-label small ${item.atendido ? 'text-success fw-semibold' : 'text-muted'}`} 
                            htmlFor={`atendidoSwitch${item.id}`}
                            style={{ cursor: 'pointer' }}
                          >
                            {item.atendido ? '✓ Atendido' : '○ Pendiente'}
                          </label>
                        </div>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button 
                            className="btn btn-outline-primary" 
                            onClick={() => startEdit(item)}
                            title="Editar"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button 
                            className="btn btn-outline-danger" 
                            onClick={() => handleDelete(item)} 
                            disabled={item.active === false}
                            title={item.active === false ? "No disponible" : "Eliminar"}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
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

      {/* Modal de formulario */}
      {showForm && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content shadow-lg border-0">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-semibold">
                  <i className="bi bi-person-plus-fill me-2"></i>
                  {editingId ? '✏️ Editar Pre-inscripción' : '➕ Nueva Pre-inscripción'}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={resetForm}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">
                        <i className="bi bi-person me-1"></i>Nombres *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={form.nombres}
                        onChange={e => setForm({ ...form, nombres: e.target.value })}
                        required
                        placeholder="Ingrese los nombres"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">
                        <i className="bi bi-person me-1"></i>Apellidos *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={form.apellidos}
                        onChange={e => setForm({ ...form, apellidos: e.target.value })}
                        required
                        placeholder="Ingrese los apellidos"
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold small">
                        <i className="bi bi-credit-card me-1"></i>DNI *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={form.dni}
                        onChange={e => setForm({ ...form, dni: e.target.value })}
                        required
                        placeholder="Número de documento"
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold small">
                        <i className="bi bi-telephone me-1"></i>Teléfono *
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        value={form.telefono}
                        onChange={e => setForm({ ...form, telefono: e.target.value })}
                        required
                        placeholder="Número de contacto"
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold small">
                        <i className="bi bi-envelope me-1"></i>Email *
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        required
                        placeholder="correo@ejemplo.com"
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold small">
                        <i className="bi bi-book me-1"></i>Curso *
                      </label>
                      <select
                        className="form-select"
                        value={form.course_id}
                        onChange={e => setForm({ ...form, course_id: e.target.value })}
                        required
                      >
                        <option value="">Seleccione un curso</option>
                        {lookups.courses.map(c => (
                          <option key={c.id} value={c.id}>{c.nombre || c.title || `ID ${c.id}`}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold small">
                        <i className="bi bi-building me-1"></i>Sucursal *
                      </label>
                      <select
                        className="form-select"
                        value={form.sucursal_id}
                        onChange={e => setForm({ ...form, sucursal_id: e.target.value })}
                        required
                      >
                        <option value="">Seleccione una sucursal</option>
                        {lookups.sucursales.map(s => (
                          <option key={s.id} value={s.id}>{s.nombre || s.name || `ID ${s.id}`}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold small">
                        <i className="bi bi-grid me-1"></i>Modalidad ID
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={form.modalidad_id}
                        onChange={e => setForm({ ...form, modalidad_id: e.target.value })}
                        placeholder="ID de modalidad"
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold small">
                        <i className="bi bi-chat me-1"></i>Nota / Mensaje
                      </label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={form.nota}
                        onChange={e => setForm({ ...form, nota: e.target.value })}
                        placeholder="Información adicional o nota"
                      />
                    </div>
                    <div className="col-md-6">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="activeCheck"
                          checked={form.active}
                          onChange={e => setForm({ ...form, active: e.target.checked })}
                        />
                        <label className="form-check-label" htmlFor="activeCheck">
                          <i className="bi bi-check-circle me-1"></i>Activo
                        </label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="atendidoCheck"
                          checked={form.atendido}
                          onChange={e => setForm({ ...form, atendido: e.target.checked })}
                        />
                        <label className="form-check-label" htmlFor="atendidoCheck">
                          <i className="bi bi-check2-all me-1"></i>Atendido
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={resetForm}>
                    <i className="bi bi-x-circle me-1"></i>Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-save me-1"></i>
                        {editingId ? 'Actualizar' : 'Crear'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}