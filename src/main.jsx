import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import './index.css'
import App from './App.jsx'

// Suppress React Router future flag warnings by filtering console.warn
const _origWarn = console.warn.bind(console)
console.warn = (...args) => {
  try {
    const msg = String(args[0] || '')
    if (msg.includes('React Router Future Flag Warning')) return
  } catch (e) {}
  return _origWarn(...args)
}

const rr = await import('react-router-dom')
const { createBrowserRouter, RouterProvider } = rr

const router = createBrowserRouter([
  { path: '/*', element: <App /> }
], {
  future: { v7_startTransition: true, v7_relativeSplatPath: true }
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
