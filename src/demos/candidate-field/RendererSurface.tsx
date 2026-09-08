import CanvasRenderer from './CanvasRenderer'
import SvgRenderer from './SvgRenderer'
import type { CandidateFieldRenderer, CandidateFieldRendererProps } from './types'

type RendererSurfaceProps = CandidateFieldRendererProps & {
  renderer: CandidateFieldRenderer
}

function RendererSurface({ renderer, ...props }: RendererSurfaceProps) {
  return renderer === 'canvas' ? <CanvasRenderer {...props} /> : <SvgRenderer {...props} />
}

export default RendererSurface
