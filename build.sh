#!/bin/bash
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "===================================="
echo "  dudu POS - Building release..."
echo "===================================="
echo ""

cd "$SCRIPT_DIR"

echo "[1/3] Building frontend..."
cd frontend
npm install --silent
npm run build
cd "$SCRIPT_DIR"
echo ""

echo "[2/3] Creating release folder..."
rm -rf release
mkdir -p release/backend
mkdir -p release/logs
mkdir -p release/frontend/dist

echo "[3/3] Copying files..."
cp backend/*.py release/backend/
cp backend/requirements.txt release/backend/
cp -r frontend/dist/* release/frontend/dist/
cp README.md release/
cp start.sh release/

cat > release/start.sh << 'STARTEOF'
#!/bin/bash
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "===================================="
echo "  dudu POS - starting..."
echo "===================================="
echo ""

mkdir -p "$SCRIPT_DIR/logs"

echo "[1/2] Installing Python dependencies..."
cd "$SCRIPT_DIR/backend"
pip install -r requirements.txt -q --break-system-packages 2>/dev/null || pip install -r requirements.txt -q
python seed.py
cd "$SCRIPT_DIR"

echo ""
echo "[2/2] Starting server..."
echo ""
echo "===================================="
echo "  Ready! Open http://localhost:8000"
echo "  API docs: http://localhost:8000/docs"
echo "  Logs: logs/server.log"
echo "===================================="
echo ""
cd "$SCRIPT_DIR/backend"
python -m uvicorn main:app --port 8000 --host 0.0.0.0
STARTEOF
chmod +x release/start.sh

echo ""
echo "===================================="
echo "  Build complete!"
echo "  Release folder: release/"
echo "  Run release/start.sh to launch."
echo "===================================="