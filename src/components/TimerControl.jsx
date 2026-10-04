import { useEffect, useState } from 'react'
import { Chip } from '@mui/material'
import TimerIcon from '@mui/icons-material/Timer'

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

// initialMinutesが指定されていれば、表示と同時にカウントダウンを始める
function TimerControl({ initialMinutes }) {
  const [remainingSeconds, setRemainingSeconds] = useState(
    initialMinutes ? initialMinutes * 60 : null,
  )
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

  if (remainingSeconds === null) return null

  return (
    <Chip
      icon={<TimerIcon />}
      label={timeUp ? '時間切れ' : formatTime(remainingSeconds)}
      color={timeUp ? 'error' : 'default'}
      onDelete={() => setRemainingSeconds(null)}
      sx={{ mr: 1 }}
    />
  )
}

export default TimerControl
