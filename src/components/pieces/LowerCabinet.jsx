import { MATERIALS } from '../../constants'
import { getWoodBaseTexture, useTiledTexture } from '../../textures'
import SelectionOutline from './SelectionOutline'

const TOE_H = 0.292   // 3.5" toe kick height
const CT_H  = 0.0625  // 0.75" countertop thickness
const GAP   = 0.022   // gap around door/drawer panels
const PT    = 0.05    // carcass panel thickness (open style)

function Handle({ style, dX, dY, dZ, dW, dH, side = 1 }) {
  if (style === 'none') {
    return (
      <mesh position={[dX, dY + dH * 0.42, dZ + 0.006]}>
        <boxGeometry args={[dW * 0.5, 0.012, 0.01]} />
        <meshStandardMaterial color="#1a1a1a" transparent opacity={0.4} roughness={0.9} />
      </mesh>
    )
  }
  if (style === 'knob') {
    return (
      <mesh position={[dX + side * dW * 0.32, dY - dH * 0.28, dZ + 0.03]} castShadow>
        <sphereGeometry args={[0.018, 12, 12]} />
        <meshStandardMaterial color="#8b9aaa" metalness={0.8} roughness={0.2} />
      </mesh>
    )
  }
  return (
    <mesh position={[dX, dY - dH * 0.28, dZ + 0.027]}>
      <boxGeometry args={[dW * 0.42, 0.013, 0.013]} />
      <meshStandardMaterial color="#8b9aaa" metalness={0.75} roughness={0.25} />
    </mesh>
  )
}

export default function LowerCabinet({
  width, height, depth, material, selected,
  doorStyle = 'paneled', handleStyle = 'bar',
}) {
  const mat = MATERIALS[material] || MATERIALS.solid_oak
  const woodBase = getWoodBaseTexture(mat.color)
  const bodyMap  = useTiledTexture(woodBase, width * 1.3, height * 1.3)
  const doorMap  = useTiledTexture(woodBase, width * 1.3, height * 1.3)

  const bodyH = height - CT_H
  const dZ = depth / 2 + 0.009

  const showDoor = doorStyle !== 'open'
  const numDoors = doorStyle === 'drawers' ? 1 : (width <= 1.5 ? 1 : 2)
  const dW = (width - GAP * (numDoors + 1)) / numDoors
  const dH = bodyH - TOE_H - GAP * 2
  const dY = TOE_H + GAP + dH / 2

  const numDrawers = 3
  const drawerGap = 0.03
  const drawerH = (dH - drawerGap * (numDrawers - 1)) / numDrawers

  return (
    <group>
      {/* Cabinet body */}
      <mesh position={[0, bodyH / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, bodyH, depth]} />
        <meshStandardMaterial map={bodyMap} color={mat.color} roughness={mat.roughness} />
      </mesh>

      {/* Countertop — slight front overhang */}
      <mesh position={[0, bodyH + CT_H / 2, 0.02]} castShadow>
        <boxGeometry args={[width + 0.05, CT_H, depth + 0.04]} />
        <meshStandardMaterial color={mat.color} roughness={0.3} metalness={0.06} />
      </mesh>

      {/* Toe kick — dark strip at front bottom */}
      <mesh position={[0, TOE_H / 2, depth / 2 + 0.001]}>
        <planeGeometry args={[width, TOE_H]} />
        <meshBasicMaterial color="#0d0d0d" />
      </mesh>

      {!showDoor && (
        <>
          {/* Open front: interior shelves visible behind the carcass opening */}
          <mesh position={[0, TOE_H + GAP + dH * 0.34, 0]} castShadow>
            <boxGeometry args={[width - PT * 2, PT * 0.7, depth - 0.06]} />
            <meshStandardMaterial color={mat.color} roughness={mat.roughness - 0.05} />
          </mesh>
          <mesh position={[0, TOE_H + GAP + dH * 0.68, 0]} castShadow>
            <boxGeometry args={[width - PT * 2, PT * 0.7, depth - 0.06]} />
            <meshStandardMaterial color={mat.color} roughness={mat.roughness - 0.05} />
          </mesh>
        </>
      )}

      {doorStyle === 'drawers' && Array.from({ length: numDrawers }).map((_, i) => {
        const fDY = TOE_H + GAP + drawerH / 2 + i * (drawerH + drawerGap)
        return (
          <group key={i}>
            <mesh position={[0, fDY, dZ]} castShadow>
              <boxGeometry args={[width - GAP * 2, drawerH, 0.02]} />
              <meshStandardMaterial map={doorMap} color={mat.color} roughness={Math.max(0.3, mat.roughness - 0.12)} />
            </mesh>
            <Handle style={handleStyle} dX={0} dY={fDY} dZ={dZ} dW={width - GAP * 2} dH={drawerH} side={1} />
          </group>
        )
      })}

      {(doorStyle === 'paneled' || doorStyle === 'slab') && Array.from({ length: numDoors }).map((_, i) => {
        const dX = -width / 2 + GAP + dW / 2 + i * (dW + GAP)
        const side = i % 2 === 0 ? 1 : -1
        return (
          <group key={i}>
            {/* Door slab */}
            <mesh position={[dX, dY, dZ]} castShadow>
              <boxGeometry args={[dW, dH, 0.02]} />
              <meshStandardMaterial map={doorMap} color={mat.color} roughness={Math.max(0.3, mat.roughness - 0.12)} />
            </mesh>
            {/* Recessed panel inset — paneled style only */}
            {doorStyle === 'paneled' && (
              <mesh position={[dX, dY, dZ + 0.011]}>
                <boxGeometry args={[dW - 0.07, dH - 0.07, 0.006]} />
                <meshStandardMaterial color={mat.color} roughness={mat.roughness + 0.08} />
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
