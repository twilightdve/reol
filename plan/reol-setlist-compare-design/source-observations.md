# Source observations

- live.json entries: 59
- discography.json entries: 85
- live items配下にsetListがあり、liveItemSongNo / liveItemSongNameを保持する。
- discography songs配下にsongId / songNameがある。

このためMVPは現行構造のまま実装可能。恒久運用ではsongId連携を推奨。
