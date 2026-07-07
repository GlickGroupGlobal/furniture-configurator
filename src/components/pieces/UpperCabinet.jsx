import { MATERIALS } from '../../constants'
import { getWoodBaseTexture, useTiledTexture } from '../../textures'
import SelectionOutline from './SelectionOutline'

const CT_H = 0.05   // top/bottom panel thickness
const GAP  = 0.022  // gap around door panels
const PT   = 0.05   // carcass panel thickness (open/glass style)

function Handle({ style, dX, dY, dZ, dW, dH, side = 1 }) {
  if (style === 'none') {
    return (
      <mesh position={[dX, dY + dH * 0.4, dZ + 0.005]}>
        <boxGeometry args={[dW * 0.45, 0.01, 0.008]} />
        <meshStandardMaterial color="#1a1a1a" transparent opacity={0.4} roughness={0.9} />
      </mesh>
    )
  }
  if (style === 'knob') {
    return (
      <mesh position={[dX + side * dW * 0.3, dY - dH * 0.28, dZ + 0.028]} castShadow>
        <sphereGeometry args={[0.015, 12, 12]} />
        <meshStandardMaterial color="#8b9aaa" metalness={0.8} roughness={0.2} />
      </mesh>
    )
  }
  return (
    <mesh position={[dX, dY - dH * 0.28, dZ + 0.026]}>
      <boxGeometry args={[dW * 0.35, 0.012, 0.012]} />
      <meshStandardMaterial color="#8b9aaa" metalness={0.75} roughness={0.25} />
    </mesh>
  )
}

export default function UpperCabinet({
  width, height, depth, material, selected,
  doorStyle = 'paneled', handleStyle = 'bar',
}) {
  const mat = MATERIALS[material] || MATERIALS.solid_oak
  const woodBase = getWoodBaseTexture(mat.color)
  const bodyMap = useTiledTexture(woodBase, width * 1.3, height * 1.3)
  const doorMap = useTiledTexture(woodBase, width * 1.3, height * 1.3)

  const innerH = height - CT_H * 2
  const showDoor = doorStyle !== 'open'
  const numDoors = width <= 1.5 ? 1 : 2
  const dW = (width - GAP * (numDoors + 1)) / numDoors
  const dH = innerH - GAP * 2
  const dZ = depth / 2 + 0.008

  return (
    <group>
      {/* Cabinet body */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial map={bodyMap} color={mat.color} roughness={mat.roughness} />
      </mesh>

      {/* Top cap (slightly lighter) */}
      <mesh position={[0, height - CT_H / 2, 0]}>
        <boxGeometry args={[width + 0.02, CT_H, depth + 0.02]} />
        <meshStandardMaterial color={mat.color} roughness={0.4} />
      </mesh>

      {!showDoor && (
        <mesh position={[0, CT_H + GAP + dH / 2, 0]} castShadow>
          <boxGeometry args={[width - PT * 2, PT * 0.7, depth - 0.06]} />
          <meshStandardMaterial color={mat.color} roughness={mat.roughness - 0.05} />
        </mesh>
      )}

      {showDoor && Array.from({ length: numDoors }).map((_, i) => {
        const dX = -width / 2 + GAP + dW / 2 + i * (dW + GAP)
        const dY = CT_H + GAP + dH / 2
        const side = i % 2 === 0 ? 1 : -1
        const isGlass = doorStyle === 'glass'
        return (
          <group key={i}>
            <mesh position={[dX, dY, dZ]} castShadow>
              <boxGeometry args={[dW, dH, 0.018]} />
              {isGlass ? (
                <meshPhysicalMaterial color={mat.color} roughness={0.15} transmission={0.55} thickness={0.3} />
              ) : (
                <meshStandardMaterial map={doorMap} color={mat.color} roughness={Math.max(0.3, mat.roughness - 0.12)} />
              )}
            </mesh>
            {/* Inset panel — paneled style only */}
            {doorStyle === 'paneled' && (
              <mesh position={[dX, dY, dZ + 0.01]}>
                <boxGeometry args={[dW - 0.07, dH - 0.07, 0.006]} />
                <meshStandardMaterial color={mat.color} roughness={mat.roughness + 0.08} />
              </mesh>
            )}
            {/* Glass pane inset — thin frame look */}
            {isGlass && (
              <mesh position={[dX, dY, dZ + 0.011]}>
                <boxGeometry args={[dW - 0.09, dH - 0.09, 0.004]} />
                <meshPhysicalMaterial color="#dfe9ee" roughness={0.05} transmission={0.85} thickness={0.1} />
              </mesh>
            )}
            <Handle style={handleStyle} dX={dX} dY={dY} dZ={dZ} dW={dW} dH={dH} side={side} />
          </group>
        )
      })}

      {selected && <SelectionOutline width={width} height={height} depth={depth} />}
    </group>
  )
}
