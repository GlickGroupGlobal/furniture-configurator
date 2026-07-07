import { useState, useEffect } from 'react'
import { THEME } from '../theme'
import { PIECE_DEFS, FRONT_STYLE_LABELS, DOOR_PROFILE_LABELS } from '../constants'
import { MATERIAL_FAMILIES, getFinish } from '../materials'
import { estimateTotalPrice, suggestQuote, DEFAULT_RATE_CARD } from '../pricing'
import {
  adminLogin, getAdminToken, clearAdminToken,
  fetchOrders, updateOrder, fetchRateCard, saveRateCard,
  fetchAdminSession, changeAdminPassword,
  fetchUsers, createUser, updateUser,
} from '../api'
import { formatFeetInches } from '../format'

function formatUSD(n) {
  if (n == null || Number.isNaN(Number(n))) return '—'
  return `$${Number(n).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}

const SQ_FT_PER_SQ_M = 10.7639

function normalizeRateCard(rateCard) {
  return {
    ...DEFAULT_RATE_CARD,
    ...rateCard,
    partRates: rateCard?.partRates ?? DEFAULT_RATE_CARD.partRates,
    typeMultipliers: { ...DEFAULT_RATE_CARD.typeMultipliers, ...(rateCard?.typeMultipliers ?? {}) },
    frontAdders: { ...DEFAULT_RATE_CARD.frontAdders, ...(rateCard?.frontAdders ?? {}) },
  }
}

const STATUSES = ['new', 'reviewing', 'quoted', 'confirmed', 'in_production', 'shipped', 'delivered', 'cancelled']

const ROLE_LABELS = {
  owner: 'Owner',
  admin: 'Admin',
  sales: 'Sales',
  production: 'Production',
  viewer: 'Viewer',
}

const STATUS_COLORS = {
  new: '#C1622D', reviewing: '#a8842a', quoted: '#2a6ea8',
  confirmed: '#1F9D6E', in_production: '#7a5ba8', shipped: '#2a8ea8',
  delivered: '#4a7a4a', cancelled: '#8a8a8a',
}

const input = {
  background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: 8,
  color: THEME.text, padding: '7px 10px', fontSize: 14, width: '100%',
}

const card = {
  background: THEME.surface, border: `1px solid ${THEME.border}`, borderRadius: 12,
  padding: 18, boxShadow: '0 2px 12px rgba(33,28,22,0.05)',
}

function StatusPill({ status }) {
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999,
      background: `${STATUS_COLORS[status]}1c`, color: STATUS_COLORS[status],
      textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap',
    }}>
      {status.replace('_', ' ')}
    </span>
  )
}

// ── Login ─────────────────────────────────────────────────────────────────────

function Login({ onLoggedIn }) {
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      const session = await adminLogin(username, password)
      onLoggedIn(session)
    } catch (err) {
      setError(err.message || 'Wrong password, or the server is not running.')
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: THEME.bg }}>
      <form onSubmit={submit} style={{ ...card, width: 340 }}>
        <h1 style={{ fontSize: 18, color: THEME.text, marginBottom: 4 }}>Admin</h1>
        <p style={{ fontSize: 13, color: THEME.textMuted, marginBottom: 16 }}>Orders, pricing & users</p>
        <input
          style={{ ...input, marginBottom: 10 }}
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          autoFocus
        />
        <input
          style={input}
          type="password"
          placeholder="Admin password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        {error && <p style={{ fontSize: 12.5, color: THEME.danger, marginTop: 10 }}>{error}</p>}
        <button type="submit" style={{
          width: '100%', marginTop: 14, padding: '9px', background: THEME.accent, color: '#fff',
          border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
        }}>
          Sign in
        </button>
      </form>
    </div>
  )
}

function PasswordPanel({ defaultPassword, onChanged }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  const save = async (e) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    if (password.length < 10) {
      setError('Use at least 10 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setSaving(true)
    try {
      await changeAdminPassword(password)
      setPassword('')
      setConfirm('')
      setMessage('Password updated.')
      onChanged()
    } catch (err) {
      setError(err.message || 'Could not update password.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={save} style={{ ...card, maxWidth: 520 }}>
      <h2 style={{ fontSize: 17, color: THEME.text, marginBottom: 6 }}>Admin password</h2>
      <p style={{ fontSize: 13, color: defaultPassword ? THEME.danger : THEME.textMuted, lineHeight: 1.5, marginBottom: 14 }}>
        {defaultPassword
          ? 'The default password is still active. Change it before using this with real customer requests.'
          : 'Update the shared admin password here.'}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <input
          style={input}
          type="password"
          placeholder="New password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <input
          style={input}
          type="password"
          placeholder="Confirm new password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
        />
      </div>
      {error && <p style={{ fontSize: 12.5, color: THEME.danger, marginTop: 10 }}>{error}</p>}
      {message && <p style={{ fontSize: 12.5, color: THEME.success, marginTop: 10 }}>{message}</p>}
      <button type="submit" disabled={saving} style={{
        marginTop: 14, padding: '9px 16px', background: THEME.accent, color: '#fff',
        border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
        opacity: saving ? 0.6 : 1,
      }}>
        {saving ? 'Saving...' : 'Change password'}
      </button>
    </form>
  )
}

function UsersPanel({ currentUser, sessionRoles }) {
  const roles = sessionRoles ?? Object.keys(ROLE_LABELS)
  const [users, setUsers] = useState([])
  const [draft, setDraft] = useState({ username: '', name: '', role: 'sales', password: '', mustChangePassword: true })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  const load = async () => {
    const list = await fetchUsers()
    setUsers(list)
  }

  useEffect(() => {
    let cancelled = false
    fetchUsers()
      .then(list => { if (!cancelled) setUsers(list) })
      .catch(err => { if (!cancelled) setError(err.message || 'Could not load users.') })
    return () => { cancelled = true }
  }, [])

  const availableRoles = roles.filter(role => currentUser?.role === 'owner' || role !== 'owner')

  const addUser = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      await createUser(draft)
      setDraft({ username: '', name: '', role: 'sales', password: '', mustChangePassword: true })
      await load()
      setMessage('User added.')
    } catch (err) {
      setError(err.message || 'Could not add user.')
    } finally {
      setSaving(false)
    }
  }

  const patchUser = async (id, updates) => {
    setError(null)
    setMessage(null)
    try {
      const updated = await updateUser(id, updates)
      setUsers(prev => prev.map(user => user.id === id ? updated : user))
      setMessage('User updated.')
    } catch (err) {
      setError(err.message || 'Could not update user.')
    }
  }

  const resetPassword = async (user) => {
    const password = window.prompt(`New password for ${user.username}`)
    if (!password) return
    await patchUser(user.id, { password, mustChangePassword: true })
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 14, alignItems: 'start' }}>
      <form onSubmit={addUser} style={card}>
        <h2 style={{ fontSize: 17, color: THEME.text, marginBottom: 12 }}>Add user</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input style={input} placeholder="Username" required value={draft.username}
            onChange={e => setDraft(d => ({ ...d, username: e.target.value }))} />
          <input style={input} placeholder="Name" value={draft.name}
            onChange={e => setDraft(d => ({ ...d, name: e.target.value }))} />
          <select style={input} value={draft.role} onChange={e => setDraft(d => ({ ...d, role: e.target.value }))}>
            {availableRoles.map(role => <option key={role} value={role}>{ROLE_LABELS[role]}</option>)}
          </select>
          <input style={input} type="password" placeholder="Temporary password" required value={draft.password}
            onChange={e => setDraft(d => ({ ...d, password: e.target.value }))} />
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: THEME.text }}>
            <input type="checkbox" checked={draft.mustChangePassword}
              onChange={e => setDraft(d => ({ ...d, mustChangePassword: e.target.checked }))} />
            Require password change
          </label>
        </div>
        <button type="submit" disabled={saving} style={{
          width: '100%', marginTop: 14, padding: '9px', background: THEME.accent, color: '#fff',
          border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
          opacity: saving ? 0.6 : 1,
        }}>
          {saving ? 'Adding...' : 'Add user'}
        </button>
        {error && <p style={{ fontSize: 12.5, color: THEME.danger, marginTop: 10 }}>{error}</p>}
        {message && <p style={{ fontSize: 12.5, color: THEME.success, marginTop: 10 }}>{message}</p>}
      </form>

      <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
          <thead>
            <tr style={{ background: THEME.surfaceAlt, color: THEME.textMuted, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {['User', 'Role', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 700 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} style={{ borderTop: `1px solid ${THEME.border}` }}>
                <td style={{ padding: '10px 14px', color: THEME.text, fontWeight: 600 }}>
                  {user.name}
                  <div style={{ fontSize: 11.5, color: THEME.textMuted, fontWeight: 400 }}>{user.username}</div>
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <select
                    style={{ ...input, width: 150 }}
                    value={user.role}
                    disabled={user.id === currentUser?.id}
                    onChange={e => patchUser(user.id, { role: e.target.value })}
                  >
                    {availableRoles.map(role => <option key={role} value={role}>{ROLE_LABELS[role]}</option>)}
                  </select>
                </td>
                <td style={{ padding: '10px 14px', color: user.active ? THEME.success : THEME.danger, fontWeight: 600 }}>
                  {user.active ? 'Active' : 'Inactive'}
                  {user.mustChangePassword && <div style={{ fontSize: 11.5, color: THEME.textMuted }}>Password change required</div>}
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button
                      onClick={() => resetPassword(user)}
                      style={{ background: 'transparent', border: `1px solid ${THEME.border}`, borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: THEME.text }}
                    >
                      Reset password
                    </button>
                    <button
                      disabled={user.id === currentUser?.id}
                      onClick={() => patchUser(user.id, { active: !user.active })}
                      style={{
                        background: 'transparent', border: `1px solid ${THEME.border}`, borderRadius: 8,
                        padding: '6px 8px', cursor: user.id === currentUser?.id ? 'not-allowed' : 'pointer',
                        color: user.active ? THEME.danger : THEME.success,
                        opacity: user.id === currentUser?.id ? 0.5 : 1,
                      }}
                    >
                      {user.active ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Order detail ──────────────────────────────────────────────────────────────

function pieceSummary(p) {
  const def = PIECE_DEFS[p.type]
  const body = getFinish(p.bodyFamily, p.bodyFinish)
  const parts = [
    `${formatFeetInches(p.width)} × ${formatFeetInches(p.height)} × ${formatFeetInches(p.depth)}`,
    `${MATERIAL_FAMILIES[p.bodyFamily]?.label ?? p.bodyFamily} · ${body.name} (${body.code})`,
  ]
  if (p.frontStyle && p.frontStyle !== 'none') {
    const front = getFinish(p.frontFamily, p.frontFinish)
    const profile = p.doorProfile ? ` · ${DOOR_PROFILE_LABELS[p.doorProfile] ?? p.doorProfile}` : ''
    parts.push(`Fronts: ${FRONT_STYLE_LABELS[p.frontStyle] ?? p.frontStyle}${p.frontStyle !== 'glass' ? `${profile} · ${front.name}` : ''}`)
  }
  if (p.countertop) parts.push('Countertop')
  return { label: def?.label ?? p.type, detail: parts.join('  ·  ') }
}

function OrderDetail({ order, rateCard, onBack, onSaved, permissions, currentUser }) {
  const [draft, setDraft] = useState({
    status: order.status,
    costing: { manufacturerCost: 0, freightCost: 0, otherCost: 0, ...order.costing },
    discount: { type: 'percent', value: 0, ...order.discount },
    quotedPrice: order.quotedPrice,
    internalNotes: order.internalNotes ?? '',
  })
  const [saving, setSaving] = useState(false)

  const estimate = order.estimateAtSubmission
    || estimateTotalPrice(order.design?.pieces ?? [], rateCard)
  const suggested = suggestQuote(estimate, rateCard, draft.discount)
  const quoted = draft.quotedPrice ?? suggested
  const totalCost = (Number(draft.costing.manufacturerCost) || 0)
    + (Number(draft.costing.freightCost) || 0)
    + (Number(draft.costing.otherCost) || 0)
  const margin = quoted - totalCost
  const canEditOrders = Boolean(permissions?.editOrders)
  const canEditMoney = canEditOrders && currentUser?.role !== 'production'

  const save = async () => {
    setSaving(true)
    try {
      const updated = await updateOrder(order.id, draft)
      onSaved(updated)
    } finally {
      setSaving(false)
    }
  }

  const costField = (key, label) => (
    <label style={{ flex: 1 }}>
      <div style={{ fontSize: 10.5, color: THEME.textMuted, textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
      <input
        style={input}
        type="number"
        min={0}
        value={draft.costing[key]}
        onChange={e => setDraft(d => ({ ...d, costing: { ...d.costing, [key]: Number(e.target.value) } }))}
      />
    </label>
  )

  return (
    <div>
      <button onClick={onBack} style={{
        background: 'transparent', border: 'none', color: THEME.accent, fontSize: 13,
        cursor: 'pointer', padding: 0, marginBottom: 14, fontWeight: 600,
      }}>
        ← All orders
      </button>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <h2 style={{ fontSize: 18, color: THEME.text }}>{order.customer.name}</h2>
          <div style={{ fontSize: 13, color: THEME.textMuted }}>
            {order.customer.email}{order.customer.phone ? ` · ${order.customer.phone}` : ''}
            {' · '}{new Date(order.createdAt).toLocaleDateString()}
          </div>
        </div>
        <StatusPill status={draft.status} />
      </div>

      {order.customer.notes && (
        <div style={{ ...card, marginBottom: 14, fontSize: 13.5, color: THEME.text, fontStyle: 'italic' }}>
          "{order.customer.notes}"
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: canEditOrders ? '1.2fr 1fr' : '1fr', gap: 14, alignItems: 'start' }}>
        {/* Design summary */}
        <div style={card}>
          <h3 style={{ fontSize: 13, color: THEME.accent, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
            Design · room {order.design?.room?.width}×{order.design?.room?.length} ft, {order.design?.room?.height} ft ceiling
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(order.design?.pieces ?? []).map((p, i) => {
              const s = pieceSummary(p)
              return (
                <div key={i} style={{ borderBottom: i < order.design.pieces.length - 1 ? `1px solid ${THEME.border}` : 'none', paddingBottom: 8 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: THEME.text }}>{s.label}</div>
                  <div style={{ fontSize: 12, color: THEME.textMuted, lineHeight: 1.5 }}>{s.detail}</div>
                </div>
              )
            })}
          </div>
          <div style={{ marginTop: 12, fontSize: 13, color: THEME.textMuted }}>
            Customer-facing estimate at submission:{' '}
            <strong style={{ color: THEME.success }}>{formatUSD(estimate)}</strong>
          </div>
        </div>

        {canEditOrders && (
        /* Money panel */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {canEditMoney && <div style={card}>
            <h3 style={{ fontSize: 13, color: THEME.accent, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
              Costing
            </h3>
            <div style={{ display: 'flex', gap: 8 }}>
              {costField('manufacturerCost', 'Manufacturer')}
              {costField('freightCost', 'Freight')}
              {costField('otherCost', 'Other')}
            </div>
          </div>}

          {canEditMoney && <div style={card}>
            <h3 style={{ fontSize: 13, color: THEME.accent, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
              Discount & quote
            </h3>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <select
                style={{ ...input, flex: 1 }}
                value={draft.discount.type}
                onChange={e => setDraft(d => ({ ...d, discount: { ...d.discount, type: e.target.value } }))}
              >
                <option value="percent">% off</option>
                <option value="fixed">$ off</option>
              </select>
              <input
                style={{ ...input, flex: 1 }}
                type="number"
                min={0}
                value={draft.discount.value}
                onChange={e => setDraft(d => ({ ...d, discount: { ...d.discount, value: Number(e.target.value) } }))}
              />
            </div>
            <div style={{ fontSize: 12.5, color: THEME.textMuted, marginBottom: 8 }}>
              Suggested quote (estimate × margin − discount): <strong>{formatUSD(suggested)}</strong>
              {draft.quotedPrice != null && (
                <button
                  onClick={() => setDraft(d => ({ ...d, quotedPrice: null }))}
                  style={{ marginLeft: 8, background: 'transparent', border: 'none', color: THEME.accent, cursor: 'pointer', fontSize: 12 }}
                >
                  use suggested
                </button>
              )}
            </div>
            <label>
              <div style={{ fontSize: 10.5, color: THEME.textMuted, textTransform: 'uppercase', marginBottom: 4 }}>Quoted price</div>
              <input
                style={input}
                type="number"
                min={0}
                value={quoted.toFixed ? Math.round(quoted) : quoted}
                onChange={e => setDraft(d => ({ ...d, quotedPrice: Number(e.target.value) }))}
              />
            </label>
            <div style={{ marginTop: 10, fontSize: 13, color: margin >= 0 ? THEME.success : THEME.danger, fontWeight: 600 }}>
              Margin vs. costs: {formatUSD(margin)}{totalCost === 0 ? ' (no costs entered yet)' : ''}
            </div>
          </div>}

          <div style={card}>
            <h3 style={{ fontSize: 13, color: THEME.accent, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
              Status & notes
            </h3>
            <select
              style={{ ...input, marginBottom: 10 }}
              value={draft.status}
              onChange={e => setDraft(d => ({ ...d, status: e.target.value }))}
            >
              {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
            <textarea
              style={{ ...input, resize: 'vertical' }}
              rows={3}
              placeholder="Internal notes (never shown to the customer)"
              value={draft.internalNotes}
              onChange={e => setDraft(d => ({ ...d, internalNotes: e.target.value }))}
            />
          </div>

          <button onClick={save} disabled={saving} style={{
            padding: '10px', background: THEME.accent, color: '#fff', border: 'none',
            borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
            opacity: saving ? 0.6 : 1,
          }}>
            {saving ? 'Saving…' : 'Save order'}
          </button>
        </div>
        )}
      </div>
    </div>
  )
}

// ── Rate card editor ──────────────────────────────────────────────────────────

function RateCardEditor({ rateCard, onSaved }) {
  const [draft, setDraft] = useState(() => normalizeRateCard(rateCard))
  const [rateUnit, setRateUnit] = useState('sqm')
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState(null)

  const save = async () => {
    setSaving(true)
    try {
      const saved = await saveRateCard(draft)
      onSaved(saved)
      setSavedAt(Date.now())
    } finally {
      setSaving(false)
    }
  }

  const numField = (label, value, onChange, step = 1) => (
    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
      <span style={{ fontSize: 13, color: THEME.text }}>{label}</span>
      <input
        style={{ ...input, width: 110 }}
        type="number"
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
      />
    </label>
  )

  const group = (title, children) => (
    <div style={card}>
      <h3 style={{ fontSize: 13, color: THEME.accent, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
        {title}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{children}</div>
    </div>
  )

  const visibleRate = (value) => rateUnit === 'sqft' ? Number((value / SQ_FT_PER_SQ_M).toFixed(2)) : value
  const canonicalRate = (value) => rateUnit === 'sqft' ? Number(value) * SQ_FT_PER_SQ_M : Number(value)
  const rateLabel = rateUnit === 'sqft' ? '$/ft²' : '$/m²'
  const partLabels = {
    doorPanel: 'Door panel · 18mm',
    cabinetBody: 'Cabinet body · 18mm',
    backboard: 'Backboard · 9mm',
  }
  const rateField = (familyKey, partKey) =>
    numField(
      partLabels[partKey],
      visibleRate(draft.partRates[familyKey][partKey]),
      v => setDraft(d => ({
        ...d,
        partRates: {
          ...d.partRates,
          [familyKey]: {
            ...d.partRates[familyKey],
            [partKey]: canonicalRate(v),
          },
        },
      })),
      0.1,
    )

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignItems: 'start' }}>
      <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 12, color: THEME.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Pricing units
        </span>
        {[
          ['sqm', '$/m²'],
          ['sqft', '$/ft²'],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setRateUnit(key)}
            style={{
              padding: '6px 10px', fontSize: 12, borderRadius: 7, cursor: 'pointer', fontWeight: 600,
              border: `1px solid ${rateUnit === key ? THEME.accent : THEME.border}`,
              background: rateUnit === key ? THEME.accentSoft : THEME.surface,
              color: rateUnit === key ? THEME.accentHover : THEME.textMuted,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {Object.keys(draft.partRates).map(familyKey =>
        group(`${MATERIAL_FAMILIES[familyKey]?.label ?? familyKey} (${rateLabel})`, [
          rateField(familyKey, 'doorPanel'),
          rateField(familyKey, 'cabinetBody'),
          rateField(familyKey, 'backboard'),
        ])
      )}

      {group('Piece type multipliers', Object.keys(draft.typeMultipliers).map(k =>
        numField(
          PIECE_DEFS[k]?.label ?? k,
          draft.typeMultipliers[k],
          v => setDraft(d => ({ ...d, typeMultipliers: { ...d.typeMultipliers, [k]: v } })),
          0.05,
        )
      ))}

      {group('Front style adders (fraction of cost)', Object.keys(draft.frontAdders).map(k =>
        numField(
          FRONT_STYLE_LABELS[k] ?? k,
          draft.frontAdders[k],
          v => setDraft(d => ({ ...d, frontAdders: { ...d.frontAdders, [k]: v } })),
          0.01,
        )
      ))}

      {group('Freight, floors & margin', [
        numField('Countertop adder', draft.countertopAdder, v => setDraft(d => ({ ...d, countertopAdder: v })), 0.01),
        numField('Freight $/ft³', draft.freightRate, v => setDraft(d => ({ ...d, freightRate: v }))),
        numField('Base freight $', draft.baseFreight, v => setDraft(d => ({ ...d, baseFreight: v }))),
        numField('Min manufacturer $', draft.minManufacturerCost, v => setDraft(d => ({ ...d, minManufacturerCost: v }))),
        numField('Min freight $', draft.minFreightCost, v => setDraft(d => ({ ...d, minFreightCost: v }))),
        numField('Quote margin (×)', draft.margin, v => setDraft(d => ({ ...d, margin: v })), 0.05),
      ])}

      <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={save} disabled={saving} style={{
          padding: '10px 24px', background: THEME.accent, color: '#fff', border: 'none',
          borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.6 : 1,
        }}>
          {saving ? 'Saving…' : 'Save rate card'}
        </button>
        {savedAt && <span style={{ fontSize: 13, color: THEME.success }}>Saved — live estimates now use these rates.</span>}
        <span style={{ fontSize: 12, color: THEME.textMuted }}>
          These rates drive the customer configurator's live estimates.
        </span>
      </div>
    </div>
  )
}

// ── Shell ─────────────────────────────────────────────────────────────────────

export default function AdminApp() {
  const [authed, setAuthed] = useState(!!getAdminToken())
  const [tab, setTab] = useState('orders')
  const [orders, setOrders] = useState([])
  const [openOrderId, setOpenOrderId] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [rateCard, setRateCard] = useState(DEFAULT_RATE_CARD)
  const [defaultPassword, setDefaultPassword] = useState(false)
  const [session, setSession] = useState(null)

  useEffect(() => {
    if (!authed) return
    let cancelled = false
    fetchOrders()
      .then(o => { if (!cancelled) setOrders(o) })
      .catch(() => {
        // token stale or server down — force re-login
        if (cancelled) return
        clearAdminToken()
        setAuthed(false)
      })
    fetchAdminSession().then(session => {
      if (!cancelled) {
        setSession(session)
        setDefaultPassword(Boolean(session.defaultPassword))
      }
    }).catch(() => {})
    fetchRateCard().then(card => { if (card && !cancelled) setRateCard(normalizeRateCard(card)) })
    return () => { cancelled = true }
  }, [authed])

  if (!authed) {
    return <Login onLoggedIn={nextSession => { setSession(nextSession); setDefaultPassword(Boolean(nextSession.defaultPassword)); setAuthed(true) }} />
  }

  const openOrder = orders.find(o => o.id === openOrderId)
  const visible = statusFilter === 'all' ? orders : orders.filter(o => o.status === statusFilter)
  const permissions = session?.permissions ?? {}
  const currentUser = session?.user
  const tabs = [
    permissions.readOrders && ['orders', 'Orders'],
    permissions.editPricing && ['pricing', 'Pricing'],
    permissions.manageUsers && ['users', 'Users'],
    ['security', 'Security'],
  ].filter(Boolean)

  return (
    <div style={{ minHeight: '100vh', background: THEME.bg }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 20, padding: '0 24px', height: 56,
        background: THEME.surface, borderBottom: `1px solid ${THEME.border}`,
      }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: THEME.text }}>Admin</span>
        {tabs.map(([key, label]) => (
          <button
            key={key}
            onClick={() => { setTab(key); setOpenOrderId(null) }}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              fontSize: 13.5, fontWeight: 600, padding: '6px 2px',
              color: tab === key ? THEME.accent : THEME.textMuted,
              borderBottom: tab === key ? `2px solid ${THEME.accent}` : '2px solid transparent',
            }}
          >
            {label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        {currentUser && (
          <span style={{ fontSize: 12.5, color: THEME.textMuted }}>
            {currentUser.name} Â· {ROLE_LABELS[currentUser.role] ?? currentUser.role}
          </span>
        )}
        <button
          onClick={() => { clearAdminToken(); setSession(null); setAuthed(false) }}
          style={{ background: 'transparent', border: 'none', color: THEME.textMuted, fontSize: 13, cursor: 'pointer' }}
        >
          Sign out
        </button>
      </div>

      <div style={{ maxWidth: 1080, margin: '0 auto', padding: 24 }}>
        {defaultPassword && tab !== 'security' && (
          <div style={{ ...card, marginBottom: 14, borderColor: 'rgba(180,55,55,0.35)', color: THEME.danger, fontSize: 13.5 }}>
            The default admin password is still active. Open Security and change it before using real customer data.
          </div>
        )}

        {tab === 'security' && (
          <PasswordPanel
            defaultPassword={defaultPassword}
            onChanged={() => setDefaultPassword(false)}
          />
        )}

        {tab === 'users' && permissions.manageUsers && (
          <UsersPanel
            currentUser={currentUser}
            sessionRoles={session?.roles}
          />
        )}

        {tab === 'pricing' && permissions.editPricing && (
          <RateCardEditor
            key={JSON.stringify(rateCard.partRates)}
            rateCard={rateCard}
            onSaved={setRateCard}
          />
        )}

        {tab === 'orders' && openOrder && (
          <OrderDetail
            order={openOrder}
            rateCard={rateCard}
            permissions={permissions}
            currentUser={currentUser}
            onBack={() => setOpenOrderId(null)}
            onSaved={updated => {
              setOrders(prev => prev.map(o => o.id === updated.id ? updated : o))
              setOpenOrderId(null)
            }}
          />
        )}

        {tab === 'orders' && permissions.readOrders && !openOrder && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <h2 style={{ fontSize: 17, color: THEME.text, flex: 1 }}>
                Orders <span style={{ color: THEME.textMuted, fontWeight: 400 }}>({visible.length})</span>
              </h2>
              <select style={{ ...input, width: 170 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="all">All statuses</option>
                {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>

            {visible.length === 0 ? (
              <div style={{ ...card, color: THEME.textMuted, fontSize: 14 }}>
                No orders yet. Quote requests submitted from the configurator will appear here.
              </div>
            ) : (
              <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
                  <thead>
                    <tr style={{ background: THEME.surfaceAlt, color: THEME.textMuted, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {['Date', 'Customer', 'Pieces', 'Estimate', 'Quoted', 'Status'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 700 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map(o => (
                      <tr
                        key={o.id}
                        onClick={() => setOpenOrderId(o.id)}
                        style={{ borderTop: `1px solid ${THEME.border}`, cursor: 'pointer' }}
                      >
                        <td style={{ padding: '10px 14px', color: THEME.textMuted }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding: '10px 14px', color: THEME.text, fontWeight: 600 }}>
                          {o.customer.name}
                          <div style={{ fontSize: 11.5, color: THEME.textMuted, fontWeight: 400 }}>{o.customer.email}</div>
                        </td>
                        <td style={{ padding: '10px 14px', color: THEME.text }}>{o.design?.pieces?.length ?? 0}</td>
                        <td style={{ padding: '10px 14px', color: THEME.text }}>{formatUSD(o.estimateAtSubmission)}</td>
                        <td style={{ padding: '10px 14px', color: THEME.text }}>{formatUSD(o.quotedPrice)}</td>
                        <td style={{ padding: '10px 14px' }}><StatusPill status={o.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
