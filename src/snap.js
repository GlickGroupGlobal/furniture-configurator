// Snap logic — pure function, no React/Three deps. Easy to tune constants here.

const WALL_SNAP  = 1.0  // ft — within 12" of a wall, piece snaps flush
const PIECE_SNAP = 0.6  // ft — edge-to-edge distance that triggers piece snap
const STACK_DIST = 1.5  // ft — XZ proximity that triggers upper→lower stack snap
const UPPER_GAP  = 1.5  // ft — 18" clearance above lower cabinet countertop

function heightRangesOverlap(a, b) {
  const aBot = a.elevation ?? 0
  const bBot = b.elevation ?? 0
  return aBot < bBot + b.height - 0.02 && aBot + a.height > bBot + 0.02
}

/**
 * Given a desired (rawX, rawZ) position for `piece`, return snapped
 * { x, z, elevation, snappedX, snappedZ }. snappedX/snappedZ report whether
 * that axis is locked by a snap, so collision resolution can avoid
 * sliding the piece off a wall or away from a neighbor it just snapped to.
 *
 * Order: wall snap → neighbor edge snap (fills any still-free axis) →
 * upper-cabinet stacking (overrides all).
 */
export function applySnap(piece, rawX, rawZ, room, pieces) {
  let x         = rawX
  let z         = rawZ
  let elevation = piece.elevation ?? 0
  let snappedX  = false
  let snappedZ  = false

  const hw = piece.width  / 2
  const hd = piece.depth  / 2
  const lw = room.width   / 2   // half room width
  const ll = room.length  / 2   // half room length

  // ── Wall snap (both axes independent → corners work) ─────────────────────
  const dLeft  = (x - hw) - (-lw)
  const dRight = lw - (x + hw)
  const dBack  = (z - hd) - (-ll)
  const dFront = ll - (z + hd)

  if (dLeft  >= 0 && dLeft  < WALL_SNAP) { x = hw - lw; snappedX = true }   // flush left wall
  if (dRight >= 0 && dRight < WALL_SNAP) { x = lw - hw; snappedX = true }   // flush right wall
  if (dBack  >= 0 && dBack  < WALL_SNAP) { z = hd - ll; snappedZ = true }   // flush back wall
  if (dFront >= 0 && dFront < WALL_SNAP) { z = ll - hd; snappedZ = true }   // flush front wall

  // ── Neighbor edge snap — butt flush against a nearby piece ────────────────
  // For each other piece at an overlapping height range: if our edge is close
  // to one of its edges and we overlap on the perpendicular axis, snap flush.
  let best = null  // { axis, pos, alignAxis, alignPos, dist }
  for (const other of pieces) {
    if (other.id === piece.id) continue
    if (!heightRangesOverlap({ ...piece, elevation }, other)) continue

    const ohw = other.width / 2
    const ohd = other.depth / 2

    // X-axis butting (side-by-side): requires Z spans to overlap
    const zOverlap = Math.abs(z - other.z) < hd + ohd
    if (zOverlap) {
      for (const side of [-1, 1]) {
        const targetX = other.x + side * (ohw + hw)   // flush against other's left/right face
        const dist = Math.abs(x - targetX)
        if (dist < PIECE_SNAP && (!best || dist < best.dist)) {
          // Align back faces too (typical run of cabinets against the same wall)
          const alignZ = other.z - ohd + hd
          best = { axis: 'x', pos: targetX, alignPos: alignZ, dist }
        }
      }
    }

    // Z-axis butting (front-to-back row): requires X spans to overlap
    const xOverlap = Math.abs(x - other.x) < hw + ohw
    if (xOverlap) {
      for (const side of [-1, 1]) {
        const targetZ = other.z + side * (ohd + hd)
        const dist = Math.abs(z - targetZ)
        if (dist < PIECE_SNAP && (!best || dist < best.dist)) {
          const alignX = other.x - ohw + hw
          best = { axis: 'z', pos: targetZ, alignPos: alignX, dist }
        }
      }
    }
  }

  if (best) {
    if (best.axis === 'x' && !snappedX) {
      x = best.pos
      snappedX = true
      // Only pull the perpendicular axis into alignment if it isn't wall-snapped
      // and it's already nearly aligned (don't yank the piece sideways).
      if (!snappedZ && Math.abs(z - best.alignPos) < PIECE_SNAP) { z = best.alignPos; snappedZ = true }
    } else if (best.axis === 'z' && !snappedZ) {
      z = best.pos
      snappedZ = true
      if (!snappedX && Math.abs(x - best.alignPos) < PIECE_SNAP) { x = best.alignPos; snappedX = true }
    }
  }

  // ── Upper cabinet → lower/tall stack snap ─────────────────────────────────
  if (piece.type === 'upper_cabinet') {
    for (const other of pieces) {
      if (other.id === piece.id || other.type !== 'lower_cabinet') continue
      if (Math.abs(x - other.x) < STACK_DIST && Math.abs(z - other.z) < STACK_DIST) {
        x         = other.x                                      // align centers horizontally
        z         = other.z - other.depth / 2 + piece.depth / 2  // align backs
        elevation = other.height + UPPER_GAP                     // standard 18" gap above counter
        snappedX  = true
        snappedZ  = true
        break
      }
    }
  }

  return { x, z, elevation, snappedX, snappedZ }
}
