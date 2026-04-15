import type { FlowchartData, FlowEdge, FlowNode, LayoutConfig } from '@Types/flowchart'

type Direction = NonNullable<LayoutConfig['direction']>
const VALID_DIRECTIONS = new Set<string>(['TD', 'LR', 'BT', 'RL'])

/** 마크다운 텍스트에서 ```mermaid ... ``` 블록을 추출 */
export function extractMermaidCode(markdown: string): string | null {
  const match = markdown.match(/```mermaid\s*\n([\s\S]*?)```/)
  return match ? match[1].trim() : null
}

/** Mermaid flowchart 구문을 FlowchartData IR로 변환 */
export function mermaidToIR(code: string): FlowchartData {
  const lines = code.split('\n').map((l) => l.trim()).filter(Boolean)
  const nodes: FlowNode[] = []
  const edges: FlowEdge[] = []
  const nodeMap = new Map<string, FlowNode>()
  let direction: Direction = 'TD'

  for (const line of lines) {
    // flowchart 방향 선언
    const dirMatch = line.match(/^flowchart\s+(TD|LR|BT|RL)/i)
    if (dirMatch) {
      const d = dirMatch[1].toUpperCase()
      if (VALID_DIRECTIONS.has(d)) direction = d as Direction
      continue
    }

    // 엣지 파싱: A -->|label| B  또는  A --> B
    const edgeMatch = line.match(
      /^(\w+)\s*-->(?:\|([^|]*)\|)?\s*(\w+)(?:\s*$|\s*-->)/,
    )
    if (edgeMatch) {
      // 한 줄에 여러 엣지 체인이 있을 수 있으므로 전체를 파싱
      parseEdgesAndNodes(line, edges, nodeMap)
      continue
    }

    // 단독 노드 정의: A([label]) 또는 A{label} 또는 A[label]
    const nodeMatch = line.match(/^(\w+)(\(?\[.*\]?\)?|\{.*\})/)
    if (nodeMatch) {
      parseNodeDef(nodeMatch[0], nodeMap)
      continue
    }
  }

  // nodeMap에서 노드 배열 생성
  for (const node of nodeMap.values()) {
    nodes.push(node)
  }

  return { layout: { direction }, nodes, edges }
}

/** 노드 정의 문자열에서 id, label, type 추출 */
function parseNodeDef(text: string, nodeMap: Map<string, FlowNode>): void {
  // terminal: A([label])
  const terminalMatch = text.match(/^(\w+)\(\[(.+?)\]\)/)
  if (terminalMatch) {
    const [, id, label] = terminalMatch
    nodeMap.set(id, { id, label, type: 'terminal' })
    return
  }

  // decision: A{label}
  const decisionMatch = text.match(/^(\w+)\{(.+?)\}/)
  if (decisionMatch) {
    const [, id, label] = decisionMatch
    nodeMap.set(id, { id, label, type: 'decision' })
    return
  }

  // process: A[label]
  const processMatch = text.match(/^(\w+)\[(.+?)\]/)
  if (processMatch) {
    const [, id, label] = processMatch
    nodeMap.set(id, { id, label, type: 'process' })
    return
  }
}

/** 한 줄에서 엣지와 인라인 노드 정의를 파싱 */
function parseEdgesAndNodes(
  line: string,
  edges: FlowEdge[],
  nodeMap: Map<string, FlowNode>,
): void {
  // 엣지 패턴: SOURCE_WITH_DEF -->|label| TARGET_WITH_DEF
  const edgeRegex = /(\w+(?:\(\[.*?\]\)|\{.*?\}|\[.*?\])?)\s*-->(?:\|([^|]*)\|)?\s*/g
  const parts: { id: string; def: string }[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = edgeRegex.exec(line)) !== null) {
    const fullNodeText = match[1]
    const idMatch = fullNodeText.match(/^(\w+)/)
    if (idMatch) {
      parts.push({ id: idMatch[1], def: fullNodeText })
    }
    lastIndex = edgeRegex.lastIndex
  }

  // 마지막 타겟 노드
  const remaining = line.slice(lastIndex).trim()
  if (remaining) {
    const idMatch = remaining.match(/^(\w+)/)
    if (idMatch) {
      parts.push({ id: idMatch[1], def: remaining })
    }
  }

  // 노드 정의 등록
  for (const part of parts) {
    if (!nodeMap.has(part.id)) {
      parseNodeDef(part.def, nodeMap)
      // 정의가 없으면 기본 process 노드
      if (!nodeMap.has(part.id)) {
        nodeMap.set(part.id, { id: part.id, label: part.id, type: 'process' })
      }
    }
  }

  // 엣지 생성 (순서대로 연결)
  const edgePairRegex = /(\w+)(?:\(\[.*?\]\)|\{.*?\}|\[.*?\])?\s*-->(?:\|([^|]*)\|)?\s*/g
  let edgeMatch: RegExpExecArray | null
  const prevId: string | null = null

  edgePairRegex.lastIndex = 0
  while ((edgeMatch = edgePairRegex.exec(line)) !== null) {
    const sourceId = edgeMatch[1]
    const label = edgeMatch[2]?.trim() || undefined

    if (prevId === null) {
      // 이 줄의 첫 번째 소스-타겟 쌍은 아래에서 처리
    }

    // 나머지 부분에서 타겟 id 찾기
    const afterArrow = line.slice(edgePairRegex.lastIndex)
    const targetMatch = afterArrow.match(/^(\w+)/)
    if (targetMatch) {
      edges.push({ from: sourceId, to: targetMatch[1], label })
    }
  }
}
