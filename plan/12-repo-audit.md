# 12. リポジトリ未コミット差分 監査報告

作成日: 2026-07-02
ステータス: **精査完了・ユーザー判断待ち**(この整理完了後、第2バッチからfeatureブランチ運用を開始)

## 現状サマリ

- ブランチ: `main`(origin/main より **1コミット先行**、HEAD `0c26379` "20250827" は未push)
- 未コミット差分: **修正46 / 削除3 / 未追跡73** = 計122項目(tracked分だけで +5,212/-1,794 行)
- リモート: `github.com/twilightdve/reol` — **public リポジトリ**(HTTP 200で確認)

---

## 🚨 A. セキュリティ問題(最優先)

### A-1. `token.json` が公開リポジトリにpush済み

- 内容: Google OAuth の `type` / `client_id` / **`client_secret`** / **`refresh_token`**(SpreadsheetService用と推測)
- 追跡状況: コミット `94e0127`("update")以降でtracked、**origin/main に含まれる = 現在誰でも閲覧可能**
- `.gitignore` は `credentials.json` を除外しているが `token.json` が漏れている

**必要な対応(コミット整理より先に実施すべき)**:

1. **Google Cloud Console で該当OAuthクライアントのシークレットをローテーション**(または該当リフレッシュトークンを失効)。これが本質的対策。ローテーションしない限り、gitから消しても意味がない
2. `git rm --cached token.json` + `.gitignore` に追加(以後の再コミット防止)
3. (任意)`git filter-repo` 等での履歴からの除去 + force push。ただし公開済みである以上、履歴除去は「見えにくくする」効果しかなく、**1のローテーションが完了していれば必須ではない**

### A-2. その他の確認結果(問題なし)

- `.env*` はignore済み
- `credentials.json` はignore済み・未追跡
- Firebase設定(`src/services/firebase.ts`)のWeb APIキーは設計上公開前提のため問題なし(Supabase/FirestoreのセキュリティルールはSUPABASE_SECURITY.md参照)

---

## B. 差分の棚卸し(カテゴリ別)

### B-1. 設定・依存関係(修正)

`package.json` `package-lock.json` `yarn.lock` `tsconfig.json` `tailwind.config.js` `gatsby-browser.tsx` `gatsby-config.ts` `gatsby-node.ts` `reol.code-workspace`

### B-2. 既存UIの大規模リファクタ(修正・削除)

- セクション分割・独立ページ化: `src/components/index/**`(sections/, discography/, live/ 等 16ファイル)、`src/components/modules/{body,header,mainVideo,tweets}.tsx`
- `src/hooks/` `src/redux/` `src/services/{Spreadsheet,Utility}Service.ts` `src/styles/` `src/types/`
- 削除: `DYNAMIC_COLOR_FEATURE.md` `REFACTORING_PROGRESS.md`(docs/へ移動)、`src/types/news.ts`

### B-3. 新機能: 美辞学ナビ/ツアー支援(未追跡)

`src/components/{reolmap,attendance,auth,setlist,venue}/` `src/pages/bijigaku-navi/` `src/i18n/` `src/templates/{venue,article}.tsx` `src/services/{auth,checkin,checklist,comment,encounterWant,setlist,venue,firestore,firebase,cache}*.ts` `src/types/bijigaku.ts` `supabase/`(migrations/schema)

### B-4. 新機能: ファンタイプ診断(未追跡)

`src/pages/quiz/reol-type/` `src/templates/reol-type-detail.tsx` `src/data/reol-type/`

### B-5. 新機能: Relive Player(未追跡)

`src/pages/relive/` `src/features/relive/` `scripts/generate-relive-data.ts`(**prebuildが依存 — 未コミットだと他環境でビルド不能**)`static/relive/`

### B-6. 新機能: 検索・楽曲統計・相関図・タイムライン(未追跡+修正)

`src/pages/{search,cgraph,dynamic-color-demo}.tsx` `src/pages/songs/` `src/features/cgraph/` `src/pages/timeline/`(修正) `src/services/MusicBrainzService.ts`

### B-7. 第1バッチのSEO/公式導線改善(今セッション)

`gatsby-ssr.tsx` `src/components/SEO.tsx` `src/components/modules/officialFooter.tsx` `src/utils/analytics.ts` ほか各ページのHead修正

**注意**: B-7の編集はB-2/B-6の既存差分と同一ファイル内で混在しており、コミットを完全分離するには行単位の分割(`git add -p`)が必要。現実的にはファイルが属する機能グループに同乗させるのが妥当

### B-8. データ・静的アセット(未追跡)

- `static/`(ogimage.png ほか。`static/data/*.json` はgatsby-nodeが生成・ミラーする**ビルド入出力キャッシュ**だが、relive生成・各種スクリプトの入力でもあるため**コミット推奨**)
- `master/relations.json`(gatsby-nodeが読む手動編集マスター → コミット対象)。ただし `master/*.bak*` `master/relations.incomplete.json.bak` はバックアップごみ → ignore推奨
- `venue_facilities_data.json` `venue_facilities_links.csv` `venue_images_data.json`(scripts/の入出力)

### B-9. ドキュメント(未追跡)

- `docs/`(設計ドキュメント10本 → コミット推奨)
- `plan/`(今回の改善計画 → コミット推奨)
- `CLAUDE.md`(→ コミット推奨)
- **`.memo/`(予算計画・観光計画・チケット分析などの私的メモ)→ 公開リポジトリのため ignore してローカル保持を推奨(ユーザー判断)**

### B-10. その他

- `yarn-error.log` → ignore推奨
- `bk/` は既にtracked(過去のバックアップコード)。今回は触らない

---

## C. 提案するコミット構成(テーマ別・9コミット案)

`main` 上でベースライン整理としてコミット(次バッチ以降はfeatureブランチ運用):

| # | コミット | 内容 |
|---|---|---|
| 0 | `chore: token.jsonの追跡除外とgitignore整備` | A-1対応(ローテーション実施後)+ yarn-error.log / master/*.bak* / .memo/(判断次第) |
| 1 | `chore: 依存関係・ビルド設定の更新` | B-1 |
| 2 | `refactor: セクション独立ページ化と共通コンポーネント整理` | B-2 + 対応するpages(discography/live/place/photos) |
| 3 | `feat: 美辞学ナビ(会場・アクセス・参加者・チェックリスト)` | B-3 |
| 4 | `feat: Reolファンタイプ診断(16タイプ)` | B-4 |
| 5 | `feat: Relive Player` | B-5 |
| 6 | `feat: 横断検索・楽曲統計・相関図・年表ジェネレーター` | B-6 |
| 7 | `data: 静的データ・マスターデータ・画像` | B-8 |
| 8 | `feat: SEO/OGP改善と公式送客フッター(改善プラン第1バッチ)` | B-7のうち独立ファイル(SEO.tsx, officialFooter.tsx, gatsby-ssr.tsx, analytics.ts)※混在分は各グループに同乗 |
| 9 | `docs: 設計ドキュメント・改善計画` | B-9(docs/, plan/, CLAUDE.md) |

代替案: 「baseline 2026-07-02」として**1コミットに一括**(履歴の粒度は失うが最速・混在問題も消える)

---

## D. .gitignore 追加提案

```gitignore
token.json
yarn-error.log
master/*.bak*
master/*.bak.json
# ユーザー判断: 私的メモをローカル保持する場合
.memo/
```

## E. この後の流れ

1. ユーザー判断(下記3点)→ 私が実行
2. 整理完了後、`origin/main` へ push(要確認)
3. 第2バッチを `feature/batch-02-stats-jsonld-ogp` ブランチで開始(Sonnet 5委譲)
