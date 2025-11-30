@echo off
REM Friday Android Debug Script for Windows
REM Helps diagnose and fix common Android issues

echo =========================================
echo 🔧 FRIDAY ANDROID DEBUG HELPER
echo =========================================
echo.

:menu
echo Select an option:
echo 1) Clear all caches
echo 2) Start with Android optimizations
echo 3) Run diagnostics
echo 4) Quick fix (clear + start)
echo 5) Exit
echo.
set /p option="Enter option (1-5): "

if %option%==1 goto clear_caches
if %option%==2 goto start_android
if %option%==3 goto diagnostics
if %option%==4 goto quick_fix
if %option%==5 goto end
goto menu

:clear_caches
echo.
echo 📦 Clearing all caches...
echo   - Clearing Metro bundler cache...
call npx expo start --clear --tunnel 2>nul
timeout /t 2 /nobreak >nul
taskkill /F /IM node.exe 2>nul

echo   - Clearing temp files...
if exist .expo rd /s /q .expo
if exist node_modules\.cache rd /s /q node_modules\.cache

echo   - Reinstalling dependencies...
call npm install

echo ✅ Caches cleared!
echo.
pause
goto menu

:start_android
echo.
echo 🚀 Starting Friday with Android optimizations...
set NODE_OPTIONS=--max-old-space-size=4096
call npx expo start --android --clear
goto menu

:diagnostics
echo.
echo 🔍 Running diagnostics...
echo.
echo Expo CLI version:
call npx expo --version
echo.
echo React Native version:
call npm list react-native 2>nul | findstr "react-native@"
echo.
echo Reanimated version:
call npm list react-native-reanimated 2>nul | findstr "react-native-reanimated@"
echo.
echo Checking app.json configuration...
findstr /C:"newArchEnabled" app.json
if %errorlevel%==0 (
    echo   ⚠️  WARNING: newArchEnabled found - check if set to false
) else (
    echo   ✓ newArchEnabled not found
)
echo.
echo Checking for eas.json...
if exist eas.json (
    echo   ✓ EAS configuration found
) else (
    echo   ⚠️  No eas.json found
)
echo.
pause
goto menu

:quick_fix
echo.
echo 🚀 Running quick fix...
call :clear_caches
call :start_android
goto menu

:end
echo.
echo =========================================
echo ✨ Done!
echo =========================================
exit /b