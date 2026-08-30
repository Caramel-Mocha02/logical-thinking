import { useCallback, useState } from 'react'
import { ReactFlow, Background, Controls, useNodesState, useEdgesState } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import LogicTreeNode from './LogicTreeNode.jsx'
import LogicTreeActionsContext from './LogicTreeActionsContext.jsx'

const nodeTypes = { logicNode: LogicTreeNode }

const CHILD_SPACING = 260
const CHILD_Y_OFFSET = 150

const initialNodes = [
  {
    id: 'root',
    type: 'logicNode',
    position: { x: 300, y: 100 },
    data: { label: '', isRoot: true },
  },
]

function LogicTree() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [nextId, setNextId] = useState(1)

  const updateContent = useCallback(
    (id, content) => {
      setNodes((nds) =>
        nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, label: content } } : n)),
      )
    },
    [setNodes],
  )

  const addChild = useCallback(
    (parentId) => {
      const parent = nodes.find((n) => n.id === parentId)
      if (!parent) return

      const childCount = edges.filter((e) => e.source === parentId).length
      const newId = `node-${nextId}`
      setNextId((n) => n + 1)

      const newNode = {
        id: newId,
        type: 'logicNode',
        position: {
          x: parent.position.x - 130 + childCount * CHILD_SPACING,
          y: parent.position.y + CHILD_Y_OFFSET,
        },
        data: { label: '' },
      }

      setNodes((nds) => [...nds, newNode])
      setEdges((eds) => [...eds, { id: `edge-${parentId}-${newId}`, source: parentId, target: newId }])
    },
    [nodes, edges, nextId, setNodes, setEdges],
  )

  const deleteNode = useCallback(
    (id) => {
      // 削除対象の下にぶら下がっている子孫ノードもまとめて削除する
      const toDelete = new Set([id])
      let changed = true
      while (changed) {
        changed = false
        for (const e of edges) {
          if (toDelete.has(e.source) && !toDelete.has(e.target)) {
            toDelete.add(e.target)
            changed = true
          }
        }
      }

      setNodes((nds) => nds.filter((n) => !toDelete.has(n.id)))
      setEdges((eds) => eds.filter((e) => !toDelete.has(e.source) && !toDelete.has(e.target)))
    },
    [edges, setNodes, setEdges],
  )

  return (
    <LogicTreeActionsContext.Provider value={{ addChild, updateContent, deleteNode }}>
      <div style={{ width: '100%', height: '100%' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </LogicTreeActionsContext.Provider>
  )
}

export default LogicTree
