import { Box, TextField, Typography } from '@mui/material'
import { Handle, Position } from '@xyflow/react'
import { useCallback, useEffect, useRef, useState } from 'react'

import type { NodeStyle } from '@Types/flowchart'

interface ProcessNodeData {
  label: string
  style: NodeStyle
  onLabelChange?: (label: string) => void
  [key: string]: unknown
}

const DEFAULT_BG = '#ffffff'
const DEFAULT_BORDER = '#1a192b'
const DEFAULT_TEXT = '#333333'
const DEFAULT_FONT_SIZE = 14

export default function ProcessNode({ data, selected }: { data: ProcessNodeData; selected?: boolean }) {
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

  return (
    <>
      <Handle type="target" position={Position.Top} />
      <Box
        onDoubleClick={handleDoubleClick}
        sx={{
          px: 2,
          py: 1,
          minWidth: style.width ?? 120,
          minHeight: style.height ?? 40,
          bgcolor: bg,
          border: `2px solid ${selected ? '#1976d2' : border}`,
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'default',
          boxShadow: selected ? '0 0 0 2px rgba(25,118,210,0.3)' : 'none',
        }}
      >
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
          <Typography sx={{ fontSize, color: textColor, userSelect: 'none', textAlign: 'center' }}>
            {label}
          </Typography>
        )}
      </Box>
      <Handle type="source" position={Position.Bottom} />
    </>
  )
}
