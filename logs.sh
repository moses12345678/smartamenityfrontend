#!/usr/bin/env bash
set -euo pipefail

# Simple log viewer for the SmartAmenity frontend stack.
# Usage:
#   ./logs.sh                # tail app preview log (~/.manager-preview.log)
#   ./logs.sh once           # print last 200 lines of preview log then exit
#   ./logs.sh nginx-error    # tail nginx error log (needs sudo)
#   ./logs.sh nginx-access   # tail nginx access log (needs sudo)

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PREVIEW_LOG="${ROOT}/.manager-preview.log"

cmd="${1:-tail}"

case "$cmd" in
  tail)
    echo "Tailing preview log: ${PREVIEW_LOG}"
    tail -n 200 -F "$PREVIEW_LOG"
    ;;
  once)
    echo "Last 200 lines of preview log: ${PREVIEW_LOG}"
    tail -n 200 "$PREVIEW_LOG"
    ;;
  nginx-error)
    echo "Tailing nginx error log (sudo may be required)..."
    sudo tail -n 200 -F /var/log/nginx/error.log
    ;;
  nginx-access)
    echo "Tailing nginx access log (sudo may be required)..."
    sudo tail -n 200 -F /var/log/nginx/access.log
    ;;
  *)
    echo "Unknown option: $cmd"
    echo "Use: tail | once | nginx-error | nginx-access"
    exit 1
    ;;
esac
