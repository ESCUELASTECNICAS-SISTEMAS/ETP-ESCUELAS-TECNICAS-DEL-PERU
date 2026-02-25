import React from 'react'
import HeroCarousel from '../components/home/HeroCarousel'
import Highlights from '../components/home/Highlights'
import Carreras from '../components/sections/Carreras'
import CincoMeses from '../components/sections/CincoMeses'
import Talleres from '../components/sections/talleres'
import Informatica from '../components/sections/informatica'

export default function HomePage(){
  return (
    <div className="home-page">
      <HeroCarousel />
      <Highlights />
      <Carreras />
      <CincoMeses />
      <Talleres />
      <Informatica />
    </div>
  )
}
