import { MATERIALS } from '../../constants'

const CT_H = 0.1    // counter top thickness (~1.2")
const GAP  = 0.022

export default function Bar({ width, height, depth, material, selected }) {
  const mat = MATERIALS[material] || MATERIALS.solid_oak

  // Body occupies back 70% of depth; counter overhangs the front 30%
  const overhang = Math.min(0.9, depth * 0.32)
  const bodyD    = depth - overhang
  const bodyH    = height - CT_H
  const bodyZ    = -overhang / 2  // body center shifted back

  // Two doors on the front face of the body
  const numDoors = width <= 2 ? 1 : 2
  const dW  = (width - GAP * (numDoors + 1)) / numDoors
  const dH  = bodyH - 0.35 - GAP * 2   // 0.35 ft toe-kick-equivalent space
  const dY  = 0.35 + GAP + dH / 2
  const dZ  = bodyZ + bodyD / 2 + 0.009 // front face of body

  // Footrest bar position (customer-side front, near floor)
  const footZ = depth / 2 - 0.08
  const footY = 0.58  // ~7 inches from floor

  return (
    <group>
      {/* Bar body / cabinet */}
      <mesh position={[0, bodyH / 2, bodyZ]} castShadow receiveShadow>
        <boxGeometry args={[width, bodyH, bodyD]} />
        <meshStandardMaterial color={mat.color} roughness={mat.roughness} />
      </mesh>

      {/* Counter top — full depth, slight overhang all sides */}
      <mesh position={[0, bodyH + CT_H / 2, 0]} castShadow>
        <boxGeometry args={[width + 0.06, CT_H, depth + 0.06]} />
        <meshStandardMaterial color={mat.color} roughness={0.3} metalness={0.04} />
      </mesh>

      {/* Toe kick strip on body front */}
      <mesh position={[0, 0.175, dZ]}>
        <planeGeometry args={[width, 0.35]} />
        <meshBasicMaterial color="#0d0d0d" />
      </mesh>

      {/* Cabinet doors */}
      {Array.from({ length: numDoors }).map((_, i) => {
        const dx = -width / 2 + GAP + dW / 2 + i * (dW + GAP)
        return (
          <group key={i}>
            <mesh position={[dx, dY, dZ]} castShadow>
              <boxGeometry args={[dW, dH, 0.02]} />
              <meshStandardMaterial color={mat.color} roughness={Math.max(0.3, mat.roughness - 0.12)} />
            </mesh>
            <mesh position={[dx, dY, dZ + 0.011]}>
              <boxGeometry args={[dW - 0.07, dH - 0.07, 0.006]} />
              <meshStandardMaterial color={mat.color} roughness={mat.roughness + 0.08} />
            </mesh>
            <mesh position={[dx, dY - dH * 0.28, dZ + 0.027]}>
              <boxGeometry args={[dW * 0.4, 0.013, 0.013]} />
              <meshStandardMaterial color="#8b9aaa" metalness={0.75} roughness={0.25} />
            </mesh>
          </group>
        )
      })}

      {/* Footrest bar (customer-side) — stainless rod */}
      <mesh position={[0, footY, footZ]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.022, 0.022, width - 0.15, 10]} />
        <meshStandardMaterial color="#aab4bd" metalness={0.85} roughness={0.2} />
      </mesh>

      {selected && (
        <mesh position={[0, height / 2, 0]}>
          <boxGeometry args={[width + 0.06, height + 0.06, depth + 0.06]} />
          <meshBasicMaterial color="#6366f1" wireframe />
        </mesh>
      )}
    </group>
  )
}
