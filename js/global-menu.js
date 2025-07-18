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

    // Create clean menu HTML
    createMenuHTML() {
        const menuHTML = `
            <div class="global-header">
                <div class="header-content">
                    <div class="logo">
                        <a href="/dashboard.html" class="logo-link">
                            <div class="logo-icon">🔧</div>
                            <div class="logo-text">
                                <div class="logo-title">Oficina</div>
                                <div class="logo-subtitle">Mecânica</div>
                            </div>
                        </a>
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
        console.log('Menu loaded - Version:', this.version, '- Logo and title updated');
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
                    max-width: 1000px;
                    margin: 0 auto;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 20px;
                    gap: 20px;
                }

                .global-header .logo {
                    flex-shrink: 0;
                }

                .global-header .logo-link {
                    color: white;
                    text-decoration: none;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: opacity 0.3s ease;
                }

                .global-header .logo-link:hover {
                    opacity: 0.9;
                }

                .global-header .logo-icon {
                    width: 32px;
                    height: 32px;
                    background: #ef4444;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                    color: white;
                    flex-shrink: 0;
                }

                .global-header .logo-text {
                    display: flex;
                    flex-direction: column;
                }

                .global-header .logo-title {
                    font-size: 20px;
                    font-weight: 700;
                    line-height: 1.2;
                    color: white;
                    margin: 0;
                }

                .global-header .logo-subtitle {
                    font-size: 14px;
                    opacity: 0.9;
                    line-height: 1.2;
                    color: white;
                    margin: 0;
                }

                .main-nav {
                    display: flex;
                    gap: 20px;
                    align-items: center;
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

                .user-section {
                    display: flex;
                    align-items: center;
                    gap: 15px;
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
                        gap: 15px;
                    }

                    .main-nav {
                        gap: 15px;
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
                        gap: 10px;
                    }

                    .logo a {
                        font-size: 1.1em;
                    }

                    .main-nav {
                        gap: 8px;
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
                        padding: 6px 8px;
                        gap: 8px;
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
