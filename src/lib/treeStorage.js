import { supabase } from '../supabaseClient.js'

// ロジックツリーを自動保存する。treeIdが無ければ新規作成し、あれば中身を
// 作り直す(ノード・評価を一旦削除してから最新の内容を入れ直す、シンプルな実装)。
// 戻り値のtreeIdを次回以降の呼び出しに渡すことで、同じツリーとして更新し続けられる
export async function upsertTree({
  treeId,
  userId,
  questionType,
  questionText,
  nodes,
  edges,
  evaluation,
  durationSeconds,
}) {
  let currentTreeId = treeId

  if (!currentTreeId) {
    const { data: tree, error } = await supabase
      .from('trees')
      .insert({ user_id: userId, question_type: questionType, question_text: questionText })
      .select()
      .single()
    if (error) throw error
    currentTreeId = tree.id
  }

  if (durationSeconds !== undefined) {
    const { error } = await supabase
      .from('trees')
      .update({ duration_seconds: durationSeconds })
      .eq('id', currentTreeId)
    if (error) throw error
  }

  const { error: deleteNodesError } = await supabase
    .from('nodes')
    .delete()
    .eq('tree_id', currentTreeId)
  if (deleteNodesError) throw deleteNodesError

  const parentKeyByNodeId = new Map(edges.map((e) => [e.target, e.source]))
  const nodeRows = nodes.map((n) => ({
    tree_id: currentTreeId,
    node_key: n.id,
    parent_key: parentKeyByNodeId.get(n.id) ?? null,
    title: n.data.title ?? '',
    content: n.data.content ?? '',
    position_x: n.position.x,
    position_y: n.position.y,
  }))
  const { error: insertNodesError } = await supabase.from('nodes').insert(nodeRows)
  if (insertNodesError) throw insertNodesError

  if (evaluation) {
    const { error: deleteEvalError } = await supabase
      .from('evaluations')
      .delete()
      .eq('tree_id', currentTreeId)
    if (deleteEvalError) throw deleteEvalError

    const { error: evalError } = await supabase.from('evaluations').insert({
      tree_id: currentTreeId,
      scores: evaluation.scores,
      total: evaluation.total,
      feedback: evaluation.feedback,
    })
    if (evalError) throw evalError
  }

  return currentTreeId
}
