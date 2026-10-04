import { useState } from 'react'
import { Box, AppBar, Toolbar, Typography, Button, Stack, TextField } from '@mui/material'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import HistoryIcon from '@mui/icons-material/History'
import { supabase } from '../supabaseClient.js'

function HomePage({ onStart, onHistory }) {
  const [timerMinutes, setTimerMinutes] = useState('')

  const handleStart = () => {
    const minutes = Number(timerMinutes)
    onStart(minutes > 0 ? minutes : null)
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" component="div">
            ロジックツリートレーニング
          </Typography>
          <Button color="inherit" onClick={() => supabase.auth.signOut()}>
            ログアウト
          </Button>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          px: 2,
        }}
      >
        <Typography variant="h4" component="h1" sx={{ textAlign: 'center' }}>
          ロジックツリートレーニング
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ textAlign: 'center', maxWidth: 480 }}
        >
          1つのお題について、自分でロジックツリーを作りながら
          論理的思考・構造化思考を鍛えるトレーニングアプリです。
        </Typography>

        <Stack direction="column" spacing={2} sx={{ width: 280 }}>
          <TextField
            label="制限時間（分・任意）"
            type="number"
            size="small"
            value={timerMinutes}
            onChange={(e) => setTimerMinutes(e.target.value)}
            helperText="タイムアタックしたい場合だけ入力してください"
            slotProps={{ htmlInput: { min: 1, max: 180 } }}
          />
          <Button variant="contained" size="large" startIcon={<AddCircleIcon />} onClick={handleStart}>
            新しいツリーを作る
          </Button>
          <Button variant="outlined" size="large" startIcon={<HistoryIcon />} onClick={onHistory}>
            履歴を見る
          </Button>
        </Stack>
      </Box>
    </Box>
  )
}

export default HomePage
