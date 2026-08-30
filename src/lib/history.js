import { supabase } from '../supabaseClient.js'

// 自分が保存したツリーの一覧を、新しい順に取得する（各ツリーの評価があれば一緒に取得）
export async function fetchTreeHistory() {
  const { data, error } = await supabase
    .from('trees')
    .select('id, question_type, question_text, created_at, evaluations(total, scores, good_points, improvements, deepen_nodes)')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// 1つのツリーの詳細（ノード一覧）を取得する
export async function fetchTreeNodes(treeId) {
  const { data, error } = await supabase
    .from('nodes')
    .select('node_key, parent_key, content, position_x, position_y')
    .eq('tree_id', treeId)

  if (error) throw error
  return data
}
