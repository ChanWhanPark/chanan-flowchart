import dagre from '@dagrejs/dagre'

import type { FlowchartData, LayoutConfig } from '@Types/flowchart'

const DEFAULT_NODE_WIDTH = 180
const DEFAULT_NODE_HEIGHT = 60
const DEFAULT_SPACING_X = 80
const DEFAULT_SPACING_Y = 100

type Direction = NonNullable<LayoutConfig['direction']>

const DIRECTION_MAP: Record<Direction, string> = {
  TD: 'TB',
  LR: 'LR',
  BT: 'BT',
  RL: 'RL',
}

export interface LayoutResult {
  positions: Map<string, { x: number; y: number }>
}

/** dagre를 사용해 노드 위치를 자동 계산 */
export function computeLayout(data: FlowchartData): LayoutResult {
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))

  const dir = data.layout?.direction ?? 'TD'
  const spacingX = data.layout?.nodeSpacingX ?? DEFAULT_SPACING_X
  const spacingY = data.layout?.nodeSpacingY ?? DEFAULT_SPACING_Y

  g.setGraph({
    rankdir: DIRECTION_MAP[dir],
    nodesep: spacingX,
    ranksep: spacingY,
    marginx: 40,
    marginy: 40,
  })

  for (const node of data.nodes) {
    const w = node.style?.width ?? DEFAULT_NODE_WIDTH
    const h = node.style?.height ?? (node.type === 'decision' ? 80 : DEFAULT_NODE_HEIGHT)
    g.setNode(node.id, { width: w, height: h })
  }

  for (const edge of data.edges) {
    g.setEdge(edge.from, edge.to)
  }

  dagre.layout(g)

  const positions = new Map<string, { x: number; y: number }>()
  for (const node of data.nodes) {
    const dagreNode = g.node(node.id)
    if (dagreNode) {
      positions.set(node.id, { x: dagreNode.x - dagreNode.width / 2, y: dagreNode.y - dagreNode.height / 2 })
    }
  }

  return { positions }
}
