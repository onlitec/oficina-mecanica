#!/bin/bash

echo "🚗 Instalando Oficina Mecânica Docker com Virtual Host..."
echo "=================================================="

# 1. Criar diretório de instalação
echo "📁 Criando diretório de instalação..."
sudo mkdir -p /var/www/oficina-docker
sudo chown -R $USER:$USER /var/www/oficina-docker

# 2. Copiar arquivos necessários
echo "📋 Copiando arquivos do projeto..."
cp Dockerfile /var/www/oficina-docker/
cp docker-compose.simple.yml /var/www/oficina-docker/docker-compose.yml
cp package*.json /var/www/oficina-docker/
cp tsconfig.json /var/www/oficina-docker/
cp -r src /var/www/oficina-docker/
cp -r prisma /var/www/oficina-docker/
cp -r css /var/www/oficina-docker/
cp -r js /var/www/oficina-docker/
cp -r styles /var/www/oficina-docker/
cp *.html /var/www/oficina-docker/
cp manifest.json /var/www/oficina-docker/ 2>/dev/null || true
cp sw.js /var/www/oficina-docker/ 2>/dev/null || true

# 3. Criar diretório uploads
mkdir -p /var/www/oficina-docker/uploads
cp -r uploads/* /var/www/oficina-docker/uploads/ 2>/dev/null || true

# 4. Configurar Nginx
echo "🌐 Configurando Virtual Host Nginx..."
sudo cp oficina.local.conf /etc/nginx/sites-available/oficina.local

# 5. Habilitar site
if [ -d "/etc/nginx/sites-enabled" ]; then
    sudo ln -sf /etc/nginx/sites-available/oficina.local /etc/nginx/sites-enabled/
    echo "✅ Site habilitado via sites-enabled"
else
    echo "⚠️ Adicionando configuração ao nginx.conf principal..."
    sudo cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup
    echo "" | sudo tee -a /etc/nginx/nginx.conf
    echo "# Virtual Host Oficina Docker" | sudo tee -a /etc/nginx/nginx.conf
    sudo cat oficina.local.conf | sudo tee -a /etc/nginx/nginx.conf
fi

# 6. Configurar /etc/hosts
echo "🔗 Configurando /etc/hosts..."
if ! grep -q "oficina.local" /etc/hosts; then
    echo "127.0.0.1 oficina.local www.oficina.local" | sudo tee -a /etc/hosts
    echo "✅ Entrada adicionada ao /etc/hosts"
else
    echo "ℹ️ Entrada já existe no /etc/hosts"
fi

# 7. Testar configuração Nginx
echo "🔧 Testando configuração Nginx..."
if sudo nginx -t; then
    echo "✅ Configuração Nginx válida"
    sudo systemctl reload nginx
    echo "✅ Nginx recarregado"
else
    echo "❌ Erro na configuração Nginx"
    exit 1
fi

# 8. Iniciar Docker (se estiver parado)
echo "🐳 Verificando Docker..."
sudo systemctl start docker
sudo systemctl enable docker

echo ""
echo "🎉 Configuração concluída!"
echo "=================================================="
echo "📁 Diretório: /var/www/oficina-docker"
echo "🌐 URL: http://oficina.local"
echo "🐳 Porta Docker: 8080"
echo ""
echo "Para iniciar os containers:"
echo "cd /var/www/oficina-docker"
echo "sudo docker compose up -d --build"
echo ""
echo "Para verificar status:"
echo "sudo docker compose ps"
echo ""
echo "Para ver logs:"
echo "sudo docker compose logs -f"
