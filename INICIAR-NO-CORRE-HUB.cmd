@echo off
title NO CORRE HUB
set "PATH=C:\Program Files\nodejs;%PATH%"
cd /d "%~dp0"
echo.
echo Iniciando o NO CORRE HUB...
echo Aguarde alguns segundos. O navegador sera aberto automaticamente.
echo Para encerrar o sistema, feche esta janela.
echo.
start "" /B "C:\Program Files\nodejs\node.exe" node_modules\next\dist\bin\next dev
timeout /t 7 /nobreak >nul
start "" http://localhost:3000
echo.
echo NO CORRE HUB aberto em http://localhost:3000
echo Mantenha esta janela aberta enquanto estiver usando o sistema.
pause
