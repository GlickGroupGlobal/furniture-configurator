export const MATERIALS = {
  solid_oak:     { label: 'Solid Oak',         color: '#c8a96e', roughness: 0.60 },
  solid_walnut:  { label: 'Solid Walnut',      color: '#5c3d2e', roughness: 0.65 },
  painted_birch: { label: 'Painted Birch Ply', color: '#e2ddd6', roughness: 0.88 },
  painted_mdf:   { label: 'Painted MDF',       color: '#dce0e8', roughness: 0.88 },
}

export const PIECE_DEFS = {
  lower_cabinet: {
    label: 'Lower Cabinet',
    elevation: 0,
    defaultWidth: 2, defaultHeight: 2.875, defaultDepth: 2,
    minWidth: 1,   maxWidth: 8,
    minHeight: 2.5, maxHeight: 3.5,
    minDepth: 1.5,  maxDepth: 2.5,
  },
  upper_cabinet: {
    label: 'Upper Cabinet',
    elevation: 4.5,   // standard: 54" from floor to bottom of upper
    defaultWidth: 2, defaultHeight: 2.5, defaultDepth: 1,
    minWidth: 1,   maxWidth: 6,
    minHeight: 1.5, maxHeight: 3.5,
    minDepth: 0.75, maxDepth: 1.5,
  },
  bar: {
    label: 'Bar',
    elevation: 0,
    defaultWidth: 5, defaultHeight: 3.5, defaultDepth: 2.5,
    minWidth: 2,   maxWidth: 12,
    minHeight: 3,   maxHeight: 4,
    minDepth: 1.5,  maxDepth: 3.5,
  },
  table: {
    label: 'Table',
    elevation: 0,
    defaultWidth: 5, defaultHeight: 2.5, defaultDepth: 3,
    minWidth: 2,   maxWidth: 10,
    minHeight: 2,   maxHeight: 3.5,
    minDepth: 2,    maxDepth: 5,
  },
  sofa: {
    label: 'Sofa',
    elevation: 0,
    defaultWidth: 7, defaultHeight: 2.75, defaultDepth: 3,
    minWidth: 4,   maxWidth: 12,
    minHeight: 2.5, maxHeight: 3.5,
    minDepth: 2.5,  maxDepth: 4,
  },
  shelving: {
    label: 'Shelving',
    elevation: 0,
    defaultWidth: 3, defaultHeight: 7, defaultDepth: 1,
    minWidth: 1.5,  maxWidth: 8,
    minHeight: 3,   maxHeight: 9,
    minDepth: 0.75, maxDepth: 2,
  },
}

export const DEFAULT_MATERIAL = 'solid_oak'
