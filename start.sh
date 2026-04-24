#!/bin/bash

# AI Funeral & Memorial Creator - Start Script
# This script sets up and starts the complete application

set -e

echo "=========================================="
echo "  AI Funeral & Memorial Creator"
echo "  Starting Application..."
echo "=========================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Load .env
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
  echo -e "${GREEN}[OK]${NC} Environment variables loaded"
else
  echo -e "${RED}[ERROR]${NC} .env file not found!"
  exit 1
fi

BACKEND_PORT=${BACKEND_PORT:-3001}
FRONTEND_PORT=${FRONTEND_PORT:-3000}

# Function to kill processes on ports
cleanup_ports() {
  echo -e "${YELLOW}[CLEANUP]${NC} Checking for processes on ports $BACKEND_PORT and $FRONTEND_PORT..."

  for PORT in $BACKEND_PORT $FRONTEND_PORT; do
    PID=$(lsof -ti:$PORT 2>/dev/null || true)
    if [ -n "$PID" ]; then
      echo -e "${YELLOW}[CLEANUP]${NC} Killing process on port $PORT (PID: $PID)"
      kill -9 $PID 2>/dev/null || true
      sleep 1
    fi
  done

  echo -e "${GREEN}[OK]${NC} Ports cleaned up"
}

# Function to cleanup on exit
cleanup() {
  echo ""
  echo -e "${YELLOW}[SHUTDOWN]${NC} Stopping all services..."

  # Kill background processes
  if [ -n "$BACKEND_PID" ]; then
    kill $BACKEND_PID 2>/dev/null || true
  fi
  if [ -n "$FRONTEND_PID" ]; then
    kill $FRONTEND_PID 2>/dev/null || true
  fi

  # Kill any remaining processes on our ports
  for PORT in $BACKEND_PORT $FRONTEND_PORT; do
    PID=$(lsof -ti:$PORT 2>/dev/null || true)
    if [ -n "$PID" ]; then
      kill -9 $PID 2>/dev/null || true
    fi
  done

  echo -e "${GREEN}[OK]${NC} All services stopped. Goodbye!"
  exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# Clean up ports first
cleanup_ports

# Check PostgreSQL
echo -e "${BLUE}[DB]${NC} Checking PostgreSQL connection..."
if ! pg_isready -q 2>/dev/null; then
  echo -e "${YELLOW}[DB]${NC} Starting PostgreSQL..."
  brew services start postgresql@14 2>/dev/null || brew services start postgresql 2>/dev/null || {
    echo -e "${RED}[ERROR]${NC} Could not start PostgreSQL. Please start it manually."
    exit 1
  }
  sleep 2
fi
echo -e "${GREEN}[OK]${NC} PostgreSQL is running"

# Create database if not exists
echo -e "${BLUE}[DB]${NC} Setting up database..."
psql -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'funeral_memorial_db'" 2>/dev/null | grep -q 1 || \
  createdb -U postgres funeral_memorial_db 2>/dev/null || \
  psql postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'funeral_memorial_db'" | grep -q 1 || \
  createdb funeral_memorial_db 2>/dev/null || \
  echo -e "${YELLOW}[DB]${NC} Database may already exist, continuing..."

echo -e "${GREEN}[OK]${NC} Database ready"

# Install dependencies
echo -e "${BLUE}[DEPS]${NC} Installing server dependencies..."
npm install --silent 2>&1 | tail -1

echo -e "${BLUE}[DEPS]${NC} Installing client dependencies..."
cd client && npm install --silent 2>&1 | tail -1
cd ..

echo -e "${GREEN}[OK]${NC} Dependencies installed"

# Seed database
echo -e "${BLUE}[SEED]${NC} Seeding database with sample data..."
node server/seed.js
echo -e "${GREEN}[OK]${NC} Database seeded"

# Start backend with nodemon (auto-reload)
echo -e "${BLUE}[SERVER]${NC} Starting backend on port $BACKEND_PORT with auto-reload..."
npx nodemon --watch server --ext js,json server/index.js &
BACKEND_PID=$!

# Wait for backend to start
sleep 2

# Start frontend with Vite (hot reload built-in)
echo -e "${BLUE}[CLIENT]${NC} Starting frontend on port $FRONTEND_PORT with hot reload..."
cd client && npx vite --port $FRONTEND_PORT --host &
FRONTEND_PID=$!
cd ..

echo ""
echo "=========================================="
echo -e "${GREEN}  Application Started Successfully!${NC}"
echo "=========================================="
echo ""
echo -e "  Frontend: ${BLUE}http://localhost:$FRONTEND_PORT${NC}"
echo -e "  Backend:  ${BLUE}http://localhost:$BACKEND_PORT${NC}"
echo ""
echo -e "  Login:    ${YELLOW}admin@memorial.com${NC}"
echo -e "  Password: ${YELLOW}password123${NC}"
echo ""
echo -e "  ${GREEN}Auto-reload enabled for both frontend and backend${NC}"
echo -e "  Press ${RED}Ctrl+C${NC} to stop all services"
echo "=========================================="
echo ""

# Wait for background processes
wait
