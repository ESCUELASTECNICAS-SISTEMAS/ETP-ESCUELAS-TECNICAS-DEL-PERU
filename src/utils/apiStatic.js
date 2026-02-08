const BASE_API = import.meta.env.VITE_API_BASE || 'https://servidorpaginaetp-production.up.railway.app'

export const endpoints = {
  LOGIN: `${BASE_API}/auth/login`,
  CAROUSEL: `${BASE_API}/carousel-slides`,
  MEDIA: `${BASE_API}/media`,
  COURSES: `${BASE_API}/courses`
}

export default { endpoints }
