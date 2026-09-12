import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import type { SystemAnatomyRendererProps } from './types'

const STATUS_COLORS: Record<string, string> = {
  healthy: '#27a1a4',
  attention: '#c4851a',
  blocked: '#ba4b45',
  recovering: '#6e65c4',
}

function readCssColor(element: HTMLElement, name: string, fallback: string): string {
  return getComputedStyle(element).getPropertyValue(name).trim() || fallback
}

function SpatialRenderer({ snapshot, selectedId, onSelect }: SystemAnatomyRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    } catch {
      const fallback = document.createElement('p')
      fallback.className = 'system-anatomy__spatial-fallback'
      fallback.textContent = 'WebGL is unavailable in this browser context. Use the HTML node inspector below.'
      container.appendChild(fallback)
      return () => fallback.remove()
    }

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100)
    camera.position.set(0, 0, 14)

    const canvas = renderer.domElement
    canvas.className = 'system-anatomy__spatial-canvas'
    canvas.setAttribute('aria-hidden', 'true')
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setClearColor(0x000000, 0)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    container.appendChild(canvas)

    const systemGroup = new THREE.Group()
    systemGroup.rotation.y = -0.12
    scene.add(systemGroup)

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.7)
    scene.add(ambientLight)
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.1)
    keyLight.position.set(-3, 6, 8)
    scene.add(keyLight)

    const pageLine = readCssColor(container, '--page-line', '#405356')
    const edgeMaterial = new THREE.LineBasicMaterial({ color: pageLine, transparent: true, opacity: 0.62 })
    const edgeGeometry = new THREE.BufferGeometry()
    const nodesById = new Map(snapshot.nodes.map((node) => [node.id, node]))
    const edgePoints: THREE.Vector3[] = []
    for (const edge of snapshot.edges) {
      const from = nodesById.get(edge.from)
      const to = nodesById.get(edge.to)
      if (!from || !to) continue
      edgePoints.push(new THREE.Vector3(...from.spatialPosition), new THREE.Vector3(...to.spatialPosition))
    }
    edgeGeometry.setFromPoints(edgePoints)
    systemGroup.add(new THREE.LineSegments(edgeGeometry, edgeMaterial))

    const nodeGeometry = new THREE.BoxGeometry(0.96, 0.72, 0.72)
    const nodeMeshes: THREE.Mesh[] = []
    for (const node of snapshot.nodes) {
      const isSelected = node.id === selectedId
      const material = new THREE.MeshStandardMaterial({
        color: STATUS_COLORS[node.status] ?? STATUS_COLORS.healthy,
        roughness: 0.42,
        metalness: 0.08,
        emissive: isSelected ? 0xffffff : 0x000000,
        emissiveIntensity: isSelected ? 0.22 : 0,
      })
      const mesh = new THREE.Mesh(nodeGeometry, material)
      mesh.position.set(...node.spatialPosition)
      mesh.userData.nodeId = node.id
      mesh.userData.label = node.label
      systemGroup.add(mesh)
      nodeMeshes.push(mesh)
    }

    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()
    let dragging = false
    let didDrag = false
    let previousX = 0
    let previousY = 0

    const render = () => renderer.render(scene, camera)
    const resize = () => {
      const width = container.clientWidth
      const height = Math.max(340, Math.min(560, width * 0.58))
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      render()
    }

    const selectAt = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect()
      if (bounds.width === 0 || bounds.height === 0) return
      pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1
      pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1
      raycaster.setFromCamera(pointer, camera)
      const hit = raycaster.intersectObjects(nodeMeshes, false)[0]
      if (hit?.object.userData.nodeId) onSelect(hit.object.userData.nodeId as string)
    }

    const handlePointerDown = (event: PointerEvent) => {
      dragging = true
      didDrag = false
      previousX = event.clientX
      previousY = event.clientY
      canvas.setPointerCapture(event.pointerId)
    }
    const handlePointerMove = (event: PointerEvent) => {
      if (!dragging) return
      const deltaX = event.clientX - previousX
      const deltaY = event.clientY - previousY
      if (Math.abs(deltaX) + Math.abs(deltaY) > 2) didDrag = true
      previousX = event.clientX
      previousY = event.clientY
      systemGroup.rotation.y += deltaX * 0.008
      systemGroup.rotation.x = Math.max(-0.42, Math.min(0.42, systemGroup.rotation.x + deltaY * 0.006))
      render()
    }
    const handlePointerUp = (event: PointerEvent) => {
      if (!dragging) return
      dragging = false
      canvas.releasePointerCapture(event.pointerId)
      if (!didDrag) selectAt(event)
    }

    canvas.addEventListener('pointerdown', handlePointerDown)
    canvas.addEventListener('pointermove', handlePointerMove)
    canvas.addEventListener('pointerup', handlePointerUp)
    canvas.addEventListener('pointercancel', handlePointerUp)

    const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(resize)
    resizeObserver?.observe(container)
    window.addEventListener('resize', resize)
    resize()

    return () => {
      resizeObserver?.disconnect()
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('pointerdown', handlePointerDown)
      canvas.removeEventListener('pointermove', handlePointerMove)
      canvas.removeEventListener('pointerup', handlePointerUp)
      canvas.removeEventListener('pointercancel', handlePointerUp)
      nodeGeometry.dispose()
      edgeGeometry.dispose()
      edgeMaterial.dispose()
      nodeMeshes.forEach((mesh) => {
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
        materials.forEach((material) => material.dispose())
      })
      renderer.dispose()
      canvas.remove()
    }
  }, [onSelect, selectedId, snapshot])

  return (
    <div
      ref={containerRef}
      className="system-anatomy__spatial"
      data-testid="system-anatomy-spatial"
      data-node-count={snapshot.nodes.length}
      role="img"
      aria-label={`System Anatomy in 3D Spatial view. ${snapshot.description} Use the HTML node inspector to inspect identity, state, and explanations.`}
    />
  )
}

export default SpatialRenderer
