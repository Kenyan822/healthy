#!/bin/bash
# 週次バッチ: 全チェーンのスクレイプ→seed→レポート
# launchdから実行される(ops/com.chenmeshi.batch-update.plist)
# ログ: data/reports/batch.log

set -u
export PATH="/Users/okubokenya/.nvm/versions/node/v20.19.5/bin:/usr/local/bin:/usr/bin:/bin"
cd "/Users/okubokenya/Desktop/個人開発/healthy" || exit 1

mkdir -p data/reports
{
  echo "===== batch start: $(date '+%Y-%m-%d %H:%M:%S') ====="
  npx tsx scripts/batch/update-all.ts
  echo "===== batch end: $(date '+%Y-%m-%d %H:%M:%S') exit=$? ====="
} >> data/reports/batch.log 2>&1
