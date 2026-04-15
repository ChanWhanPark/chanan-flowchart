import { useFlowchart } from '@Context/FlowchartContext'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import DownloadIcon from '@mui/icons-material/Download'
import { Box, Button, ButtonGroup, Slider, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import { getNodesBounds, getViewportForBounds, useReactFlow } from '@xyflow/react'
import { toPng } from 'html-to-image'
import { jsPDF } from 'jspdf'
import { useCallback } from 'react'

import type { LayoutConfig } from '@Types/flowchart'

type Direction = NonNullable<LayoutConfig['direction']>

const IMAGE_PADDING = 40
const PIXEL_RATIO = 2

interface CanvasToolbarProps {
  flowViewport: React.RefObject<HTMLDivElement | null>
}

export default function CanvasToolbar({ flowViewport }: CanvasToolbarProps) {
  const { flowchartData, updateLayout, clearPositions } = useFlowchart()
  const { getNodes } = useReactFlow()
  const layout = flowchartData?.layout

  const direction = layout?.direction ?? 'TD'
  const spacingX = layout?.nodeSpacingX ?? 80
  const spacingY = layout?.nodeSpacingY ?? 100

  const handleDirectionChange = useCallback(
    (_: React.MouseEvent<HTMLElement>, newDir: Direction | null) => {
      if (newDir) {
        updateLayout({ direction: newDir })
        clearPositions()
      }
    },
    [updateLayout, clearPositions],
  )

  const handleAutoLayout = useCallback(() => {
    clearPositions()
  }, [clearPositions])

  /** 전체 순서도를 캡처하기 위해 노드 전체 영역 기준으로 뷰포트를 조정 후 캡처 */
  const captureFullFlowchart = async (): Promise<string | null> => {
    const viewportEl = flowViewport.current?.querySelector('.react-flow__viewport') as HTMLElement | null
    if (!viewportEl) return null

    const nodes = getNodes()
    if (nodes.length === 0) return null

    const bounds = getNodesBounds(nodes)
    const imageWidth = (bounds.width + IMAGE_PADDING * 2) * PIXEL_RATIO
    const imageHeight = (bounds.height + IMAGE_PADDING * 2) * PIXEL_RATIO

    const viewport = getViewportForBounds(
      bounds,
      imageWidth,
      imageHeight,
      0.5,
      PIXEL_RATIO,
      IMAGE_PADDING,
    )

    return toPng(viewportEl, {
      backgroundColor: '#ffffff',
      width: imageWidth,
      height: imageHeight,
      style: {
        width: `${imageWidth}px`,
        height: `${imageHeight}px`,
        transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
      },
    })
  }

  const handleDownloadPng = async () => {
    try {
      const dataUrl = await captureFullFlowchart()
      if (!dataUrl) return
      const link = document.createElement('a')
      link.download = 'flowchart.png'
      link.href = dataUrl
      link.click()
    } catch (e) {
      console.error('PNG export failed:', e)
    }
  }

  const handleDownloadPdf = async () => {
    try {
      const dataUrl = await captureFullFlowchart()
      if (!dataUrl) return
      const img = new Image()
      img.src = dataUrl
      await new Promise((res) => { img.onload = res })
      const w = img.width
      const h = img.height
      const orientation = w > h ? 'landscape' : 'portrait'
      const pdf = new jsPDF({ orientation, unit: 'px', format: [w, h], hotfixes: ['px_scaling'] })
      pdf.addImage(dataUrl, 'PNG', 0, 0, w, h)
      pdf.save('flowchart.pdf')
    } catch (e) {
      console.error('PDF export failed:', e)
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        px: 2,
        py: 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        flexWrap: 'wrap',
      }}
    >
      {/* 방향 */}
      <ToggleButtonGroup
        size="small"
        value={direction}
        exclusive
        onChange={handleDirectionChange}
      >
        <ToggleButton value="TD">TD</ToggleButton>
        <ToggleButton value="LR">LR</ToggleButton>
        <ToggleButton value="BT">BT</ToggleButton>
        <ToggleButton value="RL">RL</ToggleButton>
      </ToggleButtonGroup>

      {/* 간격 */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 140 }}>
        <Typography variant="caption" sx={{ whiteSpace: 'nowrap' }}>X</Typography>
        <Slider
          size="small"
          value={spacingX}
          min={20}
          max={200}
          onChange={(_, v) => {
            updateLayout({ nodeSpacingX: v as number })
            clearPositions()
          }}
          sx={{ width: 80 }}
        />
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 140 }}>
        <Typography variant="caption" sx={{ whiteSpace: 'nowrap' }}>Y</Typography>
        <Slider
          size="small"
          value={spacingY}
          min={20}
          max={200}
          onChange={(_, v) => {
            updateLayout({ nodeSpacingY: v as number })
            clearPositions()
          }}
          sx={{ width: 80 }}
        />
      </Box>

      {/* Auto Layout */}
      <Button size="small" startIcon={<AutoFixHighIcon />} onClick={handleAutoLayout}>
        Auto Layout
      </Button>

      <Box sx={{ flex: 1 }} />

      {/* Export */}
      <ButtonGroup size="small" variant="outlined">
        <Button startIcon={<DownloadIcon />} onClick={handleDownloadPng}>
          PNG
        </Button>
        <Button startIcon={<DownloadIcon />} onClick={handleDownloadPdf}>
          PDF
        </Button>
      </ButtonGroup>
    </Box>
  )
}
