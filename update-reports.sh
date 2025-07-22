#!/bin/bash

echo "📊 Atualizando páginas de relatórios..."

# Lista de relatórios
declare -A reports=(
    ["report-consumption.html"]="Relatório de Consumo|reports|📊"
    ["report-low-stock.html"]="Relatório de Estoque Baixo|reports|⚠️"
    ["report-movement.html"]="Relatório de Movimentação|reports|📈"
    ["email-config.html"]="Configuração de Email|settings|📧"
)

# Função para atualizar relatório
update_report() {
    local file="$1"
    local title="$2"
    local menu="$3"
    local icon="$4"
    
    echo "  📄 Atualizando $file..."
    
    # Backup
    cp "$file" "${file}.backup-before-modern"
    
    # Aplicar header moderno
    sed -i '1,/<body/c\
<!DOCTYPE html>\
<html lang="pt-BR">\
<head>\
    <meta charset="UTF-8">\
    <meta name="viewport" content="width=device-width, initial-scale=1.0">\
    <title>'"$title"' - Oficina Mecânica</title>\
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
                        <a href="/dashboard.html" class="nav-link'"$([ "$menu" = "dashboard" ] && echo " active")"'">\
                            <span>📊</span>\
                            Dashboard\
                        </a>\
                    </li>\
                    <li class="nav-item">\
                        <a href="/customers.html" class="nav-link'"$([ "$menu" = "customers" ] && echo " active")"'">\
                            <span>👥</span>\
                            Clientes\
                        </a>\
                    </li>\
                    <li class="nav-item">\
                        <a href="/service-orders.html" class="nav-link'"$([ "$menu" = "orders" ] && echo " active")"'">\
                            <span>🔧</span>\
                            Ordens de Serviço\
                        </a>\
                    </li>\
                    <li class="nav-item">\
                        <a href="/parts.html" class="nav-link'"$([ "$menu" = "parts" ] && echo " active")"'">\
                            <span>⚙️</span>\
                            Peças\
                        </a>\
                    </li>\
                    <li class="nav-item">\
                        <a href="/financial.html" class="nav-link'"$([ "$menu" = "financial" ] && echo " active")"'">\
                            <span>💰</span>\
                            Financeiro\
                        </a>\
                    </li>\
                    <li class="nav-item">\
                        <a href="/reports.html" class="nav-link'"$([ "$menu" = "reports" ] && echo " active")"'">\
                            <span>📈</span>\
                            Relatórios\
                        </a>\
                    </li>\
                    <li class="nav-item">\
                        <a href="/settings.html" class="nav-link'"$([ "$menu" = "settings" ] && echo " active")"'">\
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
                    '"$title"'\
                </h1>\
            </div>\
        </div>' "$file"
    
    # Envolver conteúdo em card
    sed -i 's/<div class="container">/<div class="card"><div class="card-body">/' "$file"
    sed -i 's/<\/div><!-- container -->/<\/div><\/div><!-- card -->/' "$file"
    
    # Fechar main antes de </body>
    sed -i '/<\/body>/i\    </main>' "$file"
    
    # Adicionar scripts modernos
    sed -i '/<\/body>/i\
    <script src="/js/auth.js"></script>\
    <script src="/js/logo-manager.js"></script>\
    <script src="/modelo2-features.js"></script>\
    \
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

# Atualizar todos os relatórios
for file in "${!reports[@]}"; do
    if [[ -f "$file" ]]; then
        IFS='|' read -r title menu icon <<< "${reports[$file]}"
        update_report "$file" "$title" "$menu" "$icon"
    else
        echo "  ⚠️ Arquivo $file não encontrado"
    fi
done

echo "✅ Páginas de relatórios atualizadas!"
echo "📊 Relatórios atualizados: ${#reports[@]} arquivos"
