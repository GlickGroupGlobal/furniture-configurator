import express from 'express'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { Buffer } from 'node:buffer'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { read, write } from './store.js'
import { analyzeFurniturePhoto, sanitizeAnalysis, VisionConfigError, VisionApiError } from './vision.js'
import { PIECE_DEFS, DEFAULT_DOOR_PROFILE } from '../src/constants.js'
import { DEFAULT_RATE_CARD } from '../src/pricing.js'

const PORT = Number(process.env.PORT) || 3001
const IS_PRODUCTION = process.env.NODE_ENV === 'production'
const SESSION_TTL_MS = 12 * 60 * 60 * 1000
const SESSION_SECRET = process.env.SESSION_SECRET || (IS_PRODUCTION ? null : crypto.randomBytes(32).toString('hex'))

if (!SESSION_SECRET) {
  throw new Error('SESSION_SECRET is required when NODE_ENV=production')
}

const UPLOADS_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'data', 'uploads')

const app = express()
app.disable('x-powered-by')
// 6mb: room for a resized reference photo (see analyze-piece below); the
// client already downsizes images before sending.
app.use(express.json({ limit: '6mb' }))
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('Referrer-Policy', 'same-origin')
  res.setHeader('Cache-Control', 'no-store')
  next()
})
// Reference photos saved by the autobuild feature — filenames are
// server-generated UUIDs (no directory listing), served publicly so both
// the configurator and admin order detail can display them.
app.use('/uploads', express.static(UPLOADS_DIR, { maxAge: '30d', index: false }))

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

// Soft per-IP cap on photo-autobuild calls, since each one costs money.
// In-memory only (resets on restart) — this is a courtesy limit, not a
// security boundary; the feature is off by default regardless.
const autobuildAttempts = new Map()
const AUTOBUILD_MAX_PER_WINDOW = 5
const AUTOBUILD_WINDOW_MS = 24 * 60 * 60 * 1000

function recordAndCheckAutobuildQuota(ip) {
  const now = Date.now()
  const current = autobuildAttempts.get(ip)
  if (!current || now - current.windowStart > AUTOBUILD_WINDOW_MS) {
    autobuildAttempts.set(ip, { count: 1, windowStart: now })
    return true
  }
  if (current.count >= AUTOBUILD_MAX_PER_WINDOW) return false
  current.count += 1
  return true
}

const API_MESSAGES = {
  en: {
    accountManagedByEnv: 'This account is managed by environment variables',
    atLeastOneOwner: 'At least one active owner is required',
    cannotChangeOwnAccount: 'You cannot change your own role or deactivate your own account',
    notAuthenticated: 'Not authenticated',
    notAuthorized: 'Not authorized',
    notAuthorizedForRole: 'Not authorized for that role',
    notAuthorizedForUser: 'Not authorized for that user',
    orderNotFound: 'Order not found',
    passwordLength: 'Password must be at least 10 characters',
    serverError: 'Server error',
    tooManyAttempts: 'Too many failed login attempts. Try again later.',
    userNotFound: 'User not found',
    usernameExists: 'Username already exists',
    wrongPassword: 'Wrong password',
    featureDisabled: 'This feature is not enabled yet.',
    invalidImage: 'Please upload a JPEG or PNG photo.',
    imageTooLarge: 'That photo is too large.',
    tooManyAnalyses: 'Too many photo analyses from this device today. Please try again later.',
    visionNotConfigured: 'Photo analysis is not configured yet.',
    visionFailed: 'Could not analyze that photo. Please try again.',
  },
  zh: {
    accountManagedByEnv: '此账号由环境变量管理',
    atLeastOneOwner: '至少需要保留一个启用的所有者账号',
    cannotChangeOwnAccount: '不能修改自己的角色或停用自己的账号',
    notAuthenticated: '未登录',
    notAuthorized: '没有权限',
    notAuthorizedForRole: '没有权限管理该角色',
    notAuthorizedForUser: '没有权限管理该用户',
    orderNotFound: '未找到订单',
    passwordLength: '密码至少需要 10 个字符',
    serverError: '服务器错误',
    tooManyAttempts: '登录失败次数过多。请稍后再试。',
    userNotFound: '未找到用户',
    usernameExists: '用户名已存在',
    wrongPassword: '密码错误',
    featureDisabled: '此功能尚未启用。',
    invalidImage: '请上传 JPEG 或 PNG 格式的照片。',
    imageTooLarge: '照片文件过大。',
    tooManyAnalyses: '此设备今天的照片分析次数过多，请稍后再试。',
    visionNotConfigured: '照片分析功能尚未配置。',
    visionFailed: '无法分析该照片，请重试。',
  },
}

function requestLanguage(req) {
  const raw = String(req.headers['x-language'] || req.headers['accept-language'] || 'en').toLowerCase()
  return raw.startsWith('zh') ? 'zh' : 'en'
}

function message(req, key) {
  return API_MESSAGES[requestLanguage(req)]?.[key] ?? API_MESSAGES.en[key] ?? key
}

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
  if (!session) return res.status(401).json({ error: message(req, 'notAuthenticated') })
  const user = session.sub === 'env-admin' ? {
    id: 'env-admin',
    username: 'admin',
    name: 'Environment Admin',
    role: 'owner',
    active: true,
    mustChangePassword: false,
  } : findUserById(session.sub)
  if (!user) return res.status(401).json({ error: message(req, 'notAuthenticated') })
  req.user = user
  req.permissions = permissionsForRole(user.role)
  next()
}

function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.permissions?.[permission]) return res.status(403).json({ error: message(req, 'notAuthorized') })
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

// Only accept our own server-generated upload paths (see /api/vision/analyze-piece)
// so a piece's sourcePhotoUrl can't be used to point at an arbitrary URL.
function sanitizeUploadPath(value) {
  const text = String(value ?? '')
  return /^\/uploads\/[a-f0-9-]{8,80}\.(jpg|png)$/i.test(text) ? text : undefined
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

  const sourcePhotoUrl = sanitizeUploadPath(piece.sourcePhotoUrl)
  if (sourcePhotoUrl) clean.sourcePhotoUrl = sourcePhotoUrl

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
    return res.status(429).json({ error: message(req, 'tooManyAttempts') })
  }

  const { username = 'admin', password } = req.body ?? {}
  const user = password ? verifyUserPassword(username, String(password)) : null
  if (!user) {
    recordLoginFailure(ip)
    return res.status(401).json({ error: message(req, 'wrongPassword') })
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
  if (!req.permissions.changeOwnPassword) return res.status(403).json({ error: message(req, 'notAuthorized') })
  if (req.user.id === 'env-admin') return res.status(400).json({ error: message(req, 'accountManagedByEnv') })
  const { password } = req.body ?? {}
  const cleanPassword = String(password ?? '')
  if (cleanPassword.length < 10) {
    return res.status(400).json({ error: message(req, 'passwordLength') })
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
    if (!canManageTarget(req.user, role)) return res.status(403).json({ error: message(req, 'notAuthorizedForRole') })
    const password = String(req.body?.password ?? '')
    if (password.length < 10) throw badRequest(message(req, 'passwordLength'))
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
      if (db.admin.users.some(account => account.username === username)) throw badRequest(message(req, 'usernameExists'))
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
      if (!canManageTarget(req.user, user.role)) throw badRequest(message(req, 'notAuthorizedForUser'))
      const nextRole = 'role' in req.body ? sanitizeRole(req.body.role, user.role) : user.role
      if (!canManageTarget(req.user, nextRole)) throw badRequest(message(req, 'notAuthorizedForRole'))
      if (user.id === req.user.id && (nextRole !== user.role || req.body.active === false)) {
        throw badRequest(message(req, 'cannotChangeOwnAccount'))
      }
      if (user.role === 'owner' && nextRole !== 'owner' && ownerCount(db.admin.users) <= 1) {
        throw badRequest(message(req, 'atLeastOneOwner'))
      }
      if (user.role === 'owner' && req.body.active === false && ownerCount(db.admin.users) <= 1) {
        throw badRequest(message(req, 'atLeastOneOwner'))
      }
      if ('name' in req.body) user.name = asCleanString(req.body.name, 120) || user.username
      if ('role' in req.body) user.role = nextRole
      if ('active' in req.body) user.active = Boolean(req.body.active)
      if ('mustChangePassword' in req.body) user.mustChangePassword = Boolean(req.body.mustChangePassword)
      if (req.body.password) {
        const password = String(req.body.password)
        if (password.length < 10) throw badRequest(message(req, 'passwordLength'))
        user.passwordHash = hashPassword(password)
        user.mustChangePassword = Boolean(req.body.mustChangePassword ?? true)
      }
      user.updatedAt = new Date().toISOString()
      updated = user
    })
    if (!updated) return res.status(404).json({ error: message(req, 'userNotFound') })
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
  if (!order) return res.status(404).json({ error: message(req, 'orderNotFound') })
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
    if (!updated) return res.status(404).json({ error: message(req, 'orderNotFound') })
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

// ── Feature flags ────────────────────────────────────────────────────────────
// Public read so the configurator knows whether to show gated features at
// all; admin-gated write, reusing the "editPricing" permission since this
// lives alongside the rate card in Admin > Pricing.

app.get('/api/features', (_req, res) => {
  res.json({ autobuildEnabled: Boolean(read().features?.autobuildEnabled) })
})

app.put('/api/features', requireAdmin, requirePermission('editPricing'), (req, res) => {
  const autobuildEnabled = Boolean(req.body?.autobuildEnabled)
  write(db => { db.features.autobuildEnabled = autobuildEnabled })
  res.json({ autobuildEnabled })
})

// ── Photo autobuild ──────────────────────────────────────────────────────────
// Off by default (see /api/features above). Analyzes a customer's reference
// photo with a vision model and returns a best-guess piece configuration for
// the configurator to pre-fill — the customer still adjusts dimensions/
// material afterward, same as any manually-added piece.

const ALLOWED_IMAGE_TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png' }
const MAX_IMAGE_BYTES = 5 * 1024 * 1024

function parseImageDataUrl(dataUrl) {
  const match = /^data:(image\/(?:jpeg|png));base64,(.+)$/.exec(String(dataUrl ?? ''))
  if (!match) return null
  const [, mediaType, base64Data] = match
  const approxBytes = base64Data.length * 0.75
  if (approxBytes > MAX_IMAGE_BYTES) return null
  return { mediaType, base64Data }
}

app.post('/api/vision/analyze-piece', (req, res, next) => {
  (async () => {
    if (!read().features?.autobuildEnabled) {
      return res.status(403).json({ error: message(req, 'featureDisabled') })
    }

    const parsed = parseImageDataUrl(req.body?.image)
    if (!parsed) return res.status(400).json({ error: message(req, 'invalidImage') })

    const ip = req.ip ?? 'unknown'
    if (!recordAndCheckAutobuildQuota(ip)) {
      return res.status(429).json({ error: message(req, 'tooManyAnalyses') })
    }

    let raw
    try {
      raw = await analyzeFurniturePhoto(parsed.base64Data, parsed.mediaType)
    } catch (err) {
      if (err instanceof VisionConfigError) return res.status(503).json({ error: message(req, 'visionNotConfigured') })
      if (err instanceof VisionApiError) {
        console.error(err)
        return res.status(502).json({ error: message(req, 'visionFailed') })
      }
      throw err
    }

    const analysis = sanitizeAnalysis(raw)

    let photoUrl = null
    if (analysis.isFurniture) {
      const extension = ALLOWED_IMAGE_TYPES[parsed.mediaType]
      const filename = `${crypto.randomUUID()}.${extension}`
      fs.mkdirSync(UPLOADS_DIR, { recursive: true })
      fs.writeFileSync(path.join(UPLOADS_DIR, filename), Buffer.from(parsed.base64Data, 'base64'))
      photoUrl = `/uploads/${filename}`
    }

    res.json({ ...analysis, photoUrl })
  })().catch(next)
})

app.use((err, req, res, _next) => {
  void _next
  const status = err.status ?? 500
  if (status >= 500) console.error(err)
  res.status(status).json({ error: status >= 500 ? message(req, 'serverError') : err.message })
})

app.listen(PORT, () => {
  console.log(`Quote/admin server listening on http://localhost:${PORT}`)
})
