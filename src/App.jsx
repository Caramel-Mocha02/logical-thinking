import { AppBar, Toolbar, Typography, Box } from '@mui/material'
import LogicTree from './components/LogicTree.jsx'

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

      <Box sx={{ flex: 1 }}>
        <LogicTree />
      </Box>
    </Box>
  )
}

export default App
