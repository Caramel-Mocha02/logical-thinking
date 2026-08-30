import { AppBar, Toolbar, Typography, Container, Box } from '@mui/material'

function App() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div">
            ロジックツリートレーニング
          </Typography>
        </Toolbar>
      </AppBar>

      <Container sx={{ py: 4 }}>
        <Typography variant="body1">
          Material UIの導入が完了しました。
        </Typography>
      </Container>
    </Box>
  )
}

export default App
