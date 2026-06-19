import { MATERIALS } from '../../constants'

const CT_H = 0.05   // top/bottom panel thickness
const GAP  = 0.022  // gap around door panels

export default function UpperCabinet({ width, height, depth, material, selected }) {
  const mat = MATERIALS[material] || MATERIALS.solid_oak
  const innerH = height - CT_H * 2
  const numDoors = width <= 1.5 ? 1 : 2
  const dW = (width - GAP * (numDoors + 1)) / numDoors
  const dH = innerH - GAP * 2
  const dZ = depth / 2 + 0.008

  return (
    <group>
      {/* Cabinet body */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={mat.color} roughness={mat.roughness} />
      </mesh>

      {/* Top cap (slightly lighter) */}
      <mesh position={[0, height - CT_H / 2, 0]}>
        <boxGeometry args={[width + 0.02, CT_H, depth + 0.02]} />
        <meshStandardMaterial color={mat.color} roughness={0.4} />
      </mesh>

      {/* Door panels */}
      {Array.from({ length: numDoors }).map((_, i) => {
        const dX = -width / 2 + GAP + dW / 2 + i * (dW + GAP)
        const dY = CT_H + GAP + dH / 2
        return (
          <group key={i}>
            <mesh position={[dX, dY, dZ]} castShadow>
              <boxGeometry args={[dW, dH, 0.018]} />
              <meshStandardMaterial color={mat.color} roughness={Math.max(0.3, mat.roughness - 0.12)} />
            </mesh>
            {/* Inset panel */}
            <mesh position={[dX, dY, dZ + 0.01]}>
              <boxGeometry args={[dW - 0.07, dH - 0.07, 0.006]} />
              <meshStandardMaterial color={mat.color} roughness={mat.roughness + 0.08} />
            </mesh>
            {/* Handle — small knob centered */}
            <mesh position={[dX, dY - dH * 0.28, dZ + 0.026]}>
              <boxGeometry args={[dW * 0.35, 0.012, 0.012]} />
              <meshStandardMaterial color="#8b9aaa" metalness={0.75} roughness={0.25} />
            </mesh>
          </group>
        )
      })}

      {selected && (
        <mesh position={[0, height / 2, 0]}>
          <boxGeometry args={[width + 0.06, height + 0.06, depth + 0.06]} />
          <meshBasicMaterial color="#6366f1" wireframe />
        </mesh>
      )}
    </group>
  )
}
