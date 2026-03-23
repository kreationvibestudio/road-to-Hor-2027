@echo off
setlocal
set "NODE_DIR=%~dp0tools\node-v22.14.0-win-x64"
if not exist "%NODE_DIR%\node.exe" (
  echo Node not found at "%NODE_DIR%\node.exe"
  exit /b 1
)
set "PATH=%NODE_DIR%;%PATH%"
call "%NODE_DIR%\npm.cmd" %*
