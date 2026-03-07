#!/usr/bin/env bash
set -euo pipefail

# Simple deployment helper for the SmartAmenity manager frontend.
# Usage:
#   ./deploy.sh up       # install deps, build, start preview server (default)
#   ./deploy.sh setup    # install deps only
#   ./deploy.sh build    # build static assets (manager)
#   ./deploy.sh start    # start preview server (assumes build exists)
#   ./deploy.sh stop     # stop preview server
#   ./deploy.sh restart  # stop then start
#   ./deploy.sh status   # show server status

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PORT="${PORT:-4000}"
PIDFILE="$ROOT/.manager-preview.pid"
LOGFILE="$ROOT/.manager-preview.log"
export NODE_ENV="${NODE_ENV:-production}"

cd "$ROOT"

have_proc() {
  local pid="$1"
  [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null
}

do_setup() {
  if command -v npm >/dev/null 2>&1; then
    if [[ -f package-lock.json ]]; then
      npm ci
    else
      npm install
    fi
  else
    echo "npm is required but not found on PATH." >&2
    exit 1
  fi
}

do_build() {
  npm run build:manager
}

do_start() {
  if [[ -f "$PIDFILE" ]] && have_proc "$(cat "$PIDFILE")"; then
    echo "Preview already running (pid $(cat "$PIDFILE")), skipping start."
    return 0
  fi

  if [[ ! -d "$ROOT/manager/dist" ]]; then
    echo "Build not found; building now..."
    do_build
  fi

  echo "Starting preview on 0.0.0.0:${PORT}..."
  npm run preview:manager -- --host 0.0.0.0 --port "$PORT" >"$LOGFILE" 2>&1 &
  echo $! >"$PIDFILE"
  echo "Started (pid $(cat "$PIDFILE")). Logs: $LOGFILE"
}

do_stop() {
  if [[ -f "$PIDFILE" ]]; then
    local pid
    pid=$(cat "$PIDFILE")
    if have_proc "$pid"; then
      echo "Stopping preview (pid $pid)..."
      kill "$pid"
      rm -f "$PIDFILE"
      return 0
    fi
  fi
  echo "Preview server not running."
}

do_status() {
  if [[ -f "$PIDFILE" ]] && have_proc "$(cat "$PIDFILE")"; then
    echo "Preview running (pid $(cat "$PIDFILE")) on port ${PORT}."
  else
    echo "Preview not running."
  fi
}

cmd="${1:-up}"

case "$cmd" in
  up)
    do_setup
    do_build
    do_stop || true
    do_start
    ;;
  setup) do_setup ;;
  build) do_build ;;
  start) do_start ;;
  stop) do_stop ;;
  restart)
    do_stop || true
    do_start
    ;;
  status) do_status ;;
  *)
    echo "Unknown command: $cmd" >&2
    exit 1
    ;;
esac
