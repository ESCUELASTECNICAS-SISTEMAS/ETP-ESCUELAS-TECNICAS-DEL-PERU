import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

function SectionCard({ title, desc, icon, to }){
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
						<Link to={to || '#'} className="btn btn-outline-secondary">Ver</Link>
						<Link to={to || '#'} className="btn btn-accent">Editar</Link>
					</div>
				</div>
			</div>
		</div>
	)
}

export default function AdminDashboard(){
	const navigate = useNavigate()
	const [courses, setCourses] = useState([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(null)

	useEffect(()=>{
		try{
			const raw = localStorage.getItem('etp_user')
			const user = raw ? JSON.parse(raw) : null
			if (!user || user.role !== 'administrador') navigate('/login')
		}catch(e){ navigate('/login') }
	}, [navigate])

	useEffect(()=>{
		const fetch = async () => {
			setLoading(true); setError(null)
			try{
				const token = localStorage.getItem('etp_token')
				const headers = token ? { Authorization: `Bearer ${token}` } : {}
				const base = 'https://servidorpaginaetp-production.up.railway.app'
				const res = await axios.get(`${base}/courses`, { headers })
				setCourses(res.data || [])
			}catch(err){
				console.error('admin fetch courses', err)
				setError('No se pudieron cargar los cursos. Revisa CORS o endpoint.')
			}finally{ setLoading(false) }
		}
		fetch()
	}, [])

	const cards = [
		{ title: 'Carousel', desc: 'Slides del home', icon: 'bi-images', to:'/admin/carousel' },
		{ title: 'Cursos', desc: 'Cursos y programas', icon: 'bi-journal-bookmark', to:'/admin/courses' },
		{ title: 'Blog', desc: 'Gestionar blog y noticias', icon: 'bi-journal-richtext', to:'/admin/blog' },
		{ title: 'Noticias', desc: 'Gestionar noticias del sitio', icon: 'bi-newspaper', to:'/admin/noticias' },
		{ title: 'Pre-inscripciones', desc: 'Leads de interés', icon: 'bi-ui-checks', to:'/admin/pre-inscripciones' },
		{ title: 'Certificaciones', desc: 'Gestionar certificados y constancias', icon: 'bi-award', to:'/admin/certificaciones' },
		{ title: 'Docentes', desc: 'Gestionar docentes', icon: 'bi-person-badge', to:'/admin/docentes' },
		{ title: 'Convenios', desc: 'Gestionar convenios por curso', icon: 'bi-handshake', to:'/admin/convenios' },
		{ title: 'Seminarios', desc: 'Gestionar seminarios por curso', icon: 'bi-calendar-event', to:'/admin/seminarios' },
		{ title: 'Media', desc: 'Imágenes y recursos', icon: 'bi-card-image', to:'/admin/media' },
		{ title: 'Galería', desc: 'Editar galería pública', icon: 'bi-grid-3x3-gap', to:'/admin/gallery' },
		{ title: 'Tips', desc: 'Gestionar tips y recomendaciones', icon: 'bi-lightbulb', to:'/admin/tips' },
		{ title: 'Social Links', desc: 'Enlaces y números sociales', icon: 'bi-share', to:'/admin/social' },
		{ title: 'Nosotros', desc: 'Quiénes somos — contenido público', icon: 'bi-building', to:'/admin/nosotros' },
		{ title: 'Usuarios', desc: 'Gestión de administradores', icon: 'bi-people', to:'/admin/users' }
	]

	// añadir tarjeta para eventos de login
	cards.push({ title: 'Eventos de acceso', desc: 'Registros e intentos de login', icon: 'bi-lock', to: '/admin/login-events' })

	return (
		<div className="container section-padding">
			<div className="row mb-4">
				<div className="col-12 d-flex align-items-center justify-content-between">
					<div>
						<h3>Panel de administración</h3>
						<p className="text-muted mb-0">Accede a las secciones editables del sitio.</p>
					</div>
					<div>
						<Link to="/admin/courses" className="btn btn-outline-primary me-2">Ver Cursos</Link>
						<Link to="/admin/docentes" className="btn btn-outline-primary me-2">Docentes</Link>
						<Link to="/admin/login-events" className="btn btn-outline-secondary me-2">Eventos de acceso</Link>
						<Link to="/admin/carousel" className="btn btn-accent">Editar Carousel</Link>
					</div>
				</div>
			</div>

			<div className="row">
				{cards.map(c => <SectionCard key={c.title} {...c} />)}
			</div>

            
		</div>
	)
}

