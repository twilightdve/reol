#!/bin/zsh
# 手紙企画のバックアップ(plan/64)。6 時間ごとに launchd が起こす。中身は scripts/letters-backup.mjs。
#   scripts/letters-backup.sh setup      バックアップ専用の鍵を作り(~/.config/reol/letters-backup.key)、DB に登録する SQL を出す
#   scripts/letters-backup.sh install    launchd に登録(6 時間ごと。Mac が寝ていた時は起きた時に 1 回)
#   scripts/letters-backup.sh uninstall  launchd から外す
#   scripts/letters-backup.sh            1 回だけバックアップする(launchd から呼ばれる本体)
#   scripts/letters-backup.sh restore-sql <file>  バックアップから戻す SQL を書く(実行は SQL Editor で)
set -eu
REPO="${0:A:h:h}"
LABEL="com.twilightea.reol.letters-backup"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
LOG="$HOME/Library/Logs/reol-letters-backup.log"
KEY_DIR="$HOME/.config/reol"
KEY_FILE="$KEY_DIR/letters-backup.key"
export PATH="$HOME/.nodebrew/current/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
cd "$REPO"

case "${1:-run}" in
  setup)
    mkdir -p "$KEY_DIR" && chmod 700 "$KEY_DIR"
    if [ ! -f "$KEY_FILE" ]; then
      (umask 077; openssl rand -hex 32 > "$KEY_FILE")
      echo "鍵を作りました: $KEY_FILE(この Mac の自分だけが読めます。人に見せないでください)"
    else
      echo "鍵はもうあります: $KEY_FILE"
    fi
    HASH=$(tr -d '\n' < "$KEY_FILE" | shasum -a 256 | cut -d' ' -f1)
    echo ""
    echo "Supabase の SQL Editor で、次の 1 行を実行してください(鍵のハッシュだけを登録します):"
    echo "INSERT INTO public.birthday_letter_backup_keys (key_hash, note) VALUES ('$HASH', 'Mac の launchd(6 時間ごと)') ON CONFLICT (key_hash) DO NOTHING;"
    ;;
  install)
    cat > "$PLIST" <<PL
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>$LABEL</string>
  <key>ProgramArguments</key>
  <array><string>/bin/zsh</string><string>$REPO/scripts/letters-backup.sh</string></array>
  <key>StartInterval</key><integer>21600</integer>
  <key>RunAtLoad</key><true/>
  <key>StandardOutPath</key><string>$LOG</string>
  <key>StandardErrorPath</key><string>$LOG</string>
  <key>ProcessType</key><string>Background</string>
</dict>
</plist>
PL
    launchctl bootout "gui/$UID/$LABEL" 2>/dev/null || true
    launchctl bootstrap "gui/$UID" "$PLIST"
    echo "登録しました: $PLIST(6 時間ごと。ログ: $LOG / 保存先: ~/Backups/reol-letters/)"
    ;;
  uninstall)
    launchctl bootout "gui/$UID/$LABEL" 2>/dev/null || true
    rm -f "$PLIST"
    echo "外しました"
    ;;
  run)
    exec node scripts/letters-backup.mjs
    ;;
  restore-sql)
    exec node scripts/letters-backup.mjs restore-sql "${2:-}"
    ;;
  *)
    echo "使い方: scripts/letters-backup.sh [setup|install|uninstall|restore-sql <file>]"; exit 1 ;;
esac
