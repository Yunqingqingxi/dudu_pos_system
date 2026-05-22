@echo off
echo ====================================
echo   嘟嘟 POS 系统 - 启动中...
echo ====================================

echo.
echo [1/2] 启动后端服务 (Python FastAPI)...
start "嘟嘟POS-后端" cmd /c "cd /d %~dp0backend && python -m uvicorn main:app --port 8000 --host 0.0.0.0"

echo [2/2] 启动前端服务 (React + Vite)...
start "嘟嘟POS-前端" cmd /c "cd /d %~dp0frontend && npm run dev"

echo.
echo 等待服务启动...
timeout /t 5 /nobreak >nul

echo.
echo ====================================
echo   启动完成!
echo   前端: http://localhost:5173
echo   后端: http://localhost:8000
echo   API文档: http://localhost:8000/docs
echo ====================================
echo.
echo 按任意键退出...
pause >nul
