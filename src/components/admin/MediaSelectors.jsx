import React from 'react'
import MediaPicker from './MediaPicker'

// Small wrapper to standardize selector props and provide a single
// place to extend selector behavior in the future.
export function MediaSelector({ thumbnailSize = 96, popupWidth = 420, ...props }){
  return <MediaPicker thumbnailSize={thumbnailSize} popupWidth={popupWidth} {...props} />
}

export default MediaSelector
