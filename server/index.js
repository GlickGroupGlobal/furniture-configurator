import express from 'express'
import crypto from 'node:crypto'
import { Buffer } from 'node:buffer'
import process from 'node:process'
import { read, write } from './store.js'
import { PIECE_DEFS, DEFAULT_DOOR_PROFILE } from '../src/constants.js'
import { DEFAULT_RATE_CARD } from '../src/pricing.js'

const PORT = Number(process.env.PORT) || 3001
const IS_PRODUCTION = process.env.NODE_ENV === 'production'
const SESSION_TTL_MS = 12 * 60 * 60 * 1000
const SESSION_SECRET = process.env.SESSION_SECRET || (IS_PRODUCTION ? null : crypto.randomBytes(32).toString('hex'))

if (!SESSION_SECRET) {
  throw new Error('SESSION_SECRET is required when NODE_ENV=production')
}

const app = express()
app.disable('x-powered-by')
app.use(express.json({ limit: '1mb' }))
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Referrer-Policy', 'same-origin')
  res.setHeader('Cache-Control', 'no-store')
  next()
})

export const ORDER_STATUSES = [
  'new', 'reviewing', 'quoted', 'confirmed', 'in_production', 'shipped', 'delivered', 'cancelled',
]

export const USER_ROLES = ['owner', 'admin', 'sales', 'production', 'viewer']

const ROLE_PERMISSIONS = {
  owner: {
    readOrders: true, editOrders: true, editPricing: true, manageUsers: true, changeOwnPassword: true,
  },
  admin: {
    readOrders: true, editOrders: true, editPricing: true, manageUsers: true, changeOwnPassword: true,
  },
  sales: {
    readOrders: true, editOrders: true, editPricing: false, manageUsers: false, changeOwnPassword: true,
  },
  production: {
    readOrders: true, editOrders: true, editPricing: false, manageUsers: false, changeOwnPassword: true,
  },
  viewer: {
    readOrders: true, editOrders: false, editPricing: false, manageUsers: false, changeOwnPassword: true,
  },
}

const loginAttempts = new Map()

function badRequest(message) {
  const err = new Error(message)
  err.status = 400
  return err
}

function asCleanString(value, maxLength, { required = false } = {}) {
  const text = value == null ? '' : String(value).trim()
  if (required && !text) throw badRequest('Missing required field')
  return text.slice(0, maxLength)
}

function asNumber(value, fallback, min, max) {
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.min(max, Math.max(min, n))
}

function asMoney(value, fallback = 0, max = 1_000_000) {
  return Number(asNumber(value, fallback, 0, max).toFixed(2))
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function base64url(input) {
  return Buffer.from(input).toString('base64url')
}

function signPayload(payload) {
  return crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url')
}

function createSessionToken(user) {
  const payload = base64url(JSON.stringify({
    sub: user.id,
    username: user.username,
    role: user.role,
    exp: Date.now() + SESSION_TTL_MS,
  }))
  return `${payload}.${signPayload(payload)}`
}

function verifySessionToken(token) {
  const [payload, signature] = String(token ?? '').split('.')
  if (!payload || !signature) return false
  const expected = signPayload(payload)
  const a = Buffer.from(signature)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    if (!parsed.sub || Number(parsed.exp) <= Date.now()) return false
    return parsed
  } catch {
    return false
  }
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex'), iterations = 210000) {
  const hash = crypto.pbkdf2Sync(password, salt, iterations, 32, 'sha256').toString('hex')
  return `pbkdf2_sha256$${iterations}$${salt}$${hash}`
}

function verifyPasswordHash(password, stored) {
  const [scheme, iterationsRaw, salt, hash] = String(stored ?? '').split('$')
  if (scheme !== 'pbkdf2_sha256' || !salt || !hash) return false
  const candidate = hashPassword(password, salt, Number(iterationsRaw)).split('$').at(-1)
  const a = Buffer.from(candidate, 'hex')
  const b = Buffer.from(hash, 'hex')
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

function normalizeUsername(username) {
  return String(username ?? '').trim().toLowerCase()
}

function publicUser(user) {
  if (!user) return null
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    active: user.active !== false,
    mustChangePassword: Boolean(user.mustChangePassword),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

function permissionsForRole(role) {
  return ROLE_PERMISSIONS[role] ?? ROLE_PERMISSIONS.viewer
}

function ensureUserAccounts() {
  const db = read()
  if (db.admin.users?.length > 0) return db.admin.users

  const passwordHash = db.admin.passwordHash ?? (db.admin.password ? hashPassword(db.admin.password) : null)
  const mustChangePassword = db.admin.mustChangePassword || db.admin.password === 'changeme'
  const owner = {
    id: crypto.randomUUID(),
    username: 'admin',
    name: 'Owner',
    role: 'owner',
    passwordHash,
    active: true,
    mustChangePassword,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  if (passwordHash) {
    write(nextDb => {
      nextDb.admin.users = [owner]
      nextDb.admin.mustChangePassword = mustChangePassword
      delete nextDb.admin.password
      delete nextDb.admin.passwordHash
    })
    return [owner]
  }
  return []
}

function findUserByUsername(username) {
  const clean = normalizeUsername(username || 'admin')
  return ensureUserAccounts().find(user => user.username === clean && user.active !== false)
}

function findUserById(id) {
  return ensureUserAccounts().find(user => user.id === id && user.active !== false)
}

function verifyUserPassword(username, password) {
  const envPassword = process.env.ADMIN_PASSWORD
  if (envPassword && normalizeUsername(username || 'admin') === 'admin' && password === envPassword) {
    return {
      id: 'env-admin',
      username: 'admin',
      name: 'Environment Admin',
      role: 'owner',
      active: true,
      mustChangePassword: false,
    }
  }

  const user = findUserByUsername(username)
  if (!user?.passwordHash || !verifyPasswordHash(password, user.passwordHash)) return null
  return user
}

function defaultPasswordInUse(user = null) {
  if (process.env.ADMIN_PASSWORD) return false
  if (user) return Boolean(user.mustChangePassword)
  return ensureUserAccounts().some(account => account.mustChangePassword)
}

function recordLoginFailure(ip) {
  const current = loginAttempts.get(ip) ?? { count: 0, lockedUntil: 0 }
  const count = current.count + 1
  const lockedUntil = count >= 6 ? Date.now() + 10 * 60 * 1000 : 0
  loginAttempts.set(ip, { count, lockedUntil })
}

function canAttemptLogin(ip) {
  const current = loginAttempts.get(ip)
  return !current?.lockedUntil || current.lockedUntil < Date.now()
}

function requireAdmin(req, res, next) {
  const token = (req.headers.authorization ?? '').replace(/^Bearer /, '')
  const session = verifySessionToken(token)
  if (!session) return res.status(401).json({ error: 'Not authenticated' })
  const user = session.sub === 'env-admin' ? {
    id: 'env-admin',
    username: 'admin',
    name: 'Environment Admin',
    role: 'owner',
    active: true,
    mustChangePassword: false,
  } : findUserById(session.sub)
  if (!user) return res.status(401).json({ error: 'Not authenticated' })
  req.user = user
  req.permissions = permissionsForRole(user.role)
  next()
}

function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.permissions?.[permission]) return res.status(403).json({ error: 'Not authorized' })
    next()
  }
}

function sanitizeRoom(room) {
  return {
    width: asNumber(room?.width, 12, 6, 40),
    length: asNumber(room?.length, 14, 6, 60),
    height: asNumber(room?.height, 9, 7, 14),
  }
}

function sanitizeMaterialKey(value, fallback = 'particle_board') {
  const text = String(value ?? fallback)
  return /^[a-z0-9_-]{1,60}$/i.test(text) ? text : fallback
}

function sanitizeFinishCode(value, fallback = '') {
  const text = String(value ?? fallback)
  return /^[a-z0-9#_. -]{0,80}$/i.test(text) ? text : fallback
}

function sanitizePiece(piece, index) {
  const def = PIECE_DEFS[piece?.type]
  if (!def) throw badRequest(`Invalid piece type at position ${index + 1}`)

  const clean = {
    id: sanitizeFinishCode(piece.id, `p${index + 1}`),
    type: piece.type,
    x: asNumber(piece.x, 0, -100, 100),
    z: asNumber(piece.z, 0, -100, 100),
    elevation: asNumber(piece.elevation, def.elevation ?? 0, 0, 14),
    width: asNumber(piece.width, def.defaultWidth, def.minWidth, def.maxWidth),
    height: asNumber(piece.height, def.defaultHeight, def.minHeight, def.maxHeight),
    depth: asNumber(piece.depth, def.defaultDepth, def.minDepth, def.maxDepth),
    bodyFamily: sanitizeMaterialKey(piece.bodyFamily),
    bodyFinish: sanitizeFinishCode(piece.bodyFinish),
  }

  if (def.cabinet) {
    const frontStyles = def.frontStyles ?? ['none']
    clean.frontStyle = frontStyles.includes(piece.frontStyle) ? piece.frontStyle : 'none'
    clean.doorProfile = sanitizeFinishCode(piece.doorProfile, DEFAULT_DOOR_PROFILE)
    clean.frontFamily = sanitizeMaterialKey(piece.frontFamily, clean.bodyFamily)
    clean.frontFinish = sanitizeFinishCode(piece.frontFinish, clean.bodyFinish)
    clean.glassTint = ['clear', 'frosted'].includes(piece.glassTint) ? piece.glassTint : 'clear'
    clean.handleStyle = ['bar', 'knob', 'none'].includes(piece.handleStyle) ? piece.handleStyle : 'bar'
    clean.countertop = Boolean(piece.countertop && def.canCountertop)
    clean.countertopFamily = sanitizeMaterialKey(piece.countertopFamily, clean.bodyFamily)
    clean.countertopFinish = sanitizeFinishCode(piece.countertopFinish, clean.bodyFinish)
    if (def.defaultHasFootrest !== undefined) clean.hasFootrest = Boolean(piece.hasFootrest)
  } else {
    if (def.legStyleOptions) {
      clean.legStyle = def.legStyleOptions.includes(piece.legStyle) ? piece.legStyle : def.defaultLegStyle
      clean.topEdge = def.topEdgeOptions.includes(piece.topEdge) ? piece.topEdge : def.defaultTopEdge
    }
    if (def.backPanelOptions) {
      clean.backPanel = def.backPanelOptions.includes(piece.backPanel) ? piece.backPanel : def.defaultBackPanel
    }
  }

  return clean
}

function sanitizeDesign(design) {
  if (!Array.isArray(design?.pieces) || design.pieces.length === 0) {
    throw badRequest('Design must include at least one piece')
  }
  if (design.pieces.length > 60) throw badRequest('Design has too many pieces')
  return {
    room: sanitizeRoom(design.room),
    pieces: design.pieces.map(sanitizePiece),
  }
}

function normalizeRateCard(rateCard) {
  const incoming = rateCard ?? {}
  const normalized = structuredClone(DEFAULT_RATE_CARD)
  for (const family of Object.keys(normalized.partRates)) {
    for (const part of Object.keys(normalized.partRates[family])) {
      normalized.partRates[family][part] = asMoney(incoming.partRates?.[family]?.[part], normalized.partRates[family][part], 10000)
    }
  }
  for (const type of Object.keys(normalized.typeMultipliers)) {
    normalized.typeMultipliers[type] = Number(asNumber(incoming.typeMultipliers?.[type], normalized.typeMultipliers[type], 0, 10).toFixed(3))
  }
  for (const style of Object.keys(normalized.frontAdders)) {
    normalized.frontAdders[style] = Number(asNumber(incoming.frontAdders?.[style], normalized.frontAdders[style], 0, 3).toFixed(3))
  }
  normalized.countertopAdder = Number(asNumber(incoming.countertopAdder, normalized.countertopAdder, 0, 3).toFixed(3))
  normalized.minManufacturerCost = asMoney(incoming.minManufacturerCost, normalized.minManufacturerCost, 100000)
  normalized.freightRate = asMoney(incoming.freightRate, normalized.freightRate, 1000)
  normalized.baseFreight = asMoney(incoming.baseFreight, normalized.baseFreight, 100000)
  normalized.minFreightCost = asMoney(incoming.minFreightCost, normalized.minFreightCost, 100000)
  normalized.margin = Number(asNumber(incoming.margin, normalized.margin, 0, 10).toFixed(3))
  return normalized
}

function sanitizeOrderPatch(body, user) {
  const patch = {}
  if ('status' in body) {
    if (!ORDER_STATUSES.includes(body.status)) throw badRequest('Invalid order status')
    if (user.role === 'production' && !['in_production', 'shipped', 'delivered'].includes(body.status)) {
      throw badRequest('Production users can only set production, shipped, or delivered statuses')
    }
    patch.status = body.status
  }
  if ('costing' in body && user.role !== 'production') {
    patch.costing = {
      manufacturerCost: asMoney(body.costing?.manufacturerCost),
      freightCost: asMoney(body.costing?.freightCost),
      otherCost: asMoney(body.costing?.otherCost),
    }
  }
  if ('discount' in body && user.role !== 'production') {
    const type = body.discount?.type === 'fixed' ? 'fixed' : 'percent'
    patch.discount = {
      type,
      value: asMoney(body.discount?.value, 0, type === 'percent' ? 100 : 100000),
    }
  }
  if ('quotedPrice' in body && user.role !== 'production') {
    patch.quotedPrice = body.quotedPrice == null ? null : asMoney(body.quotedPrice, 0, 1000000)
  }
  if ('internalNotes' in body) {
    patch.internalNotes = asCleanString(body.internalNotes, 5000)
  }
  return patch
}

function sanitizeRole(role, fallback = 'viewer') {
  return USER_ROLES.includes(role) ? role : fallback
}

function sanitizeUsername(value) {
  const username = normalizeUsername(value)
  if (!/^[a-z0-9._-]{3,40}$/.test(username)) {
    throw badRequest('Username must be 3-40 characters and use letters, numbers, dots, dashes, or underscores')
  }
  return username
}

function canManageTarget(actor, targetRole) {
  if (actor.role === 'owner') return true
  return actor.role === 'admin' && targetRole !== 'owner'
}

function ownerCount(users) {
  return users.filter(user => user.active !== false && user.role === 'owner').length
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.post('/api/admin/login', (req, res) => {
  const ip = req.ip ?? 'unknown'
  if (!canAttemptLogin(ip)) {
    return res.status(429).json({ error: 'Too many failed login attempts. Try again later.' })
  }

  const { username = 'admin', password } = req.body ?? {}
  const user = password ? verifyUserPassword(username, String(password)) : null
  if (!user) {
    recordLoginFailure(ip)
    return res.status(401).json({ error: 'Wrong password' })
  }

  loginAttempts.delete(ip)
  res.json({
    token: createSessionToken(user),
    user: publicUser(user),
    permissions: permissionsForRole(user.role),
    roles: USER_ROLES,
    defaultPassword: defaultPasswordInUse(user),
  })
})

app.put('/api/admin/password', requireAdmin, (req, res) => {
  if (!req.permissions.changeOwnPassword) return res.status(403).json({ error: 'Not authorized' })
  if (req.user.id === 'env-admin') return res.status(400).json({ error: 'This account is managed by environment variables' })
  const { password } = req.body ?? {}
  const cleanPassword = String(password ?? '')
  if (cleanPassword.length < 10) {
    return res.status(400).json({ error: 'Password must be at least 10 characters' })
  }
  write(db => {
    const user = db.admin.users.find(account => account.id === req.user.id)
    if (!user) return
    user.passwordHash = hashPassword(cleanPassword)
    user.mustChangePassword = false
    user.updatedAt = new Date().toISOString()
  })
  res.json({ ok: true })
})

app.get('/api/admin/session', requireAdmin, (_req, res) => {
  res.json({
    user: publicUser(_req.user),
    permissions: _req.permissions,
    roles: USER_ROLES,
    defaultPassword: defaultPasswordInUse(_req.user),
  })
})

app.get('/api/admin/users', requireAdmin, requirePermission('manageUsers'), (req, res) => {
  const users = ensureUserAccounts()
    .filter(user => req.user.role === 'owner' || user.role !== 'owner')
    .map(publicUser)
  res.json(users)
})

app.post('/api/admin/users', requireAdmin, requirePermission('manageUsers'), (req, res, next) => {
  try {
    const username = sanitizeUsername(req.body?.username)
    const role = sanitizeRole(req.body?.role)
    if (!canManageTarget(req.user, role)) return res.status(403).json({ error: 'Not authorized for that role' })
    const password = String(req.body?.password ?? '')
    if (password.length < 10) throw badRequest('Password must be at least 10 characters')
    const user = {
      id: crypto.randomUUID(),
      username,
      name: asCleanString(req.body?.name, 120) || username,
      role,
      passwordHash: hashPassword(password),
      active: true,
      mustChangePassword: Boolean(req.body?.mustChangePassword),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    let created = null
    write(db => {
      if (db.admin.users.some(account => account.username === username)) throw badRequest('Username already exists')
      db.admin.users.push(user)
      created = user
    })
    res.status(201).json(publicUser(created))
  } catch (err) {
    next(err)
  }
})

app.patch('/api/admin/users/:id', requireAdmin, requirePermission('manageUsers'), (req, res, next) => {
  try {
    let updated = null
    write(db => {
      const user = db.admin.users.find(account => account.id === req.params.id)
      if (!user) return
      if (!canManageTarget(req.user, user.role)) throw badRequest('Not authorized for that user')
      const nextRole = 'role' in req.body ? sanitizeRole(req.body.role, user.role) : user.role
      if (!canManageTarget(req.user, nextRole)) throw badRequest('Not authorized for that role')
      if (user.id === req.user.id && (nextRole !== user.role || req.body.active === false)) {
        throw badRequest('You cannot change your own role or deactivate your own account')
      }
      if (user.role === 'owner' && nextRole !== 'owner' && ownerCount(db.admin.users) <= 1) {
        throw badRequest('At least one active owner is required')
      }
      if (user.role === 'owner' && req.body.active === false && ownerCount(db.admin.users) <= 1) {
        throw badRequest('At least one active owner is required')
      }
      if ('name' in req.body) user.name = asCleanString(req.body.name, 120) || user.username
      if ('role' in req.body) user.role = nextRole
      if ('active' in req.body) user.active = Boolean(req.body.active)
      if ('mustChangePassword' in req.body) user.mustChangePassword = Boolean(req.body.mustChangePassword)
      if (req.body.password) {
        const password = String(req.body.password)
        if (password.length < 10) throw badRequest('Password must be at least 10 characters')
        user.passwordHash = hashPassword(password)
        user.mustChangePassword = Boolean(req.body.mustChangePassword ?? true)
      }
      user.updatedAt = new Date().toISOString()
      updated = user
    })
    if (!updated) return res.status(404).json({ error: 'User not found' })
    res.json(publicUser(updated))
  } catch (err) {
    next(err)
  }
})

app.post('/api/orders', (req, res, next) => {
  try {
    const customer = req.body?.customer ?? {}
    const name = asCleanString(customer.name, 200, { required: true })
    const email = asCleanString(customer.email, 200, { required: true }).toLowerCase()
    if (!isValidEmail(email)) throw badRequest('Enter a valid email address')

    const order = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      status: 'new',
      customer: {
        name,
        email,
        phone: asCleanString(customer.phone, 50),
        notes: asCleanString(customer.notes, 2000),
      },
      design: sanitizeDesign(req.body?.design),
      estimateAtSubmission: asMoney(req.body?.estimateAtSubmission, 0, 1000000),
      costing: { manufacturerCost: 0, freightCost: 0, otherCost: 0 },
      discount: { type: 'percent', value: 0 },
      quotedPrice: null,
      internalNotes: '',
    }

    write(db => { db.orders.unshift(order) })
    res.status(201).json({ id: order.id })
  } catch (err) {
    next(err)
  }
})

app.get('/api/orders', requireAdmin, requirePermission('readOrders'), (_req, res) => {
  res.json(read().orders)
})

app.get('/api/orders/:id', requireAdmin, requirePermission('readOrders'), (req, res) => {
  const order = read().orders.find(o => o.id === req.params.id)
  if (!order) return res.status(404).json({ error: 'Order not found' })
  res.json(order)
})

app.patch('/api/orders/:id', requireAdmin, requirePermission('editOrders'), (req, res, next) => {
  try {
    const patch = sanitizeOrderPatch(req.body ?? {}, req.user)
    let updated = null
    write(db => {
      const order = db.orders.find(o => o.id === req.params.id)
      if (!order) return
      Object.assign(order, patch)
      updated = order
    })
    if (!updated) return res.status(404).json({ error: 'Order not found' })
    res.json(updated)
  } catch (err) {
    next(err)
  }
})

app.get('/api/rate-card', (_req, res) => {
  res.json(normalizeRateCard(read().rateCard))
})

app.put('/api/rate-card', requireAdmin, requirePermission('editPricing'), (req, res, next) => {
  try {
    const rateCard = normalizeRateCard(req.body)
    write(db => { db.rateCard = rateCard })
    res.json(rateCard)
  } catch (err) {
    next(err)
  }
})

app.use((err, _req, res, _next) => {
  void _next
  const status = err.status ?? 500
  if (status >= 500) console.error(err)
  res.status(status).json({ error: status >= 500 ? 'Server error' : err.message })
})

app.listen(PORT, () => {
  console.log(`Quote/admin server listening on http://localhost:${PORT}`)
})
