import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tabs,
  Tab,
  Box,
  List,
  ListItemButton,
  ListItemText,
  Chip,
  TextField,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from '@mui/material'
import questionTypeLabel from '../lib/questionTypeLabel.js'
import { fetchAllQuestions } from '../lib/questions.js'

const MAX_LENGTH = 100

function QuestionPicker({ open, onClose, onSelect }) {
  const [tab, setTab] = useState('list')
  const [questions, setQuestions] = useState(null)
  const [error, setError] = useState('')
  const [customType, setCustomType] = useState('how')
  const [customText, setCustomText] = useState('')

  useEffect(() => {
    if (open && !questions) {
      fetchAllQuestions()
        .then(setQuestions)
        .catch((err) => setError(err.message))
    }
  }, [open, questions])

  const handleSelectExisting = (question) => {
    onSelect(question)
    onClose()
  }

  const handleSelectCustom = () => {
    if (!customText.trim()) return
    onSelect({ id: `custom-${Date.now()}`, type: customType, text: customText.trim() })
    setCustomText('')
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>お題を選ぶ</DialogTitle>

      <Tabs value={tab} onChange={(_e, v) => setTab(v)} sx={{ px: 3 }}>
        <Tab label="一覧から選ぶ" value="list" />
        <Tab label="自分で入力する" value="custom" />
      </Tabs>

      <DialogContent dividers>
        {tab === 'list' && (
          <>
            {error && <Alert severity="error">{error}</Alert>}
            {!questions && !error && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            )}
            {questions && (
              <List disablePadding>
                {questions.map((q) => (
                  <ListItemButton key={q.id} onClick={() => handleSelectExisting(q)} divider>
                    <Chip
                      label={questionTypeLabel[q.type]}
                      size="small"
                      sx={{ mr: 2 }}
                    />
                    <ListItemText primary={q.text} />
                  </ListItemButton>
                ))}
              </List>
            )}
          </>
        )}

        {tab === 'custom' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Select value={customType} onChange={(e) => setCustomType(e.target.value)} size="small">
              <MenuItem value="how">How型</MenuItem>
              <MenuItem value="why">Why型</MenuItem>
              <MenuItem value="what">What型</MenuItem>
            </Select>
            <TextField
              label="お題の文章"
              multiline
              minRows={2}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              helperText={`${customText.length}/${MAX_LENGTH}`}
              slotProps={{ htmlInput: { maxLength: MAX_LENGTH } }}
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>キャンセル</Button>
        {tab === 'custom' && (
          <Button variant="contained" onClick={handleSelectCustom} disabled={!customText.trim()}>
            このお題にする
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}

export default QuestionPicker
