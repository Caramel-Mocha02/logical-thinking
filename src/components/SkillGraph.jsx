import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material'
import evaluationScoreLabel from '../lib/evaluationScoreLabel.js'
import chartColors from '../lib/chartColors.js'

function SkillGraph({ data }) {
  const [view, setView] = useState('chart') // 'chart' または 'table'
  const scoreKeys = Object.keys(evaluationScoreLabel)

  if (data.length === 0) return null

  return (
    <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle1">月別スキル推移</Typography>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={view}
          onChange={(_e, v) => v && setView(v)}
        >
          <ToggleButton value="chart">グラフ</ToggleButton>
          <ToggleButton value="table">表</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {view === 'chart' ? (
        <Box sx={{ width: '100%', height: 320 }}>
          <ResponsiveContainer>
            <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {scoreKeys.map((key) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  name={evaluationScoreLabel[key]}
                  stroke={chartColors[key]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Box>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>月</TableCell>
              {scoreKeys.map((key) => (
                <TableCell key={key} align="right">
                  {evaluationScoreLabel[key]}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.month}>
                <TableCell>{row.month}</TableCell>
                {scoreKeys.map((key) => (
                  <TableCell key={key} align="right">
                    {row[key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  )
}

export default SkillGraph
