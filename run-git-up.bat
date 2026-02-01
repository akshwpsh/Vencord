@echo off
setlocal
pushd "%~dp0"
git fetch upstream
git pull --rebase --autostash upstream main
set "EXITCODE=%ERRORLEVEL%"
popd
exit /b %EXITCODE%
