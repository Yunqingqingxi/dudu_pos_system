@echo off
chcp 65001 >nul 2>&1
cls

echo ============================================
echo   嘟嘟 POS - Full Build Pipeline
echo ============================================
echo.

cd /d "%~dp0"

echo [1/3] Building frontend...
cd frontend
call npm install --silent
call npm run build
cd ..
echo   Done.
echo.

echo [2/3] Copying frontend to desktop embed...
if exist "desktop\frontend" rmdir /s /q "desktop\frontend"
xcopy /e /i /q "frontend\dist" "desktop\frontend\dist" >nul
echo   Done.
echo.

echo [3/3] Building desktop app (Go + WebView2)...
cd desktop
set GOTOOLCHAIN=local
set GOPROXY=https://goproxy.cn,direct
go build -ldflags="-s -w -H windowsgui" -o dudu_desktop.exe . >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo   BUILD FAILED!
    cd ..
    pause
    exit /b 1
)
cd ..
echo   Done.
echo.

echo Creating release package...
if exist release rmdir /s /q release
mkdir release
copy /y "desktop\dudu_desktop.exe" "release\嘟嘟POS.exe" >nul
copy /y "README.md" "release\" >nul
copy /y "logo.svg" "release\" >nul
copy /y "build.sh" "release\" >nul
(
echo @echo off
echo chcp 65001 ^>nul 2^>^&1
echo taskkill /f /im 嘟嘟POS.exe ^>nul 2^>^&1
echo echo 嘟嘟 POS 已停止
echo pause
) > "release\stop.bat"
echo   Done.
echo.

echo ============================================
echo   Build complete!
echo.
echo   release\嘟嘟POS.exe (single file, ~16 MB)
echo.
echo   Double-click to run. No dependencies!
echo ============================================
pause