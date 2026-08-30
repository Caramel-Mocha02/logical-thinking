import { AppBar, Toolbar, Typography, Box, Paper, Chip } from '@mui/material'
import LogicTree from './components/LogicTree.jsx'

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
  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div">
            ロジックツリートレーニング
          </Typography>
        </Toolbar>
      </AppBar>

      <Paper square elevation={1} sx={{ px: 3, py: 2 }}>
        <Chip label={questionTypeLabel[question.type]} size="small" sx={{ mb: 1 }} />
        <Typography variant="h6" component="h1">
          {question.text}
        </Typography>
      </Paper>

      <Box sx={{ flex: 1 }}>
        <LogicTree />
      </Box>
    </Box>
  )
}

export default App
