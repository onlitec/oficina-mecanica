#!/bin/bash

echo "📝 Atualizando formulários com layout moderno..."

# Lista de formulários
declare -A forms=(
    ["customer-form.html"]="Cadastro de Cliente|customers|👤"
    ["part-form.html"]="Cadastro de Peça|parts|⚙️"
    ["service-order-form.html"]="Nova Ordem de Serviço|orders|🔧"
    ["quote-form.html"]="Novo Orçamento|quotes|📋"
    ["part-view.html"]="Visualizar Peça|parts|👁️"
    ["service-order-view.html"]="Visualizar OS|orders|👁️"
)

# Função para atualizar formulário
update_form() {
    local file="$1"
    local title="$2"
    local menu="$3"
    local icon="$4"
    
    echo "  📄 Atualizando $file..."
    
    # Backup
    cp "$file" "${file}.backup-before-modern"
    
    # Atualizar head
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
<body class="dashboard-layout">' "$file"
    
    # Adicionar header moderno após <body>
    sed -i '/<body class="dashboard-layout">/a\
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
    <main class="main-content">' "$file"
    
    # Adicionar page header após main
    sed -i '/<main class="main-content">/a\
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
    
    # Atualizar scripts
    sed -i 's|<script src="/js/global-menu.js"></script>||' "$file"
    sed -i 's|<script src="/modelo2-features.js"></script>||' "$file"
    
    # Adicionar scripts modernos antes de </body>
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

# Atualizar todos os formulários
for file in "${!forms[@]}"; do
    if [[ -f "$file" ]]; then
        IFS='|' read -r title menu icon <<< "${forms[$file]}"
        update_form "$file" "$title" "$menu" "$icon"
    else
        echo "  ⚠️ Arquivo $file não encontrado"
    fi
done

echo "✅ Formulários atualizados com layout moderno!"
echo "📊 Formulários atualizados: ${#forms[@]} arquivos"
