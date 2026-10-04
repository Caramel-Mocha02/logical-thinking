-- 評価結果を「良かった点/改善点/深掘りノード」の箇条書きから、
-- 200文字以内の1つの総合コメント(feedback)に変更する
-- Supabaseダッシュボードの SQL Editor で実行してください

alter table evaluations alter column good_points drop not null;
alter table evaluations alter column improvements drop not null;
alter table evaluations alter column deepen_nodes drop not null;
alter table evaluations add column if not exists feedback text;
