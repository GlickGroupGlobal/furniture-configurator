// Material catalog — the single source of truth for what customers can order.
// Pure data (codes/names/families) lives in materialsData.js so it can also
// be imported by the Node server (server/vision.js) without Vite's
// import.meta.glob. This file just attaches browser-resolved swatch images.

import {
  MATERIAL_FAMILY_DATA,
  DEFAULT_FAMILY,
  DEFAULT_FINISH,
  GLASS_TINTS,
  DEFAULT_GLASS_TINT,
} from './materialsData'

export { DEFAULT_FAMILY, DEFAULT_FINISH, GLASS_TINTS, DEFAULT_GLASS_TINT }

// Map of '/src/assets/materials/<folder>/<CODE>.jpg' -> resolved URL
const swatchModules = import.meta.glob('./assets/materials/*/*.jpg', {
  eager: true,
  query: '?url',
  import: 'default',
})

function swatchUrl(folder, code) {
  return swatchModules[`./assets/materials/${folder}/${code}.jpg`] ?? null
}

export const MATERIAL_FAMILIES = Object.fromEntries(
  Object.entries(MATERIAL_FAMILY_DATA).map(([key, family]) => [
    key,
    {
      label: family.label,
      finishes: family.finishes.map(f => ({ ...f, image: swatchUrl(family.folder, f.code) })),
    },
  ])
)

/** Look up a finish entry ({code, name, image?, color?}) by family + code, with safe fallbacks. */
export function getFinish(familyKey, finishCode) {
  const family = MATERIAL_FAMILIES[familyKey] ?? MATERIAL_FAMILIES[DEFAULT_FAMILY]
  return family.finishes.find(f => f.code === finishCode) ?? family.finishes[0]
}
