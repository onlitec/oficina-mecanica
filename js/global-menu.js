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

    // Force center menu via JavaScript
    forceCenterMenu() {
        // Aplicar múltiplas vezes para garantir
        const applyCenter = () => {
            const mainNav = document.querySelector('.main-nav');
            const headerContent = document.querySelector('.header-content');

            if (mainNav && headerContent) {
                // Remover qualquer estilo conflitante
                mainNav.style.cssText = '';

                // Aplicar centralização absoluta E layout dos itens
                mainNav.style.setProperty('position', 'absolute', 'important');
                mainNav.style.setProperty('left', '50%', 'important');
                mainNav.style.setProperty('top', '50%', 'important');
                mainNav.style.setProperty('transform', 'translate(-50%, -50%)', 'important');
                mainNav.style.setProperty('z-index', '9999', 'important');
                mainNav.style.setProperty('display', 'flex', 'important');
                mainNav.style.setProperty('justify-content', 'center', 'important');
                mainNav.style.setProperty('align-items', 'center', 'important');
                mainNav.style.setProperty('margin', '0', 'important');
                mainNav.style.setProperty('padding', '0', 'important');
                mainNav.style.setProperty('gap', '10px', 'important');
                mainNav.style.setProperty('flex-wrap', 'nowrap', 'important');

                // Aplicar estilos aos links do menu
                const navLinks = mainNav.querySelectorAll('.nav-link');
                navLinks.forEach(link => {
                    link.style.setProperty('padding', '8px 12px', 'important');
                    link.style.setProperty('font-size', '0.9em', 'important');
                    link.style.setProperty('white-space', 'nowrap', 'important');
                    link.style.setProperty('margin', '0', 'important');
                    link.style.setProperty('display', 'inline-block', 'important');
                    link.style.setProperty('font-weight', '500', 'important');
                    link.style.setProperty('min-height', '36px', 'important');
                    link.style.setProperty('line-height', '1.2', 'important');
                });

                // Garantir que o header tenha position relative
                headerContent.style.setProperty('position', 'relative', 'important');

                console.log('Menu centralização E layout FORÇADOS via JavaScript');

                return true;
            }
            return false;
        };

        // Aplicar imediatamente
        setTimeout(applyCenter, 50);

        // Aplicar novamente após carregamento
        setTimeout(applyCenter, 200);

        // Aplicar uma terceira vez para garantir
        setTimeout(applyCenter, 500);

        // Verificação final
        setTimeout(() => {
            const mainNav = document.querySelector('.main-nav');
            const headerContent = document.querySelector('.header-content');

            if (mainNav && headerContent) {
                const rect = mainNav.getBoundingClientRect();
                const headerRect = headerContent.getBoundingClientRect();
                const navCenter = rect.left + rect.width / 2;
                const headerCenter = headerRect.left + headerRect.width / 2;
                const offset = Math.abs(navCenter - headerCenter);

                console.log(`VERIFICAÇÃO FINAL: nav=${navCenter.toFixed(1)}, header=${headerCenter.toFixed(1)}, offset=${offset.toFixed(1)}`);

                if (offset > 5) {
                    console.error('MENU AINDA NÃO CENTRALIZADO! Aplicando correção de emergência...');
                    // Correção de emergência
                    applyCenter();
                } else {
                    console.log('✅ MENU CENTRALIZADO COM SUCESSO!');
                }
            }
        }, 1000);
    }

    // Fix menu layout to prevent overlapping
    fixMenuLayout() {
        setTimeout(() => {
            console.log('🔧 Corrigindo layout dos itens do menu...');

            // Corrigir header content
            const headerContent = document.querySelector('.header-content');
            if (headerContent) {
                headerContent.style.setProperty('display', 'flex', 'important');
                headerContent.style.setProperty('justify-content', 'space-between', 'important');
                headerContent.style.setProperty('align-items', 'center', 'important');
                headerContent.style.setProperty('padding', '8px 16px', 'important');
                headerContent.style.setProperty('position', 'relative', 'important');
            }

            // Corrigir logo section
            const logoSection = document.querySelector('.logo-section');
            if (logoSection) {
                logoSection.style.setProperty('flex', '0 0 auto', 'important');
                logoSection.style.setProperty('min-width', '150px', 'important');
                logoSection.style.setProperty('max-width', '200px', 'important');
                logoSection.style.setProperty('overflow', 'hidden', 'important');
            }

            // Corrigir user section
            const userSection = document.querySelector('.user-section');
            if (userSection) {
                userSection.style.setProperty('flex', '0 0 auto', 'important');
                userSection.style.setProperty('min-width', '200px', 'important');
                userSection.style.setProperty('max-width', '250px', 'important');
                userSection.style.setProperty('justify-content', 'flex-end', 'important');
                userSection.style.setProperty('gap', '8px', 'important');
                userSection.style.setProperty('overflow', 'hidden', 'important');
            }

            // Corrigir user info
            const userInfo = document.querySelector('.user-info');
            if (userInfo) {
                userInfo.style.setProperty('max-width', '120px', 'important');
                userInfo.style.setProperty('overflow', 'hidden', 'important');
                userInfo.style.setProperty('text-align', 'right', 'important');
            }

            // Corrigir user name e role
            const userName = document.querySelector('.user-name');
            const userRole = document.querySelector('.user-role');

            if (userName) {
                userName.style.setProperty('font-size', '0.8em', 'important');
                userName.style.setProperty('white-space', 'nowrap', 'important');
                userName.style.setProperty('overflow', 'hidden', 'important');
                userName.style.setProperty('text-overflow', 'ellipsis', 'important');
                userName.style.setProperty('max-width', '100%', 'important');
            }

            if (userRole) {
                userRole.style.setProperty('font-size', '0.65em', 'important');
                userRole.style.setProperty('white-space', 'nowrap', 'important');
                userRole.style.setProperty('overflow', 'hidden', 'important');
                userRole.style.setProperty('text-overflow', 'ellipsis', 'important');
                userRole.style.setProperty('max-width', '100%', 'important');
            }

            console.log('✅ Layout dos itens corrigido!');
        }, 200);
    }

    // Force text-only style (no borders, no backgrounds)
    forceTextOnlyStyle() {
        setTimeout(() => {
            console.log('🎨 Forçando estilo apenas texto...');

            // Aplicar estilo a todos os links do menu
            const allNavLinks = document.querySelectorAll('.nav-link, .main-nav a, .main-nav .nav-link');

            allNavLinks.forEach((link, index) => {
                // Remover todos os estilos de borda e background
                link.style.setProperty('background', 'transparent', 'important');
                link.style.setProperty('border', 'none', 'important');
                link.style.setProperty('border-radius', '0', 'important');
                link.style.setProperty('box-shadow', 'none', 'important');
                link.style.setProperty('outline', 'none', 'important');
                link.style.setProperty('padding', '8px 16px', 'important');
                link.style.setProperty('margin', '0', 'important');
                link.style.setProperty('color', 'white', 'important');
                link.style.setProperty('font-size', '1em', 'important');
                link.style.setProperty('font-weight', '500', 'important');
                link.style.setProperty('text-decoration', 'none', 'important');
                link.style.setProperty('display', 'inline-block', 'important');
                link.style.setProperty('white-space', 'nowrap', 'important');
                link.style.setProperty('transition', 'all 0.3s ease', 'important');

                // Remover event listeners antigos e adicionar novos
                link.removeEventListener('mouseenter', link._hoverIn);
                link.removeEventListener('mouseleave', link._hoverOut);

                // Adicionar novos event listeners para hover
                link._hoverIn = function() {
                    this.style.setProperty('color', '#FFD700', 'important');
                    this.style.setProperty('text-shadow', '0 0 8px rgba(255,215,0,0.6)', 'important');
                    this.style.setProperty('transform', 'scale(1.05)', 'important');
                    this.style.setProperty('background', 'transparent', 'important');
                    this.style.setProperty('border', 'none', 'important');
                    this.style.setProperty('box-shadow', 'none', 'important');
                };

                link._hoverOut = function() {
                    this.style.setProperty('color', 'white', 'important');
                    this.style.setProperty('text-shadow', 'none', 'important');
                    this.style.setProperty('transform', 'scale(1)', 'important');
                    this.style.setProperty('background', 'transparent', 'important');
                    this.style.setProperty('border', 'none', 'important');
                    this.style.setProperty('box-shadow', 'none', 'important');
                };

                link.addEventListener('mouseenter', link._hoverIn);
                link.addEventListener('mouseleave', link._hoverOut);

                console.log(`✅ Estilo texto aplicado ao link ${index + 1}: ${link.textContent.trim()}`);
            });

            // Forçar gap do menu
            const mainNav = document.querySelector('.main-nav');
            if (mainNav) {
                mainNav.style.setProperty('gap', '24px', 'important');
            }

            console.log('✅ Estilo apenas texto aplicado com sucesso!');
        }, 300);
    }

    // Apply direct hover effects
    applyDirectHover() {
        setTimeout(() => {
            console.log('✨ Aplicando hover direto...');

            const allNavLinks = document.querySelectorAll('.nav-link');

            allNavLinks.forEach((link, index) => {
                // Remover listeners antigos
                link.removeEventListener('mouseenter', link._directHoverIn);
                link.removeEventListener('mouseleave', link._directHoverOut);

                // Adicionar hover direto
                link._directHoverIn = function() {
                    this.style.setProperty('color', '#FFD700', 'important');
                    this.style.setProperty('text-shadow', '0 0 8px rgba(255,215,0,0.6)', 'important');
                    this.style.setProperty('transform', 'scale(1.05)', 'important');
                    this.style.setProperty('background', 'transparent', 'important');
                    this.style.setProperty('border', 'none', 'important');
                    this.style.setProperty('box-shadow', 'none', 'important');
                };

                link._directHoverOut = function() {
                    this.style.setProperty('color', 'white', 'important');
                    this.style.setProperty('text-shadow', 'none', 'important');
                    this.style.setProperty('transform', 'scale(1)', 'important');
                    this.style.setProperty('background', 'transparent', 'important');
                    this.style.setProperty('border', 'none', 'important');
                    this.style.setProperty('box-shadow', 'none', 'important');
                };

                link.addEventListener('mouseenter', link._directHoverIn);
                link.addEventListener('mouseleave', link._directHoverOut);

                console.log(`✅ Hover aplicado ao link ${index + 1}: ${link.textContent.trim()}`);
            });

            console.log('✅ Hover direto aplicado com sucesso!');
        }, 400);
    }

    // Fix irregular positioning of menu items
    fixIrregularPositioning() {
        setTimeout(() => {
            console.log('📐 Corrigindo posicionamento irregular...');

            // Corrigir header content
            const headerContent = document.querySelector('.header-content');
            if (headerContent) {
                headerContent.style.setProperty('display', 'flex', 'important');
                headerContent.style.setProperty('justify-content', 'space-between', 'important');
                headerContent.style.setProperty('align-items', 'center', 'important');
                headerContent.style.setProperty('height', '60px', 'important');
                headerContent.style.setProperty('padding', '0 20px', 'important');
                console.log('✅ Header content corrigido');
            }

            // Corrigir main nav
            const mainNav = document.querySelector('.main-nav');
            if (mainNav) {
                mainNav.style.setProperty('position', 'absolute', 'important');
                mainNav.style.setProperty('left', '50%', 'important');
                mainNav.style.setProperty('top', '50%', 'important');
                mainNav.style.setProperty('transform', 'translate(-50%, -50%)', 'important');
                mainNav.style.setProperty('display', 'flex', 'important');
                mainNav.style.setProperty('align-items', 'center', 'important');
                mainNav.style.setProperty('justify-content', 'center', 'important');
                mainNav.style.setProperty('gap', '16px', 'important');
                mainNav.style.setProperty('white-space', 'nowrap', 'important');
                mainNav.style.setProperty('z-index', '10', 'important');
                console.log('✅ Main nav posicionado');
            }

            // Corrigir cada link individualmente
            const navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach((link, index) => {
                link.style.setProperty('display', 'inline-block', 'important');
                link.style.setProperty('vertical-align', 'middle', 'important');
                link.style.setProperty('text-align', 'center', 'important');
                link.style.setProperty('white-space', 'nowrap', 'important');
                link.style.setProperty('margin', '0', 'important');
                link.style.setProperty('padding', '8px 12px', 'important');
                console.log(`✅ Link ${index + 1} alinhado: ${link.textContent.trim()}`);
            });

            // Corrigir logo section
            const logoSection = document.querySelector('.logo-section');
            if (logoSection) {
                logoSection.style.setProperty('flex', '0 0 auto', 'important');
                logoSection.style.setProperty('min-width', '160px', 'important');
                logoSection.style.setProperty('max-width', '180px', 'important');
                logoSection.style.setProperty('overflow', 'hidden', 'important');
                console.log('✅ Logo section corrigida');
            }

            // Corrigir user section
            const userSection = document.querySelector('.user-section');
            if (userSection) {
                userSection.style.setProperty('flex', '0 0 auto', 'important');
                userSection.style.setProperty('min-width', '180px', 'important');
                userSection.style.setProperty('max-width', '200px', 'important');
                userSection.style.setProperty('justify-content', 'flex-end', 'important');
                userSection.style.setProperty('overflow', 'hidden', 'important');
                console.log('✅ User section corrigida');
            }

            console.log('✅ Posicionamento irregular corrigido!');
        }, 500);
    }

    // Create clean menu HTML
    createMenuHTML() {
        const menuHTML = `
            <div class="global-header" style="background: #5865F2 !important; background-color: #5865F2 !important; background-image: none !important;">
                <div class="header-content">
                    <div class="logo-section">
                        <div class="logo">
                            <!-- Logo será inserido pelo logo-manager.js -->
                        </div>
                        <div class="company-name" id="companyName">
                            Sistema de Gestão
                        </div>
                    </div>

                    <nav class="main-nav" style="gap: 24px !important;">
                        <a href="/customers.html" class="nav-link" data-page="customers" style="background: transparent !important; border: none !important; color: white !important; padding: 8px 16px !important; font-size: 16px !important; font-weight: 500 !important; text-decoration: none !important; margin: 0 !important; box-shadow: none !important; outline: none !important; border-radius: 0 !important;">
                            👥 Clientes
                        </a>
                        <a href="/service-orders.html" class="nav-link" data-page="service-orders" style="background: transparent !important; border: none !important; color: white !important; padding: 8px 16px !important; font-size: 16px !important; font-weight: 500 !important; text-decoration: none !important; margin: 0 !important; box-shadow: none !important; outline: none !important; border-radius: 0 !important;">
                            🔧 Ordens de Serviço
                        </a>
                        <a href="/parts.html" class="nav-link" data-page="parts" style="background: transparent !important; border: none !important; color: white !important; padding: 8px 16px !important; font-size: 16px !important; font-weight: 500 !important; text-decoration: none !important; margin: 0 !important; box-shadow: none !important; outline: none !important; border-radius: 0 !important;">
                            📦 Peças
                        </a>
                        <a href="/quotes.html" class="nav-link" data-page="quotes" style="background: transparent !important; border: none !important; color: white !important; padding: 8px 16px !important; font-size: 16px !important; font-weight: 500 !important; text-decoration: none !important; margin: 0 !important; box-shadow: none !important; outline: none !important; border-radius: 0 !important;">
                            📋 Orçamentos
                        </a>
                        <a href="/financial.html" class="nav-link" data-page="financial" style="background: transparent !important; border: none !important; color: white !important; padding: 8px 16px !important; font-size: 16px !important; font-weight: 500 !important; text-decoration: none !important; margin: 0 !important; box-shadow: none !important; outline: none !important; border-radius: 0 !important;">
                            💰 Financeiro
                        </a>
                        <a href="/analytics.html" class="nav-link" data-page="analytics" style="background: transparent !important; border: none !important; color: white !important; padding: 8px 16px !important; font-size: 16px !important; font-weight: 500 !important; text-decoration: none !important; margin: 0 !important; box-shadow: none !important; outline: none !important; border-radius: 0 !important;">
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

        // Forçar centralização do menu
        this.forceCenterMenu();

        // Corrigir layout dos itens
        this.fixMenuLayout();

        // Forçar estilo apenas texto
        this.forceTextOnlyStyle();

        // Aplicar hover diretamente
        this.applyDirectHover();

        // Corrigir posicionamento irregular
        this.fixIrregularPositioning();

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
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    right: 0 !important;
                    z-index: 1000 !important;
                    background: #5865F2 !important;
                    background-color: #5865F2 !important;
                    background-image: none !important;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
                }

                .header-content {
                    max-width: 1200px !important;
                    width: 100% !important;
                    margin: 0 auto !important;
                    display: flex !important;
                    align-items: center !important;
                    padding: 10px 20px !important;
                    box-sizing: border-box !important;
                    position: relative !important;
                    justify-content: space-between !important;
                    height: 60px !important;
                }

                .logo-section {
                    display: flex !important;
                    align-items: center !important;
                    gap: 8px !important;
                    flex: 0 0 auto !important;
                    min-width: 160px !important;
                    max-width: 180px !important;
                    padding-left: 10px !important;
                    overflow: hidden !important;
                }

                .company-name {
                    color: white;
                    font-weight: 600;
                    font-size: 0.95em;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    max-width: 150px;
                }

                .main-nav {
                    display: flex !important;
                    gap: 20px !important;
                    align-items: center !important;
                    justify-content: center !important;
                    white-space: nowrap !important;
                    flex-wrap: nowrap !important;
                    position: absolute !important;
                    left: 50% !important;
                    top: 50% !important;
                    transform: translate(-50%, -50%) !important;
                    z-index: 10 !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    width: auto !important;
                    height: auto !important;
                }

                .user-section {
                    display: flex !important;
                    align-items: center !important;
                    gap: 8px !important;
                    flex: 0 0 auto !important;
                    min-width: 200px !important;
                    max-width: 220px !important;
                    justify-content: flex-end !important;
                    padding-right: 10px !important;
                    overflow: hidden !important;
                }

                /* CSS MÍNIMO PARA EVITAR CONFLITOS */
                .nav-link {
                    color: white !important;
                    text-decoration: none !important;
                    background: transparent !important;
                    border: none !important;
                    box-shadow: none !important;
                    outline: none !important;
                }

                /* HOVER SIMPLIFICADO */
                .nav-link:hover {
                    color: #FFD700 !important;
                    background: transparent !important;
                    border: none !important;
                    box-shadow: none !important;
                }

                .nav-link.active {
                    background: transparent !important;
                    color: #ffd700 !important;
                    text-shadow: 0 0 8px rgba(255,215,0,0.8) !important;
                    border: none !important;
                    box-shadow: none !important;
                }

                /* FORÇA MÁXIMA - REMOVER TODAS AS BORDAS E BACKGROUNDS */
                .nav-link,
                .main-nav .nav-link,
                .main-nav a,
                a.nav-link,
                [class*="nav-link"] {
                    background: transparent !important;
                    border: none !important;
                    border-radius: 0 !important;
                    box-shadow: none !important;
                    outline: none !important;
                    padding: 8px 16px !important;
                    margin: 0 !important;
                    color: white !important;
                    font-size: 1em !important;
                    font-weight: 500 !important;
                }

                .nav-link:hover,
                .main-nav .nav-link:hover,
                .main-nav a:hover {
                    background: transparent !important;
                    border: none !important;
                    box-shadow: none !important;
                    color: #FFD700 !important;
                    text-shadow: 0 0 8px rgba(255,215,0,0.6) !important;
                }



                .settings-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 36px;
                    height: 36px;
                    background: rgba(255,255,255,0.15);
                    color: white;
                    text-decoration: none;
                    border-radius: 50%;
                    font-size: 1.1em;
                    transition: all 0.3s ease;
                    border: 2px solid transparent;
                    flex-shrink: 0;
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
                    margin-right: 8px;
                    max-width: 150px;
                    overflow: hidden;
                }

                .user-name {
                    font-weight: 600;
                    font-size: 0.85em;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    max-width: 100%;
                }

                .user-role {
                    font-size: 0.7em;
                    opacity: 0.8;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    max-width: 100%;
                }

                .logout-btn {
                    background: rgba(255,255,255,0.15);
                    color: white;
                    border: 1px solid rgba(255,255,255,0.3);
                    padding: 6px 12px;
                    border-radius: 15px;
                    cursor: pointer;
                    font-size: 0.8em;
                    font-weight: 500;
                    transition: all 0.3s ease;
                    white-space: nowrap;
                }

                .logout-btn:hover {
                    background: rgba(255,255,255,0.25);
                    transform: translateY(-1px);
                    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                }

                body {
                    padding-top: 70px !important;
                }

                /* FORÇA CENTRALIZAÇÃO ABSOLUTA - MÁXIMA PRIORIDADE */
                .global-header .main-nav,
                .main-nav,
                nav.main-nav,
                .header-content .main-nav {
                    position: absolute !important;
                    left: 50% !important;
                    top: 50% !important;
                    transform: translate(-50%, -50%) !important;
                    display: flex !important;
                    justify-content: center !important;
                    align-items: center !important;
                    z-index: 9999 !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    width: auto !important;
                    height: auto !important;
                    right: auto !important;
                    bottom: auto !important;
                    float: none !important;
                    clear: none !important;
                    grid-column: unset !important;
                    grid-row: unset !important;
                    justify-self: unset !important;
                    align-self: unset !important;
                }

                /* Garante que o header tenha position relative */
                .global-header .header-content,
                .header-content {
                    position: relative !important;
                    overflow: visible !important;
                }

                /* Responsive design */
                @media (max-width: 900px) {
                    .header-content {
                        max-width: 100%;
                        padding: 8px 12px;
                    }

                    .logo-section {
                        min-width: 120px;
                    }

                    .user-section {
                        min-width: 120px;
                    }

                    .main-nav {
                        gap: 8px;
                    }

                    .nav-link {
                        padding: 6px 12px;
                        font-size: 0.85em;
                    }

                    .user-info {
                        max-width: 100px;
                    }

                    .user-name {
                        font-size: 0.8em;
                    }

                    .user-role {
                        font-size: 0.65em;
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
                        padding: 6px 8px;
                    }

                    .logo-section {
                        min-width: 100px;
                    }

                    .user-section {
                        min-width: 100px;
                    }

                    .main-nav {
                        gap: 6px;
                        flex-wrap: wrap;
                        justify-content: center;
                    }

                    .nav-link {
                        padding: 5px 8px;
                        font-size: 0.8em;
                    }

                    .user-info {
                        display: none;
                    }

                    .settings-btn {
                        width: 32px;
                        height: 32px;
                        font-size: 1em;
                    }

                    .logout-btn {
                        padding: 4px 8px;
                        font-size: 0.75em;
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
