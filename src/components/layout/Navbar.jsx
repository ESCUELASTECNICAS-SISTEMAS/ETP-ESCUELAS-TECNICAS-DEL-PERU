  import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { connectSocket, disconnectSocket } from '../../utils/socket'
import { endpoints } from '../../utils/apiStatic'
import { toast } from 'react-toastify'

export default function Navbar() {
  const [user, setUser] = useState(null)
  const [scrolled, setScrolled] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [courses, setCourses] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [navKey, setNavKey] = useState(0) // Forzar re-render
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
      const initializeUser = () => {
        try {
          const raw = localStorage.getItem('etp_user')
          const token = localStorage.getItem('etp_token')
          
          // Si no hay token o usuario, limpiar completamente
          if (!token || !raw) {
            setUser(null)
            localStorage.removeItem('etp_token')
            localStorage.removeItem('etp_user')
            return
          }
          
          // Parsear y validar usuario
          const user = JSON.parse(raw)
          if (user && user.id) {
            setUser(user)
          } else {
            // Usuario inválido, limpiar todo
            setUser(null)
            localStorage.removeItem('etp_token')
            localStorage.removeItem('etp_user')
          }
        } catch (e) {
          // Error en parseo, limpiar todo
          setUser(null)
          localStorage.removeItem('etp_token')
          localStorage.removeItem('etp_user')
        }
      }
      
      initializeUser()
      
      // Escuchar cambios en storage
      const handleStorageChange = (e) => {
        if (e.key === 'etp_user' || e.key === 'etp_token') {
          initializeUser()
        }
      }
      
      window.addEventListener('storage', handleStorageChange)
      
      return () => {
        window.removeEventListener('storage', handleStorageChange)
      }
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
      const onLogout = () => setUser(null)
      
      window.addEventListener('etp:login', onLogin)
      window.addEventListener('etp:logout', onLogout)
      
      return () => {
        window.removeEventListener('etp:login', onLogin)
        window.removeEventListener('etp:logout', onLogout)
      }
    }, [])

    const handleLogout = () => {
      // Limpiar localStorage primero
      localStorage.removeItem('etp_token')
      localStorage.removeItem('etp_user')
      
      // Forzar estado a null inmediatamente
      setUser(null)
      
      // Forzar re-renderizado completo del navbar
      setNavKey(prev => prev + 1)
      
      // Disparar evento global
      window.dispatchEvent(new CustomEvent('etp:logout', { detail: null }))
      
      // Cerrar menú móvil
      closeMobileMenu()
      
      // Forzar limpieza completa de estado
      setTimeout(() => {
        setUser(null)
        setNavKey(prev => prev + 1)
        // Verificar que localStorage esté limpio
        const token = localStorage.getItem('etp_token')
        const user = localStorage.getItem('etp_user')
        if (token || user) {
          localStorage.removeItem('etp_token')
          localStorage.removeItem('etp_user')
        }
      }, 50)
      
      // Forzar navegación si estamos en página de admin
      if (window.location.pathname.startsWith('/admin')) {
        setTimeout(() => {
          navigate('/')
        }, 100)
      }
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
        <style>{`
          @keyframes borderGlow {
            0% { 
              box-shadow: 0 2px 8px rgba(255, 107, 53, 0.6);
              filter: brightness(1);
            }
            50% { 
              box-shadow: 0 2px 12px rgba(255, 107, 53, 0.9);
              filter: brightness(1.2);
            }
            100% { 
              box-shadow: 0 2px 8px rgba(255, 107, 53, 0.6);
              filter: brightness(1);
            }
          }
        `}</style>
        <nav key={navKey} className={`navbar navbar-expand-lg navbar-light nav-enhanced ${scrolled ? 'scrolled' : ''}`} style={{
          background: scrolled 
            ? 'linear-gradient(135deg, rgba(3, 18, 196, 0.95) 0%, rgba(2, 12, 150, 0.95) 100%)'
            : 'linear-gradient(135deg, rgba(3, 18, 196, 0.98) 0%, rgba(2, 12, 150, 0.98) 100%)',
          backdropFilter: 'blur(12px)',
          boxShadow: scrolled 
            ? '0 8px 32px rgba(25, 118, 210, 0.25)'
            : '0 4px 20px rgba(25, 118, 210, 0.15)',
          borderRadius: '0',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          border: 'none',
          padding: '0.5rem 0',
          borderBottom: '3px solid #ff6b35',
          boxShadow: '0 2px 8px rgba(255, 107, 53, 0.6)',
          animation: 'borderGlow 2s ease-in-out infinite'
        }}>
          <div className="container">
            <Link className="navbar-brand d-flex align-items-center" to="/" aria-label="ETP - Escuelas Técnicas del Perú" style={{
              transition: 'transform 0.3s ease, filter 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)'
              e.currentTarget.style.filter = 'brightness(1.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.filter = 'brightness(1)'
            }}>
              <div style={{
                width: '35px',
                height: '35px',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(255,255,255,0.2)',
                marginRight: '8px'
              }}>
                <img src="/assets/images/logo.jpg" alt="ETP" className="brand-img" style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }} />
              </div>
              <div className="brand-text">
                <div className="brand-title" style={{
                  fontWeight: '700',
                  fontSize: '1.1rem',
                  color: '#ffffff',
                  lineHeight: '1.1',
                  textShadow: '0 1px 2px rgba(0,0,0,0.4)'
                }}>ETP - Escuelas Técnicas</div>
                <div className="brand-subtitle" style={{
                  fontWeight: '500',
                  fontSize: '0.75rem',
                  color: 'rgba(255,255,255,0.85)',
                  lineHeight: '1.1'
                }}>del Perú</div>
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
              style={{
                border: '2px solid rgba(255,255,255,0.3)',
                borderRadius: '12px',
                padding: '8px 12px',
                transition: 'all 0.3s ease',
                backgroundColor: 'rgba(255,255,255,0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'
              }}>
              <span className="navbar-toggler-icon" style={{
                backgroundImage: "url(\"data:image/svg+xml;charset=utf8,%3Csvg viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke='rgba(255,255,255,0.9)' stroke-width='2' stroke-linecap='round' stroke-miterlimit='10' d='M4 8h24M4 16h24M4 24h24'/%3E%3C/svg%3E\")"
              }}></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarSupportedContent">
              <ul className="navbar-nav ms-auto mb-0 mb-lg-0 align-items-center">
                <li className="nav-item">
                  <Link className="nav-link active" aria-current="page" to="/" onClick={closeMobileMenu} style={{
                    color: '#ffffff',
                    fontWeight: '500',
                    fontSize: '0.85rem',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '6px',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    backgroundColor: 'rgba(255,255,255,0.12)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.12)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}>Inicio</Link>
                </li>
                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle" href="#" id="cursosDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false" style={{
                    color: '#ffffff',
                    fontWeight: '500',
                    fontSize: '0.85rem',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '6px',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}>
                    Cursos
                  </a>
                  <ul className="dropdown-menu" aria-labelledby="cursosDropdown" style={{
                    border: 'none',
                    borderRadius: '16px',
                    boxShadow: '0 8px 32px rgba(25, 118, 210, 0.25)',
                    backdropFilter: 'blur(12px)',
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    padding: '0.5rem',
                    marginTop: '0.5rem'
                  }}>
                    <li><Link className="dropdown-item" to="/talleres" onClick={closeMobileMenu} style={{
                      borderRadius: '12px',
                      padding: '0.75rem 1rem',
                      fontWeight: '500',
                      transition: 'all 0.3s ease',
                      color: '#1565c0'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(25, 118, 210, 0.1)'
                      e.currentTarget.style.transform = 'translateX(4px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.transform = 'translateX(0)'
                    }}>Talleres</Link></li>
                    <li><Link className="dropdown-item" to="/cursos-informatica" onClick={closeMobileMenu} style={{
                      borderRadius: '12px',
                      padding: '0.75rem 1rem',
                      fontWeight: '500',
                      transition: 'all 0.3s ease',
                      color: '#1565c0'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(25, 118, 210, 0.1)'
                      e.currentTarget.style.transform = 'translateX(4px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.transform = 'translateX(0)'
                    }}>Cortos</Link></li>
                  </ul>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/programas" onClick={closeMobileMenu} style={{
                    color: '#ffffff',
                    fontWeight: '500',
                    fontSize: '0.85rem',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '6px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}>Carreras</Link>
                </li>
                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle" href="#" id="nosotrosDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false" style={{
                    color: '#ffffff',
                    fontWeight: '500',
                    fontSize: '0.85rem',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '6px',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}>
                    Nosotros
                  </a>
                  <ul className="dropdown-menu" aria-labelledby="nosotrosDropdown" style={{
                    border: 'none',
                    borderRadius: '16px',
                    boxShadow: '0 8px 32px rgba(25, 118, 210, 0.25)',
                    backdropFilter: 'blur(12px)',
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    padding: '0.5rem',
                    marginTop: '0.5rem'
                  }}>
                    <li><Link className="dropdown-item" to="/nosotros" onClick={closeMobileMenu} style={{
                      borderRadius: '12px',
                      padding: '0.75rem 1rem',
                      fontWeight: '500',
                      transition: 'all 0.3s ease',
                      color: '#1565c0'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(25, 118, 210, 0.1)'
                      e.currentTarget.style.transform = 'translateX(4px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.transform = 'translateX(0)'
                    }}>Sobre nosotros</Link></li>
                    <li><Link className="dropdown-item" to="/galeria" onClick={closeMobileMenu} style={{
                      borderRadius: '12px',
                      padding: '0.75rem 1rem',
                      fontWeight: '500',
                      transition: 'all 0.3s ease',
                      color: '#1565c0'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(25, 118, 210, 0.1)'
                      e.currentTarget.style.transform = 'translateX(4px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.transform = 'translateX(0)'
                    }}>Ver galería</Link></li>
                    <li><Link className="dropdown-item" to="/blogs" onClick={closeMobileMenu} style={{
                      borderRadius: '12px',
                      padding: '0.75rem 1rem',
                      fontWeight: '500',
                      transition: 'all 0.3s ease',
                      color: '#1565c0'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(25, 118, 210, 0.1)'
                      e.currentTarget.style.transform = 'translateX(4px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.transform = 'translateX(0)'
                    }}>Blogs</Link></li>
                  </ul>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/noticias" onClick={closeMobileMenu} style={{
                    color: '#ffffff',
                    fontWeight: '500',
                    fontSize: '0.85rem',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '6px',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}>Noticias</Link>
                </li>
                {/* Buscador compacto */}
                <li className="nav-item ms-2 position-relative">
                  <div className="input-group input-group-sm" style={{
                    width: 160,
                    borderRadius: '25px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease'
                  }}>
                    <input
                      type="search"
                      className="form-control form-control-sm border-0"
                      placeholder="Buscar..."
                      value={query}
                      onChange={e => { setQuery(e.target.value); setShowResults(true) }}
                      onFocus={() => setShowResults(true)}
                      onBlur={() => setTimeout(() => setShowResults(false), 200)}
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        padding: '0.3rem 0.8rem',
                        fontSize: '0.8rem',
                        fontWeight: '500'
                      }}
                    />
                    <span className="input-group-text bg-white border-0" style={{
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(25, 118, 210, 0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.9)'
                    }}><i className="bi bi-search" style={{color: '#1976d2'}}></i></span>
                  </div>
                  {showResults && results.length > 0 && (
                    <div className="position-absolute bg-white shadow rounded mt-1 w-100" style={{
                      zIndex:1050,
                      maxHeight:240,
                      overflowY:'auto',
                      borderRadius: '16px',
                      boxShadow: '0 8px 32px rgba(25, 118, 210, 0.25)',
                      border: 'none',
                      backdropFilter: 'blur(12px)',
                      backgroundColor: 'rgba(255,255,255,0.95)'
                    }}>
                      {results.map(c => (
                        <div
                          key={c.id}
                          className="px-3 py-2 border-bottom small"
                          style={{
                            cursor:'pointer',
                            transition: 'all 0.3s ease',
                            borderRadius: '8px',
                            margin: '4px'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(25, 118, 210, 0.08)'
                            e.currentTarget.style.transform = 'translateX(4px)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                            e.currentTarget.style.transform = 'translateX(0)'
                          }}
                          onMouseDown={() => { navigate(`/curso/${c.slug || c.id}`); setQuery(''); setShowResults(false); closeMobileMenu() }}
                        >
                          <strong style={{color: '#1565c0'}}>{c.title || c.titulo}</strong>
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
                    <Link className="btn" to="/login" onClick={closeMobileMenu} style={{
                      background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                      color: '#1976d2',
                      border: 'none',
                      borderRadius: '25px',
                      padding: '0.4rem 1.2rem',
                      fontWeight: '600',
                      fontSize: '0.8rem',
                      boxShadow: '0 4px 16px rgba(255,255,255,0.3)',
                      transition: 'all 0.3s ease',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 6px 24px rgba(255,255,255,0.4)'
                      e.currentTarget.style.background = 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(255,255,255,0.3)'
                      e.currentTarget.style.background = 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
                    }}>
                      <i className="bi bi-person-circle me-2"></i>Login
                    </Link>
                  </li>
                )}

                {user && (
                  <li className="nav-item dropdown ms-3">
                    <a className="nav-link dropdown-toggle text-white d-flex align-items-center gap-1" href="#" id="userMenu" role="button" data-bs-toggle="dropdown" aria-expanded="false" style={{
                      padding: '0.3rem 0.8rem',
                      borderRadius: '20px',
                      backgroundColor: 'rgba(255,255,255,0.12)',
                      transition: 'all 0.3s ease',
                      fontWeight: '500',
                      fontSize: '0.8rem'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.25)'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}>
                      <i className="bi bi-person-circle" style={{fontSize: '1.1rem'}}></i>
                      <span style={{
                        maxWidth: '120px', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        whiteSpace: 'nowrap', 
                        display: 'inline-block'
                      }}>
                        {user.name || user.email}
                      </span>
                    </a>
                    <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userMenu" style={{
                      border: 'none',
                      borderRadius: '16px',
                      boxShadow: '0 8px 32px rgba(25, 118, 210, 0.25)',
                      backdropFilter: 'blur(12px)',
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      padding: '0.5rem',
                      marginTop: '0.5rem'
                    }}>
                      <li><Link className="dropdown-item" to="/admin" onClick={closeMobileMenu} style={{
                        borderRadius: '12px',
                        padding: '0.75rem 1rem',
                        fontWeight: '500',
                        transition: 'all 0.3s ease',
                        color: '#1565c0'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(25, 118, 210, 0.1)'
                        e.currentTarget.style.transform = 'translateX(4px)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent'
                        e.currentTarget.style.transform = 'translateX(0)'
                      }}><i className="bi bi-speedometer2 me-2"></i>Panel</Link></li>
                      <li><hr className="dropdown-divider" style={{margin: '0.5rem 0'}} /></li>
                      <li><button className="dropdown-item" onClick={handleLogout} style={{
                        borderRadius: '12px',
                        padding: '0.75rem 1rem',
                        fontWeight: '500',
                        transition: 'all 0.3s ease',
                        color: '#dc3545'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(220, 53, 69, 0.1)'
                        e.currentTarget.style.transform = 'translateX(4px)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent'
                        e.currentTarget.style.transform = 'translateX(0)'
                      }}><i className="bi bi-box-arrow-right me-2"></i>Cerrar sesión</button></li>
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
