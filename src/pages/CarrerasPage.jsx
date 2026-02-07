import React from 'react'
import carreras from '../data/carreras.json'
import CourseCard from '../components/UI/CourseCard'

export default function CarrerasPage(){
	return (
		<div className="section-padding">
			<div className="container">
				<h2 className="mb-4">Programas</h2>
				<div className="row g-4">
					{carreras.map((c,i) => (
						<div className="col-12 col-md-4" key={i}>
							<CourseCard item={{...c, tipo: 'Programa', titulo: c.titulo || c.categoria}} />
						</div>
					))}
				</div>
			</div>
		</div>
	)
}

