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

const parseJsonField = (v) => {
  if (!v) return null
  if (Array.isArray(v)) return v
  if (typeof v === 'string') { try { const p = JSON.parse(v); return Array.isArray(p) ? p : [p] } catch(e){} }
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
  const infoItems = []
  if (course.duration) infoItems.push(`Duracion: ${course.duration}`)
  if (course.modalidad) infoItems.push(`Modalidad: ${course.modalidad}`)
  
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
  const temario = parseJsonField(course.temario)
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

  return (
    <>
    <div className="cd-page">
      {/* ═══ HERO ═══ */}
      <div className="cd-hero">
        <div className="bubble-1"></div>
        <div className="bubble-2"></div>
        <div className="bubble-3"></div>
        <div className="bubble-4"></div>
        <div className="bubble-5"></div>
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

                  </div>
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
          {course.modalidad && (
            <div className="cd-info-badge shadow-sm border-0 rounded-pill">
              <i className="bi bi-laptop-fill text-info"></i>
              <div><small>Modalidad</small><strong>{course.modalidad}</strong></div>
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
                  <h4 className="cd-card-title mb-0">Descripción del Curso</h4>
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
                  <h5 className="cd-sidebar-title"><i className="bi bi-stars me-2 text-warning"></i>¿Por qué estudiar aquí?</h5>
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

              {/* Misión y Visión */}
              {(course.mision || course.vision) && (
                <div className="cd-sidebar-card shadow-sm border-0 rounded-3 mb-3">
                  <h5 className="cd-sidebar-title"><i className="bi bi-bullseye me-2 text-danger"></i>Misión y Visión</h5>
                  <div>
                    {course.mision && (
                      <div className="mb-3">
                        <h6 className="small fw-bold text-primary mb-1"><i className="bi bi-flag-fill me-1"></i>Misión</h6>
                        <p className="small mb-0">{course.mision}</p>
                      </div>
                    )}
                    {course.vision && (
                      <div>
                        <h6 className="small fw-bold text-success mb-1"><i className="bi bi-eye-fill me-1"></i>Visión</h6>
                        <p className="small mb-0">{course.vision}</p>
                      </div>
                    )}
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
