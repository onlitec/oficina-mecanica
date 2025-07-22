#!/bin/bash

echo "🎨 Aplicando layout moderno em lote..."

# Função para aplicar header moderno
apply_modern_header() {
    local file="$1"
    local page_title="$2"
    local active_menu="$3"
    local icon="$4"
    
    echo "  📄 Atualizando $file..."
    
    # Backup
    cp "$file" "${file}.backup-before-modern"
    
    # Aplicar novo header
    sed -i '1,/<body/c\
<!DOCTYPE html>\
<html lang="pt-BR">\
<head>\
    <meta charset="UTF-8">\
    <meta name="viewport" content="width=device-width, initial-scale=1.0">\
    <title>'"$page_title"' - Oficina Mecânica</title>\
    <link rel="stylesheet" href="/styles/main.css">\
    <link rel="preconnect" href="https://fonts.googleapis.com">\
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">\
</head>\
<body class="dashboard-layout">\
    <!-- Header -->\
    <header class="header">\
        <div class="header-content">\
            <a href="/" class="logo">\
                <span class="logo-icon">🚗</span>\
                <span>Minha Oficina</span>\
            </a>\
            \
            <nav>\
                <ul class="nav-menu">\
                    <li class="nav-item">\
                        <a href="/dashboard.html" class="nav-link'"$([ "$active_menu" = "dashboard" ] && echo " active")"'">\
                            <span>📊</span>\
                            Dashboard\
                        </a>\
                    </li>\
                    <li class="nav-item">\
                        <a href="/customers.html" class="nav-link'"$([ "$active_menu" = "customers" ] && echo " active")"'">\
                            <span>👥</span>\
                            Clientes\
                        </a>\
                    </li>\
                    <li class="nav-item">\
                        <a href="/service-orders.html" class="nav-link'"$([ "$active_menu" = "orders" ] && echo " active")"'">\
                            <span>🔧</span>\
                            Ordens de Serviço\
                        </a>\
                    </li>\
                    <li class="nav-item">\
                        <a href="/parts.html" class="nav-link'"$([ "$active_menu" = "parts" ] && echo " active")"'">\
                            <span>⚙️</span>\
                            Peças\
                        </a>\
                    </li>\
                    <li class="nav-item">\
                        <a href="/financial.html" class="nav-link'"$([ "$active_menu" = "financial" ] && echo " active")"'">\
                            <span>💰</span>\
                            Financeiro\
                        </a>\
                    </li>\
                    <li class="nav-item">\
                        <a href="/reports.html" class="nav-link'"$([ "$active_menu" = "reports" ] && echo " active")"'">\
                            <span>📈</span>\
                            Relatórios\
                        </a>\
                    </li>\
                    <li class="nav-item">\
                        <a href="/settings.html" class="nav-link'"$([ "$active_menu" = "settings" ] && echo " active")"'">\
                            <span>⚙️</span>\
                            Configurações\
                        </a>\
                    </li>\
                </ul>\
            </nav>\
            \
            <div class="user-menu">\
                <div class="user-info" onclick="toggleUserMenu()">\
                    <div class="user-avatar">U</div>\
                    <span id="userName">Usuário</span>\
                    <span>▼</span>\
                </div>\
            </div>\
        </div>\
    </header>\
\
    <!-- Main Content -->\
    <main class="main-content">\
        <!-- Page Header -->\
        <div class="card">\
            <div class="card-header">\
                <h1 class="card-title">\
                    <span>'"$icon"'</span>\
                    '"$page_title"'\
                </h1>\
            </div>\
        </div>' "$file"
    
    # Adicionar wrapper de card ao conteúdo
    sed -i '/<main class="main-content">/,/<\/main>/s/<div class="container">/<div class="card"><div class="card-body">/' "$file"
    sed -i '/<main class="main-content">/,/<\/main>/s/<\/div><!-- container -->/<\/div><\/div><!-- card -->/' "$file"
    
    # Atualizar scripts
    sed -i 's|<script src="/js/global-menu.js"></script>|<script src="/js/auth.js"></script><script src="/js/logo-manager.js"></script><script src="/modelo2-features.js"></script>|' "$file"
    
    # Adicionar scripts de autenticação
    sed -i '/<\/body>/i\
    <script>\
        const auth = new AuthManager();\
        if (!auth.isAuthenticated()) {\
            window.location.href = "/login.html";\
        }\
        const user = auth.getUser();\
        if (user) {\
            document.getElementById("userName").textContent = user.name || user.email;\
            document.querySelector(".user-avatar").textContent = (user.name || user.email).charAt(0).toUpperCase();\
        }\
        function toggleUserMenu() {\
            const confirmed = confirm("Deseja fazer logout?");\
            if (confirmed) {\
                auth.logout();\
                window.location.href = "/login.html";\
            }\
        }\
    </script>' "$file"
}

# Lista de páginas para atualizar
declare -A pages=(
    ["service-orders.html"]="Ordens de Serviço|orders|🔧"
    ["financial.html"]="Financeiro|financial|💰"
    ["reports.html"]="Relatórios|reports|📈"
    ["settings.html"]="Configurações|settings|⚙️"
    ["analytics.html"]="Analytics|analytics|📊"
    ["invoices.html"]="Faturas|financial|💰"
    ["notifications.html"]="Notificações|notifications|🔔"
    ["quotes.html"]="Orçamentos|quotes|📋"
)

# Aplicar layout moderno
for file in "${!pages[@]}"; do
    if [[ -f "$file" ]]; then
        IFS='|' read -r title menu icon <<< "${pages[$file]}"
        apply_modern_header "$file" "$title" "$menu" "$icon"
    else
        echo "  ⚠️ Arquivo $file não encontrado"
    fi
done

echo "✅ Layout moderno aplicado em lote!"
echo "📊 Páginas atualizadas: ${#pages[@]} arquivos"
