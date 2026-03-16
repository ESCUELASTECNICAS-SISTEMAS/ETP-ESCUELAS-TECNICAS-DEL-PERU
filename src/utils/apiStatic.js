const BASE_API = import.meta.env.VITE_API_BASE || 'https://servidorpaginaetp-production.up.railway.app'

export const endpoints = {
  LOGIN: `${BASE_API}/auth/login`,
  REGISTER: `${BASE_API}/auth/register`,
  SUCURSALES: `${BASE_API}/sucursales`,
  CAROUSEL: `${BASE_API}/carousel-slides`,
  MEDIA: `${BASE_API}/media`,
  COURSES: `${BASE_API}/courses`,
  DOCENTES: `${BASE_API}/docentes`,
  NOSOTROS: `${BASE_API}/nosotros`,
  CONVENIOS_FOR_COURSE: (courseId) => `${BASE_API}/courses/${courseId}/convenios`,
  COURSE_DOCENTES: (courseId) => `${BASE_API}/courses/${courseId}/docentes`
  ,COURSE_SUCURSALES: (courseId) => `${BASE_API}/courses/${courseId}/sucursales`
  ,COURSE_SCHEDULES: (courseId) => `${BASE_API}/courses/${courseId}/schedules`
  ,COURSE_SEMINARIOS: (courseId) => `${BASE_API}/courses/${courseId}/seminarios`
  ,NEWS: `${BASE_API}/noticias`
  ,SOCIAL_LINKS: `${BASE_API}/social-links`
  ,VISITS: `${BASE_API}/visits`
  ,VISIT_STATS: `${BASE_API}/visits/stats`
    ,TIPS: `${BASE_API}/tips`
    ,PRE_INSCRIPCIONES: `${BASE_API}/pre-inscripciones`
    ,MODALIDADES: `${BASE_API}/modalidades`
}


export default { endpoints }
