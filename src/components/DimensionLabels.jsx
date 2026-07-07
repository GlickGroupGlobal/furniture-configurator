import { Html } from '@react-three/drei'
import { formatFeetInches } from '../format'

const labelStyle = {
  background: 'rgba(33,28,22,0.85)',
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

/** Always-visible width/length/height callouts anchored to the room's floor edges and a back corner. */
export function RoomDimensionLabels({ room }) {
  const { width, length, height } = room
  return (
    <>
      <Label position={[0, 0.03, length / 2 + 0.15]}>{formatFeetInches(width)} wide</Label>
      <Label position={[-width / 2 - 0.15, 0.03, 0]}>{formatFeetInches(length)} long</Label>
      <Label position={[-width / 2 - 0.15, height / 2, -length / 2]}>{formatFeetInches(height)} tall</Label>
    </>
  )
}

/** Always-visible W x H x D callout for a single placed piece, in the piece's local space. */
export function PieceDimensionLabel({ width, height, depth }) {
  return (
    <Label position={[width / 2 + 0.15, height + 0.1, depth / 2]}>
      {formatFeetInches(width)} × {formatFeetInches(height)} × {formatFeetInches(depth)}
    </Label>
  )
}
