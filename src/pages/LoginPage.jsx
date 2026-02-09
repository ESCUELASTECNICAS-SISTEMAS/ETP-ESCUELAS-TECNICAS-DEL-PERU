import React, { useState } from 'react'
import axios from 'axios'
import { endpoints } from '../utils/apiStatic'
import { useNavigate } from 'react-router-dom'

export default function LoginPage(){
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)
    
    try {
      if (isRegister) {
        await axios.post(endpoints.REGISTER, { name, email, password }, { headers: { 'Content-Type': 'application/json' } })
        setSuccess('Usuario creado correctamente. Ahora puedes iniciar sesión.')
        setIsRegister(false)
        setName('')
        setEmail('')
        setPassword('')
      } else {
        const res = await axios.post(endpoints.LOGIN, { email, password }, { headers: { 'Content-Type': 'application/json' } })
        const data = res.data
        localStorage.setItem('etp_token', data.token)
        localStorage.setItem('etp_user', JSON.stringify(data.user))
        window.dispatchEvent(new CustomEvent('etp:login', { detail: data.user }))
        
        const role = data.user?.role || data.user?.roles || null
        if (data.user && (data.user.role === 'administrador' || role === 'administrador')) {
          navigate('/admin')
        } else {
          navigate('/')
        }
      }
    } catch (err) {
      console.error(err)
      if (err.response) setError(err.response.data?.message || (isRegister ? 'No se pudo crear el usuario' : 'Credenciales inválidas'))
      else setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container section-padding">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-5">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="text-center mb-4">
                <img src="/assets/images/logo.jpg" alt="ETP" style={{height:64, objectFit:'contain'}} />
                <h4 className="mt-2" style={{color:'var(--primary)'}}>
                  {isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
                </h4>
                <p className="text-muted">
                  {isRegister ? 'Completa tus datos para registrarte' : 'Accede al panel con tus credenciales'}
                </p>
              </div>

              <form onSubmit={submit}>
                {isRegister && (
                  <div className="mb-3">
                    <label className="form-label">Nombre completo</label>
                    <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} required />
                  </div>
                )}
                <div className="mb-3">
                  <label className="form-label">Correo</label>
                  <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Contraseña</label>
                  <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>

                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <div className="d-grid gap-2">
                  <button className="btn btn-accent btn-lg" type="submit" disabled={loading}>
                    {loading ? (isRegister ? 'Registrando...' : 'Entrando...') : (isRegister ? 'Crear cuenta' : 'Entrar')}
                  </button>
                </div>
              </form>

              <div className="text-center mt-4">
                {isRegister ? (
                  <p className="mb-0">
                    ¿Ya tienes cuenta?{' '}
                    <button className="btn btn-link p-0 text-decoration-underline" onClick={() => setIsRegister(false)}>
                      Iniciar sesión
                    </button>
                  </p>
                ) : (
                  <>
                    <p className="mb-2">
                      ¿No tienes cuenta?{' '}
                      <button className="btn btn-link p-0 text-decoration-underline" onClick={() => setIsRegister(true)}>
                        Crear cuenta
                      </button>
                    </p>
                    <small className="text-muted">¿Olvidaste tu contraseña? Contacta al administrador.</small>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
