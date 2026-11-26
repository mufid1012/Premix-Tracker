#!/bin/bash
# Pasang jadwal backup harian jam 23.00 di macOS (launchd), untuk database di laptop ini.
# Lepas jadwal: bash scripts/install-backup-schedule.sh --uninstall
set -euo pipefail

LABEL="com.produksidapur.backup"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
PROJECT="$(cd "$(dirname "$0")/.." && pwd)"

launchctl bootout "gui/$(id -u)/$LABEL" 2>/dev/null || true
if [[ "${1:-}" == "--uninstall" ]]; then
  rm -f "$PLIST"
  echo "Jadwal backup dilepas."
  exit 0
fi

NODE="$(command -v node)"
mkdir -p "$PROJECT/backups" "$HOME/Library/LaunchAgents"

cat > "$PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>$LABEL</string>
  <key>ProgramArguments</key>
  <array>
    <string>$NODE</string>
    <string>$PROJECT/scripts/backup-db.mjs</string>
  </array>
  <key>WorkingDirectory</key><string>$PROJECT</string>
  <key>StartCalendarInterval</key>
  <dict><key>Hour</key><integer>23</integer><key>Minute</key><integer>0</integer></dict>
  <key>StandardOutPath</key><string>$PROJECT/backups/backup.log</string>
  <key>StandardErrorPath</key><string>$PROJECT/backups/backup.log</string>
</dict>
</plist>
EOF

launchctl bootstrap "gui/$(id -u)" "$PLIST"
echo "Jadwal backup terpasang: setiap hari 23.00 -> $PROJECT/backups (log: backups/backup.log)"
