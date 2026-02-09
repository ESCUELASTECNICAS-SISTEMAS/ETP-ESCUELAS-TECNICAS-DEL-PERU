import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { endpoints } from '../utils/apiStatic'
import { useNavigate } from 'react-router-dom'

export default function AdminCertificaciones(){
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState('')
  const [items, setItems] = useState([])
  const [editingCert, setEditingCert] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingCourses, setLoadingCourses] = useState(false)
  const [error, setError] = useState(null)

  const [form, setForm] = useState({
    titulo: 'Certificado de Finalización',
    descripcion: 'Certifica que el participante completó el curso X.',
    institucion_emisora: 'Instituto Técnico ETP',
    orden: 1
  })
  const [saving, setSaving] = useState(false)
  const [debug, setDebug] = useState({ tokenPresent:false, tokenPreview:'', claims:null, lastError:null })
  const [statusMsg, setStatusMsg] = useState('')

  useEffect(()=>{
    try{
      const raw = localStorage.getItem('etp_user')
      const user = raw ? JSON.parse(raw) : null
      if (!user || user.role !== 'administrador') navigate('/login')
    }catch(e){ navigate('/login') }
  }, [navigate])

  useEffect(()=>{
    // capture token/claims for debugging (do not expose full token)
    const t = localStorage.getItem('etp_token')
    if (t){
      let claims = null
      try{ claims = JSON.parse(atob(t.split('.')[1])) }catch(e){ claims = null }
      const preview = `${t.slice(0,8)}...${t.slice(-8)}`
      setDebug(d=>({ ...d, tokenPresent:true, tokenPreview: preview, claims }))
    } else setDebug(d=>({ ...d, tokenPresent:false, tokenPreview:'', claims:null }))
  }, [])

  useEffect(()=>{
    // fetch available courses to select (reuse same pattern as AdminCourses)
    const fetchCourses = async () => {
      setLoadingCourses(true)
      try{
        const token = localStorage.getItem('etp_token')
        const headers = token ? { Authorization: `Bearer ${token}` } : {}
        const res = await axios.get(endpoints.COURSES, { headers })
        setCourses(res.data || [])
        // auto-select first course if none selected
        if ((!selectedCourse || selectedCourse === '') && Array.isArray(res.data) && res.data.length > 0) {
          setSelectedCourse(String(res.data[0].id))
        }
      }catch(err){
        console.error('fetch courses', err)
      }finally{ setLoadingCourses(false) }
    }
    fetchCourses()
  }, [])

  useEffect(()=>{
    if (!selectedCourse) { setItems([]); return }
    const fetch = async () => {
      setLoading(true); setError(null)
      const token = localStorage.getItem('etp_token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const perCourseUrl = `${endpoints.COURSES}/${selectedCourse}/certificados`
      try{
        // Try per-course certificados endpoint
        const res = await axios.get(perCourseUrl, { headers })
        setItems(res.data || [])
      }catch(err){
        console.warn('per-course certificados fetch failed', err?.response?.status)
        // if not found, fetch course detail and read certificados from it as fallback
        if (err?.response?.status === 404){
          try{
            const courseRes = await axios.get(`${endpoints.COURSES}/${selectedCourse}`, { headers })
            const course = courseRes.data || {}
            const list = course?.certificados || []
            setItems(Array.isArray(list) ? list : [])
          }catch(e){
            console.error('fallback read course certificados', e)
            setError('No se pudieron leer las certificaciones desde el curso')
          }
        } else {
          setError(`Error cargando certificaciones: ${err?.response?.status || err.message}`)
        }
      }finally{ setLoading(false) }
    }
    fetch()
  }, [selectedCourse, courses])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!selectedCourse) { setError('Selecciona un curso primero'); return }
    setSaving(true); setError(null)
    const token = localStorage.getItem('etp_token')
    const headers = token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }
    const payload = {
      titulo: form.titulo,
      descripcion: form.descripcion || '',
      institucion_emisora: form.institucion_emisora || '',
      orden: Number(form.orden) || 0,
      active: true
    }
    // Primary: POST to /courses/:id/certificados
    try{
      const postUrl = `${endpoints.COURSES}/${selectedCourse}/certificados`
      setDebug(d=>({ ...d, lastError: null, lastRequest: { method: 'POST', url: postUrl, headers, payload } }))
      setStatusMsg('Enviando POST a /courses/:id/certificados...')
      const res = await axios.post(postUrl, payload, { headers })
      setStatusMsg(`OK — certificado creado (status ${res.status})`)
      setDebug(d=>({ ...d, lastResponse: { status: res.status, data: res.data } }))
      // refresh list from per-course endpoint
      try{
        const token2 = localStorage.getItem('etp_token')
        const headers2 = token2 ? { Authorization: `Bearer ${token2}` } : {}
        const listRes = await axios.get(`${endpoints.COURSES}/${selectedCourse}/certificados`, { headers: headers2 })
        setItems(listRes.data || [])
      }catch(e){
        // if listing fails, fetch course detail to read certificados
        try{
          const courseRes = await axios.get(`${endpoints.COURSES}/${selectedCourse}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
          const course = courseRes.data || {}
          setItems(course.certificados || [])
        }catch(e2){
          const resCourses = await axios.get(endpoints.COURSES, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
          setCourses(resCourses.data || [])
          const refreshedCourse = (resCourses.data || []).find(c => String(c.id) === String(selectedCourse))
          setItems(refreshedCourse?.certificados || [])
        }
      }
      setForm({ titulo: 'Certificado de Finalización', descripcion: 'Certifica que el participante completó el curso X.', institucion_emisora: 'Instituto Técnico ETP', orden: 1 })
      setSaving(false)
      return
    }catch(err){
      console.warn('POST per-course certificados failed', err?.response?.status)
      const status = err?.response?.status
      const body = err?.response?.data
      setDebug(d=>({ ...d, lastError: { status, body } }))
      if (status && status === 403){
        setError('403 - Permiso denegado. Revisa token/rol (administrador).')
        setSaving(false)
        return
      }
      // if 404, fallback to updating course.certificados via PUT
      if (!(status && status === 404)){
        setError(`Error creando certificado: ${status || err.message}`)
        setSaving(false)
        return
      }
    }

    // Fallback: update course.certificados via GET/PUT
    try{
      const tokenLocal = localStorage.getItem('etp_token')
      const headersLocal = tokenLocal ? { Authorization: `Bearer ${tokenLocal}` } : {}
      setStatusMsg('Obteniendo curso para fallback...')
      setDebug(d=>({ ...d, lastRequest: { method: 'GET', url: `${endpoints.COURSES}/${selectedCourse}`, headers: headersLocal } }))
      const getRes = await axios.get(`${endpoints.COURSES}/${selectedCourse}`, { headers: headersLocal })
      const course = getRes.data || {}
      const existing = Array.isArray(course.certificados) ? course.certificados : []
      const updated = [...existing, payload]
      const updatePayload = { ...course, certificados: updated }
      const putHeaders = token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }
      setDebug(d=>({ ...d, lastRequest: { method: 'PUT', url: `${endpoints.COURSES}/${selectedCourse}`, headers: putHeaders, payload: updatePayload } }))
      setStatusMsg('Enviando PUT de fallback...')
      const putRes = await axios.put(`${endpoints.COURSES}/${selectedCourse}`, updatePayload, { headers: putHeaders })
      setStatusMsg(`OK — fallback curso actualizado (status ${putRes.status})`)
      setDebug(d=>({ ...d, lastResponse: { status: putRes.status, data: putRes.data } }))
      // fetch course detail to get updated certificados
      try{
        const courseRes = await axios.get(`${endpoints.COURSES}/${selectedCourse}`, { headers: putHeaders })
        const course = courseRes.data || {}
        setItems(course.certificados || [])
      }catch(e){
        const resCourses = await axios.get(endpoints.COURSES, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
        setCourses(resCourses.data || [])
        const refreshedCourse = (resCourses.data || []).find(c => String(c.id) === String(selectedCourse))
        setItems(refreshedCourse?.certificados || [])
      }
      setForm({ titulo: 'Certificado de Finalización', descripcion: 'Certifica que el participante completó el curso X.', institucion_emisora: 'Instituto Técnico ETP', orden: 1 })
    }catch(err){
      console.error('fallback create failed', err)
      const status = err?.response?.status
      const body = err?.response?.data
      setDebug(d=>({ ...d, lastError: { status, body } }))
      if (status === 403) setError('403 - Permiso denegado. Revisa token/rol (administrador).')
      else setError(`Error creando certificación (fallback): ${status || err.message}`)
    }finally{ setSaving(false) }
  }

  const startEditCert = (cert) => {
    setEditingCert(cert)
  }

  const cancelEditCert = () => setEditingCert(null)

  const handleUpdateCert = async (e) => {
    e && e.preventDefault()
    if (!selectedCourse || !editingCert) return
    setSaving(true); setError(null); setStatusMsg('')
    const token = localStorage.getItem('etp_token')
    const headers = token ? { Authorization: `Bearer ${token}`, 'Content-Type':'application/json' } : { 'Content-Type':'application/json' }
    try{
      const url = `${endpoints.COURSES}/${selectedCourse}/certificados/${editingCert.id}`
      setStatusMsg('Enviando actualización del certificado...')
      const res = await axios.put(url, editingCert, { headers })
      setDebug(d=>({ ...d, lastRequest:{ method:'PUT', url, headers, payload: editingCert }, lastResponse: { status: res.status, data: res.data } }))
      // refresh course detail
      const courseRes = await axios.get(`${endpoints.COURSES}/${selectedCourse}`, { headers })
      setItems(courseRes.data?.certificados || [])
      setCourses(prev => prev.map(c => c.id === courseRes.data.id ? courseRes.data : c))
      setStatusMsg('Certificado actualizado')
      setEditingCert(null)
    }catch(err){
      const status = err?.response?.status
      const body = err?.response?.data
      setDebug(d=>({ ...d, lastError:{ status, body } }))
      if (status === 403) setError('403 - Permiso denegado para actualizar certificado')
      else setError(`Error actualizando certificado: ${status || err.message}`)
    }finally{ setSaving(false) }
  }

  const handleDeleteCert = async (certId) => {
    if (!selectedCourse || !certId) return
    if (!confirm('¿Desactivar este certificado?')) return
    setSaving(true); setError(null); setStatusMsg('')
    const token = localStorage.getItem('etp_token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    try{
      const url = `${endpoints.COURSES}/${selectedCourse}/certificados/${certId}`
      setStatusMsg('Enviando petición de desactivación...')
      const res = await axios.delete(url, { headers })
      setDebug(d=>({ ...d, lastRequest:{ method:'DELETE', url, headers }, lastResponse:{ status: res.status, data: res.data } }))
      // Backend performs soft-delete (active:false). Update UI to mark certificate inactive instead of removing it.
      const respActive = res.data?.active === undefined ? false : res.data.active
      setItems(prev => prev.map(it => it.id === certId ? { ...it, active: respActive } : it))
      setCourses(prev => prev.map(c => {
        if (String(c.id) !== String(selectedCourse)) return c
        return { ...c, certificados: (c.certificados || []).map(it => it.id === certId ? { ...it, active: respActive } : it) }
      }))
      setStatusMsg('Certificado desactivado')
    }catch(err){
      const status = err?.response?.status
      const body = err?.response?.data
      setDebug(d=>({ ...d, lastError:{ status, body } }))
      if (status === 403) setError('403 - Permiso denegado para desactivar certificado')
      else setError(`Error desactivando certificado: ${status || err.message}`)
    }finally{ setSaving(false) }
  }

  const handleReactivateCert = async (certId) => {
    if (!selectedCourse || !certId) return
    setSaving(true); setError(null); setStatusMsg('')
    const token = localStorage.getItem('etp_token')
    const headers = token ? { Authorization: `Bearer ${token}`, 'Content-Type':'application/json' } : { 'Content-Type':'application/json' }
    try{
      const url = `${endpoints.COURSES}/${selectedCourse}/certificados/${certId}`
      // send PUT with active:true to reactivate
      const res = await axios.put(url, { active: true }, { headers })
      setDebug(d=>({ ...d, lastRequest:{ method:'PUT', url, headers, payload:{ active:true } }, lastResponse:{ status: res.status, data: res.data } }))
      const respActive = res.data?.active === undefined ? true : res.data.active
      setItems(prev => prev.map(it => it.id === certId ? { ...it, active: respActive } : it))
      setCourses(prev => prev.map(c => {
        if (String(c.id) !== String(selectedCourse)) return c
        return { ...c, certificados: (c.certificados || []).map(it => it.id === certId ? { ...it, active: respActive } : it) }
      }))
      setStatusMsg('Certificado reactivado')
    }catch(err){
      const status = err?.response?.status
      const body = err?.response?.data
      setDebug(d=>({ ...d, lastError:{ status, body } }))
      if (status === 403) setError('403 - Permiso denegado para reactivar certificado')
      else setError(`Error reactivando certificado: ${status || err.message}`)
    }finally{ setSaving(false) }
  }

  return (
    <div className="container section-padding">
      <div className="row mb-3">
        <div className="col-12 d-flex justify-content-between align-items-center">
          <h3>Certificaciones por curso</h3>
          <p className="text-muted mb-0">Selecciona un curso para ver/crear sus certificaciones.</p>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-12 col-md-6">
          <label className="form-label">Curso</label>
            <div className="d-flex gap-2 align-items-center">
              <select className="form-select" value={selectedCourse} onChange={e=>setSelectedCourse(e.target.value)}>
                <option value="">-- Selecciona un curso --</option>
                {loadingCourses && <option>cargando...</option>}
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
              <button className="btn btn-outline-secondary" type="button" onClick={async ()=>{
                // force refresh of certificados for selected course
                if (!selectedCourse) return
                setLoading(true); setError(null)
                try{
                  const token = localStorage.getItem('etp_token')
                  const headers = token ? { Authorization: `Bearer ${token}` } : {}
                  const res = await axios.get(`${endpoints.COURSES}/${selectedCourse}`, { headers })
                  const course = res.data || {}
                  setItems(course.certificados || [])
                }catch(err){ console.error('refresh certificados', err); setError('No se pudo refrescar certificados') }
                finally{ setLoading(false) }
              }}>Refrescar</button>
            </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12 col-md-6">
          <div className="card mb-3">
            <div className="card-body">
              <h5 className="card-title">Crear nueva certificación</h5>
              <form onSubmit={handleCreate}>
                <div className="mb-3">
                  <label className="form-label">Título</label>
                  <input className="form-control" value={form.titulo} onChange={e=>setForm(f=>({...f,titulo:e.target.value}))} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Descripción</label>
                  <textarea className="form-control" rows={3} value={form.descripcion} onChange={e=>setForm(f=>({...f,descripcion:e.target.value}))} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Institución emisora</label>
                  <input className="form-control" value={form.institucion_emisora} onChange={e=>setForm(f=>({...f,institucion_emisora:e.target.value}))} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Orden</label>
                  <input type="number" className="form-control" value={form.orden} onChange={e=>setForm(f=>({...f,orden:e.target.value}))} />
                </div>
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="d-flex gap-2">
                  <button className="btn btn-accent" type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Crear'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6">
          <h5>Certificaciones</h5>
          {loading && <div className="text-muted">Cargando...</div>}
          {error && <div className="alert alert-danger">{error}</div>}
          {!loading && items.length === 0 && <div className="text-muted">No hay certificaciones para este curso.</div>}
          <div className="list-group">
            {items.map(it => (
              <div key={it.id || it.titulo} className="list-group-item">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <strong>{it.titulo || it.title} {it.active === false && <span className="badge bg-secondary ms-2">Inactivo</span>}</strong>
                    <div className="text-muted small">{it.descripcion || it.summary || ''}</div>
                    {it.institucion_emisora && <div className="text-muted small">Emite: {it.institucion_emisora}</div>}
                  </div>
                  <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-secondary" onClick={()=>startEditCert(it)} disabled={it.active === false}>Editar</button>
                    {it.active === false ? (
                      <button className="btn btn-sm btn-success" onClick={()=>handleReactivateCert(it.id)}>Reactivar</button>
                    ) : (
                      <button className="btn btn-sm btn-danger" onClick={()=>handleDeleteCert(it.id)}>Eliminar</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {editingCert && (
            <div className="card mt-3">
              <div className="card-body">
                <h6>Editar certificado</h6>
                <form onSubmit={handleUpdateCert}>
                  <div className="mb-2">
                    <label className="form-label">Título</label>
                    <input className="form-control" value={editingCert.titulo || ''} onChange={e=>setEditingCert(c=>({...c,titulo:e.target.value}))} />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Descripción</label>
                    <textarea className="form-control" rows={2} value={editingCert.descripcion || ''} onChange={e=>setEditingCert(c=>({...c,descripcion:e.target.value}))} />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Institución emisora</label>
                    <input className="form-control" value={editingCert.institucion_emisora || ''} onChange={e=>setEditingCert(c=>({...c,institucion_emisora:e.target.value}))} />
                  </div>
                  <div className="mb-2">
                    <label className="form-label">Orden</label>
                    <input type="number" className="form-control" value={editingCert.orden || 0} onChange={e=>setEditingCert(c=>({...c,orden: Number(e.target.value)}))} />
                  </div>
                  <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-primary" type="submit">Guardar</button>
                    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={cancelEditCert}>Cancelar</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="card mt-3">
            <div className="card-body small">
              <h6>Depuración (solo visible para admin)</h6>
              <div><strong>Token presente:</strong> {debug.tokenPresent ? 'sí' : 'no'}</div>
              {debug.tokenPresent && <div><strong>Token (preview):</strong> {debug.tokenPreview}</div>}
              {debug.claims && <div style={{maxHeight:120,overflow:'auto'}}><strong>Claims:</strong> <pre style={{whiteSpace:'pre-wrap',fontSize:12}}>{JSON.stringify(debug.claims,null,2)}</pre></div>}
              <div><strong>Curso seleccionado:</strong> {selectedCourse || '—'}</div>
              {debug.lastError && (
                <div className="mt-2">
                  <strong>Último error HTTP:</strong>
                  <div>Status: {debug.lastError.status}</div>
                  <div style={{maxHeight:160,overflow:'auto'}}><pre style={{whiteSpace:'pre-wrap',fontSize:12}}>{JSON.stringify(debug.lastError.body,null,2)}</pre></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
