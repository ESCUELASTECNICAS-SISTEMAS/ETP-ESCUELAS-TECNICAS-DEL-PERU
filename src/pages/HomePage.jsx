import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import HeroCarousel from '../components/home/HeroCarousel'
import Highlights from '../components/home/Highlights'
import Carreras from '../components/sections/Carreras'
import CincoMeses from '../components/sections/CincoMeses'
import Talleres from '../components/sections/talleres'
import Informatica from '../components/sections/informatica'
import { endpoints } from '../utils/apiStatic'

export default function HomePage(){
  const [sucursales, setSucursales] = useState([])
  const [selectedSucursalId, setSelectedSucursalId] = useState(null)
  const [selectedModalidad, setSelectedModalidad] = useState(null)

  useEffect(() => {
    let mounted = true
    const loadSucursales = async () => {
      try {
        const res = await axios.get(endpoints.SUCURSALES)
        if (!mounted) return
        const list = Array.isArray(res.data) ? res.data : []
        setSucursales(list.filter((s) => s && s.active !== false))
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

  return (
    <div className="home-page">
      <HeroCarousel />
      <Highlights />

      <section className="py-3 bg-white border-top border-bottom">
        <div className="container">
          <div className="d-flex flex-wrap align-items-center justify-content-center gap-2">
            {/* Divider label */}
            <span className="text-muted small fw-semibold me-1">
              <i className="bi bi-geo-alt-fill text-success me-1"></i>Sede:
            </span>
            {principalSucursales.map((sucursal) => {
              const isActive = String(selectedSucursalId) === String(sucursal.id)
              return (
                <button
                  key={sucursal.id}
                  type="button"
                  className={`btn btn-sm rounded-pill px-4 py-2 fw-semibold ${isActive ? 'btn-success shadow-sm' : 'btn-outline-success'}`}
                  onClick={() => setSelectedSucursalId(isActive ? null : sucursal.id)}
                >
                  {sucursal.nombre}
                </button>
              )
            })}

            <span className="vr mx-2 d-none d-sm-block" style={{ opacity: .25 }}></span>

            <span className="text-muted small fw-semibold me-1">
              <i className="bi bi-laptop text-primary me-1"></i>Modalidad:
            </span>
            <button
              type="button"
              className={`btn btn-sm rounded-pill px-4 py-2 fw-semibold ${selectedModalidad === 'virtual' ? 'btn-primary shadow-sm' : 'btn-outline-primary'}`}
              onClick={() => setSelectedModalidad('virtual')}
            >
              Ver modalidad virtual
            </button>
            <button
              type="button"
              className={`btn btn-sm rounded-pill px-4 py-2 fw-semibold ${selectedModalidad == null ? 'btn-dark shadow-sm' : 'btn-outline-dark'}`}
              onClick={() => setSelectedModalidad(null)}
            >
              Ver todos
            </button>
          </div>
        </div>
      </section>

      <Carreras selectedSucursalId={selectedSucursalId} selectedModalidad={selectedModalidad} />
      <CincoMeses selectedSucursalId={selectedSucursalId} selectedModalidad={selectedModalidad} />
      <Talleres selectedSucursalId={selectedSucursalId} selectedModalidad={selectedModalidad} />
      <Informatica selectedSucursalId={selectedSucursalId} selectedModalidad={selectedModalidad} />
    </div>
  )
}
