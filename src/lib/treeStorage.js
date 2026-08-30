import { supabase } from '../supabaseClient.js'

// ロジックツリー（お題＋ノード一覧）をSupabaseに保存する。
// evaluationが渡された場合は、その時点の評価結果も一緒に保存する
export async function saveTree({ userId, questionType, questionText, nodes, edges, evaluation }) {
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

  if (evaluation) {
    const { error: evaluationError } = await supabase.from('evaluations').insert({
      tree_id: tree.id,
      scores: evaluation.scores,
      total: evaluation.total,
      good_points: evaluation.goodPoints,
      improvements: evaluation.improvements,
      deepen_nodes: evaluation.deepenNodes,
    })
    if (evaluationError) throw evaluationError
  }

  return tree
}
