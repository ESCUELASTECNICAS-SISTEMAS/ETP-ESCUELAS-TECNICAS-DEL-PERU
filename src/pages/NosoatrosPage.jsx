import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import { endpoints } from '../utils/apiStatic'
import NuestrosBlogsSection from '../components/home/NuestrosBlogsSection';
const KEYFRAMES = `
@keyframes fadeUp { from{opacity:0;transform:translateY(36px)} to{opacity:1;transform:translateY(0)} }
@keyframes spin   { to{transform:rotate(360deg)} }
@keyframes pulse  { 0%,100%{opacity:.6} 50%{opacity:1} }
@keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }
.fu0{animation:fadeUp .8s ease both}
.fu1{animation:fadeUp .8s .15s ease both}
.fu2{animation:fadeUp .8s .3s ease both}
.fu3{animation:fadeUp .8s .45s ease both}
.fu4{animation:fadeUp .8s .6s ease both}

/* ── RESPONSIVE GLOBAL ── */
* { box-sizing: border-box; }

/* ── HERO SECTION ── */
@media (max-width: 991px) {
  .hero-section {
    padding-top: 72px !important;
    padding-bottom: 48px !important;
  }
}
@media (max-width: 575px) {
  .hero-section {
    padding-top: 64px !important;
    padding-bottom: 40px !important;
  }
  .hero-badge {
    font-size: .62rem !important;
    letter-spacing: .08em !important;
    padding: 5px 12px !important;
  }
  .hero-cta-wrap {
    flex-direction: column !important;
    gap: 10px !important;
  }
  .hero-cta-wrap .btn {
    width: 100% !important;
    text-align: center !important;
  }
  .hero-stats-col {
    text-align: center;
  }
  .stat-num {
    font-size: 1.25rem !important;
  }
  .stat-label {
    font-size: .6rem !important;
  }
}

/* ── FORM CARD ── */
@media (max-width: 575px) {
  .form-card {
    padding: 22px 18px 28px !important;
  }
  .form-card .form-control,
  .form-card .form-select {
    font-size: .9rem !important;
  }
}

/* ── QUIÉNES SOMOS ── */
@media (max-width: 767px) {
  .qs-blue-block {
    min-height: 200px !important;
    padding: 28px 24px 24px !important;
  }
  .qs-anios-num {
    font-size: 2.6rem !important;
  }
  .qs-corner-badge {
    width: 104px !important;
    height: 72px !important;
  }
}

/* ── MISIÓN/VISIÓN CARDS ── */
@media (max-width: 767px) {
  .mv-card {
    padding: 28px 22px !important;
  }
  .mv-icon {
    width: 50px !important;
    height: 50px !important;
    font-size: 1.5rem !important;
  }
}

/* ── VALORES ── */
@media (max-width: 575px) {
  .valor-card {
    padding: 18px 16px !important;
  }
  .valor-icon {
    width: 44px !important;
    height: 44px !important;
    font-size: 1.2rem !important;
  }
}

/* ── FAQ ── */
@media (max-width: 575px) {
  .faq-title {
    font-size: 1.45rem !important;
  }
  .accordion-button {
    font-size: .92rem !important;
    padding: 13px 14px !important;
    line-height: 1.45 !important;
  }
  .accordion-body {
    font-size: .9rem !important;
    padding: 12px 14px !important;
  }
}

/* ── CTA FINAL ── */
@media (max-width: 575px) {
  .cta-section {
    padding: 72px 16px !important;
  }
  .cta-btn {
    width: 100% !important;
    font-size: .97rem !important;
    padding: 14px 20px !important;
  }
}

/* ── TICKER ── */
@media (max-width: 575px) {
  .ticker-span {
    font-size: .72rem !important;
    letter-spacing: .1em !important;
    gap: 28px !important;
  }
}
`

function injectKF(){
  if(document.getElementById('__nkf2'))return
  const s=document.createElement('style');s.id='__nkf2';s.textContent=KEYFRAMES
  document.head.appendChild(s)
}

function Counter({end}){
  const [c,setC]=useState(0),ref=useRef(null),started=useRef(false)
  useEffect(()=>{
    const obs=new IntersectionObserver(([e])=>{
      if(e.isIntersecting&&!started.current){
        started.current=true
        const steps=60,dur=1800,inc=parseFloat(end)/steps;let cur=0
        const t=setInterval(()=>{ cur+=inc; if(cur>=parseFloat(end)){setC(end);clearInterval(t)}else setC(Math.floor(cur)) },dur/steps)
      }
    },{threshold:.3})
    if(ref.current)obs.observe(ref.current)
    return()=>obs.disconnect()
  },[end])
  return <span ref={ref}>{c}</span>
}

export default function NosotrosPage(){
  const videoRef=useRef(null)
  const [data,setData]=useState(null)
  const [loading,setLoading]=useState(true)
  const [error,setError]=useState(null)
  const [preForm,setPreForm]=useState({nombres:'',apellidos:'',dni:'',telefono:'',email:'',modalidad_id:'',course_id:'',sucursal_id:''})
  const [preSending,setPreSending]=useState(false)
  const [preMsg,setPreMsg]=useState('')
  const [preErr,setPreErr]=useState('')
  const [modalidades,setModalidades]=useState([])
  const [sucursales,setSucursales]=useState([])

  useEffect(()=>{injectKF()},[])

  useEffect(()=>{
    ;(async()=>{
      try{
        const res=await axios.get(endpoints.NOSOTROS,{timeout:5000})
        let rec=Array.isArray(res.data)?res.data[0]:res.data
        setData(rec||null)
        if(!rec)setError('No hay registros en la base de datos')
      }catch(e){setError(`Error: ${e.message}`)}
      finally{setLoading(false)}
    })()
    axios.get(endpoints.MODALIDADES).then(r=>{
      setModalidades(Array.isArray(r.data)?r.data:[])
    }).catch(()=>setModalidades([]))
    axios.get(endpoints.SUCURSALES).then(r=>{
      setSucursales(Array.isArray(r.data)?r.data:[])
    }).catch(()=>setSucursales([]))
  },[])

  const preBase=endpoints.PRE_INSCRIPCIONES || `${(import.meta.env.VITE_API_BASE||'http://localhost:3000').replace(/\/$/,'')}/pre-inscripciones`

  const submitPre=(e)=>{
    e.preventDefault()
    setPreErr('');setPreMsg('');setPreSending(true)
    const payload = {
      nombre: preForm.nombres,
      apellido: preForm.apellidos,
      nombres: preForm.nombres,
      apellidos: preForm.apellidos,
      dni: preForm.dni,
      celular: preForm.telefono,
      telefono: preForm.telefono,
      email: preForm.email,
      modalidad_id: preForm.modalidad_id ? Number(preForm.modalidad_id) : undefined,
      course_id: preForm.course_id ? Number(preForm.course_id) : undefined,
      sucursal_id: preForm.sucursal_id ? Number(preForm.sucursal_id) : undefined,
      acepta_politicas: true
    }
    console.log('Datos a enviar:', payload)
    axios.post(preBase, payload).then(()=>{
      setPreMsg('¡Pre-inscripción enviada! Te contactaremos pronto.')
      setPreForm({nombres:'',apellidos:'',dni:'',telefono:'',email:'',modalidad_id:'',course_id:'',sucursal_id:''})
    }).catch(err=>{
      console.error('pre-inscripcion',err)
      setPreErr('No se pudo enviar. Intenta de nuevo o revisa los datos.')
    }).finally(()=>setPreSending(false))
  }

  if(loading)return(
    <div className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{background:'#0f0f14'}}>
      <div className="text-center">
        <div style={{width:48,height:48,border:'3px solid rgba(255,255,255,0.1)',borderTop:'3px solid #f97316',borderRadius:'50%',animation:'spin .8s linear infinite',margin:'0 auto 16px'}}/>
        <p className="fw-semibold" style={{color:'#888',letterSpacing:'0.08em',fontSize:'.9rem'}}>Cargando…</p>
      </div>
    </div>
  )

  if(error||!data)return(
    <div className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{background:'#0f0f14',padding:'0 20px'}}>
      <div className="text-center text-white p-4 rounded-4"
        style={{border:'1px solid rgba(255,255,255,0.1)',maxWidth:420,width:'100%'}}>
        <div className="fs-1 mb-3">{error?'❌':'⚠️'}</div>
        <h5 className="fw-bold mb-2">{error?'Error al cargar':'Sin datos'}</h5>
        <p style={{color:'#888'}}>{error||'No hay información disponible.'}</p>
      </div>
    </div>
  )

  const valores=(data?.valores||[]).map(v=>typeof v==='string'?{title:v.replace(/:$/,'').trim()}:v)

  const valorColors=[
    {bg:'linear-gradient(135deg,#1a3ab5,#3b6ef8)',shadow:'rgba(26,58,181,0.35)'},
    {bg:'linear-gradient(135deg,#0d1b5a,#1a3ab5)',shadow:'rgba(13,27,90,0.4)'},
    {bg:'linear-gradient(135deg,#ffc107,#ffe58a)',shadow:'rgba(255,193,7,0.45)'},
    {bg:'linear-gradient(135deg,#1a3ab5,#4f8bff)',shadow:'rgba(26,58,181,0.35)'},
    {bg:'linear-gradient(135deg,#0d1b5a,#182e72)',shadow:'rgba(13,27,90,0.45)'},
    {bg:'linear-gradient(135deg,#ffc107,#ffda6a)',shadow:'rgba(255,193,7,0.4)'},
    {bg:'linear-gradient(135deg,#1a3ab5,#3b6ef8)',shadow:'rgba(26,58,181,0.35)'},
    {bg:'linear-gradient(135deg,#0d1b5a,#1a3ab5)',shadow:'rgba(13,27,90,0.4)'},
    {bg:'linear-gradient(135deg,#ffc107,#ffe58a)',shadow:'rgba(255,193,7,0.45)'},
    {bg:'linear-gradient(135deg,#1a3ab5,#4f8bff)',shadow:'rgba(26,58,181,0.35)'},
  ]
  const emojis=['⭐','🤝','💡','❤️','🌱','🔥','🏆','📚','✨','🚀']

  return(
    <div style={{background:'#0f0f14',color:'#fff',fontFamily:"'Segoe UI',system-ui,sans-serif"}}>

      {/* ═══════════════════════════════════════════
          1 ▸ HERO + FORMULARIO
          En móvil: hero primero, form debajo (order-1/order-2)
          En desktop: lado a lado (col-lg-6 + col-lg-6)
      ═══════════════════════════════════════════ */}
      <section
        id="preinscripcion"
        className="hero-section position-relative overflow-hidden"
        style={{
          minHeight:'100vh',
          paddingTop:90,
          paddingBottom:64,
          background:'linear-gradient(145deg,#0b37c9 0%,#0a2fa3 45%,#061a66 100%)'
        }}
      >
        {/* Patrón de puntos */}
        <div className="position-absolute w-100 h-100"
          style={{opacity:.12,backgroundImage:'radial-gradient(circle at 1px 1px,rgba(255,255,255,0.14) 1px,transparent 0)',backgroundSize:'20px 20px',pointerEvents:'none'}}/>
        {/* Blobs — sólo en tablet/desktop */}
        <div className="position-absolute rounded-circle d-none d-lg-block"
          style={{width:480,height:480,background:'radial-gradient(circle,rgba(255,255,255,0.07) 0%,transparent 70%)',top:'-8%',left:'-6%',pointerEvents:'none'}}/>
        <div className="position-absolute rounded-circle d-none d-md-block"
          style={{width:320,height:320,background:'radial-gradient(circle,rgba(255,176,23,0.12) 0%,transparent 70%)',bottom:'5%',left:'30%',pointerEvents:'none'}}/>

        <div className="container position-relative" style={{zIndex:2}}>
          <div className="row gy-4 gy-lg-5 align-items-start">

            {/* ── Col izquierda: hero copy (PRIMERO en móvil) ── */}
            <div className="col-12 col-lg-6 order-1 order-lg-1 text-white fu0">
              {data?.logo&&(
                <img src={data.logo} alt="Logo" className="mb-3 mb-lg-4"
                  style={{height:50,objectFit:'contain',filter:'drop-shadow(0 0 16px rgba(0,0,0,0.5))'}}/>
              )}

              <span className="hero-badge badge rounded-pill fw-bold px-3 py-2 mb-3 d-inline-block"
                style={{background:'rgba(6,26,102,0.85)',border:'1px solid rgba(255,255,255,0.18)',letterSpacing:'.14em',fontSize:'.72rem'}}>
                ACELERADORA DE EMPLEABILIDAD · ICA, PERÚ
              </span>

              <h1 className="fw-black mb-3 fu1"
                style={{fontSize:'clamp(2.1rem,6vw,4rem)',lineHeight:1.06,letterSpacing:'-0.03em'}}>
                Tu carrera técnica<br/>empieza <span style={{color:'#ffb017'}}>hoy.</span>
              </h1>

              <p className="fw-light mb-4 fu2"
                style={{fontSize:'1rem',maxWidth:500,color:'rgba(255,255,255,0.78)',lineHeight:1.75}}>
                {data?.anios_texto || 'Formación práctica, currículo alineado al mercado laboral real y laboratorios de punta. De 0 a empleado en menos de 6 meses.'}
              </p>

              {/* Video */}
              {data?.video_url && (
                <div className="mb-4">
                  <div className="rounded-4 shadow-lg overflow-hidden"
                    style={{background:'#000',border:'2px solid #1a3ab5',maxWidth:420,boxShadow:'0 12px 32px rgba(26,58,181,0.18)'}}>
                    <video ref={videoRef} controls preload="metadata" playsInline
                      poster={data?.video_poster} autoPlay muted
                      style={{width:'100%',display:'block',maxHeight:240,objectFit:'cover',background:'#000'}}>
                      <source src={data.video_url} type="video/mp4"/>
                    </video>
                  </div>
                </div>
              )}

              {/* Botones CTA */}
              <div className="hero-cta-wrap d-flex flex-wrap gap-3 fu3">
                <a href="#quienes-somos" className="btn btn-lg fw-bold rounded-pill px-4 px-sm-5"
                  style={{background:'#ff6a00',border:'none',color:'#111',letterSpacing:'.04em',boxShadow:'0 10px 40px rgba(0,0,0,0.45)'}}>
                  Ver programas
                </a>
                <a href="#quienes-somos" className="btn btn-outline-light btn-lg rounded-pill px-4 fw-semibold"
                  style={{borderColor:'rgba(255,255,255,0.55)',color:'#fff',background:'rgba(6,26,102,0.7)'}}>
                  Conocer ETP
                </a>
              </div>

              {/* Stats */}
              <div className="row mt-4 mt-lg-5 fu4 g-0" style={{maxWidth:400}}>
                {[
                  {n:<><Counter end={data?.anios||13}/>+</>,t:'Años en el sector'},
                  {n:'2K+',t:'Egresados empleados'},
                  {n:'6',t:'Programas activos'}
                ].map((s,i)=>(
                  <div className="col-4 hero-stats-col text-center" key={i}>
                    <div className="stat-num fw-black" style={{fontSize:'1.5rem',color:'#ffb017'}}>{s.n}</div>
                    <p className="stat-label mb-0" style={{fontSize:'.65rem',color:'rgba(255,255,255,0.65)',textTransform:'uppercase',letterSpacing:'.08em',lineHeight:1.4}}>{s.t}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Col derecha: formulario (SEGUNDO en móvil) ── */}
            <div className="col-12 col-lg-6 order-2 order-lg-2 fu2">
              <div className="form-card rounded-4 shadow"
                style={{
                  background:'#fff',color:'#111',
                  padding:'32px 28px 36px',
                  boxShadow:'0 32px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.06)'
                }}>
                {/* Cabecera */}
                <div className="d-flex align-items-center gap-2 mb-1">
                  <div style={{width:5,height:26,borderRadius:4,background:'linear-gradient(180deg,#0b37c9,#061a66)'}}/>
                  <h4 className="fw-black mb-0" style={{letterSpacing:'-0.02em',color:'#0b37c9',fontSize:'1.1rem'}}>Más información</h4>
                </div>
                <p className="text-muted mb-4" style={{fontSize:'.85rem'}}>Un asesor te contactará para confirmar tu vacante.</p>

                {preErr && <div className="alert alert-danger py-2 mb-3" style={{fontSize:'.88rem'}}>{preErr}</div>}
                {preMsg && <div className="alert alert-success py-2 mb-3" style={{fontSize:'.88rem'}}>{preMsg}</div>}

                <form className="row g-3" onSubmit={submitPre}>
                  <div className="col-12 col-sm-6">
                    <label className="form-label fw-semibold small" style={{color:'#374151'}}>Nombres<span className="text-danger">*</span></label>
                    <input className="form-control" style={{borderRadius:8,border:'1.5px solid #d1d5db'}}
                      value={preForm.nombres} onChange={e=>setPreForm(f=>({...f,nombres:e.target.value}))} required />
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label fw-semibold small" style={{color:'#374151'}}>Apellidos<span className="text-danger">*</span></label>
                    <input className="form-control" style={{borderRadius:8,border:'1.5px solid #d1d5db'}}
                      value={preForm.apellidos} onChange={e=>setPreForm(f=>({...f,apellidos:e.target.value}))} required />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold small" style={{color:'#374151'}}>Correo electrónico</label>
                    <input type="email" className="form-control" style={{borderRadius:8,border:'1.5px solid #d1d5db'}}
                      value={preForm.email} onChange={e=>setPreForm(f=>({...f,email:e.target.value}))} />
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label fw-semibold small" style={{color:'#374151'}}>Teléfono móvil<span className="text-danger">*</span></label>
                    <div className="input-group">
                      <span className="input-group-text fw-semibold"
                        style={{background:'#f3f4f6',border:'1.5px solid #d1d5db',borderRight:'none',borderRadius:'8px 0 0 8px',fontSize:'.82rem'}}>
                        PE +51
                      </span>
                      <input className="form-control"
                        style={{borderRadius:'0 8px 8px 0',border:'1.5px solid #d1d5db',borderLeft:'none'}}
                        value={preForm.telefono} onChange={e=>setPreForm(f=>({...f,telefono:e.target.value}))} required />
                    </div>
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label fw-semibold small" style={{color:'#374151'}}>Número de documento</label>
                    <input className="form-control" style={{borderRadius:8,border:'1.5px solid #d1d5db'}}
                      value={preForm.dni} onChange={e=>setPreForm(f=>({...f,dni:e.target.value}))} />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-semibold small" style={{color:'#374151'}}>Curso o programa<span className="text-danger">*</span></label>
                    <select className="form-select" style={{borderRadius:8,border:'1.5px solid #d1d5db'}}
                      value={preForm.course_id} onChange={e=>setPreForm(f=>({...f,course_id:e.target.value}))} required>
                      <option value="">Selecciona un curso/programa</option>
                      <option value="1">Reparación de Celulares</option>
                      <option value="2">Diseño y Armado de Muebles en Melamina</option>
                      <option value="3">Reparación de Computadoras</option>
                      <option value="4">Instalación de Cámaras de Seguridad</option>
                      <option value="5">Inteligencia Artificial</option>
                      <option value="6">Auxiliar en Soporte Informático</option>
                      <option value="7">Instalaciones Eléctricas Residenciales</option>
                      <option value="8">Emprendimiento y Gestión de Negocios</option>
                      <option value="9">Informática (Ofimática, Excel, etc.)</option>
                    </select>
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label fw-semibold small" style={{color:'#374151'}}>Sucursal<span className="text-danger">*</span></label>
                    <select className="form-select" style={{borderRadius:8,border:'1.5px solid #d1d5db'}}
                      value={preForm.sucursal_id} onChange={e=>setPreForm(f=>({...f,sucursal_id:e.target.value}))} required>
                      <option value="">Selecciona una sucursal</option>
                      {sucursales.map(s=>(
                        <option key={s.id} value={s.id}>{s.nombre||s.title||s.titulo}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label fw-semibold small" style={{color:'#374151'}}>Modalidad<span className="text-danger">*</span></label>
                    <select className="form-select" style={{borderRadius:8,border:'1.5px solid #d1d5db'}}
                      value={preForm.modalidad_id} onChange={e=>setPreForm(f=>({...f,modalidad_id:e.target.value}))} required>
                      <option value="">Selecciona una modalidad</option>
                      {modalidades.map(m=>(
                        <option key={m.id} value={m.id}>{m.nombre||m.title||m.titulo}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-12">
                    <button type="submit" className="btn w-100 fw-bold py-2" disabled={preSending}
                      style={{background:'linear-gradient(90deg,#0b37c9,#1a5fd4)',color:'#fff',borderRadius:8,fontSize:'1rem',boxShadow:'0 6px 24px rgba(11,55,201,0.35)',minHeight:48}}>
                      {preSending
                        ? <><span className="spinner-border spinner-border-sm me-2"/>Enviando…</>
                        : 'Solicitar información'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          TICKER
      ═══════════════════════════════════════════ */}
      <div className="overflow-hidden py-3"
        style={{background:'linear-gradient(90deg,#f97316,#ec4899,#8b5cf6,#06b6d4,#10b981,#f97316)',borderTop:'1px solid rgba(255,255,255,0.1)',borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
        <div style={{display:'flex',gap:40,whiteSpace:'nowrap',animation:'ticker 18s linear infinite'}}>
          {Array(6).fill(null).map((_,i)=>(
            <span key={i} className="ticker-span fw-black"
              style={{color:'rgba(255,255,255,0.9)',fontSize:'.82rem',letterSpacing:'.16em'}}>
              ✦ EXCELENCIA TÉCNICA &nbsp;&nbsp; ✦ FORMACIÓN DE CALIDAD &nbsp;&nbsp; ✦ FUTURO PROFESIONAL &nbsp;&nbsp; ✦ LÍDERES EN PERÚ &nbsp;&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          2 ▸ QUIÉNES SOMOS
      ═══════════════════════════════════════════ */}
      <section
        id="quienes-somos"
        className="position-relative overflow-hidden"
        style={{background:'#f5f7ff',padding:'80px 0'}}
      >
        <div className="container position-relative" style={{zIndex:2}}>
          <div className="row align-items-stretch gy-4">

            {/* Bloque azul */}
            <div className="col-12 col-lg-5">
              <div
                className="qs-blue-block h-100 rounded-4 position-relative overflow-hidden d-flex flex-column justify-content-between"
                style={{
                  minHeight:240,
                  background: data?.imagen
                    ? `#0025ce url(${data.imagen}) center/contain no-repeat`
                    : '#0025ce',
                  padding:'36px 32px 28px',
                  color:'#fff',
                  boxShadow:'0 26px 80px rgba(0,0,0,0.45)'
                }}
              >
                <div className="position-relative mt-auto">
                  <div className="qs-anios-num fw-black" style={{fontSize:'3.2rem',color:'#ff6a00',lineHeight:1}}>
                    {data?.anios || 13}
                  </div>
                  <p className="mb-0 mt-2" style={{fontSize:'.88rem',color:'rgba(255,255,255,0.8)'}}>
                    Años transformando vidas en {data?.ciudad || 'Ica'}
                  </p>
                </div>
                <div
                  className="qs-corner-badge position-absolute d-flex flex-column justify-content-center align-items-center text-white fw-bold"
                  style={{bottom:0,right:0,width:120,height:82,background:'#ff6a00',borderTopLeftRadius:18}}
                >
                  <span style={{fontSize:'1rem',lineHeight:1}}>{data?.ciudad || 'Ica'}</span>
                  <small style={{fontSize:'.72rem',opacity:.9}}>Sede Principal</small>
                </div>
              </div>
            </div>

            {/* Contenido */}
            <div className="col-12 col-lg-7">
              <div className="mb-2">
                <span className="fw-bold text-uppercase"
                  style={{fontSize:'.68rem',letterSpacing:'.22em',color:'#0b37c9'}}>
                  QUIÉNES SOMOS
                </span>
              </div>
              <h2 className="fw-black mb-3"
                style={{fontSize:'clamp(1.85rem,4vw,3rem)',lineHeight:1.1,letterSpacing:'-0.03em',color:'#111827'}}>
                {data?.titulo || 'Nacimos para resolver la brecha técnica'}
              </h2>
              <p className="mb-4" style={{fontSize:'1rem',color:'#4b5563',lineHeight:1.8}}>
                {data?.descripcion}
              </p>
              {data?.bullets?.length>0 && (
                <div className="mt-2">
                  {data.bullets.map((b,i)=>(
                    <div key={i} className="d-flex align-items-start gap-3 py-3"
                      style={{borderTop:'1px solid #e5e7eb'}}>
                      <div className="rounded-2 d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{width:26,height:26,background:'#0b37c9',color:'#fff',fontSize:'.8rem',marginTop:2}}>
                        ✓
                      </div>
                      <p className="mb-0" style={{fontSize:'.93rem',color:'#111827',lineHeight:1.6}}>{b}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          3 ▸ MISIÓN / VISIÓN
      ═══════════════════════════════════════════ */}
      <section className="position-relative overflow-hidden"
        style={{background:'#111116',padding:'80px 0'}}>
        <div className="position-absolute rounded-circle d-none d-md-block"
          style={{width:500,height:500,background:'radial-gradient(circle,rgba(139,92,246,0.12) 0%,transparent 70%)',top:'-15%',left:'-8%',pointerEvents:'none'}}/>
        <div className="position-absolute rounded-circle d-none d-md-block"
          style={{width:400,height:400,background:'radial-gradient(circle,rgba(6,182,212,0.1) 0%,transparent 70%)',bottom:'-10%',right:'-5%',pointerEvents:'none'}}/>

        <div className="container position-relative" style={{zIndex:2}}>
          <div className="text-center mb-5">
            <div className="d-flex align-items-center justify-content-center gap-3 mb-3">
              <div style={{width:32,height:3,background:'linear-gradient(90deg,#8b5cf6,#06b6d4)',borderRadius:2}}/>
              <span className="fw-bold text-uppercase" style={{fontSize:'.7rem',letterSpacing:'.18em',color:'#8b5cf6'}}>Filosofía Institucional</span>
              <div style={{width:32,height:3,background:'linear-gradient(90deg,#06b6d4,#8b5cf6)',borderRadius:2}}/>
            </div>
            <h2 className="fw-black" style={{fontSize:'clamp(1.8rem,4vw,3.2rem)',letterSpacing:'-0.025em'}}>
              Misión &amp; Visión
            </h2>
          </div>

          <div className="row g-4">
            {/* Misión */}
            <div className="col-12 col-lg-6">
              <div className="mv-card h-100 rounded-4 p-4 p-lg-5 position-relative overflow-hidden"
                style={{background:'linear-gradient(145deg,rgba(139,92,246,0.15) 0%,rgba(139,92,246,0.05) 100%)',border:'1px solid rgba(139,92,246,0.35)',transition:'box-shadow .3s'}}
                onMouseEnter={e=>e.currentTarget.style.boxShadow='0 0 70px rgba(139,92,246,0.3)'}
                onMouseLeave={e=>e.currentTarget.style.boxShadow='none'}>
                <div className="mv-icon d-inline-flex align-items-center justify-content-center rounded-3 mb-4"
                  style={{width:56,height:56,background:'linear-gradient(135deg,#8b5cf6,#a78bfa)',fontSize:'1.7rem',boxShadow:'0 8px 24px rgba(139,92,246,0.5)'}}>
                  🎯
                </div>
                <div className="fw-bold text-uppercase mb-2" style={{fontSize:'.68rem',letterSpacing:'.2em',color:'#a78bfa'}}>Misión</div>
                <h3 className="fw-black mb-4" style={{fontSize:'1.5rem',letterSpacing:'-0.02em'}}>Nuestra Misión</h3>
                <p className="mb-0 fst-italic lh-lg" style={{color:'rgba(255,255,255,0.65)',fontSize:'.97rem'}}>"{data?.mision}"</p>
                <div className="position-absolute bottom-0 start-0 w-100" style={{height:3,background:'linear-gradient(90deg,#8b5cf6,transparent)'}}/>
              </div>
            </div>

            {/* Visión */}
            <div className="col-12 col-lg-6">
              <div className="mv-card h-100 rounded-4 p-4 p-lg-5 position-relative overflow-hidden"
                style={{background:'linear-gradient(145deg,rgba(6,182,212,0.12) 0%,rgba(6,182,212,0.04) 100%)',border:'1px solid rgba(6,182,212,0.35)',transition:'box-shadow .3s'}}
                onMouseEnter={e=>e.currentTarget.style.boxShadow='0 0 70px rgba(6,182,212,0.25)'}
                onMouseLeave={e=>e.currentTarget.style.boxShadow='none'}>
                <div className="mv-icon d-inline-flex align-items-center justify-content-center rounded-3 mb-4"
                  style={{width:56,height:56,background:'linear-gradient(135deg,#06b6d4,#22d3ee)',fontSize:'1.7rem',boxShadow:'0 8px 24px rgba(6,182,212,0.5)'}}>
                  🔭
                </div>
                <div className="fw-bold text-uppercase mb-2" style={{fontSize:'.68rem',letterSpacing:'.2em',color:'#22d3ee'}}>Visión</div>
                <h3 className="fw-black mb-4" style={{fontSize:'1.5rem',letterSpacing:'-0.02em'}}>Nuestra Visión</h3>
                <p className="mb-0 fst-italic lh-lg" style={{color:'rgba(255,255,255,0.65)',fontSize:'.97rem'}}>"{data?.vision}"</p>
                <div className="position-absolute bottom-0 start-0 w-100" style={{height:3,background:'linear-gradient(90deg,#06b6d4,transparent)'}}/>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          4 ▸ VALORES
      ═══════════════════════════════════════════ */}
      {valores.length>0&&(
        <section className="position-relative overflow-hidden"
          style={{background:'#f8f7f5',padding:'80px 0',color:'#111'}}>
          <div className="position-absolute rounded-circle d-none d-md-block"
            style={{width:350,height:350,background:'radial-gradient(circle,rgba(236,72,153,0.08) 0%,transparent 70%)',top:'-5%',right:'5%',pointerEvents:'none'}}/>
          <div className="position-absolute rounded-circle d-none d-md-block"
            style={{width:300,height:300,background:'radial-gradient(circle,rgba(16,185,129,0.08) 0%,transparent 70%)',bottom:'0',left:'8%',pointerEvents:'none'}}/>

          <div className="container position-relative" style={{zIndex:2}}>
            <div className="text-center mb-5">
              <div className="d-flex align-items-center justify-content-center gap-3 mb-3">
                <div style={{width:30,height:3,background:'linear-gradient(90deg,#ec4899,#f97316)',borderRadius:2}}/>
                <span className="fw-bold text-uppercase" style={{fontSize:'.7rem',letterSpacing:'.18em',color:'#ec4899'}}>Principios</span>
                <div style={{width:30,height:3,background:'linear-gradient(90deg,#f97316,#ec4899)',borderRadius:2}}/>
              </div>
              <h2 className="fw-black mb-3" style={{fontSize:'clamp(1.8rem,4vw,3.2rem)',letterSpacing:'-0.025em',color:'#111'}}>
                Nuestros Valores
              </h2>
              <p className="mx-auto" style={{color:'#777',maxWidth:480,fontSize:'.97rem'}}>
                Los pilares fundamentales que guían cada acción dentro de nuestra institución.
              </p>
            </div>

            <div className="row g-3 g-md-4">
              {valores.map((v,i)=>{
                const vc=valorColors[i%valorColors.length]
                return(
                  <div className="col-12 col-sm-6 col-lg-4" key={i}>
                    <div
                      className="valor-card h-100 rounded-4 p-3 p-md-4 bg-white"
                      style={{border:'1px solid #eee',boxShadow:'0 4px 20px rgba(0,0,0,0.05)',transition:'all .25s',cursor:'default'}}
                      onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-8px)';e.currentTarget.style.boxShadow=`0 20px 50px ${vc.shadow}`;e.currentTarget.style.borderColor=`${vc.shadow}`}}
                      onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 4px 20px rgba(0,0,0,0.05)';e.currentTarget.style.borderColor='#eee'}}
                    >
                      <div className="d-flex align-items-center gap-3 mb-3">
                        <div
                          className="valor-icon rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                          style={{width:48,height:48,background:vc.bg,fontSize:'1.3rem',boxShadow:`0 6px 20px ${vc.shadow}`}}
                        >
                          {emojis[i%emojis.length]}
                        </div>
                        <h6 className="fw-black mb-0" style={{fontSize:'.95rem',letterSpacing:'-0.01em',color:'#111',lineHeight:1.3}}>
                          {v.title||v}
                        </h6>
                      </div>
                      {v.desc&&(
                        <p className="mb-0" style={{fontSize:'.88rem',color:'#777',lineHeight:1.65}}>{v.desc}</p>
                      )}
                      <div className="rounded-pill mt-3" style={{height:3,width:36,background:vc.bg}}/>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════
          4.5 ▸ Nuestras Actividades
      ═══════════════════════════════════════════ */}
    
          {/* Título removido por solicitud */}
          <NuestrosBlogsSection />

    

      {/* ═══════════════════════════════════════════
          5 ▸ FAQ
      ═══════════════════════════════════════════ */}
      <section className="py-5" style={{background:'#f5f7ff'}}>
        <div className="container">
          <h2 className="faq-title fw-bold mb-4 text-center"
            style={{color:'#0b37c9',fontSize:'clamp(1.5rem,4vw,2rem)'}}>
            Preguntas frecuentes
          </h2>
            <div className="accordion" id="faqAccordion" style={{maxWidth:760,margin:'0 auto'}}>
            {[
              {q:'¿Se cobra por el cambio de hora y especialidad?',a:'No, no se cobra la primera vez que realices un cambio de hora o especialidad.'},
              {q:'¿Se atiende todos los días?',a:'Sí, la atención es de lunes a domingo, de 8:00 a 21:30 horas.'},
              {q:'¿Los precios varían?',a:'No, los precios no varían. Si te matriculaste con una promoción, se mantiene el precio hasta finalizar tus estudios.'},
              {q:'¿Cuántas faltas se permiten?',a:'Se permite hasta el 30% de inasistencias.'},
              {q:'¿Se puede retomar mis estudios?',a:'Sí, puedes retomar tus estudios si no han pasado más de 6 meses desde que dejaste de estudiar. Si ha pasado más tiempo, puedes conversar con el área de secretaría.'}
            ].map((item,i)=>(
              <div className="accordion-item mb-2" key={i}
                style={{border:'1px solid #e5e7eb',borderRadius:10,overflow:'hidden'}}>
                <h2 className="accordion-header" id={`faqHeading${i}`}>
                  <button
                    className="accordion-button collapsed fw-semibold"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#faqCollapse${i}`}
                    aria-expanded="false"
                    aria-controls={`faqCollapse${i}`}
                    style={{background:'#fff',color:'#0b37c9',fontSize:'1rem',lineHeight:1.4}}
                  >
                    {item.q}
                  </button>
                </h2>
                <div id={`faqCollapse${i}`} className="accordion-collapse collapse"
                  aria-labelledby={`faqHeading${i}`} data-bs-parent="#faqAccordion">
                  <div className="accordion-body" style={{background:'#fff',color:'#333',fontSize:'.95rem',lineHeight:1.7}}>
                    {item.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          6 ▸ CTA FINAL
      ═══════════════════════════════════════════ */}
      <section
        className="cta-section text-center text-white position-relative overflow-hidden"
        style={{background:'linear-gradient(135deg,#0f0f14 0%,#1a0a2e 40%,#0a1a1f 100%)',padding:'100px 20px'}}
      >
        <div className="position-absolute rounded-circle d-none d-md-block"
          style={{width:500,height:500,background:'radial-gradient(circle,rgba(249,115,22,0.15) 0%,transparent 70%)',top:'-20%',left:'-10%',pointerEvents:'none'}}/>
        <div className="position-absolute rounded-circle d-none d-md-block"
          style={{width:500,height:500,background:'radial-gradient(circle,rgba(139,92,246,0.15) 0%,transparent 70%)',bottom:'-20%',right:'-10%',pointerEvents:'none'}}/>
        <div className="position-absolute rounded-circle d-none d-lg-block"
          style={{width:350,height:350,background:'radial-gradient(circle,rgba(6,182,212,0.1) 0%,transparent 70%)',top:'20%',right:'15%',pointerEvents:'none'}}/>

        <div className="position-relative" style={{zIndex:2,maxWidth:680,margin:'0 auto'}}>
          <span className="badge rounded-pill fw-bold px-4 py-2 mb-4 d-inline-block"
            style={{background:'rgba(255,255,255,0.06)',color:'rgba(255,255,255,0.8)',border:'1px solid rgba(255,255,255,0.12)',fontSize:'.75rem',letterSpacing:'.13em'}}>
            ✦ EMPIEZA TU FUTURO HOY
          </span>
          <h2 className="fw-black mb-4"
            style={{fontSize:'clamp(1.9rem,5vw,3.8rem)',lineHeight:1.1,letterSpacing:'-0.03em'}}>
            ¿Listo para construir tu{' '}
            <span style={{background:'linear-gradient(90deg,#f97316,#ec4899,#8b5cf6)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>
              futuro técnico?
            </span>
          </h2>
          <p className="fw-light mb-5"
            style={{fontSize:'1.05rem',color:'rgba(255,255,255,0.45)',lineHeight:1.9}}>
            Únete a los miles de profesionales que confiaron en Escuelas Técnicas del Perú.
          </p>
          <a href="/programas"
            className="cta-btn btn btn-lg fwS-bold rounded-pill px-5 py-3 d-inline-block"
            style={{background:'linear-gradient(90deg,#f97316,#ec4899,#8b5cf6)',color:'#fff',border:'none',letterSpacing:'.04em',fontSize:'1.05rem',boxShadow:'0 8px 40px rgba(249,115,22,0.35)',transition:'all .2s'}}
            onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 16px 60px rgba(249,115,22,0.55)'}}
            onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 8px 40px rgba(249,115,22,0.35)'}}>
            Ver Nuestras Carreras→
          </a>
        </div>
      </section>

    </div>
  )
}