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

export function getAdminToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function clearAdminToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export async function adminLogin(username, password) {
  const result = await json(await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  }))
  localStorage.setItem(TOKEN_KEY, result.token)
  return result
}

function authHeaders() {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${getAdminToken()}` }
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
