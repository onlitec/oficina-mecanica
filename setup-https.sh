#!/bin/bash

echo "🔒 Configurando HTTPS para oficina.local..."
echo "=========================================="

# 1. Criar diretório SSL
echo "📁 Criando diretório SSL..."
sudo mkdir -p /etc/nginx/ssl/oficina.local

# 2. Gerar certificado auto-assinado
echo "🔐 Gerando certificado SSL auto-assinado..."
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/oficina.local/key.pem \
    -out /etc/nginx/ssl/oficina.local/cert.pem \
    -subj "/C=BR/ST=SP/L=SaoPaulo/O=OficinaMecanica/OU=IT/CN=oficina.local/emailAddress=admin@oficina.local" \
    -config <(
    echo '[req]'
    echo 'default_bits = 2048'
    echo 'prompt = no'
    echo 'distinguished_name = req_distinguished_name'
    echo 'req_extensions = v3_req'
    echo '[req_distinguished_name]'
    echo 'C = BR'
    echo 'ST = SP'
    echo 'L = SaoPaulo'
    echo 'O = Oficina Mecanica'
    echo 'OU = IT'
    echo 'CN = oficina.local'
    echo 'emailAddress = admin@oficina.local'
    echo '[v3_req]'
    echo 'keyUsage = keyEncipherment, dataEncipherment'
    echo 'extendedKeyUsage = serverAuth'
    echo 'subjectAltName = @alt_names'
    echo '[alt_names]'
    echo 'DNS.1 = oficina.local'
    echo 'DNS.2 = www.oficina.local'
    echo 'DNS.3 = localhost'
    echo 'IP.1 = 127.0.0.1'
    )

# 3. Definir permissões corretas
echo "🔐 Configurando permissões..."
sudo chmod 600 /etc/nginx/ssl/oficina.local/key.pem
sudo chmod 644 /etc/nginx/ssl/oficina.local/cert.pem
sudo chown root:root /etc/nginx/ssl/oficina.local/*

# 4. Criar configuração Nginx com HTTPS
echo "🌐 Criando configuração Nginx com HTTPS..."
sudo tee /etc/nginx/sites-available/oficina.local > /dev/null << 'EOF'
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name oficina.local www.oficina.local;
    return 301 https://$server_name$request_uri;
}

# HTTPS Virtual Host para Oficina Mecânica Docker
server {
    listen 443 ssl http2;
    server_name oficina.local www.oficina.local;
    
    # SSL Configuration
    ssl_certificate /etc/nginx/ssl/oficina.local/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/oficina.local/key.pem;
    
    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # HSTS (HTTP Strict Transport Security)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    
    # Logs específicos
    access_log /var/log/nginx/oficina.local_ssl_access.log;
    error_log /var/log/nginx/oficina.local_ssl_error.log;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header X-Robots-Tag "noindex, nofollow" always;
    
    # Arquivos CSS com MIME type correto
    location ~* \.css$ {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Port $server_port;
        add_header Content-Type text/css;
        expires 1d;
        access_log off;
    }
    
    # Arquivos JavaScript com MIME type correto
    location ~* \.js$ {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Port $server_port;
        add_header Content-Type application/javascript;
        expires 1d;
        access_log off;
    }
    
    # Imagens e outros arquivos estáticos
    location ~* \.(png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Port $server_port;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # Health check
    location /health {
        proxy_pass http://127.0.0.1:8080/health;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Port $server_port;
        access_log off;
    }
    
    # API endpoints
    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Port $server_port;
    }
    
    # Proxy para aplicação Docker na porta 8080 (catch-all)
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Port $server_port;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
EOF

# 5. Testar configuração
echo "✅ Testando configuração Nginx..."
if sudo nginx -t; then
    echo "✅ Configuração válida"
else
    echo "❌ Erro na configuração"
    exit 1
fi

# 6. Recarregar Nginx
echo "🔄 Recarregando Nginx..."
sudo systemctl reload nginx

# 7. Verificar se porta 443 está ativa
echo "🔌 Verificando porta 443..."
sudo netstat -tuln | grep :443 || echo "⚠️ Porta 443 pode não estar ativa ainda"

# 8. Testar HTTPS
echo ""
echo "🔒 Testando HTTPS..."
sleep 2
if curl -k -I https://oficina.local >/dev/null 2>&1; then
    echo "✅ HTTPS funcionando"
else
    echo "⚠️ HTTPS pode precisar de alguns segundos para ativar"
fi

echo ""
echo "🎉 CONFIGURAÇÃO HTTPS CONCLUÍDA!"
echo "================================="
echo "✅ Certificado SSL gerado"
echo "✅ Nginx configurado para HTTPS"
echo "✅ Redirecionamento HTTP → HTTPS ativo"
echo ""
echo "🌐 URLs disponíveis:"
echo "   • HTTP:  http://oficina.local (redireciona para HTTPS)"
echo "   • HTTPS: https://oficina.local"
echo ""
echo "⚠️ IMPORTANTE:"
echo "   • Certificado é auto-assinado (para desenvolvimento)"
echo "   • Browser mostrará aviso de segurança"
echo "   • Clique em 'Avançado' → 'Prosseguir para oficina.local'"
echo ""
echo "🔐 Para produção, use certificado válido (Let's Encrypt)"
