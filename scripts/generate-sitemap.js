import fs from 'fs'
import path from 'path'
import axios from 'axios'

// NOTE: we do NOT import src/utils/apiStatic.js here because that file
// uses `import.meta.env` (Vite) which is undefined when running under
// plain Node during `postbuild`. Instead read env vars directly and
// provide a sensible fallback.
const BASE_API = process.env.VITE_API_BASE || process.env.API_BASE || 'https://servidorpaginaetp-production.up.railway.app'
// Default to the Railway deployment domain you provided so generated
// sitemap/robots point to the correct production URLs.
const SITE_ROOT = process.env.SITE_ROOT || 'https://etp-escuelas-tecnicas-del-peru-production.up.railway.app'

const apiEndpoints = {
  COURSES: `${BASE_API}/courses`,
  NEWS: `${BASE_API}/noticias`
}

const outPath = (name) => path.resolve(process.cwd(), name)

const fmtDate = (d) => {
  if (!d) return new Date().toISOString()
  try { return new Date(d).toISOString() } catch(e) { return new Date().toISOString() }
}

const write = (file, content) => fs.writeFileSync(outPath(file), content, { encoding: 'utf8' })

const buildUrlEntry = (loc, lastmod = null, changefreq = 'weekly', priority = '0.6') => {
  return `  <url>\n    <loc>${loc}</loc>\n${lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : ''}    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`
}

const run = async () => {
  const urls = new Set()

  // static routes
  const staticRoutes = ['/', '/galeria', '/contacto', '/cursos', '/noticias', '/programas', '/carreras', '/talleres', '/cursos-informatica', '/cinco-meses']
  staticRoutes.forEach(r => urls.add({ loc: SITE_ROOT + r, lastmod: null, priority: '0.5' }))

  try {
    // fetch courses
    const res = await axios.get(apiEndpoints.COURSES)
    const courses = Array.isArray(res.data) ? res.data : []
    for (const c of courses) {
      const rawSlug = c.slug || c.id || (c.title && String(c.title).toLowerCase().replace(/\s+/g,'-'))
      const slug = rawSlug ? String(rawSlug).trim() : ''
      const typeVal = String(c.tipo || c.type || '').toLowerCase()
      const isPrograma = typeVal.includes('program') || typeVal.includes('programa')
      const pathSegment = isPrograma ? '/programa/' : '/curso/'
      const loc = `${SITE_ROOT}${pathSegment}${encodeURIComponent(slug)}`
      urls.add({ loc, lastmod: fmtDate(c.updated_at || c.updatedAt || c.published_at || c.publishedAt), priority: '0.8' })
    }
  } catch (e) {
    console.warn('Could not fetch courses for sitemap:', e.message || e)
  }

  try {
    // fetch noticias
    const r2 = await axios.get(apiEndpoints.NEWS)
    const news = Array.isArray(r2.data) ? r2.data : []
    for (const n of news) {
      const slug = n.slug || n.id || (n.title && encodeURIComponent(String(n.title).toLowerCase().replace(/\s+/g,'-')))
      const loc = `${SITE_ROOT}/noticia/${slug}`
      urls.add({ loc, lastmod: fmtDate(n.updated_at || n.updatedAt || n.published_at || n.publishedAt), priority: '0.6' })
    }
  } catch (e) {
    console.warn('Could not fetch noticias for sitemap:', e.message || e)
  }

  // ensure dist directory exists
  fs.mkdirSync(outPath('dist'), { recursive: true })

  // build xml
  const header = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
  const footer = '\n</urlset>\n'
  const body = Array.from(urls).map(u => buildUrlEntry(u.loc, u.lastmod, 'weekly', u.priority)).join('\n')
  const xml = header + body + footer
  write('dist/sitemap.xml', xml)
  console.log('Wrote dist/sitemap.xml with', Array.from(urls).length, 'entries')

  const robots = `User-agent: *\nAllow: /\nSitemap: ${SITE_ROOT}/sitemap.xml\n`;
  write('dist/robots.txt', robots)
  console.log('Wrote dist/robots.txt')
}

run().catch(err => { console.error(err); process.exit(1) })
