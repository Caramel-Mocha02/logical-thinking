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
    // ロジカルシンキングを感じさせる、ドット格子＋淡いグラデーションの背景
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          minHeight: '100vh',
          backgroundColor: '#F3F5FF',
          backgroundImage: [
            'radial-gradient(rgba(91, 110, 225, 0.25) 1.5px, transparent 1.5px)',
            'radial-gradient(circle at 10% 10%, rgba(91, 110, 225, 0.26), transparent 42%)',
            'radial-gradient(circle at 90% 6%, rgba(170, 100, 255, 0.24), transparent 42%)',
            'radial-gradient(circle at 88% 95%, rgba(80, 210, 220, 0.22), transparent 48%)',
            'radial-gradient(circle at 6% 92%, rgba(255, 140, 170, 0.16), transparent 42%)',
          ].join(', '),
          backgroundSize: '26px 26px, auto, auto, auto, auto',
          backgroundAttachment: 'fixed',
        },
      },
    },
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
