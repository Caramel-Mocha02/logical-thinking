import { supabase } from '../supabaseClient.js'

// questionsテーブルからお題を1つランダムに取得する
export async function fetchRandomQuestion() {
  const data = await fetchAllQuestions()
  if (data.length === 0) return null

  const randomIndex = Math.floor(Math.random() * data.length)
  return data[randomIndex]
}

// 登録されているお題を全件取得する（一覧から選ぶ画面用）
export async function fetchAllQuestions() {
  const { data, error } = await supabase
    .from('questions')
    .select('id, type, text')
    .order('type')

  if (error) throw error
  return data
}
