import { PIECE_DEFS } from '../constants'
import LowerCabinet from './pieces/LowerCabinet'
import UpperCabinet from './pieces/UpperCabinet'
import Bar         from './pieces/Bar'
import Table       from './pieces/Table'
import Sofa        from './pieces/Sofa'
import Shelving    from './pieces/Shelving'

const GEOMETRIES = {
  lower_cabinet: LowerCabinet,
  upper_cabinet: UpperCabinet,
  bar:           Bar,
  table:         Table,
  sofa:          Sofa,
  shelving:      Shelving,
}

export default function FurniturePiece({ piece, selected, onPointerDown }) {
  const Geo = GEOMETRIES[piece.type]
  if (!Geo) return null

  return (
    <group
      position={[piece.x, piece.elevation ?? 0, piece.z]}
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
