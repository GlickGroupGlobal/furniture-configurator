import * as THREE from 'three'
import { getWoodBaseTexture, useTiledTexture } from '../textures'

const FLOOR = '#c8b89a'
const WALL = '#ede8e0'
const WALL_EDGE = '#b0a898'

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
