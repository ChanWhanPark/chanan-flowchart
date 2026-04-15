import { Box, TextField, Typography } from '@mui/material'
import { Handle, Position } from '@xyflow/react'
import { useCallback, useEffect, useRef, useState } from 'react'

import type { NodeStyle } from '@Types/flowchart'

interface DecisionNodeData {
  label: string
  style: NodeStyle
  onLabelChange?: (label: string) => void
  [key: string]: unknown
}

const DEFAULT_BG = '#ffffff'
const DEFAULT_BORDER = '#1a192b'
const DEFAULT_TEXT = '#333333'
const DEFAULT_FONT_SIZE = 14
const DEFAULT_SIZE = 120

export default function DecisionNode({ data, selected }: { data: DecisionNodeData; selected?: boolean }) {
  const { label, style, onLabelChange } = data
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(label)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setEditValue(label)
  }, [label])

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  const handleDoubleClick = useCallback(() => {
    setEditing(true)
    setEditValue(label)
  }, [label])

  const commit = useCallback(() => {
    setEditing(false)
    if (editValue.trim() && editValue !== label) {
      onLabelChange?.(editValue.trim())
    }
  }, [editValue, label, onLabelChange])

  const bg = style.backgroundColor ?? DEFAULT_BG
  const border = style.borderColor ?? DEFAULT_BORDER
  const textColor = style.textColor ?? DEFAULT_TEXT
  const fontSize = style.fontSize ?? DEFAULT_FONT_SIZE
  const size = style.width ?? DEFAULT_SIZE

  return (
    <>
      <Handle type="target" position={Position.Top} />
      <Box
        onDoubleClick={handleDoubleClick}
        sx={{
          width: size,
          height: size,
          bgcolor: bg,
          border: `2px solid ${selected ? '#1976d2' : border}`,
          transform: 'rotate(45deg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'default',
          boxShadow: selected ? '0 0 0 2px rgba(25,118,210,0.3)' : 'none',
        }}
      >
        <Box sx={{ transform: 'rotate(-45deg)', maxWidth: size * 0.7, textAlign: 'center' }}>
          {editing ? (
            <TextField
              inputRef={inputRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commit()
                if (e.key === 'Escape') setEditing(false)
              }}
              variant="standard"
              size="small"
              sx={{
                '& input': { fontSize, color: textColor, textAlign: 'center', p: 0 },
                '& .MuiInput-underline:before': { borderBottom: 'none' },
              }}
            />
          ) : (
            <Typography sx={{ fontSize, color: textColor, userSelect: 'none' }}>
              {label}
            </Typography>
          )}
        </Box>
      </Box>
      <Handle type="source" position={Position.Bottom} />
    </>
  )
}
