@echo off
setlocal
cd /d "%~dp0"

set "NODE_OPTIONS=--openssl-legacy-provider"
call npm.cmd run bundle
if errorlevel 1 exit /b 1

call bundle exec jekyll build
if errorlevel 1 exit /b 1

start "" /b "C:\Ruby32-x64\bin\ruby.exe" -run -e httpd "%~dp0_site" -p 4001
echo Serving http://127.0.0.1:4001/
