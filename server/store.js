// Tiny JSON-file store with atomic writes. Deliberately dependency-free —
// swap for a real database in Phase 3 without touching the route handlers
// (index.js only uses read()/write()).

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const DEFAULT_DATA_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), 'data')
const DB_PATH = process.env.FURNITURE_DB_PATH || path.join(DEFAULT_DATA_DIR, 'db.json')

const DEFAULT_DB = {
  orders: [],
  rateCard: null,
  admin: {
    password: 'changeme',
    passwordHash: null,
    mustChangePassword: true,
    users: [],
  },
  features: {
    // Off by default — the photo-autobuild feature is gated behind this
    // until an admin explicitly turns it on (Admin > Pricing > Beta features).
    autobuildEnabled: false,
  },
}

let cache = null

function migrate(raw) {
  return {
    orders: Array.isArray(raw?.orders) ? raw.orders : [],
    rateCard: raw?.rateCard ?? null,
    admin: {
      password: raw?.admin?.password,
      passwordHash: raw?.admin?.passwordHash ?? null,
      mustChangePassword: Boolean(raw?.admin?.mustChangePassword),
      users: Array.isArray(raw?.admin?.users) ? raw.admin.users : [],
    },
    features: {
      autobuildEnabled: Boolean(raw?.features?.autobuildEnabled),
    },
  }
}

export function read() {
  if (cache) return cache
  try {
    cache = migrate(JSON.parse(fs.readFileSync(DB_PATH, 'utf8')))
  } catch (err) {
    if (err.code !== 'ENOENT') throw err
    cache = migrate(structuredClone(DEFAULT_DB))
  }
  return cache
}

export function write(mutate) {
  const db = read()
  mutate(db)
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })
  const tmp = DB_PATH + '.tmp'
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2))
  fs.renameSync(tmp, DB_PATH)
  return db
}
