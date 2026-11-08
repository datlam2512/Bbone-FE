@echo off
setlocal
cd /d "%~dp0"
if not exist node_modules (
    call npm.cmd ci
    if errorlevel 1 goto failed
)
call npm.cmd run dev
exit /b %ERRORLEVEL%
:failed
echo Could not install frontend dependencies.
pause
exit /b 1
