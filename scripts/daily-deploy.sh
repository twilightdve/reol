#!/bin/zsh
# 毎日の自動デプロイの入口(plan/47)。中身は scripts/daily-deploy.ts。
#   scripts/daily-deploy.sh install    launchd に登録(1時間ごとに起こす。その日まだなら1回だけデプロイ)
#   scripts/daily-deploy.sh uninstall  launchd から外す
#   scripts/daily-deploy.sh check      条件と GitHub への接続だけ確かめる(デプロイしない)
#   scripts/daily-deploy.sh            launchd から呼ばれる本体
set -eu
REPO="${0:A:h:h}"
LABEL="com.twilightea.reol.daily-deploy"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
LOG="$HOME/Library/Logs/reol-daily-deploy.log"
export PATH="$HOME/.nodebrew/current/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
cd "$REPO"

ts_node() {
  exec npx ts-node --compiler-options '{"module":"commonjs"}' scripts/daily-deploy.ts "$@"
}

case "${1:-run}" in
  install)
    cat > "$PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>$LABEL</string>
  <key>ProgramArguments</key>
  <array><string>/bin/zsh</string><string>$REPO/scripts/daily-deploy.sh</string></array>
  <key>StartCalendarInterval</key>
  <dict><key>Minute</key><integer>0</integer></dict>
  <key>StandardOutPath</key><string>$LOG</string>
  <key>StandardErrorPath</key><string>$LOG</string>
  <key>ProcessType</key><string>Background</string>
</dict>
</plist>
EOF
    launchctl bootout "gui/$UID/$LABEL" 2>/dev/null || true
    launchctl bootstrap "gui/$UID" "$PLIST"
    echo "登録しました: $PLIST(ログ: $LOG)"
    ;;
  uninstall)
    launchctl bootout "gui/$UID/$LABEL" 2>/dev/null || true
    rm -f "$PLIST"
    echo "外しました"
    ;;
  check) ts_node --check ;;
  run) ts_node ;;
  *) echo "usage: $0 [install|uninstall|check]" >&2; exit 2 ;;
esac
