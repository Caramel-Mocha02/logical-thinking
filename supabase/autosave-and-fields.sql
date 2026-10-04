-- 自動保存・所要時間・ノードの要素/説明 対応
-- Supabaseダッシュボードの SQL Editor で実行してください
-- (何度実行しても安全なように書いてあります)

-- 自動保存では、既存のノード・評価を削除してから最新の内容を入れ直すため、
-- 削除を許可するポリシーが必要
drop policy if exists "delete own nodes" on nodes;
create policy "delete own nodes" on nodes
  for delete using (
    exists (select 1 from trees where trees.id = nodes.tree_id and trees.user_id = auth.uid())
  );

drop policy if exists "delete own evaluations" on evaluations;
create policy "delete own evaluations" on evaluations
  for delete using (
    exists (select 1 from trees where trees.id = evaluations.tree_id and trees.user_id = auth.uid())
  );

-- ツリーを開いてから保存するまでの所要時間(秒)
alter table trees add column if not exists duration_seconds integer;

-- ノードの「要素」(短い見出し、最大20文字)。既存のcontentは「説明」として使う
alter table nodes add column if not exists title text not null default '';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'title_length_check'
  ) then
    alter table nodes add constraint title_length_check check (char_length(title) <= 20);
  end if;
end $$;
