import React, { useState } from 'react'
import axios from 'axios'

export default function LoginModal({ show, onClose, onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  if (!show) return null

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await axios.post('https://servidorpaginaetp-production.up.railway.app/auth/login', { email, password }, {
        headers: { 'Content-Type': 'application/json' }
      })
      const data = res.data
      // store token and user
      localStorage.setItem('etp_token', data.token)
      localStorage.setItem('etp_user', JSON.stringify(data.user))
      onLogin && onLogin(data.user)
      setLoading(false)
      onClose && onClose()
    } catch (err) {
      console.error(err)
      if (err.response) {
        setError(err.response.data?.message || 'Error de autenticación')
      } else {
        setError('Error de conexión')
      }
      setLoading(false)
    }
  }

  return (
    <div className="login-modal-backdrop">
      <div className="login-modal">
        <div className="login-header">
          <h5 className="mb-0">Iniciar sesión</h5>
          <button className="btn-close" onClick={onClose} aria-label="Cerrar"></button>
        </div>
        <form onSubmit={submit}>
          <div className="mb-3">
            <label className="form-label">Correo</label>
            <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Contraseña</label>
            <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          {error && <div className="alert alert-danger">{error}</div>}
          <div className="d-flex justify-content-end">
            <button type="button" className="btn btn-secondary me-2" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
