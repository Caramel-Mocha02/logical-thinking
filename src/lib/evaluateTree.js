import { supabase } from '../supabaseClient.js'

// ロジックツリーをSupabase Edge Functions経由でAIに評価してもらう
// nodes: [{ id, parentId, title, content }]
export async function evaluateTree({ questionType, questionText, nodes }) {
  const { data, error } = await supabase.functions.invoke('evaluate', {
    body: { questionType, questionText, nodes },
  })

  if (error) throw new Error(error.message || '評価に失敗しました')
  return data
}
