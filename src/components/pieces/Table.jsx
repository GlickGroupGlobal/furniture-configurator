import { RoundedBox } from '@react-three/drei'
import { getFinish } from '../../materials'
import { useFinishTexture } from '../../textures'
import SelectionOutline from './SelectionOutline'

const TT_H    = 0.083  // tabletop thickness ~1"
const LEG_SZ  = 0.083  // leg cross-section ~1"
const APRON_H = 0.22   // apron height ~2.6"
const INSET   = 0.25   // how far legs are inset from edge

function Leg({ style, x, z, legH, color }) {
  if (style === 'turned') {
    // Stepped baluster profile — alternating wide/narrow cylinder segments.
    const segH = legH / 4
    const radii = [0.07, 0.045, 0.06, 0.038]
    return (
      <group position={[x, 0, z]}>
        {radii.map((r, i) => (
          <mesh key={i} position={[0, segH * i + segH / 2, 0]} castShadow>
            <cylinderGeometry args={[r, r, segH, 14]} />
            <meshStandardMaterial color={color} roughness={0.55} />
          </mesh>
        ))}
      </group>
    )
  }
  // tapered (default): round leg, wider at top, narrower at floor
  return (
    <mesh position={[x, legH / 2, z]} castShadow>
      <cylinderGeometry args={[0.05, 0.032, legH, 14]} />
      <meshStandardMaterial color={color} roughness={0.55} />
    </mesh>
  )
}

export default function Table({
  width, height, depth, selected,
  bodyFamily, bodyFinish,
  legStyle = 'tapered', topEdge = 'square',
}) {
  const finish = getFinish(bodyFamily, bodyFinish)
  const topMap = useFinishTexture(finish, Math.max(1, width), Math.max(1, depth))
  // Legs/apron use a flat tone sampled from the finish family (solid parts,
  // not board faces) — fall back to a neutral wood tone for photo finishes.
  const legColor = finish.color ?? '#a98a62'
  const legH = height - TT_H - APRON_H

  const corners = [
    [-1, -1], [-1, 1], [1, -1], [1, 1],
  ]
  const isPedestal = legStyle === 'pedestal'

  return (
    <group>
      {/* Tabletop */}
      {topEdge === 'rounded' ? (
        <RoundedBox
          args={[width, TT_H, depth]}
          radius={Math.min(0.06, Math.min(width, depth) * 0.03)}
          smoothness={3}
          position={[0, height - TT_H / 2, 0]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial map={topMap} roughness={0.45} />
        </RoundedBox>
      ) : (
        <mesh position={[0, height - TT_H / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[width, TT_H, depth]} />
          <meshStandardMaterial map={topMap} roughness={0.45} />
        </mesh>
      )}

      {isPedestal ? (
        <>
          {/* Central column */}
          <mesh position={[0, legH / 2, 0]} castShadow>
            <cylinderGeometry args={[0.09, 0.11, legH, 20]} />
            <meshStandardMaterial color={legColor} roughness={0.55} />
          </mesh>
          {/* Cross feet for stability */}
          <mesh position={[0, 0.05, 0]} castShadow>
            <boxGeometry args={[Math.min(width * 0.55, width - INSET), 0.1, LEG_SZ * 1.4]} />
            <meshStandardMaterial color={legColor} roughness={0.55} />
          </mesh>
          <mesh position={[0, 0.05, 0]} castShadow>
            <boxGeometry args={[LEG_SZ * 1.4, 0.1, Math.min(depth * 0.55, depth - INSET)]} />
            <meshStandardMaterial color={legColor} roughness={0.55} />
          </mesh>
        </>
      ) : (
        <>
          {corners.map(([sx, sz]) => (
            <Leg
              key={`${sx}${sz}`}
              style={legStyle}
              x={sx * (width / 2 - INSET)}
              z={sz * (depth / 2 - INSET)}
              legH={legH}
              color={legColor}
            />
          ))}

          {/* Apron — long sides */}
          {[-1, 1].map(sz => (
            <mesh
              key={`al${sz}`}
              position={[0, height - TT_H - APRON_H / 2, sz * (depth / 2 - INSET)]}
              castShadow
            >
              <boxGeometry args={[width - INSET * 2, APRON_H, 0.04]} />
              <meshStandardMaterial color={legColor} roughness={0.55} />
            </mesh>
          ))}

          {/* Apron — short sides */}
          {[-1, 1].map(sx => (
            <mesh
              key={`as${sx}`}
              position={[sx * (width / 2 - INSET), height - TT_H - APRON_H / 2, 0]}
              castShadow
            >
              <boxGeometry args={[0.04, APRON_H, depth - INSET * 2]} />
              <meshStandardMaterial color={legColor} roughness={0.55} />
            </mesh>
          ))}
        </>
      )}

      {selected && <SelectionOutline width={width} height={height} depth={depth} />}
    </group>
  )
}
