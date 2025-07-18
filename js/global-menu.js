// Global Menu System - Clean and Simple (Updated - No Mobile)
class GlobalMenu {
    constructor() {
        this.version = '1.1.0'; // Version without mobile
        this.currentUser = null;
        this.currentPage = this.getCurrentPage();
        this.init();
    }

    // Initialize the menu
    init() {
        // Clear any existing menu first
        this.clearExistingMenu();
        this.loadUser();
        this.createMenuHTML();
        this.addStyles();
        this.highlightCurrentPage();
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
        try {
            const settings = localStorage.getItem('companySettings');
            if (settings) {
                const companyData = JSON.parse(settings);
                const companyNameElement = document.getElementById('companyName');
                if (companyNameElement && companyData.companyName) {
                    companyNameElement.textContent = companyData.companyName;
                    console.log('Company name loaded:', companyData.companyName);
                }
            }
        } catch (error) {
            console.log('No company settings found, using default name');
        }
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

    // Add clean styles
    addStyles() {
        const styles = `
            <style>
                .global-header {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    z-index: 1000;
                    background: linear-gradient(135deg, #2563eb 0%, #8b5cf6 100%);
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }

                .header-content {
                    max-width: 1200px;
                    width: 100%;
                    margin: 0 auto;
                    display: flex;
                    align-items: center;
                    padding: 12px 24px;
                    box-sizing: border-box;
                    position: relative;
                    justify-content: space-between;
                }

                .logo-section {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    flex: 0 0 auto;
                }

                .company-name {
                    color: white;
                    font-weight: 600;
                    font-size: 1.1em;
                    white-space: nowrap;
                }

                .main-nav {
                    display: flex;
                    gap: 20px;
                    align-items: center;
                    justify-content: center;
                    position: absolute;
                    left: 50%;
                    top: 50%;
                    transform: translate(-50%, -50%);
                }

                .user-section {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    flex: 0 0 auto;
                }

                .nav-link {
                    color: white;
                    text-decoration: none;
                    padding: 12px 20px;
                    border-radius: 8px;
                    font-weight: 500;
                    font-size: 1em;
                    transition: all 0.3s ease;
                    border: 2px solid transparent;
                    white-space: nowrap;
                }

                .nav-link:hover {
                    background: rgba(255,255,255,0.15);
                    transform: translateY(-1px);
                }

                .nav-link.active {
                    background: rgba(255,255,255,0.2);
                    border-color: rgba(255,255,255,0.3);
                }



                .settings-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 42px;
                    height: 42px;
                    background: rgba(255,255,255,0.15);
                    color: white;
                    text-decoration: none;
                    border-radius: 50%;
                    font-size: 1.2em;
                    transition: all 0.3s ease;
                    border: 2px solid transparent;
                }

                .settings-btn:hover {
                    background: rgba(255,255,255,0.25);
                    transform: rotate(90deg) scale(1.1);
                    border-color: rgba(255,255,255,0.3);
                }

                .settings-btn.active {
                    background: rgba(255,255,255,0.3);
                    border-color: rgba(255,255,255,0.5);
                    transform: rotate(90deg);
                }

                .user-info {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    color: white;
                }

                .user-name {
                    font-weight: 600;
                    font-size: 0.95em;
                }

                .user-role {
                    font-size: 0.8em;
                    opacity: 0.8;
                }

                .logout-btn {
                    background: rgba(255,255,255,0.15);
                    color: white;
                    border: 1px solid rgba(255,255,255,0.3);
                    padding: 8px 16px;
                    border-radius: 20px;
                    cursor: pointer;
                    font-size: 0.9em;
                    font-weight: 500;
                    transition: all 0.3s ease;
                }

                .logout-btn:hover {
                    background: rgba(255,255,255,0.25);
                    transform: translateY(-1px);
                    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                }

                body {
                    padding-top: 70px !important;
                }

                /* Responsive design */
                @media (max-width: 900px) {
                    .header-content {
                        max-width: 100%;
                        padding: 10px 15px;
                    }

                    .main-nav {
                        gap: 15px;
                    }

                    .company-name {
                        font-size: 1em;
                    }

                    .nav-link {
                        padding: 10px 16px;
                        font-size: 0.95em;
                    }

                    .user-info {
                        display: none;
                    }

                    .settings-btn {
                        width: 38px;
                        height: 38px;
                        font-size: 1.1em;
                    }
                }

                @media (max-width: 600px) {
                    .header-content {
                        padding: 8px 12px;
                    }

                    .main-nav {
                        gap: 8px;
                        flex-wrap: wrap;
                        justify-content: center;
                    }

                    .company-name {
                        font-size: 0.9em;
                    }
                    }

                    .user-section {
                        order: 3;
                    }

                    .nav-link {
                        padding: 8px 12px;
                        font-size: 0.85em;
                    }

                    .settings-btn {
                        width: 34px;
                        height: 34px;
                        font-size: 1em;
                    }

                    .logout-btn {
                        padding: 6px 12px;
                        font-size: 0.8em;
                    }
                }

                @media (max-width: 400px) {
                    .header-content {
                        display: flex;
                        flex-direction: column;
                        padding: 10px 8px;
                        gap: 8px;
                        align-items: center;
                        justify-content: center;
                    }

                    .logo-section {
                        order: 1;
                    }

                    .main-nav {
                        position: static;
                        transform: none;
                        order: 2;
                        justify-content: center;
                        flex-wrap: wrap;
                    }

                    .user-section {
                        order: 3;
                        justify-content: center;
                    }

                    .logo a {
                        font-size: 1em;
                    }

                    .main-nav {
                        gap: 4px;
                    }

                    .nav-link {
                        padding: 6px 8px;
                        font-size: 0.75em;
                    }

                    .settings-btn {
                        width: 30px;
                        height: 30px;
                        font-size: 0.9em;
                    }

                    .logout-btn {
                        padding: 4px 8px;
                        font-size: 0.7em;
                    }
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
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
