// Piece type definitions. Material families/finishes live in materials.js.

// Legacy solid-wood palette — still used by the room floor and the (hidden)
// sofa's frame; customer-facing cabinet materials come from materials.js.
export const MATERIALS = {
  solid_oak:     { label: 'Solid Oak',         color: '#c8a96e', roughness: 0.60 },
  solid_walnut:  { label: 'Solid Walnut',      color: '#5c3d2e', roughness: 0.65 },
  painted_birch: { label: 'Painted Birch Ply', color: '#e2ddd6', roughness: 0.88 },
  painted_mdf:   { label: 'Painted MDF',       color: '#dce0e8', roughness: 0.88 },
}

export const UPHOLSTERY_MATERIALS = {
  linen_natural:        { label: 'Natural Linen',         color: '#e8e1d3', roughness: 0.95 },
  performance_charcoal: { label: 'Performance Charcoal',  color: '#3f3d3c', roughness: 0.92 },
  velvet_emerald:       { label: 'Emerald Velvet',        color: '#1f4d3d', roughness: 0.55 },
}

export const DEFAULT_UPHOLSTERY = 'linen_natural'
export const DEFAULT_MATERIAL = 'solid_oak'

export const FRONT_STYLE_LABELS = {
  none:    'Open (No Fronts)',
  slab:    'Door Panels',
  shaker:  'Door Panels',
  glass:   'Glass',
  drawers: 'Drawers',
}

export const DOOR_PROFILE_LABELS = {
  mx1801: 'MX-1801 Flat Frame',
  pf: 'PF Raised Frame',
  bl5863: 'BL-5863 Beadboard',
  mx1804: 'MX-1804 Narrow Raised',
  bl22m13: 'BL22-M13 Fluted',
  bl23m17: 'BL23-M17 Arched',
  bl23m19: 'BL23-M19 French',
}

export const DEFAULT_DOOR_PROFILE = 'mx1801'

export const HANDLE_STYLE_LABELS = {
  bar:  'Bar Pull',
  knob: 'Knob',
  none: 'None (Finger Groove)',
}

export const LEG_STYLE_LABELS = {
  tapered:  'Tapered',
  turned:   'Turned',
  pedestal: 'Pedestal',
}

export const TOP_EDGE_LABELS = {
  square:  'Square Edge',
  rounded: 'Rounded Edge',
}

export const PIECE_DEFS = {
  lower_cabinet: {
    label: 'Lower Cabinet',
    elevation: 0,
    defaultWidth: 2, defaultHeight: 2.875, defaultDepth: 2,
    minWidth: 1,   maxWidth: 8,
    minHeight: 2.5, maxHeight: 3.5,
    minDepth: 1.5,  maxDepth: 2.5,
    cabinet: true,
    toeKick: true,
    frontStyles: ['none', 'slab', 'shaker', 'glass', 'drawers'],
    canCountertop: true,
  },
  upper_cabinet: {
    label: 'Upper Cabinet',
    elevation: 4.5,   // standard: 54" from floor to bottom of upper
    defaultWidth: 2, defaultHeight: 2.5, defaultDepth: 1,
    minWidth: 1,   maxWidth: 6,
    minHeight: 1.5, maxHeight: 3.5,
    minDepth: 0.75, maxDepth: 1.5,
    cabinet: true,
    frontStyles: ['none', 'slab', 'shaker', 'glass'],
  },
  tall_closet: {
    label: 'Full-Height Closet',
    elevation: 0,
    defaultWidth: 3, defaultHeight: 7.5, defaultDepth: 2,
    minWidth: 1.5,  maxWidth: 10,
    minHeight: 6,   maxHeight: 9,
    minDepth: 1.5,  maxDepth: 2.5,
    cabinet: true,
    toeKick: true,
    frontStyles: ['none', 'slab', 'shaker', 'glass', 'drawers'],
  },
  bar: {
    label: 'Bar',
    elevation: 0,
    defaultWidth: 5, defaultHeight: 3.5, defaultDepth: 2.5,
    minWidth: 2,   maxWidth: 12,
    minHeight: 3,   maxHeight: 4,
    minDepth: 1.5,  maxDepth: 3.5,
    cabinet: true,
    toeKick: true,
    barOverhang: true,          // counter overhangs the customer side
    frontStyles: ['none', 'slab', 'shaker'],
    canCountertop: true,
    defaultCountertop: true,    // a bar isn't a bar without a top
    defaultHasFootrest: true,
  },
  table: {
    label: 'Table',
    elevation: 0,
    defaultWidth: 5, defaultHeight: 2.5, defaultDepth: 3,
    minWidth: 2,   maxWidth: 10,
    minHeight: 2,   maxHeight: 3.5,
    minDepth: 2,    maxDepth: 5,
    legStyleOptions: ['tapered', 'turned', 'pedestal'],
    defaultLegStyle: 'tapered',
    topEdgeOptions: ['square', 'rounded'],
    defaultTopEdge: 'square',
  },
  shelving: {
    label: 'Shelving',
    elevation: 0,
    defaultWidth: 3, defaultHeight: 7, defaultDepth: 1,
    minWidth: 1.5,  maxWidth: 8,
    minHeight: 3,   maxHeight: 9,
    minDepth: 0.75, maxDepth: 2,
    backPanelOptions: ['solid', 'open'],
    defaultBackPanel: 'solid',
  },
  sofa: {
    label: 'Sofa',
    hidden: true,   // out of the palette for now — component kept for later
    elevation: 0,
    defaultWidth: 7, defaultHeight: 2.75, defaultDepth: 3,
    minWidth: 4,   maxWidth: 12,
    minHeight: 2.5, maxHeight: 3.5,
    minDepth: 2.5,  maxDepth: 4,
    armStyleOptions: ['track', 'rolled', 'none'],
    defaultArmStyle: 'track',
    backStyleOptions: ['cushion-back', 'tight-back'],
    defaultBackStyle: 'cushion-back',
  },
}
