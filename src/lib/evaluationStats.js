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
