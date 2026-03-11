import { endpoints } from './apiStatic'

/**
 * Sends a page visit to the backend.
 * Deduplicates within the same session: won't re-send the same path twice
 * unless the user navigates away and comes back.
 *
 * @param {{ path: string, course_id?: number, sucursal_id?: number, referrer?: string }} opts
 */
export async function sendVisit({ path, course_id, sucursal_id, referrer } = {}) {
  if (!path) return

  // De-duplicate: skip if this exact path was already sent during this session
  const sessionKey = 'etp_visited_paths'
  let visited = []
  try { visited = JSON.parse(sessionStorage.getItem(sessionKey) || '[]') } catch { visited = [] }
  if (visited.includes(path)) return
  visited.push(path)
  sessionStorage.setItem(sessionKey, JSON.stringify(visited))

  const body = { path }
  if (course_id != null)   body.course_id   = course_id
  if (sucursal_id != null) body.sucursal_id = sucursal_id
  if (referrer)            body.referrer    = referrer

  try {
    await fetch(endpoints.VISITS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      // Fire-and-forget: no need to wait for a response
      keepalive: true,
    })
  } catch (err) {
    // Silently ignore — visit tracking should never break the app
    console.debug('[visits] sendVisit failed silently', err)
  }
}
