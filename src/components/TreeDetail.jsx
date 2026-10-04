import { useEffect, useState } from 'react'
import { ReactFlow, Background, Controls } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Box, Typography, Chip, CircularProgress, Alert } from '@mui/material'
import questionTypeLabel from '../lib/questionTypeLabel.js'
import { fetchTreeNodes } from '../lib/history.js'
import { formatSeconds } from '../lib/formatTime.js'

// 「要素：説明」の形にまとめる。ルートは説明(お題)だけを表示する
function nodeDisplayText(row) {
  if (!row.parent_key) return row.content || '(未入力)'
  if (row.title && row.content) return `${row.title}：${row.content}`
  return row.title || row.content || '(未入力)'
}

function buildReadOnlyTree(nodeRows) {
  const nodes = nodeRows.map((row) => ({
    id: row.node_key,
    position: { x: row.position_x, y: row.position_y },
    data: { label: nodeDisplayText(row) },
    draggable: false,
  }))

  const edges = nodeRows
    .filter((row) => row.parent_key)
    .map((row) => ({
      id: `${row.parent_key}-${row.node_key}`,
      source: row.parent_key,
      target: row.node_key,
    }))

  return { nodes, edges }
}

function TreeDetail({ tree }) {
  const [nodeRows, setNodeRows] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    fetchTreeNodes(tree.id)
      .then(setNodeRows)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [tree.id])

  const evaluation = tree.evaluations?.[0]

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Chip label={questionTypeLabel[tree.question_type]} size="small" sx={{ mb: 1 }} />
        <Typography variant="h6">{tree.question_text}</Typography>
        <Typography variant="caption" color="text.secondary">
          {new Date(tree.created_at).toLocaleString('ja-JP')}
          {tree.duration_seconds != null && ` ・ 所要時間 ${formatSeconds(tree.duration_seconds)}`}
        </Typography>
      </Box>

      <Box sx={{ height: 400, borderBottom: 1, borderColor: 'divider' }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
            <CircularProgress />
          </Box>
        )}
        {error && <Alert severity="error">{error}</Alert>}
        {nodeRows && (
          <ReactFlow
            nodes={buildReadOnlyTree(nodeRows).nodes}
            edges={buildReadOnlyTree(nodeRows).edges}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            defaultEdgeOptions={{ type: 'straight' }}
            fitView
          >
            <Background />
            <Controls showInteractive={false} />
          </ReactFlow>
        )}
      </Box>

      <Box sx={{ p: 2, overflow: 'auto' }}>
        {evaluation ? (
          <>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              評価結果（総合点: {evaluation.total}点）
            </Typography>
            {evaluation.feedback ? (
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {evaluation.feedback}
              </Typography>
            ) : (
              // 古い形式(箇条書き)で保存された評価との後方互換
              <>
                <Typography variant="subtitle2" sx={{ mt: 1 }}>
                  良かった点
                </Typography>
                <ul style={{ marginTop: 4 }}>
                  {(evaluation.good_points ?? []).map((text, i) => (
                    <li key={i}>
                      <Typography variant="body2">{text}</Typography>
                    </li>
                  ))}
                </ul>
                <Typography variant="subtitle2" sx={{ mt: 1 }}>
                  改善した方がよい点
                </Typography>
                <ul style={{ marginTop: 4 }}>
                  {(evaluation.improvements ?? []).map((text, i) => (
                    <li key={i}>
                      <Typography variant="body2">{text}</Typography>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            この保存には評価結果が含まれていません。
          </Typography>
        )}
      </Box>
    </Box>
  )
}

export default TreeDetail
