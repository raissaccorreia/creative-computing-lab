import { useEffect, useRef, type MouseEvent } from 'react'
import type { CandidateFieldRendererProps } from './types'

function getCanvasColor(canvas: HTMLCanvasElement, name: string, fallback: string): string {
  return getComputedStyle(canvas).getPropertyValue(name).trim() || fallback
}

function drawRoundedBackground(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  radius: number,
) {
  const corner = Math.min(radius, width / 2, height / 2)

  context.beginPath()
  context.moveTo(corner, 0)
  context.lineTo(width - corner, 0)
  context.arcTo(width, 0, width, corner, corner)
  context.lineTo(width, height - corner)
  context.arcTo(width, height, width - corner, height, corner)
  context.lineTo(corner, height)
  context.arcTo(0, height, 0, height - corner, corner)
  context.lineTo(0, corner)
  context.arcTo(0, 0, corner, 0, corner)
  context.closePath()
  context.fill()
}

function CanvasRenderer({
  items,
  selectedId,
  radius,
  dimensions,
  summary,
  onSelect,
}: CandidateFieldRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const draw = () => {
      const context = canvas.getContext('2d')
      if (!context) return

      const devicePixelRatio = Math.max(1, Math.min(window.devicePixelRatio || 1, 2))
      canvas.width = Math.round(dimensions.width * devicePixelRatio)
      canvas.height = Math.round(dimensions.height * devicePixelRatio)
      context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0)
      context.clearRect(0, 0, dimensions.width, dimensions.height)

      const background = getCanvasColor(canvas, '--page-bg', '#f3f4ef')
      const accent = getCanvasColor(canvas, '--page-accent', '#27a1a4')
      const accentStrong = getCanvasColor(canvas, '--page-accent-strong', '#166f73')
      const removed = getCanvasColor(canvas, '--page-removed', '#756a68')

      context.fillStyle = background
      drawRoundedBackground(context, dimensions.width, dimensions.height, 18)

      for (const item of items) {
        context.beginPath()
        context.fillStyle = item.removed ? removed : accent
        context.globalAlpha = item.removed ? 0.32 : 0.72
        context.arc(item.x, item.y, radius, 0, Math.PI * 2)
        context.fill()

        if (selectedId === item.id) {
          context.beginPath()
          context.globalAlpha = 1
          context.strokeStyle = accentStrong
          context.lineWidth = 2
          context.arc(item.x, item.y, radius + 4, 0, Math.PI * 2)
          context.stroke()
        }
      }

      context.globalAlpha = 1
    }

    const resizeObserver =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(draw)
    if (canvas.parentElement) resizeObserver?.observe(canvas.parentElement)
    window.addEventListener('resize', draw)
    draw()

    return () => {
      resizeObserver?.disconnect()
      window.removeEventListener('resize', draw)
    }
  }, [dimensions, items, radius, selectedId])

  const handleClick = (event: MouseEvent<HTMLCanvasElement>) => {
    const canvas = event.currentTarget
    const bounds = canvas.getBoundingClientRect()
    if (bounds.width === 0 || bounds.height === 0) return

    const x = ((event.clientX - bounds.left) / bounds.width) * dimensions.width
    const y = ((event.clientY - bounds.top) / bounds.height) * dimensions.height
    const hitRadius = Math.max(radius + 3, 6)
    const selected = [...items].reverse().find((item) => {
      const distance = Math.hypot(item.x - x, item.y - y)
      return distance <= hitRadius
    })

    if (selected) onSelect(selected.id)
  }

  return (
    <canvas
      ref={canvasRef}
      className="candidate-field__canvas-element"
      data-candidate-count={items.length}
      data-testid="candidate-field-canvas"
      role="img"
      aria-label={`Candidate field rendered with Canvas 2D. ${summary} Use the candidate search form to inspect a candidate with the keyboard or a screen reader.`}
      onClick={handleClick}
    />
  )
}

export default CanvasRenderer
