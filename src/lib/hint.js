const API_URL = import.meta.env.VITE_API_URL

// 対象ノードについて、AIから考える方向性のヒントをもらう
export async function fetchHint({ questionType, questionText, path }) {
  const res = await fetch(`${API_URL}/api/hint`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ questionType, questionText, path }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `ヒントの取得に失敗しました (HTTP ${res.status})`)
  }

  return res.json()
}
