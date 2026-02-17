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
  const [showHorariosPicker, setShowHorariosPicker] = useState(false)
  const horariosPickerRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [form, setForm] = useState({
    title: '', subtitle: '', description: '', type: '', thumbnail_media_id: '', slug: '', published: true,
    hours: '', duration: '', grado: '', registro: '', perfil_egresado: '', mision: '', vision: '',
    razones_para_estudiar: '', publico_objetivo: '',
    modalidad: '', temario: '', horarios_media_id: ''
  })


  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [showInactive, setShowInactive] = useState(false)
  const [schedulesUploadLoading, setSchedulesUploadLoading] = useState(false)
  const createEmptyGrid = () => {
    const days = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo']
    const grid = {}
    days.forEach(d => {
      grid[d] = { manana: { ranges: [], aula: '' }, tarde: { ranges: [], aula: '' }, noche: { ranges: [], aula: '' } }
    })
    return grid
  }
  const [scheduleGrid, setScheduleGrid] = useState(createEmptyGrid())
  const [temarioUnits, setTemarioUnits] = useState([]) // unidades didácticas structured

  // helpers to manage unidades didácticas
  const addUnit = () => setTemarioUnits(u => ([...u, { orden: u.length + 1, nivel: '', titulo: '', temas: [] }]))
  const removeUnit = (idx) => setTemarioUnits(u => u.filter((_,i) => i !== idx).map((unit,i) => ({ ...unit, orden: i+1 })))
  const updateUnitField = (idx, field, value) => setTemarioUnits(u => u.map((unit,i) => i===idx ? { ...unit, [field]: value } : unit))
  const addTema = (unitIdx) => setTemarioUnits(u => u.map((unit,i) => i===unitIdx ? { ...unit, temas: [...(unit.temas||[]), { titulo: '', subtemas: [] }] } : unit))
  const removeTema = (unitIdx, temaIdx) => setTemarioUnits(u => u.map((unit,i) => {
    if (i!==unitIdx) return unit
    const temas = (unit.temas||[]).filter((_,t) => t !== temaIdx)
    return { ...unit, temas }
  }))
  const updateTemaField = (unitIdx, temaIdx, field, value) => setTemarioUnits(u => u.map((unit,i) => {
    if (i!==unitIdx) return unit
    const temas = (unit.temas||[]).map((t,ti) => ti===temaIdx ? { ...t, [field]: value } : t)
    return { ...unit, temas }
  }))
  const addSubtema = (unitIdx, temaIdx) => setTemarioUnits(u => u.map((unit,i) => {
    if (i!==unitIdx) return unit
    const temas = (unit.temas||[]).map((t,ti) => ti===temaIdx ? { ...t, subtemas: [...(t.subtemas||[]), ''] } : t)
    return { ...unit, temas }
  }))
  const updateSubtema = (unitIdx, temaIdx, subIdx, value) => setTemarioUnits(u => u.map((unit,i) => {
    if (i!==unitIdx) return unit
    const temas = (unit.temas||[]).map((t,ti) => {
      if (ti!==temaIdx) return t
      const subs = (t.subtemas||[]).map((s,si) => si===subIdx ? value : s)
      return { ...t, subtemas: subs }
    })
    return { ...unit, temas }
  }))
  const removeSubtema = (unitIdx, temaIdx, subIdx) => setTemarioUnits(u => u.map((unit,i) => {
    if (i!==unitIdx) return unit
    const temas = (unit.temas||[]).map((t,ti) => {
      if (ti!==temaIdx) return t
      const subs = (t.subtemas||[]).filter((s,si) => si!==subIdx)
      return { ...t, subtemas: subs }
    })
    return { ...unit, temas }
  }))

  const sanitizeTemarioForSend = (units) => {
    if (!Array.isArray(units)) return []
    return units.map(u => ({
      orden: u.orden || null,
      nivel: u.nivel || '',
      titulo: u.titulo || '',
      temas: Array.isArray(u.temas) ? u.temas.map(t => ({ titulo: t.titulo || '', subtemas: Array.isArray(t.subtemas) ? t.subtemas : [] })) : []
    }))
  }

  const collectItemsFromGrid = () => {
    const items = []
    const days = Object.keys(scheduleGrid || {})
    for (const day of days) {
      for (const turno of ['manana','tarde','noche']) {
        const cell = (scheduleGrid && scheduleGrid[day] && scheduleGrid[day][turno]) ? scheduleGrid[day][turno] : { ranges: [], aula: '' }
        const ranges = Array.isArray(cell.ranges) ? cell.ranges : []
        for (const r of ranges) {
          // r can be a string (legacy) or an object { text, id }
          const raw = (typeof r === 'string') ? r : (r.text || r.range || '')
          const parts = String(raw).split(/-|–|—/).map(p => p.trim())
          const hora_inicio = parts[0] || ''
          const hora_fin = parts[1] || ''
          const id = (typeof r === 'object' && r.id) ? r.id : undefined
          if (hora_inicio) items.push({ id, dia: day, turno: turno, hora_inicio, hora_fin, aula: cell.aula || '' })
        }
      }
    }
    return items
  }

  const deleteAllSchedulesForCourse = async (courseId) => {
    try{
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      // 1) traer los horarios REALES del servidor (no del estado local que puede estar desactualizado)
      const res = await axios.get(`${endpoints.COURSES}/${courseId}`, { headers })
      const allSchedules = (res.data && Array.isArray(res.data.schedules)) ? res.data.schedules : []
      // solo desactivar los que aún están activos
      const serverSchedules = allSchedules.filter(s => s.active !== false)
      console.log('deleteAllSchedulesForCourse: encontrados activos en servidor', serverSchedules.length, 'horarios')
      if (!serverSchedules.length) return
      // 2) borrar en paralelo (lotes de 20 para no saturar servidor)
      const BATCH_SIZE = 20
      const validSchedules = serverSchedules.filter(s => s.id)
      for (let i = 0; i < validSchedules.length; i += BATCH_SIZE) {
        const batch = validSchedules.slice(i, i + BATCH_SIZE)
        await Promise.allSettled(batch.map(s =>
          axios.delete(`${endpoints.COURSE_SCHEDULES(courseId)}/${s.id}`, { headers })
            .then(() => console.log('deleted schedule', s.id))
            .catch(e => console.error('delete schedule failed', s.id, e?.response?.status, e?.response?.data))
        ))
      }
    }catch(e){ console.error('deleteAllSchedulesForCourse', e) }
  }

  // Subir SOLO horarios nuevos (sin id) — los que el usuario agregó en esta sesión de edición
  const uploadOnlyNewSchedules = async (courseId) => {
    const allItems = collectItemsFromGrid()
    // filtrar: solo los que NO tienen id (nuevos, agregados via "Agregar rango")
    const newItems = allItems.filter(it => !it.id)
    if (!newItems.length) return
    try{
      const normalizeTime = (t) => {
        if (!t) return null
        const s = String(t).trim()
        if (/^\d{2}:\d{2}$/.test(s)) return `${s}:00`
        return s
      }
      const normalizeTurno = (v) => {
        if (!v) return ''
        const s = String(v).toLowerCase()
        if (s.includes('man')) return 'Mañana'
        if (s.includes('tar')) return 'Tarde'
        if (s.includes('noc')) return 'Noche'
        return v
      }
      const normalizeDia = (d) => {
        if (!d) return d
        const s = String(d).toLowerCase()
        const map = { lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles', miércoles: 'Miércoles', jueves: 'Jueves', viernes: 'Viernes', sabado: 'Sábado', sábado: 'Sábado', domingo: 'Domingo' }
        return map[s] || (d.charAt(0).toUpperCase() + d.slice(1))
      }
      const transformed = newItems.map(it => ({
        dia: normalizeDia(it.dia),
        turno: normalizeTurno(it.turno),
        hora_inicio: normalizeTime(it.hora_inicio),
        hora_fin: normalizeTime(it.hora_fin),
        aula: it.aula || ''
      }))
      console.log('uploadOnlyNewSchedules: subiendo', transformed.length, 'horarios nuevos', transformed)
      const batchUrl = `${endpoints.COURSE_SCHEDULES(courseId)}/batch`
      await axios.post(batchUrl, transformed, { headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type':'application/json' } : {'Content-Type':'application/json'} })
    }catch(e){
      console.error('uploadOnlyNewSchedules', e)
      const details = e && e.response ? (e.response.data || e.response) : e.message || String(e)
      setError(details && typeof details === 'object' ? (details.message || JSON.stringify(details)) : String(details) || 'No se pudieron subir horarios nuevos')
    }
  }

  const uploadSchedulesForCourse = async (courseId, opts = {}) => {
    const items = collectItemsFromGrid()
    if (!items.length) return
    try{
      // normalize/transform items to expected server shape
      const normalizeTime = (t) => {
        if (!t) return null
        const s = String(t).trim()
        if (/^\d{2}:\d{2}$/.test(s)) return `${s}:00`
        return s
      }
      const normalizeTurno = (v) => {
        if (!v) return ''
        const s = String(v).toLowerCase()
        if (s.includes('man')) return 'Mañana'
        if (s.includes('tar')) return 'Tarde'
        if (s.includes('noc')) return 'Noche'
        return v
      }
      const normalizeDia = (d) => {
        if (!d) return d
        const s = String(d).toLowerCase()
        const map = { lunes: 'Lunes', martes: 'Martes', miercoles: 'Miércoles', miércoles: 'Miércoles', jueves: 'Jueves', viernes: 'Viernes', sabado: 'Sábado', sábado: 'Sábado', domingo: 'Domingo' }
        return map[s] || (d.charAt(0).toUpperCase() + d.slice(1))
      }
      const transformed = items.map(it => ({
        dia: normalizeDia(it.dia),
        turno: normalizeTurno(it.turno),
        hora_inicio: normalizeTime(it.hora_inicio),
        hora_fin: normalizeTime(it.hora_fin),
        aula: it.aula || ''
      }))
      console.log('uploadSchedulesForCourse payload', courseId, transformed)
      try { console.log('uploadSchedulesForCourse payload json', JSON.stringify(transformed, null, 2)) } catch(e){}
      // use batch endpoint when sending multiple schedules
      // if opts.replace === true, request server to replace/sync (deactivate schedules not present)
      const batchUrl = `${endpoints.COURSE_SCHEDULES(courseId)}/batch${opts.replace ? '?replace=true' : ''}`
      await axios.post(batchUrl, transformed, { headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type':'application/json' } : {'Content-Type':'application/json'} })
    }catch(e){
      console.error('uploadSchedulesForCourse', e)
      // try to show server validation details
      const details = e && e.response ? (e.response.data || e.response) : e.message || String(e)
      console.error('uploadSchedulesForCourse details', details)
      setError(details && typeof details === 'object' ? (details.message || JSON.stringify(details)) : String(details) || 'No se pudieron subir horarios del curso')
    }
  }

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

    const getCourseHorarioUrl = (course) => {
      if (!course) return null
      if (course.horarios && course.horarios.url) return course.horarios.url
      if (course.horarios_media_id) {
        const m = findMediaById(course.horarios_media_id)
        if (m && m.url) return m.url
      }
      return null
    }
    const getCourseHorarioAlt = (course) => {
      if (!course) return ''
      if (course.horarios && course.horarios.alt_text) return course.horarios.alt_text
      if (course.horarios_media_id) {
        const m = findMediaById(course.horarios_media_id)
        if (m && m.alt_text) return m.alt_text
      }
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

  // close horarios picker on outside click
  useEffect(()=>{
    if(!showHorariosPicker) return
    const onDoc = (e) => { if(horariosPickerRef.current && !horariosPickerRef.current.contains(e.target)) setShowHorariosPicker(false) }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [showHorariosPicker])

  const handleChange = (k,v) => setForm(f=>({...f,[k]:v}))

  

  const setGridCellAddRange = (day, turno, range, id = null) => {
    setScheduleGrid(g => {
      const copy = JSON.parse(JSON.stringify(g))
      if (!copy[day]) return g
      // store as object to keep schedule id when present
      copy[day][turno].ranges.push({ text: range, id })
      return copy
    })
  }
  const setGridCellRemoveRange = async (day, turno, idx) => {
    // if the removed range has an id, attempt to delete it on the server
    const current = scheduleGrid && scheduleGrid[day] && scheduleGrid[day][turno] ? scheduleGrid[day][turno].ranges : []
    const item = current && current[idx]
    if (item && typeof item === 'object' && item.id) {
      try{
        await axios.delete(`${endpoints.COURSE_SCHEDULES(editingId)}/${item.id}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      }catch(e){ console.error('delete schedule', e) }
    }
    setScheduleGrid(g => {
      const copy = JSON.parse(JSON.stringify(g))
      if (!copy[day]) return g
      copy[day][turno].ranges.splice(idx,1)
      return copy
    })
  }
  const setGridCellAula = (day, turno, aula) => setScheduleGrid(g => { const copy = JSON.parse(JSON.stringify(g)); if (!copy[day]) return g; copy[day][turno].aula = aula; return copy })

  const promptAddRange = (day, turno) => {
    const val = window.prompt(`Agregar rango para ${day} (${turno}) — formato HH:MM-HH:MM`, '08:00-10:00')
    if (!val) return
    // accept comma-separated multiple
    const parts = val.split(',').map(p=>p.trim()).filter(Boolean)
    parts.forEach(p => setGridCellAddRange(day, turno, p))
  }

  

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
        horarios_media_id: form.horarios_media_id ? Number(form.horarios_media_id) : null,
        slug: form.slug,
        published: Boolean(form.published),
        hours: form.hours || null,
        duration: form.duration || null,
        modalidad: form.modalidad || null,
          temario: (Array.isArray(temarioUnits) && temarioUnits.length) ? sanitizeTemarioForSend(temarioUnits) : parseTemarioInput(form.temario),
        grado: form.grado || null,
        registro: form.registro || null,
        perfil_egresado: form.perfil_egresado || null,
        razones_para_estudiar: form.razones_para_estudiar || null,
        publico_objetivo: form.publico_objetivo || null,
        mision: form.mision || null,
        vision: form.vision || null,
        // docentes and schedules removed from course payload (managed elsewhere)
      }
      const res = await axios.post(endpoints.COURSES, payload, { headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type':'application/json' } : {'Content-Type':'application/json'} })
      const created = res && res.data ? res.data : null
      // if grid has schedules, upload them for the new course
      if (created && created.id) await uploadSchedulesForCourse(created.id)
      setForm({ 
        title: '', subtitle: '', description: '', type: '', thumbnail_media_id: '', slug: '', published: true,
        hours: '', duration: '', grado: '', registro: '', perfil_egresado: '', mision: '', vision: '',
        razones_para_estudiar: '', publico_objetivo: '',
        modalidad: '', temario: '', horarios_media_id: ''
      })
        setTemarioUnits([])
      await fetchCourses()
      await fetchMedia()
    }catch(err){
      console.error('createCourse', err)
      const details = err && err.response ? err.response.data : (err && err.message ? err.message : err)
      console.error('createCourse details', details)
      setError(details && typeof details === 'object' ? (details.message || JSON.stringify(details)) : String(details) || 'Error al crear curso')
    }
    finally{ setSaving(false) }
  }

  // render temario (prefer JSON for structured unidades didácticas)
  const renderTemarioToText = (arr) => {
    if (!arr) return ''
    if (!Array.isArray(arr)) return String(arr)
    // if array of strings, keep legacy simple format
    if (arr.every(x => typeof x === 'string')) {
      return arr.map(s => `- ${s}`).join('\n')
    }
    // if complex objects (unidades didácticas), render pretty JSON for editing
    if (arr.length > 0 && typeof arr[0] === 'object') {
      try { return JSON.stringify(arr, null, 2) } catch(e) { return String(arr) }
    }
    // fallback
    return arr.map(el => typeof el === 'string' ? `- ${el}` : JSON.stringify(el)).join('\n\n')
  }

  // parse temario input: try JSON first (for unidades didácticas), then legacy structured text, then comma-separated
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
      thumbnail_media_id: c.thumbnail_media_id || (c.thumbnail && c.thumbnail.id) || '', horarios_media_id: c.horarios_media_id || (c.horarios && c.horarios.id) || '', slug: c.slug||'', published: !!c.published,
      hours: c.hours || '', duration: c.duration || '', grado: c.grado || '', registro: c.registro || '',
      perfil_egresado: c.perfil_egresado || '', mision: c.mision || '', vision: c.vision || '',
      razones_para_estudiar: c.razones_para_estudiar || '', publico_objetivo: c.publico_objetivo || '',
      modalidad: c.modalidad || '', temario: c.temario ? renderTemarioToText(c.temario) : '',
      // docentes and schedules removed from course edit form
    })
    // initialize schedule grid from course schedules (solo activos)
    try{
      const grid = createEmptyGrid()
      if (Array.isArray(c.schedules)){
        c.schedules.filter(s => s.active !== false).forEach(s => {
          const day = s.dia || ''
          // determine turno key
          const turnoRaw = (s.turno || '').toString().toLowerCase()
          let turnoKey = 'manana'
          if (turnoRaw.includes('tar') || turnoRaw.includes('tarde')) turnoKey = 'tarde'
          else if (turnoRaw.includes('noc') || turnoRaw.includes('noche')) turnoKey = 'noche'
          else {
            // infer by hour
            const h = s.hora_inicio ? parseInt(s.hora_inicio.split(':')[0],10) : null
            if (h !== null) {
              if (h >= 6 && h < 12) turnoKey = 'manana'
              else if (h >= 12 && h < 18) turnoKey = 'tarde'
              else turnoKey = 'noche'
            }
          }
          const dKey = (day && grid[day]) ? day : Object.keys(grid).find(k => k.toLowerCase().startsWith((day||'').toString().substring(0,3).toLowerCase())) || null
          if (dKey) {
            const range = s.hora_inicio && s.hora_fin ? `${s.hora_inicio.substring(0,5)} - ${s.hora_fin.substring(0,5)}` : ''
            if (range) grid[dKey][turnoKey].ranges.push({ text: range, id: s.id })
            if (s.aula) grid[dKey][turnoKey].aula = s.aula
          }
        })
      }
      setScheduleGrid(grid)
      // initialize temarioUnits from course temario if structured
      try{
        if (Array.isArray(c.temario) && c.temario.length > 0 && typeof c.temario[0] === 'object') {
          setTemarioUnits(c.temario.map(u => ({
            orden: u.orden || null,
            nivel: u.nivel || '',
            titulo: u.titulo || '',
            temas: Array.isArray(u.temas) ? u.temas.map(t => ({ titulo: t.titulo || '', subtemas: Array.isArray(t.subtemas) ? t.subtemas : [] })) : []
          })))
        } else if (Array.isArray(c.temario) && c.temario.length > 0 && typeof c.temario[0] === 'string') {
          // convert simple string list into a single unidad with temas
          setTemarioUnits([{
            orden: 1, nivel: '', titulo: 'Unidad 1',
            temas: c.temario.map(t => ({ titulo: t, subtemas: [] }))
          }])
        } else {
          setTemarioUnits([])
        }
      }catch(e){ console.error('init temarioUnits', e); setTemarioUnits([]) }
    }catch(e){ console.error('init grid', e) }
  }

  

  const cancelEdit = () => { 
    setEditingId(null); 
    setForm({ 
      title: '', subtitle: '', description: '', type: '', thumbnail_media_id: '', slug: '', published: true,
      hours: '', duration: '', grado: '', registro: '', perfil_egresado: '', mision: '', vision: '',
      razones_para_estudiar: '', publico_objetivo: '',
      modalidad: '', temario: '', horarios_media_id: ''
    }) 
    setScheduleGrid(createEmptyGrid())
    setTemarioUnits([])
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
        horarios_media_id: form.horarios_media_id ? Number(form.horarios_media_id) : null,
        slug: form.slug,
        published: Boolean(form.published),
        hours: form.hours || null,
        duration: form.duration || null,
        modalidad: form.modalidad || null,
          temario: (Array.isArray(temarioUnits) && temarioUnits.length) ? sanitizeTemarioForSend(temarioUnits) : parseTemarioInput(form.temario),
        grado: form.grado || null,
        registro: form.registro || null,
        perfil_egresado: form.perfil_egresado || null,
        razones_para_estudiar: form.razones_para_estudiar || null,
        publico_objetivo: form.publico_objetivo || null,
        mision: form.mision || null,
        vision: form.vision || null,
        // docentes and schedules removed from course payload (managed elsewhere)
      }
      await axios.put(`${endpoints.COURSES}/${id}`, payload, { headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type':'application/json' } : {'Content-Type':'application/json'} })
      // Solo subir horarios NUEVOS (los que no tienen id). Los existentes ya están en el servidor.
      // Las eliminaciones ya se manejan en tiempo real con el botón "x".
      await uploadOnlyNewSchedules(id)
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
                  <div className="col-12 col-md-6">
                    <label className="form-label">Duración</label>
                    <input className="form-control" value={form.duration} onChange={e=>handleChange('duration', e.target.value)} />
                  </div>
                </div>
                {/* Cuadrícula rápida colocada junto a Horas */}
                <div className="mb-3">
                  <label className="form-label">Cuadrícula rápida (crear por día/turno)</label>
                  <div style={{overflowX:'auto'}}>
                    <table className="table table-sm" style={{minWidth:640}}>
                      <thead>
                        <tr>
                          <th>Día</th>
                          <th>Mañana</th>
                          <th>Tarde</th>
                          <th>Noche</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.keys(scheduleGrid).map(day => (
                          <tr key={day}>
                            <td style={{verticalAlign:'top'}}><strong>{day}</strong></td>
                            {['manana','tarde','noche'].map(turno => (
                              <td key={turno} style={{verticalAlign:'top'}}>
                                <div>
                                  {(scheduleGrid[day][turno].ranges || []).map((r,idx) => {
                                    const text = (typeof r === 'string') ? r : (r.text || r.range || '')
                                    return (
                                      <div key={idx} style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                                        <small className="badge bg-light text-dark">{text}</small>
                                        <button type="button" className="btn btn-sm btn-link text-danger" onClick={()=>setGridCellRemoveRange(day,turno,idx)}>x</button>
                                      </div>
                                    )
                                  })}
                                </div>
                                <div style={{display:'flex',gap:8,marginTop:6}}>
                                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={()=>promptAddRange(day,turno)}>Agregar rango</button>
                                  <input className="form-control form-control-sm" placeholder="Aula" value={scheduleGrid[day][turno].aula} onChange={e=>setGridCellAula(day,turno,e.target.value)} />
                                </div>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-2">
                    <small className="text-muted">Los horarios se cargarán en lote al guardar el curso.</small>
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
                <div className="mb-3">
                  <label className="form-label">Razones para estudiar</label>
                  <textarea className="form-control" rows={3} value={form.razones_para_estudiar} onChange={e=>handleChange('razones_para_estudiar', e.target.value)} />
                </div>
                <div className="mb-3">
                  <label className="form-label">Público objetivo</label>
                  <textarea className="form-control" rows={2} value={form.publico_objetivo} onChange={e=>handleChange('publico_objetivo', e.target.value)} />
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
                <div className="mb-3">
                  <label className="form-label">Horario (media)</label>
                  <div className="d-flex align-items-center gap-2">
                      <div style={{position:'relative',width:'100%'}} ref={horariosPickerRef}>
                        <button type="button" className="form-select d-flex align-items-center justify-content-between" onClick={()=>setShowHorariosPicker(v=>!v)}>
                          <span>{getCourseHorarioUrl(form) ? (getCourseHorarioAlt(form) || (`ID ${form.horarios_media_id || ''}`)) : '-- Ninguno --'}</span>
                          <span className="text-muted">▾</span>
                        </button>
                        <div style={{width:90,height:60,flex:'0 0 90px',position:'absolute',right:0,top:6,borderRadius:6,overflow:'hidden',border:'1px solid #e9ecef',background:'#fff'}}>
                          {form.horarios_media_id ? (
                              <img src={(findMediaById(form.horarios_media_id)||{}).url} alt={(findMediaById(form.horarios_media_id)||{}).alt_text || 'preview'} style={{width:'100%',height:'100%',objectFit:'cover'}} />
                          ) : (
                            <div style={{display:'grid',placeItems:'center',height:'100%'}}><small className="text-muted">Sin horario</small></div>
                          )}
                        </div>
                        {showHorariosPicker && (
                          <div style={{position:'absolute',zIndex:30,top:'48px',left:0,right:0,maxHeight:220,overflowY:'auto',border:'1px solid #e9ecef',background:'#fff',padding:8,borderRadius:6,boxShadow:'0 6px 18px rgba(0,0,0,0.08)'}}>
                            <div className="row g-2">
                              {loadingMedia && <div className="col-12 text-center text-muted">Cargando medias...</div>}
                              {!loadingMedia && mediaList.filter(m=>m.active).length === 0 && <div className="col-12 text-muted">No hay medias activas.</div>}
                              {mediaList.filter(m=>m.active).map(m => (
                                <div key={m.id} className="col-4">
                                  <button type="button" className="btn p-0 border-0" style={{width:'100%'}} onClick={()=>{ handleChange('horarios_media_id', m.id); setShowHorariosPicker(false) }}>
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
                  <label className="form-label">Unidades didácticas</label>
                  <div className="mb-2">
                    <button type="button" className="btn btn-sm btn-outline-primary" onClick={addUnit}>+ Añadir unidad</button>
                  </div>
                  {temarioUnits.length === 0 && <div className="text-muted small mb-2">No hay unidades. Pulsa "Añadir unidad" para crear la primera.</div>}
                  {temarioUnits.map((unit, ui) => (
                    <div key={ui} className="card mb-2 p-2">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div style={{flex:1}}>
                          <div className="row g-2">
                            <div className="col-2">
                              <input type="number" className="form-control" value={unit.orden || ui+1} onChange={e=>updateUnitField(ui,'orden', Number(e.target.value))} />
                            </div>
                            <div className="col-4">
                              <input className="form-control" value={unit.nivel || ''} onChange={e=>updateUnitField(ui,'nivel', e.target.value)} placeholder="Nivel (ej. NIVEL I)" />
                            </div>
                            <div className="col-6">
                              <input className="form-control" value={unit.titulo || ''} onChange={e=>updateUnitField(ui,'titulo', e.target.value)} placeholder="Título de la unidad" />
                            </div>
                          </div>
                          {/* descripción eliminada: solo título y temas según requerimiento */}
                        </div>
                        <div className="ms-2">
                          <button type="button" className="btn btn-sm btn-danger" onClick={()=>removeUnit(ui)}>Eliminar</button>
                        </div>
                      </div>
                      <div>
                        <strong className="small">Temas</strong>
                        <div className="mt-2">
                          {(unit.temas||[]).map((tema, ti) => (
                            <div key={ti} className="mb-2 p-2 border rounded">
                              <div className="d-flex gap-2">
                                <input className="form-control" value={tema.titulo || ''} onChange={e=>updateTemaField(ui,ti,'titulo', e.target.value)} placeholder="Título del tema" />
                                <button type="button" className="btn btn-sm btn-danger" onClick={()=>removeTema(ui,ti)}>Eliminar tema</button>
                              </div>
                              <div className="mt-2">
                                <div className="small text-muted">Subtemas</div>
                                {(tema.subtemas||[]).map((s,si) => (
                                  <div key={si} className="d-flex gap-2 align-items-center mt-1">
                                    <input className="form-control" value={s || ''} onChange={e=>updateSubtema(ui,ti,si, e.target.value)} placeholder="Subtema" />
                                    <button type="button" className="btn btn-sm btn-link text-danger" onClick={()=>removeSubtema(ui,ti,si)}>x</button>
                                  </div>
                                ))}
                                <div className="mt-2">
                                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={()=>addSubtema(ui,ti)}>+ Añadir subtema</button>
                                </div>
                              </div>
                            </div>
                          ))}
                          <div>
                            <button type="button" className="btn btn-sm btn-outline-primary" onClick={()=>addTema(ui)}>+ Añadir tema</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="d-flex gap-2">
                  <button className="btn btn-accent" type="submit" disabled={saving}>{saving ? 'Guardando...' : (editingId ? 'Guardar' : 'Crear')}</button>
                  {editingId && <button type="button" className="btn btn-outline-secondary" onClick={cancelEdit}>Cancelar</button>}
                </div>
              </form>
            </div>
            {editingId && (
              <div className="card-footer">
                <h6 className="mb-2">Horarios</h6>
                <div className="text-muted small">Edita los horarios en la cuadrícula arriba; se subirán al guardar el curso.</div>
              </div>
            )}
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
                              {c.razones_para_estudiar && <div className="mt-2"><strong>Razones para estudiar:</strong> <div className="text-muted small">{String(c.razones_para_estudiar)}</div></div>}
                              {c.publico_objetivo && <div className="mt-2"><strong>Público objetivo:</strong> <div className="text-muted small">{String(c.publico_objetivo)}</div></div>}
                              {/* Módulos eliminados: ahora use Unidades didácticas en el campo Unidades didácticas */}
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
