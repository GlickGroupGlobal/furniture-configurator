export const MATERIALS = {
  solid_oak:     { label: 'Solid Oak',         color: '#c8a96e', roughness: 0.60 },
  solid_walnut:  { label: 'Solid Walnut',      color: '#5c3d2e', roughness: 0.65 },
  painted_birch: { label: 'Painted Birch Ply', color: '#e2ddd6', roughness: 0.88 },
  painted_mdf:   { label: 'Painted MDF',       color: '#dce0e8', roughness: 0.88 },
}

// Upholstery is a separate material family from the wood/paint MATERIALS above —
// used for sofa cushions/back, since a sofa isn't realistically "solid oak."
export const UPHOLSTERY_MATERIALS = {
  linen_natural:        { label: 'Natural Linen',         color: '#e8e1d3', roughness: 0.95 },
  performance_charcoal: { label: 'Performance Charcoal',  color: '#3f3d3c', roughness: 0.92 },
  velvet_emerald:       { label: 'Emerald Velvet',        color: '#1f4d3d', roughness: 0.55 },
}

export const DEFAULT_UPHOLSTERY = 'linen_natural'

export const DOOR_STYLE_LABELS = {
  paneled: 'Paneled',
  slab:    'Flat Slab',
  drawers: 'Drawers',
  glass:   'Glass Front',
  open:    'Open (No Door)',
}

export const HANDLE_STYLE_LABELS = {
  bar:  'Bar Pull',
  knob: 'Knob',
  none: 'None (Finger Groove)',
}

export const FRONT_STYLE_LABELS = {
  paneled:      'Paneled',
  slab:         'Flat Slab',
  'open-shelf': 'Open Shelf',
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

export const ARM_STYLE_LABELS = {
  track:  'Track Arm',
  rolled: 'Rolled Arm',
  none:   'Armless',
}

export const BACK_STYLE_LABELS = {
  'cushion-back': 'Cushion Back',
  'tight-back':   'Tight Back',
}

export const BACK_PANEL_LABELS = {
  solid: 'Solid Back',
  open:  'Open Back',
}

export const PIECE_DEFS = {
  lower_cabinet: {
    label: 'Lower Cabinet',
    elevation: 0,
    defaultWidth: 2, defaultHeight: 2.875, defaultDepth: 2,
    minWidth: 1,   maxWidth: 8,
    minHeight: 2.5, maxHeight: 3.5,
    minDepth: 1.5,  maxDepth: 2.5,
    doorStyleOptions: ['paneled', 'slab', 'drawers', 'open'],
    defaultDoorStyle: 'paneled',
    handleStyleOptions: ['bar', 'knob', 'none'],
    defaultHandleStyle: 'bar',
  },
  upper_cabinet: {
    label: 'Upper Cabinet',
    elevation: 4.5,   // standard: 54" from floor to bottom of upper
    defaultWidth: 2, defaultHeight: 2.5, defaultDepth: 1,
    minWidth: 1,   maxWidth: 6,
    minHeight: 1.5, maxHeight: 3.5,
    minDepth: 0.75, maxDepth: 1.5,
    doorStyleOptions: ['paneled', 'slab', 'glass', 'open'],
    defaultDoorStyle: 'paneled',
    handleStyleOptions: ['bar', 'knob', 'none'],
    defaultHandleStyle: 'bar',
  },
  bar: {
    label: 'Bar',
    elevation: 0,
    defaultWidth: 5, defaultHeight: 3.5, defaultDepth: 2.5,
    minWidth: 2,   maxWidth: 12,
    minHeight: 3,   maxHeight: 4,
    minDepth: 1.5,  maxDepth: 3.5,
    frontStyleOptions: ['paneled', 'slab', 'open-shelf'],
    defaultFrontStyle: 'paneled',
    handleStyleOptions: ['bar', 'knob', 'none'],
    defaultHandleStyle: 'bar',
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
  sofa: {
    label: 'Sofa',
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
  shelving: {
    label: 'Shelving',
    elevation: 0,
    defaultWidth: 3, defaultHeight: 7, defaultDepth: 1,
    minWidth: 1.5,  maxWidth: 8,
    minHeight: 3,   maxHeight: 9,
    minDepth: 0.75, maxDepth: 2,
    backPanelOptions: ['solid', 'open'],
    defaultBackPanel: 'solid',
    doorStyleOptions: ['open', 'glass', 'solid'],
    defaultDoorStyle: 'open',
  },
}

export const DEFAULT_MATERIAL = 'solid_oak'
