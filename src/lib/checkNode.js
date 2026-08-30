const API_URL = import.meta.env.VITE_API_URL

// 1つのノードについて、抽象度・具体性・因果関係・親ノードとの関係をAIにチェックしてもらう
export async function checkNode({ questionType, questionText, path }) {
  const res = await fetch(`${API_URL}/api/check-node`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ questionType, questionText, path }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `チェックに失敗しました (HTTP ${res.status})`)
  }

  return res.json()
}
