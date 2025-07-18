#!/bin/bash

# Script de Verificação Completa do Sistema
echo "=== VERIFICAÇÃO COMPLETA DO SISTEMA ==="
echo "Data: $(date)"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Contadores
total_pages=0
working_pages=0
broken_pages=0
missing_files=0

echo "🔍 1. VERIFICANDO PÁGINAS HTML PRINCIPAIS..."
echo "================================================"

# Lista de páginas principais
main_pages=(
    "index.html"
    "login.html"
    "dashboard.html"
    "customers.html"
    "service-orders.html"
    "parts.html"
    "quotes.html"
    "financial.html"
    "analytics.html"
    "settings.html"
    "reports.html"
    "notifications.html"
)

for page in "${main_pages[@]}"; do
    ((total_pages++))
    if [ -f "$page" ]; then
        # Verificar se a página carrega (HTTP 200)
        status=$(curl -s -o /dev/null -w "%{http_code}" "http://toledooficina.local/$page")
        if [ "$status" = "200" ]; then
            echo -e "✅ ${GREEN}$page${NC} - OK ($status)"
            ((working_pages++))
        else
            echo -e "❌ ${RED}$page${NC} - ERRO ($status)"
            ((broken_pages++))
        fi
    else
        echo -e "❌ ${RED}$page${NC} - ARQUIVO NÃO ENCONTRADO"
        ((missing_files++))
        ((broken_pages++))
    fi
done

echo ""
echo "🔗 2. VERIFICANDO LINKS DO MENU GLOBAL..."
echo "=========================================="

# Verificar links do menu global
menu_links=(
    "/dashboard.html"
    "/customers.html"
    "/service-orders.html"
    "/parts.html"
    "/quotes.html"
    "/financial.html"
    "/analytics.html"
    "/settings.html"
)

for link in "${menu_links[@]}"; do
    status=$(curl -s -o /dev/null -w "%{http_code}" "http://toledooficina.local$link")
    if [ "$status" = "200" ]; then
        echo -e "✅ ${GREEN}$link${NC} - OK"
    else
        echo -e "❌ ${RED}$link${NC} - ERRO ($status)"
    fi
done

echo ""
echo "📁 3. VERIFICANDO ARQUIVOS JAVASCRIPT..."
echo "========================================"

js_files=(
    "js/global-menu.js"
    "js/logo-manager.js"
    "js/auth.js"
)

for js_file in "${js_files[@]}"; do
    if [ -f "$js_file" ]; then
        status=$(curl -s -o /dev/null -w "%{http_code}" "http://toledooficina.local/$js_file")
        if [ "$status" = "200" ]; then
            echo -e "✅ ${GREEN}$js_file${NC} - OK"
        else
            echo -e "❌ ${RED}$js_file${NC} - ERRO ($status)"
        fi
    else
        echo -e "❌ ${RED}$js_file${NC} - ARQUIVO NÃO ENCONTRADO"
    fi
done

echo ""
echo "🖼️ 4. VERIFICANDO SISTEMA DE LOGO..."
echo "===================================="

# Verificar pasta uploads
if [ -d "uploads" ]; then
    echo -e "✅ ${GREEN}Pasta uploads${NC} - OK"
    logo_count=$(find uploads -name "logo.*" | wc -l)
    if [ "$logo_count" -gt 0 ]; then
        echo -e "✅ ${GREEN}Logos encontrados${NC} - $logo_count arquivo(s)"
        find uploads -name "logo.*" -exec echo "   📁 {}" \;
    else
        echo -e "⚠️ ${YELLOW}Nenhum logo encontrado${NC}"
    fi
else
    echo -e "❌ ${RED}Pasta uploads${NC} - NÃO ENCONTRADA"
fi

# Verificar API de configurações
api_status=$(curl -s -o /dev/null -w "%{http_code}" "http://toledooficina.local/api/settings/system")
if [ "$api_status" = "200" ]; then
    echo -e "✅ ${GREEN}API Configurações${NC} - OK ($api_status)"
else
    echo -e "❌ ${RED}API Configurações${NC} - ERRO ($api_status)"
fi

echo ""
echo "🔐 5. VERIFICANDO SISTEMA DE AUTENTICAÇÃO..."
echo "============================================"

# Verificar redirecionamento de autenticação
auth_status=$(curl -s -o /dev/null -w "%{http_code}" "http://toledooficina.local/dashboard.html")
echo -e "Dashboard (sem auth): $auth_status"

login_status=$(curl -s -o /dev/null -w "%{http_code}" "http://toledooficina.local/login.html")
if [ "$login_status" = "200" ]; then
    echo -e "✅ ${GREEN}Página de Login${NC} - OK"
else
    echo -e "❌ ${RED}Página de Login${NC} - ERRO ($login_status)"
fi

echo ""
echo "📊 6. VERIFICANDO APIS DO SISTEMA..."
echo "==================================="

apis=(
    "/api/health"
    "/api/settings/system"
    "/api/customers"
)

for api in "${apis[@]}"; do
    status=$(curl -s -o /dev/null -w "%{http_code}" "http://toledooficina.local$api")
    if [ "$status" = "200" ]; then
        echo -e "✅ ${GREEN}$api${NC} - OK ($status)"
    else
        echo -e "❌ ${RED}$api${NC} - ERRO ($status)"
    fi
done

echo ""
echo "🔍 7. VERIFICANDO LOGO-MANAGER EM PÁGINAS..."
echo "============================================"

pages_with_logo_manager=0
pages_without_logo_manager=0

for page in "${main_pages[@]}"; do
    if [ -f "$page" ]; then
        if grep -q "logo-manager.js" "$page"; then
            echo -e "✅ ${GREEN}$page${NC} - Logo Manager incluído"
            ((pages_with_logo_manager++))
        else
            echo -e "❌ ${RED}$page${NC} - Logo Manager AUSENTE"
            ((pages_without_logo_manager++))
        fi
    fi
done

echo ""
echo "📋 8. RESUMO DA VERIFICAÇÃO"
echo "=========================="
echo -e "📄 Total de páginas verificadas: ${BLUE}$total_pages${NC}"
echo -e "✅ Páginas funcionando: ${GREEN}$working_pages${NC}"
echo -e "❌ Páginas com problema: ${RED}$broken_pages${NC}"
echo -e "📁 Arquivos não encontrados: ${RED}$missing_files${NC}"
echo -e "🖼️ Páginas com Logo Manager: ${GREEN}$pages_with_logo_manager${NC}"
echo -e "⚠️ Páginas sem Logo Manager: ${YELLOW}$pages_without_logo_manager${NC}"

echo ""
if [ "$broken_pages" -eq 0 ] && [ "$pages_without_logo_manager" -eq 0 ]; then
    echo -e "🎉 ${GREEN}SISTEMA SAUDÁVEL!${NC} Todos os componentes estão funcionando."
else
    echo -e "⚠️ ${YELLOW}PROBLEMAS ENCONTRADOS!${NC} Verifique os itens marcados em vermelho."
fi

echo ""
echo "🔧 Para corrigir problemas automaticamente, execute:"
echo "   ./fix-system-issues.sh"
