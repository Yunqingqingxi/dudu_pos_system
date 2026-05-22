@echo off
chcp 65001 >nul 2>&1
cls

echo ============================================
echo   dudu POS - Full Build Pipeline
echo ============================================
echo.

cd /d "%~dp0"

echo [1/4] Building frontend...
cd frontend
call npm install --silent
call npm run build
cd ..
echo   Done.
echo.

echo [2/4] Building backend (PyInstaller)...
echo   This may take 1-2 minutes...
cd backend
if exist build rmdir /s /q build
if exist dist rmdir /s /q dist
pyinstaller --onefile --name dudu_pos --clean --noconfirm --hidden-import uvicorn.logging --hidden-import uvicorn.loops.auto --hidden-import uvicorn.protocols.http.auto --hidden-import uvicorn.protocols.websockets.auto --hidden-import uvicorn.lifespan.on --add-data "../frontend/dist;frontend/dist" main.py >nul 2>&1
cd ..
echo   Done.
echo.

echo [3/4] Building desktop launcher (Go)...
cd desktop
if exist embed rmdir /s /q embed
mkdir embed
copy /y "..\backend\dist\dudu_pos.exe" "embed\" >nul
set GOTOOLCHAIN=local
go build -ldflags="-s -w -H windowsgui" -o dudu_desktop.exe main.go >nul 2>&1
cd ..
echo   Done.
echo.

echo [4/4] Creating release package...
if exist release rmdir /s /q release
mkdir release
copy /y "desktop\dudu_desktop.exe" "release\嘟嘟POS.exe" >nul
copy /y "README.md" "release\" >nul
(
echo @echo off
echo chcp 65001 ^>nul 2^>^&1
echo taskkill /f /im 嘟嘟POS.exe ^>nul 2^>^&1
echo taskkill /f /im dudu_pos.exe ^>nul 2^>^&1
echo echo 嘟嘟 POS 已停止
echo pause
) > "release\stop.bat"
echo   Done.
echo.

echo ============================================
echo   Build complete!
echo.
echo   release\嘟嘟POS.exe (single file, ~54 MB)
echo.
echo   Double-click to run. No dependencies!
echo ============================================
pause