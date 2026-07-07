import Cabinet  from './pieces/Cabinet'
import Table    from './pieces/Table'
import Sofa     from './pieces/Sofa'
import Shelving from './pieces/Shelving'
import { PieceDimensionLabel } from './DimensionLabels'

const GEOMETRIES = {
  lower_cabinet: Cabinet,
  upper_cabinet: Cabinet,
  tall_closet:   Cabinet,
  bar:           Cabinet,
  table:         Table,
  sofa:          Sofa,
  shelving:      Shelving,
}

export default function FurniturePiece({ piece, selected, onPointerDown, unitSystem = 'imperial' }) {
  const Geo = GEOMETRIES[piece.type]
  if (!Geo) return null

  return (
    <group
      position={[piece.x, piece.elevation ?? 0, piece.z]}
      onPointerDown={e => onPointerDown(e, piece)}
    >
      {/* Spread so every config field (frontStyle, bodyFinish, countertop, ...)
          reaches the geometry component without enumerating each one here. */}
      <Geo {...piece} selected={selected} />
      {selected && (
        <PieceDimensionLabel
          width={piece.width}
          height={piece.height}
          depth={piece.depth}
          unitSystem={unitSystem}
        />
      )}
    </group>
  )
}
