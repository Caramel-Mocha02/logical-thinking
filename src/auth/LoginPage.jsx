import { useState } from 'react'
import { Box, Paper, TextField, Button, Typography, Tabs, Tab, Alert } from '@mui/material'
import { supabase } from '../supabaseClient.js'

function LoginPage() {
  const [mode, setMode] = useState('login') // 'login' または 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setSubmitting(true)

    const { error: authError } =
      mode === 'login'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password })

    if (authError) {
      setError(authError.message)
    } else if (mode === 'signup') {
      setMessage('登録が完了しました。確認メールが届いていればログインできます。')
    }
    setSubmitting(false)
  }

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'grey.50',
      }}
    >
      <Paper sx={{ p: 4, width: 360 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          ロジックツリートレーニング
        </Typography>

        <Tabs
          value={mode}
          onChange={(_e, v) => {
            setMode(v)
            setError('')
            setMessage('')
          }}
          sx={{ mb: 2 }}
        >
          <Tab label="ログイン" value="login" />
          <Tab label="新規登録" value="signup" />
        </Tabs>

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="メールアドレス"
            type="email"
            fullWidth
            required
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="パスワード"
            type="password"
            fullWidth
            required
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {error}
            </Alert>
          )}
          {message && (
            <Alert severity="success" sx={{ mt: 1 }}>
              {message}
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
            disabled={submitting}
          >
            {mode === 'login' ? 'ログイン' : '登録する'}
          </Button>
        </Box>
      </Paper>
    </Box>
  )
}

export default LoginPage
