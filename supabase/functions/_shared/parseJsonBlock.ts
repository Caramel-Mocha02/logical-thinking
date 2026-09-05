// Claudeがコードフェンス付きで返してきた場合に備えて取り除く
export function parseJsonBlock(text: string) {
  const cleaned = text.replace(/^```json\s*|```$/g, '').trim()
  return JSON.parse(cleaned)
}
