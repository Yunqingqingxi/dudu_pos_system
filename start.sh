#!/bin/bash
set -e

echo "========================================"
echo "  嘟嘟 POS 系统"
echo "========================================"
echo ""

cd "$(dirname "$0")"

# Check if production build exists
if [ -f "release/嘟嘟POS" ]; then
    echo "启动生产版本..."
    ./release/嘟嘟POS &
    echo "嘟嘟 POS 已启动。"
    exit 0
fi

# Check if desktop build exists
if [ -f "desktop/dudu_desktop" ]; then
    echo "启动开发版本..."
    ./desktop/dudu_desktop &
    echo "嘟嘟 POS 已启动。"
    exit 0
fi

# Fallback: build from source
echo "未找到已编译版本，正在构建..."
echo ""

echo "[1/2] Building frontend..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install --registry https://registry.npmmirror.com
fi
npm run build
cd ..

echo "[2/2] Building and launching desktop app..."
if [ ! -d "desktop/frontend/dist" ]; then
    cp -r frontend/dist desktop/frontend/dist
fi

cd desktop
GOTOOLCHAIN=local GOPROXY=https://goproxy.cn,direct go build -ldflags="-s -w" -o dudu_desktop .
./dudu_desktop &
cd ..
echo "嘟嘟 POS 已启动。"