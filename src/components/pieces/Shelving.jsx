import { MATERIALS } from '../../constants'
import { getWoodBaseTexture, useTiledTexture } from '../../textures'
import SelectionOutline from './SelectionOutline'

const PT  = 0.05   // panel thickness ~0.6"
const GAP = 0.022

export default function Shelving({
  width, height, depth, material, selected,
  backPanel = 'solid', doorStyle = 'open',
}) {
  const mat = MATERIALS[material] || MATERIALS.solid_oak
  const woodBase = getWoodBaseTexture(mat.color)
  const bodyMap = useTiledTexture(woodBase, width * 1.2, height * 1.2)
  const doorMap = useTiledTexture(woodBase, width * 1.2, height * 1.2)

  const numShelves = Math.max(3, Math.round(height / 1.4))
  const shelfSpacing = height / numShelves
  const midShelves = Array.from({ length: numShelves - 1 }, (_, i) => shelfSpacing * (i + 1))

  const numDoors = width <= 1.5 ? 1 : 2
  const dW = (width - GAP * (numDoors + 1)) / numDoors
  const dH = height - GAP * 2
  const dZ = depth / 2 + 0.01
  const isGlass = doorStyle === 'glass'

  return (
    <group>
      {/* Left side panel */}
      <mesh position={[-width / 2 + PT / 2, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[PT, height, depth]} />
        <meshStandardMaterial map={bodyMap} color={mat.color} roughness={mat.roughness} />
      </mesh>

      {/* Right side panel */}
      <mesh position={[width / 2 - PT / 2, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[PT, height, depth]} />
        <meshStandardMaterial map={bodyMap} color={mat.color} roughness={mat.roughness} />
      </mesh>

      {/* Top panel */}
      <mesh position={[0, height - PT / 2, 0]} castShadow>
        <boxGeometry args={[width, PT, depth]} />
        <meshStandardMaterial color={mat.color} roughness={mat.roughness} />
      </mesh>

      {/* Bottom panel */}
      <mesh position={[0, PT / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, PT, depth]} />
        <meshStandardMaterial color={mat.color} roughness={mat.roughness} />
      </mesh>

      {/* Back panel — optional */}
      {backPanel === 'solid' && (
        <mesh position={[0, height / 2, -depth / 2 + 0.018]}>
          <boxGeometry args={[width - PT * 2, height, 0.02]} />
          <meshStandardMaterial color={mat.color} roughness={mat.roughness + 0.1} />
        </mesh>
      )}

      {/* Intermediate shelves */}
      {midShelves.map((sy, i) => (
        <mesh key={i} position={[0, sy, 0]} castShadow>
          <boxGeometry args={[width - PT * 2, PT, depth - 0.04]} />
          <meshStandardMaterial color={mat.color} roughness={mat.roughness - 0.05} />
        </mesh>
      ))}

      {/* Doors — optional glass or solid front */}
      {doorStyle !== 'open' && Array.from({ length: numDoors }).map((_, i) => {
        const dX = -width / 2 + GAP + dW / 2 + i * (dW + GAP)
        return (
          <mesh key={i} position={[dX, height / 2, dZ]} castShadow>
            <boxGeometry args={[dW, dH, 0.018]} />
            {isGlass ? (
              <meshPhysicalMaterial color="#dfe9ee" roughness={0.1} transmission={0.75} thickness={0.2} />
            ) : (
              <meshStandardMaterial map={doorMap} color={mat.color} roughness={Math.max(0.3, mat.roughness - 0.12)} />
            )}
          </mesh>
        )
      })}

      {selected && <SelectionOutline width={width} height={height} depth={depth} />}
    </group>
  )
}
