import { PIECE_DEFS } from '../../constants'
import { DEFAULT_DOOR_PROFILE } from '../../constants'
import { getFinish, GLASS_TINTS, DEFAULT_GLASS_TINT } from '../../materials'
import { useFinishTexture } from '../../textures'
import SelectionOutline from './SelectionOutline'

// One cabinet architecture for lower/upper/tall/bar:
// carcass (open front by default) → optional fronts → handles → countertop.

const PT     = 0.06   // carcass panel thickness (~0.7")
const TOE_H  = 0.292  // 3.5" toe kick
const GAP    = 0.022  // reveal around fronts
const CT_H   = 0.1    // countertop thickness
const BACK_T = 0.025  // back panel thickness

function Handle({ style, x, y, z, frontW, frontH, side = 1 }) {
  if (style === 'none') {
    return (
      <mesh position={[x, y + frontH * 0.42, z + 0.006]}>
        <boxGeometry args={[frontW * 0.5, 0.012, 0.01]} />
        <meshStandardMaterial color="#1a1a1a" transparent opacity={0.35} roughness={0.9} />
      </mesh>
    )
  }
  if (style === 'knob') {
    return (
      <mesh position={[x + side * frontW * 0.32, y - frontH * 0.28, z + 0.03]} castShadow>
        <sphereGeometry args={[0.018, 12, 12]} />
        <meshStandardMaterial color="#8b9aaa" metalness={0.8} roughness={0.2} />
      </mesh>
    )
  }
  return (
    <mesh position={[x, y - frontH * 0.28, z + 0.027]}>
      <boxGeometry args={[frontW * 0.42, 0.013, 0.013]} />
      <meshStandardMaterial color="#8b9aaa" metalness={0.75} roughness={0.25} />
    </mesh>
  )
}

function DoorProfile({ profile, x, y, z, frontW, frontH, map }) {
  const rail = Math.min(0.08, frontW * 0.12, frontH * 0.08)
  const insetW = Math.max(0.08, frontW - rail * 2.4)
  const insetH = Math.max(0.08, frontH - rail * 2.4)
  const trimMat = <meshStandardMaterial map={map} roughness={0.5} />

  if (profile === 'bl22m13') {
    const count = Math.max(5, Math.floor(frontW / 0.18))
    return (
      <group>
        {Array.from({ length: count }).map((_, i) => {
          const lineX = x - frontW * 0.36 + (i / (count - 1)) * frontW * 0.72
          return (
            <mesh key={i} position={[lineX, y, z + 0.012]}>
              <boxGeometry args={[0.012, insetH, 0.008]} />
              {trimMat}
            </mesh>
          )
        })}
      </group>
    )
  }

  if (profile === 'bl5863') {
    const count = Math.max(4, Math.floor(frontW / 0.22))
    return (
      <group>
        {Array.from({ length: count }).map((_, i) => {
          const lineX = x - frontW * 0.32 + (i / (count - 1)) * frontW * 0.64
          return (
            <mesh key={i} position={[lineX, y, z + 0.012]}>
              <boxGeometry args={[0.018, insetH, 0.008]} />
              {trimMat}
            </mesh>
          )
        })}
      </group>
    )
  }

  const arch = profile === 'bl23m17' || profile === 'bl23m19'
  const raised = profile !== 'mx1801'

  return (
    <group>
      <mesh position={[x, y, z + 0.011]}>
        <boxGeometry args={[insetW, insetH, raised ? 0.008 : 0.004]} />
        <meshStandardMaterial map={map} roughness={raised ? 0.5 : 0.62} />
      </mesh>
      {arch && (
        <mesh position={[x, y + insetH * 0.23, z + 0.018]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[insetW * 0.28, 0.008, 8, 24, Math.PI]} />
          {trimMat}
        </mesh>
      )}
    </group>
  )
}

export default function Cabinet({
  type, width, height, depth, selected,
  bodyFamily, bodyFinish,
  frontStyle = 'none', doorProfile = DEFAULT_DOOR_PROFILE, frontFamily, frontFinish, glassTint = DEFAULT_GLASS_TINT,
  handleStyle = 'bar',
  countertop = false, countertopFamily, countertopFinish,
  hasFootrest = false,
}) {
  const def = PIECE_DEFS[type] ?? {}

  const body  = getFinish(bodyFamily, bodyFinish)
  const front = getFinish(frontFamily ?? bodyFamily, frontFinish ?? bodyFinish)
  const top   = getFinish(countertopFamily ?? bodyFamily, countertopFinish ?? bodyFinish)

  const bodyMap  = useFinishTexture(body,  Math.max(1, width), Math.max(1, height))
  const frontMap = useFinishTexture(front, Math.max(1, width), Math.max(1, height))
  const topMap   = useFinishTexture(top,   Math.max(1, width), Math.max(1, depth))

  const toeH = def.toeKick ? TOE_H : 0
  const ctH  = countertop ? CT_H : 0

  // Bar: body sits back, counter overhangs the front (customer side)
  const overhang = def.barOverhang ? Math.min(0.9, depth * 0.32) : 0
  const bodyD = depth - overhang
  const bodyZ = -overhang / 2
  const bodyH = height - ctH

  const innerW = width - PT * 2
  const innerH = bodyH - toeH - PT * 2
  const innerBottom = toeH + PT
  const frontZ = bodyZ + bodyD / 2

  // Interior shelves (visible through open/glass fronts)
  const numShelves = Math.max(1, Math.round(innerH / 1.25) - 1)
  const shelfYs = Array.from({ length: numShelves }, (_, i) =>
    innerBottom + (innerH / (numShelves + 1)) * (i + 1)
  )

  // Fronts
  const showFronts = frontStyle !== 'none'
  const isGlass    = frontStyle === 'glass'
  const isDrawers  = frontStyle === 'drawers'
  const numDoors   = width <= 1.5 ? 1 : 2
  const doorW = (width - GAP * (numDoors + 1)) / numDoors
  const doorH = bodyH - toeH - GAP * 2
  const doorY = toeH + GAP + doorH / 2
  const doorZ = frontZ + 0.011

  const numDrawers = Math.max(3, Math.round(doorH / 0.85))
  const drawerGap = 0.03
  const drawerH = (doorH - drawerGap * (numDrawers - 1)) / numDrawers

  const glass = GLASS_TINTS[glassTint] ?? GLASS_TINTS[DEFAULT_GLASS_TINT]

  const bodyMat = <meshStandardMaterial map={bodyMap} roughness={0.55} />

  return (
    <group>
      {/* ── Carcass ── */}
      {/* Left / right side panels */}
      <mesh position={[-width / 2 + PT / 2, toeH + (bodyH - toeH) / 2, bodyZ]} castShadow receiveShadow>
        <boxGeometry args={[PT, bodyH - toeH, bodyD]} />
        {bodyMat}
      </mesh>
      <mesh position={[width / 2 - PT / 2, toeH + (bodyH - toeH) / 2, bodyZ]} castShadow receiveShadow>
        <boxGeometry args={[PT, bodyH - toeH, bodyD]} />
        {bodyMat}
      </mesh>
      {/* Top / bottom panels */}
      <mesh position={[0, bodyH - PT / 2, bodyZ]} castShadow>
        <boxGeometry args={[innerW, PT, bodyD]} />
        {bodyMat}
      </mesh>
      <mesh position={[0, toeH + PT / 2, bodyZ]} receiveShadow>
        <boxGeometry args={[innerW, PT, bodyD]} />
        {bodyMat}
      </mesh>
      {/* Back panel */}
      <mesh position={[0, toeH + (bodyH - toeH) / 2, bodyZ - bodyD / 2 + BACK_T / 2]}>
        <boxGeometry args={[innerW, bodyH - toeH - PT * 2, BACK_T]} />
        <meshStandardMaterial map={bodyMap} roughness={0.65} />
      </mesh>
      {/* Interior shelves */}
      {shelfYs.map((y, i) => (
        <mesh key={i} position={[0, y, bodyZ]} castShadow>
          <boxGeometry args={[innerW, PT * 0.8, bodyD - 0.08]} />
          {bodyMat}
        </mesh>
      ))}

      {/* Toe kick */}
      {def.toeKick && (
        <mesh position={[0, toeH / 2, frontZ - 0.02]}>
          <boxGeometry args={[width - 0.06, toeH, 0.02]} />
          <meshStandardMaterial color="#141414" roughness={0.9} />
        </mesh>
      )}

      {/* ── Fronts ── */}
      {showFronts && !isDrawers && Array.from({ length: numDoors }).map((_, i) => {
        const x = -width / 2 + GAP + doorW / 2 + i * (doorW + GAP)
        const side = i % 2 === 0 ? 1 : -1
        return (
          <group key={i}>
            <mesh position={[x, doorY, doorZ]} castShadow>
              <boxGeometry args={[doorW, doorH, 0.02]} />
              {isGlass ? (
                <meshPhysicalMaterial
                  color={glass.color}
                  roughness={glass.roughness}
                  transmission={glass.transmission}
                  thickness={0.2}
                />
              ) : (
                <meshStandardMaterial map={frontMap} roughness={0.45} />
              )}
            </mesh>
            {!isGlass && (
              <DoorProfile
                profile={frontStyle === 'shaker' ? 'pf' : doorProfile}
                x={x}
                y={doorY}
                z={doorZ}
                frontW={doorW}
                frontH={doorH}
                map={frontMap}
              />
            )}
            <Handle style={handleStyle} x={x} y={doorY} z={doorZ} frontW={doorW} frontH={doorH} side={side} />
          </group>
        )
      })}

      {isDrawers && Array.from({ length: numDrawers }).map((_, i) => {
        const y = toeH + GAP + drawerH / 2 + i * (drawerH + drawerGap)
        return (
          <group key={i}>
            <mesh position={[0, y, doorZ]} castShadow>
              <boxGeometry args={[width - GAP * 2, drawerH, 0.02]} />
              <meshStandardMaterial map={frontMap} roughness={0.45} />
            </mesh>
            <Handle style={handleStyle} x={0} y={y + drawerH * 0.14} z={doorZ} frontW={width - GAP * 2} frontH={drawerH} />
          </group>
        )
      })}

      {/* ── Countertop ── */}
      {countertop && (
        <mesh position={[0, bodyH + ctH / 2, 0]} castShadow>
          <boxGeometry args={[width + 0.06, CT_H, depth + 0.06]} />
          <meshStandardMaterial map={topMap} roughness={0.3} metalness={0.05} />
        </mesh>
      )}

      {/* Footrest bar (bar only) */}
      {def.barOverhang && hasFootrest && (
        <mesh position={[0, 0.58, depth / 2 - 0.08]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.022, 0.022, Math.max(0.5, width - 0.15), 10]} />
          <meshStandardMaterial color="#aab4bd" metalness={0.85} roughness={0.2} />
        </mesh>
      )}

      {selected && <SelectionOutline width={width} height={height} depth={depth} />}
    </group>
  )
}
