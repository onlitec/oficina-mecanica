#!/bin/bash

echo "🔧 Corrigindo referências a arquivos inexistentes nos HTMLs..."

# Lista de arquivos CSS/JS que foram removidos
REMOVED_CSS=(
    "layout-fix-final.css"
    "force-white-header.css"
    "simple-menu-fix.css"
    "menu-center-fix.css"
    "layout-correction-final.css"
    "layout-fixes.css"
    "menu-final.css"
    "menu-fix.css"
)

REMOVED_JS=(
    "simple-menu-fix.js"
    "force-complete-menu-fix.js"
    "force-center-menu.js"
    "fix-menu-overlap.js"
    "fix-menu-alignment.js"
    "emergency-menu-fix.js"
    "debug-menu-styles.js"
)

# Função para remover referências CSS
remove_css_refs() {
    local file="$1"
    echo "  📄 Processando CSS em $file..."
    
    for css in "${REMOVED_CSS[@]}"; do
        sed -i "/<link.*href=\"\/$css\"/d" "$file"
    done
}

# Função para remover referências JS
remove_js_refs() {
    local file="$1"
    echo "  📄 Processando JS em $file..."
    
    for js in "${REMOVED_JS[@]}"; do
        sed -i "/<script.*src=\"\/$js\"/d" "$file"
    done
}

# Processar todos os arquivos HTML
for html_file in *.html; do
    if [[ -f "$html_file" ]]; then
        echo "🔍 Processando $html_file..."
        remove_css_refs "$html_file"
        remove_js_refs "$html_file"
    fi
done

echo "✅ Correção de referências concluída!"
echo "📊 Verificando arquivos restantes..."
echo "CSS files:"
ls -1 *.css 2>/dev/null | head -5
echo "JS files:"
ls -1 *.js 2>/dev/null | head -5
