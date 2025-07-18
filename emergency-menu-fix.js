// SCRIPT DE EMERGÊNCIA - APLICAR MENU APENAS TEXTO IMEDIATAMENTE
(function() {
    'use strict';
    
    console.log('🚨 EMERGÊNCIA: Aplicando menu apenas texto AGORA!');
    
    function applyTextOnlyMenu() {
        console.log('🎨 Aplicando estilo apenas texto...');
        
        // 1. FORÇAR COR DE FUNDO AZUL
        const header = document.querySelector('.global-header');
        if (header) {
            header.style.setProperty('background', '#5865F2', 'important');
            header.style.setProperty('background-image', 'none', 'important');
            header.style.setProperty('background-color', '#5865F2', 'important');
            console.log('✅ Fundo azul aplicado');
        }
        
        // 2. REMOVER TODOS OS ESTILOS DOS LINKS
        const allLinks = document.querySelectorAll('.nav-link, .main-nav a, .main-nav .nav-link, [class*="nav-link"]');
        console.log(`🔍 Encontrados ${allLinks.length} links para modificar`);
        
        allLinks.forEach((link, index) => {
            // Resetar completamente o estilo
            link.style.cssText = '';
            
            // Aplicar estilo apenas texto
            link.style.setProperty('background', 'transparent', 'important');
            link.style.setProperty('background-color', 'transparent', 'important');
            link.style.setProperty('background-image', 'none', 'important');
            link.style.setProperty('border', 'none', 'important');
            link.style.setProperty('border-radius', '0', 'important');
            link.style.setProperty('box-shadow', 'none', 'important');
            link.style.setProperty('outline', 'none', 'important');
            link.style.setProperty('padding', '8px 16px', 'important');
            link.style.setProperty('margin', '0', 'important');
            link.style.setProperty('color', 'white', 'important');
            link.style.setProperty('font-size', '16px', 'important');
            link.style.setProperty('font-weight', '500', 'important');
            link.style.setProperty('text-decoration', 'none', 'important');
            link.style.setProperty('display', 'inline-block', 'important');
            link.style.setProperty('white-space', 'nowrap', 'important');
            link.style.setProperty('transition', 'all 0.3s ease', 'important');
            link.style.setProperty('cursor', 'pointer', 'important');
            link.style.setProperty('text-align', 'center', 'important');
            link.style.setProperty('line-height', '1.4', 'important');
            link.style.setProperty('min-height', 'auto', 'important');
            link.style.setProperty('height', 'auto', 'important');
            link.style.setProperty('width', 'auto', 'important');
            
            // Remover classes que podem interferir
            link.classList.remove('btn', 'button', 'nav-button');
            
            console.log(`✅ Link ${index + 1} estilizado: "${link.textContent.trim()}"`);
        });
        
        // 3. APLICAR HOVER VIA JAVASCRIPT
        allLinks.forEach(link => {
            // Remover listeners antigos
            link.removeEventListener('mouseenter', link._emergencyHoverIn);
            link.removeEventListener('mouseleave', link._emergencyHoverOut);
            
            // Adicionar novos listeners
            link._emergencyHoverIn = function() {
                this.style.setProperty('color', '#FFD700', 'important');
                this.style.setProperty('text-shadow', '0 0 8px rgba(255,215,0,0.6)', 'important');
                this.style.setProperty('transform', 'scale(1.05)', 'important');
                this.style.setProperty('background', 'transparent', 'important');
                this.style.setProperty('border', 'none', 'important');
                this.style.setProperty('box-shadow', 'none', 'important');
            };
            
            link._emergencyHoverOut = function() {
                this.style.setProperty('color', 'white', 'important');
                this.style.setProperty('text-shadow', 'none', 'important');
                this.style.setProperty('transform', 'scale(1)', 'important');
                this.style.setProperty('background', 'transparent', 'important');
                this.style.setProperty('border', 'none', 'important');
                this.style.setProperty('box-shadow', 'none', 'important');
            };
            
            link.addEventListener('mouseenter', link._emergencyHoverIn);
            link.addEventListener('mouseleave', link._emergencyHoverOut);
        });
        
        // 4. AJUSTAR GAP DO MENU
        const mainNav = document.querySelector('.main-nav');
        if (mainNav) {
            mainNav.style.setProperty('gap', '24px', 'important');
            mainNav.style.setProperty('display', 'flex', 'important');
            mainNav.style.setProperty('align-items', 'center', 'important');
            mainNav.style.setProperty('justify-content', 'center', 'important');
            console.log('✅ Gap do menu ajustado');
        }
        
        // 5. INJETAR CSS DE FORÇA BRUTA
        const existingStyle = document.getElementById('emergency-text-only-css');
        if (existingStyle) {
            existingStyle.remove();
        }
        
        const style = document.createElement('style');
        style.id = 'emergency-text-only-css';
        style.innerHTML = `
            /* CSS DE EMERGÊNCIA - MENU APENAS TEXTO */
            .global-header {
                background: #5865F2 !important;
                background-color: #5865F2 !important;
                background-image: none !important;
            }
            
            .nav-link,
            .main-nav .nav-link,
            .main-nav a,
            a.nav-link,
            [class*="nav-link"] {
                background: transparent !important;
                background-color: transparent !important;
                background-image: none !important;
                border: none !important;
                border-radius: 0 !important;
                box-shadow: none !important;
                outline: none !important;
                padding: 8px 16px !important;
                margin: 0 !important;
                color: white !important;
                font-size: 16px !important;
                font-weight: 500 !important;
                text-decoration: none !important;
                display: inline-block !important;
                white-space: nowrap !important;
                transition: all 0.3s ease !important;
                cursor: pointer !important;
                text-align: center !important;
                line-height: 1.4 !important;
                min-height: auto !important;
                height: auto !important;
                width: auto !important;
            }
            
            .nav-link:hover,
            .main-nav .nav-link:hover,
            .main-nav a:hover,
            a.nav-link:hover,
            [class*="nav-link"]:hover {
                background: transparent !important;
                background-color: transparent !important;
                background-image: none !important;
                border: none !important;
                box-shadow: none !important;
                color: #FFD700 !important;
                text-shadow: 0 0 8px rgba(255,215,0,0.6) !important;
                transform: scale(1.05) !important;
            }
            
            .nav-link.active,
            .main-nav .nav-link.active {
                background: transparent !important;
                background-color: transparent !important;
                background-image: none !important;
                border: none !important;
                box-shadow: none !important;
                color: #FFD700 !important;
                text-shadow: 0 0 8px rgba(255,215,0,0.8) !important;
            }
            
            .main-nav {
                gap: 24px !important;
            }
        `;
        
        document.head.appendChild(style);
        console.log('✅ CSS de emergência injetado');
        
        console.log('🎉 MENU APENAS TEXTO APLICADO COM SUCESSO!');
        
        // Verificar resultado
        setTimeout(() => {
            const testLink = document.querySelector('.nav-link');
            if (testLink) {
                const computedStyle = window.getComputedStyle(testLink);
                console.log('🔍 Verificação final:');
                console.log(`- Background: ${computedStyle.background}`);
                console.log(`- Border: ${computedStyle.border}`);
                console.log(`- Color: ${computedStyle.color}`);
                console.log(`- Font-size: ${computedStyle.fontSize}`);
                
                if (computedStyle.background.includes('transparent') || computedStyle.backgroundColor === 'rgba(0, 0, 0, 0)') {
                    console.log('✅ SUCESSO! Menu está apenas texto');
                } else {
                    console.log('⚠️ Ainda há background nos links');
                }
            }
        }, 500);
    }
    
    // Aplicar múltiplas vezes para garantir
    function applyMultipleTimes() {
        applyTextOnlyMenu();
        setTimeout(applyTextOnlyMenu, 200);
        setTimeout(applyTextOnlyMenu, 500);
        setTimeout(applyTextOnlyMenu, 1000);
        setTimeout(applyTextOnlyMenu, 2000);
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
                const hasNavLink = addedNodes.some(node => 
                    node.nodeType === 1 && 
                    (node.classList?.contains('nav-link') || 
                     node.querySelector?.('.nav-link') ||
                     node.classList?.contains('global-header'))
                );
                
                if (hasNavLink) {
                    console.log('🔄 Menu detectado, reaplicando estilos...');
                    setTimeout(applyTextOnlyMenu, 100);
                }
            }
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // Expor função globalmente
    window.applyTextOnlyMenu = applyTextOnlyMenu;
    
    console.log('💡 Para aplicar manualmente: applyTextOnlyMenu()');
    
})();
