import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { REFERENCE_MATERIAL } from './material-state'

type MaterialStageProps = {
  color: string
  roughness: number
  metalness: number
}

type MaterialScene = {
  meshMaterial: THREE.MeshStandardMaterial
  render: () => void
}

function MaterialStage({ color, roughness, metalness }: MaterialStageProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<MaterialScene | null>(null)
  const [unavailable, setUnavailable] = useState(false)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    let renderer: THREE.WebGLRenderer | null = null
    let environmentTarget: THREE.WebGLRenderTarget | null = null
    let environmentGenerator: THREE.PMREMGenerator | null = null
    let geometry: THREE.TorusKnotGeometry | null = null
    let meshMaterial: THREE.MeshStandardMaterial | null = null
    let room: RoomEnvironment | null = null
    let resizeObserver: ResizeObserver | null = null
    let canvas: HTMLCanvasElement | null = null
    let failureFrame = 0

    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75))
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.12

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100)
      camera.position.set(0, 0, 5.2)

      room = new RoomEnvironment()
      environmentGenerator = new THREE.PMREMGenerator(renderer)
      environmentTarget = environmentGenerator.fromScene(room, 0.04)
      scene.environment = environmentTarget.texture

      geometry = new THREE.TorusKnotGeometry(0.92, 0.27, 224, 32, 2, 3)
      meshMaterial = new THREE.MeshStandardMaterial({ ...REFERENCE_MATERIAL })
      const specimen = new THREE.Mesh(geometry, meshMaterial)
      specimen.rotation.set(-0.2, 0.12, 0.1)
      scene.add(specimen)

      canvas = renderer.domElement
      canvas.className = 'material-lab__canvas'
      canvas.setAttribute('aria-hidden', 'true')
      host.appendChild(canvas)

      const render = () => renderer?.render(scene, camera)
      const resize = () => {
        const width = host.clientWidth
        const height = host.clientHeight
        if (width === 0 || height === 0) return
        renderer?.setSize(width, height, false)
        camera.aspect = width / height
        camera.updateProjectionMatrix()
        render()
      }

      const materialScene: MaterialScene = { meshMaterial, render }
      sceneRef.current = materialScene

      resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(resize)
      resizeObserver?.observe(host)
      window.addEventListener('resize', resize)
      resize()

      return () => {
        sceneRef.current = null
        resizeObserver?.disconnect()
        window.removeEventListener('resize', resize)
        geometry?.dispose()
        meshMaterial?.dispose()
        environmentTarget?.dispose()
        environmentGenerator?.dispose()
        room?.traverse((object) => {
          if (object instanceof THREE.Mesh || object instanceof THREE.InstancedMesh) {
            object.geometry.dispose()
            const materials = Array.isArray(object.material) ? object.material : [object.material]
            materials.forEach((material) => material.dispose())
          }
        })
        renderer?.dispose()
        canvas?.remove()
      }
    } catch {
      resizeObserver?.disconnect()
      environmentTarget?.dispose()
      environmentGenerator?.dispose()
      geometry?.dispose()
      meshMaterial?.dispose()
      room?.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.InstancedMesh) {
          object.geometry.dispose()
          const materials = Array.isArray(object.material) ? object.material : [object.material]
          materials.forEach((material) => material.dispose())
        }
      })
      renderer?.dispose()
      canvas?.remove()
      failureFrame = window.requestAnimationFrame(() => setUnavailable(true))
      return () => window.cancelAnimationFrame(failureFrame)
    }
  }, [])

  useEffect(() => {
    const materialScene = sceneRef.current
    if (!materialScene) return
    materialScene.meshMaterial.color.set(color)
    materialScene.meshMaterial.roughness = roughness
    materialScene.meshMaterial.metalness = metalness
    materialScene.render()
  }, [color, roughness, metalness])

  const accessibleLabel = `Sculptural material specimen. Base color ${color}, roughness ${roughness.toFixed(2)}, metalness ${metalness.toFixed(2)}. The adjacent controls adjust these properties.`

  return (
    <div
      className={`material-lab__render-surface${unavailable ? ' material-lab__render-surface--fallback' : ''}`}
      data-testid="material-lab-preview"
    >
      <div ref={hostRef} className="material-lab__render-host" role="img" aria-label={accessibleLabel} />
      {unavailable && (
        <div className="material-lab__fallback" role="img" aria-label={accessibleLabel}>
          <span className="material-lab__fallback-specimen" style={{ backgroundColor: color }} aria-hidden="true" />
          <p>Surface preview</p>
          <small>Current base color is shown here. Use the controls and values to inspect the full material.</small>
        </div>
      )}
      {unavailable && <p className="material-lab__fallback-status" role="status">WebGL is unavailable. The material controls remain usable.</p>}
    </div>
  )
}

export default MaterialStage
