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

const FOSB_FINISHES = [
  { code: 'BL23-S46L',  name: 'Angel White' },
  { code: 'BL25-S94L',  name: 'Cloud White' },
  { code: 'BL25-S95L',  name: 'Arctic White' },
  { code: 'BL24-S69L',  name: 'Snow Velvet' },
  { code: 'BL23-S47L',  name: 'Pearl Gray' },
  { code: 'BL23-S34L',  name: 'Dusk Gray' },
  { code: 'BL23-S48L',  name: 'Prague Gray' },
  { code: 'BL24-S85L',  name: 'Moonlight Gray' },
  { code: 'BL24-S66L',  name: 'Titanium Gray' },
  { code: 'BL24-S68L',  name: 'Prismatic Black' },
  { code: 'BL21-SC05',  name: 'Munich' },
  { code: 'BL21-SC07L', name: 'Para Stone' },
  { code: 'BL22-S14L',  name: 'Coral Red' },
  { code: 'BL22-S28',   name: 'Pea Green' },
  { code: 'BL24-S87L',  name: 'Dream Blue' },
  { code: 'BL23-S36L',  name: 'Misty Oak' },
  { code: 'BL25-S96L',  name: 'Cream Oak' },
  { code: 'BL25-S97L',  name: 'Camel Oak' },
  { code: 'BL25-S98L',  name: 'Espresso Oak' },
  { code: 'BL23-S41L',  name: 'Walnut' },
  { code: 'BL23-S52L',  name: 'Maple Walnut' },
  { code: 'BL25-S99L',  name: 'Caramel Walnut' },
  { code: 'BL25-S100L', name: 'Chestnut Walnut' },
  { code: 'BL25-S101L', name: 'Wheat Cherry' },
  { code: 'BL25-S102L', name: 'Sand Cherry' },
  { code: 'BL25-S103L', name: 'Brick Cherry' },
  { code: 'BL23-S45L',  name: 'Lawrence' },
  { code: 'ITA-GRE',    name: 'Guerrero Elm' },
  { code: 'ITA-NAP',    name: 'Naples' },
].map(f => ({ ...f, image: swatchUrl('fosb', f.code) }))

const PLYWOOD_FINISHES = [
  { code: 'BL25-SD11', name: 'Ivory White' },
  { code: 'BL25-SD12', name: 'Apricot Gray' },
  { code: 'BL25-SD13', name: 'Matte Gray' },
  { code: 'BL25-SD24', name: 'Frost' },
  { code: 'BL25-SD21', name: 'Golden Maple' },
  { code: 'BL25-SD22', name: 'Mountain Stream' },
  { code: 'BL25-SD23', name: 'Twilight' },
  { code: 'BL25-SD20', name: 'Black Oak' },
  { code: 'BL25-SD25', name: 'Rose Pink' },
].map(f => ({ ...f, image: swatchUrl('plywood', f.code) }))

const PET_FINISHES = [
  { code: 'BL25-P20L', name: 'Cream White (Matt)' },
  { code: 'BL25-P21L', name: 'Iceberg White (Gloss)' },
  { code: 'BL25-P22L', name: 'Hyacinth Gray (Matt)' },
  { code: 'BL25-P23L', name: 'Light Camel (Matt)' },
  { code: 'BL25-P24L', name: 'Jeju Gray (Matt)' },
].map(f => ({ ...f, image: swatchUrl('pet', f.code) }))

const LIQUID_METAL_FINISHES = [
  { code: 'BL26-JS001', name: 'Moonlight White' },
  { code: 'BL26-JS002', name: 'Dusk Gray' },
  { code: 'BL26-JS003', name: 'Dove Gray' },
  { code: 'BL26-JS004', name: 'Starry Gray' },
  { code: 'BL26-JS006', name: 'Mystic Gray' },
  { code: 'BL26-JS010', name: 'Brushed Deep Gray' },
  { code: 'BL26-JS007', name: 'Brushed Silver' },
  { code: 'BL26-JS008', name: 'Brushed Rose Gold' },
  { code: 'BL26-JS005', name: 'Midnight Gold' },
  { code: 'BL26-JS009', name: 'Gold Medallion' },
].map(f => ({ ...f, image: swatchUrl('liquid-metal', f.code) }))

const HVEA_FINISHES = [
  { code: 'BL24-S67L',  name: 'White Emboss' },
  { code: 'BL25-S110L', name: 'Daiqi' },
  { code: 'BL25-S111L', name: 'Cassia' },
  { code: 'BL25-S112L', name: 'Roman' },
  { code: 'BL25-S113L', name: 'Margaret' },
  { code: 'BL25-S114L', name: 'Kervia' },
  { code: 'BL25-S115L', name: 'Louis' },
  { code: 'BL25-S116L', name: 'Light Ripple' },
  { code: 'BL25-S117L', name: 'Palas' },
  { code: 'BL25-S118L', name: 'Song Brocade' },
].map(f => ({ ...f, image: swatchUrl('hvea', f.code) }))

export const MATERIAL_FAMILIES = {
  particle_board: { label: 'Particle Board', finishes: PARTICLE_BOARD_FINISHES },
  osb:            { label: 'FOSB Board',     finishes: FOSB_FINISHES },
  plywood:        { label: 'Plywood',        finishes: PLYWOOD_FINISHES },
  pet:            { label: 'PET',            finishes: PET_FINISHES },
  liquid_metal:   { label: 'Liquid Metal',   finishes: LIQUID_METAL_FINISHES },
  hvea:           { label: 'HVEA',           finishes: HVEA_FINISHES },
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
