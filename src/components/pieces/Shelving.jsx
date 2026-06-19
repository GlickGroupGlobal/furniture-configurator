import { MATERIALS } from '../../constants'

const PT = 0.05  // panel thickness ~0.6"

export default function Shelving({ width, height, depth, material, selected }) {
  const mat = MATERIALS[material] || MATERIALS.solid_oak

  const numShelves = Math.max(3, Math.round(height / 1.4))
  const shelfSpacing = height / numShelves
  // intermediate shelves (not top/bottom)
  const midShelves = Array.from({ length: numShelves - 1 }, (_, i) => shelfSpacing * (i + 1))

  return (
    <group>
      {/* Left side panel */}
      <mesh position={[-width / 2 + PT / 2, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[PT, height, depth]} />
        <meshStandardMaterial color={mat.color} roughness={mat.roughness} />
      </mesh>

      {/* Right side panel */}
      <mesh position={[width / 2 - PT / 2, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[PT, height, depth]} />
        <meshStandardMaterial color={mat.color} roughness={mat.roughness} />
      </mesh>

      {/* Top panel */}
      <mesh position={[0, height - PT / 2, 0]} castShadow>
        <boxGeometry args={[width, PT, depth]} />
        <meshStandardMaterial color={mat.color} roughness={mat.roughness} />
      </mesh>

      {/* Bottom panel */}
      <mesh position={[0, PT / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, PT, depth]} />
        <meshStandardMaterial color={mat.color} roughness={mat.roughness} />
      </mesh>

      {/* Back panel (thin) */}
      <mesh position={[0, height / 2, -depth / 2 + 0.018]}>
        <boxGeometry args={[width - PT * 2, height, 0.02]} />
        <meshStandardMaterial color={mat.color} roughness={mat.roughness + 0.1} />
      </mesh>

      {/* Intermediate shelves */}
      {midShelves.map((sy, i) => (
        <mesh key={i} position={[0, sy, 0]} castShadow>
          <boxGeometry args={[width - PT * 2, PT, depth - 0.04]} />
          <meshStandardMaterial color={mat.color} roughness={mat.roughness - 0.05} />
        </mesh>
      ))}

      {selected && (
        <mesh position={[0, height / 2, 0]}>
          <boxGeometry args={[width + 0.06, height + 0.06, depth + 0.06]} />
          <meshBasicMaterial color="#6366f1" wireframe />
        </mesh>
      )}
    </group>
  )
}
