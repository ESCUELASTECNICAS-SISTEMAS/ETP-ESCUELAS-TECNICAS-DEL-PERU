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

/* ── PDF Generator ── */
const generateBrochurePDF = async (course, schedulesByDay) => {
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 15
  let yPos = margin

  // Helper to add new page if needed
  const checkPageBreak = (neededHeight) => {
    if (yPos + neededHeight > pageHeight - margin) {
      pdf.addPage()
      yPos = margin
      return true
    }
    return false
  }

  // Header with institution name
  pdf.setFillColor(41, 128, 185)
  pdf.rect(0, 0, pageWidth, 35, 'F')
  pdf.setTextColor(255, 255, 255)
  pdf.setFontSize(20)
  pdf.setFont('helvetica', 'bold')
  pdf.text('ESCUELAS TÉCNICAS DEL PERÚ', pageWidth / 2, 15, { align: 'center' })
  
  yPos = 40

  // Course Title
  pdf.setTextColor(0, 0, 0)
  pdf.setFontSize(18)
  pdf.setFont('helvetica', 'bold')
  const titleLines = pdf.splitTextToSize(course.title || 'Sin título', pageWidth - 2 * margin)
  pdf.text(titleLines, margin, yPos)
  yPos += titleLines.length * 8 + 5

  // Subtitle
  if (course.subtitle) {
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(100, 100, 100)
    const subtitleLines = pdf.splitTextToSize(course.subtitle, pageWidth - 2 * margin)
    pdf.text(subtitleLines, margin, yPos)
    yPos += subtitleLines.length * 6 + 8
  }

  // Info badges
  pdf.setFillColor(240, 240, 240)
  pdf.roundedRect(margin, yPos, pageWidth - 2 * margin, 25, 3, 3, 'F')
  pdf.setFontSize(9)
  pdf.setTextColor(0, 0, 0)
  let xBadge = margin + 5
  const badgeData = [
    { label: 'Horas', value: course.hours },
    { label: 'Duración', value: course.duration },
    { label: 'Registro', value: course.registro },
    { label: 'Modalidad', value: course.modalidad }
  ].filter(b => b.value)
  
  badgeData.forEach((badge, idx) => {
    pdf.setFont('helvetica', 'bold')
    pdf.text(badge.label + ':', xBadge, yPos + 8)
    pdf.setFont('helvetica', 'normal')
    pdf.text(badge.value, xBadge, yPos + 14)
    xBadge += 45
  })
  yPos += 30

  // Description
  if (course.description) {
    checkPageBreak(20)
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(41, 128, 185)
    pdf.text('Descripción', margin, yPos)
    yPos += 7
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(0, 0, 0)
    const descLines = pdf.splitTextToSize(course.description, pageWidth - 2 * margin)
    descLines.forEach(line => {
      checkPageBreak(6)
      pdf.text(line, margin, yPos)
      yPos += 5
    })
    yPos += 5
  }

  // Perfil del Egresado
  if (course.perfil_egresado) {
    checkPageBreak(20)
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(41, 128, 185)
    pdf.text('Perfil del Egresado', margin, yPos)
    yPos += 7
    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(0, 0, 0)
    const perfilText = String(course.perfil_egresado)
    const perfilLines = perfilText.split(/\r?\n/).filter(Boolean)
    perfilLines.forEach((line, idx) => {
      checkPageBreak(5)
      if (idx === 0) pdf.setFont('helvetica', 'bold')
      else pdf.setFont('helvetica', 'normal')
      const wrapped = pdf.splitTextToSize('• ' + line.trim(), pageWidth - 2 * margin - 5)
      wrapped.forEach(w => {
        pdf.text(w, margin + 3, yPos)
        yPos += 4.5
      })
    })
    yPos += 5
  }

  // Razones para estudiar
  if (course.razones_para_estudiar) {
    checkPageBreak(20)
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(41, 128, 185)
    pdf.text('¿Por qué estudiar este curso?', margin, yPos)
    yPos += 7
    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(0, 0, 0)
    const razonesText = String(course.razones_para_estudiar)
    const razonesLines = razonesText.includes('•') 
      ? razonesText.split('•').map(l => l.trim()).filter(Boolean)
      : razonesText.split(/\r?\n/).filter(Boolean)
    razonesLines.forEach(line => {
      checkPageBreak(5)
      const wrapped = pdf.splitTextToSize('• ' + line.trim(), pageWidth - 2 * margin - 5)
      wrapped.forEach(w => {
        pdf.text(w, margin + 3, yPos)
        yPos += 4.5
      })
    })
    yPos += 5
  }

  // Público objetivo
  if (course.publico_objetivo) {
    checkPageBreak(20)
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(41, 128, 185)
    pdf.text('Público Objetivo', margin, yPos)
    yPos += 7
    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(0, 0, 0)
    const publicoText = String(course.publico_objetivo)
    const publicoLines = publicoText.includes('•') 
      ? publicoText.split('•').map(l => l.trim()).filter(Boolean)
      : publicoText.split(/\r?\n/).filter(Boolean)
    publicoLines.forEach(line => {
      checkPageBreak(5)
      const wrapped = pdf.splitTextToSize('• ' + line.trim(), pageWidth - 2 * margin - 5)
      wrapped.forEach(w => {
        pdf.text(w, margin + 3, yPos)
        yPos += 4.5
      })
    })
    yPos += 5
  }

  // Horarios
  if (schedulesByDay && Object.keys(schedulesByDay).length > 0) {
    checkPageBreak(20)
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(41, 128, 185)
    pdf.text('Horarios', margin, yPos)
    yPos += 7
    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(0, 0, 0)
    Object.keys(schedulesByDay).forEach(day => {
      checkPageBreak(8)
      pdf.setFont('helvetica', 'bold')
      pdf.text(day + ':', margin + 3, yPos)
      yPos += 5
      schedulesByDay[day].forEach(s => {
        checkPageBreak(5)
        pdf.setFont('helvetica', 'normal')
        const schedText = `  ${s.turno || ''} · ${s.hora_inicio?.substring(0,5) || ''} - ${s.hora_fin?.substring(0,5) || ''}${s.aula ? ' · Aula: ' + s.aula : ''}`
        pdf.text(schedText, margin + 5, yPos)
        yPos += 4.5
      })
    })
    yPos += 5
  }

  // Unidades didácticas
  const temario = parseJsonField(course.temario)
  if (temario && temario.length > 0) {
    checkPageBreak(20)
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(41, 128, 185)
    pdf.text('Unidades Didácticas', margin, yPos)
    yPos += 7
    pdf.setFontSize(9)
    
    temario.forEach((unidad, idx) => {
      checkPageBreak(10)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(0, 0, 0)
      const unidadTitle = `${unidad.nivel || ''} — ${unidad.titulo || ''}`
      pdf.text(unidadTitle, margin + 3, yPos)
      yPos += 5
      
      if (Array.isArray(unidad.temas)) {
        unidad.temas.forEach(tema => {
          checkPageBreak(6)
          pdf.setFont('helvetica', 'bold')
          pdf.text('  • ' + tema.titulo, margin + 5, yPos)
          yPos += 4.5
          if (Array.isArray(tema.subtemas)) {
            tema.subtemas.forEach(sub => {
              checkPageBreak(5)
              pdf.setFont('helvetica', 'normal')
              const subWrapped = pdf.splitTextToSize('    - ' + sub, pageWidth - 2 * margin - 10)
              subWrapped.forEach(sw => {
                pdf.text(sw, margin + 7, yPos)
                yPos += 4
              })
            })
          }
        })
      }
      yPos += 3
    })
  }

  // Footer
  const totalPages = pdf.internal.pages.length - 1
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i)
    pdf.setFontSize(8)
    pdf.setTextColor(150, 150, 150)
    pdf.text('Escuelas Técnicas del Perú - www.escuelastecnicas.pe', pageWidth / 2, pageHeight - 10, { align: 'center' })
    pdf.text(`Página ${i} de ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: 'right' })
  }

  // Save PDF
  const fileName = `Brochure_${course.title?.replace(/[^a-zA-Z0-9]/g, '_') || 'Curso'}.pdf`
  pdf.save(fileName)
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
  // prepare schedules grouped by day for display
  const schedules = Array.isArray(course.schedules) ? course.schedules : []
  const schedulesByDay = schedules.reduce((acc, s) => {
    const d = s.dia || 'Sin día'
    if (!acc[d]) acc[d] = []
    acc[d].push(s)
    return acc
  }, {})

  const handleDownloadBrochure = () => {
    generateBrochurePDF(course, schedulesByDay)
  }

  return (
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
            <button onClick={() => navigate(-1)} className="btn-back mb-3">
              <i className="bi bi-arrow-left"></i> Volver
            </button>
            <div className="row align-items-center">
              <div className="col-lg-8">
                <div className="cd-hero-content">
                  {course.grado && <span className="cd-badge-grado">{course.grado}</span>}
                  <h1 className="cd-hero-title">{course.title}</h1>
                  {course.subtitle && <p className="cd-hero-subtitle">{course.subtitle}</p>}
                  <div className="cd-hero-actions mt-4">
                    <button onClick={handleDownloadBrochure} className="btn btn-primary btn-lg me-3">
                      <i className="bi bi-download me-2"></i>Descargar Brochure
                    </button>
                    <Link to="/contacto" className="btn btn-outline-light btn-lg">
                      <i className="bi bi-envelope me-2"></i>Contactar
                    </Link>
                  </div>
                </div>
              </div>
              {img && (
                <div className="col-lg-4 d-none d-lg-block">
                  <div className="cd-hero-img-wrapper">
                    <img src={img} alt={course.title} className="cd-hero-img" />
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
          {course.hours && (
            <div className="cd-info-badge">
              <i className="bi bi-clock-fill"></i>
              <div><small>Horas</small><strong>{course.hours}</strong></div>
            </div>
          )}
          {course.duration && (
            <div className="cd-info-badge">
              <i className="bi bi-calendar3-fill"></i>
              <div><small>Duración</small><strong>{course.duration}</strong></div>
            </div>
          )}
          {course.registro && (
            <div className="cd-info-badge">
              <i className="bi bi-award-fill"></i>
              <div><small>Registro</small><strong>{course.registro}</strong></div>
            </div>
          )}
          {course.modalidad && (
            <div className="cd-info-badge">
              <i className="bi bi-laptop-fill"></i>
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
            {/* Descripción */}
            {course.description && (
              <div className="cd-card cd-card-description">
                <div className="cd-card-header">
                  <i className="bi bi-info-circle-fill"></i>
                  <h4 className="cd-card-title mb-0">Descripción del Curso</h4>
                </div>
                <p className="cd-description">{course.description}</p>
              </div>
            )}

            {/* Razones para estudiar - destacado */}
            {course.razones_para_estudiar && (
              <div className="cd-card cd-card-highlight">
                <div className="cd-card-header">
                  <i className="bi bi-lightbulb-fill"></i>
                  <h4 className="cd-card-title mb-0">¿Por qué estudiar este curso?</h4>
                </div>
                <div className="cd-card-body">{renderTextWithLines(course.razones_para_estudiar)}</div>
              </div>
            )}

            {/* Público objetivo */}
            {course.publico_objetivo && (
              <div className="cd-card cd-card-target">
                <div className="cd-card-header">
                  <i className="bi bi-people-fill"></i>
                  <h4 className="cd-card-title mb-0">¿A quién va dirigido?</h4>
                </div>
                <div className="cd-card-body">{renderTextWithLines(course.publico_objetivo)}</div>
              </div>
            )}

            {/* Perfil egresado */}
            {course.perfil_egresado && (
              <div className="cd-card cd-card-profile">
                <div className="cd-card-header">
                  <i className="bi bi-person-check-fill"></i>
                  <h4 className="cd-card-title mb-0">Perfil del Egresado</h4>
                </div>
                <div className="cd-card-body">{renderWithLeadingBold(course.perfil_egresado)}</div>
              </div>
            )}

            {/* Unidades didácticas (anteriormente 'Temario') */}
            {temario && (
              <div className="cd-card cd-card-curriculum">
                <div className="cd-card-header">
                  <i className="bi bi-list-check"></i>
                  <h4 className="cd-card-title mb-0">Plan de Estudios</h4>
                </div>
                <div className="cd-curriculum-content">
                  {renderSections(temario)}
                </div>
              </div>
            )}

            {/* Misión / Visión */}
            {(course.mision || course.vision) && (
              <div className="cd-card">
                <div className="cd-card-header">
                  <i className="bi bi-bullseye"></i>
                  <h4 className="cd-card-title mb-0">Misión y Visión</h4>
                </div>
                <div className="row g-3 p-3">
                  {course.mision && (
                    <div className="col-12 col-md-6">
                      <div className="cd-mv-box cd-mision">
                        <h6><i className="bi bi-flag-fill me-2"></i>Misión</h6>
                        <p>{course.mision}</p>
                      </div>
                    </div>
                  )}
                  {course.vision && (
                    <div className="col-12 col-md-6">
                      <div className="cd-mv-box cd-vision">
                        <h6><i className="bi bi-eye-fill me-2"></i>Visión</h6>
                        <p>{course.vision}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN — sidebar */}
          <div className="col-12 col-lg-4">
            {/* CTA destacado arriba */}
            <div className="cd-sticky-sidebar">
              <div className="cd-sidebar-card cd-cta-card">
                <h5><i className="bi bi-star-fill me-2"></i>¿Te interesa?</h5>
                <p className="small mb-3">Obtén más información sobre matrícula, precios y beneficios.</p>
                <button onClick={handleDownloadBrochure} className="btn btn-primary w-100 mb-2">
                  <i className="bi bi-download me-2"></i>Descargar Brochure
                </button>
                <Link to="/contacto" className="btn btn-accent w-100">
                  <i className="bi bi-envelope me-2"></i>Solicitar Información
                </Link>
              </div>

              {/* Horarios */}
              {schedules && schedules.length > 0 && (
                <div className="cd-sidebar-card cd-sidebar-schedules">
                  <h5 className="cd-sidebar-title"><i className="bi bi-clock-fill me-2"></i>Horarios Disponibles</h5>
                  <div className="cd-schedules-list">
                    {Object.keys(schedulesByDay).map(day => (
                      <div key={day} className="cd-schedule-item">
                        <div className="cd-schedule-day">{day}</div>
                        <div className="cd-schedule-times">
                          {schedulesByDay[day].map((s, i) => (
                            <div key={i} className="cd-schedule-time">
                              <span className="badge bg-primary me-2">{s.turno || 'N/A'}</span>
                              <span className="time">{s.hora_inicio && s.hora_fin ? `${s.hora_inicio.substring(0,5)} - ${s.hora_fin.substring(0,5)}` : 'Consultar'}</span>
                              {s.aula && <span className="aula text-muted ms-2">· Aula {s.aula}</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Convenios */}
              {course.convenios && course.convenios.length > 0 && (
                <div className="cd-sidebar-card">
                  <h5 className="cd-sidebar-title"><i className="bi bi-handshake me-2"></i>Convenios</h5>
                  <div className="cd-convenios-list">
                    {course.convenios.map(conv => (
                      <div key={conv.id} className="cd-convenio-item">
                        {conv.logo && <img src={conv.logo} alt={conv.institucion} className="cd-convenio-logo" />}
                        <div className="cd-convenio-info">
                          <strong>{conv.institucion}</strong>
                          {conv.descripcion && <p className="mb-1 small text-muted">{conv.descripcion}</p>}
                          {conv.url && (
                            <a href={conv.url} target="_blank" rel="noopener noreferrer" className="small">
                              Ver más <i className="bi bi-box-arrow-up-right"></i>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Docentes */}
              {course.docentes && course.docentes.length > 0 && (
                <div className="cd-sidebar-card">
                  <h5 className="cd-sidebar-title"><i className="bi bi-mortarboard-fill me-2"></i>Docentes</h5>
                  <div className="cd-docentes-list">
                    {course.docentes.map((d, i) => (
                      <div key={i} className="cd-docente-item">
                        {d.foto && <img src={d.foto} alt={d.nombre} className="cd-docente-foto" />}
                        <div className="cd-docente-info">
                          <strong>{d.nombre}</strong>
                          {d.especialidad && <div className="small text-muted">{d.especialidad}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certificados */}
              {course.certificados && course.certificados.length > 0 && (
                <div className="cd-sidebar-card">
                  <h5 className="cd-sidebar-title"><i className="bi bi-patch-check-fill me-2"></i>Certificaciones</h5>
                  <div className="cd-certs-list">
                    {course.certificados.map((cert, i) => (
                      <div key={i} className="cd-cert-item">
                        <i className="bi bi-award text-warning me-2"></i>
                        <div>
                          <strong>{cert.nombre || cert.title}</strong>
                          {cert.descripcion && <div className="small text-muted">{cert.descripcion}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Seminarios */}
              {course.seminarios && course.seminarios.length > 0 && (
                <div className="cd-sidebar-card">
                  <h5 className="cd-sidebar-title"><i className="bi bi-mic-fill me-2"></i>Seminarios</h5>
                  <div className="cd-seminars-list">
                    {course.seminarios.map((s, i) => (
                      <div key={i} className="cd-seminar-item">
                        <i className="bi bi-calendar-event me-2"></i>
                        <div>
                          <strong>{s.titulo || s.title}</strong>
                          {s.fecha && <div className="small text-muted">{s.fecha}</div>}
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
  )
}
