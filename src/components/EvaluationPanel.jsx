import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  LinearProgress,
  Divider,
} from '@mui/material'
import evaluationScoreLabel from '../lib/evaluationScoreLabel.js'

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

function EvaluationPanel({ open, onClose, evaluation }) {
  if (!evaluation) return null

  const { scores, total, feedback } = evaluation

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>評価結果</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="overline" color="text.secondary">
            総合点
          </Typography>
          <Typography variant="h3">{total}点</Typography>
        </Box>

        {Object.entries(evaluationScoreLabel).map(([key, label]) => (
          <ScoreBar key={key} label={label} value={scores[key]} />
        ))}

        <Divider sx={{ my: 2 }} />

        <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
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

export default EvaluationPanel
