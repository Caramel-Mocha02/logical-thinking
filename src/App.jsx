import { AppBar, Toolbar, Typography, Box, Paper, Chip, Button, CircularProgress } from '@mui/material'
import LogicTree from './components/LogicTree.jsx'
import { useAuth } from './auth/AuthContext.jsx'
import LoginPage from './auth/LoginPage.jsx'
import { supabase } from './supabaseClient.js'

// お題管理（DB連携）はPhase 9で実装する。それまでは仮のお題を1つ固定で使う
const question = {
  type: 'how',
  text: '会社の利益を20%増加させるには？',
}

const questionTypeLabel = {
  how: 'How型',
  why: 'Why型',
  what: 'What型',
}

function App() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!session) {
    return <LoginPage />
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

      <Paper square elevation={1} sx={{ px: 3, py: 2 }}>
        <Chip label={questionTypeLabel[question.type]} size="small" sx={{ mb: 1 }} />
        <Typography variant="h6" component="h1">
          {question.text}
        </Typography>
      </Paper>

      <Box sx={{ flex: 1 }}>
        <LogicTree question={question} />
      </Box>
    </Box>
  )
}

export default App
