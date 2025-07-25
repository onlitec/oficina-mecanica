#!/bin/bash

# Script Simplificado para Virtual Host Docker
echo "🚗 Configurando Virtual Host para Oficina Mecânica Docker..."

# Configurações
DOMAIN="oficina.local"
DOCKER_PORT="8080"

# Criar diretório
echo "📁 Criando diretório..."
sudo mkdir -p /var/www/oficina-docker
cd /var/www/oficina-docker

# Copiar arquivos essenciais
echo "📋 Copiando arquivos..."
sudo cp /var/www/html/Dockerfile .
sudo cp /var/www/html/docker-compose.prod.yml ./docker-compose.yml
sudo cp /var/www/html/package*.json .
sudo cp /var/www/html/tsconfig.json .
sudo cp -r /var/www/html/src .
sudo cp -r /var/www/html/prisma .
sudo cp -r /var/www/html/css .
sudo cp -r /var/www/html/js .
sudo cp -r /var/www/html/styles .
sudo cp /var/www/html/*.html .

# Criar .env
echo "⚙️ Criando configuração..."
sudo tee .env > /dev/null << EOF
NODE_ENV=production
APP_PORT=$DOCKER_PORT
POSTGRES_DB=oficina_docker
POSTGRES_USER=oficina_user
POSTGRES_PASSWORD=oficina_pass_123
DATABASE_URL=postgresql://oficina_user:oficina_pass_123@postgres:5432/oficina_docker
JWT_SECRET=oficina_jwt_secret_$(date +%s)
CORS_ORIGIN=http://$DOMAIN
COMPANY_NAME=Oficina Mecânica Docker
DATA_PATH=./data
TZ=America/Sao_Paulo
EOF

# Criar diretórios de dados
echo "📂 Criando estrutura de dados..."
sudo mkdir -p data/{postgres,redis,uploads,backups,logs/{app,nginx}}

# Configurar permissões
sudo chown -R $USER:$USER /var/www/oficina-docker
chmod +x /var/www/oficina-docker

# Criar configuração Nginx
echo "🌐 Configurando Nginx..."
sudo tee /etc/nginx/sites-available/$DOMAIN > /dev/null << EOF
server {
    listen 80;
    server_name $DOMAIN;
    
    location / {
        proxy_pass http://127.0.0.1:$DOCKER_PORT;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Habilitar site
sudo ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/$DOMAIN 2>/dev/null || {
    echo "⚠️ Adicionando ao nginx.conf principal..."
    sudo cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup
    echo "include /etc/nginx/sites-available/$DOMAIN;" | sudo tee -a /etc/nginx/nginx.conf
}

# Adicionar ao hosts
echo "🔗 Configurando hosts..."
if ! grep -q "$DOMAIN" /etc/hosts; then
    echo "127.0.0.1 $DOMAIN" | sudo tee -a /etc/hosts
fi

# Testar Nginx
echo "✅ Testando Nginx..."
sudo nginx -t && sudo systemctl reload nginx

echo ""
echo "🎉 Configuração concluída!"
echo "📁 Diretório: /var/www/oficina-docker"
echo "🌐 Domínio: http://$DOMAIN"
echo "🐳 Porta Docker: $DOCKER_PORT"
echo ""
echo "Para iniciar os containers:"
echo "cd /var/www/oficina-docker"
echo "sudo docker compose up -d"
