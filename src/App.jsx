import { useEffect, useState } from 'react'
import { AppBar, Toolbar, Typography, Box, Paper, Chip, Button, CircularProgress } from '@mui/material'
import LogicTree from './components/LogicTree.jsx'
import { useAuth } from './auth/AuthContext.jsx'
import LoginPage from './auth/LoginPage.jsx'
import { supabase } from './supabaseClient.js'
import { fetchRandomQuestion } from './lib/questions.js'

const questionTypeLabel = {
  how: 'How型',
  why: 'Why型',
  what: 'What型',
}

function App() {
  const { session, loading } = useAuth()
  const [question, setQuestion] = useState(null)
  const [questionLoading, setQuestionLoading] = useState(true)

  const loadQuestion = () => {
    setQuestionLoading(true)
    fetchRandomQuestion()
      .then(setQuestion)
      .finally(() => setQuestionLoading(false))
  }

  useEffect(() => {
    if (session) loadQuestion()
  }, [session])

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
        {questionLoading || !question ? (
          <CircularProgress size={20} />
        ) : (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Chip label={questionTypeLabel[question.type]} size="small" />
              <Button size="small" onClick={loadQuestion}>
                別のお題にする
              </Button>
            </Box>
            <Typography variant="h6" component="h1">
              {question.text}
            </Typography>
          </>
        )}
      </Paper>

      <Box sx={{ flex: 1 }}>
        {question && <LogicTree key={question.id} question={question} />}
      </Box>
    </Box>
  )
}

export default App
