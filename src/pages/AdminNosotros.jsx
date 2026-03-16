import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { endpoints } from '../utils/apiStatic'

export default function AdminNosotros(){
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(null)
  const [showRaw, setShowRaw] = useState(false)
  const token = localStorage.getItem('etp_token')

  const headers = token ? { Authorization: `Bearer ${token}` } : {}

  const fetchAll = async () => {
    setLoading(true); setError(null)
    try{
      const res = await axios.get(endpoints.NOSOTROS, { headers })
      setItems(Array.isArray(res.data) ? res.data : [])
    }catch(e){ console.error('fetchAll nosotros', e); setError('No se pudieron cargar los registros') }
    finally{ setLoading(false) }
  }

  useEffect(() => { fetchAll() }, [])

  const template = () => ({
    imagen: '/assets/images/nosotros_quienes.jpg',
    logo: '/assets/images/LogoETPBlanco.png',
    anios: 13,
    anios_texto: 'Años transformando vidas en Ica',
    ciudad: 'Ica',
    titulo: 'Nacimos para resolver la brecha técnica',
    descripcion: '',
    bullets: [],
    mision: '',
    vision: '',
    valores: [],
    video_url: '',
    video_poster: '',
    active: true
  })

  const handleEdit = (item) => {
    setEditing(item)
    setForm({ ...item })
  }

  const handleNew = () => {
    setEditing(null)
    setForm(template())
  }

  const handleChange = (key, value) => setForm(f => ({ ...(f||{}), [key]: value }))

  const handleArrChange = (key, idx, value) => {
    setForm(f => {
      const arr = Array.isArray(f[key]) ? [...f[key]] : []
      arr[idx] = value
      return { ...(f||{}), [key]: arr }
    })
  }

  const handleArrAdd = (key) => setForm(f => ({ ...(f||{}), [key]: [...(f?.[key]||[]), ''] }))
  const handleArrRemove = (key, idx) => setForm(f => ({ ...(f||{}), [key]: (f?.[key]||[]).filter((_,i)=>i!==idx) }))

  const handleSave = async () => {
    try{
      if (!form) return setError('Formulario vacío')
      if (editing && editing.id) {
        await axios.put(`${endpoints.NOSOTROS}/${editing.id}`, form, { headers })
      } else {
        await axios.post(endpoints.NOSOTROS, form, { headers })
      }
      await fetchAll()
      setEditing(null)
      setForm(null)
    }catch(e){ console.error('save nosotros', e); setError('Error guardando. Revisa los datos y permisos.') }
  }

  const handleToggleActive = async (item, nextState) => {
    try{
      const payload = { ...(item || {}), active: !!nextState }
      await axios.put(`${endpoints.NOSOTROS}/${item.id}`, payload, { headers })
      await fetchAll()
    }catch(e){ console.error('toggle active nosotros', e); setError('No se pudo actualizar el estado') }
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Gestionar sección "Nosotros"</h4>
        <div>
          <button className="btn btn-outline-primary me-2" onClick={fetchAll}>Refrescar</button>
          <button className="btn btn-accent" onClick={handleNew}>Nuevo registro</button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-3 mb-4">
        {loading ? <div className="col-12">Cargando...</div> : (
          (() => {
            const activeItems = (items || []).filter(x => x.active === true)
            const inactiveItems = (items || []).filter(x => x.active !== true)
            return (
              <>
                {activeItems.length > 0 && (
                  <>
                    <div className="col-12">
                      <h6 className="text-success fw-bold">✓ ACTIVOS</h6>
                    </div>
                    {activeItems.map(it => (
                      <div className="col-12" key={it.id}>
                        <div className="card shadow-sm border-success">
                          <div className="card-body d-flex justify-content-between align-items-start">
                            <div>
                              <h5 className="mb-1">{it.titulo || `Registro ${it.id}`}</h5>
                              <small className="text-muted">ID: {it.id} — {it.ciudad}</small>
                            </div>
                            <div className="d-flex gap-2">
                              <button className="btn btn-sm btn-outline-secondary" onClick={() => handleEdit(it)}>Editar</button>
                              <button className="btn btn-sm btn-warning text-dark fw-bold" onClick={() => handleToggleActive(it, false)}>⊘ Desactivar</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {inactiveItems.length > 0 && (
                  <>
                    <div className="col-12 mt-4">
                      <h6 className="text-danger fw-bold">✕ DESACTIVADOS</h6>
                    </div>
                    {inactiveItems.map(it => (
                      <div className="col-12" key={`off-${it.id}`}>
                        <div className="card border-danger border-2 bg-danger bg-opacity-10">
                          <div className="card-body d-flex justify-content-between align-items-start">
                            <div>
                              <h5 className="mb-1 text-danger">{it.titulo || `Registro ${it.id}`}</h5>
                              <small className="text-muted">ID: {it.id} — {it.ciudad}</small>
                            </div>
                            <div className="d-flex gap-2">
                              <button className="btn btn-sm btn-outline-secondary" onClick={() => handleEdit(it)}>Editar</button>
                              <button className="btn btn-sm btn-success fw-bold" onClick={() => handleToggleActive(it, true)}>✓ ACTIVAR</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {items.length === 0 && (
                  <div className="col-12">
                    <div className="alert alert-info">No hay registros. Crea uno nuevo.</div>
                  </div>
                )}
              </>
            )
          })()
        )}
      </div>

      <div className="card p-3">
        <h5 className="mb-3">Formulario</h5>
        {!form && <div className="text-muted">Selecciona un registro o pulsa "Nuevo registro" para comenzar.</div>}
        {form && (
          <>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Titulo</label>
                <input className="form-control" value={form.titulo||''} onChange={e=>handleChange('titulo', e.target.value)} />
              </div>
              <div className="col-md-3 mb-3">
                <label className="form-label">Ciudad</label>
                <input className="form-control" value={form.ciudad||''} onChange={e=>handleChange('ciudad', e.target.value)} />
              </div>
              <div className="col-md-3 mb-3">
                <label className="form-label">Años</label>
                <input type="number" className="form-control" value={form.anios||0} onChange={e=>handleChange('anios', Number(e.target.value))} />
              </div>

              <div className="col-12 mb-3">
                <label className="form-label">Años texto</label>
                <input className="form-control" value={form.anios_texto||''} onChange={e=>handleChange('anios_texto', e.target.value)} />
              </div>

              <div className="col-12 mb-3">
                <label className="form-label">Descripción</label>
                <textarea className="form-control" rows={4} value={form.descripcion||''} onChange={e=>handleChange('descripcion', e.target.value)}></textarea>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Imagen (URL)</label>
                <input className="form-control" value={form.imagen||''} onChange={e=>handleChange('imagen', e.target.value)} />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Logo (URL)</label>
                <input className="form-control" value={form.logo||''} onChange={e=>handleChange('logo', e.target.value)} />
              </div>

              <div className="col-12 mb-3">
                <label className="form-label">Misión</label>
                <textarea className="form-control" rows={2} value={form.mision||''} onChange={e=>handleChange('mision', e.target.value)}></textarea>
              </div>
              <div className="col-12 mb-3">
                <label className="form-label">Visión</label>
                <textarea className="form-control" rows={2} value={form.vision||''} onChange={e=>handleChange('vision', e.target.value)}></textarea>
              </div>

              <div className="col-12 mb-3">
                <label className="form-label">Bullets</label>
                {(form.bullets||[]).map((b, i) => (
                  <div className="input-group mb-2" key={`b-${i}`}>
                    <input className="form-control" value={b} onChange={e=>handleArrChange('bullets', i, e.target.value)} />
                    <button type="button" className="btn btn-outline-danger" onClick={()=>handleArrRemove('bullets', i)}>Eliminar</button>
                  </div>
                ))}
                <button type="button" className="btn btn-sm btn-outline-primary" onClick={()=>handleArrAdd('bullets')}>Agregar bullet</button>
              </div>

              <div className="col-12 mb-3">
                <label className="form-label">Valores</label>
                {(form.valores||[]).map((v, i) => (
                  <div className="input-group mb-2" key={`v-${i}`}>
                    <input className="form-control" value={v} onChange={e=>handleArrChange('valores', i, e.target.value)} />
                    <button type="button" className="btn btn-outline-danger" onClick={()=>handleArrRemove('valores', i)}>Eliminar</button>
                  </div>
                ))}
                <button type="button" className="btn btn-sm btn-outline-primary" onClick={()=>handleArrAdd('valores')}>Agregar valor</button>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Video URL</label>
                <input className="form-control" value={form.video_url||''} onChange={e=>handleChange('video_url', e.target.value)} />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Video poster (URL)</label>
                <input className="form-control" value={form.video_poster||''} onChange={e=>handleChange('video_poster', e.target.value)} />
              </div>

              <div className="col-12 mb-3 d-flex align-items-center gap-3">
                <div className="form-check">
                  <input id="nosotros_active" className="form-check-input" type="checkbox" checked={!!form.active} onChange={e=>handleChange('active', !!e.target.checked)} />
                  <label className="form-check-label" htmlFor="nosotros_active">Activo</label>
                </div>
                <button className="btn btn-primary" onClick={handleSave}>Guardar</button>
                <button className="btn btn-secondary" onClick={()=>{ setForm(null); setEditing(null) }}>Cancelar</button>
                <button className="btn btn-outline-secondary ms-auto" onClick={()=>setShowRaw(s=>!s)}>{showRaw? 'Ocultar JSON':'Ver JSON (avanzado)'}</button>
              </div>
            </div>

            {showRaw && (
              <div className="mt-3">
                <label className="form-label">JSON (avanzado)</label>
                <textarea className="form-control" rows={10} value={JSON.stringify(form, null, 2)} readOnly></textarea>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
