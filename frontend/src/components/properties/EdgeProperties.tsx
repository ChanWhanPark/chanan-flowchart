import { useFlowchart } from '@Context/FlowchartContext'
import {
  Box,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'

import type { EdgeStyle } from '@Types/flowchart'

export default function EdgeProperties() {
  const { flowchartData, selectedEdgeId, updateEdge, updateEdgeStyle } = useFlowchart()

  if (!flowchartData || !selectedEdgeId) return null

  const edge = flowchartData.edges.find((e) => `${e.from}-${e.to}` === selectedEdgeId)
  if (!edge) return null

  const style: EdgeStyle = edge.style ?? {}

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        엣지 속성
      </Typography>

      {/* 라벨 */}
      <TextField
        label="라벨"
        size="small"
        value={edge.label ?? ''}
        onChange={(e) => updateEdge(selectedEdgeId, { label: e.target.value || undefined })}
      />

      <Divider />
      <Typography variant="caption" sx={{ fontWeight: 600 }}>스타일</Typography>

      {/* 선 종류 */}
      <Box>
        <Typography variant="caption" sx={{ mb: 0.5, display: 'block' }}>선 종류</Typography>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={style.lineType ?? 'solid'}
          onChange={(_, v) => { if (v) updateEdgeStyle(selectedEdgeId, { lineType: v }) }}
        >
          <ToggleButton value="solid">실선</ToggleButton>
          <ToggleButton value="dashed">파선</ToggleButton>
          <ToggleButton value="dotted">점선</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* 선 색상 */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="caption" sx={{ minWidth: 60 }}>선 색상</Typography>
        <input
          type="color"
          value={style.lineColor ?? '#b1b1b7'}
          onChange={(e) => updateEdgeStyle(selectedEdgeId, { lineColor: e.target.value })}
        />
      </Box>

      {/* 선 두께 */}
      <Box>
        <Typography variant="caption">선 두께: {style.lineWidth ?? 1}px</Typography>
        <Slider
          size="small"
          value={style.lineWidth ?? 1}
          min={1}
          max={6}
          step={0.5}
          onChange={(_, v) => updateEdgeStyle(selectedEdgeId, { lineWidth: v as number })}
        />
      </Box>

      {/* 화살표 종류 */}
      <FormControl size="small">
        <InputLabel>화살표</InputLabel>
        <Select
          label="화살표"
          value={style.arrowType ?? 'arrow'}
          onChange={(e) => updateEdgeStyle(selectedEdgeId, { arrowType: e.target.value as EdgeStyle['arrowType'] })}
        >
          <MenuItem value="arrow">Arrow</MenuItem>
          <MenuItem value="arrowclosed">Arrow Closed</MenuItem>
          <MenuItem value="none">None</MenuItem>
        </Select>
      </FormControl>
    </Box>
  )
}
