import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function SectionCard({ title, desc, icon, onManage }){
  return (
    <div className="col-12 col-md-6 col-lg-4 mb-3">
      <div className="card h-100 shadow-sm">
        <div className="card-body d-flex flex-column">
          <div className="d-flex align-items-center mb-3">
            <div style={{width:48,height:48,display:'grid',placeItems:'center',borderRadius:8,background:'linear-gradient(180deg,var(--primary),var(--accent))',color:'#fff',marginRight:12}}>
              <i className={`bi ${icon}`} style={{fontSize:20}}></i>
            </div>
            <div>
              <h5 className="card-title mb-0">{title}</h5>
              <small className="text-muted">{desc}</small>
            </div>
          </div>

          <div className="mt-auto d-flex gap-2">
            <button className="btn btn-outline-secondary" onClick={() => onManage && onManage(title)}>Ver</button>
            <button className="btn btn-accent" onClick={() => onManage && onManage(title)}>Editar</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminDashboard(){
  const navigate = useNavigate()
  useEffect(() => {
    try {
      const raw = localStorage.getItem('etp_user')
      const user = raw ? JSON.parse(raw) : null
      if (!user || user.role !== 'administrador') {
        navigate('/login')
      }
    } catch (e) { navigate('/login') }
  }, [navigate])

  const cards = [
    { title: 'Carousel', desc: 'Administrar diapositivas del home', route: '/admin/carousel' },
    { title: 'Media', desc: 'Administrar imágenes y recursos', route: '/admin/media' },
    { title: 'Usuarios', desc: 'Gestionar administradores', route: '/admin/users' },
    { title: 'Cursos', desc: 'Agregar/editar cursos', route: '/admin/courses' },
  ]

  const handleManage = (section) => {
    if (section === 'Carousel') navigate('/admin/carousel')
    else if (section === 'Cursos') navigate('/admin/courses')
    else if (section === 'Noticias') navigate('/admin/noticias')
    else if (section === 'Media') navigate('/admin/media')
    else if (section === 'Social Links') navigate('/admin/social')
    else if (section === 'Usuarios') navigate('/admin/users')
    else alert('Gestionar: ' + section)
  }
  return (
    <div className="container section-padding">
      <div className="row mb-4">
        <div className="col-12 d-flex align-items-center justify-content-between">
          <div>
            <h3>Panel de administración</h3>
            <p className="text-muted mb-0">Accede a las secciones editables del sitio (carrusel, cursos, noticias, medios, enlaces sociales, usuarios).</p>
          </div>
        </div>
      </div>

      <div className="row">
        <SectionCard title="Carousel" desc="Slides principales del home" icon="bi-images" onManage={handleManage} />
        <SectionCard title="Cursos" desc="Cursos, talleres, programas e informática" icon="bi-journal-bookmark" onManage={handleManage} />
        <SectionCard title="Noticias" desc="Publicaciones y previsualizaciones" icon="bi-newspaper" onManage={handleManage} />
        <SectionCard title="Media" desc="Gestionar imágenes y recursos multimedia" icon="bi-card-image" onManage={handleManage} />
        <SectionCard title="Social Links" desc="Números y URLs de redes sociales" icon="bi-share" onManage={handleManage} />
        <SectionCard title="Usuarios" desc="Administradores y editores del sitio" icon="bi-people" onManage={handleManage} />
      </div>

      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Notas</h5>
              <p className="card-text text-muted">Esta interfaz es el dashboard inicial. Los editores completos (formularios de carga, endpoints, subida de media) se implementarán cuando el backend exponga las APIs necesarias siguiendo las tablas propuestas.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
