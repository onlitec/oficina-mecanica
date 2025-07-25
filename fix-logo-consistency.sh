#!/bin/bash

# Script para corrigir consistência de logo e título em todas as páginas

echo "🔧 Corrigindo consistência de logo e título em todas as páginas..."

# Lista de arquivos HTML para corrigir
HTML_FILES=(
    "parts.html"
    "service-orders.html"
    "financial.html"
    "reports.html"
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
)

# Função para corrigir logo em um arquivo
fix_logo_in_file() {
    local file="$1"
    
    if [ -f "$file" ]; then
        echo "📝 Corrigindo $file..."
        
        # Corrigir estrutura do logo - Padrão 1: <span class="logo-icon">🚗</span><span>Minha Oficina</span>
        sed -i 's|<span class="logo-icon">🚗</span>|<span class="logo-icon">🔧</span>|g' "$file"
        sed -i 's|<span>Minha Oficina</span>|<span class="logo-text">Oficina Mecânica</span>|g' "$file"
        
        # Corrigir estrutura do logo - Padrão 2: <span class="logo-icon">⚙️</span><span>Texto</span>
        sed -i 's|<span class="logo-icon">⚙️</span>|<span class="logo-icon">🔧</span>|g' "$file"
        
        # Corrigir estrutura do logo - Padrão 3: <span class="logo-icon">🏪</span><span>Texto</span>
        sed -i 's|<span class="logo-icon">🏪</span>|<span class="logo-icon">🔧</span>|g' "$file"
        
        # Adicionar global-settings.js se não existir
        if ! grep -q "global-settings.js" "$file"; then
            # Encontrar a linha antes de </body> e adicionar o script
            sed -i 's|</body>|    <script src="js/global-settings.js"></script>\n</body>|g' "$file"
            echo "  ✅ Adicionado global-settings.js"
        fi
        
        echo "  ✅ $file corrigido"
    else
        echo "  ⚠️ $file não encontrado"
    fi
}

# Corrigir cada arquivo
for file in "${HTML_FILES[@]}"; do
    fix_logo_in_file "$file"
done

echo ""
echo "🎉 Correção de consistência concluída!"
echo ""
echo "📋 Resumo das correções:"
echo "  • Ícone do logo padronizado para 🔧"
echo "  • Texto do logo padronizado para 'Oficina Mecânica'"
echo "  • Adicionada classe 'logo-text' aos textos"
echo "  • Adicionado global-settings.js às páginas"
echo ""
echo "🔧 As configurações personalizadas agora serão aplicadas consistentemente em todas as páginas!"
