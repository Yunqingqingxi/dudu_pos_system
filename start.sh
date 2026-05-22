#!/bin/bash
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "===================================="
echo "  dudu POS - starting..."
echo "===================================="
echo ""

mkdir -p "$SCRIPT_DIR/logs"

if [ ! -f "$SCRIPT_DIR/frontend/dist/index.html" ]; then
    echo "[0/2] Frontend not built. Building now..."
    cd "$SCRIPT_DIR/frontend"
    npm install --silent
    npm run build
    cd "$SCRIPT_DIR"
    echo ""
fi

echo "[1/2] Installing Python dependencies..."
cd "$SCRIPT_DIR/backend"
pip install -r requirements.txt -q --break-system-packages 2>/dev/null || pip install -r requirements.txt -q
python seed.py
echo ""

echo "[2/2] Starting server..."
echo ""
echo "===================================="
echo "  Ready! Open http://localhost:8000"
echo "  API docs: http://localhost:8000/docs"
echo "  Logs: logs/server.log"
echo "===================================="
echo ""
python -m uvicorn main:app --port 8000 --host 0.0.0.0