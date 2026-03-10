import React from 'react'
import { Link } from 'react-router-dom'

export default function CourseCard({ item, showPrice = true }) {
  const WHATSAPP_NUMBER = '51950340502' // Perú +51 950 340 502

  const handleInscribirse = () => {
    const nombre = item.titulo || item.title || 'este curso'
    const msg = encodeURIComponent(`Buenas, vengo desde la página y me interesa el curso: ${nombre}`)
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank')
  }

  const price = item.precio ?? item.price ?? item.pago_unico ?? null
  const matricula = item.matricula ?? item.enrollment ?? null
  const pension = item.pension ?? item.pension_mensual ?? null
  const isOffer = Boolean(item.oferta ?? item.en_oferta)
  const discountPct = item.descuento ?? item.descuento_pct ?? null

  const applyDiscount = (amount) => {
    if (!isOffer || discountPct == null || amount == null) return null
    return Math.round((Number(amount) * (100 - Number(discountPct))) / 100)
  }

  const discountedPrice = applyDiscount(price)
  const discountedPension = applyDiscount(pension)
  const hasMatricula = matricula != null && Number(matricula) > 0
  const hasPension = pension != null && Number(pension) > 0
  const isPackageSinglePayment = showPrice && price != null && !hasMatricula && !hasPension

  const imgSrc = item.image || item.imagen || item.image_url || item.url || (item.thumbnail && item.thumbnail.url) || (item.media && item.media.url) || item.foto || null

  const rawModalidad = item.modalidad || item.mode || item.modality || item.modalidad_tipo || ''
  const normalizedModalidad = String(rawModalidad || '').trim().toLowerCase()
  const isVirtual = Boolean(item.is_virtual) || normalizedModalidad === 'virtual' || normalizedModalidad === 'hibrido' || normalizedModalidad === 'híbrido'
  const isPresencial = Boolean(item.is_presencial) || normalizedModalidad === 'presencial' || normalizedModalidad === 'hibrido' || normalizedModalidad === 'híbrido'
  const hoursVal = item.duration || item.hours || item.horas || null
  const subtitle = item.subtitle || item.descripcion || ''
  const detailUrl = item.tipo === 'Programa' ? `/programa/${item.id}` : `/curso/${item.id}`

  return (
    <div className="cc-card card border border-secondary-subtle shadow-sm h-100">
      <div className="cc-img-wrap">
        {imgSrc ? (
          <img src={imgSrc} className="cc-img" alt={item.titulo || item.title || ''} />
        ) : (
          <div className="cc-img-placeholder">
            <i className="bi bi-mortarboard fs-1"></i>
          </div>
        )}
        <div className="cc-img-overlay">
          <Link to={detailUrl} className="btn btn-sm btn-light cc-overlay-btn"><i className="bi bi-eye me-1"></i>Ver más</Link>
          <button type="button" onClick={handleInscribirse} className="btn btn-sm btn-success cc-overlay-btn" style={{backgroundColor:'#25D366',borderColor:'#25D366'}}><i className="bi bi-whatsapp me-1"></i>Inscribirme</button>
        </div>
      </div>
      <div className="cc-body">
        <h5 className="cc-title">{item.titulo || item.title}</h5>
        {subtitle && <p className="cc-subtitle">{subtitle.length > 80 ? subtitle.slice(0,80)+'…' : subtitle}</p>}
        <div className="cc-meta">
          {hoursVal && <span className="cc-meta-item"><i className="bi bi-clock"></i>{String(hoursVal).toUpperCase()} {typeof hoursVal === 'number' ? 'HRS' : ''}</span>}
        </div>

        {(isVirtual || isPresencial) && (
          <div className="cc-modalidades">
            {isVirtual && (
              <span className="cc-modalidad cc-modalidad-virtual">
                <i className="bi bi-laptop me-1"></i>Virtual
              </span>
            )}
            {isPresencial && (
              <span className="cc-modalidad cc-modalidad-presencial">
                <i className="bi bi-building me-1"></i>Presencial
              </span>
            )}
          </div>
        )}

        {showPrice && price != null && (
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

        {showPrice && (hasMatricula || hasPension) && (
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
