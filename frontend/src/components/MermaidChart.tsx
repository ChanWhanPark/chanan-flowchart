import { Box } from '@mui/material'
import mermaid from 'mermaid'
import { forwardRef, useEffect, useRef } from 'react'

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  flowchart: { htmlLabels: false },
})

let idCounter = 0

interface Props {
  code: string
}

const MermaidChart = forwardRef<HTMLDivElement, Props>(({ code }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const idRef = useRef(`mermaid-${++idCounter}`)

  useEffect(() => {
    if (!containerRef.current) return

    const render = async () => {
      try {
        const { svg } = await mermaid.render(idRef.current, code)
        if (containerRef.current) {
          containerRef.current.innerHTML = svg
        }
      } catch (e) {
        if (containerRef.current) containerRef.current.innerHTML = ''
        console.error('Mermaid render error:', e)
      }
    }

    render()
    idRef.current = `mermaid-${++idCounter}`
  }, [code])

  return (
    <Box
      ref={(node: HTMLDivElement | null) => {
        containerRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
      }}
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '& svg': { maxWidth: '100%', maxHeight: '100%' },
      }}
    />
  )
})

MermaidChart.displayName = 'MermaidChart'
export default MermaidChart

/** 마크다운 텍스트에서 ```mermaid ... ``` 블록을 추출 */
// eslint-disable-next-line react-refresh/only-export-components
export function extractMermaidCode(markdown: string): string | null {
  const match = markdown.match(/```mermaid\s*\n([\s\S]*?)```/)
  return match ? match[1].trim() : null
}
