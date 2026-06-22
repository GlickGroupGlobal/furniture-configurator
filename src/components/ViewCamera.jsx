import { useThree } from '@react-three/fiber'
import { PerspectiveCamera, OrthographicCamera } from '@react-three/drei'

// Renders the correct camera type for the active view mode.
// 'orbit' = free perspective camera. 'top'/'front' = orthographic presets
// sized (via zoom) to fit the whole room in view, fed by canvas pixel size.
export default function ViewCamera({ viewMode, room }) {
  const size = useThree(state => state.size)

  if (viewMode === 'top') {
    const pad = 1.15
    const zoom = Math.min(size.width / (room.width * pad), size.height / (room.length * pad))
    return (
      <OrthographicCamera
        makeDefault
        position={[0, 30, 0.0001]}
        zoom={zoom}
        up={[0, 0, -1]}
        near={0.1}
        far={1000}
      />
    )
  }

  if (viewMode === 'front') {
    const pad = 1.3
    const zoom = Math.min(size.width / (room.width * pad), size.height / (room.height * pad))
    return (
      <OrthographicCamera
        makeDefault
        position={[0, room.height / 2, 30]}
        zoom={zoom}
        near={0.1}
        far={1000}
      />
    )
  }

  const camDist = Math.max(room.width, room.length) * 1.1
  const camPos = [camDist * 0.7, camDist * 0.6, camDist * 0.8]
  return <PerspectiveCamera makeDefault position={camPos} fov={50} />
}
