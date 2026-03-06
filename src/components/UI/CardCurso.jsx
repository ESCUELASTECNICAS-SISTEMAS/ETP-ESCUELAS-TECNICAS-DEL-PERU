import React from 'react'
import { Link } from 'react-router-dom'

export default function CardCurso({curso}){
  const imgSrc = curso.image || curso.imagen || (curso.thumbnail && curso.thumbnail.url) || '/assets/images/cursos/curso-1.jpg'
  const detailUrl = `/curso/${curso.id}`
  const subtitle = curso.subtitle || curso.descripcion || ''
  const price = curso.precio ?? curso.price ?? curso.pago_unico ?? null
  const matricula = curso.matricula ?? curso.enrollment ?? null
  const pension = curso.pension ?? curso.pension_mensual ?? null
  const isOffer = Boolean(curso.oferta ?? curso.en_oferta)
  const discountPct = curso.descuento ?? curso.descuento_pct ?? null

  const applyDiscount = (amount) => {
    if (!isOffer || discountPct == null || amount == null) return null
    return Math.round((Number(amount) * (100 - Number(discountPct))) / 100)
  }

  const discountedPrice = applyDiscount(price)
  const discountedPension = applyDiscount(pension)
  const hasMatricula = matricula != null && Number(matricula) > 0
  const hasPension = pension != null && Number(pension) > 0
  const isPackageSinglePayment = price != null && !hasMatricula && !hasPension

  return (
    <div className="cc-card">
      <div className="cc-img-wrap">
        <img src={imgSrc} className="cc-img" alt={curso.titulo || curso.title || ''} />
        <div className="cc-img-overlay">
          <Link to={detailUrl} className="btn btn-sm btn-light cc-overlay-btn"><i className="bi bi-eye me-1"></i>Ver más</Link>
          <Link to="/contacto" className="btn btn-sm btn-accent cc-overlay-btn"><i className="bi bi-send me-1"></i>Inscribirme</Link>
        </div>
      </div>
      <div className="cc-body">
        <h5 className="cc-title">{curso.titulo || curso.title}</h5>
        {subtitle && <p className="cc-subtitle">{subtitle.length > 80 ? subtitle.slice(0,80)+'…' : subtitle}</p>}
        <div className="cc-meta">
          {curso.duracion && <span className="cc-meta-item"><i className="bi bi-clock"></i>{String(curso.duracion).toUpperCase()}</span>}
        </div>
        {price != null && (
          <div className="cc-price">
            {discountedPrice ? (
              <>
                <span className="cc-price-old">S/ {price}</span>
                <span className="cc-price-now">S/ {discountedPrice}</span>
                <span className="badge bg-danger ms-2">-{discountPct}%</span>
              </>
            ) : (
              <span className="cc-price-now">S/ {price}</span>
            )}
          </div>
        )}
        {(hasMatricula || hasPension) && (
          <div className="cc-fees">
            {hasMatricula && (
              <span>
                Matrícula: 
                <strong className="ms-1">S/ {matricula}</strong>
              </span>
            )}
            {hasPension && (
              <span>
                Mensualidad: 
                {discountedPension != null ? (
                  <>
                    <span className="cc-price-old ms-1">S/ {pension}</span>
                    <strong className="ms-1">S/ {discountedPension}</strong>
                  </>
                ) : (
                  <strong className="ms-1">S/ {pension}</strong>
                )}
              </span>
            )}
            <span
              className="text-muted"
              title="Matrícula única. La mensualidad se paga por unidad, módulo o mes según el curso o carrera."
              aria-label="Información de matrícula y mensualidad"
              style={{ cursor: 'help' }}
            >
              <i className="bi bi-info-circle"></i>
            </span>
          </div>
        )}
        {isPackageSinglePayment && (
          <div className="mt-2">
            <span className="badge bg-primary-subtle text-primary-emphasis border border-primary-subtle">
              Paquete completo pago unico
            </span>
          </div>
        )}
        <Link to={detailUrl} className="cc-cta">
          Ver detalles <i className="bi bi-arrow-right"></i>
        </Link>
      </div>
    </div>
  )
}
