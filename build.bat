@echo off
chcp 65001 >nul 2>&1
cls

echo ============================================
echo   嘟嘟 POS - Full Build Pipeline
echo ============================================
echo.

cd /d "%~dp0"

echo [1/4] Building frontend (+ icon tools)...
cd frontend
if not exist node_modules\sharp (
    call npm install --silent
)
call npm run build
cd ..
echo   Done.
echo.

echo [2/4] Generating icon from SVG...
cd frontend
node -e "const{writeFileSync,readFileSync}=require('fs');const s=require('sharp');(async()=>{const svg=readFileSync('../logo.svg');const g=await Promise.all([16,32,48,64,128,256].map(z=>s(svg).resize(z,z).png().toBuffer()));const h=Buffer.alloc(6);h.writeUInt16LE(0,0);h.writeUInt16LE(1,2);h.writeUInt16LE(6,4);const d=Buffer.alloc(96);let o=102;for(let i=0;i<6;i++){const z=[16,32,48,64,128,256][i],e=i*16,w=z>=256?0:z;d.writeUInt8(w,e);d.writeUInt8(w,e+1);d.writeUInt16LE(1,e+4);d.writeUInt16LE(32,e+6);d.writeUInt32LE(g[i].length,e+8);d.writeUInt32LE(o,e+12);o+=g[i].length}writeFileSync('../desktop/logo.ico',Buffer.concat([h,d,...g]))})()"
cd ..
echo   Done.
echo.

echo [3/4] Embedding Windows resources + building...
cd desktop
if exist "rsrc.syso" del rsrc.syso
rsrc -ico logo.ico -o rsrc.syso >nul 2>&1
set GOTOOLCHAIN=local
set GOPROXY=https://goproxy.cn,direct
go build -ldflags="-s -w -H windowsgui" -o dudu_desktop.exe .
if %ERRORLEVEL% neq 0 (
    if exist rsrc.syso del rsrc.syso
    echo   BUILD FAILED!
    cd ..
    pause
    exit /b 1
)
if exist rsrc.syso del rsrc.syso
cd ..
echo   Done.
echo.

echo [4/4] Creating release package...
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
echo   release\嘟嘟POS.exe
echo.
echo   Double-click to run. No dependencies!
echo ============================================
pause
