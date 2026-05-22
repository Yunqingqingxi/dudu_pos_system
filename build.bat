@echo off
chcp 65001 >nul 2>&1
cls

echo ============================================
echo   dudu POS - Full Build Pipeline
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

echo [2/3] Building standalone executable...
echo   This may take 1-2 minutes...
cd backend
if exist build rmdir /s /q build
if exist dist rmdir /s /q dist
pyinstaller --onefile --name dudu_pos --clean --noconfirm --hidden-import uvicorn.logging --hidden-import uvicorn.loops.auto --hidden-import uvicorn.protocols.http.auto --hidden-import uvicorn.protocols.websockets.auto --hidden-import uvicorn.lifespan.on --add-data "../frontend/dist;frontend/dist" main.py >nul 2>&1
cd ..
echo   Done.
echo.

echo [3/3] Creating release package...
if exist release rmdir /s /q release
mkdir release
copy /y "backend\dist\dudu_pos.exe" "release\" >nul
copy /y "stop.bat" "release\" >nul`r`ncopy /y "README.md" "release\" >nul`r`ncopy /y "stop.bat" "release\" >nul`r`ncopy /y "..\electron\start.vbs" "release\" >nul 2>nul

(
echo @echo off
echo chcp 65001 ^>nul 2^>^&1
echo cls
echo echo ====================================
echo echo   dudu POS
echo echo ====================================
echo echo.
echo echo Starting server...
echo start "" "%%~dp0dudu_pos.exe"
echo echo.
echo echo Waiting for server...
echo timeout /t 4 /nobreak ^>nul
echo start http://localhost:8000
echo echo.
echo echo =========================================
echo echo   Open http://localhost:8000
echo echo   Logs: logs\server.log
echo echo   Close this window to stop server.
echo echo =========================================
echo pause
) > "release\start.bat"

echo.
echo ============================================
echo   Build complete!
echo   Release: release\dudu_pos.exe (single file)
echo.
echo   Copy the entire release\ folder to any
echo   Windows PC and double-click start.bat.
echo   No Python installation needed!
echo ============================================
pause