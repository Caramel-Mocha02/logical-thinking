import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  Panel,
  useNodesState,
  useEdgesState,
  useUpdateNodeInternals,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Button, Chip, Snackbar, Alert, Typography } from '@mui/material'
import RateReviewIcon from '@mui/icons-material/RateReview'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import SwapVertIcon from '@mui/icons-material/SwapVert'
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom'
import LogicTreeNode from './LogicTreeNode.jsx'
import LogicTreeActionsContext from './LogicTreeActionsContext.jsx'
import EvaluationPanel from './EvaluationPanel.jsx'
import HintPanel from './HintPanel.jsx'
import NodeCheckPanel from './NodeCheckPanel.jsx'
import TimerControl from './TimerControl.jsx'
import { useAuth } from '../auth/AuthContext.jsx'
import { upsertTree } from '../lib/treeStorage.js'
import { evaluateTree } from '../lib/evaluateTree.js'
import { fetchHint } from '../lib/hint.js'
import { checkNode as checkNodeApi } from '../lib/checkNode.js'
import { formatSeconds } from '../lib/formatTime.js'

const nodeTypes = { logicNode: LogicTreeNode }

const CHILD_SPACING = 260
const VERTICAL_DEPTH_OFFSET = 150 // 縦向き: ノードの高さより広ければよい
const HORIZONTAL_DEPTH_OFFSET = 300 // 横向き: ノードの最大幅(260px)より広くして重ならないようにする
const HINT_LIMIT = 1 // 1つのツリーあたりのヒント回数上限
const AUTOSAVE_DELAY_MS = 1500

function createInitialNodes(question) {
  return [
    {
      id: 'root',
      type: 'logicNode',
      position: { x: 300, y: 100 },
      data: { content: question?.text ?? '', title: '', isRoot: true },
    },
  ]
}

// ノードの表示用テキスト(要素：説明)をAI送信・検索用にまとめる
function nodeDisplayText(data) {
  if (data.isRoot) return data.content ?? ''
  const title = data.title ?? ''
  const content = data.content ?? ''
  if (title && content) return `${title}：${content}`
  return title || content
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
  const textById = new Map(nodes.map((n) => [n.id, nodeDisplayText(n.data)]))

  const path = []
  let current = nodeId
  while (current) {
    path.unshift(textById.get(current) ?? '')
    current = parentByChild.get(current)
  }
  return path
}

function LogicTree({ question, timerMinutes }) {
  return (
    <ReactFlowProvider>
      <LogicTreeInner question={question} timerMinutes={timerMinutes} />
    </ReactFlowProvider>
  )
}

// useUpdateNodeInternalsなどのReact FlowのフックはReactFlowProviderの内側でしか
// 使えないため、実際の処理はこの内側コンポーネントで行う
function LogicTreeInner({ question, timerMinutes }) {
  const { session } = useAuth()
  const [nodes, setNodes, onNodesChange] = useNodesState(() => createInitialNodes(question))
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [nextId, setNextId] = useState(1)
  const [saveStatus, setSaveStatus] = useState('idle') // 'idle' | 'saving' | 'saved' | 'error'
  const [snackbar, setSnackbar] = useState(null) // { severity, message }
  const [evaluating, setEvaluating] = useState(false)
  const [evaluation, setEvaluation] = useState(null)
  const [evaluationOpen, setEvaluationOpen] = useState(false)
  const [hintLoadingNodeId, setHintLoadingNodeId] = useState(null)
  const [hint, setHint] = useState(null) // { targetContent, text }
  const [hintOpen, setHintOpen] = useState(false)
  const [hintCount, setHintCount] = useState(0) // このツリーで使ったヒントの回数
  const [checkingNodeId, setCheckingNodeId] = useState(null)
  const [nodeCheckResult, setNodeCheckResult] = useState(null) // { targetContent, scores, feedback }
  const [nodeCheckOpen, setNodeCheckOpen] = useState(false)
  const [orientation, setOrientation] = useState('vertical') // 'vertical' または 'horizontal'
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const reactFlowInstanceRef = useRef(null)
  const updateNodeInternals = useUpdateNodeInternals()

  const sessionStartRef = useRef(Date.now())
  const treeIdRef = useRef(null)
  const autosaveTimeoutRef = useRef(null)
  const latestRef = useRef({ nodes, edges, evaluation })

  // 常に最新のnodes/edges/evaluationを参照できるようにしておく(自動保存のタイマーから使うため)
  useEffect(() => {
    latestRef.current = { nodes, edges, evaluation }
  })

  // 1秒ごとに経過時間を更新する
  useEffect(() => {
    const intervalId = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - sessionStartRef.current) / 1000))
    }, 1000)
    return () => clearInterval(intervalId)
  }, [])

  const doAutosave = useCallback(async () => {
    const { nodes: n, edges: e, evaluation: ev } = latestRef.current
    const durationSeconds = Math.floor((Date.now() - sessionStartRef.current) / 1000)
    try {
      const treeId = await upsertTree({
        treeId: treeIdRef.current,
        userId: session.user.id,
        questionType: question.type,
        questionText: question.text,
        nodes: n,
        edges: e,
        evaluation: ev,
        durationSeconds,
      })
      treeIdRef.current = treeId
      setSaveStatus('saved')
    } catch (err) {
      setSaveStatus('error')
      setSnackbar({ severity: 'error', message: `自動保存に失敗しました: ${err.message}` })
    }
  }, [session, question])

  // 編集してからしばらく操作がなければ自動保存する(操作のたびに保存し直さないため)
  const scheduleAutosave = useCallback(() => {
    setSaveStatus('saving')
    if (autosaveTimeoutRef.current) clearTimeout(autosaveTimeoutRef.current)
    autosaveTimeoutRef.current = setTimeout(doAutosave, AUTOSAVE_DELAY_MS)
  }, [doAutosave])

  useEffect(() => {
    return () => {
      if (autosaveTimeoutRef.current) clearTimeout(autosaveTimeoutRef.current)
    }
  }, [])

  // 向きを切り替えたときに、接続点(Handle)の位置をReact Flowに再計測させる。
  // これをしないと、見た目の点の位置と実際に線がつながる位置がずれてしまう
  useEffect(() => {
    nodes.forEach((n) => updateNodeInternals(n.id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orientation])

  // 新しいノードが画面外に配置されて「見えない」ことがないよう、追加のたびに全体を表示し直す
  const fitViewSoon = () => {
    requestAnimationFrame(() => {
      reactFlowInstanceRef.current?.fitView({ padding: 0.3, duration: 300 })
    })
  }

  // ツリーの内容が変わったら、古い評価結果を保存してしまわないよう評価結果を破棄する
  const updateNode = useCallback(
    (id, fields) => {
      setNodes((nds) =>
        nds.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...fields } } : n)),
      )
      setEvaluation(null)
      scheduleAutosave()
    },
    [setNodes, scheduleAutosave],
  )

  const addChild = useCallback(
    (parentId) => {
      const parent = nodes.find((n) => n.id === parentId)
      if (!parent) return

      const childCount = edges.filter((e) => e.source === parentId).length
      const newId = `node-${nextId}`
      setNextId((n) => n + 1)

      const position =
        orientation === 'vertical'
          ? {
              x: parent.position.x - 130 + childCount * CHILD_SPACING,
              y: parent.position.y + VERTICAL_DEPTH_OFFSET,
            }
          : {
              x: parent.position.x + HORIZONTAL_DEPTH_OFFSET,
              y: parent.position.y - 70 + childCount * CHILD_SPACING,
            }

      const newNode = {
        id: newId,
        type: 'logicNode',
        position,
        data: { title: '', content: '' },
      }

      setNodes((nds) => [...nds, newNode])
      setEdges((eds) => [...eds, { id: `edge-${parentId}-${newId}`, source: parentId, target: newId }])
      setEvaluation(null)
      fitViewSoon()
      scheduleAutosave()
    },
    [nodes, edges, nextId, orientation, setNodes, setEdges, scheduleAutosave],
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
      setEvaluation(null)
      scheduleAutosave()
    },
    [edges, setNodes, setEdges, scheduleAutosave],
  )

  // childId の親を newParentId に変更する。ルートに親をつけたり、ループができる
  // つなぎ替え（例: 自分の子孫を自分の親にする）は無視して何もしない
  const setParent = useCallback(
    (childId, newParentId, oldEdgeId) => {
      if (!childId || !newParentId) return
      if (childId === 'root') return
      if (childId === newParentId) return
      if (isDescendant(edges, childId, newParentId)) return

      setEvaluation(null)
      setEdges((eds) => {
        const withoutOldParent = eds.filter((e) => e.target !== childId && e.id !== oldEdgeId)
        return [
          ...withoutOldParent,
          { id: oldEdgeId ?? `edge-${newParentId}-${childId}`, source: newParentId, target: childId },
        ]
      })
      scheduleAutosave()
    },
    [edges, setEdges, scheduleAutosave],
  )

  const onConnect = useCallback(
    (connection) => setParent(connection.target, connection.source),
    [setParent],
  )

  const onReconnect = useCallback(
    (oldEdge, newConnection) => setParent(newConnection.target, newConnection.source, oldEdge.id),
    [setParent],
  )

  const handleEvaluate = async () => {
    setEvaluating(true)
    try {
      const parentIdByNodeId = new Map(edges.map((e) => [e.target, e.source]))
      const treeNodes = nodes.map((n) => ({
        id: n.id,
        parentId: parentIdByNodeId.get(n.id) ?? null,
        title: n.data.title ?? '',
        content: n.data.content ?? '',
      }))
      const result = await evaluateTree({
        questionType: question.type,
        questionText: question.text,
        nodes: treeNodes,
      })
      setEvaluation(result)
      setEvaluationOpen(true)
      scheduleAutosave()
    } catch (err) {
      setSnackbar({ severity: 'error', message: `評価に失敗しました: ${err.message}` })
    } finally {
      setEvaluating(false)
    }
  }

  const getHint = useCallback(
    async (nodeId) => {
      if (hintCount >= HINT_LIMIT) {
        setSnackbar({ severity: 'warning', message: `ヒントはこのツリーで${HINT_LIMIT}回まで使えます` })
        return
      }
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
        setHintCount((c) => c + 1)
      } catch (err) {
        setSnackbar({ severity: 'error', message: `ヒントの取得に失敗しました: ${err.message}` })
      } finally {
        setHintLoadingNodeId(null)
      }
    },
    [nodes, edges, question, hintCount],
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

  const saveStatusLabel = {
    idle: '',
    saving: '保存中...',
    saved: '保存済み',
    error: '保存に失敗しました',
  }[saveStatus]

  return (
    <LogicTreeActionsContext.Provider
      value={{
        addChild,
        updateNode,
        deleteNode,
        getHint,
        hintLoadingNodeId,
        hintRemaining: HINT_LIMIT - hintCount,
        checkNode: handleCheckNode,
        checkingNodeId,
        orientation,
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
          defaultEdgeOptions={{ type: 'straight' }}
          fitView
          onInit={(instance) => {
            reactFlowInstanceRef.current = instance
          }}
        >
          <Background />
          <Controls showInteractive={false} />
          {nodes.length === 1 && (
            <Panel position="top-left">
              <Alert severity="info" sx={{ maxWidth: 360 }}>
                ルートノードをクリックして考えを入力し、右下の＋ボタンで下の階層に分解していきましょう。
                💡はヒント、✓はそのノードだけのチェックです。ある程度できたら「評価する」でツリー全体を確認できます。
              </Alert>
            </Panel>
          )}
          <Panel position="top-right" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Chip
              icon={<HourglassBottomIcon />}
              label={`経過 ${formatSeconds(elapsedSeconds)}`}
              variant="outlined"
            />
            <TimerControl initialMinutes={timerMinutes} />
            <Button
              variant="outlined"
              startIcon={orientation === 'vertical' ? <SwapHorizIcon /> : <SwapVertIcon />}
              onClick={() =>
                setOrientation((o) => (o === 'vertical' ? 'horizontal' : 'vertical'))
              }
            >
              {orientation === 'vertical' ? '横向きにする' : '縦向きにする'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<RateReviewIcon />}
              onClick={handleEvaluate}
              disabled={evaluating}
            >
              {evaluating ? '評価中...' : '評価する'}
            </Button>
            {saveStatusLabel && (
              <Typography
                variant="body2"
                color={saveStatus === 'error' ? 'error' : 'text.secondary'}
              >
                {saveStatusLabel}
              </Typography>
            )}
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
