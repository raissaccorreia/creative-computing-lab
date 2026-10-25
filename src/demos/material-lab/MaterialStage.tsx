import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import {
  REFERENCE_MATERIAL,
  REFERENCE_PATTERN_SCALE,
} from './material-state'
import { WAVE_FRAGMENT_SHADER, WAVE_VERTEX_SHADER } from './material-shader'

type MaterialStageProps = {
  color: string
  roughness: number
  metalness: number
  patternScale: number
}

type MaterialScene = {
  pbrMaterial: THREE.MeshStandardMaterial
  waveMaterial: THREE.ShaderMaterial
  render: () => void
}

function MaterialStage({ color, roughness, metalness, patternScale }: MaterialStageProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<MaterialScene | null>(null)
  const [unavailable, setUnavailable] = useState(false)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    let renderer: THREE.WebGLRenderer | null = null
    let environmentTarget: THREE.WebGLRenderTarget | null = null
    let environmentGenerator: THREE.PMREMGenerator | null = null
    let knotGeometry: THREE.TorusKnotGeometry | null = null
    let sphereGeometry: THREE.SphereGeometry | null = null
    let pbrMaterial: THREE.MeshStandardMaterial | null = null
    let waveMaterial: THREE.ShaderMaterial | null = null
    let room: RoomEnvironment | null = null
    let resizeObserver: ResizeObserver | null = null
    let canvas: HTMLCanvasElement | null = null
    let removeResizeListener = () => {}
    let failureFrame = 0

    const dispose = () => {
      sceneRef.current = null
      resizeObserver?.disconnect()
      removeResizeListener()
      knotGeometry?.dispose()
      sphereGeometry?.dispose()
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

    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75))
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.08

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100)
      camera.position.set(0, 0, 6.6)
      camera.lookAt(0, -0.08, 0)

      room = new RoomEnvironment()
      environmentGenerator = new THREE.PMREMGenerator(renderer)
      environmentTarget = environmentGenerator.fromScene(room, 0.04)
      scene.environment = environmentTarget.texture

      const keyLight = new THREE.DirectionalLight(0xffffff, 2.15)
      keyLight.position.set(-3.7, 4.2, 5.5)
      scene.add(keyLight)

      const rimLight = new THREE.DirectionalLight(0xdcefe9, 1.05)
      rimLight.position.set(4.2, 1.5, -3.5)
      scene.add(rimLight)

      knotGeometry = new THREE.TorusKnotGeometry(0.92, 0.27, 224, 32, 2, 3)
      sphereGeometry = new THREE.SphereGeometry(0.64, 48, 32)
      pbrMaterial = new THREE.MeshStandardMaterial({ ...REFERENCE_MATERIAL })
      waveMaterial = new THREE.ShaderMaterial({
        uniforms: {
          uBaseColor: { value: new THREE.Color(REFERENCE_MATERIAL.color) },
          uPatternScale: { value: REFERENCE_PATTERN_SCALE },
        },
        vertexShader: WAVE_VERTEX_SHADER,
        fragmentShader: WAVE_FRAGMENT_SHADER,
      })

      const pbrGroup = new THREE.Group()
      const pbrKnot = new THREE.Mesh(knotGeometry, pbrMaterial)
      pbrKnot.rotation.set(-0.2, 0.12, 0.1)
      pbrGroup.add(pbrKnot)
      scene.add(pbrGroup)

      const shaderGroup = new THREE.Group()
      const shaderKnot = new THREE.Mesh(knotGeometry, waveMaterial)
      shaderKnot.rotation.set(0.18, -0.18, -0.12)
      shaderGroup.add(shaderKnot)
      scene.add(shaderGroup)

      const sphereGroup = new THREE.Group()
      const sphere = new THREE.Mesh(sphereGeometry, pbrMaterial)
      sphereGroup.add(sphere)
      scene.add(sphereGroup)

      canvas = renderer.domElement
      canvas.className = 'material-lab__canvas'
      canvas.setAttribute('aria-hidden', 'true')
      host.appendChild(canvas)

      let hasRendered = false
      const render = () => {
        if (!renderer) return
        renderer.render(scene, camera)
        if (!hasRendered) {
          hasRendered = true
          canvas?.setAttribute('data-scene-ready', 'true')
          performance.mark('material-lab:first-render')
        }
      }

      const resize = () => {
        const width = host.clientWidth
        const height = host.clientHeight
        if (width === 0 || height === 0) return

        const aspect = width / height
        renderer?.setSize(width, height, false)
        camera.aspect = aspect

        if (aspect < 0.88) {
          camera.position.z = 6.9
          pbrGroup.position.set(-0.76, 0.64, 0.05)
          shaderGroup.position.set(0.76, 0.64, -0.12)
          sphereGroup.position.set(0, -1.03, 0.12)
          pbrGroup.scale.setScalar(0.48)
          shaderGroup.scale.setScalar(0.48)
          sphereGroup.scale.setScalar(0.48)
        } else if (aspect < 1.32) {
          camera.position.z = 6.7
          pbrGroup.position.set(-1.08, 0.28, 0.05)
          shaderGroup.position.set(1.08, 0.28, -0.12)
          sphereGroup.position.set(0, -1.08, 0.12)
          pbrGroup.scale.setScalar(0.56)
          shaderGroup.scale.setScalar(0.56)
          sphereGroup.scale.setScalar(0.46)
        } else {
          camera.position.z = 6.6
          pbrGroup.position.set(-1.48, 0.12, 0.05)
          shaderGroup.position.set(1.48, 0.12, -0.12)
          sphereGroup.position.set(0, -1.38, 0.12)
          pbrGroup.scale.setScalar(0.72)
          shaderGroup.scale.setScalar(0.7)
          sphereGroup.scale.setScalar(0.43)
        }

        camera.lookAt(0, -0.08, 0)
        camera.updateProjectionMatrix()
        render()
      }

      const materialScene: MaterialScene = { pbrMaterial, waveMaterial, render }
      sceneRef.current = materialScene

      resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(resize)
      resizeObserver?.observe(host)
      window.addEventListener('resize', resize)
      removeResizeListener = () => window.removeEventListener('resize', resize)
      resize()

      return dispose
    } catch {
      dispose()
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
    materialScene.render()
  }, [color, roughness, metalness, patternScale])

  const accessibleLabel = `Three studio specimens share base color ${color}. The left torus knot and lower sphere use PBR material with roughness ${roughness.toFixed(2)} and metalness ${metalness.toFixed(2)}. The right torus knot uses a static wave shader with pattern scale ${patternScale}. The adjacent controls adjust these values.`
  const fallbackBandStep = Math.max(7, Math.round(34 - patternScale * 1.5))
  const fallbackPattern = `repeating-linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0 ${fallbackBandStep}px, transparent ${fallbackBandStep}px ${fallbackBandStep * 2}px), repeating-linear-gradient(-135deg, rgba(18, 37, 34, 0.18) 0 ${fallbackBandStep}px, transparent ${fallbackBandStep}px ${fallbackBandStep * 2}px)`

  return (
    <div
      className={`material-lab__render-surface${unavailable ? ' material-lab__render-surface--fallback' : ''}`}
      data-testid="material-lab-preview"
    >
      <div
        ref={hostRef}
        className="material-lab__render-host"
        role="img"
        aria-label={accessibleLabel}
        aria-hidden={unavailable}
      />
      {unavailable && (
        <div
          className="material-lab__fallback"
          role="group"
          aria-label={`CSS fallback samples. Shared color ${color}; PBR roughness ${roughness.toFixed(2)} and metalness ${metalness.toFixed(2)}; shader pattern scale ${patternScale}. Shapes approximate color and bands without curved studio lighting.`}
        >
          <div className="material-lab__fallback-specimens">
            <div className="material-lab__fallback-item">
              <span
                className="material-lab__fallback-specimen material-lab__fallback-specimen--knot"
                style={{ backgroundColor: color }}
              />
              <span>01 · PBR knot</span>
            </div>
            <div className="material-lab__fallback-item">
              <span
                className="material-lab__fallback-specimen material-lab__fallback-specimen--shader"
                style={{ backgroundColor: color, backgroundImage: fallbackPattern }}
              />
              <span>02 · Wave shader</span>
            </div>
            <div className="material-lab__fallback-item">
              <span
                className="material-lab__fallback-specimen material-lab__fallback-specimen--sphere"
                style={{ backgroundColor: color }}
              />
              <span>03 · PBR sphere</span>
            </div>
          </div>
          <p>CSS material samples</p>
          <small>
            WebGL is unavailable. These flat samples keep the color and pattern visible; they do not reproduce curved studio lighting. PBR roughness {roughness.toFixed(2)} · metalness {metalness.toFixed(2)} · shader scale {patternScale}.
          </small>
        </div>
      )}
      {unavailable && (
        <p className="material-lab__fallback-status" role="status">
          WebGL is unavailable. The HTML controls remain usable; the samples are visual approximations.
        </p>
      )}
    </div>
  )
}

export default MaterialStage
