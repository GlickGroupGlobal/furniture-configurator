import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import Room from './components/Room'

const SIDEBAR_W = 260

function NumInput({ label, value, min, max, step = 0.5, onChange }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 12, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
            width: '100%',
          }}
        />
        <span style={{ fontSize: 12, color: '#6b7280', minWidth: 20 }}>ft</span>
      </div>
    </label>
  )
}

function Sidebar({ room, setRoom }) {
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      bottom: 0,
      width: SIDEBAR_W,
      zIndex: 10,
      background: 'rgba(17,24,39,0.95)',
      borderRight: '1px solid #374151',
      display: 'flex',
      flexDirection: 'column',
      padding: '16px 16px',
      gap: 0,
      overflowY: 'auto',
    }}>
      <div style={{ fontWeight: 600, fontSize: 15, color: '#f9fafb', marginBottom: 20 }}>
        Furniture Configurator
      </div>

      {/* Room section */}
      <div style={{ marginBottom: 24 }}>
        <div style={{
          fontSize: 11,
          fontWeight: 600,
          color: '#6366f1',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: 12,
          paddingBottom: 6,
          borderBottom: '1px solid #1f2937',
        }}>
          Room
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <NumInput
            label="Width"
            value={room.width}
            min={6} max={40}
            onChange={v => setRoom(r => ({ ...r, width: v }))}
          />
          <NumInput
            label="Length"
            value={room.length}
            min={6} max={60}
            onChange={v => setRoom(r => ({ ...r, length: v }))}
          />
          <NumInput
            label="Wall Height"
            value={room.height}
            min={7} max={14} step={0.25}
            onChange={v => setRoom(r => ({ ...r, height: v }))}
          />
        </div>
        <div style={{
          marginTop: 10,
          fontSize: 11,
          color: '#4b5563',
        }}>
          {room.width} × {room.length} ft · {room.height} ft ceiling
        </div>
      </div>
    </div>
  )
}

function Scene({ room }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[room.width * 0.5, room.height * 2, room.length * 0.5]}
        intensity={0.9}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight position={[-5, 8, -5]} intensity={0.3} />

      <Grid
        args={[100, 100]}
        cellSize={1}
        cellThickness={0.4}
        cellColor="#374151"
        sectionSize={5}
        sectionThickness={0.8}
        sectionColor="#4b5563"
        fadeDistance={50}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid
        position={[0, -0.001, 0]}
      />

      <Room width={room.width} length={room.length} height={room.height} />

      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        maxPolarAngle={Math.PI / 2.05}
        target={[0, room.height * 0.3, 0]}
      />
    </>
  )
}

export default function App() {
  const [room, setRoom] = useState({ width: 12, length: 14, height: 9 })

  const camDist = Math.max(room.width, room.length) * 1.1
  const camPos = [camDist * 0.7, camDist * 0.6, camDist * 0.8]

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Sidebar room={room} setRoom={setRoom} />

      <div style={{ position: 'absolute', top: 0, left: SIDEBAR_W, right: 0, bottom: 0 }}>
        <Canvas
          shadows
          camera={{ position: camPos, fov: 50 }}
          style={{ width: '100%', height: '100%' }}
          gl={{ antialias: true }}
        >
          <color attach="background" args={['#111827']} />
          <Scene room={room} />
        </Canvas>
      </div>
    </div>
  )
}
