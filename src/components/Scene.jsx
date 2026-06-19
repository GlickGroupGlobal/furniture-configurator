import { useRef, useState, useCallback } from 'react'
import { OrbitControls, Grid } from '@react-three/drei'
import Room from './Room'
import FurniturePiece from './FurniturePiece'

export default function Scene({ room, pieces, selectedId, setSelectedId, updatePiece }) {
  const dragging = useRef(null)
  const [isDragging, setIsDragging] = useState(false)

  const onPiecePointerDown = useCallback((e, piece) => {
    e.stopPropagation()
    setSelectedId(piece.id)
    dragging.current = {
      id: piece.id,
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
    updatePiece(dragging.current.id, {
      x: e.point.x + dragging.current.offsetX,
      z: e.point.z + dragging.current.offsetZ,
    })
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

      {/* Large invisible plane — captures drag pointer events */}
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
