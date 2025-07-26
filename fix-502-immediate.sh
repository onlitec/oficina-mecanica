#!/bin/bash

echo "🚨 Corrigindo erro 502 Bad Gateway..."
echo "===================================="

# 1. Verificar status atual
echo "📊 Status atual dos containers:"
cd /var/www/oficina-docker
sudo docker compose ps

echo ""
echo "🔌 Verificando porta 8080:"
sudo netstat -tuln | grep 8080 || echo "❌ Porta 8080 não está em uso"

# 2. Parar todos os containers
echo ""
echo "⏹️ Parando todos os containers..."
sudo docker compose down

# 3. Limpar containers órfãos
echo "🧹 Limpando containers órfãos..."
sudo docker stop $(sudo docker ps -aq) 2>/dev/null || true
sudo docker rm $(sudo docker ps -aq) 2>/dev/null || true

# 4. Verificar se arquivos necessários existem
echo ""
echo "📁 Verificando arquivos necessários..."
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ docker-compose.yml não encontrado, copiando..."
    sudo cp /var/www/html/docker-compose-working.yml ./docker-compose.yml
fi

if [ ! -f "Dockerfile" ]; then
    echo "❌ Dockerfile não encontrado, copiando..."
    sudo cp /var/www/html/Dockerfile.simple ./Dockerfile
fi

# 5. Verificar estrutura de arquivos
echo ""
echo "📂 Verificando estrutura de arquivos:"
ls -la src/ 2>/dev/null || echo "❌ Diretório src/ não encontrado"
ls -la css/ 2>/dev/null || echo "❌ Diretório css/ não encontrado"
ls -la js/ 2>/dev/null || echo "❌ Diretório js/ não encontrado"

# 6. Copiar arquivos se necessário
if [ ! -d "src" ]; then
    echo "📋 Copiando arquivos do projeto..."
    sudo cp -r /var/www/html/src .
    sudo cp -r /var/www/html/css .
    sudo cp -r /var/www/html/js .
    sudo cp -r /var/www/html/styles .
    sudo cp /var/www/html/package*.json .
    sudo cp /var/www/html/tsconfig.json .
    sudo cp /var/www/html/*.html .
    sudo mkdir -p uploads
fi

# 7. Ajustar permissões
sudo chown -R $USER:$USER /var/www/oficina-docker

# 8. Iniciar containers
echo ""
echo "🚀 Iniciando containers..."
sudo docker compose up -d --build

# 9. Aguardar inicialização
echo "⏳ Aguardando inicialização (30 segundos)..."
sleep 30

# 10. Verificar status
echo ""
echo "✅ Verificando status final:"
sudo docker compose ps

echo ""
echo "🔌 Verificando porta 8080:"
sudo netstat -tuln | grep 8080

# 11. Testar aplicação
echo ""
echo "🌐 Testando aplicação:"
echo "Teste direto (porta 8080):"
curl -s -o /dev/null -w "Status: %{http_code}\n" http://localhost:8080 || echo "❌ Falha na conexão"

echo ""
echo "Teste via Nginx (oficina.local):"
curl -s -o /dev/null -w "Status: %{http_code}\n" http://oficina.local || echo "❌ Falha na conexão"

# 12. Mostrar logs se houver problemas
echo ""
echo "📋 Logs recentes (se houver problemas):"
sudo docker compose logs --tail=10 oficina-app 2>/dev/null || echo "Container oficina-app não encontrado"

echo ""
echo "🎯 RESULTADO:"
echo "============="
if curl -s http://localhost:8080 >/dev/null 2>&1; then
    echo "✅ Aplicação funcionando na porta 8080"
    echo "✅ Acesse: http://oficina.local"
else
    echo "❌ Aplicação ainda não está respondendo"
    echo "📋 Execute para ver logs: sudo docker compose logs -f oficina-app"
fi
