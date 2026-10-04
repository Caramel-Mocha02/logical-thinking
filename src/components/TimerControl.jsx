import { useEffect, useState } from 'react'
import { Chip } from '@mui/material'
import TimerIcon from '@mui/icons-material/Timer'
import { formatSeconds } from '../lib/formatTime.js'

// initialMinutesが指定されていれば、表示と同時にカウントダウンを始める。
// 時間切れになったらonLockChange(true)を呼び、チップを閉じるとonLockChange(false)を呼ぶ
function TimerControl({ initialMinutes, onLockChange }) {
  const [remainingSeconds, setRemainingSeconds] = useState(
    initialMinutes ? initialMinutes * 60 : null,
  )
  const [timeUp, setTimeUp] = useState(false)

  // 1秒ごとにカウントダウンする
  useEffect(() => {
    if (remainingSeconds === null) return
    if (remainingSeconds <= 0) {
      setTimeUp(true)
      onLockChange?.(true)
      return
    }
    const timerId = setTimeout(() => setRemainingSeconds((s) => s - 1), 1000)
    return () => clearTimeout(timerId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingSeconds])

  const handleDismiss = () => {
    setRemainingSeconds(null)
    if (timeUp) onLockChange?.(false)
  }

  if (remainingSeconds === null) return null

  return (
    <Chip
      icon={<TimerIcon />}
      label={timeUp ? '時間切れ' : formatSeconds(remainingSeconds)}
      color={timeUp ? 'error' : 'default'}
      onDelete={handleDismiss}
      sx={{ mr: 1 }}
    />
  )
}

export default TimerControl
