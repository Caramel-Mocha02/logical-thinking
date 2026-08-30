import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  LinearProgress,
} from '@mui/material'

const scoreLabel = {
  abstraction: '抽象度',
  concreteness: '具体性',
  causality: '因果関係',
  parentRelation: '親ノードとの関係',
}

function ScoreBar({ label, value }) {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2">{label}</Typography>
        <Typography variant="body2">{value}点</Typography>
      </Box>
      <LinearProgress variant="determinate" value={value} sx={{ height: 8, borderRadius: 4 }} />
    </Box>
  )
}

function NodeCheckPanel({ open, onClose, result }) {
  if (!result) return null

  const { targetContent, scores, feedback } = result

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>ノードのチェック結果</DialogTitle>
      <DialogContent dividers>
        <Typography variant="caption" color="text.secondary">
          対象ノード
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          {targetContent || '(未入力)'}
        </Typography>

        {Object.entries(scoreLabel).map(([key, label]) => (
          <ScoreBar key={key} label={label} value={scores[key]} />
        ))}

        <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1, mt: 2 }}>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
            {feedback}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>閉じる</Button>
      </DialogActions>
    </Dialog>
  )
}

export default NodeCheckPanel
