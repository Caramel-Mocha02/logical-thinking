-- Phase 13: 評価履歴用テーブル
-- Supabaseダッシュボードの SQL Editor で実行してください

create table evaluations (
  id uuid primary key default gen_random_uuid(),
  tree_id uuid not null references trees(id) on delete cascade,
  scores jsonb not null,
  total int not null,
  good_points jsonb not null,
  improvements jsonb not null,
  deepen_nodes jsonb not null,
  created_at timestamptz not null default now()
);

alter table evaluations enable row level security;

-- 評価は「自分のツリーに紐づくもの」だけ読み書きできる
create policy "select own evaluations" on evaluations
  for select using (
    exists (select 1 from trees where trees.id = evaluations.tree_id and trees.user_id = auth.uid())
  );
create policy "insert own evaluations" on evaluations
  for insert with check (
    exists (select 1 from trees where trees.id = evaluations.tree_id and trees.user_id = auth.uid())
  );
