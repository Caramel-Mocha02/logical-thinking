const API_URL = import.meta.env.VITE_API_URL

// ロジックツリーをサーバー(Express)経由でAIに評価してもらう
export async function evaluateTree({ questionType, questionText, nodes, edges }) {
  const parentIdByNodeId = new Map(edges.map((e) => [e.target, e.source]))

  const treeNodes = nodes.map((n) => ({
    id: n.id,
    parentId: parentIdByNodeId.get(n.id) ?? null,
    content: n.data.label ?? '',
  }))

  const res = await fetch(`${API_URL}/api/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ questionType, questionText, nodes: treeNodes }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `評価に失敗しました (HTTP ${res.status})`)
  }

  return res.json()
}
