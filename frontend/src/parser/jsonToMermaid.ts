export interface FlowNode {
  id: string
  label: string
  /** process: 직사각형, decision: 마름모, terminal: 원형(시작/끝) */
  type: 'process' | 'decision' | 'terminal'
}

export interface FlowEdge {
  from: string
  to: string
  label?: string
}

export interface FlowchartData {
  direction?: 'TD' | 'LR' | 'BT' | 'RL'
  nodes: FlowNode[]
  edges: FlowEdge[]
}

function nodeShape(node: FlowNode): string {
  switch (node.type) {
    case 'terminal':  return `([${node.label}])`
    case 'decision':  return `{${node.label}}`
    case 'process':
    default:          return `[${node.label}]`
  }
}

export function jsonToMermaid(data: FlowchartData): string {
  const dir = data.direction ?? 'TD'
  const lines: string[] = [`flowchart ${dir}`]

  for (const node of data.nodes) {
    lines.push(`    ${node.id}${nodeShape(node)}`)
  }

  for (const edge of data.edges) {
    const arrow = edge.label ? `-->|${edge.label}|` : `-->`
    lines.push(`    ${edge.from} ${arrow} ${edge.to}`)
  }

  return lines.join('\n')
}

/** JSON 문자열을 파싱해 Mermaid 코드를 반환. 실패 시 에러 메시지 반환 */
export function parseJsonToMermaid(jsonString: string): { code: string } | { error: string } {
  let data: FlowchartData
  try {
    data = JSON.parse(jsonString)
  } catch {
    return { error: 'JSON 파싱 실패: 올바른 JSON 형식인지 확인해주세요.' }
  }

  if (!Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
    return { error: 'JSON에 "nodes"와 "edges" 배열이 필요합니다.' }
  }

  return { code: jsonToMermaid(data) }
}
