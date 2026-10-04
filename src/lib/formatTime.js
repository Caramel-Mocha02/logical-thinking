// 秒数を "分:秒" 形式の文字列にする(例: 125 -> "2:05")
export function formatSeconds(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}
