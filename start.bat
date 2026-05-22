@echo off
chcp 65001 >nul 2>&1
cls

echo ============================================
echo   嘟嘟 POS 系统
echo ============================================
echo.

cd /d "%~dp0"

if exist "release\嘟嘟POS.exe" (
    echo 启动生产版本...
    start "" "release\嘟嘟POS.exe"
    echo 嘟嘟 POS 已启动，请查看桌面窗口。
    timeout /t 2 >nul
    exit
)

if exist "desktop\dudu_desktop.exe" (
    echo 启动开发版本...
    start "" "desktop\dudu_desktop.exe"
    echo 嘟嘟 POS 已启动，请查看桌面窗口。
    timeout /t 2 >nul
    exit
)

echo 未找到已编译版本，正在构建...
echo.

echo [1/2] Building frontend...
cd frontend
if not exist node_modules (
    call npm install --registry https://registry.npmmirror.com
)
call npm run build
cd ..

echo [2/2] Building and launching desktop app...
if not exist "desktop\frontend\dist" (
    xcopy /e /i /q "frontend\dist" "desktop\frontend\dist" >nul
)

cd desktop
set GOTOOLCHAIN=local
set GOPROXY=https://goproxy.cn,direct
go build -ldflags="-s -w -H windowsgui" -o dudu_desktop.exe .
if %ERRORLEVEL% neq 0 (
    echo Build failed!
    cd ..
    pause
    exit /b 1
)
start "" dudu_desktop.exe
cd ..
echo 嘟嘟 POS 已启动，请查看桌面窗口。
timeout /t 2 >nul
