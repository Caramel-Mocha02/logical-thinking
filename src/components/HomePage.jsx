import { useState } from 'react'
import { Box, AppBar, Toolbar, Typography, Button, Stack, TextField } from '@mui/material'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import { supabase } from '../supabaseClient.js'
import HistoryList from './HistoryList.jsx'
import Logo from './Logo.jsx'

function HomePage({ onStart }) {
  const [timerMinutes, setTimerMinutes] = useState('')

  const handleStart = () => {
    const minutes = Number(timerMinutes)
    onStart(minutes > 0 ? minutes : null)
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Logo />
          <Button color="inherit" onClick={() => supabase.auth.signOut()}>
            ログアウト
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            px: 2,
            py: 4,
          }}
        >
          <Logo size="large" />
          <Typography
            variant="body2"
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
            <Button
              variant="contained"
              size="large"
              startIcon={<AddCircleIcon />}
              onClick={handleStart}
            >
              新しいツリーを作る
            </Button>
          </Stack>
        </Box>

        <Box sx={{ borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle1" sx={{ px: 2, pt: 2 }}>
            これまでの履歴
          </Typography>
          <HistoryList />
        </Box>
      </Box>
    </Box>
  )
}

export default HomePage
