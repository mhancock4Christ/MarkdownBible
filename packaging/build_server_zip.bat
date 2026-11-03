@echo off
setlocal EnableExtensions

set "SCRIPT_DIR=%~dp0"
set "ROOT_DIR=%SCRIPT_DIR%.."
for %%I in ("%ROOT_DIR%") do set "ROOT_DIR=%%~fI"

if exist "%ROOT_DIR%\.venv\Scripts\python.exe" (
    set "PYTHON=%ROOT_DIR%\.venv\Scripts\python.exe"
) else (
    where python >nul 2>nul
    if errorlevel 1 (
        echo ERROR: Python was not found. Install Python or create the project .venv.
        pause
        exit /b 1
    )
    set "PYTHON=python"
)

"%PYTHON%" "%SCRIPT_DIR%build_server_zip.py" %*
set "BUILD_RESULT=%ERRORLEVEL%"

if not "%BUILD_RESULT%"=="0" (
    echo.
    echo ERROR: Server deployment ZIP build failed.
    pause
    exit /b %BUILD_RESULT%
)

echo.
echo Server deployment ZIP build complete.
echo See the output path above.
pause
exit /b 0
