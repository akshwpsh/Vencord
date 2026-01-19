@echo off
setlocal
pushd "%~dp0"
git up
set "EXITCODE=%ERRORLEVEL%"
popd
exit /b %EXITCODE%
