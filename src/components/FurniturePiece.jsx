import LowerCabinet from './pieces/LowerCabinet'

const GEOMETRIES = {
  lower_cabinet: LowerCabinet,
}

export default function FurniturePiece({ piece, selected, onPointerDown }) {
  const Geo = GEOMETRIES[piece.type]
  if (!Geo) return null

  return (
    <group
      position={[piece.x, 0, piece.z]}
      onPointerDown={e => onPointerDown(e, piece)}
    >
      <Geo
        width={piece.width}
        height={piece.height}
        depth={piece.depth}
        material={piece.material}
        selected={selected}
      />
    </group>
  )
}
