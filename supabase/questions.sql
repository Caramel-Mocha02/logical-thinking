-- Phase 9: お題管理用テーブル
-- Supabaseダッシュボードの SQL Editor で実行してください

create table questions (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('how', 'why', 'what')),
  text text not null,
  created_at timestamptz not null default now()
);

-- お題は全員が読めればよい（誰が作ったかを区別する必要はない）ので、
-- 読み取りだけを許可する。追加・変更はSQL Editorから行う想定
alter table questions enable row level security;

create policy "anyone can read questions" on questions
  for select using (true);

insert into questions (type, text) values
  ('how', '会社の利益を20%増加させるには？'),
  ('how', '一人暮らしの生活費を今より2割減らすには？'),
  ('why', 'なぜ若者のテレビ離れが進んでいるのか？'),
  ('why', 'なぜこのチームの会議は時間通りに終わらないのか？'),
  ('what', '一人暮らしの生活費を構成する要素を整理せよ'),
  ('what', '良いチームに必要な要素を整理せよ');
