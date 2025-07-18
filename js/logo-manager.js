// Sistema de Gerenciamento de Logo Global
console.log('Logo Manager - Iniciando...');

class LogoManager {
    constructor() {
        this.logoUrl = null;
        this.fallbackIcon = '🔧';
        this.companyName = 'Oficina';
        this.companySubtitle = 'Mecânica';
        this.isLoaded = false;
        this.init();
    }

    async init() {
        console.log('Logo Manager - Carregando configurações...');
        await this.loadSystemSettings();
        this.setupLogoUpdateListener();
    }

    // Carregar configurações do sistema
    async loadSystemSettings() {
        try {
            const response = await fetch('/api/settings/system');
            const data = await response.json();
            
            if (data.success && data.data) {
                this.logoUrl = data.data.logoUrl;
                // Usar appName (Nome da Empresa) como prioridade, depois companyName, depois padrão
                this.companyName = data.data.appName || data.data.companyName || 'Oficina';

                console.log('✅ Configurações carregadas:', {
                    logoUrl: this.logoUrl,
                    companyName: this.companyName
                });

                this.isLoaded = true;
                this.updateAllLogos();
            } else {
                console.log('⚠️ Usando configurações padrão');
                this.isLoaded = true;
                this.updateAllLogos();
            }
        } catch (error) {
            console.error('❌ Erro ao carregar configurações:', error);
            this.isLoaded = true;
            this.updateAllLogos();
        }
    }

    // Criar HTML do logo
    createLogoHTML() {
        if (this.logoUrl) {
            // Logo com imagem
            return `
                <a href="/dashboard.html" class="logo-link" style="color: white; text-decoration: none; display: flex; align-items: center; gap: 8px; transition: opacity 0.3s ease;">
                    <img src="${this.logoUrl}" alt="${this.companyName}" class="logo-image" style="height: 40px; width: auto; max-width: 120px; object-fit: contain; border-radius: 4px;">
                    <div class="logo-text" style="display: flex; flex-direction: column;">
                        <div class="logo-title" style="font-size: 20px; font-weight: 700; line-height: 1.2; color: white; margin: 0;">${this.companyName}</div>
                        <div class="logo-subtitle" style="font-size: 14px; opacity: 0.9; line-height: 1.2; color: white; margin: 0;">${this.companySubtitle}</div>
                    </div>
                </a>
            `;
        } else {
            // Logo com emoji (fallback)
            return `
                <a href="/dashboard.html" class="logo-link" style="color: white; text-decoration: none; display: flex; align-items: center; gap: 8px; transition: opacity 0.3s ease;">
                    <div class="logo-icon" style="width: 32px; height: 32px; background: #ef4444; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; color: white; flex-shrink: 0;">${this.fallbackIcon}</div>
                    <div class="logo-text" style="display: flex; flex-direction: column;">
                        <div class="logo-title" style="font-size: 20px; font-weight: 700; line-height: 1.2; color: white; margin: 0;">${this.companyName}</div>
                        <div class="logo-subtitle" style="font-size: 14px; opacity: 0.9; line-height: 1.2; color: white; margin: 0;">${this.companySubtitle}</div>
                    </div>
                </a>
            `;
        }
    }

    // Atualizar todos os logos na página
    updateAllLogos() {
        if (!this.isLoaded) {
            console.log('⏳ Aguardando carregamento das configurações...');
            return;
        }

        console.log('🔄 Atualizando logos na página...');
        
        // Aguardar o global-menu estar presente
        this.waitForGlobalMenu().then(() => {
            this.updateGlobalMenuLogo();
        });
    }

    // Aguardar global menu estar presente
    waitForGlobalMenu() {
        return new Promise((resolve) => {
            const checkMenu = () => {
                const header = document.querySelector('.global-header .header-content');
                if (header) {
                    console.log('✅ Global menu encontrado');
                    resolve(true);
                } else {
                    setTimeout(checkMenu, 100);
                }
            };
            checkMenu();
        });
    }

    // Atualizar logo no global menu
    updateGlobalMenuLogo() {
        const header = document.querySelector('.global-header .header-content');
        if (!header) {
            console.log('❌ Header não encontrado');
            return;
        }

        // Remover logos existentes
        const existingLogos = header.querySelectorAll('.logo');
        existingLogos.forEach(logo => logo.remove());

        // Criar novo logo
        const logoDiv = document.createElement('div');
        logoDiv.className = 'logo';
        logoDiv.id = 'global-logo';
        logoDiv.style.cssText = 'flex-shrink: 0;';
        logoDiv.innerHTML = this.createLogoHTML();

        // Inserir no início do header
        header.insertBefore(logoDiv, header.firstChild);

        console.log('✅ Logo atualizado no global menu');
    }

    // Configurar listener para atualizações de logo
    setupLogoUpdateListener() {
        // Escutar eventos customizados para atualização de logo
        window.addEventListener('logoUpdated', (event) => {
            console.log('🔄 Logo atualizado via evento:', event.detail);
            this.logoUrl = event.detail.logoUrl;
            this.updateAllLogos();
        });

        // Escutar mudanças na página de configurações
        window.addEventListener('settingsUpdated', (event) => {
            console.log('⚙️ Configurações atualizadas:', event.detail);
            if (event.detail.logoUrl !== undefined) {
                this.logoUrl = event.detail.logoUrl;
                this.updateAllLogos();
            }
            if (event.detail.companyName) {
                this.companyName = event.detail.companyName;
                this.updateAllLogos();
            }
        });
    }

    // Método público para atualizar logo
    updateLogo(logoUrl, companyName = null) {
        console.log('🔄 Atualizando logo programaticamente:', logoUrl);
        this.logoUrl = logoUrl;
        if (companyName) {
            this.companyName = companyName;
        }
        this.updateAllLogos();
    }

    // Método público para recarregar configurações
    async reload() {
        console.log('🔄 Recarregando configurações do logo...');
        this.isLoaded = false;
        await this.loadSystemSettings();
    }
}

// Instância global do gerenciador de logo
window.logoManager = new LogoManager();

// Aguardar DOM estar carregado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => window.logoManager.updateAllLogos(), 1000);
    });
} else {
    setTimeout(() => window.logoManager.updateAllLogos(), 1000);
}

// Também executar quando a página estiver completamente carregada
window.addEventListener('load', () => {
    setTimeout(() => window.logoManager.updateAllLogos(), 1500);
});

console.log('Logo Manager - Configurado e pronto!');
