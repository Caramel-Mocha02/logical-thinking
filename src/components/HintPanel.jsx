import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material'

function HintPanel({ open, onClose, hint }) {
  if (!hint) return null

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>ヒント</DialogTitle>
      <DialogContent dividers>
        <Typography variant="caption" color="text.secondary">
          対象ノード
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          {hint.targetContent || '(未入力)'}
        </Typography>

        <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {hint.text}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>閉じる</Button>
      </DialogActions>
    </Dialog>
  )
}

export default HintPanel
