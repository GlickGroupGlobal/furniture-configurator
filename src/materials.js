// Material catalog — the single source of truth for what customers can order.
//
// Families are the board types we actually promote (particle board, FOSB
// board, plywood). Each family has finishes; particle board's finishes are real
// manufacturer swatch photos in src/assets/materials/particle-board/.
// Drop future swatch zips into src/assets/materials/<family-folder>/ and add
// entries below — the glob import picks the images up automatically.

// Map of '/src/assets/materials/<folder>/<CODE>.jpg' -> resolved URL
const swatchModules = import.meta.glob('./assets/materials/*/*.jpg', {
  eager: true,
  query: '?url',
  import: 'default',
})

function swatchUrl(folder, code) {
  return swatchModules[`./assets/materials/${folder}/${code}.jpg`] ?? null
}

// English display names are best-effort translations of the manufacturer's
// Chinese finish names — rename freely; the code is what the manufacturer needs.
const PARTICLE_BOARD_FINISHES = [
  { code: 'BL23-S53',    name: 'Indo White' },
  { code: 'BL23-S56',    name: 'Cypress' },
  { code: 'BL21-SC08',   name: 'Silver Pear' },
  { code: 'BL25-S90',    name: 'Pale Ash' },
  { code: 'BL23-S55',    name: 'Prussian Ash' },
  { code: 'BL23-S49',    name: 'French Plane' },
  { code: 'BL25-S88',    name: 'Freehand Oak' },
  { code: 'BL25-S89',    name: 'Monet Oak' },
  { code: 'BL23-S54',    name: 'Guinness Oak' },
  { code: 'BL19-GC0008', name: 'Osmanthus' },
  { code: 'BL25-S92',    name: 'Dusk Elm' },
  { code: 'BL23-S35',    name: 'Smoked Walnut' },
  { code: 'BL25-S91',    name: 'Gothic Walnut' },
  { code: 'BL25-S93',    name: 'Obsidian' },
].map(f => ({ ...f, image: swatchUrl('particle-board', f.code) }))

// Placeholder finishes until the FOSB / plywood swatch zips arrive —
// `color` drives a procedural texture (see textures.js) instead of an image.
const FOSB_FINISHES = [
  { code: 'FOSB-NAT', name: 'Natural FOSB',  color: '#d3b98a' },
  { code: 'FOSB-CLR', name: 'Clear-Sealed',  color: '#c9a86b' },
]

const PLYWOOD_FINISHES = [
  { code: 'PLY-BIRCH', name: 'Birch',        color: '#e4d5b5' },
  { code: 'PLY-OAK',   name: 'Oak Veneer',   color: '#c8a96e' },
  { code: 'PLY-WAL',   name: 'Walnut Veneer', color: '#5c3d2e' },
]

export const MATERIAL_FAMILIES = {
  particle_board: { label: 'Particle Board', finishes: PARTICLE_BOARD_FINISHES },
  osb:            { label: 'FOSB Board',     finishes: FOSB_FINISHES },
  plywood:        { label: 'Plywood',        finishes: PLYWOOD_FINISHES },
}

export const DEFAULT_FAMILY = 'particle_board'
export const DEFAULT_FINISH = 'BL23-S54' // Guinness Oak

export const GLASS_TINTS = {
  clear:   { label: 'Clear Glass',   color: '#dfe9ee', transmission: 0.85, roughness: 0.05 },
  frosted: { label: 'Frosted Glass', color: '#e8eef0', transmission: 0.55, roughness: 0.45 },
}

export const DEFAULT_GLASS_TINT = 'clear'

/** Look up a finish entry ({code, name, image?, color?}) by family + code, with safe fallbacks. */
export function getFinish(familyKey, finishCode) {
  const family = MATERIAL_FAMILIES[familyKey] ?? MATERIAL_FAMILIES[DEFAULT_FAMILY]
  return family.finishes.find(f => f.code === finishCode) ?? family.finishes[0]
}
