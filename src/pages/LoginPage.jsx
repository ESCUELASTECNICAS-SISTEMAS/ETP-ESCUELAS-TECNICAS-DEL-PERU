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
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-gradient position-relative overflow-hidden" 
         style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
      
      {/* Decoración de fondo */}
      <div className="position-absolute w-100 h-100" style={{zIndex: 0}}>
        <div className="position-absolute rounded-circle opacity-25 bg-white" 
             style={{width: '300px', height: '300px', top: '10%', left: '5%', filter: 'blur(60px)'}}></div>
        <div className="position-absolute rounded-circle opacity-25 bg-white" 
             style={{width: '200px', height: '200px', bottom: '15%', right: '10%', filter: 'blur(50px)'}}></div>
        <div className="position-absolute rounded-circle opacity-25 bg-white" 
             style={{width: '250px', height: '250px', top: '50%', right: '20%', filter: 'blur(70px)'}}></div>
      </div>

      <div className="container py-5" style={{position: 'relative', zIndex: 1}}>
        <div className="row justify-content-center">
          <div className="col-12 col-md-10 col-lg-9 col-xl-8">
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="row g-0">
                
                {/* Panel izquierdo - Solo visible en desktop */}
                <div className="col-lg-5 d-none d-lg-block text-white p-5 position-relative" 
                     style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
                  <div className="d-flex flex-column align-items-center justify-content-center h-100 text-center">
                    <div className="mb-4">
                      <div className="bg-white bg-opacity-25 rounded-circle d-inline-flex align-items-center justify-content-center" 
                           style={{width: '100px', height: '100px', backdropFilter: 'blur(10px)'}}>
                        <svg width="50" height="50" viewBox="0 0 24 24" fill="none" className="text-white">
                          <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                    
                    <h2 className="fw-bold mb-3">Mantente Informado</h2>
                    <p className="mb-4 opacity-90" style={{fontSize: '1.1rem'}}>
                      Recibe las últimas noticias directamente en tu correo electrónico
                    </p>
                  </div>
                </div>

                {/* Panel derecho - Formulario */}
                <div className="col-lg-7 bg-white">
                  <div className="p-4 p-md-5">
                    
                    {/* Logo y título */}
                    <div className="text-center mb-4">
                      <img src="/assets/images/logo.jpg" alt="ETP" className="mb-3" style={{height: '70px', objectFit: 'contain'}} />
                      <h3 className="fw-bold text-dark mb-2">
                        {isRegister ? 'Crear nueva cuenta' : 'Iniciar sesión'}
                      </h3>
                      <p className="text-muted small">
                        {isRegister ? 'Completa el formulario para registrarte' : 'Ingresa tus credenciales para continuar'}
                      </p>
                    </div>

                    {/* Formulario */}
                    <form onSubmit={submit}>
                      
                      {isRegister && (
                        <div className="mb-3">
                          <label className="form-label fw-semibold small text-secondary">
                            <i className="bi bi-person me-2"></i>Nombre completo
                          </label>
                          <input 
                            type="text" 
                            className="form-control form-control-lg border-2 rounded-3" 
                            value={name} 
                            onChange={e => setName(e.target.value)} 
                            placeholder="Ingresa tu nombre completo"
                            required 
                          />
                        </div>
                      )}
                      
                      <div className="mb-3">
                        <label className="form-label fw-semibold small text-secondary">
                          <i className="bi bi-envelope me-2"></i>Correo electrónico
                        </label>
                        <input 
                          type="email" 
                          className="form-control form-control-lg border-2 rounded-3" 
                          value={email} 
                          onChange={e => setEmail(e.target.value)} 
                          placeholder="tu@email.com"
                          required 
                        />
                      </div>
                      
                      <div className="mb-4">
                        <label className="form-label fw-semibold small text-secondary">
                          <i className="bi bi-lock me-2"></i>Contraseña
                        </label>
                        <input 
                          type="password" 
                          className="form-control form-control-lg border-2 rounded-3" 
                          value={password} 
                          onChange={e => setPassword(e.target.value)} 
                          placeholder="••••••••"
                          required 
                        />
                      </div>

                      {/* Alertas */}
                      {error && (
                        <div className="alert alert-danger d-flex align-items-center rounded-3 border-0" role="alert">
                          <i className="bi bi-exclamation-triangle-fill me-2"></i>
                          <div>{error}</div>
                        </div>
                      )}
                      
                      {success && (
                        <div className="alert alert-success d-flex align-items-center rounded-3 border-0" role="alert">
                          <i className="bi bi-check-circle-fill me-2"></i>
                          <div>{success}</div>
                        </div>
                      )}

                      {/* Botón submit */}
                      <div className="d-grid gap-2 mb-4">
                        <button 
                          className="btn btn-lg rounded-3 fw-semibold shadow-sm" 
                          style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none'
                          }}
                          type="submit" 
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                              {isRegister ? 'Registrando...' : 'Iniciando sesión...'}
                            </>
                          ) : (
                            <>
                              {isRegister ? 'Crear cuenta' : 'Entrar'}
                              <i className="bi bi-arrow-right ms-2"></i>
                            </>
                          )}
                        </button>
                      </div>
                    </form>

                    {/* Footer del formulario */}
                    <div className="text-center">
                      <hr className="my-4" />
                      
                      {isRegister ? (
                        <p className="mb-0 text-muted small">
                          ¿Ya tienes cuenta?{' '}
                          <button 
                            className="btn btn-link p-0 text-decoration-none fw-semibold" 
                            style={{color: '#667eea'}}
                            onClick={() => setIsRegister(false)}
                          >
                            Iniciar sesión aquí
                          </button>
                        </p>
                      ) : (
                        <>
                          <p className="mb-2 text-muted small">
                            ¿No tienes cuenta?{' '}
                            <button 
                              className="btn btn-link p-0 text-decoration-none fw-semibold" 
                              style={{color: '#667eea'}}
                              onClick={() => setIsRegister(true)}
                            >
                              Regístrate gratis
                            </button>
                          </p>
                          <p className="mb-0 text-muted" style={{fontSize: '0.8rem'}}>
                            <i className="bi bi-info-circle me-1"></i>
                            ¿Olvidaste tu contraseña? Contacta al administrador
                          </p>
                        </>
                      )}
                    </div>

                  </div>
                </div>

              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-4">
              <p className="text-white small mb-0 opacity-75">
                © 2024 ETP. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}