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
  Typography,
} from '@mui/material'

import type { FlowNode } from '@Types/flowchart'

export default function NodeProperties() {
  const { flowchartData, selectedNodeId, updateNode, updateNodeStyle } = useFlowchart()

  if (!flowchartData || !selectedNodeId) return null

  const node = flowchartData.nodes.find((n) => n.id === selectedNodeId)
  if (!node) return null

  const style = node.style ?? {}

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        노드 속성
      </Typography>

      {/* 라벨 */}
      <TextField
        label="라벨"
        size="small"
        value={node.label}
        onChange={(e) => updateNode(selectedNodeId, { label: e.target.value })}
      />

      {/* 타입 */}
      <FormControl size="small">
        <InputLabel>타입</InputLabel>
        <Select
          label="타입"
          value={node.type}
          onChange={(e) => updateNode(selectedNodeId, { type: e.target.value as FlowNode['type'] })}
        >
          <MenuItem value="process">Process (직사각형)</MenuItem>
          <MenuItem value="decision">Decision (마름모)</MenuItem>
          <MenuItem value="terminal">Terminal (원형)</MenuItem>
        </Select>
      </FormControl>

      <Divider />
      <Typography variant="caption" sx={{ fontWeight: 600 }}>스타일</Typography>

      {/* 배경색 */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="caption" sx={{ minWidth: 60 }}>배경색</Typography>
        <input
          type="color"
          value={style.backgroundColor ?? '#ffffff'}
          onChange={(e) => updateNodeStyle(selectedNodeId, { backgroundColor: e.target.value })}
        />
      </Box>

      {/* 테두리색 */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="caption" sx={{ minWidth: 60 }}>테두리색</Typography>
        <input
          type="color"
          value={style.borderColor ?? '#1a192b'}
          onChange={(e) => updateNodeStyle(selectedNodeId, { borderColor: e.target.value })}
        />
      </Box>

      {/* 글자색 */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="caption" sx={{ minWidth: 60 }}>글자색</Typography>
        <input
          type="color"
          value={style.textColor ?? '#333333'}
          onChange={(e) => updateNodeStyle(selectedNodeId, { textColor: e.target.value })}
        />
      </Box>

      {/* 폰트 크기 */}
      <Box>
        <Typography variant="caption">폰트 크기: {style.fontSize ?? 14}px</Typography>
        <Slider
          size="small"
          value={style.fontSize ?? 14}
          min={10}
          max={28}
          onChange={(_, v) => updateNodeStyle(selectedNodeId, { fontSize: v as number })}
        />
      </Box>

      {/* 너비 */}
      <Box>
        <Typography variant="caption">너비: {style.width ?? 120}px</Typography>
        <Slider
          size="small"
          value={style.width ?? 120}
          min={60}
          max={300}
          onChange={(_, v) => updateNodeStyle(selectedNodeId, { width: v as number })}
        />
      </Box>

      {/* 높이 */}
      <Box>
        <Typography variant="caption">높이: {style.height ?? 40}px</Typography>
        <Slider
          size="small"
          value={style.height ?? 40}
          min={30}
          max={200}
          onChange={(_, v) => updateNodeStyle(selectedNodeId, { height: v as number })}
        />
      </Box>
    </Box>
  )
}
