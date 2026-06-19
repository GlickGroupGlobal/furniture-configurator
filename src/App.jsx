import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'

function Scene() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 20, 10]} intensity={0.8} castShadow />

      {/* Infinite grid on the floor plane */}
      <Grid
        args={[100, 100]}
        cellSize={0.5}
        cellThickness={0.5}
        cellColor="#4b5563"
        sectionSize={3}
        sectionThickness={1}
        sectionColor="#6b7280"
        fadeDistance={40}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid
        position={[0, 0, 0]}
      />

      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, 0, 0]}
      />
    </>
  )
}

export default function App() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Header */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        padding: '12px 20px',
        background: 'rgba(17,24,39,0.85)',
        backdropFilter: 'blur(6px)',
        borderBottom: '1px solid #374151',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <span style={{ fontWeight: 600, fontSize: '16px', color: '#f9fafb' }}>
          Furniture Configurator
        </span>
        <span style={{ fontSize: '13px', color: '#6b7280' }}>
          Step 1 — scene scaffold
        </span>
      </div>

      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ position: [6, 5, 8], fov: 50 }}
        style={{ width: '100%', height: '100%' }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={['#111827']} />
        <Scene />
      </Canvas>
    </div>
  )
}
