import { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Chip,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import evaluationScoreLabel from '../lib/evaluationScoreLabel.js'
import { fetchTreeHistory } from '../lib/history.js'
import { computeEvaluationStats, computeMonthlySkillTrend } from '../lib/evaluationStats.js'
import { formatSeconds } from '../lib/formatTime.js'
import SkillGraph from './SkillGraph.jsx'
import TreeDetail from './TreeDetail.jsx'

function StatsSummary({ trees }) {
  const stats = computeEvaluationStats(trees)
  if (!stats) return null

  return (
    <Box
      sx={{
        mx: 2,
        mb: 2,
        p: 2,
        borderRadius: 2,
        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
        borderLeft: 4,
        borderColor: 'primary.main',
      }}
    >
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
        平均点: {stats.averageTotal}点（評価済み{stats.count}件から算出）
      </Typography>
      <Typography variant="body2" color="text.secondary">
        弱点: {evaluationScoreLabel[stats.weakestKey]}（平均{stats.averageScores[stats.weakestKey]}
        点）が7項目中もっとも低めです。次にツリーを作るときはここを意識してみましょう。
      </Typography>
    </Box>
  )
}

// ListItemButton(クリックでツリー詳細)と「続きから始める」ボタンは、どちらも
// <button>要素になるため、ボタンの中にボタンを入れない(無効なHTML)ように
// 兄弟要素として並べている
function TreeListItem({ tree, onClick, onResume }) {
  const evaluation = tree.evaluations?.[0]
  return (
    <ListItem disablePadding divider sx={{ display: 'flex', alignItems: 'center', gap: 1, pr: 2 }}>
      <ListItemButton onClick={onClick} sx={{ minWidth: 0, flex: 1 }}>
        <ListItemText
          primary={tree.question_text}
          secondary={
            new Date(tree.created_at).toLocaleString('ja-JP') +
            (tree.duration_seconds != null ? ` ・ 所要時間 ${formatSeconds(tree.duration_seconds)}` : '')
          }
        />
        <Chip
          label={evaluation ? `${evaluation.total}点` : '未評価'}
          color={evaluation ? 'primary' : 'default'}
          size="small"
        />
      </ListItemButton>
      {!evaluation && (
        <Button size="small" onClick={() => onResume(tree)}>
          続きから始める
        </Button>
      )}
    </ListItem>
  )
}

// スタート画面に埋め込む履歴一覧(統計・月別グラフ・リスト)。
// クリックするとその場でツリーの詳細を表示する
function HistoryList({ onResume }) {
  const [trees, setTrees] = useState(null)
  const [error, setError] = useState('')
  const [selectedTree, setSelectedTree] = useState(null)

  useEffect(() => {
    fetchTreeHistory()
      .then(setTrees)
      .catch((err) => setError(err.message))
  }, [])

  if (selectedTree) {
    return (
      <Box>
        <ListItemButton onClick={() => setSelectedTree(null)} sx={{ color: 'primary.main' }}>
          ← 一覧に戻る
        </ListItemButton>
        <TreeDetail tree={selectedTree} />
      </Box>
    )
  }

  return (
    <Box>
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
        <>
          <StatsSummary trees={trees} />
          <SkillGraph data={computeMonthlySkillTrend(trees)} />
          <List disablePadding>
            {trees.map((tree) => (
              <TreeListItem
                key={tree.id}
                tree={tree}
                onClick={() => setSelectedTree(tree)}
                onResume={onResume}
              />
            ))}
          </List>
        </>
      )}
    </Box>
  )
}

export default HistoryList
