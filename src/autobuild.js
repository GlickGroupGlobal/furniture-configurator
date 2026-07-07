// Client-side helpers for the "autobuild from a photo" feature: resizing the
// upload before it ever leaves the browser (smaller vision-API payload,
// smaller stored reference photo) and mapping a server analysis result onto
// a piece object the configurator already knows how to render/edit.

import { PIECE_DEFS } from './constants'

const MAX_DIMENSION = 1024
const JPEG_QUALITY = 0.85

/** Downscale + re-encode an uploaded image file to a JPEG data URL. */
export function resizeImageToDataUrl(file, maxDimension = MAX_DIMENSION, quality = JPEG_QUALITY) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      const scale = Math.min(1, maxDimension / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Could not read that image file.'))
    }
    img.src = objectUrl
  })
}

function clamp(value, min, max, fallback) {
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.min(max, Math.max(min, n))
}

/**
 * Overlay a sanitized /api/vision/analyze-piece result onto a freshly-made
 * piece (from makePiece(analysis.pieceType) in ConfiguratorApp.jsx).
 * Re-clamps everything defensively even though the server already does —
 * this is display data, not a trust boundary, but cheap insurance.
 */
export function applyAnalysisOverrides(piece, analysis) {
  const def = PIECE_DEFS[piece.type]
  if (!def) return piece

  const next = {
    ...piece,
    width: clamp(analysis.width, def.minWidth, def.maxWidth, piece.width),
    height: clamp(analysis.height, def.minHeight, def.maxHeight, piece.height),
    depth: clamp(analysis.depth, def.minDepth, def.maxDepth, piece.depth),
    sourcePhotoUrl: analysis.photoUrl ?? undefined,
  }

  if (analysis.bodyFamily && analysis.bodyFinish) {
    next.bodyFamily = analysis.bodyFamily
    next.bodyFinish = analysis.bodyFinish
    // Fronts default to matching the body finish, same as a manually-added piece.
    next.frontFamily = analysis.bodyFamily
    next.frontFinish = analysis.bodyFinish
    next.countertopFamily = analysis.bodyFamily
    next.countertopFinish = analysis.bodyFinish
  }

  if (def.cabinet) {
    if ((def.frontStyles ?? []).includes(analysis.frontStyle)) next.frontStyle = analysis.frontStyle
    if (['bar', 'knob', 'none'].includes(analysis.handleStyle)) next.handleStyle = analysis.handleStyle
    if (analysis.doorProfile) next.doorProfile = analysis.doorProfile
    if (def.canCountertop && typeof analysis.countertop === 'boolean') next.countertop = analysis.countertop
    if (def.defaultHasFootrest !== undefined && typeof analysis.hasFootrest === 'boolean') next.hasFootrest = analysis.hasFootrest
  } else {
    if (def.legStyleOptions?.includes(analysis.legStyle)) next.legStyle = analysis.legStyle
    if (def.topEdgeOptions?.includes(analysis.topEdge)) next.topEdge = analysis.topEdge
    if (def.backPanelOptions?.includes(analysis.backPanel)) next.backPanel = analysis.backPanel
  }

  return next
}
