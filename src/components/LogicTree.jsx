import { useCallback, useState } from 'react'
import { ReactFlow, Background, Controls, Panel, useNodesState, useEdgesState } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Button, Snackbar, Alert } from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import RateReviewIcon from '@mui/icons-material/RateReview'
import LogicTreeNode from './LogicTreeNode.jsx'
import LogicTreeActionsContext from './LogicTreeActionsContext.jsx'
import EvaluationPanel from './EvaluationPanel.jsx'
import HintPanel from './HintPanel.jsx'
import NodeCheckPanel from './NodeCheckPanel.jsx'
import { useAuth } from '../auth/AuthContext.jsx'
import { saveTree } from '../lib/treeStorage.js'
import { evaluateTree } from '../lib/evaluateTree.js'
import { fetchHint } from '../lib/hint.js'
import { checkNode as checkNodeApi } from '../lib/checkNode.js'

const nodeTypes = { logicNode: LogicTreeNode }

const CHILD_SPACING = 260
const CHILD_Y_OFFSET = 150

function createInitialNodes(question) {
  return [
    {
      id: 'root',
      type: 'logicNode',
      position: { x: 300, y: 100 },
      data: { label: question?.text ?? '', isRoot: true },
    },
  ]
}

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

// ルートから対象ノードまでの経路(文章の配列)を求める
function getPathToNode(nodes, edges, nodeId) {
  const parentByChild = new Map(edges.map((e) => [e.target, e.source]))
  const contentById = new Map(nodes.map((n) => [n.id, n.data.label]))

  const path = []
  let current = nodeId
  while (current) {
    path.unshift(contentById.get(current) ?? '')
    current = parentByChild.get(current)
  }
  return path
}

function LogicTree({ question }) {
  const { session } = useAuth()
  const [nodes, setNodes, onNodesChange] = useNodesState(() => createInitialNodes(question))
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [nextId, setNextId] = useState(1)
  const [saving, setSaving] = useState(false)
  const [snackbar, setSnackbar] = useState(null) // { severity, message }
  const [evaluating, setEvaluating] = useState(false)
  const [evaluation, setEvaluation] = useState(null)
  const [evaluationOpen, setEvaluationOpen] = useState(false)
  const [hintLoadingNodeId, setHintLoadingNodeId] = useState(null)
  const [hint, setHint] = useState(null) // { targetContent, text }
  const [hintOpen, setHintOpen] = useState(false)
  const [checkingNodeId, setCheckingNodeId] = useState(null)
  const [nodeCheckResult, setNodeCheckResult] = useState(null) // { targetContent, scores, feedback }
  const [nodeCheckOpen, setNodeCheckOpen] = useState(false)

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

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveTree({
        userId: session.user.id,
        questionType: question.type,
        questionText: question.text,
        nodes,
        edges,
      })
      setSnackbar({ severity: 'success', message: 'ロジックツリーを保存しました' })
    } catch (err) {
      setSnackbar({ severity: 'error', message: `保存に失敗しました: ${err.message}` })
    } finally {
      setSaving(false)
    }
  }

  const handleEvaluate = async () => {
    setEvaluating(true)
    try {
      const result = await evaluateTree({
        questionType: question.type,
        questionText: question.text,
        nodes,
        edges,
      })
      setEvaluation(result)
      setEvaluationOpen(true)
    } catch (err) {
      setSnackbar({ severity: 'error', message: `評価に失敗しました: ${err.message}` })
    } finally {
      setEvaluating(false)
    }
  }

  const getHint = useCallback(
    async (nodeId) => {
      setHintLoadingNodeId(nodeId)
      try {
        const path = getPathToNode(nodes, edges, nodeId)
        const { hint: hintText } = await fetchHint({
          questionType: question.type,
          questionText: question.text,
          path,
        })
        setHint({ targetContent: path[path.length - 1], text: hintText })
        setHintOpen(true)
      } catch (err) {
        setSnackbar({ severity: 'error', message: `ヒントの取得に失敗しました: ${err.message}` })
      } finally {
        setHintLoadingNodeId(null)
      }
    },
    [nodes, edges, question],
  )

  const handleCheckNode = useCallback(
    async (nodeId) => {
      setCheckingNodeId(nodeId)
      try {
        const path = getPathToNode(nodes, edges, nodeId)
        const result = await checkNodeApi({
          questionType: question.type,
          questionText: question.text,
          path,
        })
        setNodeCheckResult({ targetContent: path[path.length - 1], ...result })
        setNodeCheckOpen(true)
      } catch (err) {
        setSnackbar({ severity: 'error', message: `チェックに失敗しました: ${err.message}` })
      } finally {
        setCheckingNodeId(null)
      }
    },
    [nodes, edges, question],
  )

  return (
    <LogicTreeActionsContext.Provider
      value={{
        addChild,
        updateContent,
        deleteNode,
        getHint,
        hintLoadingNodeId,
        checkNode: handleCheckNode,
        checkingNodeId,
      }}
    >
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
          <Panel position="top-right" style={{ display: 'flex', gap: 8 }}>
            <Button
              variant="outlined"
              startIcon={<RateReviewIcon />}
              onClick={handleEvaluate}
              disabled={evaluating}
            >
              {evaluating ? '評価中...' : '評価する'}
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? '保存中...' : '保存'}
            </Button>
          </Panel>
        </ReactFlow>
      </div>

      <EvaluationPanel
        open={evaluationOpen}
        onClose={() => setEvaluationOpen(false)}
        evaluation={evaluation}
      />

      <HintPanel open={hintOpen} onClose={() => setHintOpen(false)} hint={hint} />

      <NodeCheckPanel
        open={nodeCheckOpen}
        onClose={() => setNodeCheckOpen(false)}
        result={nodeCheckResult}
      />

      <Snackbar
        open={snackbar !== null}
        autoHideDuration={4000}
        onClose={() => setSnackbar(null)}
      >
        {snackbar && <Alert severity={snackbar.severity}>{snackbar.message}</Alert>}
      </Snackbar>
    </LogicTreeActionsContext.Provider>
  )
}

export default LogicTree
