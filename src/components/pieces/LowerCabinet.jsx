import { MATERIALS } from '../../constants'

const TOE_H = 0.292   // 3.5" toe kick height
const CT_H  = 0.0625  // 0.75" countertop thickness
const GAP   = 0.022   // gap around door panels

export default function LowerCabinet({ width, height, depth, material, selected }) {
  const mat = MATERIALS[material] || MATERIALS.solid_oak
  const bodyH = height - CT_H
  const numDoors = width <= 1.5 ? 1 : 2
  const dW = (width - GAP * (numDoors + 1)) / numDoors
  const dH = bodyH - TOE_H - GAP * 2
  const dY = TOE_H + GAP + dH / 2
  const dZ = depth / 2 + 0.009

  return (
    <group>
      {/* Cabinet body */}
      <mesh position={[0, bodyH / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, bodyH, depth]} />
        <meshStandardMaterial color={mat.color} roughness={mat.roughness} />
      </mesh>

      {/* Countertop — slight front overhang */}
      <mesh position={[0, bodyH + CT_H / 2, 0.02]} castShadow>
        <boxGeometry args={[width + 0.05, CT_H, depth + 0.04]} />
        <meshStandardMaterial color={mat.color} roughness={0.35} metalness={0.04} />
      </mesh>

      {/* Toe kick — dark strip at front bottom */}
      <mesh position={[0, TOE_H / 2, depth / 2 + 0.001]}>
        <planeGeometry args={[width, TOE_H]} />
        <meshBasicMaterial color="#0d0d0d" />
      </mesh>

      {/* Door panels + inset detail + handle */}
      {Array.from({ length: numDoors }).map((_, i) => {
        const dX = -width / 2 + GAP + dW / 2 + i * (dW + GAP)
        return (
          <group key={i}>
            {/* Door slab */}
            <mesh position={[dX, dY, dZ]} castShadow>
              <boxGeometry args={[dW, dH, 0.02]} />
              <meshStandardMaterial color={mat.color} roughness={Math.max(0.3, mat.roughness - 0.12)} />
            </mesh>
            {/* Recessed panel inset */}
            <mesh position={[dX, dY, dZ + 0.011]}>
              <boxGeometry args={[dW - 0.07, dH - 0.07, 0.006]} />
              <meshStandardMaterial color={mat.color} roughness={mat.roughness + 0.08} />
            </mesh>
            {/* Bar handle */}
            <mesh position={[dX, dY - dH * 0.28, dZ + 0.027]}>
              <boxGeometry args={[dW * 0.42, 0.013, 0.013]} />
              <meshStandardMaterial color="#8b9aaa" metalness={0.75} roughness={0.25} />
            </mesh>
          </group>
        )
      })}

      {/* Selection wireframe */}
      {selected && (
        <mesh position={[0, height / 2, 0]}>
          <boxGeometry args={[width + 0.06, height + 0.06, depth + 0.06]} />
          <meshBasicMaterial color="#6366f1" wireframe />
        </mesh>
      )}
    </group>
  )
}
