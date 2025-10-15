#!/usr/bin/env bash

# Simplified startup script - more stable, less aggressive monitoring
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

BACKEND_PORT=1337
FRONTEND_PORT=8000

BACKEND_SUBDOMAIN="buggy-racing-api"
FRONTEND_SUBDOMAIN="buggy-racing-tournament"

BACKEND_TUNNEL_URL="https://${BACKEND_SUBDOMAIN}.loca.lt"
FRONTEND_TUNNEL_URL="https://${FRONTEND_SUBDOMAIN}.loca.lt"

# Track PIDs for cleanup
BACKEND_PID=""
FRONTEND_PID=""
BACKEND_TUNNEL_PID=""
FRONTEND_TUNNEL_PID=""

cleanup() {
  echo ""
  echo "Shutting down..."
  
  # Kill all processes
  for pid in "$BACKEND_TUNNEL_PID" "$FRONTEND_TUNNEL_PID" "$BACKEND_PID" "$FRONTEND_PID"; do
    if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
      kill "$pid" 2>/dev/null || true
    fi
  done
  
  # Wait a moment for clean shutdown
  sleep 2
  
  # Force kill if still running
  for pid in "$BACKEND_TUNNEL_PID" "$FRONTEND_TUNNEL_PID" "$BACKEND_PID" "$FRONTEND_PID"; do
    if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
      kill -9 "$pid" 2>/dev/null || true
    fi
  done
  
  echo "Cleanup complete."
  exit 0
}

trap cleanup EXIT INT TERM

# Check required commands
for cmd in node npm python3 npx curl; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Error: Required command '$cmd' not found" >&2
    exit 1
  fi
done

# Install backend dependencies if needed
if [[ ! -d "$BACKEND_DIR/node_modules" ]]; then
  echo "Installing backend dependencies..."
  npm install --prefix "$BACKEND_DIR"
fi

# Kill any processes using the specified port
kill_port() {
  local port=$1
  local pids=$(lsof -ti:$port 2>/dev/null || true)
  
  if [[ -n "$pids" ]]; then
    echo "Killing existing processes on port $port..."
    echo "$pids" | xargs kill -9 2>/dev/null || true
    sleep 1  # Give time for port to be released
    echo "✓ Port $port cleared"
  fi
}

# Check if ports are available
check_port() {
  local port=$1
  if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
    return 1
  fi
  return 0
}

# Kill any existing servers before starting new ones
echo "Checking for existing servers..."
kill_port "$BACKEND_PORT"
kill_port "$FRONTEND_PORT"

# Double-check ports are now available
if ! check_port "$BACKEND_PORT"; then
  echo "Warning: Port $BACKEND_PORT still in use after cleanup attempt" >&2
fi

if ! check_port "$FRONTEND_PORT"; then
  echo "Warning: Port $FRONTEND_PORT still in use after cleanup attempt" >&2
fi

# Start backend server
echo "Starting backend server on port $BACKEND_PORT..."
cd "$BACKEND_DIR"
npm start > /dev/null 2>&1 &
BACKEND_PID=$!

# Wait for backend to be ready
echo "Waiting for backend to start..."
for i in {1..30}; do
  if curl -s "http://localhost:$BACKEND_PORT/api/health" >/dev/null 2>&1; then
    echo "✓ Backend server ready (PID: $BACKEND_PID)"
    break
  fi
  sleep 1
done

# Start frontend server
echo "Starting frontend server on port $FRONTEND_PORT..."
cd "$FRONTEND_DIR"
python3 -m http.server "$FRONTEND_PORT" > /dev/null 2>&1 &
FRONTEND_PID=$!

# Wait for frontend to be ready
echo "Waiting for frontend to start..."
for i in {1..15}; do
  if curl -s "http://localhost:$FRONTEND_PORT/" >/dev/null 2>&1; then
    echo "✓ Frontend server ready (PID: $FRONTEND_PID)"
    break
  fi
  sleep 1
done

# Start backend localtunnel
echo "Starting backend tunnel at $BACKEND_TUNNEL_URL..."
npx localtunnel --port "$BACKEND_PORT" --subdomain "$BACKEND_SUBDOMAIN" &
BACKEND_TUNNEL_PID=$!

# Give tunnel time to establish
sleep 10

# Verify backend tunnel
echo "Verifying backend tunnel..."
if curl -s --max-time 10 "$BACKEND_TUNNEL_URL/api/health" >/dev/null 2>&1; then
  echo "✓ Backend tunnel ready: $BACKEND_TUNNEL_URL"
else
  echo "⚠️  Backend tunnel may take a moment to fully establish"
fi

# Start frontend localtunnel
echo "Starting frontend tunnel at $FRONTEND_TUNNEL_URL..."
npx localtunnel --port "$FRONTEND_PORT" --subdomain "$FRONTEND_SUBDOMAIN" &
FRONTEND_TUNNEL_PID=$!

# Give tunnel time to establish
sleep 10

# Verify frontend tunnel
echo "Verifying frontend tunnel..."
if curl -s --max-time 10 "$FRONTEND_TUNNEL_URL" >/dev/null 2>&1; then
  echo "✓ Frontend tunnel ready: $FRONTEND_TUNNEL_URL"
else
  echo "⚠️  Frontend tunnel may take a moment to fully establish"
fi

echo
echo "════════════════════════════════════════════════════════════"
echo "  🏁 Ultimate Buggy Racing Tournament System"
echo "════════════════════════════════════════════════════════════"
echo
echo "  Frontend:  $FRONTEND_TUNNEL_URL"
echo "  Backend:   $BACKEND_TUNNEL_URL"
echo "  API Health: $BACKEND_TUNNEL_URL/api/health"
echo
echo "  Local Frontend: http://localhost:$FRONTEND_PORT"
echo "  Local Backend:  http://localhost:$BACKEND_PORT"
echo
echo "════════════════════════════════════════════════════════════"
echo
echo "  💡 Tips:"
echo "  • Tunnels may take 15-30s to fully establish"
echo "  • If you get 503 errors, wait and refresh"
echo "  • Clear browser cache if issues persist"
echo
echo "  Press Ctrl+C to stop all services"
echo "════════════════════════════════════════════════════════════"
echo

# Monitor processes (simpler approach - just check if they're alive)
while true; do
  # Check if critical processes are still running
  if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
    echo "⚠️  Backend server stopped unexpectedly"
    break
  fi
  
  if ! kill -0 "$FRONTEND_PID" 2>/dev/null; then
    echo "⚠️  Frontend server stopped unexpectedly"
    break
  fi
  
  # Less aggressive monitoring - check every 60 seconds
  sleep 60
done

echo "One or more services stopped. Shutting down..."
cleanup
