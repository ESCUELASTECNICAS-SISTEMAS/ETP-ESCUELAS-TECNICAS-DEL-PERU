import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import HeroCarousel from '../components/home/HeroCarousel'
import Highlights from '../components/home/Highlights'
import Carreras from '../components/sections/Carreras'
import CincoMeses from '../components/sections/CincoMeses'
import Talleres from '../components/sections/talleres'
import Informatica from '../components/sections/informatica'
import DynamicTypes from '../components/sections/DynamicTypes'
import { endpoints } from '../utils/apiStatic'

export default function HomePage(){
  const [sucursales, setSucursales] = useState([])
  const [selectedSucursalId, setSelectedSucursalId] = useState(null)
  const [selectedModalidad, setSelectedModalidad] = useState(null)
  const [showSedeToast, setShowSedeToast] = useState(false)

  useEffect(() => {
    let mounted = true
    const loadSucursales = async () => {
      try {
        const res = await axios.get(endpoints.SUCURSALES)
        if (!mounted) return
        const list = Array.isArray(res.data) ? res.data : []
        const active = list.filter((s) => s && s.active !== false)
        setSucursales(active)
        // Seleccionar Ica por defecto
        const ica = active.find(s => (s.nombre || '').toLowerCase().includes('ica'))
        if (ica) {
          setSelectedSucursalId(ica.id)
          try{ localStorage.setItem('etp_selected_sucursal', JSON.stringify(ica)) }catch(e){}
          // Mostrar toast recordatorio
          setShowSedeToast(true)
          setTimeout(() => { if (mounted) setShowSedeToast(false) }, 10000)
        }
      } catch (err) {
        console.error('home fetch sucursales', err)
        if (!mounted) return
        setSucursales([])
      }
    }
    loadSucursales()
    return () => { mounted = false }
  }, [])

  const principalSucursales = useMemo(() => {
    const preferredOrder = ['ICA', 'AREQUIPA']
    const preferred = preferredOrder
      .map((name) => sucursales.find((s) => String(s.nombre || '').toUpperCase() === name))
      .filter(Boolean)

    if (preferred.length >= 2) return preferred.slice(0, 2)

    const remaining = sucursales.filter((s) => !preferred.some((p) => String(p.id) === String(s.id)))
    return [...preferred, ...remaining].slice(0, 2)
  }, [sucursales])

  const handleSelectSucursal = (sucursal) => {
    setSelectedSucursalId(sucursal.id)
    try{ localStorage.setItem('etp_selected_sucursal', JSON.stringify(sucursal)) }catch(e){}
    try{ window.dispatchEvent(new CustomEvent('etp:sucursal:change',{ detail: sucursal })) }catch(e){}
  }

  return (
    <div className="home-page">
      <HeroCarousel />
      <Highlights />

      <section id="sede-section" className="py-3 bg-white border-top border-bottom">
        <div className="container">
          <div className="d-flex flex-column flex-md-row align-items-center justify-content-center gap-2 gap-md-3">
            <div className="w-100 d-flex flex-column flex-sm-row align-items-center justify-content-center gap-2">
              <span className="text-muted fw-semibold" style={{fontSize:'.95rem'}}>
                <i className="bi bi-geo-alt-fill text-success me-1"></i>Sede:
              </span>
              <div className="d-flex flex-wrap justify-content-center gap-2">
                {principalSucursales.map((sucursal) => {
                  const isActive = String(selectedSucursalId) === String(sucursal.id)
                  return (
                    <button
                          key={sucursal.id}
                          type="button"
                          className={`btn rounded-pill fw-semibold ${isActive ? 'btn-success shadow-sm' : 'btn-outline-success'}`}
                          style={{padding:'.6rem 1.8rem',fontSize:'1rem',minWidth:120}}
                          onClick={() => handleSelectSucursal(sucursal)}
                        >
                          <i className={`bi ${isActive ? 'bi-geo-alt-fill' : 'bi-geo-alt'} me-1`}></i>
                          {sucursal.nombre}
                        </button>
                  )
                })}
              </div>
            </div>

            <span className="vr mx-1 d-none d-md-block" style={{ opacity: 0.2, height: '2rem' }}></span>

            <div className="w-100 d-flex flex-column flex-sm-row align-items-center justify-content-center gap-2">
              <span className="text-muted fw-semibold" style={{fontSize:'.95rem'}}>
                <i className="bi bi-laptop text-primary me-1"></i>Modalidad:
              </span>
              <div className="d-flex flex-wrap justify-content-center gap-2">
                <button
                  type="button"
                  className={`btn rounded-pill fw-semibold ${selectedModalidad === 'virtual' ? 'btn-primary shadow-sm' : 'btn-outline-primary'}`}
                  style={{padding:'.6rem 1.8rem',fontSize:'1rem',minWidth:140}}
                  onClick={() => setSelectedModalidad('virtual')}
                >
                  <i className="bi bi-camera-video me-1"></i>Virtual
                </button>
                <button
                  type="button"
                  className={`btn rounded-pill fw-semibold ${selectedModalidad == null ? 'btn-dark shadow-sm' : 'btn-outline-dark'}`}
                  style={{padding:'.6rem 1.8rem',fontSize:'1rem',minWidth:140}}
                  onClick={() => setSelectedModalidad(null)}
                >
                  <i className="bi bi-grid me-1"></i>Ver todos
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Toast recordatorio de sede */}
      {showSedeToast && (
        <div style={{position:'fixed',bottom:24,right:24,zIndex:9999,animation:'fadeInUp .4s ease'}}>
          <div style={{background:'linear-gradient(135deg,#2e7d32,#43a047)',color:'#fff',borderRadius:14,padding:'1rem 1.4rem',boxShadow:'0 8px 32px rgba(0,0,0,.25)',display:'flex',alignItems:'center',gap:'.8rem',maxWidth:360,fontSize:'.92rem'}}>
            <i className="bi bi-geo-alt-fill" style={{fontSize:'1.5rem'}}></i>
            <div>
              <strong style={{display:'block',marginBottom:2}}>Sede: Ica</strong>
              <span style={{opacity:.9,fontSize:'.82rem'}}>Puedes ver los cursos de cada sede en la sección de sede.{' '}
                <a href="#sede-section" onClick={(e)=>{e.preventDefault();document.getElementById('sede-section')?.scrollIntoView({behavior:'smooth',block:'center'});setShowSedeToast(false)}} style={{color:'#fff',fontWeight:700,textDecoration:'underline',cursor:'pointer'}}>Haz click aquí</a> para cambiar.
              </span>
            </div>
            <button onClick={()=>setShowSedeToast(false)} style={{background:'none',border:'none',color:'#fff',fontSize:'1.2rem',cursor:'pointer',padding:0,marginLeft:4,opacity:.7}}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
        </div>
      )}
      <style>{`
        @keyframes fadeInUp {
          from { opacity:0; transform:translateY(20px); }
          to { opacity:1; transform:translateY(0); }
        }
      `}</style>

      <Carreras selectedSucursalId={selectedSucursalId} selectedModalidad={selectedModalidad} />
      <CincoMeses selectedSucursalId={selectedSucursalId} selectedModalidad={selectedModalidad} />
      <Talleres selectedSucursalId={selectedSucursalId} selectedModalidad={selectedModalidad} />
      <Informatica selectedSucursalId={selectedSucursalId} selectedModalidad={selectedModalidad} />
      <DynamicTypes />
    </div>
  )
}
