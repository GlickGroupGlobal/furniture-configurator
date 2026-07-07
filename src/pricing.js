// ── PLACEHOLDER PRICING (Phase 1) ───────────────────────────────────────────
// Formula per PRD §10. All pricing logic is isolated in this file so it can
// be swapped for real manufacturer rate-card data later without touching
// any UI or 3D code — just replace the constants/logic below.

const MATERIAL_RATE = {        // $ per cubic foot of material
  solid_oak:     45,
  solid_walnut:  65,
  painted_birch: 28,
  painted_mdf:   22,
}

const TYPE_MULTIPLIER = {      // relative labor/complexity by piece type
  lower_cabinet: 1.0,
  upper_cabinet: 1.0,
  bar:           1.3,
  table:         1.1,
  sofa:          1.5,
  shelving:      0.8,
}

const MIN_MANUFACTURER_COST = 150  // $ floor per piece
const MIN_FREIGHT_COST      = 40   // $ floor per piece
const FREIGHT_RATE          = 3    // $ per cubic foot
const BASE_FREIGHT          = 20   // $ flat per piece

// Premium style options add a cost multiplier on top of the base
// material/type calculation — e.g. glass fronts and drawer boxes cost more
// to fabricate than a plain paneled door.
const STYLE_PRICE_MULTIPLIER = {
  glass:   1.15,
  drawers: 1.20,
}

function stylePriceMultiplier(piece) {
  const styleValue = piece.doorStyle ?? piece.frontStyle
  return STYLE_PRICE_MULTIPLIER[styleValue] ?? 1.0
}

/** Estimated price for a single piece, in USD. */
export function estimatePiecePrice(piece) {
  const widthIn  = piece.width  * 12
  const heightIn = piece.height * 12
  const depthIn  = piece.depth  * 12
  const volumeFt3 = (widthIn * heightIn * depthIn) / 1728

  const materialRate  = MATERIAL_RATE[piece.material] ?? MATERIAL_RATE.solid_oak
  const typeMultiplier = TYPE_MULTIPLIER[piece.type] ?? 1.0
  const styleMultiplier = stylePriceMultiplier(piece)

  const manufacturerCost = Math.max(MIN_MANUFACTURER_COST, volumeFt3 * materialRate * typeMultiplier * styleMultiplier)
  const freightCost      = Math.max(MIN_FREIGHT_COST, volumeFt3 * FREIGHT_RATE + BASE_FREIGHT)

  return manufacturerCost + freightCost
}

/** Sum of estimated prices across all pieces, in USD. */
export function estimateTotalPrice(pieces) {
  return pieces.reduce((sum, piece) => sum + estimatePiecePrice(piece), 0)
}
