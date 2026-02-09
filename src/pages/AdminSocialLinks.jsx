import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { endpoints } from '../utils/apiStatic'

export default function AdminSocialLinks(){
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({ network:'', value:'' })
  const [editingId, setEditingId] = useState(null)

  const token = localStorage.getItem('etp_token')
  const headers = token ? { Authorization: `Bearer ${token}`, 'Content-Type':'application/json' } : { 'Content-Type':'application/json' }

  useEffect(()=>{ fetch() }, [])

  const fetch = async () => {
    setLoading(true); setError(null)
    try{
      const res = await axios.get(endpoints.SOCIAL_LINKS, { headers })
      setItems(res.data || [])
    }catch(err){ console.error('fetch social links', err); setError('No se pudieron cargar social links') }
    finally{ setLoading(false) }
  }

  const startEdit = (s) => { setEditingId(s.id); setForm({ network: s.network||'', value: s.value||'' }) }
  const cancelEdit = () => { setEditingId(null); setForm({ network:'', value:'' }) }

  const save = async (e) => {
    e && e.preventDefault()
    setSaving(true); setError(null)
    try{
      const payload = { network: form.network, value: form.value }
      if (editingId) await axios.put(`${endpoints.SOCIAL_LINKS}/${editingId}`, payload, { headers })
      else await axios.post(endpoints.SOCIAL_LINKS, payload, { headers })
      await fetch(); cancelEdit()
    }catch(err){ console.error('save social link', err); setError('Error guardando social link') }
    finally{ setSaving(false) }
  }

  const remove = async (id) => {
    if (!confirm('Desactivar social link?')) return
    setSaving(true); setError(null)
    try{ await axios.delete(`${endpoints.SOCIAL_LINKS}/${id}`, { headers }); await fetch() }catch(err){ console.error('delete social link', err); setError('Error desactivando social link') }finally{ setSaving(false) }
  }

  return (
    <div className="container section-padding">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Administrar Social Links</h3>
        <small className="text-muted">Gestiona redes y enlaces</small>
      </div>

      <div className="row">
        <div className="col-12 col-md-5">
          <div className="card mb-3">
            <div className="card-body">
              <h5 className="card-title">{editingId ? 'Editar enlace' : 'Nuevo enlace'}</h5>
              <form onSubmit={save}>
                <div className="mb-2"><label className="form-label">Red</label><input className="form-control" value={form.network} onChange={e=>setForm(f=>({...f,network:e.target.value}))} placeholder="facebook|instagram|whatsapp" required /></div>
                <div className="mb-2"><label className="form-label">URL / Valor</label><input className="form-control" value={form.value} onChange={e=>setForm(f=>({...f,value:e.target.value}))} placeholder="https://..." required /></div>
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="d-flex gap-2"><button className="btn btn-accent" type="submit" disabled={saving}>{saving ? 'Guardando...' : (editingId ? 'Guardar' : 'Crear')}</button><button type="button" className="btn btn-outline-secondary" onClick={cancelEdit}>Cancelar</button></div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-7">
          <h5>Social Links</h5>
          {loading && <div> Cargando...</div>}
          <div className="list-group">
            {items.map(i => (
              <div key={i.id} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <strong>{i.network}</strong>
                  <div className="text-muted small">{i.value}</div>
                </div>
                <div className="d-flex gap-2">
                  <button className="btn btn-sm btn-outline-primary" onClick={()=>startEdit(i)}>Editar</button>
                  <button className="btn btn-sm btn-danger" onClick={()=>remove(i.id)}>{i.active === false ? 'Eliminar' : 'Desactivar'}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
