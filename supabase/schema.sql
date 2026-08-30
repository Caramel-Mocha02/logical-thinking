-- Phase 8: ツリー保存用テーブル
-- Supabaseダッシュボードの SQL Editor で実行してください

-- trees: 1つのロジックツリー（どのお題に対して作ったか、いつ作ったか）
create table trees (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question_type text not null,
  question_text text not null,
  created_at timestamptz not null default now()
);

-- nodes: ツリーを構成する各ノード
-- node_key / parent_key はアプリ側で使っているノードID（例: "root", "node-1"）をそのまま保存する
create table nodes (
  tree_id uuid not null references trees(id) on delete cascade,
  node_key text not null,
  parent_key text,
  content text not null default '',
  position_x double precision not null,
  position_y double precision not null,
  primary key (tree_id, node_key),
  constraint content_length_check check (char_length(content) <= 100)
);

-- Row Level Security: 自分が作ったツリー・ノードにしかアクセスできないようにする
alter table trees enable row level security;
alter table nodes enable row level security;

create policy "select own trees" on trees
  for select using (auth.uid() = user_id);
create policy "insert own trees" on trees
  for insert with check (auth.uid() = user_id);
create policy "delete own trees" on trees
  for delete using (auth.uid() = user_id);

create policy "select own nodes" on nodes
  for select using (
    exists (select 1 from trees where trees.id = nodes.tree_id and trees.user_id = auth.uid())
  );
create policy "insert own nodes" on nodes
  for insert with check (
    exists (select 1 from trees where trees.id = nodes.tree_id and trees.user_id = auth.uid())
  );
create policy "delete own nodes" on nodes
  for delete using (
    exists (select 1 from trees where trees.id = nodes.tree_id and trees.user_id = auth.uid())
  );
