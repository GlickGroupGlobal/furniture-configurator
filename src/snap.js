// Snap logic — pure function, no React/Three deps. Easy to tune constants here.

const WALL_SNAP  = 0.8  // ft — within ~10" of a wall, piece snaps flush
const STACK_DIST = 1.5  // ft — XZ proximity that triggers upper→lower stack snap
const UPPER_GAP  = 1.5  // ft — 18" clearance above lower cabinet countertop

/**
 * Given a desired (rawX, rawZ) position for `piece`, return snapped (x, z, elevation).
 * Snaps to room walls first, then upper cabinet to lower cabinet stacking.
 */
export function applySnap(piece, rawX, rawZ, room, pieces) {
  let x         = rawX
  let z         = rawZ
  let elevation = piece.elevation ?? 0

  const hw = piece.width  / 2
  const hd = piece.depth  / 2
  const lw = room.width   / 2   // half room width
  const ll = room.length  / 2   // half room length

  // ── Wall snap ─────────────────────────────────────────────────────────────
  // distance from each piece edge to its nearest wall (positive = inside room)
  const dLeft  = (x - hw) - (-lw)
  const dRight = lw - (x + hw)
  const dBack  = (z - hd) - (-ll)
  const dFront = ll - (z + hd)

  if (dLeft  >= 0 && dLeft  < WALL_SNAP) x =  hw - lw   // flush left wall
  if (dRight >= 0 && dRight < WALL_SNAP) x =  lw - hw   // flush right wall
  if (dBack  >= 0 && dBack  < WALL_SNAP) z =  hd - ll   // flush back wall
  if (dFront >= 0 && dFront < WALL_SNAP) z =  ll - hd   // flush front wall

  // ── Upper cabinet → lower cabinet stack snap ───────────────────────────────
  if (piece.type === 'upper_cabinet') {
    for (const other of pieces) {
      if (other.id === piece.id || other.type !== 'lower_cabinet') continue
      if (Math.abs(x - other.x) < STACK_DIST && Math.abs(z - other.z) < STACK_DIST) {
        x         = other.x                                    // align centers horizontally
        z         = other.z - other.depth / 2 + piece.depth / 2  // align backs
        elevation = other.height + UPPER_GAP                  // standard 18" gap above counter
        break
      }
    }
  }

  return { x, z, elevation }
}
