import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material'

const scoreLabel = {
  logic: '論理性',
  mece: 'MECE',
  hierarchy: '階層構造',
  abstraction: '抽象度',
  causality: '因果関係',
  concreteness: '具体性',
  expression: '文章表現',
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

function EvaluationPanel({ open, onClose, evaluation }) {
  if (!evaluation) return null

  const { scores, total, goodPoints, improvements, deepenNodes } = evaluation

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

        {Object.entries(scoreLabel).map(([key, label]) => (
          <ScoreBar key={key} label={label} value={scores[key]} />
        ))}

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          良かった点
        </Typography>
        <List dense>
          {goodPoints.map((text, i) => (
            <ListItem key={i} sx={{ display: 'list-item', pl: 2 }}>
              <ListItemText primary={text} />
            </ListItem>
          ))}
        </List>

        <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
          改善した方がよい点
        </Typography>
        <List dense>
          {improvements.map((text, i) => (
            <ListItem key={i} sx={{ display: 'list-item', pl: 2 }}>
              <ListItemText primary={text} />
            </ListItem>
          ))}
        </List>

        {deepenNodes && deepenNodes.length > 0 && (
          <>
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
              もう一段深掘りした方がよいノード
            </Typography>
            <List dense>
              {deepenNodes.map((node, i) => (
                <ListItem key={i} sx={{ display: 'list-item', pl: 2 }}>
                  <ListItemText primary={node.content} secondary={node.reason} />
                </ListItem>
              ))}
            </List>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>閉じる</Button>
      </DialogActions>
    </Dialog>
  )
}

export default EvaluationPanel
