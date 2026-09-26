# 04. URL・状態管理

比較URL:
`/setlist/compare?from=55-1&to=40-3`

`liveId-liveItemNo` を比較対象識別子にする。

URLをsource of truthにすることで、リロード、共有、ブックマークに対応。
Gatsbyでは固定ページを生成し、比較対象はクライアント側で解決する。

将来:
- `/setlist/tour/compare?liveId=123`
- `/song/42/live-history`
