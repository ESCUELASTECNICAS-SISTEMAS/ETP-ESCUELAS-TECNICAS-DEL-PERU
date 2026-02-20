import React, { useEffect, useState } from 'react'
import axios from 'axios'
import HeroCarousel from '../components/home/HeroCarousel'
import Highlights from '../components/home/Highlights'
import Carreras from '../components/sections/Carreras'
import Talleres from '../components/sections/talleres'
import Informatica from '../components/sections/informatica'
import CourseCard from '../components/UI/CourseCard'
import { endpoints } from '../utils/apiStatic'

export default function HomePage(){
  const [courses, setCourses] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    let mounted = true
    const fetchCourses = async () => {
      setLoading(true)
      try{
        const res = await axios.get(endpoints.COURSES)
        if(mounted) setCourses(res.data || [])
      }catch(e){ console.error('fetch courses', e) }
      finally{ if(mounted) setLoading(false) }
    }
    fetchCourses()
    return ()=>{ mounted = false }
  },[])

  const filtered = (query || '').trim() === '' ? [] : courses.filter(c => {
    const text = `${c.titulo || c.title || ''} ${c.subtitle || c.descripcion || ''}`.toLowerCase()
    return text.includes(query.toLowerCase())
  })

  return (
    <div className="home-page">
      <HeroCarousel />
      <div className="container my-4">
        <div className="input-group mb-3">
          <input type="search" className="form-control" placeholder="Buscar cursos por título o palabras clave..." value={query} onChange={e=>setQuery(e.target.value)} />
          <button className="btn btn-outline-secondary" type="button" onClick={()=>setQuery('')}>Limpiar</button>
        </div>

        {loading && <div>Cargando cursos...</div>}
        {!loading && query && filtered.length === 0 && <div className="text-muted">No se encontraron cursos para "{query}"</div>}

        <div className="row row-cols-1 row-cols-md-3 g-3">
          {filtered.slice(0,6).map(c => (
            <div key={c.id} className="col">
              <CourseCard item={c} />
            </div>
          ))}
        </div>
      </div>

      <Highlights />
      <Carreras />
      <Talleres />
      <Informatica />
    </div>
  )
}
