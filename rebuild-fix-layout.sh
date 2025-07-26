#!/bin/bash

echo "🔄 Reconstruindo aplicação com correção de layout..."
echo "=================================================="

# 1. Ir para diretório Docker
cd /var/www/oficina-docker

# 2. Parar containers
echo "⏹️ Parando containers..."
sudo docker compose down

# 3. Copiar arquivos atualizados
echo "📋 Copiando arquivos atualizados..."
sudo cp /var/www/html/src/index.ts ./src/
sudo cp /var/www/html/oficina.local.conf /etc/nginx/sites-available/oficina.local

# 4. Rebuild containers
echo "🔨 Reconstruindo containers..."
sudo docker compose up -d --build

# 5. Aguardar inicialização
echo "⏳ Aguardando inicialização..."
sleep 30

# 6. Recarregar Nginx
echo "🌐 Recarregando Nginx..."
sudo nginx -t && sudo systemctl reload nginx

# 7. Verificar status
echo "✅ Verificando status..."
sudo docker compose ps

# 8. Testar arquivos CSS/JS
echo ""
echo "🎨 Testando arquivos de layout..."
echo "CSS custom.css:"
curl -I http://localhost:8080/css/custom.css 2>/dev/null | grep -E "(HTTP|Content-Type)"

echo ""
echo "CSS main.css:"
curl -I http://localhost:8080/styles/main.css 2>/dev/null | grep -E "(HTTP|Content-Type)"

echo ""
echo "JS main.js:"
curl -I http://localhost:8080/js/main.js 2>/dev/null | grep -E "(HTTP|Content-Type)"

# 9. Testar página principal
echo ""
echo "🌐 Testando página principal..."
echo "Status da página:"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:8080

echo ""
echo "Verificando se CSS está sendo carregado na página:"
if curl -s http://localhost:8080 | grep -q "css/custom.css"; then
    echo "✅ CSS custom.css encontrado na página"
else
    echo "❌ CSS custom.css NÃO encontrado na página"
fi

if curl -s http://localhost:8080 | grep -q "styles/main.css"; then
    echo "✅ CSS main.css encontrado na página"
else
    echo "❌ CSS main.css NÃO encontrado na página"
fi

# 10. Verificar logs recentes
echo ""
echo "📋 Logs recentes da aplicação:"
sudo docker compose logs --tail=5 oficina-app

echo ""
echo "🎉 TESTE FINAL:"
echo "==============="
echo "1. Acesse: http://oficina.local"
echo "2. Pressione F12 para abrir DevTools"
echo "3. Verifique a aba Console para erros"
echo "4. Verifique a aba Network para arquivos CSS/JS"
echo ""
echo "Se ainda sem layout:"
echo "- Pressione Ctrl+F5 para forçar reload"
echo "- Limpe cache do browser"
echo "- Verifique console do browser para erros"
