@echo off
setlocal EnableExtensions EnableDelayedExpansion

set "SCRIPT_DIR=%~dp0"
set "ROOT_DIR=%SCRIPT_DIR%.."
for %%I in ("%ROOT_DIR%") do set "ROOT_DIR=%%~fI"
set "DIST_DIR=%ROOT_DIR%\dist\windows-portable"
set "BUILD_DIR=%ROOT_DIR%\build\windows-portable"
set "APP_NAME=BibleStudyApp"
set "ENTRY=%ROOT_DIR%\packaging\win_server_launcher.py"

if not exist "%ROOT_DIR%\.venv\Scripts\python.exe" (
    echo ERROR: Project virtual environment not found at %ROOT_DIR%\.venv\Scripts\python.exe
    echo Create the venv first, then run this script again.
    pause
    exit /b 1
)

call "%ROOT_DIR%\.venv\Scripts\activate.bat"

if not exist "%ROOT_DIR%\kjv.sqlite" (
    echo ERROR: kjv.sqlite not found in project root.
    pause
    exit /b 1
)

if not exist "%ROOT_DIR%\icon.ico" (
    echo ERROR: icon.ico not found in project root.
    pause
    exit /b 1
)

if not exist "%ROOT_DIR%\icon.png" (
    echo ERROR: icon.png not found in project root.
    pause
    exit /b 1
)

if not exist "%ROOT_DIR%\main.py" (
    echo ERROR: main.py not found in project root.
    pause
    exit /b 1
)

if not exist "%ROOT_DIR%\README.md" (
    echo ERROR: README.md not found in project root.
    pause
    exit /b 1
)

if not exist "%ROOT_DIR%\requirements.txt" (
    echo ERROR: requirements.txt not found in project root.
    pause
    exit /b 1
)

if not exist "%ROOT_DIR%\static\" (
    echo ERROR: static folder not found in project root.
    pause
    exit /b 1
)

if not exist "%ROOT_DIR%\templates\" (
    echo ERROR: templates folder not found in project root.
    pause
    exit /b 1
)

if exist "%DIST_DIR%" rd /s /q "%DIST_DIR%"
if exist "%BUILD_DIR%" rd /s /q "%BUILD_DIR%"

pyinstaller --noconfirm --windowed --onefile --icon "%ROOT_DIR%\icon.ico" --name "%APP_NAME%" --distpath "%DIST_DIR%" --workpath "%BUILD_DIR%" "%ENTRY%"
if errorlevel 1 (
    echo ERROR: PyInstaller failed.
    pause
    exit /b 1
)

if not exist "%DIST_DIR%\%APP_NAME%.exe" (
    echo ERROR: build did not produce %DIST_DIR%\%APP_NAME%.exe
    pause
    exit /b 1
)

mkdir "%DIST_DIR%\app_files" 2>nul
xcopy /E /I /Y "%ROOT_DIR%\static" "%DIST_DIR%\app_files\static" >nul
if errorlevel 1 goto :package_error
xcopy /E /I /Y "%ROOT_DIR%\templates" "%DIST_DIR%\app_files\templates" >nul
if errorlevel 1 goto :package_error
copy /Y "%ROOT_DIR%\kjv.sqlite" "%DIST_DIR%\app_files\kjv.sqlite" >nul
if errorlevel 1 goto :package_error
copy /Y "%ROOT_DIR%\main.py" "%DIST_DIR%\app_files\main.py" >nul
if errorlevel 1 goto :package_error
copy /Y "%ROOT_DIR%\icon.ico" "%DIST_DIR%\app_files\icon.ico" >nul
if errorlevel 1 goto :package_error
copy /Y "%ROOT_DIR%\icon.png" "%DIST_DIR%\app_files\icon.png" >nul
if errorlevel 1 goto :package_error
copy /Y "%ROOT_DIR%\README.md" "%DIST_DIR%\README.md" >nul
if errorlevel 1 goto :package_error
copy /Y "%ROOT_DIR%\requirements.txt" "%DIST_DIR%\requirements.txt" >nul
if errorlevel 1 goto :package_error
copy /Y "%ROOT_DIR%\packaging\run_app.bat" "%DIST_DIR%\run_app.bat" >nul
if errorlevel 1 goto :package_error

echo.
echo Build complete: %DIST_DIR%
echo Portable Windows app is ready in %DIST_DIR%
pause
exit /b 0

:package_error
echo ERROR: Failed to copy a required file into the portable package.
pause
exit /b 1
