import { MATERIALS } from '../../constants'

const TT_H    = 0.083  // tabletop thickness ~1"
const LEG_SZ  = 0.083  // leg cross-section ~1"
const APRON_H = 0.22   // apron height ~2.6"
const INSET   = 0.25   // how far legs are inset from edge

export default function Table({ width, height, depth, material, selected }) {
  const mat = MATERIALS[material] || MATERIALS.solid_oak
  const legH = height - TT_H - APRON_H

  const corners = [
    [-1, -1], [-1, 1], [1, -1], [1, 1],
  ]

  return (
    <group>
      {/* Tabletop */}
      <mesh position={[0, height - TT_H / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, TT_H, depth]} />
        <meshStandardMaterial color={mat.color} roughness={mat.roughness - 0.1} />
      </mesh>

      {/* Legs */}
      {corners.map(([sx, sz]) => (
        <mesh
          key={`${sx}${sz}`}
          position={[
            sx * (width / 2 - INSET),
            legH / 2,
            sz * (depth / 2 - INSET),
          ]}
          castShadow
        >
          <boxGeometry args={[LEG_SZ, legH, LEG_SZ]} />
          <meshStandardMaterial color={mat.color} roughness={mat.roughness} />
        </mesh>
      ))}

      {/* Apron — long sides */}
      {[-1, 1].map(sz => (
        <mesh
          key={`al${sz}`}
          position={[0, height - TT_H - APRON_H / 2, sz * (depth / 2 - INSET)]}
          castShadow
        >
          <boxGeometry args={[width - INSET * 2, APRON_H, 0.04]} />
          <meshStandardMaterial color={mat.color} roughness={mat.roughness} />
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
          <meshStandardMaterial color={mat.color} roughness={mat.roughness} />
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
