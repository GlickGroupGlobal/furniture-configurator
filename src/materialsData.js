// Pure material catalog data — codes and names only, no image resolution.
// Kept import.meta-free so it can be imported directly by the Node server
// (server/vision.js) as well as the browser bundle (via materials.js, which
// wraps this data with swatch image URLs using Vite's import.meta.glob).

export const PARTICLE_BOARD_FINISHES = [
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
]

export const FOSB_FINISHES = [
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
]

export const PLYWOOD_FINISHES = [
  { code: 'BL25-SD11', name: 'Ivory White' },
  { code: 'BL25-SD12', name: 'Apricot Gray' },
  { code: 'BL25-SD13', name: 'Matte Gray' },
  { code: 'BL25-SD24', name: 'Frost' },
  { code: 'BL25-SD21', name: 'Golden Maple' },
  { code: 'BL25-SD22', name: 'Mountain Stream' },
  { code: 'BL25-SD23', name: 'Twilight' },
  { code: 'BL25-SD20', name: 'Black Oak' },
  { code: 'BL25-SD25', name: 'Rose Pink' },
]

export const PET_FINISHES = [
  { code: 'BL25-P20L', name: 'Cream White (Matt)' },
  { code: 'BL25-P21L', name: 'Iceberg White (Gloss)' },
  { code: 'BL25-P22L', name: 'Hyacinth Gray (Matt)' },
  { code: 'BL25-P23L', name: 'Light Camel (Matt)' },
  { code: 'BL25-P24L', name: 'Jeju Gray (Matt)' },
]

export const LIQUID_METAL_FINISHES = [
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
]

export const HVEA_FINISHES = [
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
]

// folder = the swatch image directory under src/assets/materials/ (browser-only lookup)
export const MATERIAL_FAMILY_DATA = {
  particle_board: { label: 'Particle Board', folder: 'particle-board', finishes: PARTICLE_BOARD_FINISHES },
  osb:            { label: 'FOSB Board',     folder: 'fosb',           finishes: FOSB_FINISHES },
  plywood:        { label: 'Plywood',        folder: 'plywood',        finishes: PLYWOOD_FINISHES },
  pet:            { label: 'PET',            folder: 'pet',            finishes: PET_FINISHES },
  liquid_metal:   { label: 'Liquid Metal',   folder: 'liquid-metal',   finishes: LIQUID_METAL_FINISHES },
  hvea:           { label: 'HVEA',           folder: 'hvea',           finishes: HVEA_FINISHES },
}

export const DEFAULT_FAMILY = 'particle_board'
export const DEFAULT_FINISH = 'BL23-S54' // Guinness Oak

export const GLASS_TINTS = {
  clear:   { label: 'Clear Glass',   color: '#dfe9ee', transmission: 0.85, roughness: 0.05 },
  frosted: { label: 'Frosted Glass', color: '#e8eef0', transmission: 0.55, roughness: 0.45 },
}

export const DEFAULT_GLASS_TINT = 'clear'
