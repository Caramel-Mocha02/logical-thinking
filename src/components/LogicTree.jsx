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

// targetId が ancestorId の子孫（さらに下の階層）かどうかを調べる。
// 親のつなぎ替えでループ（自分の子孫を自分の親にする）が起きないようにするために使う
function isDescendant(edges, ancestorId, targetId) {
  const stack = edges.filter((e) => e.source === ancestorId).map((e) => e.target)
  const visited = new Set()
  while (stack.length > 0) {
    const current = stack.pop()
    if (current === targetId) return true
    if (visited.has(current)) continue
    visited.add(current)
    edges.filter((e) => e.source === current).forEach((e) => stack.push(e.target))
  }
  return false
}

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

  // childId の親を newParentId に変更する。ルートに親をつけたり、ループができる
  // つなぎ替え（例: 自分の子孫を自分の親にする）は無視して何もしない
  const setParent = useCallback(
    (childId, newParentId, oldEdgeId) => {
      if (!childId || !newParentId) return
      if (childId === 'root') return
      if (childId === newParentId) return
      if (isDescendant(edges, childId, newParentId)) return

      setEdges((eds) => {
        const withoutOldParent = eds.filter((e) => e.target !== childId && e.id !== oldEdgeId)
        return [
          ...withoutOldParent,
          { id: oldEdgeId ?? `edge-${newParentId}-${childId}`, source: newParentId, target: childId },
        ]
      })
    },
    [edges, setEdges],
  )

  const onConnect = useCallback(
    (connection) => setParent(connection.target, connection.source),
    [setParent],
  )

  const onReconnect = useCallback(
    (oldEdge, newConnection) => setParent(newConnection.target, newConnection.source, oldEdge.id),
    [setParent],
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
          onConnect={onConnect}
          onReconnect={onReconnect}
          edgesReconnectable
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
