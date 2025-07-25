#!/bin/bash

echo "🔧 Corrigindo instalação do Virtual Host Docker..."

# Parar containers existentes
echo "⏹️ Parando containers existentes..."
sudo docker compose down 2>/dev/null || true
cd /var/www/html

# Criar diretório se não existir
echo "📁 Preparando diretório..."
sudo mkdir -p /var/www/oficina-docker
cd /var/www/oficina-docker

# Copiar arquivos necessários
echo "📋 Copiando arquivos..."
sudo cp /var/www/html/package*.json .
sudo cp /var/www/html/tsconfig.json .
sudo cp -r /var/www/html/src .
sudo cp -r /var/www/html/prisma .
sudo cp -r /var/www/html/css .
sudo cp -r /var/www/html/js .
sudo cp -r /var/www/html/styles .
sudo cp /var/www/html/*.html .
sudo mkdir -p uploads
sudo cp /var/www/html/docker-compose-working.yml ./docker-compose.yml
sudo cp /var/www/html/Dockerfile.simple ./Dockerfile

# Ajustar permissões
sudo chown -R $USER:$USER /var/www/oficina-docker

echo "🐳 Iniciando containers..."
sudo docker compose up -d --build

echo "⏳ Aguardando inicialização..."
sleep 45

echo "✅ Verificando status..."
sudo docker compose ps

echo "🌐 Testando aplicação..."
if curl -s http://localhost:8080/health >/dev/null; then
    echo "✅ Aplicação está respondendo na porta 8080"
else
    echo "⚠️ Aplicação ainda não está respondendo, verificando logs..."
    sudo docker compose logs --tail=20 oficina-app
fi

echo ""
echo "🎉 Instalação concluída!"
echo "Teste no navegador: http://oficina.local"
echo "Teste direto: http://localhost:8080"
