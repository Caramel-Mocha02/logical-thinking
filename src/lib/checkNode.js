import { supabase } from '../supabaseClient.js'

// 1つのノードについて、抽象度・具体性・因果関係・親ノードとの関係をAIにチェックしてもらう
export async function checkNode({ questionType, questionText, path }) {
  const { data, error } = await supabase.functions.invoke('check-node', {
    body: { questionType, questionText, path },
  })

  if (error) throw new Error(error.message || 'チェックに失敗しました')
  return data
}
