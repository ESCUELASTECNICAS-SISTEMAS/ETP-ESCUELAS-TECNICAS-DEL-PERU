import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { endpoints } from '../../utils/apiStatic'

export default function CardCurso({curso}){
  const [showBranchModal, setShowBranchModal] = useState(false)
  const [sucursales, setSucursales] = useState([])

  useEffect(() => {
    if (!showBranchModal) return
    axios.get(endpoints.SUCURSALES)
      .then(r => setSucursales((Array.isArray(r.data) ? r.data : []).filter(s => s.active !== false)))
      .catch(() => setSucursales([]))
  }, [showBranchModal])

  const openWhatsApp = (suc) => {
    const nombre = curso.titulo || curso.title || 'este curso'
    const sucName = suc.nombre || suc.name || ''
    const phoneRaw = (suc.telefono || suc.phone || suc.telefono_whatsapp || '950340502').replace(/\D/g, '')
    const number = phoneRaw.startsWith('51') ? phoneRaw : '51' + phoneRaw
    const rawMod = String(curso.modalidad || curso.mode || curso.modality || '').toLowerCase()
    const esVirtual = rawMod.includes('virtual') || Boolean(curso.is_virtual)
    const modalidadTxt = esVirtual ? ' en modalidad VIRTUAL' : ''
    const msg = encodeURIComponent(`Hola, vengo desde la p\u00e1gina y me interesa inscribirme en el curso: ${nombre}${modalidadTxt} y soy de la sucursal ${sucName}`)
    window.open(`https://wa.me/${number}?text=${msg}`, '_blank')
    setShowBranchModal(false)
  }

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
    <div className="cc-card card border border-secondary-subtle shadow-sm h-100">
      <div className="cc-img-wrap">
        <img src={imgSrc} className="cc-img" alt={curso.titulo || curso.title || ''} />
        <div className="cc-img-overlay">
          <Link to={detailUrl} className="btn btn-sm btn-light cc-overlay-btn"><i className="bi bi-eye me-1"></i>Ver más</Link>
          <button type="button" onClick={()=>setShowBranchModal(true)} className="btn btn-sm btn-success cc-overlay-btn" style={{backgroundColor:'#25D366',borderColor:'#25D366'}}><i className="bi bi-whatsapp me-1"></i>Inscribirme</button>
        </div>
        {showBranchModal && (
          <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,.55)',borderRadius:'inherit',zIndex:10,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'}} onClick={()=>setShowBranchModal(false)}>
            <div style={{background:'#fff',borderRadius:12,padding:'1.2rem',minWidth:200,maxWidth:280,boxShadow:'0 8px 24px rgba(0,0,0,.2)'}} onClick={e=>e.stopPropagation()}>
              <p className="fw-bold text-center mb-3" style={{fontSize:'.9rem'}}>¿De qué sucursal eres?</p>
              {sucursales.length === 0 && <p className="text-muted small text-center">Cargando...</p>}
              <div className="d-grid gap-2">
                {sucursales.map(s => (
                  <button key={s.id} className="btn btn-success btn-sm d-flex align-items-center justify-content-center gap-2" style={{backgroundColor:'#25D366',borderColor:'#25D366'}} onClick={()=>openWhatsApp(s)}>
                    <i className="bi bi-whatsapp"></i> {s.nombre || s.name}
                  </button>
                ))}
              </div>
              <button className="btn btn-sm btn-outline-secondary w-100 mt-2" onClick={()=>setShowBranchModal(false)}>Cancelar</button>
            </div>
          </div>
        )}
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
