#!/usr/bin/env bash

# Enhanced startup script with tunnel retry mechanism
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
MONITOR_PID=""

cleanup() {
  echo ""
  echo "Shutting down..."
  
  # Kill all processes including monitor
  for pid in "$MONITOR_PID" "$BACKEND_TUNNEL_PID" "$FRONTEND_TUNNEL_PID" "$BACKEND_PID" "$FRONTEND_PID"; do
    if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
      kill "$pid" 2>/dev/null || true
    fi
  done
  
  # Wait a moment for clean shutdown
  sleep 2
  
  # Force kill if still running
  for pid in "$MONITOR_PID" "$BACKEND_TUNNEL_PID" "$FRONTEND_TUNNEL_PID" "$BACKEND_PID" "$FRONTEND_PID"; do
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

# Function to start tunnel with retry
start_tunnel() {
  local port=$1
  local subdomain=$2
  local name=$3
  local url_var=$4
  
  echo "Starting $name tunnel at https://${subdomain}.loca.lt..."
  
  # Kill any existing tunnel for this subdomain
  local existing_tunnel=$(pgrep -f "localtunnel.*${subdomain}" || true)
  if [[ -n "$existing_tunnel" ]]; then
    echo "Killing existing $name tunnel..."
    kill $existing_tunnel 2>/dev/null || true
    sleep 2
  fi
  
  # Start new tunnel
  npx localtunnel --port "$port" --subdomain "$subdomain" > "/tmp/${name}_tunnel.log" 2>&1 &
  local tunnel_pid=$!
  
  # Wait for tunnel to establish - check both the process and the log output
  for i in {1..20}; do
    # Check if tunnel process died
    if ! kill -0 "$tunnel_pid" 2>/dev/null; then
      echo "❌ $name tunnel process died"
      cat "/tmp/${name}_tunnel.log" | tail -5
      return 1
    fi
    
    # Check if tunnel URL appears in log (indicates success)
    if grep -q "your url is:" "/tmp/${name}_tunnel.log" 2>/dev/null; then
      echo "✓ $name tunnel ready (PID: $tunnel_pid): https://${subdomain}.loca.lt"
      echo $tunnel_pid
      return 0
    fi
    
    sleep 1
  done
  
  echo "⚠️  $name tunnel may still be establishing..."
  echo $tunnel_pid
  return 0
}

# Start tunnels with initial attempt
BACKEND_TUNNEL_PID=$(start_tunnel "$BACKEND_PORT" "$BACKEND_SUBDOMAIN" "backend" "BACKEND_TUNNEL_PID")
FRONTEND_TUNNEL_PID=$(start_tunnel "$FRONTEND_PORT" "$FRONTEND_SUBDOMAIN" "frontend" "FRONTEND_TUNNEL_PID")

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
echo "  • Auto-reconnect enabled for tunnels"
echo "  • Tunnels will restart if disconnected"
echo "  • Check /tmp/backend_tunnel.log or /tmp/frontend_tunnel.log for tunnel status"
echo "  • Press Ctrl+C to stop all services"
echo "════════════════════════════════════════════════════════════"
echo

# Monitor and restart tunnels if needed
monitor_tunnels() {
  # Give tunnels time to fully establish before monitoring
  sleep 30
  
  while true; do
    # Check if backend server is still running
    if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
      echo "❌ Backend server stopped unexpectedly"
      break
    fi
    
    # Check if frontend server is still running
    if ! kill -0 "$FRONTEND_PID" 2>/dev/null; then
      echo "❌ Frontend server stopped unexpectedly"
      break
    fi
    
    # Check and restart backend tunnel if needed (more lenient check)
    if [[ -n "$BACKEND_TUNNEL_PID" ]]; then
      if ! kill -0 "$BACKEND_TUNNEL_PID" 2>/dev/null; then
        echo "🔄 Backend tunnel died, restarting..."
        BACKEND_TUNNEL_PID=$(start_tunnel "$BACKEND_PORT" "$BACKEND_SUBDOMAIN" "backend" "BACKEND_TUNNEL_PID")
      else
        # Only restart if both curl attempts fail
        if ! curl -s --max-time 5 "$BACKEND_TUNNEL_URL/api/health" >/dev/null 2>&1; then
          sleep 5
          if ! curl -s --max-time 5 "$BACKEND_TUNNEL_URL/api/health" >/dev/null 2>&1; then
            echo "🔄 Backend tunnel unresponsive after 2 attempts, restarting..."
            kill "$BACKEND_TUNNEL_PID" 2>/dev/null || true
            sleep 2
            BACKEND_TUNNEL_PID=$(start_tunnel "$BACKEND_PORT" "$BACKEND_SUBDOMAIN" "backend" "BACKEND_TUNNEL_PID")
          fi
        fi
      fi
    fi
    
    # Check and restart frontend tunnel if needed (more lenient check)
    if [[ -n "$FRONTEND_TUNNEL_PID" ]]; then
      if ! kill -0 "$FRONTEND_TUNNEL_PID" 2>/dev/null; then
        echo "🔄 Frontend tunnel died, restarting..."
        FRONTEND_TUNNEL_PID=$(start_tunnel "$FRONTEND_PORT" "$FRONTEND_SUBDOMAIN" "frontend" "FRONTEND_TUNNEL_PID")
      else
        # Only restart if both curl attempts fail
        if ! curl -s --max-time 5 "$FRONTEND_TUNNEL_URL" >/dev/null 2>&1; then
          sleep 5
          if ! curl -s --max-time 5 "$FRONTEND_TUNNEL_URL" >/dev/null 2>&1; then
            echo "🔄 Frontend tunnel unresponsive after 2 attempts, restarting..."
            kill "$FRONTEND_TUNNEL_PID" 2>/dev/null || true
            sleep 2
            FRONTEND_TUNNEL_PID=$(start_tunnel "$FRONTEND_PORT" "$FRONTEND_SUBDOMAIN" "frontend" "FRONTEND_TUNNEL_PID")
          fi
        fi
      fi
    fi
    
    # Check every 5 minutes (300 seconds)
    sleep 300
  done
  
  echo "One or more services stopped. Shutting down..."
  cleanup
}

# Start monitor in background
monitor_tunnels &
MONITOR_PID=$!

# Wait for monitor to finish (will only happen on error/shutdown)
wait $MONITOR_PID