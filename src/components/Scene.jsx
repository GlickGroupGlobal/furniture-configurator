import { useRef, useState, useCallback, useEffect } from 'react'
import { OrbitControls, Grid, Environment, ContactShadows } from '@react-three/drei'
import Room from './Room'
import FurniturePiece from './FurniturePiece'
import ViewCamera from './ViewCamera'
import { RoomDimensionLabels } from './DimensionLabels'
import { applySnap }        from '../snap'
import { resolveCollision } from '../collision'

export default function Scene({ room, pieces, selectedId, setSelectedId, updatePiece, viewMode }) {
  const dragging  = useRef(null)
  const roomRef   = useRef(room)
  const piecesRef = useRef(pieces)
  const [isDragging, setIsDragging] = useState(false)

  // Keep refs current without recreating handlers
  useEffect(() => { roomRef.current   = room   }, [room])
  useEffect(() => { piecesRef.current = pieces }, [pieces])

  const onPiecePointerDown = useCallback((e, piece) => {
    e.stopPropagation()
    setSelectedId(piece.id)
    dragging.current = {
      id:      piece.id,
      offsetX: piece.x - e.point.x,
      offsetZ: piece.z - e.point.z,
    }
    setIsDragging(true)
  }, [setSelectedId])

  const onFloorPointerDown = useCallback(() => {
    if (!dragging.current) setSelectedId(null)
  }, [setSelectedId])

  const onFloorPointerMove = useCallback((e) => {
    if (!dragging.current) return
    const rawX = e.point.x + dragging.current.offsetX
    const rawZ = e.point.z + dragging.current.offsetZ

    // Find the piece being dragged so snap can read its dimensions/type
    const draggingPiece = piecesRef.current.find(p => p.id === dragging.current.id)
    if (!draggingPiece) return

    const { x: snapX, z: snapZ, elevation } = applySnap(
      draggingPiece, rawX, rawZ, roomRef.current, piecesRef.current
    )
    // Resolve collisions against other pieces (uses updated elevation from snap)
    const { x, z } = resolveCollision(
      { ...draggingPiece, elevation },
      snapX, snapZ,
      piecesRef.current
    )
    updatePiece(dragging.current.id, { x, z, elevation })
  }, [updatePiece])

  const onFloorPointerUp = useCallback(() => {
    dragging.current = null
    setIsDragging(false)
  }, [])

  const target =
    viewMode === 'top'   ? [0, 0, 0] :
    viewMode === 'front' ? [0, room.height / 2, 0] :
    [0, room.height * 0.3, 0]

  // Shadow camera frustum sized to the actual room footprint (with margin)
  // instead of three.js's default — keeps shadow resolution sharp instead
  // of spreading 2048px across a much larger default area.
  const shadowExtent = Math.max(room.width, room.length) * 0.75

  return (
    <>
      <ViewCamera viewMode={viewMode} room={room} />

      <hemisphereLight skyColor="#fff6ea" groundColor="#cbb89a" intensity={0.55} />
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[room.width * 0.4, room.height * 2, room.length * 0.4]}
        intensity={1.1}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-shadowExtent}
        shadow-camera-right={shadowExtent}
        shadow-camera-top={shadowExtent}
        shadow-camera-bottom={-shadowExtent}
        shadow-camera-near={0.5}
        shadow-camera-far={room.height * 6}
        shadow-bias={-0.0002}
        shadow-normalBias={0.03}
      />
      <directionalLight position={[-5, 8, -5]} intensity={0.25} />

      <Environment preset="apartment" background={false} environmentIntensity={0.35} />

      {/* Large invisible plane — captures drag & deselect pointer events */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.001, 0]}
        onPointerDown={onFloorPointerDown}
        onPointerMove={onFloorPointerMove}
        onPointerUp={onFloorPointerUp}
      >
        <planeGeometry args={[200, 200]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      <Grid
        args={[100, 100]}
        cellSize={1}
        cellThickness={0.3}
        cellColor="#d8cdbb"
        sectionSize={5}
        sectionThickness={0.6}
        sectionColor="#c2b39c"
        fadeDistance={50}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid
        position={[0, -0.002, 0]}
      />

      <Room width={room.width} length={room.length} height={room.height} />
      <RoomDimensionLabels room={room} />

      <ContactShadows
        position={[0, 0.002, 0]}
        opacity={0.45}
        scale={Math.max(room.width, room.length) * 1.4}
        blur={2.4}
        far={room.height * 0.5}
      />

      {pieces.map(piece => (
        <FurniturePiece
          key={piece.id}
          piece={piece}
          selected={piece.id === selectedId}
          onPointerDown={onPiecePointerDown}
        />
      ))}

      <OrbitControls
        enabled={!isDragging}
        enablePan
        enableZoom
        enableRotate={viewMode === 'orbit'}
        maxPolarAngle={viewMode === 'orbit' ? Math.PI / 2.05 : undefined}
        target={target}
      />
    </>
  )
}
