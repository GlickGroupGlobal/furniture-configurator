// Bounding-box collision resolution — pure function, no React/Three deps.

const GAP = 0.005  // tiny clearance so butted pieces don't z-fight

function heightsOverlap(a, b) {
  const aBot = a.elevation ?? 0
  const aTop = aBot + a.height
  const bBot = b.elevation ?? 0
  const bTop = bBot + b.height
  // small epsilon so pieces at exactly the same level don't get filtered out
  return aBot < bTop - 0.02 && aTop > bBot + 0.02
}

function overlapsXZ(ax, az, aw, ad, bx, bz, bw, bd) {
  return (
    Math.abs(ax - bx) < (aw + bw) / 2 - GAP &&
    Math.abs(az - bz) < (ad + bd) / 2 - GAP
  )
}

/**
 * Try to place `piece` at (newX, newZ). If that overlaps another piece,
 * attempt to slide along one axis. `snappedX`/`snappedZ` mark axes locked by
 * a snap (wall, neighbor, or stack) — those are only reverted as a last
 * resort, so collision resolution doesn't undo a good snap.
 * Returns the best valid (x, z).
 */
export function resolveCollision(piece, newX, newZ, pieces, snappedX = false, snappedZ = false) {
  // Only check pieces whose height range overlaps this piece's height range
  const others = pieces.filter(p => p.id !== piece.id && heightsOverlap(piece, p))
  if (others.length === 0) return { x: newX, z: newZ }

  const isClear = (x, z) =>
    others.every(o =>
      !overlapsXZ(x, z, piece.width, piece.depth, o.x, o.z, o.width, o.depth)
    )

  if (isClear(newX, newZ)) return { x: newX, z: newZ }  // full move OK

  // Prefer slides that keep snapped axes at their snapped positions:
  // keep X (revert Z) first if X is the snapped axis, and vice versa.
  const candidates = snappedX && !snappedZ
    ? [[newX, piece.z], [piece.x, newZ]]
    : snappedZ && !snappedX
      ? [[piece.x, newZ], [newX, piece.z]]
      : [[newX, piece.z], [piece.x, newZ]]

  for (const [x, z] of candidates) {
    if (isClear(x, z)) return { x, z }
  }
  return { x: piece.x, z: piece.z }  // fully blocked
}
