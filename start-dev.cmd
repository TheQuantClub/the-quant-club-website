@echo off
set "PATH=C:\Users\abhin\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin;C:\Users\abhin\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback;%PATH%"
cd /d "%~dp0"
call pnpm.cmd dev
