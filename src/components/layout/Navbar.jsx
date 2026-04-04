  import React, { useEffect, useRef, useState } from 'react'
  import { connectSocket, disconnectSocket } from '../../utils/socket'
  import { toast } from 'react-toastify'
  import { Link, useNavigate } from 'react-router-dom'
  import axios from 'axios'
  import { endpoints } from '../../utils/apiStatic'

  export default function Navbar() {
    const [scrolled, setScrolled] = useState(false)
    const [user, setUser] = useState(null)
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [courses, setCourses] = useState([])
    const [showResults, setShowResults] = useState(false)
    const [notifications, setNotifications] = useState([])
    const navigate = useNavigate()
    const soundRef = useRef({ lastAt: 0 })
    const isAdmin = !!(user && (user.role === 'admin' || user.role === 'administrador'))
    const unreadCount = notifications.reduce((acc, n) => acc + (n.read ? 0 : 1), 0)

    useEffect(() => {
      axios.get(endpoints.COURSES).then(r => setCourses(r.data || [])).catch(() => {})
    }, [])

    useEffect(() => {
      if (!query.trim()) { setResults([]); return }
      const filtered = courses.filter(c => {
        if (c.published === false) return false
        const text = `${c.titulo||c.title||''} ${c.subtitle||c.descripcion||''}`.toLowerCase()
        return text.includes(query.toLowerCase())
      })
      setResults(filtered.slice(0, 5))
    }, [query, courses])

    useEffect(() => {
      const onScroll = () => setScrolled(window.scrollY > 10)
      window.addEventListener('scroll', onScroll, { passive: true })
      onScroll()
      return () => window.removeEventListener('scroll', onScroll)
    }, [])

    useEffect(() => {
      try {
        const raw = localStorage.getItem('etp_user')
        if (raw) setUser(JSON.parse(raw))
      } catch (e) { /* ignore */ }
    }, [])

    useEffect(() => {
      // Si no es admin, limpiamos el estado para no mostrar notificaciones viejas.
      if (!isAdmin) setNotifications([])
    }, [isAdmin])

    function playBellSound() {
      // Evita "spamear" el sonido en ráfagas.
      const now = Date.now()
      if (now - soundRef.current.lastAt < 250) return
      soundRef.current.lastAt = now

      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext
        if (!AudioCtx) return
        const ctx = new AudioCtx()

        const oscillator = ctx.createOscillator()
        const gain = ctx.createGain()

        oscillator.type = 'sine'
        oscillator.frequency.value = 1046.5 // ~C6
        gain.gain.value = 0.08

        oscillator.connect(gain)
        gain.connect(ctx.destination)

        oscillator.start()
        setTimeout(() => {
          oscillator.stop()
          ctx.close?.()
        }, 160)
      } catch (e) {
        // En algunos navegadores el autoplay está restringido; no rompemos la UI.
      }
    }

    function markAllAsRead() {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    }

    function markAsRead(id) {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    }

    // Socket.io: notificación solo para administradores
    useEffect(() => {
      if (!user || !(user.role === 'admin' || user.role === 'administrador')) return
      const token = localStorage.getItem('etp_token')
      const socket = connectSocket(token)
      socket.on('nuevo_usuario', (data) => {
        const item = {
          id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
          title: 'Nuevo usuario',
          body: `${data?.name || 'Sin nombre'} (${data?.email || 'Sin email'})`,
          url: '/admin/users',
          read: false,
          at: Date.now(),
        }
        setNotifications((prev) => [item, ...prev].slice(0, 20))
        playBellSound()

        toast.info(
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              aria-hidden="true"
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: 'rgba(255,255,255,0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <i className="bi bi-bell-fill" />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 900 }}>Nuevo usuario</div>
              <div style={{ opacity: 0.95, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.body}
              </div>
            </div>
            <button
              className="btn btn-sm"
              style={{ background: 'rgba(255,255,255,0.18)', color: '#fff', border: 'none', fontWeight: 800 }}
              onClick={() => navigate(item.url)}
            >
              Ver
            </button>
          </div>,
          {
            position: 'top-right',
            autoClose: 8000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            style: { background: '#1877F2', color: '#fff', borderRadius: 14 },
          }
        )
      })
      socket.on('nueva_preinscripcion', (data) => {
        const item = {
          id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
          title: 'Nueva pre-inscripción',
          body: `${data?.nombres || data?.name || 'Sin nombre'} (${data?.email || 'Sin email'})`,
          url: '/admin/pre-inscripciones',
          read: false,
          at: Date.now(),
        }
        setNotifications((prev) => [item, ...prev].slice(0, 20))
        playBellSound()

        toast.info(
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              aria-hidden="true"
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: 'rgba(255,255,255,0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <i className="bi bi-bell-fill" />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 900 }}>Pre-inscripción</div>
              <div style={{ opacity: 0.95, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.body}
              </div>
            </div>
            <button
              className="btn btn-sm"
              style={{ background: 'rgba(255,255,255,0.18)', color: '#fff', border: 'none', fontWeight: 800 }}
              onClick={() => navigate(item.url)}
            >
              Ver
            </button>
          </div>,
          {
            position: 'top-right',
            autoClose: 8000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            style: { background: '#1877F2', color: '#fff', borderRadius: 14 },
          }
        )
      })
      return () => {
        socket.off('nuevo_usuario')
        socket.off('nueva_preinscripcion')
        disconnectSocket()
      }
    }, [user])

    useEffect(() => {
      const onLogin = (ev) => setUser(ev?.detail || null)
      window.addEventListener('etp:login', onLogin)
      return () => window.removeEventListener('etp:login', onLogin)
    }, [])

    const handleLogout = () => {
      localStorage.removeItem('etp_token')
      localStorage.removeItem('etp_user')
      setUser(null)
    }

    const handleLogin = (u) => setUser(u)

    const closeMobileMenu = () => {
      try {
        const nav = document.getElementById('navbarSupportedContent')
        if (!nav) return
        if (nav.classList.contains('show')) {
          nav.classList.remove('show')
          const toggler = document.querySelector('.navbar-toggler')
          if (toggler) toggler.setAttribute('aria-expanded', 'false')
        }
      } catch (e) { /* ignore */ }
    }



    return (
      <>
        <nav className={`navbar navbar-expand-lg navbar-light nav-enhanced ${scrolled ? 'scrolled' : ''}`}>
          <div className="container">
            <Link className="navbar-brand d-flex align-items-center" to="/" aria-label="ETP - Escuelas Técnicas del Perú">
              <img src="/assets/images/logo.jpg" alt="ETP" className="me-2 brand-img" />
              <div className="brand-text">
                <div className="brand-title">ETP - Escuelas Técnicas</div>
                <div className="brand-subtitle">del Perú</div>
              </div>
            </Link>
            <button   
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarSupportedContent"
              aria-controls="navbarSupportedContent"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarSupportedContent">
              <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center">
                <li className="nav-item">
                  <Link className="nav-link active" aria-current="page" to="/" onClick={closeMobileMenu}>Inicio</Link>
                </li>
                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle" href="#" id="cursosDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    Cursos
                  </a>
                  <ul className="dropdown-menu" aria-labelledby="cursosDropdown">
                    <li><Link className="dropdown-item" to="/talleres" onClick={closeMobileMenu}>Talleres</Link></li>
                    <li><Link className="dropdown-item" to="/cursos-informatica" onClick={closeMobileMenu}>Cortos</Link></li>
                  </ul>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/programas" onClick={closeMobileMenu}>Carreras</Link>
                </li>
                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle" href="#" id="nosotrosDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    Nosotros
                  </a>
                  <ul className="dropdown-menu" aria-labelledby="nosotrosDropdown">
                    <li><Link className="dropdown-item" to="/nosotros" onClick={closeMobileMenu}>Sobre nosotros</Link></li>
                    <li><Link className="dropdown-item" to="/galeria" onClick={closeMobileMenu}>Ver galería</Link></li>
                    <li><Link className="dropdown-item" to="/blogs" onClick={closeMobileMenu}>Blogs</Link></li>
                  </ul>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/noticias" onClick={closeMobileMenu}>Noticias</Link>
                </li>
                {/* Buscador compacto */}
                <li className="nav-item ms-2 position-relative">
                  <div className="input-group input-group-sm" style={{width:180}}>
                    <input
                      type="search"
                      className="form-control form-control-sm border-0"
                      placeholder="Buscar..."
                      value={query}
                      onChange={e => { setQuery(e.target.value); setShowResults(true) }}
                      onFocus={() => setShowResults(true)}
                      onBlur={() => setTimeout(() => setShowResults(false), 200)}
                    />
                    <span className="input-group-text bg-white border-0"><i className="bi bi-search"></i></span>
                  </div>
                  {showResults && results.length > 0 && (
                    <div className="position-absolute bg-white shadow rounded mt-1 w-100" style={{zIndex:1050,maxHeight:240,overflowY:'auto'}}>
                      {results.map(c => (
                        <div
                          key={c.id}
                          className="px-3 py-2 border-bottom small"
                          style={{cursor:'pointer'}}
                          onMouseDown={() => { navigate(`/curso/${c.slug || c.id}`); setQuery(''); setShowResults(false); closeMobileMenu() }}
                        >
                          <strong>{c.title || c.titulo}</strong>
                          {c.subtitle && <div className="text-muted" style={{fontSize:'.75rem'}}>{c.subtitle}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </li>

                {user && isAdmin && (
                  <li className="nav-item ms-2 position-relative">
                    <a
                      className="nav-link dropdown-toggle text-white"
                      href="#"
                      id="notifMenu"
                      role="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                      onClick={(e) => {
                        e.preventDefault()
                        // Al abrir, marcamos como leídas para el badge.
                        markAllAsRead()
                      }}
                      style={{ padding: '.35rem .75rem', background: 'rgba(255,255,255,0.08)', borderRadius: 999 }}
                    >
                      <i className="bi bi-bell-fill" style={{ fontSize: '1.1rem' }} aria-hidden="true" />
                      {unreadCount > 0 && (
                        <span
                          className="position-absolute top-0 start-100 translate-middle badge rounded-pill"
                          style={{ background: '#ff3b30', fontSize: '.7rem', padding: '0.25rem 0.45rem' }}
                        >
                          {unreadCount}
                        </span>
                      )}
                    </a>

                    <ul
                      className="dropdown-menu dropdown-menu-end"
                      aria-labelledby="notifMenu"
                      style={{
                        width: 360,
                        maxWidth: '90vw',
                        padding: 10,
                        maxHeight: 420,
                        overflowY: 'auto',
                        borderRadius: 14,
                      }}
                    >
                      {notifications.length === 0 ? (
                        <li style={{ padding: '10px 8px', color: 'rgba(0,0,0,0.65)', fontWeight: 700 }}>
                          Sin notificaciones
                        </li>
                      ) : (
                        notifications.slice(0, 8).map((n) => (
                          <li key={n.id} style={{ marginBottom: 6 }}>
                            <button
                              className="dropdown-item"
                              style={{
                                borderRadius: 12,
                                whiteSpace: 'normal',
                                border: '1px solid rgba(24,119,242,0.08)',
                                background: n.read ? '#f8f9fa' : 'rgba(24,119,242,0.08)',
                              }}
                              onClick={() => {
                                markAsRead(n.id)
                                navigate(n.url)
                                closeMobileMenu()
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                                <span aria-hidden="true" style={{ fontSize: '1rem', color: '#1877F2', marginTop: 1 }}>
                                  <i className="bi bi-bell" />
                                </span>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontWeight: 900, marginBottom: 2, lineHeight: 1.2 }}>
                                    {n.title}
                                  </div>
                                  <div style={{ color: 'rgba(0,0,0,0.65)', fontSize: '0.85rem', lineHeight: 1.2 }}>
                                    {n.body}
                                  </div>
                                </div>
                              </div>
                            </button>
                          </li>
                        ))
                      )}

                      {notifications.length > 0 && (
                        <li>
                          <hr className="dropdown-divider" style={{ margin: '8px 0' }} />
                          <button
                            className="dropdown-item text-center"
                            onClick={() => {
                              navigate('/admin/pre-inscripciones')
                              closeMobileMenu()
                            }}
                            style={{ fontWeight: 900 }}
                          >
                            Ir a pre-inscripciones
                          </button>
                        </li>
                      )}
                    </ul>
                  </li>
                )}
                {/* Auth area */}
                {!user && (
                  <li className="nav-item ms-2">
                    <Link className="btn btn-login-nav" to="/login" onClick={closeMobileMenu}>
                      <i className="bi bi-person-circle me-2"></i>Login
                    </Link>
                  </li>
                )}

                {user && (
                  <li className="nav-item dropdown ms-3">
                    <a className="nav-link dropdown-toggle text-white d-flex align-items-center gap-1" href="#" id="userMenu" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                      <span style={{maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block'}}>
                        {user.name || user.email}
                      </span>
                    </a>
                    <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userMenu">
                      <li><Link className="dropdown-item" to="/admin" onClick={closeMobileMenu}>Panel</Link></li>
                      <li><hr className="dropdown-divider" /></li>
                      <li><button className="dropdown-item" onClick={handleLogout}>Cerrar sesión</button></li>
                    </ul>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </nav>

        {/* Login handled on /login page */}
      </>
    )
  }
