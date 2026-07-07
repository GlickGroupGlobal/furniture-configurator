// ── PRICING ──────────────────────────────────────────────────────────────────
// All pricing math lives here and is driven by a *rate card* object. The
// admin panel edits the live rate card on the server (GET/PUT /api/rate-card);
// the configurator fetches it on load and falls back to DEFAULT_RATE_CARD
// when the server is unreachable. Formula per PRD §10.

export const DEFAULT_RATE_CARD = {
  // $ per square meter by board family and part. These match the supplier
  // sheet and are editable from Admin > Pricing.
  partRates: {
    particle_board: { doorPanel: 22,   cabinetBody: 17, backboard: 15 },
    osb:            { doorPanel: 30.5, cabinetBody: 26, backboard: 22.5 },
    plywood:        { doorPanel: 43.5, cabinetBody: 29, backboard: 22.5 },
    // PLACEHOLDER rates — no supplier sheet numbers yet for these families;
    // set real values in Admin > Pricing before quoting with them.
    pet:            { doorPanel: 30.5, cabinetBody: 26, backboard: 22.5 },
    liquid_metal:   { doorPanel: 43.5, cabinetBody: 29, backboard: 22.5 },
    hvea:           { doorPanel: 30.5, cabinetBody: 26, backboard: 22.5 },
  },
  // relative labor/complexity by piece type
  typeMultipliers: {
    lower_cabinet: 1.0,
    upper_cabinet: 1.0,
    tall_closet:   1.05,
    bar:           1.3,
    table:         1.1,
    shelving:      0.8,
    sofa:          1.5,
  },
  // fraction added to manufacturer cost per front style
  frontAdders: {
    none:    0,
    slab:    0.12,
    shaker:  0.18,
    glass:   0.25,
    drawers: 0.30,
  },
  countertopAdder: 0.15,   // fraction added when a countertop is included
  minManufacturerCost: 150, // $ floor per piece
  freightRate: 3,           // $ per cubic foot
  baseFreight: 20,          // $ flat per piece
  minFreightCost: 40,       // $ floor per piece
  // sell price target = estimate × margin (used for the admin's suggested quote)
  margin: 1.0,
}

const SQ_M_PER_SQ_FT = 0.092903

function panelAreas(piece) {
  const frontArea = piece.width * piece.height * SQ_M_PER_SQ_FT
  const sideArea = piece.depth * piece.height * 2 * SQ_M_PER_SQ_FT
  const topBottomArea = piece.width * piece.depth * 2 * SQ_M_PER_SQ_FT
  const shelfCount = Math.max(1, Math.round(piece.height / 1.25) - 1)
  const shelfArea = piece.width * piece.depth * shelfCount * SQ_M_PER_SQ_FT
  const backArea = piece.width * piece.height * SQ_M_PER_SQ_FT
  const countertopArea = piece.countertop ? piece.width * piece.depth * SQ_M_PER_SQ_FT : 0
  return { frontArea, bodyArea: sideArea + topBottomArea + shelfArea, backArea, countertopArea }
}

/** Estimated price for a single piece, in USD. */
export function estimatePiecePrice(piece, rateCard = DEFAULT_RATE_CARD) {
  const rc = rateCard
  const volumeFt3 = piece.width * piece.height * piece.depth
  const { frontArea, bodyArea, backArea, countertopArea } = panelAreas(piece)

  const bodyRates = rc.partRates?.[piece.bodyFamily] ?? rc.partRates?.particle_board
  const frontRates = rc.partRates?.[piece.frontFamily] ?? bodyRates
  const countertopRates = rc.partRates?.[piece.countertopFamily] ?? bodyRates
  const typeMultiplier = rc.typeMultipliers[piece.type] ?? 1.0
  const frontAdder = rc.frontAdders[piece.frontStyle] ?? 0
  const countertopAdder = piece.countertop ? rc.countertopAdder : 0
  const hasFronts = piece.frontStyle && piece.frontStyle !== 'none'

  const boardCost =
    bodyArea * (bodyRates?.cabinetBody ?? 17) +
    backArea * (bodyRates?.backboard ?? 15) +
    (hasFronts ? frontArea * (frontRates?.doorPanel ?? 22) : 0) +
    countertopArea * (countertopRates?.cabinetBody ?? 17)

  const manufacturerCost = Math.max(
    rc.minManufacturerCost,
    boardCost * typeMultiplier * (1 + frontAdder + countertopAdder)
  )
  const freightCost = Math.max(rc.minFreightCost, volumeFt3 * rc.freightRate + rc.baseFreight)

  return manufacturerCost + freightCost
}

/** Sum of estimated prices across all pieces, in USD. */
export function estimateTotalPrice(pieces, rateCard = DEFAULT_RATE_CARD) {
  return pieces.reduce((sum, piece) => sum + estimatePiecePrice(piece, rateCard), 0)
}

/**
 * Suggested quote for an order: estimate × margin, minus discount.
 * Used by the admin panel; kept here so customer estimate and admin quote
 * always share one pricing source of truth.
 */
export function suggestQuote(estimate, rateCard = DEFAULT_RATE_CARD, discount = null) {
  let quote = estimate * (rateCard.margin ?? 1)
  if (discount && discount.value > 0) {
    quote = discount.type === 'percent'
      ? quote * (1 - discount.value / 100)
      : quote - discount.value
  }
  return Math.max(0, quote)
}
