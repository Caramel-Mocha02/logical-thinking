import { supabase } from '../supabaseClient.js'

// ロジックツリーをSupabase Edge Functions経由でAIに評価してもらう
export async function evaluateTree({ questionType, questionText, nodes, edges }) {
  const parentIdByNodeId = new Map(edges.map((e) => [e.target, e.source]))

  const treeNodes = nodes.map((n) => ({
    id: n.id,
    parentId: parentIdByNodeId.get(n.id) ?? null,
    content: n.data.label ?? '',
  }))

  const { data, error } = await supabase.functions.invoke('evaluate', {
    body: { questionType, questionText, nodes: treeNodes },
  })

  if (error) throw new Error(error.message || '評価に失敗しました')
  return data
}
