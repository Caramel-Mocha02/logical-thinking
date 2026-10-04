import { Box, Typography } from '@mui/material'

// ロジックツリー（1つの考えが枝分かれしていく様子）をモチーフにしたロゴ
function Logo({ size = 'compact' }) {
  const iconSize = size === 'large' ? 48 : 30
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, color: 'inherit' }}>
      <svg width={iconSize} height={iconSize} viewBox="0 0 30 30" fill="none" aria-hidden="true">
        <path
          d="M15 9 V15 M15 15 L6 20.5 M15 15 L24 20.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="15" cy="6" r="3.3" fill="currentColor" />
        <circle cx="6" cy="23.5" r="3.3" fill="currentColor" />
        <circle cx="24" cy="23.5" r="3.3" fill="currentColor" />
      </svg>
      <Typography
        variant={size === 'large' ? 'h4' : 'h6'}
        component="span"
        sx={{ fontWeight: 700, letterSpacing: '.01em' }}
      >
        ロジックツリートレーニング
      </Typography>
    </Box>
  )
}

export default Logo
