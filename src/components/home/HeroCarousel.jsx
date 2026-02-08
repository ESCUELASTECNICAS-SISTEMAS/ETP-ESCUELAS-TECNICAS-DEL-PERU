import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { endpoints } from '../../utils/apiStatic'

export default function HeroCarousel() {
  const [slides, setSlides] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchSlides = async () => {
    setLoading(true)
    try{
      const res = await axios.get(endpoints.CAROUSEL)
      // filter active, sort by order_index asc, take first 3
      const data = (res.data || []).filter(s => s.active).sort((a,b)=> (a.order_index||0) - (b.order_index||0)).slice(0,3)
      setSlides(data)
    }catch(err){
      console.error('HeroCarousel fetch error', err)
    }finally{setLoading(false)}
  }

  useEffect(()=>{ fetchSlides() }, [])

  // fallback static images when API returns none
  const fallback = [
    { id: 'f1', url: '/assets/images/Hero1.jpg', alt: 'Formación técnica' },
    { id: 'f2', url: '/assets/images/Hero1.jpg', alt: 'Modalidades' },
    { id: 'f3', url: '/assets/images/Hero1.jpg', alt: 'Especialidades' }
  ]

  const items = (slides.length > 0 ? slides.map(s => ({ id: s.id, url: s.media?.url, alt: s.media?.alt_text || s.title })) : fallback).slice(0,3)

  return (
    <section id="inicio">
      <div id="heroCarousel" className="carousel slide" data-bs-ride="carousel">
        <div className="carousel-indicators">
          {items.map((_, i) => (
            <button key={i} type="button" data-bs-target="#heroCarousel" data-bs-slide-to={i} className={i===0 ? 'active' : ''} aria-current={i===0 ? 'true' : undefined} aria-label={`Slide ${i+1}`}></button>
          ))}
        </div>

        <div className="carousel-inner">
          {items.map((it, idx) => (
            <div key={it.id} className={`carousel-item${idx===0 ? ' active' : ''}`}>
              <img src={it.url} className="d-block w-100 hero-carousel" alt={it.alt || ''} />
            </div>
          ))}
        </div>

        <button className="carousel-control-prev" type="button" data-bs-target="#heroCarousel" data-bs-slide="prev">
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Previous</span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#heroCarousel" data-bs-slide="next">
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Next</span>
        </button>
      </div>
    </section>
  )
}
