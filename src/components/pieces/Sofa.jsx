import { MATERIALS } from '../../constants'

const SEAT_H    = 1.5    // seat platform height ~18"
const BACK_D    = 0.42   // back cushion depth
const ARM_W     = 0.3    // arm width
const CUSHION_H = 0.22   // seat cushion thickness
const C_GAP     = 0.028  // gap between cushions

export default function Sofa({ width, height, depth, material, selected }) {
  const mat  = MATERIALS[material] || MATERIALS.solid_oak
  const col  = mat.color

  const backH   = height - SEAT_H
  const armH    = height * 0.88
  const innerW  = width - ARM_W * 2

  const numCushions = Math.max(2, Math.round(innerW / 2.3))
  const cW = (innerW - C_GAP * (numCushions - 1)) / numCushions
  const cD = depth - BACK_D - 0.07
  // seat cushion center z: back face is at z=-depth/2, back is BACK_D thick,
  // seat area starts at z=-depth/2+BACK_D, ends at z=+depth/2
  const cZ = -depth / 2 + BACK_D + cD / 2 + 0.035

  return (
    <group>
      {/* Seat platform / base */}
      <mesh position={[0, SEAT_H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, SEAT_H, depth]} />
        <meshStandardMaterial color={col} roughness={mat.roughness + 0.12} />
      </mesh>

      {/* Back rest */}
      <mesh position={[0, SEAT_H + backH / 2, -depth / 2 + BACK_D / 2]} castShadow>
        <boxGeometry args={[width, backH, BACK_D]} />
        <meshStandardMaterial color={col} roughness={0.9} />
      </mesh>

      {/* Left arm */}
      <mesh position={[-width / 2 + ARM_W / 2, armH / 2, 0]} castShadow>
        <boxGeometry args={[ARM_W, armH, depth]} />
        <meshStandardMaterial color={col} roughness={mat.roughness + 0.05} />
      </mesh>

      {/* Right arm */}
      <mesh position={[width / 2 - ARM_W / 2, armH / 2, 0]} castShadow>
        <boxGeometry args={[ARM_W, armH, depth]} />
        <meshStandardMaterial color={col} roughness={mat.roughness + 0.05} />
      </mesh>

      {/* Seat cushions */}
      {Array.from({ length: numCushions }).map((_, i) => {
        const cx = -innerW / 2 + cW / 2 + i * (cW + C_GAP)
        return (
          <mesh key={`sc${i}`} position={[cx, SEAT_H + CUSHION_H / 2, cZ]} castShadow>
            <boxGeometry args={[cW, CUSHION_H, cD]} />
            <meshStandardMaterial color={col} roughness={0.95} />
          </mesh>
        )
      })}

      {/* Back cushions */}
      {Array.from({ length: numCushions }).map((_, i) => {
        const cx = -innerW / 2 + cW / 2 + i * (cW + C_GAP)
        return (
          <mesh key={`bc${i}`} position={[cx, SEAT_H + backH * 0.45, -depth / 2 + BACK_D + 0.045]} castShadow>
            <boxGeometry args={[cW, backH * 0.75, 0.18]} />
            <meshStandardMaterial color={col} roughness={0.93} />
          </mesh>
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
