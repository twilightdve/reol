/**
 * /letters/admin/ — 手紙企画の運営画面(plan/64)。
 * 中身を返すかどうかは DB が決める(ログイン中のセッションが運営の ID の時だけ)。この画面の表示の出し分けは見た目だけ。
 * - 確認: 今の版を確認済みにすると、その版が Web に出る(本だけの手紙は宛名面だけ)。
 * - 印刷: 確認済みの手紙を選んで「束」を作る(その時の版で固定)。束の印刷画面で刷り、刷り終えたら「印刷した」を押す。
 *   画面を開いただけ・PDF にしただけでは印刷済みにしない。
 * - 刷った後に直された手紙は「再印刷が必要」、刷った後に取り下げた手紙は「抜き取りが必要」に出る。
 * GA のページ表示は送らない(gatsby-config)。検索にも出さない。
 */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { HeadFC } from "gatsby";
import { LettersHead, LettersShell } from "../../components/letters/LettersShell";
import { CardBack, CardFront, ScaledCard } from "../../components/letters/Postcard";
import { useAuth } from "../../contexts/AuthContext";
import { OWNER_USER_ID } from "../../constants/owner";
import { bodyText } from "../../utils/letters/body";
import { LETTERS_PRINT_TEMPLATE, snsLabel } from "../../utils/letters/constants";
import {
  adminAct,
  AdminAction,
  adminCancelBatch,
  adminCreateBatch,
  adminGetBatch,
  adminListBatches,
  adminListLetters,
  AdminLetter,
  adminMarkPrinted,
  LettersError,
  PrintBatch,
  PrintBatchSummary,
} from "../../utils/letters/service";

type Tab = "review" | "printable" | "reprint" | "pull" | "all" | "batches";
const TABS: { id: Tab; label: string }[] = [
  { id: "review", label: "確認待ち" },
  { id: "printable", label: "印刷できる" },
  { id: "reprint", label: "再印刷が必要" },
  { id: "pull", label: "抜き取りが必要" },
  { id: "all", label: "すべて" },
  { id: "batches", label: "印刷の束" },
];

const fmt = (iso: string | null) => (iso ? new Date(iso).toLocaleString("ja-JP", { dateStyle: "short", timeStyle: "short" }) : "—");

const printStatus = (l: AdminLetter): string => {
  if (l.withdrawnAt) return l.printedVersion ? (l.pulledAt ? "取り下げ(抜き取り済み)" : "取り下げ・抜き取りが必要") : "取り下げ";
  if (!l.printedVersion) return l.queuedVersion ? `未印刷(束に入っている: 版${l.queuedVersion})` : "未印刷";
  if (l.printedVersion === l.currentVersion) return `印刷済み(版${l.printedVersion})`;
  return `再印刷が必要(印刷した版${l.printedVersion} → 今の版${l.currentVersion})`;
};

const inTab = (l: AdminLetter, tab: Tab) => {
  const reviewedNow = l.reviewedVersion === l.currentVersion;
  switch (tab) {
    case "review":
      return !l.withdrawnAt && !reviewedNow;
    case "printable":
      return !l.withdrawnAt && reviewedNow && l.printedVersion !== l.currentVersion && l.queuedVersion !== l.currentVersion;
    case "reprint":
      return !l.withdrawnAt && !!l.printedVersion && l.printedVersion !== l.currentVersion;
    case "pull":
      return !!l.withdrawnAt && !!l.printedVersion && !l.pulledAt;
    default:
      return true;
  }
};

const LoginBox: React.FC = () => {
  const { signInWithPassword } = useAuth();
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  return (
    <form
      className="lp-panel"
      style={{ maxWidth: 360 }}
      onSubmit={async (e) => {
        e.preventDefault();
        setErr("");
        try {
          await signInWithPassword(id, pw);
        } catch (x) {
          setErr(x instanceof Error ? x.message : "ログインできませんでした");
        }
      }}
    >
      <p style={{ margin: "0 0 10px" }}>運営のアカウントでログインしてください。</p>
      <input className="lp-input" placeholder="ID" value={id} onChange={(e) => setId(e.target.value)} autoComplete="username" />
      <input className="lp-input" type="password" placeholder="パスワード" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" />
      {err && <p className="lp-errors">{err}</p>}
      <button type="submit" className="lp-primary" style={{ marginTop: 12 }}>
        ログイン
      </button>
    </form>
  );
};

const LetterRow: React.FC<{
  l: AdminLetter;
  selectable: boolean;
  selected: boolean;
  onSelect: (v: boolean) => void;
  onAct: (a: AdminAction, version?: number) => void;
}> = ({ l, selectable, selected, onSelect, onAct }) => {
  const c = l.content;
  const reviewedNow = l.reviewedVersion === l.currentVersion;
  const chars = bodyText(c.body).length;
  return (
    <div className="lp-admin-row">
      <div>
        <ScaledCard maxWidth={150}>
          <CardFront face={c} />
        </ScaledCard>
      </div>
      <div>
        <ScaledCard maxWidth={150}>
          <CardBack motif={c.motif} sender={c.sender} body={c.body} />
        </ScaledCard>
      </div>
      <div>
        {selectable && (
          <label className="lp-consent" style={{ fontSize: 13 }}>
            <input type="checkbox" checked={selected} onChange={(e) => onSelect(e.target.checked)} />
            <span>印刷の束に入れる</span>
          </label>
        )}
        <b style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 16 }}>{c.address}</b>
        <dl>
          <dt>宛先</dt>
          <dd>
            {c.eventLabel}
            {c.eventDate ? `(${c.eventDate})` : ""}
          </dd>
          <dt>差出人</dt>
          <dd>
            {c.sender}
            {c.snsType && c.snsId ? ` · ${snsLabel(c.snsType)} @${c.snsId}` : ""}
          </dd>
          <dt>本文</dt>
          <dd>
            {c.visibility === "public" ? "Webでも公開" : "贈る本だけ"} · {chars}字
          </dd>
          <dt>版</dt>
          <dd>
            今の版 {l.currentVersion} / 確認済み {l.reviewedVersion ?? "—"}
            {l.webHidden ? " · Web非掲載" : ""}
          </dd>
          <dt>印刷</dt>
          <dd>{printStatus(l)}</dd>
          <dt>日時</dt>
          <dd>
            投函 {fmt(l.createdAt)} · 更新 {fmt(l.updatedAt)}
            {l.printedAt ? ` · 印刷 ${fmt(l.printedAt)}` : ""}
          </dd>
          <dt>ID</dt>
          <dd style={{ fontFamily: "monospace", fontSize: 11 }}>{l.id}</dd>
        </dl>
        <div className="acts">
          {!l.withdrawnAt && !reviewedNow && (
            <button type="button" className="is-primary" onClick={() => onAct("approve", l.currentVersion)}>
              版{l.currentVersion}を確認済みにする
            </button>
          )}
          {l.reviewedVersion && <button onClick={() => onAct("unapprove")}>確認を外す(Webから下げる)</button>}
          {l.webHidden ? <button onClick={() => onAct("show")}>Webに出す</button> : <button onClick={() => onAct("hide")}>Webに出さない(本には載せる)</button>}
          {l.withdrawnAt ? (
            <button onClick={() => onAct("restore")}>取り下げを戻す</button>
          ) : (
            <button onClick={() => window.confirm("この手紙を取り下げにしますか(Webにも本にも載せない)") && onAct("withdraw")}>取り下げにする</button>
          )}
          {l.withdrawnAt && l.printedVersion && !l.pulledAt && <button onClick={() => onAct("pulled")}>束から抜いた</button>}
          {!l.withdrawnAt && !l.webHidden && l.reviewedVersion && (
            <a className="lp-text-link" href={`/letters/card/?id=${l.id}`} target="_blank" rel="noreferrer">
              Webの表示
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

const BatchView: React.FC<{ id: string; onBack: () => void; onChanged: () => void }> = ({ id, onBack, onChanged }) => {
  const [batch, setBatch] = useState<PrintBatch | null>(null);
  const [err, setErr] = useState("");
  const load = useCallback(() => {
    adminGetBatch(id)
      .then(setBatch)
      .catch(() => setErr("束を読み込めませんでした"));
  }, [id]);
  useEffect(load, [load]);
  if (err) return <p className="lp-alert">{err}</p>;
  if (!batch) return <p className="lp-note">読み込んでいます…</p>;
  const stale = batch.items.filter((i) => i.withdrawn || i.currentVersion !== i.version);
  return (
    <>
      <div className="lp-noprint">
        <button type="button" className="lp-text-link" onClick={onBack}>
          ← 一覧へ
        </button>
        <h2 style={{ marginTop: 12 }}>印刷の束({batch.items.length}枚)</h2>
        <p className="lp-note">
          作成 {fmt(batch.createdAt)} · テンプレート {batch.template}
          {batch.printedAt ? ` · 印刷済み ${fmt(batch.printedAt)}` : batch.cancelledAt ? ` · 取り消し ${fmt(batch.cancelledAt)}` : " · まだ印刷していません"}
        </p>
        <p className="lp-note">
          用紙 100×148mm・余白なしで、表 → 裏 の順に交互に出ます(両面印刷は「短辺とじ/長辺とじ」をプリンターで試し刷りして合わせてください)。
          {" "}本文は束を作った時の版で固定しています。
        </p>
        {stale.length > 0 && (
          <p className="lp-alert">
            束を作った後に、{stale.length}枚が直されたか取り下げられています(表の「今の版」を確認)。この束で刷っても記録は刷った版で残り、直された手紙は「再印刷が必要」に出ます。
          </p>
        )}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", margin: "14px 0 20px" }}>
          <button type="button" className="lp-primary" onClick={() => window.print()}>
            印刷する(ブラウザーの印刷)
          </button>
          {!batch.printedAt && !batch.cancelledAt && (
            <>
              <button
                type="button"
                className="lp-secondary"
                onClick={async () => {
                  if (!window.confirm("この束を実際に印刷し終えましたか。印刷済みとして記録します。")) return;
                  await adminMarkPrinted(batch.id);
                  load();
                  onChanged();
                }}
              >
                印刷した(記録する)
              </button>
              <button
                type="button"
                className="lp-secondary"
                onClick={async () => {
                  if (!window.confirm("この束を取り消しますか(印刷していない時だけ)")) return;
                  await adminCancelBatch(batch.id);
                  load();
                  onChanged();
                }}
              >
                束を取り消す
              </button>
            </>
          )}
        </div>
        <table className="lp-table" style={{ marginBottom: 24 }}>
          <thead>
            <tr>
              <th>順</th>
              <th>宛名</th>
              <th>差出人</th>
              <th>刷る版</th>
              <th>今の版</th>
              <th>ID</th>
            </tr>
          </thead>
          <tbody>
            {batch.items.map((i) => (
              <tr key={i.id}>
                <td>{i.position}</td>
                <td>{i.content.address}</td>
                <td>{i.content.sender}</td>
                <td>{i.version}</td>
                <td>{i.withdrawn ? "取り下げ" : i.currentVersion}</td>
                <td style={{ fontFamily: "monospace", fontSize: 10 }}>{i.id.slice(0, 8)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="lp-print-pages">
        {batch.items.map((i) => (
          <React.Fragment key={i.id}>
            <div className="lp-print-page">
              <CardFront face={i.content} />
            </div>
            <div className="lp-print-page">
              <CardBack motif={i.content.motif} sender={i.content.sender} body={i.content.body} />
            </div>
          </React.Fragment>
        ))}
      </div>
    </>
  );
};

const AdminPage: React.FC = () => {
  const { user, loading } = useAuth();
  const [letters, setLetters] = useState<AdminLetter[] | null>(null);
  const [batches, setBatches] = useState<PrintBatchSummary[]>([]);
  const [state, setState] = useState<"idle" | "loading" | "ok" | "forbidden" | "unavailable" | "error">("idle");
  const [tab, setTab] = useState<Tab>("review");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [batchId, setBatchId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");

  const reload = useCallback(async () => {
    setState((s) => (s === "ok" ? s : "loading"));
    try {
      const [ls, bs] = await Promise.all([adminListLetters(), adminListBatches()]);
      setLetters(ls);
      setBatches(bs);
      setState("ok");
    } catch (e) {
      setState(e instanceof LettersError ? (e.code === "forbidden" ? "forbidden" : e.code === "unavailable" ? "unavailable" : "error") : "error");
    }
  }, []);

  useEffect(() => {
    const b = new URLSearchParams(window.location.search).get("batch");
    if (b) setBatchId(b);
  }, []);
  useEffect(() => {
    if (!loading && user) reload();
  }, [loading, user, reload]);

  const shown = useMemo(() => (letters ?? []).filter((l) => inTab(l, tab)).reverse(), [letters, tab]);
  const counts = useMemo(() => Object.fromEntries(TABS.map((t) => [t.id, (letters ?? []).filter((l) => inTab(l, t.id)).length])), [letters]);

  const act = async (id: string, a: AdminAction, version?: number) => {
    const r = await adminAct(id, a, version);
    if (!r.ok) setMsg(r.error === "stale" ? "確認している間に投稿者が直しました。読み込み直して、今の版を確かめてください。" : `できませんでした(${r.error})`);
    else setMsg("");
    reload();
  };

  const openBatch = (id: string | null) => {
    setBatchId(id);
    window.history.replaceState(null, "", id ? `/letters/admin/?batch=${id}` : "/letters/admin/");
  };

  const createBatch = async () => {
    const ids = shown.filter((l) => selected.has(l.id)).map((l) => l.id);
    if (!ids.length) return;
    const r = await adminCreateBatch(ids, LETTERS_PRINT_TEMPLATE);
    if (!r.ok) {
      setMsg(`束を作れませんでした(${r.error})`);
      return;
    }
    setSelected(new Set());
    setMsg(r.skipped ? `${r.skipped}枚は確認済みの版が今の版でないため入れませんでした。` : "");
    await reload();
    openBatch(r.batchId);
  };

  const selectable = tab === "printable" || tab === "reprint";

  return (
    <LettersShell current="admin">
      <section className="lp-section" style={{ paddingTop: 32 }}>
        {!loading && !user && <LoginBox />}
        {user && user.id !== OWNER_USER_ID && <p className="lp-alert">この画面は運営だけが使えます。</p>}
        {state === "forbidden" && <p className="lp-alert">運営のアカウントではないため、手紙を読めません。</p>}
        {state === "unavailable" && <p className="lp-alert">DB の準備がまだです(supabase/features/supabase-birthday-letters.sql を SQL Editor で実行してください)。</p>}
        {state === "error" && <p className="lp-alert">読み込めませんでした。</p>}
        {state === "loading" && <p className="lp-note">読み込んでいます…</p>}
        {state === "ok" && letters && (
          batchId ? (
            <BatchView id={batchId} onBack={() => openBatch(null)} onChanged={reload} />
          ) : (
            <>
              <h2>手紙の運営</h2>
              <p className="lp-note" style={{ marginBottom: 16 }}>
                全 {letters.length} 通(取り下げを含む)。確認済みにした版だけが Web に出ます。
              </p>
              {msg && <p className="lp-alert">{msg}</p>}
              <div className="lp-tabs" role="tablist">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className="lp-chip"
                    aria-pressed={tab === t.id}
                    onClick={() => {
                      setTab(t.id);
                      setSelected(new Set());
                    }}
                  >
                    {t.label}
                    {t.id !== "batches" ? ` ${counts[t.id]}` : ` ${batches.length}`}
                  </button>
                ))}
                <button type="button" className="lp-chip" onClick={reload}>
                  読み込み直す
                </button>
              </div>

              {tab === "batches" ? (
                <table className="lp-table">
                  <thead>
                    <tr>
                      <th>作成</th>
                      <th>枚数</th>
                      <th>状態</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {batches.map((b) => (
                      <tr key={b.id}>
                        <td>{fmt(b.createdAt)}</td>
                        <td>{b.count}</td>
                        <td>{b.printedAt ? `印刷済み ${fmt(b.printedAt)}` : b.cancelledAt ? "取り消し" : "未印刷"}</td>
                        <td>
                          <button type="button" className="lp-text-link" onClick={() => openBatch(b.id)}>
                            開く
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <>
                  {selectable && shown.length > 0 && (
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginBottom: 8 }}>
                      <button type="button" className="lp-chip" onClick={() => setSelected(new Set(shown.map((l) => l.id)))}>
                        すべて選ぶ
                      </button>
                      <button type="button" className="lp-primary" disabled={!selected.size} onClick={createBatch}>
                        選んだ {selected.size} 枚で印刷の束を作る
                      </button>
                    </div>
                  )}
                  {shown.length === 0 && <p className="lp-note">ありません。</p>}
                  {shown.map((l) => (
                    <LetterRow
                      key={l.id}
                      l={l}
                      selectable={selectable && !l.withdrawnAt && l.reviewedVersion === l.currentVersion}
                      selected={selected.has(l.id)}
                      onSelect={(v) =>
                        setSelected((s) => {
                          const n = new Set(s);
                          if (v) n.add(l.id);
                          else n.delete(l.id);
                          return n;
                        })
                      }
                      onAct={(a, v) => act(l.id, a, v)}
                    />
                  ))}
                </>
              )}
            </>
          )
        )}
      </section>
    </LettersShell>
  );
};

export default AdminPage;

export const Head: HeadFC = () => <LettersHead title="運営" description="手紙企画の運営画面。" path="/letters/admin/" noindex />;
