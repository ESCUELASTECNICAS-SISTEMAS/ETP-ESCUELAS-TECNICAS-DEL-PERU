import React, { useState } from 'react'
import axios from 'axios'
import { endpoints } from '../utils/apiStatic'
import { useNavigate } from 'react-router-dom'

export default function LoginPage(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await axios.post(endpoints.LOGIN, { email, password }, { headers: { 'Content-Type': 'application/json' } })
      const data = res.data
      localStorage.setItem('etp_token', data.token)
      localStorage.setItem('etp_user', JSON.stringify(data.user))
      // notify other parts of the app (Navbar listens to this)
      window.dispatchEvent(new CustomEvent('etp:login', { detail: data.user }))
      setLoading(false)
      // If user role equals 'administrador', go to dashboard
      const role = data.user?.role || data.user?.roles || null
      if (data.user && (data.user.role === 'administrador' || role === 'administrador')) {
        navigate('/admin')
      } else {
        navigate('/')
      }
    } catch (err) {
      console.error(err)
      if (err.response) setError(err.response.data?.message || 'Credenciales inválidas')
      else setError('Error de conexión')
      setLoading(false)
    }
  }

  return (
    <div className="container section-padding">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-5">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="text-center mb-3">
                <img src="/assets/images/logo.jpg" alt="ETP" style={{height:64, objectFit:'contain'}} />
                <h4 className="mt-2" style={{color:'var(--primary)'}}>Iniciar sesión</h4>
                <p className="text-muted">Accede al panel con tus credenciales</p>
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

                <div className="d-grid gap-2">
                  <button className="btn btn-accent btn-lg" type="submit" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
                </div>
              </form>

              <div className="text-center mt-3">
                <small className="text-muted">¿Olvidaste tu contraseña? Contacta al administrador.</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
