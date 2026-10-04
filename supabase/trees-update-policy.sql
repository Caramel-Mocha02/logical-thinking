-- 自動保存で所要時間(duration_seconds)を更新できるようにする
-- Supabaseダッシュボードの SQL Editor で実行してください

drop policy if exists "update own trees" on trees;
create policy "update own trees" on trees
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
