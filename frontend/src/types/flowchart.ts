/** 노드 스타일 */
export interface NodeStyle {
  backgroundColor?: string
  borderColor?: string
  textColor?: string
  fontSize?: number
  width?: number
  height?: number
}

/** 엣지 스타일 */
export interface EdgeStyle {
  lineType?: 'solid' | 'dashed' | 'dotted'
  lineColor?: string
  lineWidth?: number
  arrowType?: 'arrow' | 'arrowclosed' | 'none'
}

/** 레이아웃 설정 */
export interface LayoutConfig {
  direction?: 'TD' | 'LR' | 'BT' | 'RL'
  nodeSpacingX?: number
  nodeSpacingY?: number
}

export interface FlowNode {
  id: string
  label: string
  /** process: 직사각형, decision: 마름모, terminal: 원형(시작/끝) */
  type: 'process' | 'decision' | 'terminal'
  style?: NodeStyle
  position?: { x: number; y: number }
}

export interface FlowEdge {
  from: string
  to: string
  label?: string
  style?: EdgeStyle
}

export interface FlowchartData {
  layout?: LayoutConfig
  nodes: FlowNode[]
  edges: FlowEdge[]
}
