import { createTheme } from '@mui/material/styles'

// アプリ全体で使う共通デザイン設定（柔らかい印象になるよう、角を丸く・色を優しめに）
const theme = createTheme({
  palette: {
    primary: {
      main: '#5B6EE1',
    },
    background: {
      default: '#F7F8FC',
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    button: {
      textTransform: 'none',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
  },
})

export default theme
