@echo off
setlocal EnableExtensions
title Bible Study EXE Builder

set "SCRIPT_DIR=%~dp0"
pushd "%SCRIPT_DIR%" || exit /b 1

set "VENV_PYTHON=.venv\Scripts\python.exe"
set "VENV_PIP=.venv\Scripts\pip.exe"
set "VENV_PYINSTALLER=.venv\Scripts\pyinstaller.exe"
set "APP_NAME=Bible_Study"
set "PORTABLE_DIR=MarkdownBible-Portable"
set "ZIP_PATH=%SCRIPT_DIR%dist\Bible_Study.zip"

echo ====================================================
echo          BUILDING BIBLE STUDY PORTABLE EXE
echo ====================================================
echo.

if not exist "%VENV_PYTHON%" (
    echo [ERROR] Virtual environment not found at .venv\
    goto :build_error
)
if not exist "main_Local.py" (
    echo [ERROR] main_Local.py was not found.
    goto :build_error
)
if not exist "icon.ico" (
    echo [ERROR] icon.ico was not found.
    goto :build_error
)
if not exist "templates\" (
    echo [ERROR] templates folder was not found.
    goto :build_error
)
if not exist "static\" (
    echo [ERROR] static folder was not found.
    goto :build_error
)
if not exist "kjv.sqlite" (
    echo [ERROR] kjv.sqlite was not found; the distributable ZIP requires it.
    goto :build_error
)

echo [1/4] Stopping any running copy of this app...
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference = 'Stop'; $targets = @('dist\main_Local.exe', 'dist\Bible_Study.exe', 'MarkdownBible-Portable\Bible_Study.exe', 'MarkdownBible-Portable\MarkdownBible.exe') | ForEach-Object { [IO.Path]::GetFullPath($_) }; $matches = Get-CimInstance Win32_Process | Where-Object { $_.ExecutablePath -and $targets -contains [IO.Path]::GetFullPath($_.ExecutablePath) }; foreach ($process in $matches) { Stop-Process -Id $process.ProcessId -Force -ErrorAction Stop; Write-Output ('Stopped process {0} ({1})' -f $process.ProcessId, $process.ExecutablePath) }"
if errorlevel 1 (
    echo [ERROR] Could not stop a running app process. Close it and retry.
    goto :build_error
)

echo.
echo [2/4] Checking PyInstaller...
"%VENV_PIP%" show pyinstaller >nul 2>&1
if errorlevel 1 (
    echo PyInstaller not found in .venv. Installing it now...
    "%VENV_PIP%" install pyinstaller
    if errorlevel 1 goto :build_error
) else (
    echo PyInstaller is ready in .venv.
)

if not exist "dist\" mkdir "dist"
if not exist "build\Bible_Study\" mkdir "build\Bible_Study"

echo.
echo [3/4] Compiling %APP_NAME%.exe...
"%VENV_PYINSTALLER%" --noconfirm --clean --onefile --windowed --name "%APP_NAME%" --distpath "dist" --workpath "build\Bible_Study" --specpath "build\Bible_Study" --icon="%SCRIPT_DIR%icon.ico" --add-data "%SCRIPT_DIR%icon.ico;." --add-data "%SCRIPT_DIR%templates;templates" --add-data "%SCRIPT_DIR%static;static" "%SCRIPT_DIR%main_Local.py"
if errorlevel 1 (
    echo [ERROR] PyInstaller compilation failed.
    goto :build_error
)
if not exist "dist\%APP_NAME%.exe" (
    echo [ERROR] Build did not produce dist\%APP_NAME%.exe.
    goto :build_error
)

echo.
echo [4/4] Preparing the portable folder and ZIP...
if not exist "%PORTABLE_DIR%\" mkdir "%PORTABLE_DIR%"
copy /Y "dist\%APP_NAME%.exe" "%PORTABLE_DIR%\%APP_NAME%.exe" >nul
if errorlevel 1 (
    echo [ERROR] Could not copy the executable to %PORTABLE_DIR%.
    goto :build_error
)
copy /Y "kjv.sqlite" "%PORTABLE_DIR%\kjv.sqlite" >nul
if errorlevel 1 (
    echo [ERROR] Could not copy kjv.sqlite to %PORTABLE_DIR%.
    goto :build_error
)

powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference = 'Stop'; Set-Location -LiteralPath '%SCRIPT_DIR%%PORTABLE_DIR%'; Compress-Archive -LiteralPath 'Bible_Study.exe','kjv.sqlite' -DestinationPath '%ZIP_PATH%' -Force"
if errorlevel 1 (
    echo [ERROR] Could not create dist\Bible_Study.zip.
    goto :build_error
)

echo.
echo ====================================================
echo SUCCESS
echo Executable: %SCRIPT_DIR%dist\%APP_NAME%.exe
echo ZIP package: %ZIP_PATH%
echo Portable folder: %SCRIPT_DIR%%PORTABLE_DIR%\
echo The ZIP contains %APP_NAME%.exe and kjv.sqlite.
echo ====================================================
popd
exit /b 0

:build_error
echo.
echo Build failed. See the error above.
popd
exit /b 1
