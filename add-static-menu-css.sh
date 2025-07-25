#!/bin/bash

# Script para adicionar menu-static-final.css a todas as páginas

echo "🔧 Adicionando menu-static-final.css a todas as páginas..."

# Lista de arquivos HTML para corrigir
HTML_FILES=(
    "customers.html"
    "customer-form.html"
    "settings.html"
    "reports.html"
    "parts.html"
    "service-orders.html"
    "financial.html"
    "analytics.html"
    "notifications.html"
    "invoices.html"
    "quotes.html"
    "part-form.html"
    "part-view.html"
    "service-order-form.html"
    "service-order-view.html"
    "quote-form.html"
    "email-config.html"
    "report-consumption.html"
    "report-low-stock.html"
    "report-movement.html"
    "login.html"
)

# Função para adicionar CSS em um arquivo
add_css_to_file() {
    local file="$1"
    
    if [ -f "$file" ]; then
        echo "📝 Processando $file..."
        
        # Verificar se já tem o CSS
        if grep -q "menu-static-final.css" "$file"; then
            echo "  ✅ $file já tem menu-static-final.css"
        else
            # Adicionar após main.css
            if grep -q "styles/main.css" "$file"; then
                sed -i '/styles\/main.css/a\    <link rel="stylesheet" href="/styles/menu-static-final.css">' "$file"
                echo "  ✅ Adicionado menu-static-final.css a $file"
            else
                echo "  ⚠️ $file não tem main.css, pulando..."
            fi
        fi
    else
        echo "  ⚠️ $file não encontrado"
    fi
}

# Processar cada arquivo
for file in "${HTML_FILES[@]}"; do
    add_css_to_file "$file"
done

echo ""
echo "🎉 Processamento concluído!"
echo ""
echo "📋 Resumo:"
echo "  • Adicionado menu-static-final.css às páginas"
echo "  • CSS com máxima prioridade para menu estático"
echo "  • Remove todos os transforms e transitions"
echo "  • Força posicionamento estático absoluto"
echo ""
echo "🔧 O menu agora deve ser completamente estático!"
