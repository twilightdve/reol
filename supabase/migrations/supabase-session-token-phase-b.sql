-- セッショントークン方式への移行 フェーズB(書き込みポリシーの切り替え)
--
-- 前提: フェーズA適用済み、かつトークンを送る新クライアントがデプロイ済みであること。
-- 適用すると、トークンを持たない旧クライアント(=再ログイン前のユーザー)からの
-- 書き込みは拒否される。
--
-- 方針:
-- - 書き込み(INSERT/UPDATE/DELETE)は「行の user_id = このリクエストのユーザー」のみ許可
-- - 個人用のデータ(コレクション台帳・遠征チェックリスト)は読み取りも本人のみ
-- - 参加者一覧・コメント等、サイト上で公開表示しているデータの読み取りは従来どおり
-- - プロフィールの新規作成は sign_up_user RPC のみ(直接 INSERT は不可)

BEGIN;

-- ============================================================
-- profiles
-- ============================================================
DROP POLICY IF EXISTS profiles_insert_policy ON public.profiles;
REVOKE INSERT ON public.profiles FROM anon, authenticated;

DROP POLICY IF EXISTS profiles_update_policy ON public.profiles;
CREATE POLICY profiles_update_policy ON public.profiles
  FOR UPDATE
  USING (id = (SELECT public.request_session_user_id()))
  WITH CHECK (id = (SELECT public.request_session_user_id()));

-- ============================================================
-- user_collections(個人用: 読み取りも本人のみ。集計は get_collection_count RPC)
-- ============================================================
DROP POLICY IF EXISTS user_collections_select_policy ON public.user_collections;
DROP POLICY IF EXISTS user_collections_insert_policy ON public.user_collections;
DROP POLICY IF EXISTS user_collections_delete_policy ON public.user_collections;
CREATE POLICY user_collections_select_policy ON public.user_collections
  FOR SELECT USING (user_id = (SELECT public.request_session_user_id()));
CREATE POLICY user_collections_insert_policy ON public.user_collections
  FOR INSERT WITH CHECK (user_id = (SELECT public.request_session_user_id()));
CREATE POLICY user_collections_delete_policy ON public.user_collections
  FOR DELETE USING (user_id = (SELECT public.request_session_user_id()));

-- ============================================================
-- venue_checklists(個人用: 読み取りも本人のみ)
-- ============================================================
DROP POLICY IF EXISTS venue_checklists_select_policy ON public.venue_checklists;
DROP POLICY IF EXISTS venue_checklists_insert_policy ON public.venue_checklists;
DROP POLICY IF EXISTS venue_checklists_update_policy ON public.venue_checklists;
DROP POLICY IF EXISTS venue_checklists_delete_policy ON public.venue_checklists;
CREATE POLICY venue_checklists_select_policy ON public.venue_checklists
  FOR SELECT USING (user_id = (SELECT public.request_session_user_id()));
CREATE POLICY venue_checklists_insert_policy ON public.venue_checklists
  FOR INSERT WITH CHECK (user_id = (SELECT public.request_session_user_id()));
CREATE POLICY venue_checklists_update_policy ON public.venue_checklists
  FOR UPDATE
  USING (user_id = (SELECT public.request_session_user_id()))
  WITH CHECK (user_id = (SELECT public.request_session_user_id()));
CREATE POLICY venue_checklists_delete_policy ON public.venue_checklists
  FOR DELETE USING (user_id = (SELECT public.request_session_user_id()));

-- ============================================================
-- venue_attendances(参加者一覧として公開表示: 読み取りは従来どおり)
-- UPDATE は従来どおり不可(encounter_ok の更新は RPC 経由)
-- ============================================================
DROP POLICY IF EXISTS venue_attendances_insert_policy ON public.venue_attendances;
DROP POLICY IF EXISTS venue_attendances_delete_policy ON public.venue_attendances;
CREATE POLICY venue_attendances_insert_policy ON public.venue_attendances
  FOR INSERT WITH CHECK (user_id = (SELECT public.request_session_user_id()));
CREATE POLICY venue_attendances_delete_policy ON public.venue_attendances
  FOR DELETE USING (user_id = (SELECT public.request_session_user_id()));

-- ============================================================
-- venue_checkins(会場ごとのチェックイン一覧として公開表示)
-- ============================================================
DROP POLICY IF EXISTS venue_checkins_insert_own ON public.venue_checkins;
DROP POLICY IF EXISTS venue_checkins_delete_own ON public.venue_checkins;
CREATE POLICY venue_checkins_insert_own ON public.venue_checkins
  FOR INSERT WITH CHECK (user_id = (SELECT public.request_session_user_id()));
CREATE POLICY venue_checkins_delete_own ON public.venue_checkins
  FOR DELETE USING (user_id = (SELECT public.request_session_user_id()));

-- ============================================================
-- comments(公開表示)
-- ============================================================
DROP POLICY IF EXISTS "Anyone can create comments" ON public.comments;
DROP POLICY IF EXISTS "Anyone can update their own comments" ON public.comments;
DROP POLICY IF EXISTS "Anyone can delete their own comments" ON public.comments;
CREATE POLICY comments_insert_own ON public.comments
  FOR INSERT WITH CHECK (user_id = (SELECT public.request_session_user_id()));
CREATE POLICY comments_update_own ON public.comments
  FOR UPDATE
  USING (user_id = (SELECT public.request_session_user_id()))
  WITH CHECK (user_id = (SELECT public.request_session_user_id()));
CREATE POLICY comments_delete_own ON public.comments
  FOR DELETE USING (user_id = (SELECT public.request_session_user_id()));

-- ============================================================
-- encounter_wants(「自分をエンカしたい人」の表示のため読み取りは従来どおり)
-- ============================================================
DROP POLICY IF EXISTS "Anyone can insert encounter wants" ON public.encounter_wants;
DROP POLICY IF EXISTS "Anyone can delete encounter wants" ON public.encounter_wants;
CREATE POLICY encounter_wants_insert_own ON public.encounter_wants
  FOR INSERT WITH CHECK (user_id = (SELECT public.request_session_user_id()));
CREATE POLICY encounter_wants_delete_own ON public.encounter_wants
  FOR DELETE USING (user_id = (SELECT public.request_session_user_id()));

-- ============================================================
-- setlist_votes(集計表示)
-- ============================================================
DROP POLICY IF EXISTS "Anyone can insert votes" ON public.setlist_votes;
DROP POLICY IF EXISTS "Anyone can delete their votes" ON public.setlist_votes;
CREATE POLICY setlist_votes_insert_own ON public.setlist_votes
  FOR INSERT WITH CHECK (user_id = (SELECT public.request_session_user_id()));
CREATE POLICY setlist_votes_delete_own ON public.setlist_votes
  FOR DELETE USING (user_id = (SELECT public.request_session_user_id()));

-- ============================================================
-- エンカウント設定の RPC: 本人のリクエストのみ更新する
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_venue_encounter(
  target_user_id TEXT,
  target_venue_id TEXT,
  new_encounter_ok BOOLEAN
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF target_user_id IS DISTINCT FROM public.request_session_user_id() THEN
    RETURN FALSE;
  END IF;

  UPDATE public.venue_attendances
  SET encounter_ok = new_encounter_ok
  WHERE user_id = target_user_id AND venue_id = target_venue_id;

  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.reset_all_venue_encounters(target_user_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF target_user_id IS DISTINCT FROM public.request_session_user_id() THEN
    RETURN FALSE;
  END IF;

  UPDATE public.venue_attendances
  SET encounter_ok = NULL
  WHERE user_id = target_user_id;

  RETURN FOUND;
END;
$$;

COMMIT;
