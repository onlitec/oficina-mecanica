#!/bin/bash

# Script para aplicar o novo layout do menu (apenas texto) em toda a plataforma
echo "🎨 Aplicando novo layout do menu (apenas texto) em toda a plataforma..."

# Lista completa de páginas HTML que usam o menu global
PAGES=(
    "analytics.html"
    "customer-form.html"
    "customers.html"
    "dashboard.html"
    "email-config.html"
    "financial.html"
    "invoices.html"
    "notifications.html"
    "part-form.html"
    "parts.html"
    "part-view.html"
    "quote-form.html"
    "quotes.html"
    "report-consumption.html"
    "report-low-stock.html"
    "report-movement.html"
    "reports.html"
    "service-order-form.html"
    "service-orders.html"
    "service-order-view.html"
    "settings.html"
)

# Função para atualizar uma página
update_page() {
    local page=$1
    echo "📄 Atualizando $page..."
    
    # Verificar se a página existe
    if [ ! -f "$page" ]; then
        echo "   ⚠️  $page não encontrada"
        return
    fi
    
    # Criar backup se não existir
    if [ ! -f "$page.backup-new-menu" ]; then
        cp "$page" "$page.backup-new-menu"
        echo "   💾 Backup criado: $page.backup-new-menu"
    fi
    
    # Verificar se já tem o CSS do novo menu
    if grep -q "menu-center-fix.css" "$page"; then
        echo "   ✅ $page já tem o CSS do novo menu"
    else
        # Adicionar CSS do novo menu no head
        if grep -q "<head>" "$page"; then
            sed -i '/<head>/a\    <link rel="stylesheet" href="/menu-center-fix.css">' "$page"
            echo "   ✅ CSS do novo menu adicionado ao $page"
        fi
    fi
    
    # Verificar se já tem os scripts do novo menu
    local has_force_menu=false
    local has_debug_menu=false
    
    if grep -q "force-menu-size.js" "$page"; then
        has_force_menu=true
    fi
    
    if grep -q "debug-menu-styles.js" "$page"; then
        has_debug_menu=true
    fi
    
    # Adicionar scripts se não existirem
    if [ "$has_force_menu" = false ] || [ "$has_debug_menu" = false ]; then
        # Encontrar a linha com global-menu.js e adicionar os novos scripts após ela
        if grep -q "global-menu.js" "$page"; then
            if [ "$has_force_menu" = false ]; then
                sed -i '/global-menu.js/a\    <script src="/force-menu-size.js"></script>' "$page"
                echo "   ✅ Script force-menu-size.js adicionado ao $page"
            fi
            
            if [ "$has_debug_menu" = false ]; then
                sed -i '/force-menu-size.js/a\    <script src="/debug-menu-styles.js"></script>' "$page"
                echo "   ✅ Script debug-menu-styles.js adicionado ao $page"
            fi
        else
            echo "   ⚠️  global-menu.js não encontrado em $page"
        fi
    else
        echo "   ✅ $page já tem todos os scripts do novo menu"
    fi
    
    echo "   ✅ $page atualizada com sucesso"
}

# Verificar se os arquivos necessários existem
echo "🔍 Verificando arquivos necessários..."

required_files=(
    "menu-center-fix.css"
    "force-menu-size.js"
    "debug-menu-styles.js"
    "js/global-menu.js"
)

missing_files=0
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file encontrado"
    else
        echo "   ❌ $file NÃO encontrado"
        ((missing_files++))
    fi
done

if [ $missing_files -gt 0 ]; then
    echo ""
    echo "❌ ERRO: $missing_files arquivo(s) necessário(s) não encontrado(s)!"
    echo "   Execute primeiro os scripts de criação dos arquivos."
    exit 1
fi

echo ""
echo "🚀 Iniciando atualização das páginas..."
echo ""

# Atualizar cada página
updated_count=0
for page in "${PAGES[@]}"; do
    update_page "$page"
    ((updated_count++))
    echo ""
done

echo "🎉 Atualização concluída!"
echo ""
echo "📋 RESUMO:"
echo "   - Páginas processadas: ${#PAGES[@]}"
echo "   - Páginas atualizadas: $updated_count"
echo "   - Backups criados: *.backup-new-menu"
echo ""
echo "📁 ARQUIVOS ADICIONADOS A CADA PÁGINA:"
echo "   - CSS: /menu-center-fix.css"
echo "   - JS: /force-menu-size.js"
echo "   - JS: /debug-menu-styles.js"
echo ""
echo "🎨 NOVO LAYOUT DO MENU:"
echo "   - ✅ Apenas texto (sem bordas)"
echo "   - ✅ Cor de fundo azul (#5865F2)"
echo "   - ✅ Hover dourado elegante"
echo "   - ✅ Espaçamento otimizado (24px)"
echo "   - ✅ Sem sobreposições"
echo ""
echo "🌐 TESTE EM QUALQUER PÁGINA:"
for page in "dashboard.html" "customers.html" "service-orders.html" "parts.html" "quotes.html"; do
    echo "   - http://toledooficina.local/$page"
done
echo ""
echo "🔍 VERIFICAÇÕES:"
echo "   1. Menu deve ser apenas texto branco"
echo "   2. Fundo azul (#5865F2)"
echo "   3. Hover dourado nos itens"
echo "   4. Sem sobreposições"
echo "   5. Layout consistente em todas as páginas"
echo ""
echo "💡 SE HOUVER PROBLEMAS:"
echo "   - Pressione Ctrl+Shift+R (hard refresh)"
echo "   - Ou execute no console: forceMenuSize()"
echo "   - Ou execute no console: debugMenuStyles()"
echo ""
echo "✅ NOVO LAYOUT DO MENU APLICADO EM TODA A PLATAFORMA!"
