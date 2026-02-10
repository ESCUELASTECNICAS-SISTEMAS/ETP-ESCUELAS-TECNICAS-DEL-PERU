import React, { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { endpoints } from '../utils/apiStatic'

export default function AdminCourses(){
  const [items, setItems] = useState([])
  const [mediaList, setMediaList] = useState([])
  const [loadingMedia, setLoadingMedia] = useState(true)
  const [showMediaPicker, setShowMediaPicker] = useState(false)
  const mediaPickerRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [form, setForm] = useState({
    title: '', subtitle: '', description: '', type: '', thumbnail_media_id: '', slug: '', published: true,
    hours: '', duration: '', grado: '', registro: '', perfil_egresado: '', mision: '', vision: '',
    modalidad: '', temario: ''
  })


  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [showInactive, setShowInactive] = useState(false)

  const token = localStorage.getItem('etp_token')

  // helpers to resolve media objects/urls from different possible API shapes
  const findMediaById = (id) => mediaList.find(x => String(x.id) === String(id))
  const getCourseMediaUrl = (course) => {
    if (!course) return null
    if (course.thumbnail && course.thumbnail.url) return course.thumbnail.url
    if (course.thumbnail_media_id) {
      const m = findMediaById(course.thumbnail_media_id)
      if (m && m.url) return m.url
    }
    if (course.media && course.media.url) return course.media.url
    return null
  }
  const getCourseMediaAlt = (course) => {
    if (!course) return ''
    if (course.thumbnail && course.thumbnail.alt_text) return course.thumbnail.alt_text
    if (course.thumbnail_media_id) {
      const m = findMediaById(course.thumbnail_media_id)
      if (m && m.alt_text) return m.alt_text
    }
    if (course.media && course.media.alt_text) return course.media.alt_text
    return ''
  }

  const fetchCourses = async () => {
    setLoading(true); setError(null)
    try{
      const res = await axios.get(endpoints.COURSES, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      setItems(res.data || [])
    }catch(err){ console.error('fetchCourses', err); setError('No se pudieron cargar cursos') }
    finally{ setLoading(false) }
  }

  const fetchMedia = async () => {
    setLoadingMedia(true)
    try{
      const res = await axios.get(endpoints.MEDIA, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      setMediaList(res.data || [])
    }catch(err){ console.error('fetchMedia', err) }
    finally{ setLoadingMedia(false) }
  }

  useEffect(()=>{ fetchCourses() }, [])
  useEffect(()=>{ fetchMedia() }, [])

  // close media picker on outside click
  useEffect(()=>{
    if(!showMediaPicker) return
    const onDoc = (e) => { if(mediaPickerRef.current && !mediaPickerRef.current.contains(e.target)) setShowMediaPicker(false) }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [showMediaPicker])

  const handleChange = (k,v) => setForm(f=>({...f,[k]:v}))

  const handleCreate = async (e) => {
    e && e.preventDefault()
    setError(null); setSaving(true)
    try{
      const payload = {
        title: form.title,
        subtitle: form.subtitle,
        description: form.description,
        type: form.type,
        thumbnail_media_id: form.thumbnail_media_id ? Number(form.thumbnail_media_id) : null,
        slug: form.slug,
        published: Boolean(form.published),
        hours: form.hours || null,
        duration: form.duration || null,
        modalidad: form.modalidad || null,
        temario: parseTemarioInput(form.temario),
        grado: form.grado || null,
        registro: form.registro || null,
        perfil_egresado: form.perfil_egresado || null,
        mision: form.mision || null,
        vision: form.vision || null,
        // docentes and schedules removed from course payload (managed elsewhere)
      }
      await axios.post(endpoints.COURSES, payload, { headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type':'application/json' } : {'Content-Type':'application/json'} })
      setForm({ 
        title: '', subtitle: '', description: '', type: '', thumbnail_media_id: '', slug: '', published: true,
        hours: '', duration: '', grado: '', registro: '', perfil_egresado: '', mision: '', vision: '',
        modalidad: '', temario: ''
      })
      await fetchCourses()
      await fetchMedia()
    }catch(err){ console.error('createCourse', err); setError('Error al crear curso') }
    finally{ setSaving(false) }
  }

  // render temario array (strings or section objects) back to editable text
  const renderTemarioToText = (arr) => {
    if (!arr) return ''
    if (!Array.isArray(arr)) return String(arr)
    // if array of strings, render each as '- item' per line
    if (arr.every(x => typeof x === 'string')) {
      return arr.map(s => `- ${s}`).join('\n')
    }
    // mixed or section objects
    return arr.map(el => {
      if (!el) return ''
      if (typeof el === 'string') return `- ${el}`
      if (el.title && Array.isArray(el.items)) {
        return [el.title, ...el.items.map(i => `- ${i}`)].join('\n')
      }
      return JSON.stringify(el)
    }).join('\n\n')
  }

  // parse temario input: try JSON, then structured text (subtitle + '- item'), then comma-separated
  const parseTemarioInput = (txt) => {
    if (!txt) return []
    try { const v = JSON.parse(txt); return Array.isArray(v) ? v : [v] } catch (e) {}
    const lines = txt.split(/\r?\n/).map(l=>l.replace(/\u00A0/g,' ').trim()).filter(Boolean)
    if (lines.length > 0) {
      const result = []
      let current = null
      for (let ln of lines) {
        if (/^[-*]\s+/.test(ln)) {
          const item = ln.replace(/^[-*]\s+/, '').trim()
          if (current) current.items.push(item)
          else result.push(item)
        } else {
          if (current) result.push(current)
          current = { title: ln, items: [] }
        }
      }
      if (current) result.push(current)
      if (result.length) return result
    }
    return txt.split(',').map(s=>s.trim()).filter(Boolean)
  }

  const startEdit = (c) => {
    setEditingId(c.id)
    setForm({
      title: c.title||'', subtitle: c.subtitle||'', description: c.description||'', type: c.type||'',
      thumbnail_media_id: c.thumbnail_media_id || (c.thumbnail && c.thumbnail.id) || '', slug: c.slug||'', published: !!c.published,
      hours: c.hours || '', duration: c.duration || '', grado: c.grado || '', registro: c.registro || '',
      perfil_egresado: c.perfil_egresado || '', mision: c.mision || '', vision: c.vision || '',
      modalidad: c.modalidad || '', temario: c.temario ? renderTemarioToText(c.temario) : '',
      // docentes and schedules removed from course edit form
    })
  }

  

  const cancelEdit = () => { 
    setEditingId(null); 
    setForm({ 
      title: '', subtitle: '', description: '', type: '', thumbnail_media_id: '', slug: '', published: true,
      hours: '', duration: '', grado: '', registro: '', perfil_egresado: '', mision: '', vision: '',
      modalidad: '', temario: ''
    }) 
  }

  const saveEdit = async (id) => {
    setSaving(true); setError(null)
    try{
      const payload = {
        title: form.title,
        subtitle: form.subtitle,
        description: form.description,
        type: form.type,
        thumbnail_media_id: form.thumbnail_media_id ? Number(form.thumbnail_media_id) : null,
        slug: form.slug,
        published: Boolean(form.published),
        hours: form.hours || null,
        duration: form.duration || null,
        modalidad: form.modalidad || null,
        temario: parseTemarioInput(form.temario),
        grado: form.grado || null,
        registro: form.registro || null,
        perfil_egresado: form.perfil_egresado || null,
        mision: form.mision || null,
        vision: form.vision || null,
        // docentes and schedules removed from course payload (managed elsewhere)
      }
      await axios.put(`${endpoints.COURSES}/${id}`, payload, { headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type':'application/json' } : {'Content-Type':'application/json'} })
      cancelEdit(); await fetchCourses(); await fetchMedia()
    }catch(err){ console.error('saveEdit', err); setError('Error al actualizar curso') }
    finally{ setSaving(false) }
  }

  const togglePublished = async (c) => {
    setError(null)
    try{
      await axios.put(`${endpoints.COURSES}/${c.id}`, { published: !c.published }, { headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type':'application/json' } : {'Content-Type':'application/json'} })
      await fetchCourses()
    }catch(err){ console.error('togglePublished', err); setError('No se pudo cambiar estado') }
  }

  const activeItems = items.filter(i => i.published)
  const inactiveItems = items.filter(i => !i.published)

  const formPreviewUrl = form.thumbnail_media_id ? (findMediaById(form.thumbnail_media_id)||{}).url : (editingId ? getCourseMediaUrl(items.find(i=>i.id===editingId)) : null)
  const formPreviewAlt = form.thumbnail_media_id ? (findMediaById(form.thumbnail_media_id)||{}).alt_text : (editingId ? getCourseMediaAlt(items.find(i=>i.id===editingId)) : '')

  

  return (
    <div className="container section-padding">
      <Link to="/admin" className="btn-back mb-3"><i className="bi bi-arrow-left"></i> Volver al Panel</Link>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Administrar Cursos</h3>
        <small className="text-muted">Crear y editar cursos de carreras auxiliares</small>
      </div>

      <div className="row">
        <div className="col-12 col-md-5">
          <div className="card mb-3 shadow-sm">
            <div className="card-header bg-white">
              <h5 className="card-title mb-0">{editingId ? 'Editar curso' : 'Nuevo curso'}</h5>
              <small className="text-muted">Rellena los datos y asigna una miniatura</small>
            </div>
            <div className="card-body">
              <form onSubmit={editingId ? (e=>{e.preventDefault(); saveEdit(editingId)}) : handleCreate}>
                <div className="mb-3">
                  <label className="form-label">Título</label>
                  <input className="form-control form-control-lg" value={form.title} onChange={e=>handleChange('title', e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Subtítulo</label>
                  <input className="form-control" value={form.subtitle} onChange={e=>handleChange('subtitle', e.target.value)} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Descripción</label>
                  <textarea className="form-control" rows={4} value={form.description} onChange={e=>handleChange('description', e.target.value)} />
                </div>
                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="form-label">Horas</label>
                    <input className="form-control" value={form.hours} onChange={e=>handleChange('hours', e.target.value)} />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Duración</label>
                    <input className="form-control" value={form.duration} onChange={e=>handleChange('duration', e.target.value)} />
                  </div>
                </div>
                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="form-label">Grado</label>
                    <input className="form-control" value={form.grado} onChange={e=>handleChange('grado', e.target.value)} />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Registro</label>
                    <input className="form-control" value={form.registro} onChange={e=>handleChange('registro', e.target.value)} />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Perfil de egresado</label>
                  <textarea className="form-control" rows={2} value={form.perfil_egresado} onChange={e=>handleChange('perfil_egresado', e.target.value)} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Misión</label>
                  <textarea className="form-control" rows={2} value={form.mision} onChange={e=>handleChange('mision', e.target.value)} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Visión</label>
                  <textarea className="form-control" rows={2} value={form.vision} onChange={e=>handleChange('vision', e.target.value)} />
                </div>
                <div className="row g-2 mb-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label">Tipo</label>
                    <input className="form-control" value={form.type} onChange={e=>handleChange('type', e.target.value)} placeholder="apoyo_administrativo" />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label">Slug</label>
                    <input className="form-control" value={form.slug} onChange={e=>handleChange('slug', e.target.value)} placeholder="apoyo-administrativo" />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Miniatura (media)</label>
                  <div className="d-flex align-items-center gap-2">
                      <div style={{position:'relative',width:'100%'}} ref={mediaPickerRef}>
                        <button type="button" className="form-select d-flex align-items-center justify-content-between" onClick={()=>setShowMediaPicker(v=>!v)}>
                          <span>{formPreviewUrl ? (formPreviewAlt || (`ID ${form.thumbnail_media_id || ''}`)) : '-- Ninguna --'}</span>
                          <span className="text-muted">▾</span>
                        </button>
                        <div style={{width:90,height:60,flex:'0 0 90px',position:'absolute',right:0,top:6,borderRadius:6,overflow:'hidden',border:'1px solid #e9ecef',background:'#fff'}}>
                          {form.thumbnail_media_id ? (
                              <img src={formPreviewUrl} alt={formPreviewAlt || 'preview'} style={{width:'100%',height:'100%',objectFit:'cover'}} />
                          ) : (
                            <div style={{display:'grid',placeItems:'center',height:'100%'}}><small className="text-muted">Sin miniatura</small></div>
                          )}
                        </div>
                        {showMediaPicker && (
                          <div style={{position:'absolute',zIndex:30,top:'48px',left:0,right:0,maxHeight:220,overflowY:'auto',border:'1px solid #e9ecef',background:'#fff',padding:8,borderRadius:6,boxShadow:'0 6px 18px rgba(0,0,0,0.08)'}}>
                            <div className="row g-2">
                              {loadingMedia && <div className="col-12 text-center text-muted">Cargando medias...</div>}
                              {!loadingMedia && mediaList.filter(m=>m.active).length === 0 && <div className="col-12 text-muted">No hay medias activas.</div>}
                              {mediaList.filter(m=>m.active).map(m => (
                                <div key={m.id} className="col-4">
                                  <button type="button" className="btn p-0 border-0" style={{width:'100%'}} onClick={()=>{ handleChange('thumbnail_media_id', m.id); setShowMediaPicker(false) }}>
                                    <div style={{width:'100%',height:64,overflow:'hidden',borderRadius:6}}>
                                      <img src={m.url} alt={m.alt_text||''} style={{width:'100%',height:'100%',objectFit:'cover'}} />
                                    </div>
                                    <div className="small text-truncate mt-1">{m.alt_text || m.id}</div>
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                  </div>
                </div>
                <div className="form-check form-switch mb-3">
                  <input className="form-check-input" type="checkbox" id="publishedSwitch" checked={form.published} onChange={e=>handleChange('published', e.target.checked)} />
                  <label className="form-check-label" htmlFor="publishedSwitch">Publicado</label>
                </div>
                
                
                <div className="mb-3">
                  <label className="form-label">Temario (Texto estructurado: subtítulo en una línea, luego líneas que comienzan con "- ")</label>
                  <textarea className="form-control" rows={8} value={form.temario} onChange={e=>handleChange('temario', e.target.value)} placeholder={'INTRODUCCIÓN A LAS HOJAS DE CÁLCULO\n- ¿Qué es una hoja de cálculo?\n- Elementos de la Interfaz de Excel\n'} />
                  <small className="text-muted">También acepta JSON array o coma-separado.</small>
                </div>
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="d-flex gap-2">
                  <button className="btn btn-accent" type="submit" disabled={saving}>{saving ? 'Guardando...' : (editingId ? 'Guardar' : 'Crear')}</button>
                  {editingId && <button type="button" className="btn btn-outline-secondary" onClick={cancelEdit}>Cancelar</button>}
                </div>
              </form>
            </div>
          </div>

          
        </div>

        <div className="col-12 col-md-7">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="card-title mb-0">Cursos</h5>
                <div>
                  <button className="btn btn-sm btn-outline-secondary me-2" onClick={()=>fetchCourses()}>Refrescar</button>
                  <button className="btn btn-sm btn-outline-primary" onClick={()=>setShowInactive(v=>!v)}>{showInactive ? 'Ocultar desactivados' : `Ver desactivados (${inactiveItems.length})`}</button>
                </div>
              </div>

              {loading && <div>Cargando...</div>}
              {!loading && items.length === 0 && <div className="text-muted">No hay cursos.</div>}

              <div className="row row-cols-1 gy-3">
                    {activeItems.map(c => (
                      <div key={c.id} className="col">
                        <div className="card shadow-sm">
                          <div className="card-body d-flex align-items-center gap-3">
                            {(() => {
                              const thumbUrl = getCourseMediaUrl(c)
                              const thumbAlt = getCourseMediaAlt(c)
                              if (thumbUrl) {
                                return (
                                  <div style={{width:120,height:76,flex:'0 0 120px',borderRadius:6,overflow:'hidden',border:'1px solid #e9ecef'}}>
                                    <img src={thumbUrl} alt={thumbAlt || 'thumb'} style={{width:'100%',height:'100%',objectFit:'cover'}} />
                                  </div>
                                )
                              }
                              return (
                                <div style={{width:120,height:76,flex:'0 0 120px',display:'grid',placeItems:'center',border:'1px dashed #e9ecef',borderRadius:6}}>
                                  <small className="text-muted">No miniatura</small>
                                </div>
                              )
                            })()}

                            <div style={{flex:1}}>
                              <div className="d-flex justify-content-between align-items-start">
                                <div>
                                  <h6 className="mb-1">{c.title}</h6>
                                  <div className="text-muted small">{c.subtitle}</div>
                                  <div className="text-muted small mt-1">{c.hours ? `Horas: ${c.hours}` : ''} {c.duration ? `· Duración: ${c.duration}` : ''}</div>
                                  {c.grado && <div className="badge badge-accent mt-2">{c.grado}</div>}
                                </div>
                                <div className="text-end">
                                  <div className="text-muted small">Tipo: {c.type}</div>
                                  <div className="text-muted small">Slug: {c.slug}</div>
                                  {c.registro && <div className="text-muted small">Registro: {c.registro}</div>}
                                </div>
                              </div>
                              {c.perfil_egresado && <div className="mt-2"><strong>Perfil egresado:</strong> <div className="text-muted small">{c.perfil_egresado}</div></div>}
                            </div>

                            <div className="d-flex flex-column align-items-end">
                              <button className="btn btn-sm btn-outline-primary mb-2" onClick={()=>startEdit(c)}>Editar</button>
                              <button className="btn btn-sm btn-outline-warning" onClick={()=>togglePublished(c)}>{c.published ? 'Despublicar' : 'Publicar'}</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

              {showInactive && (
                <div className="mt-3">
                  <h6>Desactivados</h6>
                  <div className="list-group list-group-flush">
                    {inactiveItems.map(c => (
                      <div key={`inactive-${c.id}`} className="list-group-item" style={{opacity:0.6}}>
                        <div className="d-flex align-items-center">
                          <div style={{flex:1}}>
                            <strong>{c.title}</strong>
                            <div className="text-muted small">{c.subtitle}</div>
                          </div>
                          <div>
                            <button className="btn btn-sm btn-outline-primary me-2" onClick={()=>startEdit(c)}>Editar</button>
                            <button className="btn btn-sm btn-outline-success" onClick={()=>togglePublished(c)}>Publicar</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
