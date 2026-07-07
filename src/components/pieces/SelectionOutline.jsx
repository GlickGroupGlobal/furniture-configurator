// Shared selection wireframe, previously duplicated in every piece component.
export default function SelectionOutline({ width, height, depth }) {
  return (
    <mesh position={[0, height / 2, 0]}>
      <boxGeometry args={[width + 0.06, height + 0.06, depth + 0.06]} />
      <meshBasicMaterial color="#6366f1" wireframe />
    </mesh>
  )
}
