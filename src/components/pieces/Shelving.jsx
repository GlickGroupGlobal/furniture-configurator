import { getFinish } from '../../materials'
import { useFinishTexture } from '../../textures'
import SelectionOutline from './SelectionOutline'

const PT = 0.05  // panel thickness ~0.6"

export default function Shelving({
  width, height, depth, selected,
  bodyFamily, bodyFinish,
  backPanel = 'solid',
}) {
  const finish = getFinish(bodyFamily, bodyFinish)
  const map = useFinishTexture(finish, Math.max(1, width), Math.max(1, height))

  const numShelves = Math.max(3, Math.round(height / 1.4))
  const shelfSpacing = height / numShelves
  const midShelves = Array.from({ length: numShelves - 1 }, (_, i) => shelfSpacing * (i + 1))

  const mat = <meshStandardMaterial map={map} roughness={0.55} />

  return (
    <group>
      {/* Left / right side panels */}
      <mesh position={[-width / 2 + PT / 2, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[PT, height, depth]} />
        {mat}
      </mesh>
      <mesh position={[width / 2 - PT / 2, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[PT, height, depth]} />
        {mat}
      </mesh>

      {/* Top / bottom panels */}
      <mesh position={[0, height - PT / 2, 0]} castShadow>
        <boxGeometry args={[width, PT, depth]} />
        {mat}
      </mesh>
      <mesh position={[0, PT / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, PT, depth]} />
        {mat}
      </mesh>

      {/* Back panel — optional */}
      {backPanel === 'solid' && (
        <mesh position={[0, height / 2, -depth / 2 + 0.018]}>
          <boxGeometry args={[width - PT * 2, height, 0.02]} />
          <meshStandardMaterial map={map} roughness={0.65} />
        </mesh>
      )}

      {/* Intermediate shelves */}
      {midShelves.map((sy, i) => (
        <mesh key={i} position={[0, sy, 0]} castShadow>
          <boxGeometry args={[width - PT * 2, PT, depth - 0.04]} />
          {mat}
        </mesh>
      ))}

      {selected && <SelectionOutline width={width} height={height} depth={depth} />}
    </group>
  )
}
