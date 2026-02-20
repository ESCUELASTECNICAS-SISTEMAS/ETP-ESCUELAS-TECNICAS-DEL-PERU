import React, { useEffect, useState } from 'react'
import './index.css'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import HomePage from './pages/HomePage'
import CursosPage from './pages/CursosPage'
import CarrerasPage from './pages/CarrerasPage'
import CursosInformatica from './pages/TalleresInformatica'
import CourseDetail from './pages/CourseDetail'
import NoticiasPage from './pages/NoticiasPage'
import NoticiaDetail from './pages/NoticiaDetail'
import LoginPage from './pages/LoginPage'
import AdminDashboard from './pages/AdminDashboard'
import AdminCarousel from './pages/AdminCarousel'
import AdminMedia from './pages/AdminMedia'
import AdminCourses from './pages/AdminCourses'
import AdminCertificaciones from './pages/AdminCertificaciones'
import AdminDocentes from './pages/AdminDocentes'
import AdminConvenios from './pages/AdminConvenios'
import AdminSeminarios from './pages/AdminSeminarios'
import AdminNoticias from './pages/AdminNoticias'
import AdminSocialLinks from './pages/AdminSocialLinks'
import AdminRoute from './components/layout/AdminRoute'
import { Routes, Route } from 'react-router-dom'
import axios from 'axios'
import { endpoints } from './utils/apiStatic'

export default function App(){
  const [waOpen, setWaOpen] = React.useState(false)
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/cursos" element={<CursosPage />} />
          <Route path="/programas" element={<CarrerasPage />} />
          <Route path="/noticias" element={<NoticiasPage />} />
          <Route path="/noticia/:id" element={<NoticiaDetail />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/carousel" element={<AdminRoute><AdminCarousel /></AdminRoute>} />
            <Route path="/admin/media" element={<AdminRoute><AdminMedia /></AdminRoute>} />
            <Route path="/admin/courses" element={<AdminRoute><AdminCourses /></AdminRoute>} />
            <Route path="/admin/certificaciones" element={<AdminRoute><AdminCertificaciones /></AdminRoute>} />
            <Route path="/admin/certificaciones/:courseId" element={<AdminRoute><AdminCertificaciones /></AdminRoute>} />
            <Route path="/admin/docentes" element={<AdminRoute><AdminDocentes /></AdminRoute>} />
            <Route path="/admin/convenios" element={<AdminRoute><AdminConvenios /></AdminRoute>} />
            <Route path="/admin/seminarios" element={<AdminRoute><AdminSeminarios /></AdminRoute>} />
            <Route path="/admin/noticias" element={<AdminRoute><AdminNoticias /></AdminRoute>} />
            <Route path="/admin/social" element={<AdminRoute><AdminSocialLinks /></AdminRoute>} />
          <Route path="/cursos-informatica" element={<CursosInformatica />} />
          <Route path="/curso/:id" element={<CourseDetail />} />
          <Route path="/programa/:id" element={<CourseDetail />} />
        </Routes>
      </main>
      <Footer />

      {/* ── Floating social + WhatsApp buttons (pure Bootstrap) ── */}
      <div
        className="position-fixed bottom-0 end-0 p-3 d-flex flex-column align-items-end gap-2"
        style={{ zIndex: 1080 }}
      >
        {/* Instagram & Facebook from API */}
        <SocialLinksButtons />

        {/* Divider */}
        <hr className="w-100 my-0 border-secondary opacity-25" />

        {/* WhatsApp sub-numbers (shown when open) */}
        {waOpen && (
          <div className="d-flex flex-column gap-2 align-items-end">
            <a
              href="https://wa.me/51950340502?text=Hola%20quiero%20m%C3%A1s%20info"
              target="_blank" rel="noopener noreferrer"
              className="btn btn-success rounded-pill shadow-sm d-flex align-items-center gap-2 px-3 py-2"
              aria-label="WhatsApp 950 340 502"
            >
              <i className="bi bi-whatsapp fs-5"></i>
              <span className="small fw-semibold">950 340 502</span>
            </a>
            <a
              href="https://wa.me/51962324393?text=Hola%20quiero%20m%C3%A1s%20info"
              target="_blank" rel="noopener noreferrer"
              className="btn btn-success rounded-pill shadow-sm d-flex align-items-center gap-2 px-3 py-2"
              aria-label="WhatsApp 962 324 393"
            >
              <i className="bi bi-whatsapp fs-5"></i>
              <span className="small fw-semibold">962 324 393</span>
            </a>
          </div>
        )}

        {/* WhatsApp main toggle button */}
        <button
          onClick={() => setWaOpen(o => !o)}
          className="btn btn-success rounded-circle shadow d-flex align-items-center justify-content-center border-0"
          style={{ width: 58, height: 58, fontSize: '1.5rem' }}
          aria-label="Contactar por WhatsApp"
        >
          <i className={`bi ${waOpen ? 'bi-x-lg' : 'bi-whatsapp'}`}></i>
        </button>
      </div>
    </div>
  )
}

function SocialLinksButtons(){
  const [links, setLinks] = useState([])

  useEffect(() => {
    let mounted = true
    const parseData = (data) => {
      if(!data) return []
      // If API returns array
      if(Array.isArray(data)) return data
      // If API returns object with network/value
      if(data.network && data.value) return [data]
      // If API returns object with keys for networks, convert
      return Object.keys(data).map(k => {
        const v = data[k]
        if(typeof v === 'string') return { network: k, value: v, active: true }
        if(v && v.network && v.value) return v
        return null
      }).filter(Boolean)
    }

    const load = async () => {
      try{
        // First try the list endpoint (/social-links)
        const res = await axios.get(endpoints.SOCIAL_LINKS)
        if(!mounted) return
        const parsed = parseData(res.data)
        setLinks(parsed)
      }catch(e){
        // fallback: attempt to fetch by id (/social-links/1)
        try{
          const res2 = await axios.get(`${endpoints.SOCIAL_LINKS}/1`)
          if(!mounted) return
          const parsed = parseData(res2.data)
          setLinks(parsed)
        }catch(_){
          // leave empty on error
        }
      }
    }

    load()
    return () => { mounted = false }
  }, [])

  const visible = (links || []).filter(l => l && l.active)
  const filtered = visible.filter(l => ['instagram','facebook'].includes(String(l.network).toLowerCase()))

  if(!filtered.length) return null

  const netConfig = {
    instagram: {
      icon: 'bi bi-instagram',
      style: { background: 'radial-gradient(circle at 30% 107%,#fdf497 0%,#fd5949 45%,#d6249f 60%,#285AEB 90%)', color: '#fff' }
    },
    facebook: {
      icon: 'bi bi-facebook',
      style: { background: '#1877F2', color: '#fff' }
    }
  }

  return (
    <>
      {filtered.map((s, i) => {
        const net = String(s.network).toLowerCase()
        const cfg = netConfig[net] || { icon: 'bi bi-link', style: {} }
        return (
          <a
            key={s.id || `${net}-${i}`}
            href={s.value}
            target="_blank"
            rel="noopener noreferrer"
            className="btn rounded-circle shadow-sm d-flex align-items-center justify-content-center"
            style={{ width: 48, height: 48, fontSize: '1.25rem', ...cfg.style }}
            aria-label={s.network}
          >
            <i className={cfg.icon} aria-hidden="true"></i>
          </a>
        )
      })}
    </>
  )
}
