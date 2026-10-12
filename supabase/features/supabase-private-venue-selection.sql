-- 会場選択の「非公開」を DB 側で効かせる(2026-10-12。plan/36)
--
-- 会場の画面(VenueSelector)の「非公開にする」は profiles.is_public = false を保存するだけで、
-- 他の人が「どの会場に行ったか」を読む経路では見ていなかった。非公開の人の会場選択は、本人以外には返さない。
--
-- 対象(本人以外から、非公開の人の会場選択を隠す):
--   - venue_attendances の SELECT ポリシー(テーブルの直接読み取り。get_venue_attendees もこのポリシーで絞られる)
--   - get_all_attendees()(来場者一覧)
--   - get_user_encounter_venues(target_user_id)(ある人の会場一覧)
-- 対象外: 会場ごと・全体の人数(get_venue_attendance_count・get_total_attendees_count)は個人を特定しないので、非公開の人も数える。
--         当日のチェックイン(venue_checkins)は「会場選択」とは別の機能なので変えない。
--
-- 何度実行しても同じ結果になる。

BEGIN;

DROP POLICY IF EXISTS venue_attendances_select_policy ON public.venue_attendances;
CREATE POLICY venue_attendances_select_policy ON public.venue_attendances
  FOR SELECT
  USING (
    user_id = (SELECT public.request_session_user_id())
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = venue_attendances.user_id AND p.is_public IS NOT FALSE
    )
  );

CREATE OR REPLACE FUNCTION public.get_all_attendees()
RETURNS TABLE(user_id text, username text, full_name text, avatar_url text, venue_count bigint, encounter_policy text, reol_type text, meta_tags text[], favorite_song text, updated_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id as user_id,
    p.username,
    p.full_name,
    p.avatar_url,
    COUNT(DISTINCT va.venue_id) as venue_count,
    p.encounter_policy,
    p.reol_type,
    COALESCE(p.meta_tags, '{}') as meta_tags,
    p.favorite_song,
    p.updated_at
  FROM public.profiles p
  JOIN public.venue_attendances va ON p.id = va.user_id
  -- 会場選択を非公開にした人は、本人以外には出さない
  WHERE p.is_public IS NOT FALSE OR p.id = public.request_session_user_id()
  GROUP BY p.id, p.username, p.full_name, p.avatar_url, p.encounter_policy, p.reol_type, p.meta_tags, p.favorite_song, p.updated_at
  ORDER BY MIN(va.created_at) ASC;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_encounter_venues(target_user_id text)
RETURNS TABLE(venue_id text, encounter_ok boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT
    va.venue_id,
    va.encounter_ok
  FROM public.venue_attendances va
  WHERE va.user_id = target_user_id
    -- 会場選択を非公開にした人は、本人以外には返さない
    AND (
      target_user_id = public.request_session_user_id()
      OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = target_user_id AND p.is_public IS NOT FALSE)
    );
END;
$$;

COMMIT;
