@echo off
setlocal EnableExtensions EnableDelayedExpansion

set "SCRIPT_DIR=%~dp0"
set "ROOT_DIR=%SCRIPT_DIR%.."
for %%I in ("%ROOT_DIR%") do set "ROOT_DIR=%%~fI"
set "APK_OUT=%ROOT_DIR%\dist\android-apk"
set "BUILD_DIR=%ROOT_DIR%\build\android-apk"

if not exist "%ROOT_DIR%\.venv\Scripts\python.exe" (
    echo ERROR: Project virtual environment not found at %ROOT_DIR%\.venv\Scripts\python.exe
    echo Create the venv first, then run this script again.
    pause
    exit /b 1
)

if not exist "%ANDROID_HOME%" (
    echo ERROR: ANDROID_HOME is not set.
    echo Install Android Studio and set ANDROID_HOME or configure the Android SDK location.
    pause
    exit /b 1
)

if not exist "%ANDROID_HOME%\platform-tools\adb.exe" (
    echo ERROR: Android SDK platform-tools not found in %ANDROID_HOME%.
    pause
    exit /b 1
)

if exist "%APK_OUT%" rd /s /q "%APK_OUT%"
if exist "%BUILD_DIR%" rd /s /q "%BUILD_DIR%"
mkdir "%APK_OUT%" 2>nul

call "%ROOT_DIR%\.venv\Scripts\activate.bat"

python -m pip install --upgrade pip
python -m pip install buildozer

if not exist "%ROOT_DIR%\android" mkdir "%ROOT_DIR%\android"
if not exist "%ROOT_DIR%\android\buildozer.spec" (
    copy /Y "%SCRIPT_DIR%\template_buildozer.spec" "%ROOT_DIR%\android\buildozer.spec" >nul
)

pushd "%ROOT_DIR%\android"
call buildozer android debug
popd

if exist "%ROOT_DIR%\android\.buildozer\android\platform\build\dists\*.apk" (
    for /r "%ROOT_DIR%\android\.buildozer\android\platform\build\dists" %%F in (*.apk) do copy /Y "%%F" "%APK_OUT%\"
) else (
    echo ERROR: no APK was produced by buildozer.
    pause
    exit /b 1
)

echo.
echo Android APK build complete: %APK_OUT%
pause
exit /b 0
