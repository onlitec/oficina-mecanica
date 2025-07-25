// Logo Manager - COMPLETAMENTE DESABILITADO
console.log('⚠️ Logo Manager COMPLETAMENTE DESABILITADO');

class LogoManager {
    constructor() {
        // VAZIO - NÃO FAZ NADA
    }

    // TODOS OS MÉTODOS VAZIOS
    async init() { return; }
    async loadSystemSettings() { return; }
    setupLogoUpdateListener() { return; }
    waitForGlobalMenu() { return Promise.resolve(); }
    waitForElement() { return Promise.resolve(); }
    updateAllLogos() { return; }
    updateGlobalMenuLogo() { return; }
    createLogoHTML() { return ''; }
    updateLogo() { return; }
    async reload() { return; }
}

// Instância global VAZIA
window.logoManager = new LogoManager();

console.log('✅ Logo Manager completamente desabilitado');
