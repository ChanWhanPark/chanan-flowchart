import { computeLayout } from '@Utils/autoLayout'

import type { FlowchartData } from '@Types/flowchart'
import type { Edge, MarkerType, Node } from '@xyflow/react'

export interface ConvertResult {
  nodes: Node[]
  edges: Edge[]
}

/** FlowchartData IR을 React Flow의 Node[]/Edge[]로 변환 */
export function irToReactFlow(data: FlowchartData): ConvertResult {
  const layout = computeLayout(data)

  const nodes: Node[] = data.nodes.map((node) => {
    const pos = node.position ?? layout.positions.get(node.id) ?? { x: 0, y: 0 }

    return {
      id: node.id,
      type: node.type, // 커스텀 노드 타입에 매핑
      position: pos,
      data: {
        label: node.label,
        nodeType: node.type,
        style: node.style ?? {},
      },
    }
  })

  const edges: Edge[] = data.edges.map((edge) => {
    const edgeStyle = edge.style ?? {}
    const strokeDasharray =
      edgeStyle.lineType === 'dashed'
        ? '8 4'
        : edgeStyle.lineType === 'dotted'
          ? '2 4'
          : undefined

    const markerType: MarkerType =
      edgeStyle.arrowType === 'none'
        ? ('' as MarkerType)
        : edgeStyle.arrowType === 'arrowclosed'
          ? ('arrowclosed' as MarkerType)
          : ('arrow' as MarkerType)

    return {
      id: `${edge.from}-${edge.to}`,
      source: edge.from,
      target: edge.to,
      type: 'styled',
      label: edge.label,
      markerEnd: edgeStyle.arrowType === 'none' ? undefined : { type: markerType, color: edgeStyle.lineColor },
      style: {
        stroke: edgeStyle.lineColor,
        strokeWidth: edgeStyle.lineWidth,
        strokeDasharray,
      },
      data: {
        style: edgeStyle,
      },
    }
  })

  return { nodes, edges }
}
