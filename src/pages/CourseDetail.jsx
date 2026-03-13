import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { endpoints } from '../utils/apiStatic'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

/* ── helpers ── */
const resolveImage = (c) => {
  if (!c) return null
  if (c.thumbnail && c.thumbnail.url) return c.thumbnail.url
  if (c.media && c.media.url) return c.media.url
  return c.image || c.imagen || c.image_url || c.url || c.foto || null
}

const resolveSectionImage = (course, key) => {
  if (!course) return null
  const relation = course[`${key}_media`]
  if (relation && relation.url) return relation.url

  const raw = course[key]
  if (typeof raw === 'string') {
    const s = raw.trim()
    if (/^https?:\/\//i.test(s) || s.startsWith('/')) return s
  }
  return null
}

const parseJsonField = (v) => {
  if (!v) return null
  if (Array.isArray(v)) return v
  if (typeof v === 'string') { try { const p = JSON.parse(v); return Array.isArray(p) ? p : [p] } catch(e){} }
  return null
}

const resolveModalidadDisplay = (course) => {
  if (!course) return null
  const raw = String(course.modalidad || '').trim().toLowerCase()
  let isVirtual = Boolean(course.is_virtual)
  let isPresencial = Boolean(course.is_presencial)

  if (!isVirtual && !isPresencial) {
    if (raw === 'virtual') isVirtual = true
    else if (raw === 'presencial') isPresencial = true
    else if (raw === 'hibrido' || raw === 'híbrido' || raw === 'mixto') {
      isVirtual = true
      isPresencial = true
    }
  }

  if (isVirtual && isPresencial) return 'Presencial o Virtual'
  if (isPresencial) return 'Presencial'
  if (isVirtual) return 'Virtual'
  return null
}

const renderTextWithLines = (text) => {
  if (!text) return null
  const s = String(text)
  // if bullets separated by '•' in a single line
  if (s.includes('•')) {
    const parts = s.split('•').map(p => p.trim()).filter(Boolean)
    if (parts.length > 0) return (
      <ul className="cd-list-bullets">
        {parts.map((p, i) => <li key={i}>{p.replace(/^[-*\u2022\s]+/, '')}</li>)}
      </ul>
    )
  }
  const lines = s.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  // if lines start with bullet markers, render as list
  if (lines.length > 0 && lines.every(l => /^[-*\u2022\u2023\u2024\u2025\u2026\u2027\u2028\u2029\s*•]/.test(l) || l.startsWith('•'))) {
    return (
      <ul className="cd-list-bullets">
        {lines.map((l, i) => <li key={i}>{l.replace(/^[-*\s\u2022]+/, '')}</li>)}
      </ul>
    )
  }
  if (lines.length > 1) return lines.map((l, i) => <p key={i} className="small mb-1">{l}</p>)
  return <p className="small mb-0">{s}</p>
}

const renderWithLeadingBold = (text) => {
  if (!text) return null
  const s = String(text).trim()
  const lines = s.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  if (lines.length === 0) return null
  const first = lines.shift()
  const rest = lines.join('\n')
  return (
    <div>
      <p className="mb-1"><strong>{first}</strong></p>
      {rest ? renderTextWithLines(rest) : null}
    </div>
  )
}

const renderSections = (arr) => {
  if (!arr || !Array.isArray(arr) || arr.length === 0) return null
  return arr.map((el, i) => {
    // simple string item
    if (typeof el === 'string') return <li key={i} className="cd-list-item">{el}</li>

    // new unidades didácticas shape: { orden, nivel, titulo, descripcion?, temas: [{ titulo, subtemas: [] }] }
    if (el && (el.titulo || el.nivel) && Array.isArray(el.temas)) {
      return (
        <div key={i} className="cd-section-block">
          <h6 className="cd-section-title"><i className="bi bi-journal-bookmark-fill me-2"></i>{el.nivel ? `${el.nivel} — ` : ''}{el.titulo}</h6>
          {el.descripcion && <p className="small text-muted">{el.descripcion}</p>}
          {Array.isArray(el.temas) && el.temas.length > 0 && (
            <div className="cd-section-items">
              {el.temas.map((t, ii) => (
                <div key={ii} className="cd-tema-block mb-2">
                  <strong>{t.titulo}</strong>
                  {Array.isArray(t.subtemas) && t.subtemas.length > 0 && (
                    <ul className="cd-subtemas list-unstyled mt-1">
                      {t.subtemas.map((s, si) => <li key={si} className="small">{s}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    // legacy shape: { title, items }
    if (el && el.title) return (
      <div key={i} className="cd-section-block">
        <h6 className="cd-section-title"><i className="bi bi-journal-bookmark-fill me-2"></i>{el.title}</h6>
        {Array.isArray(el.items) && el.items.length > 0 && (
          <ul className="cd-section-items">
            {el.items.map((it, ii) => <li key={ii}>{it}</li>)}
          </ul>
        )}
      </div>
    )

    return null
  })
}

/* ── PDF Generator (Simple & Clean) ── */
const generateBrochurePDF = async (course, schedulesByDay) => {
  const PRIMARY = [2, 17, 204]    // #0211CC
  const ACCENT  = [253, 113, 15]  // #FD710F
  const WHITE   = [255, 255, 255]
  const DARK    = [30, 30, 40]
  const GRAY    = [100, 100, 110]

  const pdf = new jsPDF('p', 'mm', 'a4')
  const W = pdf.internal.pageSize.getWidth()
  const H = pdf.internal.pageSize.getHeight()
  const M = 15
  let y = 0

  const checkBreak = (need) => {
    if (y + need > H - 20) { pdf.addPage(); y = 20; return true }
    return false
  }

  // ═══════════════════════════════════════════════════════════════════
  // HEADER - Simple blue bar with brand
  // ═══════════════════════════════════════════════════════════════════
  pdf.setFillColor(...PRIMARY)
  pdf.rect(0, 0, W, 40, 'F')
  pdf.setFillColor(...ACCENT)
  pdf.rect(0, 40, W, 3, 'F')

  pdf.setTextColor(...WHITE)
  pdf.setFontSize(22)
  pdf.setFont('helvetica', 'bold')
  pdf.text('ETP - Escuelas Tecnicas del Peru', M, 25)

  pdf.setFontSize(9)
  pdf.setFont('helvetica', 'normal')
  pdf.text('www.escuelastecnicas.pe', M, 34)

  y = 55

  // ═══════════════════════════════════════════════════════════════════
  // COURSE TITLE
  // ═══════════════════════════════════════════════════════════════════
  // Title
  pdf.setTextColor(...PRIMARY)
  pdf.setFontSize(20)
  pdf.setFont('helvetica', 'bold')
  const titleLines = pdf.splitTextToSize(course.title || 'Sin titulo', W - 2 * M)
  pdf.text(titleLines, M, y)
  y += titleLines.length * 9 + 4

  // Subtitle
  if (course.subtitle) {
    pdf.setTextColor(...GRAY)
    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'italic')
    const subLines = pdf.splitTextToSize(course.subtitle, W - 2 * M)
    pdf.text(subLines, M, y)
    y += subLines.length * 6 + 6
  }

  // ═══════════════════════════════════════════════════════════════════
  // INFO: Duration & Modalidad
  // ═══════════════════════════════════════════════════════════════════
  const modalidadLabel = resolveModalidadDisplay(course)
  const infoItems = []
  if (course.duration) infoItems.push(`Duracion: ${course.duration}`)
  if (modalidadLabel) infoItems.push(`Modalidad: ${modalidadLabel}`)
  
  if (infoItems.length > 0) {
    pdf.setFillColor(240, 242, 250)
    pdf.roundedRect(M, y, W - 2 * M, 12, 3, 3, 'F')
    pdf.setTextColor(...DARK)
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'bold')
    pdf.text(infoItems.join('    |    '), M + 8, y + 8)
    y += 20
  }

  // Divider
  pdf.setFillColor(...ACCENT)
  pdf.rect(M, y, W - 2 * M, 1, 'F')
  y += 10

  // ═══════════════════════════════════════════════════════════════════
  // SECTIONS HELPER
  // ═══════════════════════════════════════════════════════════════════
  const drawSection = (title, content, isList = false) => {
    if (!content) return
    const text = String(content).trim()
    if (!text) return
    
    checkBreak(20)
    
    // Section title
    pdf.setFillColor(...PRIMARY)
    pdf.rect(M, y, 3, 8, 'F')
    pdf.setTextColor(...PRIMARY)
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    pdf.text(title, M + 8, y + 6)
    y += 12
    
    // Content
    pdf.setTextColor(...DARK)
    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'normal')
    
    if (isList) {
      const items = text.includes('•') 
        ? text.split('•').map(l => l.trim()).filter(Boolean)
        : text.split(/\r?\n/).filter(Boolean)
      items.forEach(item => {
        const lines = pdf.splitTextToSize('• ' + item.trim(), W - 2 * M - 10)
        lines.forEach(line => {
          checkBreak(6)
          pdf.text(line, M + 5, y)
          y += 5
        })
      })
    } else {
      const lines = pdf.splitTextToSize(text, W - 2 * M - 5)
      lines.forEach(line => {
        checkBreak(6)
        pdf.text(line, M + 5, y)
        y += 5
      })
    }
    y += 8
  }

  // ═══════════════════════════════════════════════════════════════════
  // CONTENT
  // ═══════════════════════════════════════════════════════════════════
  drawSection('Descripcion', course.description)
  drawSection('Perfil del Egresado', course.perfil_egresado, true)
  drawSection('Por que estudiar este curso', course.razones_para_estudiar, true)
  drawSection('Publico Objetivo', course.publico_objetivo, true)

  // Horarios
  if (schedulesByDay && Object.keys(schedulesByDay).length > 0) {
    checkBreak(20)
    pdf.setFillColor(...PRIMARY)
    pdf.rect(M, y, 3, 8, 'F')
    pdf.setTextColor(...PRIMARY)
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Horarios', M + 8, y + 6)
    y += 14

    Object.keys(schedulesByDay).forEach(day => {
      checkBreak(10)
      pdf.setTextColor(...PRIMARY)
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'bold')
      pdf.text(day, M + 5, y)
      y += 6
      schedulesByDay[day].forEach(s => {
        checkBreak(5)
        pdf.setTextColor(...DARK)
        pdf.setFontSize(9)
        pdf.setFont('helvetica', 'normal')
        const horario = `${s.turno || ''} - ${s.hora_inicio?.substring(0,5)||''} a ${s.hora_fin?.substring(0,5)||''}${s.aula ? ' (Aula: '+s.aula+')' : ''}`
        pdf.text('  ' + horario, M + 5, y)
        y += 5
      })
      y += 3
    })
    y += 5
  }

  // Temario
  const temario = parseJsonField(course.temario)
  if (temario && temario.length > 0) {
    checkBreak(20)
    pdf.setFillColor(...PRIMARY)
    pdf.rect(M, y, 3, 8, 'F')
    pdf.setTextColor(...PRIMARY)
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Temario', M + 8, y + 6)
    y += 14

    temario.forEach(unidad => {
      checkBreak(12)
      pdf.setFillColor(...PRIMARY)
      pdf.roundedRect(M, y, W - 2 * M, 8, 2, 2, 'F')
      pdf.setTextColor(...WHITE)
      pdf.setFontSize(9)
      pdf.setFont('helvetica', 'bold')
      const uTitle = (unidad.nivel ? unidad.nivel + ' - ' : '') + (unidad.titulo || '')
      pdf.text(pdf.splitTextToSize(uTitle, W - 2 * M - 10)[0], M + 5, y + 5.5)
      y += 12

      if (Array.isArray(unidad.temas)) {
        unidad.temas.forEach(tema => {
          checkBreak(7)
          pdf.setTextColor(...DARK)
          pdf.setFontSize(9)
          pdf.setFont('helvetica', 'bold')
          pdf.text('> ' + tema.titulo, M + 5, y)
          y += 5
          if (Array.isArray(tema.subtemas)) {
            tema.subtemas.forEach(sub => {
              checkBreak(5)
              pdf.setTextColor(...GRAY)
              pdf.setFontSize(8)
              pdf.setFont('helvetica', 'normal')
              pdf.text('   - ' + sub, M + 8, y)
              y += 4.5
            })
          }
        })
      }
      y += 5
    })
  }

  // ═══════════════════════════════════════════════════════════════════
  // FOOTER - Every page
  // ═══════════════════════════════════════════════════════════════════
  const totalPages = pdf.internal.pages.length - 1
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i)
    pdf.setFillColor(...PRIMARY)
    pdf.rect(0, H - 12, W, 12, 'F')
    pdf.setTextColor(...WHITE)
    pdf.setFontSize(8)
    pdf.setFont('helvetica', 'normal')
    pdf.text('ETP - Escuelas Tecnicas del Peru', W / 2, H - 5, { align: 'center' })
    pdf.setTextColor(...ACCENT)
    pdf.setFont('helvetica', 'bold')
    pdf.text(`${i}/${totalPages}`, W - M, H - 5, { align: 'right' })
  }

  pdf.save(`Brochure_${course.title?.replace(/[^a-zA-Z0-9]/g, '_') || 'Curso'}.pdf`)
}

export default function CourseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('temario')
  const [showSedeModal, setShowSedeModal] = useState(false)
  const [sucursales, setSucursales] = useState([])
  const [defaultSedeId, setDefaultSedeId] = useState(null)

  useEffect(() => {
    if (!showSedeModal) return
    axios.get(endpoints.SUCURSALES)
      .then(r => {
        const list = (Array.isArray(r.data) ? r.data : []).filter(s => s.active !== false)
        setSucursales(list)
        const ica = list.find(s => (s.nombre || s.name || '').toLowerCase().includes('ica'))
        if (ica) setDefaultSedeId(ica.id)
      })
      .catch(() => setSucursales([]))
  }, [showSedeModal])

  const openWhatsApp = (suc) => {
    if (!course) return
    const nombre = course.title || course.titulo || 'este curso'
    const sucName = suc.nombre || suc.name || ''
    const phoneRaw = (suc.telefono || suc.phone || suc.telefono_whatsapp || '950340502').replace(/\D/g, '')
    const number = phoneRaw.startsWith('51') ? phoneRaw : '51' + phoneRaw
    const rawMod = String(course.modalidad || course.mode || '').toLowerCase()
    const esVirtual = rawMod.includes('virtual') || Boolean(course.is_virtual)
    const modalidadTxt = esVirtual ? ' en modalidad VIRTUAL' : ''
    const msg = encodeURIComponent(`Hola, vengo desde la página y me interesa inscribirme en el curso: ${nombre}${modalidadTxt} y soy de la sucursal ${sucName}`)
    window.open(`https://wa.me/${number}?text=${msg}`, '_blank')
    setShowSedeModal(false)
  }

  useEffect(() => {
    ;(async () => {
      setLoading(true); setError(null)
      try {
        const res = await axios.get(`${endpoints.COURSES}/${id}`)
        setCourse(res.data)
      } catch (err) {
        console.error(err)
        try {
          const all = await axios.get(endpoints.COURSES)
          const found = (all.data || []).find(c => String(c.id) === String(id) || c.slug === id)
          if (found) setCourse(found)
          else setError('Curso no encontrado')
        } catch { setError('No se pudo cargar el curso') }
      } finally { setLoading(false) }
    })()
  }, [id])

  if (loading) return (
    <div className="section-padding">
      <div className="container text-center py-5">
        <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Cargando...</span></div>
      </div>
    </div>
  )

  if (error || !course) return (
    <div className="section-padding">
      <div className="container text-center py-5">
        <i className="bi bi-exclamation-triangle fs-1 text-warning"></i>
        <h4 className="mt-3">{error || 'Curso no encontrado'}</h4>
        <button onClick={() => navigate(-1)} className="btn-back mt-3"><i className="bi bi-arrow-left"></i> Volver</button>
      </div>
    </div>
  )

  const img = resolveImage(course)
  const extraImageUrl = (course.extraImage && course.extraImage.url)
    || (course.extra_media && course.extra_media.url)
    || (course.extra_image && typeof course.extra_image === 'string' ? course.extra_image : null)
    || null
  const extraImageAlt = (course.extraImage && course.extraImage.alt_text)
    || (course.extra_media && course.extra_media.alt_text)
    || 'Imagen complementaria del curso'
  const temario = parseJsonField(course.temario)
  const modalidadLabel = resolveModalidadDisplay(course)
  // prepare schedules grouped by day for display (solo activos)
  const schedules = Array.isArray(course.schedules) ? course.schedules.filter(s => s.active !== false) : []
  const schedulesByDay = schedules.reduce((acc, s) => {
    const d = s.dia || 'Sin día'
    if (!acc[d]) acc[d] = []
    acc[d].push(s)
    return acc
  }, {})

  // Detectar carrera de Reparación y Mantenimiento de Computadoras (NO curso)
  const title = (course.title || '').toLowerCase()
  const tipo = (course.type || course.tipo || '').toLowerCase()
  const isCurso = tipo === 'cursos_talleres' || tipo === 'ofimatica' || tipo === 'cinco_meses' || tipo === 'cinco meses' || tipo === '5_meses' || tipo === '5 meses' || tipo === 'taller'
  const isReparacionComputadoras = !isCurso && title.includes('reparaci') && title.includes('mantenimiento') && (title.includes('computadora') || title.includes('laptop'))

  const handleExplorarPlan = () => {
    const element = document.getElementById('cd-plan-estudios')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  // Build list of extra media URLs (robust to different API shapes)
  const buildExtraMedias = () => {
    const out = []
    if (Array.isArray(course.extra_media) && course.extra_media.length > 0) {
      for (const item of course.extra_media) {
        if (!item) continue
        if (typeof item === 'string') {
          const s = item.trim()
          if (s.startsWith('http') || s.startsWith('/')) out.push({ url: s, alt_text: '' })
        } else if (typeof item === 'object') {
          if (item.url) out.push({ url: item.url, alt_text: item.alt_text || '' })
          else if (item.id && item.media && item.media.url) out.push({ url: item.media.url, alt_text: item.media.alt_text || '' })
        } else if (typeof item === 'number' || /^[0-9]+$/.test(String(item))) {
          // If API gave only ids but included objects elsewhere, try find
          if (Array.isArray(course.media) && course.media.length > 0) {
            const found = course.media.find(m => String(m.id) === String(item))
            if (found && found.url) out.push({ url: found.url, alt_text: found.alt_text || '' })
          }
        }
        if (out.length >= 3) break
      }
    }
    // fallback to single extraImageUrl
    if (out.length === 0 && extraImageUrl) out.push({ url: extraImageUrl, alt_text: extraImageAlt || '' })
    return out.slice(0,3)
  }

  // Simple inline carousel (no bootstrap dependency) — autoplay with fade
  const InlineCarousel = ({ images = [], interval = 3000 }) => {
    const [idx, setIdx] = useState(0)
    useEffect(() => {
      if (!images || images.length <= 1) return
      const t = setInterval(() => setIdx(i => (i + 1) % images.length), interval)
      return () => clearInterval(t)
    }, [images, interval])
    if (!images || images.length === 0) return null
    return (
      <div style={{position:'relative',width:'100%'}}>
        {images.map((it, i) => (
          <img key={i} src={it.url} alt={it.alt_text || ''}
            style={{
              width: '100%',
              maxHeight: 260,
              objectFit: 'cover',
              borderRadius: 12,
              transition: 'opacity .6s ease',
              opacity: i === idx ? 1 : 0,
              position: i === idx ? 'relative' : 'absolute',
              left: 0, top: 0,
              display: 'block'
            }} />
        ))}
      </div>
    )
  }

  return (
    <>
    <div className="cd-page">
      {course && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Course",
          "name": course.title || course.titulo || '',
          "description": String(course.subtitle || course.description || '').slice(0,300),
          "courseCode": course.code || course.codigo || String(course.id || ''),
          "url": (typeof window !== 'undefined' ? window.location.href : ''),
          "inLanguage": course.language || 'es',
          "provider": {
            "@type": "Organization",
            "name": "ETP - Escuelas Técnicas del Perú",
            "sameAs": "https://www.escuelastecnicas.pe/"
          }
        }) }} />
      )}
      {/* ═══ HERO ═══ */}
      <div className="cd-hero">
        <div className="bubble-1"></div>
        <div className="bubble-2"></div>
        <div className="bubble-3"></div>
        <div className="bubble-4"></div>
        <div className="bubble-5"></div>
        <div className="bubble-6"></div>
        <div className="bubble-7"></div>
        <div className="bubble-8"></div>
        <div className="bubble-9"></div>
        <div className="bubble-10"></div>
        <div className="bubble-11"></div>
        <div className="bubble-12"></div>
        <div className="cd-hero-overlay">
          <div className="container">
            <button onClick={() => navigate(-1)} className="btn-back mb-3 btn btn-light shadow-sm rounded-pill">
              <i className="bi bi-arrow-left"></i> Volver
            </button>
            <div className="row align-items-center">
              <div className="col-lg-8">
                <div className="cd-hero-content">
                  <h1 className="cd-hero-title">{course.title}</h1>
                  {course.subtitle && <p className="cd-hero-subtitle">{course.subtitle}</p>}
                  {isReparacionComputadoras && (
                    <div className="mt-3 p-3 bg-light bg-opacity-75 rounded-3 border border-primary border-opacity-25">
                      <p className="mb-0 text-dark">
                        <i className="bi bi-info-circle-fill me-2 text-primary"></i>
                        <strong>Certificado:</strong> El título se emitirá como <strong>"Soporte Técnico y Operación de Centros de Cómputo"</strong>
                      </p>
                    </div>
                  )}
                  <div className="cd-hero-actions mt-4">
                    <button onClick={handleExplorarPlan} className="btn btn-primary btn-lg me-3 shadow">
                      <i className="bi bi-book-fill me-2"></i>Explora el Plan de Estudios
                    </button>
                    <button onClick={()=>setShowSedeModal(true)} className="btn btn-lg shadow" style={{backgroundColor:'#25D366',borderColor:'#25D366',color:'#fff'}}>
                      <i className="bi bi-whatsapp me-2"></i>Matricularme
                    </button>
                  </div>

                  {/* Modal selección de sede */}
                  {showSedeModal && (
                    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'}} onClick={()=>setShowSedeModal(false)}>
                      <div style={{background:'#fff',borderRadius:16,padding:'1.8rem',minWidth:300,maxWidth:400,boxShadow:'0 12px 40px rgba(0,0,0,.3)',animation:'fadeInUp .3s ease'}} onClick={e=>e.stopPropagation()}>
                        <h5 className="fw-bold text-center mb-2" style={{fontSize:'1.15rem'}}><i className="bi bi-geo-alt-fill text-success me-2"></i>Selecciona tu sede</h5>
                        <div style={{background:'#e8f5e9',border:'1px solid #a5d6a7',borderRadius:12,padding:'.6rem .9rem',marginBottom:'1rem',fontSize:'.85rem',color:'#2e7d32',display:'flex',alignItems:'center',gap:'.5rem'}}>
                          <i className="bi bi-info-circle-fill"></i>
                          <span>Estás en sede <strong>Ica</strong>. Puedes elegir otra sede si deseas.</span>
                        </div>
                        {sucursales.length === 0 && <p className="text-muted text-center">Cargando sedes...</p>}
                        <div className="d-grid gap-2">
                          {sucursales.map(s => {
                            const isDefault = s.id === defaultSedeId
                            return (
                              <button key={s.id}
                                className="btn d-flex align-items-center justify-content-center gap-2"
                                style={{
                                  backgroundColor: isDefault ? '#25D366' : 'transparent',
                                  borderColor: '#25D366',
                                  color: isDefault ? '#fff' : '#25D366',
                                  fontSize:'1.05rem',
                                  padding:'.7rem 1.2rem',
                                  fontWeight: isDefault ? 700 : 500,
                                  borderWidth:2, borderStyle:'solid', borderRadius:12,
                                }}
                                onClick={()=>openWhatsApp(s)}
                              >
                                <i className={`bi ${isDefault ? 'bi-geo-alt-fill' : 'bi-whatsapp'}`}></i>
                                {s.nombre || s.name}
                                {isDefault && <span style={{fontSize:'.7rem',background:'rgba(255,255,255,.3)',borderRadius:6,padding:'2px 8px',marginLeft:4}}>✓ Sede actual</span>}
                              </button>
                            )
                          })}
                        </div>
                        <button className="btn btn-outline-secondary w-100 mt-3" style={{fontSize:'.95rem',padding:'.55rem',borderRadius:12}} onClick={()=>setShowSedeModal(false)}>Cancelar</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {img && (
                <div className="col-lg-4 d-none d-lg-block">
                  <div className="cd-hero-img-wrapper">
                    <img src={img} alt={course.title} className="cd-hero-img shadow-lg rounded-3 border border-3 border-white" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ INFO BADGES ═══ */}
      <div className="container">
        <div className="cd-info-strip">
          {false && course.hours && (
            <div className="cd-info-badge shadow-sm border-0 rounded-pill">
              <i className="bi bi-clock-fill text-primary"></i>
              <div><small>Horas</small><strong>{course.hours}</strong></div>
            </div>
          )}
          {course.duration && (
            <div className="cd-info-badge shadow-sm border-0 rounded-pill">
              <i className="bi bi-calendar3-fill text-success"></i>
              <div><small>Duración</small><strong>{course.duration}</strong></div>
            </div>
          )}
          {modalidadLabel && (
            <div className="cd-info-badge shadow-sm border-0 rounded-pill">
              <i className="bi bi-laptop-fill text-info"></i>
              <div><small>Modalidad</small><strong>{modalidadLabel}</strong></div>
            </div>
          )}
        </div>
      </div>

      {/* ═══ BODY ═══ */}
      <div className="container cd-body">
        <div className="row g-4">
          {/* LEFT COLUMN — main content */}
          <div className="col-12 col-lg-8">
            {/* Descripción General */}
            {course.description && (
              <div className="cd-card cd-card-description shadow-sm border-0 rounded-3 mb-4">
                <div className="cd-card-header rounded-top">
                  <i className="bi bi-info-circle-fill"></i>
                  <h4 className="cd-card-title mb-0">Descripción del Programa de Estudios</h4>
                </div>
                <p className="cd-description">{course.description}</p>
              </div>
            )}

            {/* Plan de Estudios - Contenido académico principal */}
            {temario && temario.length > 0 && (
              <div id="cd-plan-estudios" className="cd-card cd-card-curriculum shadow-sm border-0 rounded-3 mb-4">
                <div className="cd-card-header rounded-top">
                  <i className="bi bi-journal-text-fill"></i>
                  <h4 className="cd-card-title mb-0">Plan de Estudios</h4>
                </div>
                <div className="cd-curriculum-content">
                  {renderSections(temario)}
                </div>
              </div>
            )}

            {/* Perfil del Egresado */}
            {course.perfil_egresado && (
              <div className="cd-card cd-card-profile shadow-sm border-0 rounded-3 mb-4">
                <div className="cd-card-header rounded-top">
                  <i className="bi bi-person-check-fill"></i>
                  <h4 className="cd-card-title mb-0">Perfil del Egresado</h4>
                </div>
                <div className="cd-card-body">{renderWithLeadingBold(course.perfil_egresado)}</div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN — sidebar */}
          <div className="col-12 col-lg-4">
            <div className="cd-sticky-sidebar">
              {/* ¿Por qué elegir este curso? */}
              {course.razones_para_estudiar && (
                <div className="cd-sidebar-card cd-card-highlight shadow-sm border border-warning rounded-3 mb-3 bg-light">
                  <h5 className="cd-sidebar-title"><i className="bi bi-stars me-2 text-warning"></i>¿Por qué estudiar en ETP?</h5>
                  <div className="cd-card-body">{renderTextWithLines(course.razones_para_estudiar)}</div>
                </div>
              )}

              {/* Público Objetivo */}
              {course.publico_objetivo && (
                <div className="cd-sidebar-card shadow-sm border-0 rounded-3 mb-3">
                  <h5 className="cd-sidebar-title"><i className="bi bi-people-fill me-2 text-primary"></i>Dirigido a</h5>
                  <div className="small">{renderTextWithLines(course.publico_objetivo)}</div>
                </div>
              )}

              {/* Carrusel de imágenes adicionales debajo de Dirigido a */}
              {(() => {
                const imgs = buildExtraMedias()
                if (!imgs || imgs.length === 0) return null
                return (
                  <div className="cd-sidebar-card shadow-sm border-0 rounded-3 mb-3">
                    <h5 className="cd-sidebar-title"><i className="bi bi-building me-2 text-primary"></i>Nuestras modernas instalaciones</h5>
                    <div className="text-center">
                      <InlineCarousel images={imgs} interval={3000} />
                    </div>
                  </div>
                )
              })()}

              {/* Imagen de Horarios */}
              {course.horarios && course.horarios.url && (
                <div className="cd-sidebar-card cd-sidebar-horario shadow-sm border-0 rounded-3 mb-3">
                  <h5 className="cd-sidebar-title"><i className="bi bi-calendar-week me-2 text-success"></i>Horarios</h5>
                  <div className="text-center">
                    <a href={course.horarios.url} target="_blank" rel="noopener noreferrer" className="d-block">
                      <img src={course.horarios.url} alt={course.horarios.alt_text || 'Horario'} className="img-fluid rounded-3 shadow-sm border border-2 border-success border-opacity-25" style={{maxHeight:280,objectFit:'contain'}} />
                      <small className="d-block mt-2 text-primary fw-bold"><i className="bi bi-zoom-in me-1"></i>Click para ampliar</small>
                    </a>
                  </div>
                </div>
              )}

              {/* Horarios Detallados */}
              {schedules && schedules.length > 0 && (
                <div className="cd-sidebar-card cd-sidebar-schedules shadow-sm border-0 rounded-3 mb-3">
                  <h5 className="cd-sidebar-title"><i className="bi bi-clock-fill me-2 text-info"></i>Turnos Disponibles</h5>
                  <div className="cd-schedules-list">
                    {Object.keys(schedulesByDay).map(day => (
                      <div key={day} className="cd-schedule-item bg-light rounded-3 p-2 mb-2 border border-primary border-opacity-25">
                        <div className="cd-schedule-day fw-bold text-primary">{day}</div>
                        <div className="cd-schedule-times">
                          {schedulesByDay[day].map((s, i) => (
                            <div key={i} className="cd-schedule-time d-flex align-items-center flex-wrap">
                              <span className="badge bg-primary me-2 shadow-sm">{s.turno || 'N/A'}</span>
                              <span className="time">{s.hora_inicio && s.hora_fin ? `${s.hora_inicio.substring(0,5)} - ${s.hora_fin.substring(0,5)}` : 'Consultar'}</span>
                              {s.aula && <span className="aula text-muted ms-2">· {s.aula}</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Docentes */}
              {false && course.docentes && course.docentes.length > 0 && (
                <div className="cd-sidebar-card shadow-sm border-0 rounded-3 mb-3">
                  <h5 className="cd-sidebar-title"><i className="bi bi-person-workspace me-2 text-primary"></i>Docentes</h5>
                  <div className="cd-docentes-list">
                    {course.docentes.map((d, i) => (
                      <div key={i} className="cd-docente-item bg-light rounded-3 p-2 mb-2 border border-primary border-opacity-10">
                        {d.foto && <img src={d.foto} alt={d.nombre} className="cd-docente-foto rounded-circle shadow-sm" />}
                        <div className="cd-docente-info">
                          <strong className="small">{d.nombre}</strong>
                          {d.especialidad && <div className="small text-muted">{d.especialidad}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certificaciones */}
              {false && course.certificados && course.certificados.length > 0 && (
                <div className="cd-sidebar-card shadow-sm border-0 rounded-3 mb-3">
                  <h5 className="cd-sidebar-title"><i className="bi bi-patch-check-fill me-2 text-success"></i>Certificaciones</h5>
                  <div className="cd-certs-list">
                    {course.certificados.map((cert, i) => (
                      <div key={i} className="cd-cert-item mb-2 bg-light rounded-2 p-2">
                        <div className="d-flex align-items-start">
                          <i className="bi bi-award text-warning me-2 mt-1 fs-5"></i>
                          <div>
                            <strong className="small d-block">{cert.titulo || cert.nombre || cert.title}</strong>
                            {cert.descripcion && <div className="small text-muted">{cert.descripcion}</div>}
                            {cert.institucion_emisora && <div className="small text-muted fst-italic">{cert.institucion_emisora}</div>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Seminarios */}
              {false && course.seminarios && course.seminarios.length > 0 && (
                <div className="cd-sidebar-card shadow-sm border-0 rounded-3 mb-3">
                  <h5 className="cd-sidebar-title"><i className="bi bi-mic-fill me-2 text-info"></i>Seminarios</h5>
                  <div className="cd-seminars-list">
                    {course.seminarios.map((s, i) => (
                      <div key={i} className="cd-seminar-item mb-2 bg-light rounded-2 p-2">
                        <div className="d-flex align-items-start">
                          <i className="bi bi-calendar-event me-2 text-info mt-1 fs-5"></i>
                          <div>
                            <strong className="small d-block">{s.titulo || s.title}</strong>
                            {s.fecha && <div className="small text-muted">{s.fecha}</div>}
                            {s.duracion_horas && <div className="small text-muted">{s.duracion_horas} horas</div>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}
