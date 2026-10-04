// AIが指示を守らなかった場合の保険として、コメント類を強制的に切り詰める
export function truncate(text: string, maxLength: number) {
  if (typeof text !== 'string') return text
  return text.length > maxLength ? text.slice(0, maxLength) : text
}
