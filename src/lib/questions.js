import { supabase } from '../supabaseClient.js'

// questionsテーブルからお題を1つランダムに取得する
export async function fetchRandomQuestion() {
  const { data, error } = await supabase.from('questions').select('id, type, text')
  if (error) throw error
  if (!data || data.length === 0) return null

  const randomIndex = Math.floor(Math.random() * data.length)
  return data[randomIndex]
}
