#!/bin/bash
echo "===================================="
echo "  嘟嘟 POS 系统 - 启动中..."
echo "===================================="
echo ""
echo "[1/2] 启动后端服务 (Python FastAPI)..."
cd "$(dirname "$0")/backend"
pip install -r requirements.txt -q
python -m uvicorn main:app --port 8000 --host 0.0.0.0 &
BACKEND_PID=$!

echo "[2/2] 启动前端服务 (React + Vite)..."
cd "$(dirname "$0")/frontend"
npm install --silent
npm run dev &
FRONTEND_PID=$!

sleep 4
echo ""
echo "===================================="
echo "  启动完成!"
echo "  前端: http://localhost:5173"
echo "  后端: http://localhost:8000"
echo "  API文档: http://localhost:8000/docs"
echo "===================================="
echo ""
echo "按 Ctrl+C 停止所有服务"
wait
