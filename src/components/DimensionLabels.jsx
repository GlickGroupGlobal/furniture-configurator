import { useMemo } from 'react'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import { formatDimension } from '../format'

const LINE_COLOR = '#211C16'
const TICK = 0.08      // length of the perpendicular end-ticks
const OFFSET = 0.14    // gap between the piece surface and its dimension line

const labelStyle = {
  background: 'rgba(33,28,22,0.88)',
  color: '#fff',
  fontSize: 11,
  fontWeight: 600,
  padding: '3px 8px',
  borderRadius: 999,
  whiteSpace: 'nowrap',
  pointerEvents: 'none',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
}

function Label({ position, children }) {
  return (
    <Html position={position} center occlude={false} zIndexRange={[10, 0]}>
      <div style={labelStyle}>{children}</div>
    </Html>
  )
}

/**
 * IKEA-style dimension line: a segment from `start` to `end` with small
 * perpendicular ticks at both ends (`tickDir` = unit-ish vector for the tick
 * direction) and a label pill at the midpoint.
 */
function DimensionLine({ start, end, tickDir, children }) {
  const geometry = useMemo(() => {
    const s = new THREE.Vector3(...start)
    const e = new THREE.Vector3(...end)
    const t = new THREE.Vector3(...tickDir).multiplyScalar(TICK / 2)
    const points = [
      s, e,                                        // main line
      s.clone().add(t), s.clone().sub(t),          // start tick
      e.clone().add(t), e.clone().sub(t),          // end tick
    ]
    return new THREE.BufferGeometry().setFromPoints(points)
  }, [start, end, tickDir])

  const mid = [
    (start[0] + end[0]) / 2,
    (start[1] + end[1]) / 2,
    (start[2] + end[2]) / 2,
  ]

  return (
    <>
      <lineSegments geometry={geometry}>
        <lineBasicMaterial color={LINE_COLOR} />
      </lineSegments>
      <Label position={mid}>{children}</Label>
    </>
  )
}

/** Always-visible width/length/height callouts along the room's floor edges and a back corner. */
export function RoomDimensionLabels({ room, unitSystem = 'imperial' }) {
  const { width, length, height } = room
  const z = length / 2 + OFFSET
  const x = -width / 2 - OFFSET
  return (
    <>
      {/* Width — along the front floor edge */}
      <DimensionLine
        start={[-width / 2, 0.02, z]} end={[width / 2, 0.02, z]}
        tickDir={[0, 0, 1]}
      >
        {formatDimension(width, unitSystem)}
      </DimensionLine>
      {/* Length — along the left floor edge */}
      <DimensionLine
        start={[x, 0.02, -length / 2]} end={[x, 0.02, length / 2]}
        tickDir={[1, 0, 0]}
      >
        {formatDimension(length, unitSystem)}
      </DimensionLine>
      {/* Height — up the back-left corner */}
      <DimensionLine
        start={[x, 0, -length / 2]} end={[x, height, -length / 2]}
        tickDir={[1, 0, 0]}
      >
        {formatDimension(height, unitSystem)}
      </DimensionLine>
    </>
  )
}

/**
 * Per-piece dimension lines, IKEA-style: each measurement drawn along the
 * edge it measures — width across the top front, height up the left front
 * edge, depth along the bottom right side. In the piece's local space.
 */
export function PieceDimensionLabel({ width, height, depth, unitSystem = 'imperial' }) {
  const topY = height + OFFSET
  const leftX = -width / 2 - OFFSET
  const rightX = width / 2 + OFFSET
  const frontZ = depth / 2
  return (
    <>
      {/* Width — along the top front edge */}
      <DimensionLine
        start={[-width / 2, topY, frontZ]} end={[width / 2, topY, frontZ]}
        tickDir={[0, 1, 0]}
      >
        {formatDimension(width, unitSystem)}
      </DimensionLine>
      {/* Height — up the front left edge */}
      <DimensionLine
        start={[leftX, 0, frontZ]} end={[leftX, height, frontZ]}
        tickDir={[1, 0, 0]}
      >
        {formatDimension(height, unitSystem)}
      </DimensionLine>
      {/* Depth — along the bottom right edge */}
      <DimensionLine
        start={[rightX, 0.02, -depth / 2]} end={[rightX, 0.02, depth / 2]}
        tickDir={[1, 0, 0]}
      >
        {formatDimension(depth, unitSystem)}
      </DimensionLine>
    </>
  )
}
