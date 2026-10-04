import { useEffect, useState } from 'react'
import {
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'
import TimerIcon from '@mui/icons-material/Timer'

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function TimerControl() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [minutesInput, setMinutesInput] = useState(10)
  const [remainingSeconds, setRemainingSeconds] = useState(null) // nullなら未開始
  const [timeUp, setTimeUp] = useState(false)

  // 1秒ごとにカウントダウンする
  useEffect(() => {
    if (remainingSeconds === null) return
    if (remainingSeconds <= 0) {
      setTimeUp(true)
      return
    }
    const timerId = setTimeout(() => setRemainingSeconds((s) => s - 1), 1000)
    return () => clearTimeout(timerId)
  }, [remainingSeconds])

  const startTimer = () => {
    setRemainingSeconds(Math.max(1, Math.round(minutesInput)) * 60)
    setTimeUp(false)
    setDialogOpen(false)
  }

  const stopTimer = () => {
    setRemainingSeconds(null)
    setTimeUp(false)
  }

  return (
    <>
      {remainingSeconds !== null && (
        <Chip
          icon={<TimerIcon />}
          label={timeUp ? '時間切れ' : formatTime(remainingSeconds)}
          color={timeUp ? 'error' : 'default'}
          onDelete={stopTimer}
          sx={{ mr: 1 }}
        />
      )}

      <IconButton onClick={() => setDialogOpen(true)} title="タイムアタックの設定">
        <SettingsIcon />
      </IconButton>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>タイムアタック設定</DialogTitle>
        <DialogContent>
          <TextField
            label="制限時間（分）"
            type="number"
            fullWidth
            margin="normal"
            value={minutesInput}
            onChange={(e) => setMinutesInput(e.target.value)}
            slotProps={{ htmlInput: { min: 1, max: 180 } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>キャンセル</Button>
          <Button variant="contained" onClick={startTimer}>
            開始
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default TimerControl
