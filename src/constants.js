export const MATERIALS = {
  solid_oak:     { label: 'Solid Oak',         color: '#c8a96e', roughness: 0.60 },
  solid_walnut:  { label: 'Solid Walnut',      color: '#5c3d2e', roughness: 0.65 },
  painted_birch: { label: 'Painted Birch Ply', color: '#e2ddd6', roughness: 0.88 },
  painted_mdf:   { label: 'Painted MDF',       color: '#dce0e8', roughness: 0.88 },
}

export const PIECE_DEFS = {
  lower_cabinet: {
    label: 'Lower Cabinet',
    defaultWidth: 2, defaultHeight: 2.875, defaultDepth: 2,
    minWidth: 1, maxWidth: 8,
    minHeight: 2.5, maxHeight: 3.5,
    minDepth: 1.5, maxDepth: 2.5,
  },
}

export const DEFAULT_MATERIAL = 'solid_oak'
