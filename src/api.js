// Thin client for the quote/admin server (server/index.js, proxied at /api).
// Every call degrades gracefully — the configurator must keep working with
// default pricing when the server isn't running.

async function json(res) {
  const payload = await res.json().catch(() => null)
  if (!res.ok) throw new Error(payload?.error ?? `API ${res.status}`)
  return payload
}

/** Live rate card, or null if the server is unreachable. */
export async function fetchRateCard() {
  try {
    return await json(await fetch('/api/rate-card'))
  } catch {
    return null
  }
}

/** Public feature flags (e.g. photo autobuild). Fails closed (all false) if unreachable. */
export async function fetchFeatures() {
  try {
    return await json(await fetch('/api/features'))
  } catch {
    return { autobuildEnabled: false }
  }
}

/** Analyze a customer's reference photo (base64 data URL) into a piece config. */
export async function analyzePiecePhoto(imageDataUrl) {
  return json(await fetch('/api/vision/analyze-piece', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: imageDataUrl }),
  }))
}

/** Submit a customer quote request. Throws if the server is unreachable. */
export async function submitOrder(order) {
  return json(await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  }))
}

// ── Admin (token-authenticated) ──────────────────────────────────────────────

const TOKEN_KEY = 'admin_token'
const LANGUAGE_KEY = 'admin_language'

export function getAdminLanguage() {
  return localStorage.getItem(LANGUAGE_KEY) || 'en'
}

export function setAdminLanguage(language) {
  localStorage.setItem(LANGUAGE_KEY, language === 'zh' ? 'zh' : 'en')
}

export function getAdminToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function clearAdminToken() {
  localStorage.removeItem(TOKEN_KEY)
}

function languageHeaders() {
  const language = getAdminLanguage()
  return { 'Accept-Language': language, 'X-Language': language }
}

export async function adminLogin(username, password) {
  const result = await json(await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...languageHeaders() },
    body: JSON.stringify({ username, password }),
  }))
  localStorage.setItem(TOKEN_KEY, result.token)
  return result
}

function authHeaders() {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${getAdminToken()}`, ...languageHeaders() }
}

export async function fetchOrders() {
  return json(await fetch('/api/orders', { headers: authHeaders() }))
}

export async function fetchAdminSession() {
  return json(await fetch('/api/admin/session', { headers: authHeaders() }))
}

export async function fetchOrder(id) {
  return json(await fetch(`/api/orders/${id}`, { headers: authHeaders() }))
}

export async function updateOrder(id, updates) {
  return json(await fetch(`/api/orders/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(updates),
  }))
}

export async function saveRateCard(rateCard) {
  return json(await fetch('/api/rate-card', {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(rateCard),
  }))
}

export async function saveFeatures(features) {
  return json(await fetch('/api/features', {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(features),
  }))
}

export async function changeAdminPassword(password) {
  return json(await fetch('/api/admin/password', {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ password }),
  }))
}

export async function fetchUsers() {
  return json(await fetch('/api/admin/users', { headers: authHeaders() }))
}

export async function createUser(user) {
  return json(await fetch('/api/admin/users', {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(user),
  }))
}

export async function updateUser(id, updates) {
  return json(await fetch(`/api/admin/users/${id}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(updates),
  }))
}
