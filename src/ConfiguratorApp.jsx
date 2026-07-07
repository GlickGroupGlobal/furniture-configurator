import { useState, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import Scene from './components/Scene'
import { THEME } from './theme'
import {
  MATERIALS, PIECE_DEFS, DEFAULT_MATERIAL,
  UPHOLSTERY_MATERIALS, DEFAULT_UPHOLSTERY,
  DOOR_STYLE_LABELS, HANDLE_STYLE_LABELS, FRONT_STYLE_LABELS,
  LEG_STYLE_LABELS, TOP_EDGE_LABELS, ARM_STYLE_LABELS,
  BACK_STYLE_LABELS, BACK_PANEL_LABELS,
} from './constants'
import { estimatePiecePrice, estimateTotalPrice } from './pricing'

function formatUSD(n) {
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}

const SIDEBAR_W = 300

// Maps each style dimension's PIECE_DEFS options-array key to the piece
// field it drives and the label dictionary used to render its <select>.
// Only rendered for a given piece type when that options array exists.
const STYLE_FIELDS = [
  { optionsKey: 'doorStyleOptions',   field: 'doorStyle',   label: 'Door Style',  labels: DOOR_STYLE_LABELS },
  { optionsKey: 'frontStyleOptions',  field: 'frontStyle',  label: 'Front Style', labels: FRONT_STYLE_LABELS },
  { optionsKey: 'handleStyleOptions', field: 'handleStyle', label: 'Handle',      labels: HANDLE_STYLE_LABELS },
  { optionsKey: 'legStyleOptions',    field: 'legStyle',    label: 'Leg Style',   labels: LEG_STYLE_LABELS },
  { optionsKey: 'topEdgeOptions',     field: 'topEdge',     label: 'Top Edge',    labels: TOP_EDGE_LABELS },
  { optionsKey: 'armStyleOptions',    field: 'armStyle',    label: 'Arm Style',   labels: ARM_STYLE_LABELS },
  { optionsKey: 'backStyleOptions',   field: 'backStyle',   label: 'Back Style',  labels: BACK_STYLE_LABELS },
  { optionsKey: 'backPanelOptions',   field: 'backPanel',   label: 'Back Panel',  labels: BACK_PANEL_LABELS },
]

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
    material: DEFAULT_MATERIAL,
  }
  // Seed every style field this piece type supports (defaultDoorStyle -> doorStyle, etc.)
  // from PIECE_DEFS, so new style dimensions don't need to be listed here by hand.
  for (const key of Object.keys(def)) {
    if (key.startsWith('default') && !['defaultWidth', 'defaultHeight', 'defaultDepth'].includes(key)) {
      const field = key.slice(7)
      piece[field.charAt(0).toLowerCase() + field.slice(1)] = def[key]
    }
  }
  if (type === 'sofa') piece.upholstery = DEFAULT_UPHOLSTERY
  return piece
}

function NumInput({ label, value, min, max, step = 0.25, onChange, unit = 'ft' }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 11, color: THEME.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={e => onChange(Math.min(max, Math.max(min, Number(e.target.value))))}
          style={{
            flex: 1,
            background: THEME.surface,
            border: `1px solid ${THEME.border}`,
            borderRadius: 8,
            color: THEME.text,
            padding: '7px 8px',
            fontSize: 14,
          }}
        />
        <span style={{ fontSize: 11, color: THEME.textMuted, minWidth: 16 }}>{unit}</span>
      </div>
    </label>
  )
}

function SelectInput({ label, value, options, onChange }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 11, color: THEME.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          background: THEME.surface, border: `1px solid ${THEME.border}`,
          borderRadius: 8, color: THEME.text,
          padding: '7px 8px', fontSize: 13, cursor: 'pointer',
        }}
      >
        {options.map(([key, optLabel]) => (
          <option key={key} value={key}>{optLabel}</option>
        ))}
      </select>
    </label>
  )
}

function CheckboxInput({ label, checked, onChange }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span style={{ fontSize: 13, color: THEME.text }}>{label}</span>
    </label>
  )
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 700, color: THEME.accent,
      textTransform: 'uppercase', letterSpacing: '0.08em',
      marginBottom: 12, paddingBottom: 6, borderBottom: `1px solid ${THEME.border}`,
    }}>
      {children}
    </div>
  )
}

function EditPanel({ piece, onChange, onDelete }) {
  const def = PIECE_DEFS[piece.type]
  const price = estimatePiecePrice(piece)
  const activeStyleFields = STYLE_FIELDS.filter(f => def[f.optionsKey])

  return (
    <div>
      <SectionLabel>{def.label}</SectionLabel>
      <div style={{ fontSize: 13, color: THEME.textMuted, marginBottom: 14 }}>
        Est. price: <strong style={{ color: THEME.success }}>{formatUSD(price)}</strong>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 18 }}>
        <NumInput label="Width"  value={piece.width}  min={def.minWidth}  max={def.maxWidth}
          onChange={v => onChange({ width: v })} />
        <NumInput label="Height" value={piece.height} min={def.minHeight} max={def.maxHeight}
          onChange={v => onChange({ height: v })} />
        <NumInput label="Depth"  value={piece.depth}  min={def.minDepth}  max={def.maxDepth}
          onChange={v => onChange({ depth: v })} />
      </div>

      {activeStyleFields.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: THEME.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
            Style
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {activeStyleFields.map(f => (
              <SelectInput
                key={f.field}
                label={f.label}
                value={piece[f.field]}
                options={def[f.optionsKey].map(opt => [opt, f.labels[opt] ?? opt])}
                onChange={v => onChange({ [f.field]: v })}
              />
            ))}
            {def.defaultHasFootrest !== undefined && (
              <CheckboxInput
                label="Footrest bar"
                checked={!!piece.hasFootrest}
                onChange={v => onChange({ hasFootrest: v })}
              />
            )}
          </div>
        </div>
      )}

      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: THEME.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
          Materials
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <SelectInput
            label={piece.type === 'sofa' ? 'Frame / Legs' : 'Material'}
            value={piece.material}
            options={Object.entries(MATERIALS).map(([key, m]) => [key, m.label])}
            onChange={v => onChange({ material: v })}
          />
          {piece.type === 'sofa' && (
            <SelectInput
              label="Upholstery"
              value={piece.upholstery}
              options={Object.entries(UPHOLSTERY_MATERIALS).map(([key, m]) => [key, m.label])}
              onChange={v => onChange({ upholstery: v })}
            />
          )}
        </div>
      </div>

      <button
        onClick={onDelete}
        style={{
          width: '100%', padding: '8px 12px',
          background: 'transparent', border: `1px solid ${THEME.border}`,
          borderRadius: 8, color: THEME.danger, fontSize: 13, cursor: 'pointer',
        }}
      >
        Remove piece
      </button>
    </div>
  )
}

function Sidebar({ room, setRoom, pieces, selectedId, setSelectedId, updatePiece, removePiece, addPiece }) {
  const selected = pieces.find(p => p.id === selectedId)
  const total = estimateTotalPrice(pieces)

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, bottom: 0, width: SIDEBAR_W,
      zIndex: 10, background: 'rgba(255,255,255,0.97)',
      borderRight: `1px solid ${THEME.border}`,
      boxShadow: '2px 0 16px rgba(33,28,22,0.05)',
      display: 'flex', flexDirection: 'column', padding: '18px',
      overflowY: 'auto',
    }}>
      <div style={{ fontWeight: 700, fontSize: 15, color: THEME.text, marginBottom: 16 }}>
        Furniture Configurator
      </div>

      {/* Running price estimate */}
      <div style={{
        marginBottom: 24, padding: '14px 16px',
        background: THEME.successSoft, border: `1px solid rgba(31,157,110,0.3)`,
        borderRadius: 12,
      }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: THEME.success, lineHeight: 1.1 }}>
          {formatUSD(total)}
        </div>
        <div style={{ fontSize: 11, color: THEME.textMuted, marginTop: 2 }}>
          Estimated total · {pieces.length} piece{pieces.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <SectionLabel>Room</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <NumInput label="Width"       value={room.width}  min={6} max={40}
            onChange={v => setRoom(r => ({ ...r, width: v }))} />
          <NumInput label="Length"      value={room.length} min={6} max={60}
            onChange={v => setRoom(r => ({ ...r, length: v }))} />
          <NumInput label="Wall Height" value={room.height} min={7} max={14} step={0.25}
            onChange={v => setRoom(r => ({ ...r, height: v }))} />
        </div>
        <div style={{ marginTop: 8, fontSize: 11, color: THEME.textMuted }}>
          {room.width} × {room.length} ft · {room.height} ft ceiling
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <SectionLabel>Add Furniture</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            ['lower_cabinet', 'Lower Cabinet'],
            ['upper_cabinet', 'Upper Cabinet'],
            ['bar',           'Bar'],
            ['table',         'Table'],
            ['sofa',          'Sofa'],
            ['shelving',      'Shelving'],
          ].map(([type, label]) => (
            <button
              key={type}
              onClick={() => addPiece(type)}
              style={{
                width: '100%', padding: '8px 12px',
                background: THEME.accentSoft, border: `1px solid ${THEME.accent}33`,
                borderRadius: 8, color: THEME.accentHover, fontSize: 13, fontWeight: 500,
                cursor: 'pointer', textAlign: 'left',
              }}
            >
              + {label}
            </button>
          ))}
        </div>
      </div>

      {pieces.length > 0 && !selected && (
        <div style={{ fontSize: 11, color: THEME.textMuted }}>
          {pieces.length} piece{pieces.length !== 1 ? 's' : ''} in room · click to select
        </div>
      )}

      {selected && (
        <div style={{ borderTop: `1px solid ${THEME.border}`, paddingTop: 16 }}>
          <EditPanel
            piece={selected}
            onChange={updates => updatePiece(selected.id, updates)}
            onDelete={() => { removePiece(selected.id); setSelectedId(null) }}
          />
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
          />
        </Canvas>
      </div>
    </div>
  )
}
