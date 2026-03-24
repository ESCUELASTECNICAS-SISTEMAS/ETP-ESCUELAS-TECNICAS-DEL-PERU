import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { endpoints } from '../../utils/apiStatic'

export default function UserManager(){
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({ nombre: '', email: '', password: '', role: '' })
  const [editingId, setEditingId] = useState(null)

  const token = localStorage.getItem('etp_token')
  const headers = token ? { Authorization: `Bearer ${token}` } : {}

  const BASE = endpoints.LOGIN ? endpoints.LOGIN.replace('/auth/login','') : (import.meta.env.VITE_API_BASE || '')
  const USERS = `${BASE}/users`

  const fetchUsers = async () => {
    setLoading(true); setError(null)
    try{
      const res = await axios.get(USERS, { headers })
      setUsers(res.data || [])
    }catch(e){ console.error('fetch users', e); setError('No se pudieron cargar usuarios') }
    finally{ setLoading(false) }
  }

  useEffect(()=>{ fetchUsers() }, [])

  const startEdit = (u) => setEditingId(u.id) || setForm({ nombre: u.nombre || '', email: u.email || '', role: u.role || '' })
  const cancelEdit = () => { setEditingId(null); setForm({ nombre:'', email:'', password:'', role:'' }) }

  const handleSave = async (e) => {
    e && e.preventDefault()
    setSaving(true); setError(null)
    try{
      const payload = { nombre: form.nombre, email: form.email, role: form.role }
      if (editingId){
        await axios.put(`${USERS}/${editingId}`, payload, { headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type':'application/json' } : {'Content-Type':'application/json'} })
      }else{
        // create via auth register endpoint when possible
        const createUrl = endpoints.REGISTER || `${BASE}/auth/register`
        const createPayload = { nombre: form.nombre, email: form.email, password: form.password || 'changeme', role: form.role }
        await axios.post(createUrl, createPayload, { headers: token ? { Authorization: `Bearer ${token}`, 'Content-Type':'application/json' } : {'Content-Type':'application/json'} })
      }
      await fetchUsers()
      cancelEdit()
    }catch(err){ console.error('save user', err); setError('Error guardando usuario') }
    finally{ setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Desactivar usuario?')) return
    setSaving(true); setError(null)
    try{
      await axios.patch(`${USERS}/${id}/active`, { active: false }, { headers })
      await fetchUsers()
    }catch(err){ console.error('patch user active', err); setError('Error desactivando usuario') }
    finally{ setSaving(false) }
  }

  return (
    <div className="card mb-3">
      <div className="card-body">
        <h5 className="card-title">Administrar Usuarios</h5>
        <div className="row">
          <div className="col-12 col-md-5 mb-3">
            <h6>{editingId ? 'Editar usuario' : 'Nuevo usuario'}</h6>
            <form onSubmit={handleSave}>
              <div className="mb-2"><label className="form-label">Nombre</label><input className="form-control" value={form.nombre} onChange={e=>setForm(f=>({...f,nombre:e.target.value}))} required /></div>
              <div className="mb-2"><label className="form-label">Email</label><input className="form-control" type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} required /></div>
              {!editingId && <div className="mb-2"><label className="form-label">Password</label><input className="form-control" type="password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} /></div>}
              <div className="mb-2"><label className="form-label">Rol</label><input className="form-control" value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))} /></div>
              {error && <div className="alert alert-danger">{error}</div>}
              <div className="d-flex gap-2"><button className="btn btn-accent" type="submit" disabled={saving}>{saving ? 'Guardando...' : (editingId ? 'Guardar' : 'Crear')}</button><button type="button" className="btn btn-outline-secondary" onClick={cancelEdit}>Cancelar</button></div>
            </form>
          </div>
          <div className="col-12 col-md-7">
            <h6 className="mb-2">Usuarios</h6>
            {loading && <div>Cargando...</div>}
            <div className="list-group">
              {users.map(u => (
                <div key={u.id} className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{u.nombre || u.name || u.email}</strong>
                    <div className="text-muted small">{u.email} {u.role ? `· ${u.role}` : ''}</div>
                  </div>
                  <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-primary" onClick={()=>{ setEditingId(u.id); setForm({ nombre: u.nombre||u.name||'', email: u.email||'', role: u.role||'' }) }}>Editar</button>
                    <button className="btn btn-sm btn-danger" onClick={()=>handleDelete(u.id)}>Desactivar</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
