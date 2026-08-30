import { useEffect, useState } from 'react'
import { ReactFlow, Background, Controls } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import questionTypeLabel from '../lib/questionTypeLabel.js'
import { fetchTreeHistory, fetchTreeNodes } from '../lib/history.js'

function buildReadOnlyTree(nodeRows) {
  const nodes = nodeRows.map((row) => ({
    id: row.node_key,
    position: { x: row.position_x, y: row.position_y },
    data: { label: row.content || '(未入力)' },
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

function TreeListItem({ tree, onClick }) {
  const evaluation = tree.evaluations?.[0]
  return (
    <ListItemButton onClick={onClick} divider>
      <ListItemText
        primary={tree.question_text}
        secondary={new Date(tree.created_at).toLocaleString('ja-JP')}
      />
      <Chip
        label={evaluation ? `${evaluation.total}点` : '未評価'}
        color={evaluation ? 'primary' : 'default'}
        size="small"
      />
    </ListItemButton>
  )
}

function TreeDetail({ tree, onBack }) {
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
            <Typography variant="subtitle2" sx={{ mt: 1 }}>
              良かった点
            </Typography>
            <ul style={{ marginTop: 4 }}>
              {evaluation.good_points.map((text, i) => (
                <li key={i}>
                  <Typography variant="body2">{text}</Typography>
                </li>
              ))}
            </ul>
            <Typography variant="subtitle2" sx={{ mt: 1 }}>
              改善した方がよい点
            </Typography>
            <ul style={{ marginTop: 4 }}>
              {evaluation.improvements.map((text, i) => (
                <li key={i}>
                  <Typography variant="body2">{text}</Typography>
                </li>
              ))}
            </ul>
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

function HistoryPage({ onBack }) {
  const [trees, setTrees] = useState(null)
  const [error, setError] = useState('')
  const [selectedTree, setSelectedTree] = useState(null)

  useEffect(() => {
    fetchTreeHistory()
      .then(setTrees)
      .catch((err) => setError(err.message))
  }, [])

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => (selectedTree ? setSelectedTree(null) : onBack())}
            sx={{ mr: 1 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6">{selectedTree ? 'ツリー詳細' : '評価履歴'}</Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {selectedTree ? (
          <TreeDetail tree={selectedTree} onBack={() => setSelectedTree(null)} />
        ) : (
          <>
            {error && <Alert severity="error">{error}</Alert>}
            {!trees && !error && (
              <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
                <CircularProgress />
              </Box>
            )}
            {trees && trees.length === 0 && (
              <Typography sx={{ p: 2 }} color="text.secondary">
                まだ保存したツリーがありません。
              </Typography>
            )}
            {trees && trees.length > 0 && (
              <List disablePadding>
                {trees.map((tree) => (
                  <TreeListItem key={tree.id} tree={tree} onClick={() => setSelectedTree(tree)} />
                ))}
              </List>
            )}
          </>
        )}
      </Box>
    </Box>
  )
}

export default HistoryPage
