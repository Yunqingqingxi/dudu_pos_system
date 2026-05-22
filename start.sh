#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "===================================="
echo "  dudu POS - starting..."
echo "===================================="
echo ""

echo "[1/2] Starting backend (Python FastAPI)..."
cd "$SCRIPT_DIR/backend"
pip install -r requirements.txt -q --break-system-packages 2>/dev/null || pip install -r requirements.txt -q
python -m uvicorn main:app --port 8000 --host 0.0.0.0 &
BACKEND_PID=$!

echo "[2/2] Starting frontend (React + Vite)..."
cd "$SCRIPT_DIR/frontend"
npm install --silent 2>/dev/null || true
npm run dev &
FRONTEND_PID=$!

sleep 4
echo ""
echo "===================================="
echo "  Ready!"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:8000"
echo "  API docs: http://localhost:8000/docs"
echo "===================================="
echo ""
echo "Press Ctrl+C to stop all services"
wait