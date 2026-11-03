@echo off
setlocal
cd /d "%~dp0"

if exist "%~dp0\BibleStudyApp.exe" (
    start "" "%~dp0\BibleStudyApp.exe"
) else (
    echo BibleStudyApp.exe was not found in this folder.
    echo Copy the packaged build into this directory and run again.
    pause
)

exit /b 0
