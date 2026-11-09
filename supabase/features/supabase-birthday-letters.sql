-- 件名のないふくろう便(Reol 誕生日の手紙企画。plan/64)2026-11-07
--
-- - テーブルは RLS 有効・ポリシーなし・anon / authenticated から REVOKE(user_sessions と同じ)。
--   読み書きはすべて下の SECURITY DEFINER の関数だけで行う。
-- - 投稿・修正のたびに版(birthday_letter_versions)を 1 つ足す。印刷は版を指して記録する。
-- - 一般向けの関数は、取り下げ・Web に出さない手紙を除いた「今の版」を返す(運営の確認を待たない。運営があとから見て、不適切なものは取り下げる。2026-11-08)。
--   「贈る本だけ」の本文は返さない。印刷は運営がチェックした版だけ。
-- - 本人の関数は、投稿時にブラウザーが作った編集鍵(64 桁の 16 進)のハッシュが合う時だけ使える。
-- - 運営の関数は、ログイン中のセッションが運営の ID(twilightplc)の時だけ使える。
-- - 受付は 2026-12-21 00:00(日本時間)= 2026-12-20 15:00 UTC で締める。サーバーの時計で判定する。
--
-- この DB は public に作った関数・テーブルを、既定で anon / authenticated にも直接開く設定(pg_default_acl)。
-- そのため PUBLIC だけでなく anon / authenticated からも明示的に取り上げる。
--
-- 何度実行しても同じ結果になる。

BEGIN;

-- ============================================================
-- 1. テーブル
-- ============================================================
CREATE TABLE IF NOT EXISTS public.birthday_letters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL UNIQUE,          -- 送信の重複防止(再送しても 1 通)
  edit_key_hash text NOT NULL,              -- 編集鍵の sha256(鍵そのものは持たない)
  current_version integer NOT NULL DEFAULT 1,
  reviewed_version integer,                 -- 運営がチェックした版(Web には確認を待たずに今の版を出す。印刷はチェック済みの版だけ)
  reviewed_at timestamptz,
  web_hidden boolean NOT NULL DEFAULT false, -- 運営の判断で Web に出さない(本には載せる)
  withdrawn_at timestamptz,                 -- 取り下げ(Web にも本にも出さない。行は消さない)
  withdrawn_by text,                        -- 'author' / 'admin'
  pulled_at timestamptz,                    -- 印刷済みのカードを束から抜いた日時
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS birthday_letters_created_idx ON public.birthday_letters (created_at);
-- 書き手の印(ブラウザが作った乱数)のハッシュ。1 人 10 通まで(取り下げていない手紙)を数える。2026-11-09
-- ログイン無しの企画なので、ブラウザを変える・保存を消すと別の人になる(目安としての上限)。前からの手紙は空
ALTER TABLE public.birthday_letters ADD COLUMN IF NOT EXISTS writer_hash text;
CREATE INDEX IF NOT EXISTS birthday_letters_writer_idx ON public.birthday_letters (writer_hash) WHERE writer_hash IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.birthday_letter_versions (
  letter_id uuid NOT NULL REFERENCES public.birthday_letters(id) ON DELETE CASCADE,
  version integer NOT NULL,
  content jsonb NOT NULL,                   -- _letters_clean() を通した内容
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (letter_id, version)
);
CREATE INDEX IF NOT EXISTS birthday_letter_versions_created_idx ON public.birthday_letter_versions (created_at);

CREATE TABLE IF NOT EXISTS public.birthday_letter_print_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template text NOT NULL,                   -- 印刷テンプレートの版(例: postcard-100x148-v1)
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  printed_at timestamptz,                   -- 運営が「印刷した」と記録した日時
  cancelled_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.birthday_letter_print_items (
  batch_id uuid NOT NULL REFERENCES public.birthday_letter_print_batches(id) ON DELETE CASCADE,
  position integer NOT NULL,
  letter_id uuid NOT NULL,
  version integer NOT NULL,
  PRIMARY KEY (batch_id, letter_id),
  FOREIGN KEY (letter_id, version) REFERENCES public.birthday_letter_versions(letter_id, version)
);

-- 運営のアカウント。この SQL を実行した時点の twilightplc を、作成日時ごと覚える。
-- ID は名前なので、運営が ID を変えたり退会したりした後に他人が同じ ID を取ると、名前だけの判定では運営になれてしまう。
-- 作成日時も合う時だけ運営とする(ID を変えたら、この表を直すまで運営の関数は使えない = 安全な側に倒れる)
CREATE TABLE IF NOT EXISTS public.birthday_letter_admins (
  user_id text PRIMARY KEY,
  profile_created_at timestamptz NOT NULL
);
INSERT INTO public.birthday_letter_admins (user_id, profile_created_at)
SELECT p.id, p.created_at FROM public.profiles p WHERE p.id = 'twilightplc' AND p.created_at IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;

-- 緊急の切り替え(2026-11-09)。運営だけが変える。荒らされた時に、公開をチェック済みの手紙だけにする・投函を止める
CREATE TABLE IF NOT EXISTS public.birthday_letter_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  public_mode text NOT NULL DEFAULT 'all' CHECK (public_mode IN ('all', 'checked')), -- all: 投函してすぐ公開 / checked: 運営がチェックした今の版だけ
  accepting boolean NOT NULL DEFAULT true,                                         -- false: 投函を止める(修正・取り下げはできる)
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.birthday_letter_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- バックアップ専用の鍵(2026-11-09)。運営の Mac の launchd が 6 時間ごとに letters_backup_export を呼んで手紙を保存する。
-- 鍵そのものは Mac にだけ置き、ここにはハッシュだけ。この鍵でできるのは読み出しだけ(書き換えはできない)
CREATE TABLE IF NOT EXISTS public.birthday_letter_backup_keys (
  key_hash text PRIMARY KEY,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.birthday_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.birthday_letter_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.birthday_letter_print_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.birthday_letter_print_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.birthday_letter_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.birthday_letter_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.birthday_letter_backup_keys ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.birthday_letters FROM anon, authenticated;
REVOKE ALL ON public.birthday_letter_versions FROM anon, authenticated;
REVOKE ALL ON public.birthday_letter_print_batches FROM anon, authenticated;
REVOKE ALL ON public.birthday_letter_print_items FROM anon, authenticated;
REVOKE ALL ON public.birthday_letter_admins FROM anon, authenticated;
REVOKE ALL ON public.birthday_letter_settings FROM anon, authenticated;
REVOKE ALL ON public.birthday_letter_backup_keys FROM anon, authenticated;

-- ============================================================
-- 2. 内部用(anon からは呼べない)
-- ============================================================
-- 受付中か(締切の判定はすべてここ)
CREATE OR REPLACE FUNCTION public._letters_is_open(p_at timestamptz)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
SET search_path = ''
AS $$
  SELECT p_at < timestamptz '2026-12-20 15:00:00+00';
$$;

CREATE OR REPLACE FUNCTION public._letters_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.birthday_letter_admins a
    JOIN public.profiles p ON p.id = a.user_id AND p.created_at = a.profile_created_at
    WHERE a.user_id = public.request_session_user_id()
  );
$$;

-- 緊急の切り替えの今の値(行が無ければ、ふだんどおり)
CREATE OR REPLACE FUNCTION public._letters_checked_only()
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT coalesce((SELECT s.public_mode = 'checked' FROM public.birthday_letter_settings s WHERE s.id = 1), false);
$$;

CREATE OR REPLACE FUNCTION public._letters_accepting()
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT coalesce((SELECT s.accepting FROM public.birthday_letter_settings s WHERE s.id = 1), true);
$$;

CREATE OR REPLACE FUNCTION public._letters_key_hash(p_key text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = ''
AS $$
  SELECT CASE WHEN p_key ~ '^[0-9a-f]{64}$'
              THEN encode(extensions.digest(p_key, 'sha256'), 'hex') END;
$$;

-- 文字列の値だけを取り出す(数値やオブジェクトは null)
CREATE OR REPLACE FUNCTION public._letters_str(p jsonb, p_key text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = ''
AS $$
  SELECT CASE WHEN jsonb_typeof(p -> p_key) = 'string' THEN btrim(p ->> p_key, E' \t　') END;
$$;

-- 見えない文字・向きを変える文字(なりすまし・表示の乱れに使える)と制御文字を含むか。改行は本文だけ別に許す。
-- U+200D(ゼロ幅接合子)は絵文字の組み合わせに使うので許す
CREATE OR REPLACE FUNCTION public._letters_bad_chars(p text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
SET search_path = ''
AS $$
  SELECT p ~ '[[:cntrl:]]' OR p ~ '[\u00AD\u061C\u180E\u200B\u200C\u200E\u200F\u202A-\u202E\u2028\u2029\u2060-\u2069\uFEFF]';
$$;

-- 本文: [{ "a": "l"|"c"|"r", "r": [{ "t": 文字, "b": true, "c": 色, "s": "s"|"l" }] }]
CREATE OR REPLACE FUNCTION public._letters_body_ok(b jsonb)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
SET search_path = ''
AS $$
DECLARE
  para jsonb;
  run jsonb;
  v_t text;
  v_len integer := 0;
  v_visible integer := 0;
BEGIN
  IF b IS NULL OR jsonb_typeof(b) <> 'array' OR jsonb_array_length(b) < 1
     OR jsonb_array_length(b) > 60 OR octet_length(b::text) > 16384 THEN
    RETURN false;
  END IF;
  FOR para IN SELECT value FROM jsonb_array_elements(b) LOOP
    IF jsonb_typeof(para) <> 'object' THEN RETURN false; END IF;
    IF EXISTS (SELECT 1 FROM jsonb_object_keys(para) k WHERE k NOT IN ('a', 'r')) THEN RETURN false; END IF;
    IF para ? 'a' AND (para -> 'a') NOT IN ('"l"'::jsonb, '"c"'::jsonb, '"r"'::jsonb) THEN RETURN false; END IF;
    IF jsonb_typeof(para -> 'r') IS DISTINCT FROM 'array' OR jsonb_array_length(para -> 'r') > 80 THEN RETURN false; END IF;
    FOR run IN SELECT value FROM jsonb_array_elements(para -> 'r') LOOP
      IF jsonb_typeof(run) <> 'object' THEN RETURN false; END IF;
      IF EXISTS (SELECT 1 FROM jsonb_object_keys(run) k WHERE k NOT IN ('t', 'b', 'c', 's')) THEN RETURN false; END IF;
      IF jsonb_typeof(run -> 't') IS DISTINCT FROM 'string' THEN RETURN false; END IF;
      v_t := run ->> 't';
      IF length(v_t) = 0 OR public._letters_bad_chars(replace(v_t, E'\n', '')) THEN RETURN false; END IF;
      IF run ? 'b' AND (run -> 'b') <> 'true'::jsonb THEN RETURN false; END IF;
      IF run ? 'c' AND (run -> 'c') NOT IN ('"rose"'::jsonb, '"indigo"'::jsonb, '"gold"'::jsonb, '"teal"'::jsonb) THEN RETURN false; END IF;
      IF run ? 's' AND (run -> 's') NOT IN ('"s"'::jsonb, '"l"'::jsonb) THEN RETURN false; END IF;
      v_len := v_len + length(v_t);
      v_visible := v_visible + length(regexp_replace(v_t, '\s', '', 'g'));
    END LOOP;
  END LOOP;
  RETURN v_visible >= 1 AND v_len <= 1200;
END;
$$;

-- 投稿・修正の内容を検査して、保存する形に整える。だめなら 'invalid:<項目>' で止める。
CREATE OR REPLACE FUNCTION public._letters_clean(p jsonb)
RETURNS jsonb
LANGUAGE plpgsql
IMMUTABLE
SET search_path = ''
AS $$
DECLARE
  v_event_key text := public._letters_str(p, 'eventKey');
  v_event_label text := public._letters_str(p, 'eventLabel');
  v_event_date text := public._letters_str(p, 'eventDate');
  v_era text := public._letters_str(p, 'era');
  v_address text := public._letters_str(p, 'address');
  v_sender text := public._letters_str(p, 'sender');
  v_sns_type text := nullif(public._letters_str(p, 'snsType'), '');
  v_sns_id text := nullif(ltrim(coalesce(public._letters_str(p, 'snsId'), ''), '@'), '');
  v_motif text := public._letters_str(p, 'motif');
  v_visibility text := public._letters_str(p, 'visibility');
  v_font text := coalesce(public._letters_str(p, 'font'), 'sans');
BEGIN
  IF p IS NULL OR jsonb_typeof(p) <> 'object' THEN RAISE EXCEPTION 'invalid:letter'; END IF;
  IF v_event_key IS NULL OR v_event_key !~ '^(song|release|live|era):[A-Za-z0-9-]{1,64}$' THEN RAISE EXCEPTION 'invalid:eventKey'; END IF;
  IF v_event_label IS NULL OR length(v_event_label) NOT BETWEEN 1 AND 80 OR public._letters_bad_chars(v_event_label) THEN RAISE EXCEPTION 'invalid:eventLabel'; END IF;
  IF v_event_date IS NOT NULL AND v_event_date !~ '^[0-9]{4}(-[0-9]{2}(-[0-9]{2})?)?$' THEN RAISE EXCEPTION 'invalid:eventDate'; END IF;
  IF v_era IS NULL OR v_era NOT IN ('sherry', 'reoru', 'anyo', 'unit', 'reol', 'other') THEN RAISE EXCEPTION 'invalid:era'; END IF;
  IF v_address IS NULL OR length(v_address) NOT BETWEEN 1 AND 30 OR public._letters_bad_chars(v_address) THEN RAISE EXCEPTION 'invalid:address'; END IF;
  IF v_sender IS NULL OR length(v_sender) NOT BETWEEN 1 AND 20 OR public._letters_bad_chars(v_sender) THEN RAISE EXCEPTION 'invalid:sender'; END IF;
  IF v_sns_type IS NOT NULL AND v_sns_type NOT IN ('x', 'instagram', 'tiktok', 'bluesky', 'threads') THEN RAISE EXCEPTION 'invalid:snsType'; END IF;
  IF (v_sns_type IS NULL) <> (v_sns_id IS NULL) THEN RAISE EXCEPTION 'invalid:snsId'; END IF;
  IF v_sns_id IS NOT NULL AND v_sns_id !~ '^[A-Za-z0-9_.-]{1,40}$' THEN RAISE EXCEPTION 'invalid:snsId'; END IF;
  IF v_motif IS NULL OR v_motif NOT IN ('color', 'water', 'stars', 'mirror', 'moon', 'candy', 'petals', 'glitter', 'film', 'edge', 'brush', 'monitor', 'lantern', 'rings', 'pulse', 'sky', 'moss', 'key', 'butterfly', 'fan', 'clock', 'cubes', 'door', 'goldfish', 'fireworks', 'envelope', 'glitch', 'hydrangea', 'tunnel', 'cage', 'balloon', 'curtain', 'rose', 'spider') THEN RAISE EXCEPTION 'invalid:motif'; END IF;
  IF v_visibility IS NULL OR v_visibility NOT IN ('public', 'book') THEN RAISE EXCEPTION 'invalid:visibility'; END IF;
  IF v_font NOT IN ('sans', 'serif', 'hand') THEN RAISE EXCEPTION 'invalid:font'; END IF;
  IF (p -> 'consent') IS DISTINCT FROM 'true'::jsonb THEN RAISE EXCEPTION 'invalid:consent'; END IF;
  IF NOT public._letters_body_ok(p -> 'body') THEN RAISE EXCEPTION 'invalid:body'; END IF;

  RETURN jsonb_build_object(
    'eventKey', v_event_key,
    'eventLabel', v_event_label,
    'eventDate', v_event_date,
    'era', v_era,
    'address', v_address,
    'sender', v_sender,
    'snsType', v_sns_type,
    'snsId', v_sns_id,
    'motif', v_motif,
    'font', v_font,
    'visibility', v_visibility,
    'body', p -> 'body'
  );
END;
$$;

-- 一般向けに出してよい項目だけ。p_content は出す版、p_current は今の版(いまは両方とも今の版を渡す)。
-- 2 つの版が違う時は、後から直した所の古い内容を下げる:
--   本文を「贈る本だけ」に変えた・本文を直した → 本文を出さない(直した時は bodyPending)/ SNS を外す・変えた → SNS を出さない。
-- 本文は「Webでも公開」が両方の版で選ばれていて、本文が同じで、p_with_body の時だけ
CREATE OR REPLACE FUNCTION public._letters_public_card(p_id uuid, p_content jsonb, p_current jsonb, p_created timestamptz, p_with_body boolean)
RETURNS jsonb
LANGUAGE sql
IMMUTABLE
SET search_path = ''
AS $$
  SELECT jsonb_build_object(
    'id', p_id,
    'eventKey', p_content -> 'eventKey',
    'eventLabel', p_content -> 'eventLabel',
    'eventDate', p_content -> 'eventDate',
    'era', p_content -> 'era',
    'address', p_content -> 'address',
    'sender', p_content -> 'sender',
    'snsType', CASE WHEN x.sns_same THEN p_content -> 'snsType' END,
    'snsId', CASE WHEN x.sns_same THEN p_content -> 'snsId' END,
    'motif', p_content -> 'motif',
    'font', coalesce(p_content -> 'font', '"sans"'::jsonb),
    'visibility', CASE WHEN x.is_public THEN 'public' ELSE 'book' END,
    'createdAt', p_created,
    'body', CASE WHEN p_with_body AND x.is_public AND x.body_same THEN p_content -> 'body' END,
    'bodyPending', x.is_public AND NOT x.body_same
  )
  FROM (SELECT
    coalesce(p_content ->> 'visibility' = 'public' AND p_current ->> 'visibility' = 'public', false) AS is_public,
    coalesce(p_content -> 'snsType' = p_current -> 'snsType' AND p_content -> 'snsId' = p_current -> 'snsId', false) AS sns_same,
    coalesce(p_content -> 'body' = p_current -> 'body', false) AS body_same
  ) x;
$$;

REVOKE ALL ON FUNCTION public._letters_is_open(timestamptz) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public._letters_is_admin() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public._letters_checked_only() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public._letters_accepting() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public._letters_key_hash(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public._letters_str(jsonb, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public._letters_bad_chars(text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public._letters_body_ok(jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public._letters_clean(jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public._letters_public_card(uuid, jsonb, jsonb, timestamptz, boolean) FROM PUBLIC, anon, authenticated;

-- ============================================================
-- 3. 誰でも使える関数
-- ============================================================
-- 受付中か(画面の表示用。投稿の可否は letters_submit 側でも判定する)
CREATE OR REPLACE FUNCTION public.letters_status()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT jsonb_build_object('open', public._letters_is_open(now()), 'accepting', public._letters_accepting(), 'deadline', '2026-12-20T15:00:00Z', 'now', now());
$$;

-- 投函。戻り値 { ok, id, version } / { ok: false, error: 'closed' | 'busy' | 'invalid:<項目>' | 'invalid' }
CREATE OR REPLACE FUNCTION public.letters_submit(p_request_id uuid, p_edit_key text, p_letter jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_hash text := public._letters_key_hash(p_edit_key);
  -- 書き手の印は手紙の中の writer で受け取る(関数の形を変えない。古い画面からは無い = 数えない)
  v_writer text := public._letters_key_hash(p_letter ->> 'writer');
  v_row record;
  v_content jsonb;
  v_recent integer;
  v_id uuid;
BEGIN
  IF p_request_id IS NULL OR v_hash IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid');
  END IF;

  -- 再送(通信が切れて結果が分からなかった時など)は、同じ鍵なら同じ 1 通を返す
  SELECT l.id, l.edit_key_hash, l.current_version INTO v_row
    FROM public.birthday_letters l WHERE l.request_id = p_request_id;
  IF FOUND THEN
    IF v_row.edit_key_hash = v_hash THEN
      RETURN jsonb_build_object('ok', true, 'id', v_row.id, 'version', v_row.current_version);
    END IF;
    RETURN jsonb_build_object('ok', false, 'error', 'invalid');
  END IF;

  IF NOT public._letters_is_open(now()) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'closed');
  END IF;
  IF NOT public._letters_accepting() THEN
    RETURN jsonb_build_object('ok', false, 'error', 'paused');
  END IF;
  -- 1 人 10 通まで(同じ書き手の印で、取り下げていない手紙)
  IF v_writer IS NOT NULL AND (SELECT count(*) FROM public.birthday_letters l WHERE l.writer_hash = v_writer AND l.withdrawn_at IS NULL) >= 10 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'limit');
  END IF;

  BEGIN
    v_content := public._letters_clean(p_letter);
  EXCEPTION WHEN raise_exception THEN
    RETURN jsonb_build_object('ok', false, 'error', SQLERRM);
  END;

  -- DB の容量を守る上限(ふだんの規模より十分に多い)。全体で 10 分に 120 通・1 日 1000 通まで。
  -- 1 通は最大 16KB なので、上限いっぱいに荒らされても 1 日 16MB ほど(修正と合わせて 32MB ほど)に収まる
  SELECT count(*) INTO v_recent FROM public.birthday_letters l WHERE l.created_at > now() - interval '10 minutes';
  IF v_recent >= 120 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'busy');
  END IF;
  SELECT count(*) INTO v_recent FROM public.birthday_letters l WHERE l.created_at > now() - interval '1 day';
  IF v_recent >= 1000 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'busy');
  END IF;

  INSERT INTO public.birthday_letters (request_id, edit_key_hash, writer_hash)
  VALUES (p_request_id, v_hash, v_writer)
  ON CONFLICT (request_id) DO NOTHING
  RETURNING id INTO v_id;

  IF v_id IS NULL THEN
    -- 同時に 2 回届いた場合
    SELECT l.id, l.edit_key_hash, l.current_version INTO v_row
      FROM public.birthday_letters l WHERE l.request_id = p_request_id;
    IF v_row.edit_key_hash = v_hash THEN
      RETURN jsonb_build_object('ok', true, 'id', v_row.id, 'version', v_row.current_version);
    END IF;
    RETURN jsonb_build_object('ok', false, 'error', 'invalid');
  END IF;

  INSERT INTO public.birthday_letter_versions (letter_id, version, content) VALUES (v_id, 1, v_content);
  RETURN jsonb_build_object('ok', true, 'id', v_id, 'version', 1);
END;
$$;

-- 一般向けの 3 つの関数は確認済みの版を出す。ただし本人が後から差出人の名前か宛名を変えたら、再確認までカードごと出さない
-- 届いた手紙の一覧(宛名面だけ。本文は返さない)
-- p_order: 'new'(届いた順の新しい順)/ 'timeline'(宛先の日付の新しい順)
CREATE OR REPLACE FUNCTION public.letters_public_list(
  p_event_key text DEFAULT NULL,
  p_era text DEFAULT NULL,
  p_order text DEFAULT 'new',
  p_limit integer DEFAULT 60,
  p_offset integer DEFAULT 0
)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT coalesce(jsonb_agg(x.card ORDER BY x.ord), '[]'::jsonb)
  FROM (
    SELECT public._letters_public_card(l.id, v.content, c.content, l.created_at, false) AS card,
           row_number() OVER (
             ORDER BY CASE WHEN p_order = 'timeline' THEN v.content ->> 'eventDate' END DESC NULLS LAST,
                      l.created_at DESC
           ) AS ord
    FROM public.birthday_letters l
    JOIN public.birthday_letter_versions v ON v.letter_id = l.id AND v.version = l.current_version
    JOIN public.birthday_letter_versions c ON c.letter_id = l.id AND c.version = l.current_version
    WHERE l.withdrawn_at IS NULL
      AND NOT l.web_hidden
      AND (NOT public._letters_checked_only() OR coalesce(l.reviewed_version = l.current_version, false))
      AND (p_event_key IS NULL OR v.content ->> 'eventKey' = p_event_key)
      AND (p_era IS NULL OR v.content ->> 'era' = p_era)
    ORDER BY ord
    LIMIT least(greatest(coalesce(p_limit, 60), 1), 100)
    OFFSET greatest(coalesce(p_offset, 0), 0)
  ) x;
$$;

-- 1 枚(本文は「Webでも公開」を選んだ手紙だけ)
CREATE OR REPLACE FUNCTION public.letters_public_get(p_id uuid)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT public._letters_public_card(l.id, v.content, c.content, l.created_at, true)
  FROM public.birthday_letters l
  JOIN public.birthday_letter_versions v ON v.letter_id = l.id AND v.version = l.current_version
  JOIN public.birthday_letter_versions c ON c.letter_id = l.id AND c.version = l.current_version
  WHERE l.id = p_id
    AND l.withdrawn_at IS NULL
    AND NOT l.web_hidden
    AND (NOT public._letters_checked_only() OR coalesce(l.reviewed_version = l.current_version, false));
$$;

-- 宛先ごとの通数(年表の表示用)
CREATE OR REPLACE FUNCTION public.letters_public_counts()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT coalesce(jsonb_object_agg(x.k, x.n), '{}'::jsonb)
  FROM (
    SELECT v.content ->> 'eventKey' AS k, count(*) AS n
    FROM public.birthday_letters l
    JOIN public.birthday_letter_versions v ON v.letter_id = l.id AND v.version = l.current_version
    WHERE l.withdrawn_at IS NULL AND NOT l.web_hidden
      AND (NOT public._letters_checked_only() OR coalesce(l.reviewed_version = l.current_version, false))
    GROUP BY 1
  ) x;
$$;

-- ============================================================
-- 4. 本人(編集鍵)
-- ============================================================
CREATE OR REPLACE FUNCTION public.letters_own_get(p_id uuid, p_edit_key text)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT coalesce((
    SELECT jsonb_build_object(
      'ok', true,
      'id', l.id,
      'version', l.current_version,
      'content', v.content,
      'reviewed', l.reviewed_version IS NOT NULL AND l.reviewed_version = l.current_version,
      'onWeb', NOT l.web_hidden AND l.withdrawn_at IS NULL AND (NOT public._letters_checked_only() OR coalesce(l.reviewed_version = l.current_version, false)),
      'withdrawn', l.withdrawn_at IS NOT NULL,
      'editable', l.withdrawn_at IS NULL AND public._letters_is_open(now()),
      'createdAt', l.created_at,
      'updatedAt', l.updated_at
    )
    FROM public.birthday_letters l
    JOIN public.birthday_letter_versions v ON v.letter_id = l.id AND v.version = l.current_version
    WHERE l.id = p_id AND l.edit_key_hash = public._letters_key_hash(p_edit_key)
  ), jsonb_build_object('ok', false, 'error', 'not_found'));
$$;

-- 修正。p_base_version が今の版と違えば 'conflict'(別の画面で先に直した時)
CREATE OR REPLACE FUNCTION public.letters_own_update(p_id uuid, p_edit_key text, p_base_version integer, p_letter jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_row record;
  v_content jsonb;
  v_current jsonb;
  v_recent integer;
BEGIN
  SELECT l.id, l.current_version, l.withdrawn_at INTO v_row
    FROM public.birthday_letters l
   WHERE l.id = p_id AND l.edit_key_hash = public._letters_key_hash(p_edit_key)
   FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'error', 'not_found'); END IF;
  IF v_row.withdrawn_at IS NOT NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'withdrawn'); END IF;
  IF NOT public._letters_is_open(now()) THEN RETURN jsonb_build_object('ok', false, 'error', 'closed'); END IF;

  BEGIN
    v_content := public._letters_clean(p_letter);
  EXCEPTION WHEN raise_exception THEN
    RETURN jsonb_build_object('ok', false, 'error', SQLERRM);
  END;

  SELECT v.content INTO v_current FROM public.birthday_letter_versions v
   WHERE v.letter_id = p_id AND v.version = v_row.current_version;
  IF v_current = v_content THEN
    RETURN jsonb_build_object('ok', true, 'id', p_id, 'version', v_row.current_version, 'unchanged', true);
  END IF;
  IF p_base_version IS DISTINCT FROM v_row.current_version THEN
    RETURN jsonb_build_object('ok', false, 'error', 'conflict');
  END IF;

  -- DB の容量を守る上限。1 通あたり 30 版まで・10 分に 10 回まで、全体で 1 日 1000 回まで
  IF v_row.current_version >= 30 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'too_many_edits');
  END IF;
  SELECT count(*) INTO v_recent FROM public.birthday_letter_versions v
   WHERE v.letter_id = p_id AND v.version > 1 AND v.created_at > now() - interval '10 minutes';
  IF v_recent >= 10 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'busy');
  END IF;
  SELECT count(*) INTO v_recent FROM public.birthday_letter_versions v
   WHERE v.version > 1 AND v.created_at > now() - interval '1 day';
  IF v_recent >= 1000 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'busy');
  END IF;

  INSERT INTO public.birthday_letter_versions (letter_id, version, content)
  VALUES (p_id, v_row.current_version + 1, v_content);
  UPDATE public.birthday_letters SET current_version = v_row.current_version + 1, updated_at = now() WHERE id = p_id;
  RETURN jsonb_build_object('ok', true, 'id', p_id, 'version', v_row.current_version + 1);
END;
$$;

-- 取り下げ(Web にも本にも出さない。印刷済みなら運営が束から抜く)
CREATE OR REPLACE FUNCTION public.letters_own_withdraw(p_id uuid, p_edit_key text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_row record;
BEGIN
  SELECT l.id, l.withdrawn_at INTO v_row
    FROM public.birthday_letters l
   WHERE l.id = p_id AND l.edit_key_hash = public._letters_key_hash(p_edit_key)
   FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'error', 'not_found'); END IF;
  IF v_row.withdrawn_at IS NOT NULL THEN RETURN jsonb_build_object('ok', true); END IF;
  IF NOT public._letters_is_open(now()) THEN RETURN jsonb_build_object('ok', false, 'error', 'closed'); END IF;
  UPDATE public.birthday_letters SET withdrawn_at = now(), withdrawn_by = 'author', updated_at = now() WHERE id = p_id;
  RETURN jsonb_build_object('ok', true);
END;
$$;

-- ============================================================
-- 5. 運営(twilightplc のセッションだけ)
-- ============================================================
-- 全件。印刷状況は printedVersion(印刷済みの束で最も新しい版)と currentVersion を比べて出す
CREATE OR REPLACE FUNCTION public.letters_admin_list()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public._letters_is_admin() THEN RAISE EXCEPTION 'forbidden'; END IF;
  RETURN coalesce((
    SELECT jsonb_agg(jsonb_build_object(
      'id', l.id,
      'createdAt', l.created_at,
      'updatedAt', l.updated_at,
      'currentVersion', l.current_version,
      'reviewedVersion', l.reviewed_version,
      'reviewedAt', l.reviewed_at,
      'webHidden', l.web_hidden,
      'withdrawnAt', l.withdrawn_at,
      'withdrawnBy', l.withdrawn_by,
      'pulledAt', l.pulled_at,
      'content', v.content,
      'printedVersion', (
        SELECT max(i.version) FROM public.birthday_letter_print_items i
        JOIN public.birthday_letter_print_batches b ON b.id = i.batch_id
        WHERE i.letter_id = l.id AND b.printed_at IS NOT NULL AND b.cancelled_at IS NULL),
      'printedAt', (
        SELECT max(b.printed_at) FROM public.birthday_letter_print_items i
        JOIN public.birthday_letter_print_batches b ON b.id = i.batch_id
        WHERE i.letter_id = l.id AND b.printed_at IS NOT NULL AND b.cancelled_at IS NULL),
      'queuedVersion', (
        SELECT max(i.version) FROM public.birthday_letter_print_items i
        JOIN public.birthday_letter_print_batches b ON b.id = i.batch_id
        WHERE i.letter_id = l.id AND b.printed_at IS NULL AND b.cancelled_at IS NULL)
    ) ORDER BY l.created_at)
    FROM public.birthday_letters l
    JOIN public.birthday_letter_versions v ON v.letter_id = l.id AND v.version = l.current_version
  ), '[]'::jsonb);
END;
$$;

-- 確認・掲載・取り下げ。p_action:
--   approve(p_version の版を確認済みに。今の版でなければ 'stale')/ unapprove
--   hide / show(Web に出すか。本には載る)/ withdraw / restore / pulled(印刷済みを束から抜いた)
CREATE OR REPLACE FUNCTION public.letters_admin_act(p_id uuid, p_action text, p_version integer DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_current integer;
  v_withdrawn_by text;
BEGIN
  IF NOT public._letters_is_admin() THEN RAISE EXCEPTION 'forbidden'; END IF;
  SELECT l.current_version, l.withdrawn_by INTO v_current, v_withdrawn_by FROM public.birthday_letters l WHERE l.id = p_id FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'error', 'not_found'); END IF;

  IF p_action = 'approve' THEN
    IF p_version IS DISTINCT FROM v_current THEN RETURN jsonb_build_object('ok', false, 'error', 'stale'); END IF;
    UPDATE public.birthday_letters SET reviewed_version = v_current, reviewed_at = now() WHERE id = p_id;
  ELSIF p_action = 'unapprove' THEN
    UPDATE public.birthday_letters SET reviewed_version = NULL, reviewed_at = NULL WHERE id = p_id;
  ELSIF p_action = 'hide' THEN
    UPDATE public.birthday_letters SET web_hidden = true WHERE id = p_id;
  ELSIF p_action = 'show' THEN
    UPDATE public.birthday_letters SET web_hidden = false WHERE id = p_id;
  ELSIF p_action = 'withdraw' THEN
    UPDATE public.birthday_letters SET withdrawn_at = coalesce(withdrawn_at, now()), withdrawn_by = coalesce(withdrawn_by, 'admin') WHERE id = p_id;
  ELSIF p_action = 'restore' THEN
    -- 本人が取り下げた手紙は、運営が戻さない
    IF v_withdrawn_by = 'author' THEN RETURN jsonb_build_object('ok', false, 'error', 'author_withdrawn'); END IF;
    UPDATE public.birthday_letters SET withdrawn_at = NULL, withdrawn_by = NULL, pulled_at = NULL WHERE id = p_id;
  ELSIF p_action = 'pulled' THEN
    UPDATE public.birthday_letters SET pulled_at = now() WHERE id = p_id;
  ELSE
    RETURN jsonb_build_object('ok', false, 'error', 'invalid');
  END IF;
  RETURN jsonb_build_object('ok', true);
END;
$$;

-- 印刷の束を作る。確認済みの版 = 今の版で、取り下げていない手紙だけを、その版で固定する。
-- 同じ版がまだ印刷していない別の束に入っていれば入れない(ボタンの二度押しなどで束が重ならないように)
CREATE OR REPLACE FUNCTION public.letters_admin_create_batch(p_ids uuid[], p_template text, p_note text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_batch uuid;
  v_count integer;
BEGIN
  IF NOT public._letters_is_admin() THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF p_template IS NULL OR p_template !~ '^[a-z0-9.-]{1,64}$' THEN RETURN jsonb_build_object('ok', false, 'error', 'invalid'); END IF;

  -- 同時に 2 回届いた時は、後の方が先の束を見てから入れるように、対象の手紙を押さえる
  PERFORM 1 FROM public.birthday_letters l WHERE l.id = ANY (p_ids) ORDER BY l.id FOR UPDATE;
  INSERT INTO public.birthday_letter_print_batches (template, note) VALUES (p_template, left(p_note, 200)) RETURNING id INTO v_batch;
  INSERT INTO public.birthday_letter_print_items (batch_id, position, letter_id, version)
  SELECT v_batch, row_number() OVER (ORDER BY x.ord), l.id, l.current_version
  FROM unnest(p_ids) WITH ORDINALITY AS x(id, ord)
  JOIN public.birthday_letters l ON l.id = x.id
  WHERE l.withdrawn_at IS NULL AND l.reviewed_version = l.current_version
    AND NOT EXISTS (
      SELECT 1 FROM public.birthday_letter_print_items i2
      JOIN public.birthday_letter_print_batches b2 ON b2.id = i2.batch_id
      WHERE i2.letter_id = l.id AND i2.version = l.current_version
        AND b2.id <> v_batch AND b2.printed_at IS NULL AND b2.cancelled_at IS NULL)
  ON CONFLICT DO NOTHING;
  GET DIAGNOSTICS v_count = ROW_COUNT;

  IF v_count = 0 THEN
    DELETE FROM public.birthday_letter_print_batches WHERE id = v_batch;
    RETURN jsonb_build_object('ok', false, 'error', 'empty');
  END IF;
  RETURN jsonb_build_object('ok', true, 'batchId', v_batch, 'count', v_count, 'skipped', coalesce(array_length(p_ids, 1), 0) - v_count);
END;
$$;

CREATE OR REPLACE FUNCTION public.letters_admin_batches()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public._letters_is_admin() THEN RAISE EXCEPTION 'forbidden'; END IF;
  RETURN coalesce((
    SELECT jsonb_agg(jsonb_build_object(
      'id', b.id, 'template', b.template, 'note', b.note, 'createdAt', b.created_at,
      'printedAt', b.printed_at, 'cancelledAt', b.cancelled_at,
      'count', (SELECT count(*) FROM public.birthday_letter_print_items i WHERE i.batch_id = b.id)
    ) ORDER BY b.created_at DESC)
    FROM public.birthday_letter_print_batches b
  ), '[]'::jsonb);
END;
$$;

-- 束の中身(固定した版の内容。非公開の本文を含む)
CREATE OR REPLACE FUNCTION public.letters_admin_batch(p_batch uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public._letters_is_admin() THEN RAISE EXCEPTION 'forbidden'; END IF;
  RETURN (
    SELECT jsonb_build_object(
      'id', b.id, 'template', b.template, 'note', b.note, 'createdAt', b.created_at,
      'printedAt', b.printed_at, 'cancelledAt', b.cancelled_at,
      'items', coalesce((
        SELECT jsonb_agg(jsonb_build_object(
          'position', i.position, 'id', i.letter_id, 'version', i.version,
          'currentVersion', l.current_version, 'withdrawn', l.withdrawn_at IS NOT NULL,
          'content', v.content
        ) ORDER BY i.position)
        FROM public.birthday_letter_print_items i
        JOIN public.birthday_letters l ON l.id = i.letter_id
        JOIN public.birthday_letter_versions v ON v.letter_id = i.letter_id AND v.version = i.version
        WHERE i.batch_id = b.id
      ), '[]'::jsonb)
    )
    FROM public.birthday_letter_print_batches b WHERE b.id = p_batch
  );
END;
$$;

-- 実際に印刷した後に、運営が押す(印刷画面を開いただけでは記録しない)。
-- p_printed は印刷画面に出したカード(画面を開いた時点で取り下げられていたものは刷らない)。
-- それ以外は束から外し、印刷済みの記録に残さない。開いた後に取り下げられたものは刷った記録が残り、「抜き取りが必要」に出る
CREATE OR REPLACE FUNCTION public.letters_admin_mark_printed(p_batch uuid, p_printed uuid[])
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public._letters_is_admin() THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF p_printed IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'invalid'); END IF;
  PERFORM 1 FROM public.birthday_letter_print_batches b
   WHERE b.id = p_batch AND b.printed_at IS NULL AND b.cancelled_at IS NULL FOR UPDATE;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok', false); END IF;
  DELETE FROM public.birthday_letter_print_items i WHERE i.batch_id = p_batch AND NOT (i.letter_id = ANY (p_printed));
  UPDATE public.birthday_letter_print_batches SET printed_at = now() WHERE id = p_batch;
  RETURN jsonb_build_object('ok', true);
END;
$$;

CREATE OR REPLACE FUNCTION public.letters_admin_cancel_batch(p_batch uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NOT public._letters_is_admin() THEN RAISE EXCEPTION 'forbidden'; END IF;
  UPDATE public.birthday_letter_print_batches SET cancelled_at = now()
   WHERE id = p_batch AND printed_at IS NULL AND cancelled_at IS NULL;
  RETURN jsonb_build_object('ok', FOUND);
END;
$$;

-- ============================================================
-- 6. 実行権限
-- ============================================================
-- 緊急の切り替え(運営だけ)。引数を渡した項目だけ変える。今の値を返す
CREATE OR REPLACE FUNCTION public.letters_admin_settings(p_public_mode text DEFAULT NULL, p_accepting boolean DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_row record;
BEGIN
  IF NOT public._letters_is_admin() THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF p_public_mode IS NOT NULL AND p_public_mode NOT IN ('all', 'checked') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid');
  END IF;
  INSERT INTO public.birthday_letter_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
  IF p_public_mode IS NOT NULL OR p_accepting IS NOT NULL THEN
    UPDATE public.birthday_letter_settings
       SET public_mode = coalesce(p_public_mode, public_mode),
           accepting = coalesce(p_accepting, accepting),
           updated_at = now()
     WHERE id = 1;
  END IF;
  SELECT s.public_mode, s.accepting, s.updated_at INTO v_row FROM public.birthday_letter_settings s WHERE s.id = 1;
  RETURN jsonb_build_object('ok', true, 'publicMode', v_row.public_mode, 'accepting', v_row.accepting, 'updatedAt', v_row.updated_at);
END;
$$;

-- バックアップ(読み出しだけ)。バックアップ専用の鍵が合う時だけ、手紙の表を丸ごと返す(本文・修正の鍵のハッシュも含む。戻す時に要るため)
CREATE OR REPLACE FUNCTION public.letters_backup_export(p_key text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_hash text := public._letters_key_hash(p_key);
BEGIN
  IF v_hash IS NULL OR NOT EXISTS (SELECT 1 FROM public.birthday_letter_backup_keys k WHERE k.key_hash = v_hash) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  RETURN jsonb_build_object(
    'format', 'reol-letters-backup-v1',
    'exportedAt', now(),
    'letters', coalesce((SELECT jsonb_agg(to_jsonb(l) ORDER BY l.created_at) FROM public.birthday_letters l), '[]'::jsonb),
    'versions', coalesce((SELECT jsonb_agg(to_jsonb(v) ORDER BY v.letter_id, v.version) FROM public.birthday_letter_versions v), '[]'::jsonb),
    'printBatches', coalesce((SELECT jsonb_agg(to_jsonb(b) ORDER BY b.created_at) FROM public.birthday_letter_print_batches b), '[]'::jsonb),
    'printItems', coalesce((SELECT jsonb_agg(to_jsonb(i) ORDER BY i.batch_id, i.position) FROM public.birthday_letter_print_items i), '[]'::jsonb),
    'settings', (SELECT to_jsonb(s) FROM public.birthday_letter_settings s WHERE s.id = 1)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.letters_status() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.letters_backup_export(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.letters_admin_settings(text, boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.letters_submit(uuid, text, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.letters_public_list(text, text, text, integer, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.letters_public_get(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.letters_public_counts() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.letters_own_get(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.letters_own_update(uuid, text, integer, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.letters_own_withdraw(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.letters_admin_list() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.letters_admin_act(uuid, text, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.letters_admin_create_batch(uuid[], text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.letters_admin_batches() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.letters_admin_batch(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.letters_admin_mark_printed(uuid, uuid[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.letters_admin_cancel_batch(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.letters_status() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.letters_submit(uuid, text, jsonb) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.letters_public_list(text, text, text, integer, integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.letters_public_get(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.letters_public_counts() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.letters_own_get(uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.letters_own_update(uuid, text, integer, jsonb) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.letters_own_withdraw(uuid, text) TO anon, authenticated;
-- 運営の関数も呼ぶこと自体は anon に許す(中で運営のセッションか確かめる。違えば forbidden)
GRANT EXECUTE ON FUNCTION public.letters_admin_list() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.letters_admin_act(uuid, text, integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.letters_admin_create_batch(uuid[], text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.letters_admin_batches() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.letters_admin_batch(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.letters_admin_mark_printed(uuid, uuid[]) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.letters_admin_cancel_batch(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.letters_admin_settings(text, boolean) TO anon, authenticated;
-- バックアップの関数も呼ぶこと自体は anon に許す(中でバックアップ専用の鍵を確かめる。違えば forbidden)
GRANT EXECUTE ON FUNCTION public.letters_backup_export(text) TO anon, authenticated;

COMMIT;

-- 実行後の確認(SQL Editor で):
--   SELECT public._letters_is_open('2026-12-20 14:59:59+00'), public._letters_is_open('2026-12-20 15:00:00+00');  -- true, false
