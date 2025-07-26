#!/bin/bash

echo "🎨 Corrigindo layout da aplicação Docker..."
echo "==========================================="

# 1. Atualizar configuração do Nginx
echo "🔧 Atualizando configuração do Nginx..."
sudo cp /var/www/html/oficina.local.conf /etc/nginx/sites-available/oficina.local

# 2. Testar configuração do Nginx
echo "✅ Testando configuração do Nginx..."
if sudo nginx -t; then
    echo "✅ Configuração válida"
    sudo systemctl reload nginx
    echo "✅ Nginx recarregado"
else
    echo "❌ Erro na configuração do Nginx"
    exit 1
fi

# 3. Verificar se aplicação está servindo arquivos estáticos
echo ""
echo "🔍 Verificando arquivos estáticos..."
echo "Testando CSS:"
curl -I http://localhost:8080/css/custom.css 2>/dev/null | head -2

echo "Testando JS:"
curl -I http://localhost:8080/js/main.js 2>/dev/null | head -2

# 4. Verificar se Express está configurado para servir arquivos estáticos
echo ""
echo "📋 Verificando configuração do Express..."
cd /var/www/oficina-docker

# Verificar se existe middleware para arquivos estáticos no index.ts
if grep -q "express.static" src/index.ts; then
    echo "✅ Express.static configurado"
else
    echo "⚠️ Express.static pode não estar configurado"
    echo "Verificando arquivo index.ts..."
    grep -n "static\|css\|js" src/index.ts || echo "Nenhuma configuração de arquivos estáticos encontrada"
fi

# 5. Verificar estrutura de arquivos
echo ""
echo "📁 Verificando estrutura de arquivos CSS/JS..."
ls -la css/ 2>/dev/null || echo "❌ Diretório css/ não encontrado"
ls -la js/ 2>/dev/null || echo "❌ Diretório js/ não encontrado"
ls -la styles/ 2>/dev/null || echo "❌ Diretório styles/ não encontrado"

# 6. Testar aplicação diretamente
echo ""
echo "🌐 Testando aplicação..."
echo "Direto Docker (8080):"
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:8080

echo "Via Nginx (oficina.local):"
curl -s -o /dev/null -w "Status: %{http_code}\n" http://oficina.local

# 7. Verificar logs da aplicação
echo ""
echo "📋 Últimos logs da aplicação:"
sudo docker compose logs --tail=10 oficina-app

echo ""
echo "🔧 SOLUÇÕES POSSÍVEIS:"
echo "======================"
echo "1. Se CSS/JS não carregam:"
echo "   - Verificar se Express serve arquivos estáticos"
echo "   - Verificar MIME types no Nginx"
echo ""
echo "2. Para forçar reload:"
echo "   sudo systemctl reload nginx"
echo "   sudo docker compose restart oficina-app"
echo ""
echo "3. Para verificar arquivos específicos:"
echo "   curl -I http://localhost:8080/css/custom.css"
echo "   curl -I http://localhost:8080/js/main.js"
echo ""
echo "4. Para ver logs em tempo real:"
echo "   sudo docker compose logs -f oficina-app"
