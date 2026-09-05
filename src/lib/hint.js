import { supabase } from '../supabaseClient.js'

// 対象ノードについて、AIから考える方向性のヒントをもらう
export async function fetchHint({ questionType, questionText, path }) {
  const { data, error } = await supabase.functions.invoke('hint', {
    body: { questionType, questionText, path },
  })

  if (error) throw new Error(error.message || 'ヒントの取得に失敗しました')
  return data
}
