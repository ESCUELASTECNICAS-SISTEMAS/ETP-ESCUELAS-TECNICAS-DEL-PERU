import React from 'react'
import HeroCarousel from '../components/home/HeroCarousel'
import Highlights from '../components/home/Highlights'
import Carreras from '../components/sections/carreras'
import Talleres from '../components/sections/talleres'
import Informatica from '../components/sections/informatica'
import Especiales from '../components/sections/especiales'
import CursosGenerales from '../components/sections/cursosgenerales'

export default function HomePage(){
  return (
    <div>
      <HeroCarousel />
      <Highlights />
      <Carreras />
      <Talleres />
      <Informatica />
          <Especiales />
      <CursosGenerales />
    </div>
  )
}
