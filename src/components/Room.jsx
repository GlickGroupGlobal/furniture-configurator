import * as THREE from 'three'

const FLOOR = '#c8b89a'
const WALL = '#ede8e0'
const WALL_EDGE = '#b0a898'

export default function Room({ width, length, height }) {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[width, length]} />
        <meshStandardMaterial color={FLOOR} roughness={0.8} />
      </mesh>

      {/* Back wall — z = -length/2, faces into room (+z) */}
      <mesh position={[0, height / 2, -length / 2]} receiveShadow castShadow>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color={WALL} roughness={0.9} side={THREE.FrontSide} />
      </mesh>

      {/* Left wall — x = -width/2, faces into room (+x) */}
      <mesh position={[-width / 2, height / 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow castShadow>
        <planeGeometry args={[length, height]} />
        <meshStandardMaterial color={WALL} roughness={0.9} side={THREE.FrontSide} />
      </mesh>

      {/* Right wall — x = +width/2, faces into room (-x) */}
      <mesh position={[width / 2, height / 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow castShadow>
        <planeGeometry args={[length, height]} />
        <meshStandardMaterial color={WALL} roughness={0.9} side={THREE.FrontSide} />
      </mesh>

      {/* Floor border lines */}
      <lineSegments position={[0, 0.01, 0]}>
        <edgesGeometry args={[new THREE.PlaneGeometry(width, length)]} />
        <lineBasicMaterial color={WALL_EDGE} />
      </lineSegments>
    </group>
  )
}
