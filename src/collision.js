// Bounding-box collision resolution — pure function, no React/Three deps.

const GAP = 0.04  // ~0.5" minimum clearance between pieces

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
    Math.abs(ax - bx) < (aw + bw) / 2 + GAP &&
    Math.abs(az - bz) < (ad + bd) / 2 + GAP
  )
}

/**
 * Try to place `piece` at (newX, newZ). If that overlaps another piece,
 * attempt to slide along one axis. Returns the best valid (x, z).
 */
export function resolveCollision(piece, newX, newZ, pieces) {
  // Only check pieces whose height range overlaps this piece's height range
  const others = pieces.filter(p => p.id !== piece.id && heightsOverlap(piece, p))
  if (others.length === 0) return { x: newX, z: newZ }

  const isClear = (x, z) =>
    others.every(o =>
      !overlapsXZ(x, z, piece.width, piece.depth, o.x, o.z, o.width, o.depth)
    )

  if (isClear(newX, newZ))    return { x: newX,    z: newZ    }  // full move OK
  if (isClear(newX, piece.z)) return { x: newX,    z: piece.z }  // slide on X
  if (isClear(piece.x, newZ)) return { x: piece.x, z: newZ    }  // slide on Z
  return { x: piece.x, z: piece.z }                               // fully blocked
}
