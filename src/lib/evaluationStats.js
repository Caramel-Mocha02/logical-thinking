import evaluationScoreLabel from './evaluationScoreLabel.js'

// 保存済みツリーの評価一覧から、平均点と弱点（平均が一番低い項目）を求める
export function computeEvaluationStats(trees) {
  const evaluations = trees.map((t) => t.evaluations?.[0]).filter(Boolean)
  if (evaluations.length === 0) return null

  const averageTotal = Math.round(
    evaluations.reduce((sum, e) => sum + e.total, 0) / evaluations.length,
  )

  const scoreKeys = Object.keys(evaluationScoreLabel)
  const averageScores = {}
  for (const key of scoreKeys) {
    averageScores[key] = Math.round(
      evaluations.reduce((sum, e) => sum + (e.scores[key] ?? 0), 0) / evaluations.length,
    )
  }

  const weakestKey = scoreKeys.reduce((a, b) => (averageScores[a] <= averageScores[b] ? a : b))

  return {
    count: evaluations.length,
    averageTotal,
    averageScores,
    weakestKey,
  }
}

// 評価一覧を月(YYYY-MM)ごとにまとめ、各項目の月別平均点を古い順の配列で返す
export function computeMonthlySkillTrend(trees) {
  const evaluations = trees.map((t) => t.evaluations?.[0]).filter(Boolean)
  if (evaluations.length === 0) return []

  const scoreKeys = Object.keys(evaluationScoreLabel)
  const byMonth = new Map() // 'YYYY-MM' -> 評価の配列

  for (const e of evaluations) {
    const month = e.created_at.slice(0, 7)
    if (!byMonth.has(month)) byMonth.set(month, [])
    byMonth.get(month).push(e)
  }

  return Array.from(byMonth.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, monthEvaluations]) => {
      const row = { month }
      for (const key of scoreKeys) {
        row[key] = Math.round(
          monthEvaluations.reduce((sum, e) => sum + (e.scores[key] ?? 0), 0) /
            monthEvaluations.length,
        )
      }
      return row
    })
}
