import AccountTreeIcon from '@mui/icons-material/AccountTree'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
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
import { useState } from 'react'

type InputMode = 'markdown' | 'json'

const PLACEHOLDER: Record<InputMode, string> = {
  markdown: `# Start\n\n## Step 1\nDo something\n\n## Step 2\nDo something else\n\n# End`,
  json: `{
  "nodes": [
    { "id": "1", "label": "Start" },
    { "id": "2", "label": "Step 1" },
    { "id": "3", "label": "End" }
  ],
  "edges": [
    { "from": "1", "to": "2" },
    { "from": "2", "to": "3" }
  ]
}`,
}

export default function App() {
  const [mode, setMode] = useState<InputMode>('markdown')
  const [input, setInput] = useState('')

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Header */}
      <AppBar position="static" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
        <Toolbar variant="dense">
          <AccountTreeIcon sx={{ mr: 1 }} />
          <Typography variant="h6" fontWeight={600}>
            Flowchart Generator
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Main */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left: Input Panel */}
        <Box
          sx={{
            width: 400,
            minWidth: 320,
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Tabs
            value={mode}
            onChange={(_, v) => setMode(v)}
            sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 1 }}
          >
            <Tab label="Markdown" value="markdown" />
            <Tab label="JSON" value="json" />
          </Tabs>

          <TextField
            multiline
            fullWidth
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={PLACEHOLDER[mode]}
            variant="outlined"
            sx={{
              flex: 1,
              '& .MuiOutlinedInput-root': {
                height: '100%',
                alignItems: 'flex-start',
                borderRadius: 0,
                border: 'none',
                '& fieldset': { border: 'none' },
              },
              '& textarea': {
                fontFamily: 'ui-monospace, Consolas, monospace',
                fontSize: 13,
                lineHeight: 1.6,
                height: '100% !important',
              },
            }}
            slotProps={{ input: { sx: { height: '100%' } } }}
          />

          <Divider />
          <Box sx={{ p: 1.5 }}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<PlayArrowIcon />}
              disabled={!input.trim()}
            >
              Generate
            </Button>
          </Box>
        </Box>

        {/* Right: Canvas */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'grey.50',
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
          </Paper>
        </Box>
      </Box>
    </Box>
  )
}
