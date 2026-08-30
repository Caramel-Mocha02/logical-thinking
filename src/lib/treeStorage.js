import { supabase } from '../supabaseClient.js'

// ロジックツリー（お題＋ノード一覧）をSupabaseに保存する
export async function saveTree({ userId, questionType, questionText, nodes, edges }) {
  const { data: tree, error: treeError } = await supabase
    .from('trees')
    .insert({ user_id: userId, question_type: questionType, question_text: questionText })
    .select()
    .single()

  if (treeError) throw treeError

  // エッジ(親→子)から、各ノードの親ノードIDを求める
  const parentKeyByNodeId = new Map(edges.map((e) => [e.target, e.source]))

  const nodeRows = nodes.map((n) => ({
    tree_id: tree.id,
    node_key: n.id,
    parent_key: parentKeyByNodeId.get(n.id) ?? null,
    content: n.data.label ?? '',
    position_x: n.position.x,
    position_y: n.position.y,
  }))

  const { error: nodesError } = await supabase.from('nodes').insert(nodeRows)
  if (nodesError) throw nodesError

  return tree
}
