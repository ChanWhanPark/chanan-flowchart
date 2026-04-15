import { useFlowchart } from '@Context/FlowchartContext'
import CloseIcon from '@mui/icons-material/Close'
import { Box, Drawer, IconButton } from '@mui/material'

import EdgeProperties from './properties/EdgeProperties'
import NodeProperties from './properties/NodeProperties'

const PANEL_WIDTH = 280

export default function PropertiesPanel() {
  const { selectedNodeId, selectedEdgeId, setSelectedNodeId, setSelectedEdgeId } = useFlowchart()

  const isOpen = !!(selectedNodeId || selectedEdgeId)

  const handleClose = () => {
    setSelectedNodeId(null)
    setSelectedEdgeId(null)
  }

  return (
    <Drawer
      variant="persistent"
      anchor="right"
      open={isOpen}
      sx={{
        width: isOpen ? PANEL_WIDTH : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: PANEL_WIDTH,
          position: 'relative',
          borderLeft: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
          <IconButton size="small" onClick={handleClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        {selectedNodeId && <NodeProperties />}
        {selectedEdgeId && <EdgeProperties />}
      </Box>
    </Drawer>
  )
}
