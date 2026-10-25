import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import {
  REFERENCE_MATERIAL,
  REFERENCE_PATTERN_SCALE,
  type MaterialPreviewMode,
} from './material-state'
import { WAVE_FRAGMENT_SHADER, WAVE_VERTEX_SHADER } from './material-shader'

type MaterialStageProps = {
  mode: MaterialPreviewMode
  color: string
  roughness: number
  metalness: number
  patternScale: number
}

type MaterialScene = {
  specimen: THREE.Mesh
  pbrMaterial: THREE.MeshStandardMaterial
  waveMaterial: THREE.ShaderMaterial
  render: () => void
}

function MaterialStage({ mode, color, roughness, metalness, patternScale }: MaterialStageProps) {
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
    let pbrMaterial: THREE.MeshStandardMaterial | null = null
    let waveMaterial: THREE.ShaderMaterial | null = null
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
      pbrMaterial = new THREE.MeshStandardMaterial({ ...REFERENCE_MATERIAL })
      waveMaterial = new THREE.ShaderMaterial({
        uniforms: {
          uBaseColor: { value: new THREE.Color(REFERENCE_MATERIAL.color) },
          uPatternScale: { value: REFERENCE_PATTERN_SCALE },
        },
        vertexShader: WAVE_VERTEX_SHADER,
        fragmentShader: WAVE_FRAGMENT_SHADER,
      })

      const specimen = new THREE.Mesh(geometry, pbrMaterial)
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

      const materialScene: MaterialScene = { specimen, pbrMaterial, waveMaterial, render }
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
        pbrMaterial?.dispose()
        waveMaterial?.dispose()
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
      pbrMaterial?.dispose()
      waveMaterial?.dispose()
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
    materialScene.pbrMaterial.color.set(color)
    materialScene.pbrMaterial.roughness = roughness
    materialScene.pbrMaterial.metalness = metalness
    materialScene.waveMaterial.uniforms.uBaseColor.value.set(color)
    materialScene.waveMaterial.uniforms.uPatternScale.value = patternScale
    materialScene.specimen.material = mode === 'shader'
      ? materialScene.waveMaterial
      : materialScene.pbrMaterial
    materialScene.render()
  }, [mode, color, roughness, metalness, patternScale])

  const accessibleLabel = mode === 'shader'
    ? `Sculptural material specimen with a static procedural wave shader. Pattern scale ${patternScale} controls how often soft bands repeat across the surface. Base color ${color}.`
    : `Sculptural material specimen. Base color ${color}, roughness ${roughness.toFixed(2)}, metalness ${metalness.toFixed(2)}. The adjacent controls adjust these properties.`
  const fallbackBandStep = Math.max(7, Math.round(34 - patternScale * 1.5))
  const fallbackPattern = `repeating-linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0 ${fallbackBandStep}px, transparent ${fallbackBandStep}px ${fallbackBandStep * 2}px), repeating-linear-gradient(-135deg, rgba(18, 37, 34, 0.18) 0 ${fallbackBandStep}px, transparent ${fallbackBandStep}px ${fallbackBandStep * 2}px)`

  return (
    <div
      className={`material-lab__render-surface${unavailable ? ' material-lab__render-surface--fallback' : ''}`}
      data-testid="material-lab-preview"
    >
      <div ref={hostRef} className="material-lab__render-host" role="img" aria-label={accessibleLabel} />
      {unavailable && (
        <div className="material-lab__fallback" role="img" aria-label={accessibleLabel}>
          <span
            className={`material-lab__fallback-specimen${mode === 'shader' ? ' material-lab__fallback-specimen--shader' : ''}`}
            style={{
              backgroundColor: color,
              backgroundImage: mode === 'shader' ? fallbackPattern : undefined,
            }}
            aria-hidden="true"
          />
          <p>{mode === 'shader' ? 'Wave shader preview' : 'Surface preview'}</p>
          <small>
            {mode === 'shader'
              ? `WebGL is unavailable. This HTML preview approximates the ${patternScale} soft bands over ${color}.`
              : `WebGL is unavailable. The current base color is ${color}; material controls remain available.`}
          </small>
        </div>
      )}
      {unavailable && (
        <p className="material-lab__fallback-status" role="status">
          WebGL is unavailable. The mode switch and HTML controls remain usable.
        </p>
      )}
    </div>
  )
}

export default MaterialStage
