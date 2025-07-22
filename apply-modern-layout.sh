#!/bin/bash

echo "🎨 Aplicando layout moderno em todas as páginas..."

# Função para aplicar layout moderno
apply_modern_layout() {
    local file="$1"
    local page_title="$2"
    local active_menu="$3"
    local icon="$4"
    
    echo "  📄 Processando $file..."
    
    # Backup do arquivo original
    cp "$file" "${file}.backup-before-modern"
    
    # Extrair conteúdo principal (entre <body> e </body>, excluindo scripts)
    local content=$(sed -n '/<body/,/<\/body>/p' "$file" | sed '1d;$d' | sed '/script/,/\/script/d')
    
    # Criar novo arquivo com template moderno
    cat > "$file" << EOF
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>$page_title - Oficina Mecânica</title>
    <link rel="stylesheet" href="/styles/main.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body class="dashboard-layout">
    <!-- Header -->
    <header class="header">
        <div class="header-content">
            <a href="/" class="logo">
                <span class="logo-icon">🚗</span>
                <span>Minha Oficina</span>
            </a>
            
            <nav>
                <ul class="nav-menu">
                    <li class="nav-item">
                        <a href="/dashboard.html" class="nav-link$([ "$active_menu" = "dashboard" ] && echo " active")">
                            <span>📊</span>
                            Dashboard
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="/customers.html" class="nav-link$([ "$active_menu" = "customers" ] && echo " active")">
                            <span>👥</span>
                            Clientes
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="/service-orders.html" class="nav-link$([ "$active_menu" = "orders" ] && echo " active")">
                            <span>🔧</span>
                            Ordens de Serviço
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="/parts.html" class="nav-link$([ "$active_menu" = "parts" ] && echo " active")">
                            <span>⚙️</span>
                            Peças
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="/financial.html" class="nav-link$([ "$active_menu" = "financial" ] && echo " active")">
                            <span>💰</span>
                            Financeiro
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="/reports.html" class="nav-link$([ "$active_menu" = "reports" ] && echo " active")">
                            <span>📈</span>
                            Relatórios
                        </a>
                    </li>
                    <li class="nav-item">
                        <a href="/settings.html" class="nav-link$([ "$active_menu" = "settings" ] && echo " active")">
                            <span>⚙️</span>
                            Configurações
                        </a>
                    </li>
                </ul>
            </nav>
            
            <div class="user-menu">
                <div class="user-info" onclick="toggleUserMenu()">
                    <div class="user-avatar">U</div>
                    <span id="userName">Usuário</span>
                    <span>▼</span>
                </div>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <main class="main-content">
        <!-- Page Header -->
        <div class="card">
            <div class="card-header">
                <h1 class="card-title">
                    <span>$icon</span>
                    $page_title
                </h1>
            </div>
        </div>

        <!-- Original Content (will be wrapped in cards) -->
        <div class="card">
            <div class="card-body">
$content
            </div>
        </div>
    </main>

    <!-- Scripts -->
    <script src="/js/auth.js"></script>
    <script src="/js/logo-manager.js"></script>
    <script src="/modelo2-features.js"></script>
    
    <script>
        // Verificar autenticação
        const auth = new AuthManager();
        if (!auth.isAuthenticated()) {
            window.location.href = '/login.html';
        }

        // Atualizar nome do usuário
        const user = auth.getUser();
        if (user) {
            document.getElementById('userName').textContent = user.name || user.email;
            document.querySelector('.user-avatar').textContent = (user.name || user.email).charAt(0).toUpperCase();
        }

        // Toggle user menu
        function toggleUserMenu() {
            const confirmed = confirm('Deseja fazer logout?');
            if (confirmed) {
                auth.logout();
                window.location.href = '/login.html';
            }
        }

        // Funções da API
        async function apiCall(endpoint) {
            try {
                const response = await fetch(endpoint);
                return await response.json();
            } catch (error) {
                throw new Error(\`Erro na API: \${error.message}\`);
            }
        }
    </script>
</body>
</html>
EOF
}

# Aplicar layout moderno nas páginas principais
echo "📋 Aplicando layout nas páginas principais..."

# Páginas principais
apply_modern_layout "customers.html" "Clientes" "customers" "👥"
apply_modern_layout "parts.html" "Peças" "parts" "⚙️"
apply_modern_layout "service-orders.html" "Ordens de Serviço" "orders" "🔧"
apply_modern_layout "financial.html" "Financeiro" "financial" "💰"
apply_modern_layout "reports.html" "Relatórios" "reports" "📈"
apply_modern_layout "settings.html" "Configurações" "settings" "⚙️"

echo "✅ Layout moderno aplicado nas páginas principais!"
echo "📊 Páginas atualizadas: customers, parts, service-orders, financial, reports, settings"
