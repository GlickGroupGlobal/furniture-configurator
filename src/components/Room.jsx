import { useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { getWoodBaseTexture, useTiledTexture } from '../textures'

const FLOOR = '#c8b89a'
const WALL = '#ede8e0'
const WALL_EDGE = '#b0a898'
const FADE_SPEED = 6 // opacity units per second

// One wall plane that fades out when its inward normal points away from the
// camera (i.e. the camera is behind it and it would block the view).
function Wall({ position, rotation, inwardNormal, size }) {
  const matRef = useRef()
  const normal = useRef(new THREE.Vector3(...inwardNormal)).current
  const toCamera = useRef(new THREE.Vector3()).current

  useFrame((state, delta) => {
    if (!matRef.current) return
    toCamera.copy(state.camera.position).sub(new THREE.Vector3(...position))
    const facing = normal.dot(toCamera) > 0    // camera is on the room side
    const target = facing ? 1 : 0.08
    const m = matRef.current
    m.opacity = THREE.MathUtils.clamp(
      m.opacity + Math.sign(target - m.opacity) * FADE_SPEED * delta,
      Math.min(target, m.opacity), Math.max(target, m.opacity)
    )
  })

  return (
    <mesh position={position} rotation={rotation} receiveShadow>
      <planeGeometry args={size} />
      <meshStandardMaterial
        ref={matRef}
        color={WALL}
        roughness={0.9}
        transparent
        opacity={1}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  )
}

export default function Room({ width, length, height }) {
  const floorBase = getWoodBaseTexture(FLOOR)
  const floorMap = useTiledTexture(floorBase, Math.max(2, width / 2), Math.max(2, length / 2))

  return (
    <group>
      {/* Floor — extra segments avoid a visible diagonal seam under the textured material */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[width, length, 8, 8]} />
        <meshStandardMaterial map={floorMap} color={FLOOR} roughness={0.75} />
      </mesh>

      {/* Walls — each fades when it would block the camera's view into the room */}
      <Wall
        position={[0, height / 2, -length / 2]}
        rotation={[0, 0, 0]}
        inwardNormal={[0, 0, 1]}
        size={[width, height]}
      />
      <Wall
        position={[0, height / 2, length / 2]}
        rotation={[0, Math.PI, 0]}
        inwardNormal={[0, 0, -1]}
        size={[width, height]}
      />
      <Wall
        position={[-width / 2, height / 2, 0]}
        rotation={[0, Math.PI / 2, 0]}
        inwardNormal={[1, 0, 0]}
        size={[length, height]}
      />
      <Wall
        position={[width / 2, height / 2, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        inwardNormal={[-1, 0, 0]}
        size={[length, height]}
      />

      {/* Floor border lines */}
      <lineSegments position={[0, 0.01, 0]}>
        <edgesGeometry args={[new THREE.PlaneGeometry(width, length)]} />
        <lineBasicMaterial color={WALL_EDGE} />
      </lineSegments>
    </group>
  )
}
