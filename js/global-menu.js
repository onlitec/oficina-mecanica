// Global Menu System - Clean and Simple (Updated - No Mobile)
class GlobalMenu {
    constructor() {
        this.version = '1.1.0'; // Version without mobile
        this.currentUser = null;
        this.currentPage = this.getCurrentPage();
        this.init();
    }

    // Initialize the menu - CSS only approach
    init() {
        this.clearExistingMenu();
        this.loadUser();
        this.createMenuHTML();
        this.highlightCurrentPage();
        this.loadCompanyName();
        
        console.log('✅ GlobalMenu initialized - CSS only!');
    }

    // Clear any existing menu
    clearExistingMenu() {
        const existingHeader = document.querySelector('.global-header');
        if (existingHeader) {
            existingHeader.remove();
        }
    }

    // Get current page from URL
    getCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop().replace('.html', '');
        return page || 'dashboard';
    }

    // Load user from localStorage
    loadUser() {
        const user = localStorage.getItem('user');
        if (!user) {
            return;
        }
        this.currentUser = JSON.parse(user);
    }

    // Load company name from settings
    loadCompanyName() {
        const companyNameElement = document.getElementById('companyName');
        if (!companyNameElement) return;
        // Fallback from localStorage if available
        try {
            const settings = localStorage.getItem('companySettings');
            if (settings) {
                const companyData = JSON.parse(settings);
                if (companyData.companyName) {
                    companyNameElement.textContent = companyData.companyName;
                }
            }
        } catch (error) {
            console.log('No company settings in localStorage');
        }
        // Fetch from API
        fetch('/api/settings/system')
            .then(response => response.json())
            .then(result => {
                if (result.success && result.data.companyName) {
                    companyNameElement.textContent = result.data.companyName;
                    console.log('Company name loaded from API:', result.data.companyName);
                }
            })
            .catch(err => console.error('Erro ao carregar nome da empresa:', err));
    }

    // Create clean menu HTML
    createMenuHTML() {
        const menuHTML = `
            <div class="global-header">
                <div class="header-content">
                    <div class="logo-section">
                        <div class="logo">
                            <!-- Logo será inserido pelo logo-manager.js -->
                        </div>
                        <div class="company-name" id="companyName">
                            Sistema de Gestão
                        </div>
                    </div>

                    <nav class="main-nav">
                        <a href="/customers.html" class="nav-link" data-page="customers">
                            👥 Clientes
                        </a>
                        <a href="/service-orders.html" class="nav-link" data-page="service-orders">
                            🔧 Ordens de Serviço
                        </a>
                        <a href="/parts.html" class="nav-link" data-page="parts">
                            📦 Peças
                        </a>
                        <a href="/quotes.html" class="nav-link" data-page="quotes">
                            📋 Orçamentos
                        </a>
                        <a href="/financial.html" class="nav-link" data-page="financial">
                            💰 Financeiro
                        </a>
                        <a href="/analytics.html" class="nav-link" data-page="analytics">
                            📊 Analytics
                        </a>
                    </nav>

                    <div class="user-section">
                        <a href="/settings.html" class="settings-btn" data-page="settings" title="Configurações">
                            ⚙️
                        </a>
                        <div class="user-info">
                            <span class="user-name" id="globalUserName">
                                ${this.currentUser ? this.currentUser.name : 'Usuário'}
                            </span>
                            <span class="user-role" id="globalUserRole">
                                ${this.currentUser ? `(${this.currentUser.role})` : ''}
                            </span>
                        </div>
                        <button class="logout-btn" onclick="globalMenu.logout()">
                            🚪 Sair
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('afterbegin', menuHTML);
        console.log('Global Menu loaded - Version:', this.version, '- Ready for logo manager');

        // Carregar nome da empresa
        this.loadCompanyName();



        // Notificar logo manager que o menu está pronto
        if (window.logoManager) {
            setTimeout(() => window.logoManager.updateAllLogos(), 100);
        }
    }

    // Highlight current page
    highlightCurrentPage() {
        document.querySelectorAll('.nav-link, .settings-btn').forEach(link => {
            link.classList.remove('active');
        });

        document.querySelectorAll(`[data-page="${this.currentPage}"]`).forEach(link => {
            link.classList.add('active');
        });
    }

    // Logout function
    logout() {
        if (confirm('Tem certeza que deseja sair do sistema?')) {
            localStorage.removeItem('user');
            window.location.href = '/login.html';
        }
    }
}

// Initialize global menu when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.globalMenu = new GlobalMenu();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GlobalMenu;
}
