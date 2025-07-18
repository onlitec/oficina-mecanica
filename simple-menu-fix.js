// Script SIMPLES para remover efeitos indesejados do menu
(function() {
    'use strict';
    
    console.log('🧹 Removendo efeitos indesejados do menu...');
    
    function removeMenuEffects() {
        console.log('🔧 Aplicando correção simples...');

        // 1. Garantir fundo azul
        const header = document.querySelector('.global-header');
        if (header) {
            header.style.setProperty('background', '#5865F2', 'important');
            header.style.setProperty('background-color', '#5865F2', 'important');
            header.style.setProperty('background-image', 'none', 'important');
            console.log('✅ Fundo azul aplicado');
        }

        // 2. Aplicar estilos limpos a TODOS os elementos do menu
        const allLinks = document.querySelectorAll('.nav-link, .main-nav a, .main-nav .nav-link, .main-nav span, .main-nav button, [class*="nav-link"], .main-nav [class*="link"]');
        console.log(`🔍 Encontrados ${allLinks.length} elementos do menu para limpar`);

        allLinks.forEach((link, index) => {
            // Aplicar apenas estilos visuais, preservando funcionalidade
            link.style.setProperty('background', 'none', 'important');
            link.style.setProperty('background-color', 'transparent', 'important');
            link.style.setProperty('background-image', 'none', 'important');
            link.style.setProperty('border', 'none', 'important');
            link.style.setProperty('border-radius', '0', 'important');
            link.style.setProperty('box-shadow', 'none', 'important');
            link.style.setProperty('outline', 'none', 'important');
            link.style.setProperty('color', 'white', 'important');
            link.style.setProperty('font-size', '15px', 'important');
            link.style.setProperty('font-weight', '500', 'important');
            link.style.setProperty('text-decoration', 'none', 'important');
            link.style.setProperty('padding', '8px 12px', 'important');
            link.style.setProperty('margin', '0', 'important');
            link.style.setProperty('transition', 'color 0.2s ease', 'important');
            link.style.setProperty('transform', 'none', 'important');
            link.style.setProperty('animation', 'none', 'important');

            // Verificar se o link é funcional
            if (link.href && !link.href.includes('javascript:')) {
                console.log(`✅ Link ${index + 1} funcional: "${link.textContent.trim()}" -> ${link.href}`);
            } else {
                console.log(`⚠️ Link ${index + 1} pode ter problema: "${link.textContent.trim()}"`);
            }
        });
        
        // 3. Corrigir posicionamento do menu
        const mainNav = document.querySelector('.main-nav');
        if (mainNav) {
            mainNav.style.cssText = `
                position: absolute !important;
                left: 50% !important;
                top: 50% !important;
                transform: translate(-50%, -50%) !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                gap: 20px !important;
                margin: 0 !important;
                padding: 0 !important;
                z-index: 10 !important;
                white-space: nowrap !important;
            `;
            console.log('✅ Menu centralizado');
        }
        
        // 4. Corrigir header content
        const headerContent = document.querySelector('.header-content');
        if (headerContent) {
            headerContent.style.cssText = `
                display: flex !important;
                justify-content: space-between !important;
                align-items: center !important;
                max-width: 1200px !important;
                margin: 0 auto !important;
                padding: 0 20px !important;
                height: 60px !important;
                position: relative !important;
            `;
            console.log('✅ Header content corrigido');
        }
        
        // 5. Injetar CSS limpo
        const existingStyle = document.getElementById('simple-menu-clean');
        if (existingStyle) {
            existingStyle.remove();
        }
        
        const style = document.createElement('style');
        style.id = 'simple-menu-clean';
        style.innerHTML = `
            /* CSS LIMPO PARA MENU APENAS TEXTO */
            .global-header {
                background: #5865F2 !important;
                background-color: #5865F2 !important;
                background-image: none !important;
            }
            
            .nav-link,
            .main-nav .nav-link,
            .main-nav a {
                background: none !important;
                background-color: transparent !important;
                background-image: none !important;
                border: none !important;
                border-radius: 0 !important;
                box-shadow: none !important;
                outline: none !important;
                color: white !important;
                font-size: 15px !important;
                font-weight: 500 !important;
                text-decoration: none !important;
                padding: 8px 12px !important;
                margin: 0 !important;
                transition: none !important;
                transform: none !important;
                animation: none !important;
                scale: none !important;
                text-shadow: none !important;
            }
            
            .nav-link:hover,
            .main-nav .nav-link:hover,
            .main-nav a:hover {
                color: #FFD700 !important;
                background: none !important;
                border: none !important;
                box-shadow: none !important;
                transform: none !important;
                scale: none !important;
                animation: none !important;
                text-shadow: none !important;
            }
            
            .nav-link:focus,
            .nav-link:active,
            .nav-link.active {
                background: none !important;
                border: none !important;
                box-shadow: none !important;
                transform: none !important;
                scale: none !important;
                animation: none !important;
                outline: none !important;
            }
            
            .nav-link::before,
            .nav-link::after {
                display: none !important;
                content: none !important;
            }
            
            .main-nav {
                position: absolute !important;
                left: 50% !important;
                top: 50% !important;
                transform: translate(-50%, -50%) !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                gap: 20px !important;
                z-index: 10 !important;
            }
            
            .header-content {
                display: flex !important;
                justify-content: space-between !important;
                align-items: center !important;
                height: 60px !important;
                padding: 0 20px !important;
            }
        `;
        
        document.head.appendChild(style);
        console.log('✅ CSS limpo injetado');
        
        console.log('🎉 MENU LIMPO APLICADO COM SUCESSO!');
    }
    
    // Aplicar múltiplas vezes para garantir
    function applyMultipleTimes() {
        removeMenuEffects();
        setTimeout(removeMenuEffects, 300);
        setTimeout(removeMenuEffects, 600);
        setTimeout(removeMenuEffects, 1000);
        setTimeout(removeMenuEffects, 2000);
    }
    
    // Aguardar DOM estar pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyMultipleTimes);
    } else {
        applyMultipleTimes();
    }
    
    // Também aplicar quando a janela carregar
    window.addEventListener('load', applyMultipleTimes);
    
    // Observar mudanças no DOM
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                const addedNodes = Array.from(mutation.addedNodes);
                const hasMenu = addedNodes.some(node => 
                    node.nodeType === 1 && 
                    (node.classList?.contains('global-header') || 
                     node.querySelector?.('.global-header') ||
                     node.classList?.contains('nav-link'))
                );
                
                if (hasMenu) {
                    console.log('🔄 Menu detectado, reaplicando limpeza...');
                    setTimeout(removeMenuEffects, 100);
                }
            }
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // Expor função globalmente
    window.removeMenuEffects = removeMenuEffects;
    
    console.log('💡 Para aplicar manualmente: removeMenuEffects()');
    
})();
