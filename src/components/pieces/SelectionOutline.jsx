import { useMemo } from 'react'
import * as THREE from 'three'

// Shared selection indicator. EdgesGeometry draws only the 12 hard box edges —
// a plain wireframe material would also draw every triangle diagonal, which
// reads as render artifacts ("facet lines") on the cabinets.
export default function SelectionOutline({ width, height, depth }) {
  const geometry = useMemo(
    () => new THREE.EdgesGeometry(new THREE.BoxGeometry(width + 0.04, height + 0.04, depth + 0.04)),
    [width, height, depth]
  )
  return (
    <lineSegments position={[0, height / 2, 0]} geometry={geometry}>
      <lineBasicMaterial color="#C1622D" />
    </lineSegments>
  )
}
