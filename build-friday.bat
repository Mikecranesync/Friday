@echo off
REM Friday Voice Assistant - Windows Build Script
REM Usage: build-friday.bat [development|preview]

setlocal enabledelayedexpansion

set PROFILE=%1
if "%PROFILE%"=="" set PROFILE=development

echo ========================================
echo   Friday Voice Assistant Builder
echo   Profile: %PROFILE%
echo ========================================
echo.

REM Step 1: Pre-build checks
echo [1/6] Running pre-build checks...
echo.

if not exist .env (
    echo ERROR: .env file not found
    echo Create .env with: GEMINI_API_KEY=your_key_here
    exit /b 1
)
echo ✓ .env file exists

npm list expo-dev-client >nul 2>&1
if errorlevel 1 (
    echo ERROR: expo-dev-client not installed
    echo Run: npm install
    exit /b 1
)
echo ✓ expo-dev-client installed
echo.

REM Step 2: Clean previous builds
echo [2/6] Cleaning previous builds...
if exist .expo rmdir /s /q .expo
if exist android\app\build rmdir /s /q android\app\build 2>nul
echo ✓ Build cache cleared
echo.

REM Step 3: Verify EAS CLI
echo [3/6] Verifying EAS CLI...
where eas >nul 2>&1
if errorlevel 1 (
    echo ERROR: EAS CLI not installed
    echo Install with: npm install -g eas-cli
    exit /b 1
)
echo ✓ EAS CLI found
echo.

REM Step 4: Show configuration
echo [4/6] Build configuration:
echo   Profile: %PROFILE%
echo   Platform: android
echo   Build Type: apk
echo   Dev Client: true
echo.

REM Step 5: Start build
echo [5/6] Starting EAS build...
echo This may take 10-20 minutes...
echo.

set /p BUILD_TYPE="Build locally (L) or on EAS cloud (C)? [L/c]: "
if "%BUILD_TYPE%"=="" set BUILD_TYPE=L

if /i "%BUILD_TYPE%"=="L" (
    echo Building locally...
    eas build --profile %PROFILE% --platform android --local
) else (
    echo Building on EAS cloud...
    eas build --profile %PROFILE% --platform android
)

REM Step 6: Post-build instructions
echo.
echo ========================================
echo   Build Complete!
echo ========================================
echo.
echo Next Steps:
echo 1. Install APK on device:
echo    adb install path\to\friday.apk
echo.
echo 2. Monitor logs during app launch:
echo    adb logcat ^| findstr /i "friday react error"
echo.
echo 3. If app crashes, get full logs:
echo    adb logcat -d ^> crash_log.txt
echo.
echo 4. For development builds, start Metro:
echo    npx expo start --dev-client
echo.
echo ✓ Build script completed successfully!
echo See BUILD_AND_DEBUG.md for detailed troubleshooting.
echo.

endlocal
