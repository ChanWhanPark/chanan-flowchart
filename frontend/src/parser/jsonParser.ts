import type { FlowchartData, LayoutConfig } from '@Types/flowchart'

type Direction = NonNullable<LayoutConfig['direction']>
const VALID_DIRECTIONS = new Set<string>(['TD', 'LR', 'BT', 'RL'])

/** JSON 문자열을 파싱해 FlowchartData를 반환. 실패 시 에러 메시지 반환 */
export function parseJsonToIR(jsonString: string): { data: FlowchartData } | { error: string } {
  let raw: Record<string, unknown>
  try {
    raw = JSON.parse(jsonString)
  } catch {
    return { error: 'JSON 파싱 실패: 올바른 JSON 형식인지 확인해주세요.' }
  }

  if (!Array.isArray(raw.nodes) || !Array.isArray(raw.edges)) {
    return { error: 'JSON에 "nodes"와 "edges" 배열이 필요합니다.' }
  }

  // direction은 최상위 필드 또는 layout.direction 모두 지원
  const rawDir = typeof raw.direction === 'string' ? raw.direction : undefined
  const direction: Direction = rawDir && VALID_DIRECTIONS.has(rawDir) ? (rawDir as Direction) : 'TD'

  const data: FlowchartData = {
    layout: { direction },
    nodes: raw.nodes as FlowchartData['nodes'],
    edges: raw.edges as FlowchartData['edges'],
  }

  return { data }
}
