import React from 'react'
import './index.css'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import HomePage from './pages/HomePage'
import CursosPage from './pages/CursosPage'
import CarrerasPage from './pages/CarrerasPage'
import CursosInformatica from './pages/TalleresInformatica'
import CourseDetail from './pages/CourseDetail'
import NoticiasPage from './pages/NoticiasPage'
import { Routes, Route } from 'react-router-dom'

export default function App(){
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/cursos" element={<CursosPage />} />
          <Route path="/programas" element={<CarrerasPage />} />
          <Route path="/noticias" element={<NoticiasPage />} />
          <Route path="/cursos-informatica" element={<CursosInformatica />} />
          <Route path="/curso/:id" element={<CourseDetail />} />
          <Route path="/programa/:id" element={<CourseDetail />} />
        </Routes>
      </main>
      <Footer />
      {/* Social floating buttons (replace URLs with your profiles) */}
      <div className="social-fab-group" aria-hidden="false">
        <a href="https://www.instagram.com/yourprofile" target="_blank" rel="noopener noreferrer" className="social-fab instagram" aria-label="Instagram">
          <i className="bi bi-instagram" aria-hidden="true"></i>
        </a>
        <a href="https://www.facebook.com/yourpage" target="_blank" rel="noopener noreferrer" className="social-fab facebook" aria-label="Facebook">
          <i className="bi bi-facebook" aria-hidden="true"></i>
        </a>
        <a href="https://www.tiktok.com/@yourprofile" target="_blank" rel="noopener noreferrer" className="social-fab tiktok" aria-label="TikTok">
          <i className="bi bi-music-note-list" aria-hidden="true"></i>
        </a>
      </div>

      {/* WhatsApp floating button - replace PHONE_NUMBER with your full international number (eg. 51912345678) */}
      <a
        href="https://wa.me/51900000000?text=Hola%20quiero%20más%20info"
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-fab"
        aria-label="Contactar por WhatsApp"
      >
        <i className="bi bi-whatsapp" aria-hidden="true"></i>
      </a>
    </>
  )
}
