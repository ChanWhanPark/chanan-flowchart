import CanvasToolbar from '@Components/CanvasToolbar'
import FlowCanvas from '@Components/FlowCanvas'
import PropertiesPanel from '@Components/PropertiesPanel'
import { FlowchartProvider, useFlowchart } from '@Context/FlowchartContext'
import sampleJson from '@Data/sample.json?raw'
import sampleMd from '@Data/sample.md?raw'
import AccountTreeIcon from '@mui/icons-material/AccountTree'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import {
  AppBar,
  Box,
  Button,
  Divider,
  Paper,
  Tab,
  Tabs,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material'
import { parseJsonToIR } from '@Parser/jsonParser'
import { extractMermaidCode, mermaidToIR } from '@Parser/mermaidToIR'
import { ReactFlowProvider } from '@xyflow/react'
import { useRef, useState } from 'react'

type InputMode = 'markdown' | 'json'

const PLACEHOLDER: Record<InputMode, string> = {
  markdown: sampleMd,
  json: sampleJson,
}

function detectMode(filename: string): InputMode | null {
  if (filename.endsWith('.md')) return 'markdown'
  if (filename.endsWith('.json')) return 'json'
  return null
}

function AppContent() {
  const [mode, setMode] = useState<InputMode>('markdown')
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const flowViewportRef = useRef<HTMLDivElement>(null)

  const { flowchartData, setFlowchartData } = useFlowchart()

  const loadFile = (file: File) => {
    const detected = detectMode(file.name)
    if (!detected) {
      setError('.md 또는 .json 파일만 지원합니다.')
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      setMode(detected)
      setInput(text)
      setFlowchartData(null)
      setError(null)
    }
    reader.readAsText(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) loadFile(file)
  }

  const handleGenerate = () => {
    setError(null)
    if (mode === 'markdown') {
      const code = extractMermaidCode(input)
      if (!code) {
        setError('Mermaid 코드 블록을 찾을 수 없습니다. ```mermaid ... ``` 형식으로 입력해주세요.')
        setFlowchartData(null)
      } else {
        const data = mermaidToIR(code)
        setFlowchartData(data)
      }
    } else if (mode === 'json') {
      const result = parseJsonToIR(input)
      if ('error' in result) {
        setError(result.error)
        setFlowchartData(null)
      } else {
        setFlowchartData(result.data)
      }
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <AppBar position="static" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar variant="dense">
          <AccountTreeIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Flowchart Generator
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Main */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left: Input Panel */}
        <Box
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          sx={{
            width: 400,
            minWidth: 320,
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid',
            borderColor: isDragging ? 'primary.main' : 'divider',
            position: 'relative',
            transition: 'border-color 0.15s',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider', pr: 1 }}>
            <Tabs
              value={mode}
              onChange={(_, v) => { setMode(v); setInput(''); setFlowchartData(null); setError(null) }}
              sx={{ flex: 1 }}
            >
              <Tab label="Markdown" value="markdown" />
              <Tab label="JSON" value="json" />
            </Tabs>
            <input
              ref={fileInputRef}
              type="file"
              accept=".md,.json"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) loadFile(file)
                e.target.value = ''
              }}
            />
            <Button
              size="small"
              startIcon={<UploadFileIcon />}
              onClick={() => fileInputRef.current?.click()}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Upload
            </Button>
          </Box>

          <TextField
            multiline
            fullWidth
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={PLACEHOLDER[mode]}
            variant="outlined"
            sx={{
              flex: 1,
              overflow: 'hidden',
              '& .MuiOutlinedInput-root': {
                height: '100%',
                alignItems: 'flex-start',
                borderRadius: 0,
                border: 'none',
                overflow: 'auto',
                '& fieldset': { border: 'none' },
              },
              '& textarea': {
                fontFamily: 'ui-monospace, Consolas, monospace',
                fontSize: 13,
                lineHeight: 1.6,
                overflow: 'auto !important',
              },
            }}
            slotProps={{ input: { sx: { height: '100%', overflow: 'auto' } } }}
          />

          {/* Drag overlay */}
          {isDragging && (
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                bgcolor: 'primary.main',
                opacity: 0.08,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
                gap: 1,
              }}
            >
              <UploadFileIcon sx={{ fontSize: 48, color: 'primary.main', opacity: 1 }} />
              <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
                파일을 놓아 불러오기
              </Typography>
            </Box>
          )}

          {error && (
            <Typography variant="caption" color="error" sx={{ px: 2, pb: 1 }}>
              {error}
            </Typography>
          )}

          <Divider />
          <Box sx={{ p: 1.5 }}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<PlayArrowIcon />}
              disabled={!input.trim()}
              onClick={handleGenerate}
            >
              Generate
            </Button>
          </Box>
        </Box>

        {/* Right: Canvas + Properties */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'grey.50',
            overflow: 'hidden',
          }}
        >
          {flowchartData && <CanvasToolbar flowViewport={flowViewportRef} />}

          <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            <Box
              ref={flowViewportRef}
              sx={{ flex: 1, position: 'relative' }}
            >
              {flowchartData ? (
                <FlowCanvas />
              ) : (
                <Box
                  sx={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 4,
                  }}
                >
                  <Paper
                    variant="outlined"
                    sx={{
                      px: 4,
                      py: 3,
                      textAlign: 'center',
                      bgcolor: 'transparent',
                      borderStyle: 'dashed',
                    }}
                  >
                    <AccountTreeIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                    <Typography variant="body2" color="text.disabled">
                      입력 후 Generate를 눌러 플로우차트를 생성하세요
                    </Typography>
                    <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
                      .md / .json 파일을 왼쪽 패널에 드래그해도 됩니다
                    </Typography>
                  </Paper>
                </Box>
              )}
            </Box>

            {flowchartData && <PropertiesPanel />}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default function App() {
  return (
    <FlowchartProvider>
      <ReactFlowProvider>
        <AppContent />
      </ReactFlowProvider>
    </FlowchartProvider>
  )
}
