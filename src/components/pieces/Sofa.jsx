import { MATERIALS, UPHOLSTERY_MATERIALS, DEFAULT_UPHOLSTERY } from '../../constants'
import { getFabricBaseTexture, useTiledTexture } from '../../textures'
import SelectionOutline from './SelectionOutline'

const SEAT_H    = 1.5    // seat platform height ~18"
const BACK_D    = 0.42   // back cushion depth
const ARM_W     = 0.3    // arm width
const CUSHION_H = 0.22   // seat cushion thickness
const C_GAP     = 0.028  // gap between cushions
const FOOT_H    = 0.12   // exposed wood foot height

function Arm({ style, x, armH, depth, mat }) {
  if (style === 'none') return null
  if (style === 'rolled') {
    return (
      <group position={[x, 0, 0]}>
        <mesh position={[0, armH * 0.4, 0]} castShadow>
          <boxGeometry args={[ARM_W, armH * 0.8, depth]} />
          <meshStandardMaterial color={mat.color} roughness={mat.roughness + 0.05} />
        </mesh>
        <mesh position={[0, armH * 0.8, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[ARM_W / 2, ARM_W / 2, depth, 16]} />
          <meshStandardMaterial color={mat.color} roughness={mat.roughness + 0.05} />
        </mesh>
      </group>
    )
  }
  // 'track' (default): simple thin flat arm
  return (
    <mesh position={[x, armH / 2, 0]} castShadow>
      <boxGeometry args={[ARM_W, armH, depth]} />
      <meshStandardMaterial color={mat.color} roughness={mat.roughness + 0.05} />
    </mesh>
  )
}

export default function Sofa({
  width, height, depth, material, selected,
  armStyle = 'track', backStyle = 'cushion-back',
  upholstery = DEFAULT_UPHOLSTERY,
}) {
  const frameMat = MATERIALS[material] || MATERIALS.solid_oak
  const uphMat = UPHOLSTERY_MATERIALS[upholstery] || UPHOLSTERY_MATERIALS[DEFAULT_UPHOLSTERY]
  const col = uphMat.color

  const fabricBase = getFabricBaseTexture(col)
  const seatMap = useTiledTexture(fabricBase, width * 2, depth * 2)
  const backMap = useTiledTexture(fabricBase, width * 2, height * 1.5)

  const armW = armStyle === 'none' ? 0 : ARM_W
  const backH   = height - SEAT_H
  const armH    = height * 0.88
  const innerW  = width - armW * 2

  const numCushions = Math.max(2, Math.round(innerW / 2.3))
  const cW = (innerW - C_GAP * (numCushions - 1)) / numCushions
  const cD = depth - BACK_D - 0.07
  const cZ = -depth / 2 + BACK_D + cD / 2 + 0.035

  return (
    <group>
      {/* Exposed wood feet */}
      {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([sx, sz]) => (
        <mesh key={`${sx}${sz}`} position={[sx * (width / 2 - 0.25), FOOT_H / 2, sz * (depth / 2 - 0.25)]} castShadow>
          <cylinderGeometry args={[0.035, 0.028, FOOT_H, 10]} />
          <meshStandardMaterial color={frameMat.color} roughness={frameMat.roughness} />
        </mesh>
      ))}

      {/* Seat platform / base */}
      <mesh position={[0, FOOT_H + (SEAT_H - FOOT_H) / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, SEAT_H - FOOT_H, depth]} />
        <meshStandardMaterial map={seatMap} color={col} roughness={uphMat.roughness} />
      </mesh>

      {/* Back rest */}
      <mesh position={[0, SEAT_H + backH / 2, -depth / 2 + BACK_D / 2]} castShadow>
        <boxGeometry args={[width, backH, BACK_D]} />
        <meshStandardMaterial map={backMap} color={col} roughness={0.9} />
      </mesh>

      <Arm style={armStyle} x={-width / 2 + ARM_W / 2} armH={armH} depth={depth} mat={frameMat} />
      <Arm style={armStyle} x={width / 2 - ARM_W / 2} armH={armH} depth={depth} mat={frameMat} />

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

      {/* Back cushions — only for the cushion-back style */}
      {backStyle === 'cushion-back' && Array.from({ length: numCushions }).map((_, i) => {
        const cx = -innerW / 2 + cW / 2 + i * (cW + C_GAP)
        return (
          <mesh key={`bc${i}`} position={[cx, SEAT_H + backH * 0.45, -depth / 2 + BACK_D + 0.045]} castShadow>
            <boxGeometry args={[cW, backH * 0.75, 0.18]} />
            <meshStandardMaterial color={col} roughness={0.93} />
          </mesh>
        )
      })}

      {selected && <SelectionOutline width={width} height={height} depth={depth} />}
    </group>
  )
}
