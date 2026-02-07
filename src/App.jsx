import React from 'react'
import './index.css'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import HomePage from './pages/HomePage'
import CursosPage from './pages/CursosPage'
import CourseDetail from './pages/CourseDetail'
import { Routes, Route } from 'react-router-dom'

export default function App(){
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/cursos" element={<CursosPage />} />
          <Route path="/curso/:id" element={<CourseDetail />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}
