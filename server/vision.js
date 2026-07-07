// Photo -> structured piece analysis, via the Anthropic Messages API.
// Deliberately dependency-free (uses the global `fetch`, available in
// Node 18+) so this feature doesn't add an SDK dependency for something
// that's off by default.

import process from 'node:process'
import { PIECE_DEFS, DOOR_PROFILE_LABELS, DEFAULT_DOOR_PROFILE } from '../src/constants.js'
import { MATERIAL_FAMILY_DATA, DEFAULT_FAMILY, DEFAULT_FINISH } from '../src/materialsData.js'

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
const ANTHROPIC_VERSION = '2023-06-01'
const DEFAULT_MODEL = 'claude-sonnet-5'

const VISIBLE_TYPES = Object.entries(PIECE_DEFS).filter(([, def]) => !def.hidden)

// Flat {code -> family} lookup + the "code: name" list shown to the model
// so it can pick a finish by visual description rather than by opaque code.
const CODE_TO_FAMILY = {}
const FINISH_LINES = []
for (const [familyKey, family] of Object.entries(MATERIAL_FAMILY_DATA)) {
  for (const finish of family.finishes) {
    CODE_TO_FAMILY[finish.code] = familyKey
    FINISH_LINES.push(`${finish.code}: ${finish.name} (${family.label})`)
  }
}
const ALL_FINISH_CODES = Object.keys(CODE_TO_FAMILY)

const FRONT_STYLES = ['none', 'slab', 'shaker', 'glass', 'drawers']
const HANDLE_STYLES = ['bar', 'knob', 'none']
const LEG_STYLES = ['tapered', 'turned', 'pedestal']
const TOP_EDGES = ['square', 'rounded']
const BACK_PANELS = ['solid', 'open']

const TOOL_NAME = 'report_furniture_analysis'

function buildTool() {
  return {
    name: TOOL_NAME,
    description: 'Report structured details about the single piece of furniture/cabinetry shown in a photo, for a furniture configurator to pre-fill.',
    input_schema: {
      type: 'object',
      properties: {
        isFurniture: {
          type: 'boolean',
          description: 'True only if the photo clearly shows ONE piece of cabinetry/furniture matching a supported type. False if it is unclear, not furniture, shows a whole room with multiple pieces, or is otherwise unsuitable.',
        },
        pieceType: {
          type: 'string',
          enum: VISIBLE_TYPES.map(([key]) => key),
          description: 'Which supported piece type this most closely resembles.',
        },
        widthInches: { type: 'number', description: 'Best-guess real-world width in inches, based on typical furniture proportions (no scale reference is available in the photo).' },
        heightInches: { type: 'number', description: 'Best-guess real-world height in inches.' },
        depthInches: { type: 'number', description: 'Best-guess real-world depth/projection in inches.' },
        frontStyle: { type: 'string', enum: FRONT_STYLES, description: 'Cabinet door/drawer front style, if this is a cabinet type. Use "none" if the front is open/no doors visible.' },
        handleStyle: { type: 'string', enum: HANDLE_STYLES },
        doorProfile: { type: 'string', enum: Object.keys(DOOR_PROFILE_LABELS), description: 'Only relevant when frontStyle is slab or shaker.' },
        hasCountertop: { type: 'boolean' },
        hasFootrest: { type: 'boolean', description: 'Only relevant for a bar.' },
        legStyle: { type: 'string', enum: LEG_STYLES, description: 'Only relevant for a table.' },
        topEdge: { type: 'string', enum: TOP_EDGES, description: 'Only relevant for a table.' },
        backPanel: { type: 'string', enum: BACK_PANELS, description: 'Only relevant for shelving.' },
        finishCode: {
          type: 'string',
          enum: ALL_FINISH_CODES,
          description: 'Closest-matching manufacturer finish code by visual color/grain, from the provided list.',
        },
        description: {
          type: 'string',
          description: 'One short plain-English sentence describing what was detected, to show the customer for confirmation.',
        },
      },
      required: ['isFurniture', 'description'],
    },
  }
}

function buildSystemPrompt() {
  const typeLines = VISIBLE_TYPES.map(([key, def]) => {
    const hints = []
    if (def.cabinet) hints.push('a cabinet/carcass with optional door fronts')
    if (def.barOverhang) hints.push('counter-height with a front overhang and often a footrest')
    if (key === 'upper_cabinet') hints.push('wall-mounted, bottom typically ~54in above the floor')
    if (key === 'lower_cabinet') hints.push('base/counter-height cabinet, usually ~34-36in tall')
    if (key === 'tall_closet') hints.push('full-height wardrobe/closet')
    return `- ${key}: ${def.label}${hints.length ? ` (${hints.join('; ')})` : ''}`
  }).join('\n')

  return [
    'You help a custom-furniture configurator understand a photo a customer uploaded of a piece they want built.',
    'Identify the single piece of cabinetry/furniture shown and report it via the report_furniture_analysis tool.',
    '',
    'Supported piece types:',
    typeLines,
    '',
    'If the photo does not clearly show ONE of these as a single piece (e.g. a whole room, an unrelated object, or too unclear/cropped to tell), set isFurniture to false and skip the other fields.',
    '',
    'There is no scale reference in a photo, so estimate realistic real-world dimensions using standard furniture proportions and common sense (e.g. base cabinets ~34-36in tall, dining tables ~28-30in tall, upper cabinets are usually 30-42in tall themselves). These are best-guess estimates the customer will adjust, not measurements.',
    '',
    'For the finish/color, pick the single closest match from this list of available manufacturer finishes, based on visual color and grain/texture similarity (it does not need to be an exact match):',
    FINISH_LINES.join('\n'),
  ].join('\n')
}

class VisionConfigError extends Error {}
class VisionApiError extends Error {}

/**
 * Analyze a base64-encoded photo and return a raw (unvalidated) tool-input
 * object from the model. Throws VisionConfigError if no API key is set,
 * VisionApiError on any upstream failure.
 */
export async function analyzeFurniturePhoto(base64Data, mediaType) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new VisionConfigError('Photo analysis is not configured (missing ANTHROPIC_API_KEY).')

  const model = process.env.ANTHROPIC_VISION_MODEL || DEFAULT_MODEL
  const tool = buildTool()

  let response
  try {
    response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model,
        max_tokens: 1024,
        system: buildSystemPrompt(),
        tools: [tool],
        tool_choice: { type: 'tool', name: TOOL_NAME },
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64Data } },
            { type: 'text', text: 'Analyze this photo of the furniture/cabinetry the customer wants.' },
          ],
        }],
      }),
    })
  } catch (err) {
    throw new VisionApiError(`Could not reach the vision API: ${err.message}`)
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new VisionApiError(`Vision API error ${response.status}: ${body.slice(0, 300)}`)
  }

  const payload = await response.json()
  const toolUse = payload?.content?.find(block => block.type === 'tool_use' && block.name === TOOL_NAME)
  if (!toolUse?.input) throw new VisionApiError('Vision API did not return a structured result.')
  return toolUse.input
}

function clampNumber(value, min, max, fallback) {
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.min(max, Math.max(min, n))
}

/**
 * Validate/clamp the model's raw tool output against our real schema
 * (PIECE_DEFS ranges, known enums) — never trust the model's enums or
 * numbers directly, same spirit as sanitizePiece() for user input.
 */
export function sanitizeAnalysis(raw) {
  if (!raw?.isFurniture) {
    return { isFurniture: false, description: String(raw?.description ?? '').slice(0, 300) || 'Could not confidently identify a supported furniture piece in this photo.' }
  }

  const pieceType = VISIBLE_TYPES.some(([key]) => key === raw.pieceType) ? raw.pieceType : VISIBLE_TYPES[0][0]
  const def = PIECE_DEFS[pieceType]

  const result = {
    isFurniture: true,
    pieceType,
    description: String(raw.description ?? '').slice(0, 300),
    width: clampNumber(Number(raw.widthInches) / 12, def.minWidth, def.maxWidth, def.defaultWidth),
    height: clampNumber(Number(raw.heightInches) / 12, def.minHeight, def.maxHeight, def.defaultHeight),
    depth: clampNumber(Number(raw.depthInches) / 12, def.minDepth, def.maxDepth, def.defaultDepth),
  }

  const finishCode = ALL_FINISH_CODES.includes(raw.finishCode) ? raw.finishCode : DEFAULT_FINISH
  result.bodyFamily = CODE_TO_FAMILY[finishCode] ?? DEFAULT_FAMILY
  result.bodyFinish = finishCode

  if (def.cabinet) {
    result.frontStyle = (def.frontStyles ?? []).includes(raw.frontStyle) ? raw.frontStyle : 'none'
    result.handleStyle = HANDLE_STYLES.includes(raw.handleStyle) ? raw.handleStyle : 'bar'
    if (['slab', 'shaker'].includes(result.frontStyle)) {
      result.doorProfile = Object.keys(DOOR_PROFILE_LABELS).includes(raw.doorProfile) ? raw.doorProfile : DEFAULT_DOOR_PROFILE
    }
    if (def.canCountertop) result.countertop = Boolean(raw.hasCountertop)
    if (def.defaultHasFootrest !== undefined) result.hasFootrest = Boolean(raw.hasFootrest)
  } else {
    if (def.legStyleOptions) {
      result.legStyle = LEG_STYLES.includes(raw.legStyle) ? raw.legStyle : def.defaultLegStyle
      result.topEdge = TOP_EDGES.includes(raw.topEdge) ? raw.topEdge : def.defaultTopEdge
    }
    if (def.backPanelOptions) {
      result.backPanel = BACK_PANELS.includes(raw.backPanel) ? raw.backPanel : def.defaultBackPanel
    }
  }

  return result
}

export { VisionConfigError, VisionApiError }
