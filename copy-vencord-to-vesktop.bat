@echo off
setlocal
rem Copy Vencord build outputs to a Vesktop-compatible folder

set "REPO_ROOT=%~dp0"
set "SRC=%REPO_ROOT%dist"
set "DEST=%REPO_ROOT%VencordBuild"

echo Running build (pnpm build)...
pushd "%REPO_ROOT%"
call pnpm build
set "BUILD_EXIT=%ERRORLEVEL%"
popd
if not "%BUILD_EXIT%"=="0" (
  echo [ERROR] Build failed with exit code %BUILD_EXIT%
  exit /b %BUILD_EXIT%
)

if not exist "%SRC%" (
  echo [ERROR] dist folder not found: %SRC%
  exit /b 1
)

if not exist "%DEST%" mkdir "%DEST%"

copy /y "%SRC%\vencordDesktopMain.js" "%DEST%\vencordDesktopMain.js" >nul
copy /y "%SRC%\vencordDesktopPreload.js" "%DEST%\vencordDesktopPreload.js" >nul
copy /y "%SRC%\vencordDesktopRenderer.js" "%DEST%\vencordDesktopRenderer.js" >nul
copy /y "%SRC%\vencordDesktopRenderer.css" "%DEST%\vencordDesktopRenderer.css" >nul

if not exist "%DEST%\package.json" (
  echo {}>"%DEST%\package.json"
)

echo Done. Vencord files copied to: %DEST%
