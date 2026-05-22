#!/bin/bash
set -e

echo "========================================"
echo "  嘟嘟 POS - Full Build Pipeline"
echo "========================================"
echo ""

cd "$(dirname "$0")"

echo "[1/3] Building frontend..."
cd frontend
npm install --silent
npm run build
cd ..
echo "  Done."
echo ""

echo "[2/3] Copying frontend to desktop embed..."
rm -rf desktop/frontend
cp -r frontend/dist desktop/frontend/dist
echo "  Done."
echo ""

echo "[3/3] Building desktop app (Go + WebView2)..."
cd desktop
GOTOOLCHAIN=local GOPROXY=https://goproxy.cn,direct go build -ldflags="-s -w" -o dudu_desktop .
if [ $? -ne 0 ]; then
    echo "  BUILD FAILED!"
    cd ..
    exit 1
fi
cd ..
echo "  Done."
echo ""

echo "Creating release package..."
rm -rf release
mkdir -p release
cp desktop/dudu_desktop release/嘟嘟POS
cp README.md release/
cp logo.svg release/
cp build.sh release/
cp build.bat release/
echo "  Done."
echo ""

echo "========================================"
echo "  Build complete!"
echo ""
echo "  release/嘟嘟POS"
echo "========================================"
