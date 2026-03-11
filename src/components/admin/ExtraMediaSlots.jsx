import React from 'react'
import MediaSelector from './MediaSelectors'

// Props:
// - extraMedia: array of media ids
// - mediaList, loadingMedia
// - onSet(index, id), onRemove(index)
// - findMediaById (function)
export default function ExtraMediaSlots({ extraMedia = [], mediaList = [], loadingMedia = false, onSet = () => {}, onRemove = () => {}, findMediaById = () => {}, thumbnailSize = 96, popupWidth = 420 }){
  return (
    <div>
      <div className="d-flex align-items-start gap-2">
        {[0,1,2].map(i => (
          <div key={i} style={{position:'relative',width:140}}>
            <MediaSelector thumbnailSize={thumbnailSize} popupWidth={popupWidth} mediaList={mediaList} loading={loadingMedia} selectedId={(Array.isArray(extraMedia) && extraMedia[i]) ? extraMedia[i] : undefined} onSelect={id=>onSet(i, id)} label={`extra ${i+1}`} />
            {(Array.isArray(extraMedia) && extraMedia[i]) ? (
              <div className="d-flex align-items-center gap-2 mt-2">
                <div className="small text-truncate" style={{flex:1}}>{(findMediaById(extraMedia[i])||{}).alt_text || `ID ${extraMedia[i]}`}</div>
                <button type="button" className="btn btn-sm btn-outline-danger" onClick={()=>onRemove(i)} title="Quitar">✕</button>
              </div>
            ) : (
              <div className="mt-2 small text-muted">--</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
