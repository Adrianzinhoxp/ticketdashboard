@echo off
echo 🌐 INICIANDO DASHBOARD DE TICKETS
echo ================================
echo.
echo 📋 Navegando para pasta do dashboard...
cd dashboard
echo.
echo 📦 Verificando dependências...
if not exist node_modules (
    echo 📥 Instalando dependências...
    npm install
)
echo.
echo 🚀 Iniciando servidor do dashboard...
echo.
echo ✅ Dashboard será aberto em: https://adrianzinhoxp.github.io/dashboardtickets/
echo 💡 Pressione Ctrl+C para parar o servidor
echo.
npm start
pause
