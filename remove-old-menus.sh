#!/bin/bash

# Script para remover menus antigos hardcoded de todas as páginas HTML
echo "🧹 Removendo menus antigos hardcoded de todas as páginas..."

# Lista de páginas que podem ter menus antigos
PAGES=(
    "customer-form.html"
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
)

# Função para remover menu antigo de uma página
remove_old_menu() {
    local file=$1
    echo "  🔧 Processando $file..."
    
    # Verificar se o arquivo existe
    if [ ! -f "$file" ]; then
        echo "    ⚠️  Arquivo $file não encontrado"
        return
    fi
    
    # Verificar se tem nav-links
    if grep -q "nav-links" "$file"; then
        echo "    ❌ Menu antigo encontrado em $file - removendo..."
        
        # Criar backup
        cp "$file" "$file.backup-menu"
        
        # Usar sed para remover o bloco do menu antigo
        # Remove desde <div class="nav-links"> até </div> (incluindo conteúdo)
        sed -i '/<div class="nav-links">/,/<\/div>/d' "$file"
        
        # Verificar se foi removido
        if ! grep -q "nav-links" "$file"; then
            echo "    ✅ Menu antigo removido com sucesso de $file"
        else
            echo "    ❌ Erro ao remover menu de $file"
            # Restaurar backup se deu erro
            mv "$file.backup-menu" "$file"
        fi
    else
        echo "    ✅ $file já está limpo (sem menu antigo)"
    fi
}

# Processar cada página
for page in "${PAGES[@]}"; do
    remove_old_menu "$page"
done

echo ""
echo "🎉 Limpeza de menus antigos concluída!"
echo ""
echo "📋 Resumo:"
echo "  - Páginas processadas: ${#PAGES[@]}"
echo "  - Backups criados em: *.backup-menu"
echo ""
echo "🌐 Agora apenas o menu global será exibido!"
echo "   Teste em: http://localhost/dashboard.html"
