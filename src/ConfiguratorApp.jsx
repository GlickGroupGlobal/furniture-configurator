import { useState, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import Scene from './components/Scene'
import { MATERIALS, PIECE_DEFS, DEFAULT_MATERIAL } from './constants'

const SIDEBAR_W = 280

let nextId = 1
function makePiece(type) {
  const def = PIECE_DEFS[type]
  return {
    id: `p${nextId++}`,
    type,
    x: 0, z: 0,
    elevation: def.elevation ?? 0,
    width: def.defaultWidth,
    height: def.defaultHeight,
    depth: def.defaultDepth,
    material: DEFAULT_MATERIAL,
  }
}

function NumInput({ label, value, min, max, step = 0.25, onChange, unit = 'ft' }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
            background: '#1f2937',
            border: '1px solid #374151',
            borderRadius: 6,
            color: '#f9fafb',
            padding: '6px 8px',
            fontSize: 14,
          }}
        />
        <span style={{ fontSize: 11, color: '#6b7280', minWidth: 16 }}>{unit}</span>
      </div>
    </label>
  )
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 600, color: '#6366f1',
      textTransform: 'uppercase', letterSpacing: '0.08em',
      marginBottom: 12, paddingBottom: 6, borderBottom: '1px solid #1f2937',
    }}>
      {children}
    </div>
  )
}

function EditPanel({ piece, onChange, onDelete }) {
  const def = PIECE_DEFS[piece.type]
  return (
    <div>
      <SectionLabel>{def.label}</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 14 }}>
        <NumInput label="Width"  value={piece.width}  min={def.minWidth}  max={def.maxWidth}
          onChange={v => onChange({ width: v })} />
        <NumInput label="Height" value={piece.height} min={def.minHeight} max={def.maxHeight}
          onChange={v => onChange({ height: v })} />
        <NumInput label="Depth"  value={piece.depth}  min={def.minDepth}  max={def.maxDepth}
          onChange={v => onChange({ depth: v })} />
        <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Material
          </span>
          <select
            value={piece.material}
            onChange={e => onChange({ material: e.target.value })}
            style={{
              background: '#1f2937', border: '1px solid #374151',
              borderRadius: 6, color: '#f9fafb',
              padding: '7px 8px', fontSize: 13, cursor: 'pointer',
            }}
          >
            {Object.entries(MATERIALS).map(([key, m]) => (
              <option key={key} value={key}>{m.label}</option>
            ))}
          </select>
        </label>
      </div>
      <button
        onClick={onDelete}
        style={{
          width: '100%', padding: '7px 12px',
          background: 'transparent', border: '1px solid #374151',
          borderRadius: 6, color: '#f87171', fontSize: 13, cursor: 'pointer',
        }}
      >
        Remove piece
      </button>
    </div>
  )
}

function Sidebar({ room, setRoom, pieces, selectedId, setSelectedId, updatePiece, removePiece, addPiece }) {
  const selected = pieces.find(p => p.id === selectedId)

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, bottom: 0, width: SIDEBAR_W,
      zIndex: 10, background: 'rgba(17,24,39,0.96)',
      borderRight: '1px solid #1f2937',
      display: 'flex', flexDirection: 'column', padding: '16px',
      overflowY: 'auto',
    }}>
      <div style={{ fontWeight: 600, fontSize: 15, color: '#f9fafb', marginBottom: 20 }}>
        Furniture Configurator
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
        <div style={{ marginTop: 8, fontSize: 11, color: '#4b5563' }}>
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
                width: '100%', padding: '7px 12px',
                background: '#1e1b4b', border: '1px solid #3730a3',
                borderRadius: 6, color: '#c7d2fe', fontSize: 13,
                cursor: 'pointer', textAlign: 'left',
              }}
            >
              + {label}
            </button>
          ))}
        </div>
      </div>

      {pieces.length > 0 && !selected && (
        <div style={{ fontSize: 11, color: '#4b5563' }}>
          {pieces.length} piece{pieces.length !== 1 ? 's' : ''} in room · click to select
        </div>
      )}

      {selected && (
        <div style={{ borderTop: '1px solid #1f2937', paddingTop: 16 }}>
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

export default function ConfiguratorApp() {
  const [room, setRoom] = useState({ width: 12, length: 14, height: 9 })
  const [pieces, setPieces] = useState([])
  const [selectedId, setSelectedId] = useState(null)

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

  const camDist = Math.max(room.width, room.length) * 1.1
  const camPos = [camDist * 0.7, camDist * 0.6, camDist * 0.8]

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', background: '#111827' }}>
      <Sidebar
        room={room} setRoom={setRoom}
        pieces={pieces} selectedId={selectedId} setSelectedId={setSelectedId}
        updatePiece={updatePiece} removePiece={removePiece} addPiece={addPiece}
      />
      <div style={{ position: 'absolute', top: 0, left: SIDEBAR_W, right: 0, bottom: 0 }}>
        <Canvas
          shadows
          camera={{ position: camPos, fov: 50 }}
          style={{ width: '100%', height: '100%' }}
          gl={{ antialias: true }}
        >
          <color attach="background" args={['#111827']} />
          <Scene
            room={room}
            pieces={pieces}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            updatePiece={updatePiece}
          />
        </Canvas>
      </div>
    </div>
  )
}
