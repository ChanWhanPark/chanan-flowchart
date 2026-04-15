import { createContext, useCallback, useContext, useMemo, useState } from 'react'

import type { EdgeStyle, FlowchartData, FlowEdge, FlowNode, LayoutConfig, NodeStyle } from '@Types/flowchart'
import type { ReactNode } from 'react'

interface FlowchartContextValue {
  flowchartData: FlowchartData | null
  selectedNodeId: string | null
  selectedEdgeId: string | null

  setFlowchartData: (data: FlowchartData | null) => void
  setSelectedNodeId: (id: string | null) => void
  setSelectedEdgeId: (id: string | null) => void

  updateNode: (id: string, updates: Partial<FlowNode>) => void
  updateNodeStyle: (id: string, style: Partial<NodeStyle>) => void
  updateEdge: (id: string, updates: Partial<FlowEdge>) => void
  updateEdgeStyle: (id: string, style: Partial<EdgeStyle>) => void
  updateLayout: (layout: Partial<LayoutConfig>) => void
  updateNodePosition: (id: string, position: { x: number; y: number }) => void
  clearPositions: () => void
}

const FlowchartContext = createContext<FlowchartContextValue | null>(null)

export function FlowchartProvider({ children }: { children: ReactNode }) {
  const [flowchartData, setFlowchartData] = useState<FlowchartData | null>(null)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null)

  const updateNode = useCallback((id: string, updates: Partial<FlowNode>) => {
    setFlowchartData((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        nodes: prev.nodes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
      }
    })
  }, [])

  const updateNodeStyle = useCallback((id: string, style: Partial<NodeStyle>) => {
    setFlowchartData((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        nodes: prev.nodes.map((n) =>
          n.id === id ? { ...n, style: { ...n.style, ...style } } : n,
        ),
      }
    })
  }, [])

  const updateEdge = useCallback((id: string, updates: Partial<FlowEdge>) => {
    setFlowchartData((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        edges: prev.edges.map((e) => {
          const edgeId = `${e.from}-${e.to}`
          return edgeId === id ? { ...e, ...updates } : e
        }),
      }
    })
  }, [])

  const updateEdgeStyle = useCallback((id: string, style: Partial<EdgeStyle>) => {
    setFlowchartData((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        edges: prev.edges.map((e) => {
          const edgeId = `${e.from}-${e.to}`
          return edgeId === id ? { ...e, style: { ...e.style, ...style } } : e
        }),
      }
    })
  }, [])

  const updateLayout = useCallback((layout: Partial<LayoutConfig>) => {
    setFlowchartData((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        layout: { ...prev.layout, ...layout },
      }
    })
  }, [])

  const updateNodePosition = useCallback((id: string, position: { x: number; y: number }) => {
    setFlowchartData((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        nodes: prev.nodes.map((n) => (n.id === id ? { ...n, position } : n)),
      }
    })
  }, [])

  const clearPositions = useCallback(() => {
    setFlowchartData((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        nodes: prev.nodes.map((n) => ({ ...n, position: undefined })),
      }
    })
  }, [])

  const value = useMemo<FlowchartContextValue>(
    () => ({
      flowchartData,
      selectedNodeId,
      selectedEdgeId,
      setFlowchartData,
      setSelectedNodeId,
      setSelectedEdgeId,
      updateNode,
      updateNodeStyle,
      updateEdge,
      updateEdgeStyle,
      updateLayout,
      updateNodePosition,
      clearPositions,
    }),
    [
      flowchartData,
      selectedNodeId,
      selectedEdgeId,
      updateNode,
      updateNodeStyle,
      updateEdge,
      updateEdgeStyle,
      updateLayout,
      updateNodePosition,
      clearPositions,
    ],
  )

  return <FlowchartContext.Provider value={value}>{children}</FlowchartContext.Provider>
}

export function useFlowchart() {
  const ctx = useContext(FlowchartContext)
  if (!ctx) throw new Error('useFlowchart must be used within FlowchartProvider')
  return ctx
}
