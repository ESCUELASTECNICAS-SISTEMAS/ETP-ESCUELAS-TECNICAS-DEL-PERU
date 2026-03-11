import React, { useEffect, useRef, useState } from 'react'

// Props: mediaList (array), loading (bool), selectedId, onSelect(id), label
export default function MediaPicker({ mediaList = [], loading = false, selectedId, onSelect = () => {}, label = 'Seleccionar media', thumbnailSize = 72, popupWidth = 360 }){
  const [open, setOpen] = useState(false)
  const [showInactive, setShowInactive] = useState(false)
  const ref = useRef(null)

  useEffect(()=>{
    if(!open) return
    const onDoc = (e) => { if(ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const selected = (mediaList || []).find(m => String(m.id) === String(selectedId))

  return (
    <div ref={ref} style={{position:'relative'}}>
      <button type="button" className="form-select d-flex align-items-center justify-content-between" onClick={()=>setOpen(v=>!v)} style={{padding:'6px 8px',gap:8}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:thumbnailSize,height:thumbnailSize,overflow:'hidden',borderRadius:6,background:'#f6f6f6',flex:'0 0 auto'}}>
            {selected ? (
              <img src={selected.url} alt={selected.alt_text||''} style={{width:'100%',height:'100%',objectFit:'cover'}} />
            ) : (
              <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',color:'#999',fontSize:12}}>--</div>
            )}
          </div>
          <div style={{minWidth:120}}>{selected ? (selected.alt_text || `ID ${selected.id}`) : `-- ${label} --`}</div>
        </div>
        <span className="text-muted">▾</span>
      </button>

      {open && (
        <div style={{position:'absolute',zIndex:110,top:'48px',left:0,width:popupWidth,maxHeight:420,overflowY:'auto',border:'1px solid #e9ecef',background:'#fff',padding:10,borderRadius:6,boxShadow:'0 6px 22px rgba(0,0,0,0.12)'}}>
          <div className="d-flex align-items-center justify-content-between mb-2">
            <small className="text-muted">Medias</small>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" id={`showInactive-${label}`} checked={showInactive} onChange={e=>setShowInactive(e.target.checked)} />
                <label className="form-check-label small text-muted" htmlFor={`showInactive-${label}`}>Mostrar desactivados</label>
              </div>
              {selected && (
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={()=>{ onSelect(undefined); setOpen(false) }}>Limpiar</button>
              )}
            </div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:`repeat(auto-fill, minmax(${thumbnailSize}px, 1fr))`,gap:8}}>
            {loading && <div className="col-12 text-center text-muted">Cargando medias...</div>}
            {!loading && (mediaList || []).filter(m=> (showInactive ? true : m.active)).length === 0 && <div className="text-muted">No hay medias.</div>}
            {(mediaList || []).filter(m=> (showInactive ? true : m.active)).map(m => {
              const isSel = String(m.id) === String(selectedId)
              return (
                <button key={m.id} type="button" className="btn p-0 border-0" style={{width:'100%',textAlign:'left',display:'block'}} onClick={()=>{ onSelect(m.id); setOpen(false) }}>
                  <div style={{width:'100%',height:thumbnailSize,overflow:'hidden',borderRadius:8,boxShadow:isSel ? '0 0 0 3px rgba(0,123,255,0.12)' : 'none',border:isSel ? '2px solid rgba(0,123,255,0.14)' : '1px solid rgba(0,0,0,0.06)'}}>
                    <img src={m.url} alt={m.alt_text||''} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} />
                  </div>
                  <div className="small text-truncate mt-1">{m.alt_text || `ID ${m.id}`}{m.active === false ? ' (desactivado)' : ''}</div>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
