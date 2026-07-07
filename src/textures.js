import { useMemo, useState, useEffect } from 'react'
import * as THREE from 'three'

// Procedural canvas textures — avoids bundling real image assets for a local
// prototype. Base textures are cached per color+kind so the canvas is only
// drawn once; call sites clone() and set repeat independently per mesh size.

const SIZE = 256
const baseCache = new Map()

function shade(hex, amount) {
  const c = new THREE.Color(hex)
  const hsl = {}
  c.getHSL(hsl)
  hsl.l = Math.min(1, Math.max(0, hsl.l + amount))
  c.setHSL(hsl.h, hsl.s, hsl.l)
  return `#${c.getHexString()}`
}

function drawWoodGrain(ctx, hex) {
  ctx.fillStyle = hex
  ctx.fillRect(0, 0, SIZE, SIZE)

  // Wavy horizontal grain streaks, alternating slightly darker/lighter.
  const streaks = 34
  for (let i = 0; i < streaks; i++) {
    const y = (i / streaks) * SIZE + (Math.random() - 0.5) * 4
    const darker = i % 2 === 0
    ctx.strokeStyle = shade(hex, darker ? -0.06 - Math.random() * 0.04 : 0.04 + Math.random() * 0.03)
    ctx.globalAlpha = 0.35 + Math.random() * 0.25
    ctx.lineWidth = 1 + Math.random() * 1.5
    ctx.beginPath()
    ctx.moveTo(0, y)
    const segments = 6
    for (let s = 1; s <= segments; s++) {
      const x = (s / segments) * SIZE
      const wobble = Math.sin(s * 1.7 + i) * 3
      ctx.lineTo(x, y + wobble)
    }
    ctx.stroke()
  }
  ctx.globalAlpha = 1
}

function drawFabricWeave(ctx, hex) {
  ctx.fillStyle = hex
  ctx.fillRect(0, 0, SIZE, SIZE)

  // Fine crosshatch weave pattern.
  const step = 4
  ctx.globalAlpha = 0.12
  ctx.strokeStyle = shade(hex, -0.12)
  ctx.lineWidth = 1
  for (let x = 0; x <= SIZE; x += step) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, SIZE)
    ctx.stroke()
  }
  ctx.strokeStyle = shade(hex, 0.10)
  for (let y = 0; y <= SIZE; y += step) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(SIZE, y)
    ctx.stroke()
  }
  ctx.globalAlpha = 1
}

function buildBaseTexture(hex, kind) {
  const key = `${kind}:${hex}`
  if (baseCache.has(key)) return baseCache.get(key)

  const canvas = document.createElement('canvas')
  canvas.width = SIZE
  canvas.height = SIZE
  const ctx = canvas.getContext('2d')
  if (kind === 'wood') drawWoodGrain(ctx, hex)
  else drawFabricWeave(ctx, hex)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  baseCache.set(key, texture)
  return texture
}

/** Base (un-tiled) wood grain texture for a given hex color, cached. */
export function getWoodBaseTexture(hex) {
  return buildBaseTexture(hex, 'wood')
}

/** Base (un-tiled) fabric weave texture for a given hex color, cached. */
export function getFabricBaseTexture(hex) {
  return buildBaseTexture(hex, 'fabric')
}

/**
 * Clones a base texture and sets an independent repeat, memoized per
 * base/repeat combination. Use inside a piece component so each mesh face
 * tiles proportionally to its own real-world size.
 */
export function useTiledTexture(baseTexture, repeatX, repeatY, version = 0) {
  return useMemo(() => {
    const tex = baseTexture.clone()
    tex.needsUpdate = true
    tex.repeat.set(Math.max(0.5, repeatX), Math.max(0.5, repeatY))
    // version marks which load-state of the base this clone captured — a bump
    // after the image finishes loading forces a fresh clone with pixels in it
    tex.userData.baseVersion = version
    return tex
  }, [baseTexture, repeatX, repeatY, version])
}

// ── Image-based finish textures (manufacturer swatch photos) ────────────────

const imageCache = new Map() // url -> { texture, loaded, listeners: Set }

function getImageBaseTexture(url) {
  if (imageCache.has(url)) return imageCache.get(url)
  const entry = { texture: null, loaded: false, listeners: new Set() }
  entry.texture = new THREE.TextureLoader().load(url, () => {
    entry.loaded = true
    entry.listeners.forEach(fn => fn())
    entry.listeners.clear()
  })
  entry.texture.colorSpace = THREE.SRGBColorSpace
  entry.texture.wrapS = entry.texture.wrapT = THREE.RepeatWrapping
  imageCache.set(url, entry)
  return entry
}

/**
 * Tiled texture for a catalog finish ({image} photo swatch or {color}
 * procedural fallback). Non-suspending: photo swatches pop in when loaded
 * (a version bump re-clones the texture so late-loading images propagate).
 */
export function useFinishTexture(finish, repeatX, repeatY) {
  const [version, setVersion] = useState(0)
  const entry = finish?.image ? getImageBaseTexture(finish.image) : null

  useEffect(() => {
    if (!entry || entry.loaded) return
    const bump = () => setVersion(v => v + 1)
    entry.listeners.add(bump)
    return () => entry.listeners.delete(bump)
  }, [entry])

  const base = entry ? entry.texture : getWoodBaseTexture(finish?.color ?? '#c8a96e')
  return useTiledTexture(base, repeatX, repeatY, version)
}
