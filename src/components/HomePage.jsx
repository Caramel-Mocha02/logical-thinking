import { useState } from 'react'
import { Box, AppBar, Toolbar, Typography, Button, Stack, TextField, Paper } from '@mui/material'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import HistoryIcon from '@mui/icons-material/History'
import { supabase } from '../supabaseClient.js'
import HistoryList from './HistoryList.jsx'
import Logo from './Logo.jsx'

function HomePage({ onStart, onResume }) {
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
            maxWidth: 640,
            mx: 'auto',
            px: 2,
            py: { xs: 3, sm: 5 },
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 5 },
              borderRadius: 4,
              boxShadow: '0 16px 40px rgba(91, 110, 225, 0.16)',
            }}
          >
            <Stack spacing={2} sx={{ alignItems: 'center' }}>
              <Logo size="large" color="primary.main" />
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textAlign: 'center', maxWidth: 440 }}
              >
                1つのお題について、自分でロジックツリーを作りながら
                論理的思考・構造化思考を鍛えるトレーニングアプリです。
              </Typography>

              <Stack direction="column" spacing={2} sx={{ width: 280, pt: 1 }}>
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
            </Stack>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: '0 16px 40px rgba(91, 110, 225, 0.12)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 3, pt: 2.5, pb: 1 }}>
              <HistoryIcon color="primary" fontSize="small" />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                これまでの履歴
              </Typography>
            </Box>
            <HistoryList onResume={onResume} />
          </Paper>
        </Box>
      </Box>
    </Box>
  )
}

export default HomePage
