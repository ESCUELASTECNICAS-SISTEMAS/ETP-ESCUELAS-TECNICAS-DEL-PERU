import React from 'react'

export default function Notification({ message, type = 'danger' }){
  if(!message) return null
  return (
    <div className={`alert alert-${type}`} role="alert">
      {message}
    </div>
  )
}
