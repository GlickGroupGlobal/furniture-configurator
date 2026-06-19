import { useRef, useState, useCallback, useEffect } from 'react'
import { OrbitControls, Grid } from '@react-three/drei'
import Room from './Room'
import FurniturePiece from './FurniturePiece'
import { applySnap } from '../snap'

export default function Scene({ room, pieces, selectedId, setSelectedId, updatePiece }) {
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

    const { x, z, elevation } = applySnap(
      draggingPiece, rawX, rawZ, roomRef.current, piecesRef.current
    )
    updatePiece(dragging.current.id, { x, z, elevation })
  }, [updatePiece])

  const onFloorPointerUp = useCallback(() => {
    dragging.current = null
    setIsDragging(false)
  }, [])

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[room.width * 0.4, room.height * 2, room.length * 0.4]}
        intensity={0.9}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight position={[-5, 8, -5]} intensity={0.3} />

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
        cellThickness={0.4}
        cellColor="#374151"
        sectionSize={5}
        sectionThickness={0.8}
        sectionColor="#4b5563"
        fadeDistance={50}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid
        position={[0, -0.002, 0]}
      />

      <Room width={room.width} length={room.length} height={room.height} />

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
        enableRotate
        maxPolarAngle={Math.PI / 2.05}
        target={[0, room.height * 0.3, 0]}
      />
    </>
  )
}
