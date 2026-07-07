import { useState, useCallback, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import Scene from './components/Scene'
import { THEME } from './theme'
import {
  PIECE_DEFS,
  FRONT_STYLE_LABELS,
  HANDLE_STYLE_LABELS,
  LEG_STYLE_LABELS,
  TOP_EDGE_LABELS,
  DOOR_PROFILE_LABELS,
  DEFAULT_DOOR_PROFILE,
} from './constants'
import { MATERIAL_FAMILIES, DEFAULT_FAMILY, DEFAULT_FINISH, GLASS_TINTS, DEFAULT_GLASS_TINT } from './materials'
import { estimatePiecePrice, estimateTotalPrice, DEFAULT_RATE_CARD } from './pricing'
import { fetchRateCard, submitOrder } from './api'
import { feetToMeters, metersToFeet, formatDimension } from './format'

function formatUSD(n) {
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}

const SIDEBAR_W = 320

let nextId = 1
function makePiece(type) {
  const def = PIECE_DEFS[type]
  const piece = {
    id: `p${nextId++}`,
    type,
    x: 0, z: 0,
    elevation: def.elevation ?? 0,
    width: def.defaultWidth,
    height: def.defaultHeight,
    depth: def.defaultDepth,
  }
  if (def.cabinet) {
    piece.bodyFamily  = DEFAULT_FAMILY
    piece.bodyFinish  = DEFAULT_FINISH
    piece.frontStyle  = 'none'            // carcass first — fronts are added later
    piece.doorProfile = DEFAULT_DOOR_PROFILE
    piece.frontFamily = DEFAULT_FAMILY
    piece.frontFinish = DEFAULT_FINISH
    piece.glassTint   = DEFAULT_GLASS_TINT
    piece.handleStyle = 'bar'
    piece.countertop  = def.defaultCountertop ?? false
    piece.countertopFamily = DEFAULT_FAMILY
    piece.countertopFinish = DEFAULT_FINISH
    if (def.defaultHasFootrest !== undefined) piece.hasFootrest = def.defaultHasFootrest
  } else {
    piece.bodyFamily = DEFAULT_FAMILY
    piece.bodyFinish = DEFAULT_FINISH
    if (def.defaultLegStyle)  piece.legStyle  = def.defaultLegStyle
    if (def.defaultTopEdge)   piece.topEdge   = def.defaultTopEdge
    if (def.defaultBackPanel) piece.backPanel = def.defaultBackPanel
  }
  return piece
}

// ── Small UI primitives ───────────────────────────────────────────────────────

function CollapsibleSection({ title, open, onToggle, children, badge }) {
  return (
    <div style={{ borderBottom: `1px solid ${THEME.border}`, marginBottom: 4 }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'transparent', border: 'none', padding: '10px 2px',
          cursor: 'pointer',
        }}
      >
        <span style={{
          fontSize: 11, fontWeight: 700, color: THEME.accent,
          textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>
          {title}{badge != null && <span style={{ color: THEME.textMuted, marginLeft: 6 }}>{badge}</span>}
        </span>
        <span style={{ color: THEME.textMuted, fontSize: 11 }}>{open ? '▾' : '▸'}</span>
      </button>
      {open && <div style={{ paddingBottom: 14 }}>{children}</div>}
    </div>
  )
}

function NumInput({ label, value, min, max, step = 0.25, onChange, unitSystem = 'imperial' }) {
  const isMetric = unitSystem === 'metric'
  const displayValue = isMetric ? Number(feetToMeters(value).toFixed(2)) : value
  const displayMin = isMetric ? Number(feetToMeters(min).toFixed(2)) : min
  const displayMax = isMetric ? Number(feetToMeters(max).toFixed(2)) : max
  const displayStep = isMetric ? 0.05 : step
  const unit = isMetric ? 'm' : 'ft'

  const commit = (raw) => {
    const displayNumber = Number(raw)
    const feetValue = isMetric ? metersToFeet(displayNumber) : displayNumber
    onChange(Math.min(max, Math.max(min, feetValue)))
  }

  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
      <span style={{ fontSize: 10, color: THEME.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <input
          type="number"
          value={displayValue}
          min={displayMin}
          max={displayMax}
          step={displayStep}
          onChange={e => commit(e.target.value)}
          style={{
            width: '100%', minWidth: 0,
            background: THEME.surface,
            border: `1px solid ${THEME.border}`,
            borderRadius: 8,
            color: THEME.text,
            padding: '7px 8px',
            fontSize: 14,
          }}
        />
        <span style={{ fontSize: 10, color: THEME.textMuted }}>{unit}</span>
      </div>
    </label>
  )
}

function Segmented({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
      {options.map(([key, label]) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          style={{
            padding: '6px 10px', fontSize: 12, borderRadius: 7, cursor: 'pointer', fontWeight: 500,
            border: `1px solid ${value === key ? THEME.accent : THEME.border}`,
            background: value === key ? THEME.accentSoft : THEME.surface,
            color: value === key ? THEME.accentHover : THEME.text,
          }}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

function UnitToggle({ unitSystem, onChange }) {
  return (
    <Segmented
      options={[['imperial', 'Ft / In'], ['metric', 'Metric']]}
      value={unitSystem}
      onChange={onChange}
    />
  )
}

// Family tabs + clickable finish thumbnails — the core "pick your material" UI.
function FinishPicker({ family, finish, onChange }) {
  const fam = MATERIAL_FAMILIES[family] ?? MATERIAL_FAMILIES[DEFAULT_FAMILY]
  return (
    <div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
        {Object.entries(MATERIAL_FAMILIES).map(([key, f]) => (
          <button
            key={key}
            onClick={() => onChange({ family: key, finish: f.finishes[0].code })}
            style={{
              flex: 1, padding: '6px 4px', fontSize: 11, borderRadius: 7, cursor: 'pointer', fontWeight: 600,
              border: `1px solid ${family === key ? THEME.accent : THEME.border}`,
              background: family === key ? THEME.accentSoft : THEME.surface,
              color: family === key ? THEME.accentHover : THEME.textMuted,
            }}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
        {fam.finishes.map(f => {
          const isSelected = f.code === finish
          return (
            <button
              key={f.code}
              onClick={() => onChange({ family, finish: f.code })}
              title={`${f.name} (${f.code})`}
              style={{
                padding: 0, cursor: 'pointer', borderRadius: 8, overflow: 'hidden',
                border: isSelected ? `2px solid ${THEME.accent}` : `1px solid ${THEME.border}`,
                background: THEME.surface,
              }}
            >
              {f.image ? (
                <img src={f.image} alt={f.name} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }} />
              ) : (
                <div style={{ width: '100%', aspectRatio: '1', background: f.color }} />
              )}
              <div style={{
                fontSize: 8.5, padding: '3px 2px', color: isSelected ? THEME.accentHover : THEME.textMuted,
                fontWeight: isSelected ? 700 : 500, lineHeight: 1.2,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {f.name}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function SubLabel({ children }) {
  return (
    <div style={{
      fontSize: 10.5, fontWeight: 700, color: THEME.text, margin: '14px 0 8px',
      textTransform: 'uppercase', letterSpacing: '0.05em',
    }}>
      {children}
    </div>
  )
}

function Toggle({ label, checked, onChange }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: THEME.text }}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      {label}
    </label>
  )
}

// ── Piece editor — sections ordered by the real decision flow ────────────────

function EditPanel({ piece, rateCard, onChange, onDelete, unitSystem }) {
  const def = PIECE_DEFS[piece.type]
  const price = estimatePiecePrice(piece, rateCard)
  const isCabinet = !!def.cabinet
  const hasFronts = isCabinet && piece.frontStyle !== 'none'

  return (
    <div>
      <div style={{ fontSize: 13, color: THEME.textMuted, margin: '4px 0 10px' }}>
        Est. price: <strong style={{ color: THEME.success }}>{formatUSD(price)}</strong>
      </div>

      {/* 1 — Size */}
      <SubLabel>1 · Size</SubLabel>
      <div style={{ display: 'flex', gap: 6 }}>
        <NumInput label="Width"  value={piece.width}  min={def.minWidth}  max={def.maxWidth}
          unitSystem={unitSystem}
          onChange={v => onChange({ width: v })} />
        <NumInput label="Height" value={piece.height} min={def.minHeight} max={def.maxHeight}
          unitSystem={unitSystem}
          onChange={v => onChange({ height: v })} />
        <NumInput label="Depth"  value={piece.depth}  min={def.minDepth}  max={def.maxDepth}
          unitSystem={unitSystem}
          onChange={v => onChange({ depth: v })} />
      </div>

      {/* 2 — Body material */}
      <SubLabel>2 · {isCabinet ? 'Body material' : 'Material'}</SubLabel>
      <FinishPicker
        family={piece.bodyFamily}
        finish={piece.bodyFinish}
        onChange={({ family, finish }) => onChange({ bodyFamily: family, bodyFinish: finish })}
      />

      {/* 3 — Fronts (cabinets only) */}
      {isCabinet && (
        <>
          <SubLabel>3 · Front type</SubLabel>
          <Segmented
            options={def.frontStyles.map(s => [s, FRONT_STYLE_LABELS[s]])}
            value={piece.frontStyle}
            onChange={v => onChange({ frontStyle: v })}
          />
          {hasFronts && !['glass', 'drawers'].includes(piece.frontStyle) && (
            <>
              <SubLabel>4 · Door panel shape</SubLabel>
              <Segmented
                options={Object.entries(DOOR_PROFILE_LABELS)}
                value={piece.doorProfile ?? DEFAULT_DOOR_PROFILE}
                onChange={v => onChange({ doorProfile: v })}
              />
            </>
          )}
          {hasFronts && piece.frontStyle === 'glass' && (
            <div style={{ marginTop: 8 }}>
              <Segmented
                options={Object.entries(GLASS_TINTS).map(([k, g]) => [k, g.label])}
                value={piece.glassTint}
                onChange={v => onChange({ glassTint: v })}
              />
            </div>
          )}
          {hasFronts && piece.frontStyle !== 'glass' && (
            <div style={{ marginTop: 10 }}>
              <SubLabel>{piece.frontStyle === 'drawers' ? '4' : '5'} · Door color / material</SubLabel>
              <FinishPicker
                family={piece.frontFamily}
                finish={piece.frontFinish}
                onChange={({ family, finish }) => onChange({ frontFamily: family, frontFinish: finish })}
              />
            </div>
          )}
          {hasFronts && (
            <>
              <SubLabel>{piece.frontStyle === 'drawers' ? '5' : '6'} · Handles</SubLabel>
              <Segmented
                options={Object.entries(HANDLE_STYLE_LABELS)}
                value={piece.handleStyle}
                onChange={v => onChange({ handleStyle: v })}
              />
            </>
          )}

          {/* 5 — Countertop */}
          {def.canCountertop && (
            <>
              <SubLabel>{hasFronts ? '7' : '4'} · Countertop</SubLabel>
              <Toggle
                label="Add countertop"
                checked={!!piece.countertop}
                onChange={v => onChange({ countertop: v })}
              />
              {piece.countertop && (
                <div style={{ marginTop: 8 }}>
                  <FinishPicker
                    family={piece.countertopFamily}
                    finish={piece.countertopFinish}
                    onChange={({ family, finish }) => onChange({ countertopFamily: family, countertopFinish: finish })}
                  />
                </div>
              )}
            </>
          )}
          {def.defaultHasFootrest !== undefined && (
            <div style={{ marginTop: 10 }}>
              <Toggle
                label="Footrest bar"
                checked={!!piece.hasFootrest}
                onChange={v => onChange({ hasFootrest: v })}
              />
            </div>
          )}
        </>
      )}

      {/* Non-cabinet extras */}
      {def.legStyleOptions && (
        <>
          <SubLabel>3 · Legs</SubLabel>
          <Segmented
            options={def.legStyleOptions.map(s => [s, LEG_STYLE_LABELS[s]])}
            value={piece.legStyle}
            onChange={v => onChange({ legStyle: v })}
          />
          <div style={{ marginTop: 8 }}>
            <Segmented
              options={def.topEdgeOptions.map(s => [s, TOP_EDGE_LABELS[s]])}
              value={piece.topEdge}
              onChange={v => onChange({ topEdge: v })}
            />
          </div>
        </>
      )}
      {def.backPanelOptions && (
        <>
          <SubLabel>3 · Back panel</SubLabel>
          <Segmented
            options={[['solid', 'Solid Back'], ['open', 'Open Back']]}
            value={piece.backPanel}
            onChange={v => onChange({ backPanel: v })}
          />
        </>
      )}

      <button
        onClick={onDelete}
        style={{
          width: '100%', padding: '8px 12px', marginTop: 16,
          background: 'transparent', border: `1px solid ${THEME.border}`,
          borderRadius: 8, color: THEME.danger, fontSize: 13, cursor: 'pointer',
        }}
      >
        Remove piece
      </button>
    </div>
  )
}

// ── Quote request modal ───────────────────────────────────────────────────────

function QuoteModal({ room, pieces, estimate, onClose }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', notes: '' })
  const [state, setState] = useState('idle') // idle | sending | done | error
  const update = f => e => setForm(prev => ({ ...prev, [f]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setState('sending')
    try {
      await submitOrder({
        customer: form,
        design: { room, pieces },
        estimateAtSubmission: estimate,
      })
      setState('done')
    } catch {
      setState('error')
    }
  }

  const inputStyle = {
    width: '100%', background: THEME.surface, border: `1px solid ${THEME.border}`,
    borderRadius: 8, color: THEME.text, padding: '8px 10px', fontSize: 14,
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(33,28,22,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: 420, maxWidth: '92vw', maxHeight: '86vh', overflowY: 'auto',
        background: THEME.bg, borderRadius: 14, padding: 24,
        boxShadow: '0 12px 48px rgba(33,28,22,0.25)',
      }}>
        {state === 'done' ? (
          <>
            <h2 style={{ fontSize: 18, color: THEME.text, marginBottom: 10 }}>Quote request sent</h2>
            <p style={{ fontSize: 14, color: THEME.textMuted, lineHeight: 1.6, marginBottom: 18 }}>
              Thanks, {form.name.split(' ')[0] || 'there'} — we received your design
              ({pieces.length} piece{pieces.length !== 1 ? 's' : ''}, estimated {formatUSD(estimate)}).
              We'll review it and follow up at {form.email} with a firm quote.
            </p>
            <button onClick={onClose} style={{
              width: '100%', padding: '10px', background: THEME.accent, color: '#fff',
              border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}>
              Done
            </button>
          </>
        ) : (
          <form onSubmit={submit}>
            <h2 style={{ fontSize: 18, color: THEME.text, marginBottom: 6 }}>Request a firm quote</h2>
            <p style={{ fontSize: 13, color: THEME.textMuted, lineHeight: 1.5, marginBottom: 16 }}>
              Sends your current design ({pieces.length} piece{pieces.length !== 1 ? 's' : ''},
              estimated {formatUSD(estimate)}) to our team for review.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input style={inputStyle} placeholder="Name" required value={form.name} onChange={update('name')} />
              <input style={inputStyle} placeholder="Email" type="email" required value={form.email} onChange={update('email')} />
              <input style={inputStyle} placeholder="Phone (optional)" value={form.phone} onChange={update('phone')} />
              <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={3}
                placeholder="Anything we should know? (location, timeline, ...)"
                value={form.notes} onChange={update('notes')} />
            </div>
            {state === 'error' && (
              <p style={{ fontSize: 13, color: THEME.danger, marginTop: 10 }}>
                The quote service isn't reachable right now — your design is safe, please try again shortly.
              </p>
            )}
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button type="button" onClick={onClose} style={{
                flex: 1, padding: '10px', background: 'transparent', color: THEME.textMuted,
                border: `1px solid ${THEME.border}`, borderRadius: 8, fontSize: 14, cursor: 'pointer',
              }}>
                Cancel
              </button>
              <button type="submit" disabled={state === 'sending'} style={{
                flex: 2, padding: '10px', background: THEME.accent, color: '#fff',
                border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                opacity: state === 'sending' ? 0.6 : 1,
              }}>
                {state === 'sending' ? 'Sending…' : 'Send quote request'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

function Sidebar({
  room, setRoom, pieces, selectedId, setSelectedId,
  updatePiece, removePiece, addPiece, rateCard, onRequestQuote,
  unitSystem, setUnitSystem,
}) {
  const selected = pieces.find(p => p.id === selectedId)
  const total = estimateTotalPrice(pieces, rateCard)

  // Room open on an empty scene; auto-collapse when the first piece lands.
  const [roomOpen, setRoomOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(true)
  const [piecesOpen, setPiecesOpen] = useState(true)
  const [hadPieces, setHadPieces] = useState(false)
  if (pieces.length > 0 && !hadPieces) {
    // adjust-state-during-render pattern: collapse Room when the first piece lands
    setHadPieces(true)
    setRoomOpen(false)
  }

  const visibleTypes = Object.entries(PIECE_DEFS).filter(([, def]) => !def.hidden)

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, bottom: 0, width: SIDEBAR_W,
      zIndex: 10, background: 'rgba(255,255,255,0.97)',
      borderRight: `1px solid ${THEME.border}`,
      boxShadow: '2px 0 16px rgba(33,28,22,0.05)',
      display: 'flex', flexDirection: 'column', padding: '16px 18px',
      overflowY: 'auto',
    }}>
      <div style={{ fontWeight: 700, fontSize: 15, color: THEME.text, marginBottom: 12 }}>
        Furniture Configurator
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 10, color: THEME.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
          Units
        </div>
        <UnitToggle unitSystem={unitSystem} onChange={setUnitSystem} />
      </div>

      {/* Running estimate + quote CTA */}
      <div style={{
        marginBottom: 14, padding: '12px 14px',
        background: THEME.successSoft, border: '1px solid rgba(31,157,110,0.3)',
        borderRadius: 12,
      }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: THEME.success, lineHeight: 1.1 }}>
          {formatUSD(total)}
        </div>
        <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 2 }}>
          Estimated total · {pieces.length} piece{pieces.length !== 1 ? 's' : ''}
        </div>
        {pieces.length > 0 && (
          <button onClick={onRequestQuote} style={{
            width: '100%', marginTop: 10, padding: '8px', background: THEME.accent,
            color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>
            Request a quote
          </button>
        )}
      </div>

      <CollapsibleSection
        title="Room"
        badge={`${formatDimension(room.width, unitSystem)} × ${formatDimension(room.length, unitSystem)}`}
        open={roomOpen}
        onToggle={() => setRoomOpen(o => !o)}
      >
        <div style={{ display: 'flex', gap: 6 }}>
          <NumInput label="Width"  value={room.width}  min={6} max={40}
            unitSystem={unitSystem}
            onChange={v => setRoom(r => ({ ...r, width: v }))} />
          <NumInput label="Length" value={room.length} min={6} max={60}
            unitSystem={unitSystem}
            onChange={v => setRoom(r => ({ ...r, length: v }))} />
          <NumInput label="Height" value={room.height} min={7} max={14}
            unitSystem={unitSystem}
            onChange={v => setRoom(r => ({ ...r, height: v }))} />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Add Furniture" open={addOpen} onToggle={() => setAddOpen(o => !o)}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {visibleTypes.map(([type, def]) => (
            <button
              key={type}
              onClick={() => addPiece(type)}
              style={{
                padding: '8px 10px',
                background: THEME.accentSoft, border: `1px solid ${THEME.accent}33`,
                borderRadius: 8, color: THEME.accentHover, fontSize: 12.5, fontWeight: 500,
                cursor: 'pointer', textAlign: 'left',
              }}
            >
              + {def.label}
            </button>
          ))}
        </div>
      </CollapsibleSection>

      {pieces.length > 0 && (
        <CollapsibleSection
          title="Pieces in room"
          badge={pieces.length}
          open={piecesOpen}
          onToggle={() => setPiecesOpen(o => !o)}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {pieces.map(p => {
              const isSel = p.id === selectedId
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedId(isSel ? null : p.id)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '6px 10px', borderRadius: 8, cursor: 'pointer',
                    border: `1px solid ${isSel ? THEME.accent : THEME.border}`,
                    background: isSel ? THEME.accentSoft : THEME.surface,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: THEME.text }}>
                      {PIECE_DEFS[p.type].label}
                    </div>
                    <div style={{ fontSize: 10.5, color: THEME.textMuted }}>
                      {formatDimension(p.width, unitSystem)} × {formatDimension(p.height, unitSystem)} × {formatDimension(p.depth, unitSystem)}
                    </div>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); removePiece(p.id); if (isSel) setSelectedId(null) }}
                    title="Remove"
                    style={{
                      background: 'transparent', border: 'none', color: THEME.textMuted,
                      cursor: 'pointer', fontSize: 14, padding: '2px 4px',
                    }}
                  >
                    ×
                  </button>
                </div>
              )
            })}
          </div>
        </CollapsibleSection>
      )}

      {selected && (
        <CollapsibleSection title={`Edit · ${PIECE_DEFS[selected.type].label}`} open onToggle={() => setSelectedId(null)}>
          <EditPanel
            piece={selected}
            rateCard={rateCard}
            onChange={updates => updatePiece(selected.id, updates)}
            onDelete={() => { removePiece(selected.id); setSelectedId(null) }}
            unitSystem={unitSystem}
          />
        </CollapsibleSection>
      )}

      {pieces.length === 0 && (
        <div style={{ fontSize: 12, color: THEME.textMuted, lineHeight: 1.6, marginTop: 8 }}>
          Set your room size, then add a cabinet. Pieces start as an open carcass —
          pick the body material first, then add door fronts, handles, and a countertop.
        </div>
      )}
    </div>
  )
}

function ViewToggle({ viewMode, setViewMode }) {
  const modes = [
    ['orbit', 'Orbit'],
    ['top', 'Top View'],
    ['front', 'Front View'],
  ]
  return (
    <div style={{
      position: 'absolute', top: 16, right: 16, zIndex: 10,
      display: 'flex', gap: 4,
      background: 'rgba(255,255,255,0.94)', border: `1px solid ${THEME.border}`,
      borderRadius: 10, padding: 4, boxShadow: '0 2px 12px rgba(33,28,22,0.08)',
    }}>
      {modes.map(([mode, label]) => (
        <button
          key={mode}
          onClick={() => setViewMode(mode)}
          style={{
            padding: '6px 12px', fontSize: 12, borderRadius: 7,
            border: 'none', cursor: 'pointer', fontWeight: 500,
            background: viewMode === mode ? THEME.accent : 'transparent',
            color: viewMode === mode ? '#fff' : THEME.textMuted,
          }}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

export default function ConfiguratorApp() {
  const [room, setRoom] = useState({ width: 12, length: 14, height: 9 })
  const [pieces, setPieces] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [viewMode, setViewMode] = useState('orbit')
  const [rateCard, setRateCard] = useState(DEFAULT_RATE_CARD)
  const [quoteOpen, setQuoteOpen] = useState(false)
  const [unitSystem, setUnitSystem] = useState('imperial')

  // Pull the live rate card from the server; keep defaults when offline.
  useEffect(() => {
    fetchRateCard().then(card => { if (card) setRateCard(card) })
  }, [])

  const addPiece = useCallback((type) => {
    const piece = makePiece(type)
    setPieces(prev => [...prev, piece])
    setSelectedId(piece.id)
  }, [])

  const updatePiece = useCallback((id, updates) => {
    setPieces(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
  }, [])

  const removePiece = useCallback((id) => {
    setPieces(prev => prev.filter(p => p.id !== id))
  }, [])

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', background: THEME.bg }}>
      <Sidebar
        room={room} setRoom={setRoom}
        pieces={pieces} selectedId={selectedId} setSelectedId={setSelectedId}
        updatePiece={updatePiece} removePiece={removePiece} addPiece={addPiece}
        rateCard={rateCard}
        onRequestQuote={() => setQuoteOpen(true)}
        unitSystem={unitSystem}
        setUnitSystem={setUnitSystem}
      />
      <div style={{ position: 'absolute', top: 0, left: SIDEBAR_W, right: 0, bottom: 0 }}>
        <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
        <Canvas
          shadows
          style={{ width: '100%', height: '100%' }}
          gl={{ antialias: true }}
        >
          <color attach="background" args={[THEME.canvasBg]} />
          <Scene
            room={room}
            pieces={pieces}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            updatePiece={updatePiece}
            viewMode={viewMode}
            unitSystem={unitSystem}
            showRoomDimensions={false}
          />
        </Canvas>
      </div>
      {quoteOpen && (
        <QuoteModal
          room={room}
          pieces={pieces}
          estimate={estimateTotalPrice(pieces, rateCard)}
          onClose={() => setQuoteOpen(false)}
        />
      )}
    </div>
  )
}
