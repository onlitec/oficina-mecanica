#!/bin/bash

echo "🔄 Reset completo da instalação Docker..."
echo "========================================"

# 1. Parar e limpar tudo
echo "🧹 Limpando containers existentes..."
cd /var/www/oficina-docker
sudo docker compose down 2>/dev/null || true
sudo docker stop $(sudo docker ps -aq) 2>/dev/null || true
sudo docker rm $(sudo docker ps -aq) 2>/dev/null || true

# 2. Verificar estrutura do diretório
echo ""
echo "📁 Verificando estrutura do diretório..."
pwd
ls -la

# 3. Copiar todos os arquivos necessários
echo ""
echo "📋 Copiando arquivos do projeto..."
sudo cp /var/www/html/docker-compose-working.yml ./docker-compose.yml
sudo cp /var/www/html/Dockerfile.simple ./Dockerfile
sudo cp /var/www/html/package*.json .
sudo cp /var/www/html/tsconfig.json .

# Copiar diretórios
sudo cp -r /var/www/html/src .
sudo cp -r /var/www/html/css .
sudo cp -r /var/www/html/js .
sudo cp -r /var/www/html/styles .
sudo cp -r /var/www/html/prisma .

# Copiar arquivos HTML
sudo cp /var/www/html/*.html .
sudo cp /var/www/html/manifest.json . 2>/dev/null || true
sudo cp /var/www/html/sw.js . 2>/dev/null || true

# Criar uploads
sudo mkdir -p uploads
sudo cp -r /var/www/html/uploads/* ./uploads/ 2>/dev/null || true

# 4. Ajustar permissões
echo ""
echo "🔐 Ajustando permissões..."
sudo chown -R $USER:$USER /var/www/oficina-docker

# 5. Verificar arquivos copiados
echo ""
echo "✅ Verificando arquivos copiados:"
echo "Docker files:"
ls -la docker-compose.yml Dockerfile package.json 2>/dev/null || echo "❌ Arquivos Docker não encontrados"

echo "Source files:"
ls -la src/ 2>/dev/null || echo "❌ Diretório src/ não encontrado"

echo "Static files:"
ls -la css/ js/ styles/ 2>/dev/null || echo "❌ Diretórios de arquivos estáticos não encontrados"

# 6. Mostrar conteúdo do docker-compose.yml
echo ""
echo "📄 Conteúdo do docker-compose.yml:"
head -20 docker-compose.yml

# 7. Iniciar containers
echo ""
echo "🚀 Iniciando containers..."
sudo docker compose up -d --build

# 8. Aguardar inicialização
echo ""
echo "⏳ Aguardando inicialização (45 segundos)..."
sleep 45

# 9. Verificar status final
echo ""
echo "📊 Status final dos containers:"
sudo docker compose ps

# 10. Verificar porta 8080
echo ""
echo "🔌 Verificando porta 8080:"
sudo netstat -tuln | grep 8080 || echo "❌ Porta 8080 não está em uso"

# 11. Testar aplicação
echo ""
echo "🌐 Testando aplicação:"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 | grep -q "200"; then
    echo "✅ Aplicação respondendo na porta 8080"
else
    echo "❌ Aplicação não está respondendo"
    echo "📋 Logs da aplicação:"
    sudo docker compose logs --tail=10 oficina-app 2>/dev/null || echo "Container oficina-app não encontrado"
fi

# 12. Testar via Nginx
echo ""
echo "🌐 Testando via Nginx:"
if curl -s -o /dev/null -w "%{http_code}" http://oficina.local | grep -q "200"; then
    echo "✅ Nginx proxy funcionando"
else
    echo "❌ Nginx proxy com problemas"
fi

echo ""
echo "🎯 RESULTADO FINAL:"
echo "=================="
echo "Containers ativos:"
sudo docker compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "URLs para testar:"
echo "- Direto: http://localhost:8080"
echo "- Via Nginx: http://oficina.local"
echo ""
echo "Para ver logs: sudo docker compose logs -f oficina-app"
