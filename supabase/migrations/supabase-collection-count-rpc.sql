-- コレクション台帳(user_collections)の集計値のみを返すRPC。
-- 「N人が所有/参戦/巡礼済み」のような集計表示専用で、個人を特定できる情報
-- (誰が持っているか)は返さない。
CREATE OR REPLACE FUNCTION public.get_collection_count(
  p_namespace TEXT,
  p_item_uuid TEXT
)
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
  SELECT count(*)::INTEGER
  FROM user_collections
  WHERE namespace = p_namespace
    AND item_uuid = p_item_uuid;
$$;

GRANT EXECUTE ON FUNCTION public.get_collection_count(TEXT, TEXT) TO anon, authenticated;
