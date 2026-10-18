import { useState } from 'react'
import { AppBar, Toolbar, Typography, Box, Paper, Chip, Button, CircularProgress } from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import LogicTree from './components/LogicTree.jsx'
import HomePage from './components/HomePage.jsx'
import Logo from './components/Logo.jsx'
import QuestionPicker from './components/QuestionPicker.jsx'
import { useAuth } from './auth/AuthContext.jsx'
import LoginPage from './auth/LoginPage.jsx'
import { supabase } from './supabaseClient.js'
import { fetchRandomQuestion } from './lib/questions.js'
import { fetchTreeNodes } from './lib/history.js'
import { buildEditableTree } from './lib/treeStorage.js'
import questionTypeLabel from './lib/questionTypeLabel.js'

function App() {
  const { session, loading } = useAuth()
  const [question, setQuestion] = useState(null)
  const [questionLoading, setQuestionLoading] = useState(false)
  const [view, setView] = useState('home') // 'home' | 'tree'
  const [pickerOpen, setPickerOpen] = useState(false)
  const [timerMinutes, setTimerMinutes] = useState(null)
  const [resumeData, setResumeData] = useState(null) // 再開するツリーがあれば{treeId, nodes, edges, elapsedSeconds}

  const startNewTree = (minutes) => {
    setResumeData(null)
    setTimerMinutes(minutes)
    setQuestionLoading(true)
    fetchRandomQuestion()
      .then(setQuestion)
      .finally(() => setQuestionLoading(false))
    setView('tree')
  }

  // 未評価のまま保存されていたツリーを、続きから編集できる状態で開く
  const resumeTree = async (tree) => {
    setTimerMinutes(null)
    setQuestionLoading(true)
    setView('tree')
    try {
      const nodeRows = await fetchTreeNodes(tree.id)
      setResumeData({
        treeId: tree.id,
        elapsedSeconds: tree.duration_seconds ?? 0,
        ...buildEditableTree(nodeRows),
      })
      setQuestion({ id: tree.id, type: tree.question_type, text: tree.question_text })
    } finally {
      setQuestionLoading(false)
    }
  }

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

  if (view === 'home') {
    return <HomePage onStart={startNewTree} onResume={resumeTree} />
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Logo />
          <Box>
            <Button color="inherit" startIcon={<HomeIcon />} onClick={() => setView('home')}>
              ホーム
            </Button>
            <Button color="inherit" onClick={() => supabase.auth.signOut()}>
              ログアウト
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Paper square elevation={1} sx={{ px: 3, py: 2 }}>
        {questionLoading || !question ? (
          <CircularProgress size={20} />
        ) : (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Chip label={questionTypeLabel[question.type]} size="small" />
              <Button size="small" onClick={() => setPickerOpen(true)}>
                お題を選ぶ
              </Button>
            </Box>
            <Typography variant="h6" component="h1">
              {question.text}
            </Typography>
          </>
        )}
      </Paper>

      <Box sx={{ flex: 1 }}>
        {question && (
          <LogicTree
            key={question.id}
            question={question}
            timerMinutes={timerMinutes}
            resumeData={resumeData}
          />
        )}
      </Box>

      <QuestionPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(q) => {
          setResumeData(null)
          setQuestion(q)
        }}
      />
    </Box>
  )
}

export default App
