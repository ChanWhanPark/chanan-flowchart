import { useFlowchart } from '@Context/FlowchartContext'
import { irToReactFlow } from '@Utils/irToReactFlow'
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from '@xyflow/react'
import { useCallback, useEffect, useMemo } from 'react'

import StyledEdge from './edges/StyledEdge'
import DecisionNode from './nodes/DecisionNode'
import ProcessNode from './nodes/ProcessNode'
import TerminalNode from './nodes/TerminalNode'

import type { EdgeMouseHandler,Node, NodeMouseHandler } from '@xyflow/react'

import '@xyflow/react/dist/style.css'

const nodeTypes = {
  process: ProcessNode,
  decision: DecisionNode,
  terminal: TerminalNode,
}

const edgeTypes = {
  styled: StyledEdge,
}

export default function FlowCanvas() {
  const {
    flowchartData,
    setSelectedNodeId,
    setSelectedEdgeId,
    updateNodePosition,
    updateNode,
  } = useFlowchart()

  const converted = useMemo(
    () => (flowchartData ? irToReactFlow(flowchartData) : null),
    [flowchartData],
  )

  // 노드에 onLabelChange 콜백 주입
  const nodesWithCallbacks = useMemo(() => {
    if (!converted) return []
    return converted.nodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        onLabelChange: (label: string) => updateNode(node.id, { label }),
      },
    }))
  }, [converted, updateNode])

  const [nodes, setNodes, onNodesChange] = useNodesState(nodesWithCallbacks)
  const [edges, setEdges, onEdgesChange] = useEdgesState(converted?.edges ?? [])

  useEffect(() => {
    setNodes(nodesWithCallbacks)
  }, [nodesWithCallbacks, setNodes])

  useEffect(() => {
    setEdges(converted?.edges ?? [])
  }, [converted?.edges, setEdges])

  const onNodeDragStop = useCallback(
    (_: React.MouseEvent, node: Node) => {
      updateNodePosition(node.id, node.position)
    },
    [updateNodePosition],
  )

  const onNodeClick: NodeMouseHandler = useCallback(
    (_, node) => {
      setSelectedNodeId(node.id)
      setSelectedEdgeId(null)
    },
    [setSelectedNodeId, setSelectedEdgeId],
  )

  const onEdgeClick: EdgeMouseHandler = useCallback(
    (_, edge) => {
      setSelectedEdgeId(edge.id)
      setSelectedNodeId(null)
    },
    [setSelectedEdgeId, setSelectedNodeId],
  )

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null)
    setSelectedEdgeId(null)
  }, [setSelectedNodeId, setSelectedEdgeId])

  if (!converted) return null

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodeDragStop={onNodeDragStop}
      onNodeClick={onNodeClick}
      onEdgeClick={onEdgeClick}
      onPaneClick={onPaneClick}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      proOptions={{ hideAttribution: true }}
    >
      <Background />
      <Controls />
      <MiniMap
        nodeStrokeWidth={3}
        zoomable
        pannable
        style={{ width: 140, height: 100 }}
      />
    </ReactFlow>
  )
}
