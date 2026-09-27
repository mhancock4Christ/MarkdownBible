@echo off
title Bible App Compiler (.venv mode)
echo ====================================================
echo      BUILDING BIBLE APP PORTABLE EXE VIA .VENV       
echo ====================================================
echo.

:: Path to the virtual environment python and pip
set VENV_PYTHON=.venv\Scripts\python.exe
set VENV_PIP=.venv\Scripts\pip.exe
set VENV_PYINSTALLER=.venv\Scripts\pyinstaller.exe

:: Check if the virtual environment folder actually exists
if not exist "%VENV_PYTHON%" (
    echo [ERROR] Virtual environment not found at .venv\
    echo Please make sure you have a .venv folder in this directory.
    echo.
    pause
    exit /b 1
)

:: Ensure PyInstaller is installed inside the virtual environment
echo [1/4] Checking for PyInstaller inside .venv...
"%VENV_PIP%" show pyinstaller >nul 2>&1
if %errorlevel% neq 0 (
    echo PyInstaller not found in .venv. Installing it now...
    "%VENV_PIP%" install pyinstaller
) else (
    echo PyInstaller is ready in .venv.
)
echo.

:: Run PyInstaller using the virtual environment bundle
echo [2/4] Compiling main.py using .venv binaries...
"%VENV_PYINSTALLER%" --onefile --add-data "templates;templates" --add-data "static;static" main_Local.py
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] PyInstaller compilation failed!
    pause
    exit /b %errorlevel%
)
echo.

:: Setup the Portable Distribution Folder
echo [3/4] Creating the portable distribution folder...
if not exist "MarkdownBible-Portable" mkdir "MarkdownBible-Portable"

:: Copy the compiled EXE and the SQLite database into the folder
echo [4/4] Copying assets into distribution folder...
copy /Y "dist\main.exe" "MarkdownBible-Portable\MarkdownBible.exe" >nul
if exist "kjv.sqlite" (
    copy /Y "kjv.sqlite" "MarkdownBible-Portable\kjv.sqlite" >nul
    echo Data file integrated successfully.
) else (
    echo [WARNING] kjv.sqlite not found in this folder! Remember to place it next to MarkdownBible.exe manually.
)

echo.
echo ====================================================
echo SUCCESS! Your portable app is ready in:
echo "\MarkdownBible-Portable\"
echo ====================================================
echo.
pause
