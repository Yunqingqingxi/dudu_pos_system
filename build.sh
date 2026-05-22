#!/bin/bash
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "===================================="
echo "  Building dudu POS..."
echo "===================================="
echo ""
echo "[1/2] Installing frontend dependencies..."
cd "$SCRIPT_DIR/frontend"
npm install --silent
echo ""
echo "[2/2] Building frontend..."
npm run build
echo ""
echo "===================================="
echo "  Build complete! Run start.sh to launch."
echo "===================================="