// Script para forçar correção COMPLETA do menu - todos os elementos
(function() {
    'use strict';
    
    console.log('💪 Forçando correção COMPLETA do menu...');
    
    function forceCompleteMenuFix() {
        console.log('🔧 Aplicando correção força bruta...');
        
        // 1. Garantir fundo azul
        const header = document.querySelector('.global-header');
        if (header) {
            header.style.setProperty('background', '#5865F2', 'important');
            header.style.setProperty('background-color', '#5865F2', 'important');
            header.style.setProperty('background-image', 'none', 'important');
            console.log('✅ Fundo azul garantido');
        }
        
        // 2. Encontrar TODOS os elementos dentro do menu principal
        const mainNav = document.querySelector('.main-nav');
        if (mainNav) {
            // Aplicar estilo ao container
            mainNav.style.setProperty('background', 'none', 'important');
            mainNav.style.setProperty('border', 'none', 'important');
            
            // Encontrar TODOS os elementos filhos (qualquer tag)
            const allElements = mainNav.querySelectorAll('*');
            console.log(`🔍 Encontrados ${allElements.length} elementos dentro do menu`);
            
            allElements.forEach((element, index) => {
                // Aplicar estilo limpo a QUALQUER elemento
                element.style.setProperty('background', 'none', 'important');
                element.style.setProperty('background-color', 'transparent', 'important');
                element.style.setProperty('background-image', 'none', 'important');
                element.style.setProperty('border', 'none', 'important');
                element.style.setProperty('border-radius', '0', 'important');
                element.style.setProperty('box-shadow', 'none', 'important');
                element.style.setProperty('outline', 'none', 'important');
                element.style.setProperty('color', 'white', 'important');
                element.style.setProperty('text-decoration', 'none', 'important');
                element.style.setProperty('transform', 'none', 'important');
                element.style.setProperty('animation', 'none', 'important');
                element.style.setProperty('transition', 'color 0.2s ease', 'important');
                
                // Se for um elemento clicável, garantir cursor pointer
                if (element.tagName === 'A' || element.tagName === 'BUTTON' || element.onclick || element.href) {
                    element.style.setProperty('cursor', 'pointer', 'important');
                    element.style.setProperty('padding', '8px 12px', 'important');
                    element.style.setProperty('margin', '0', 'important');
                    element.style.setProperty('font-size', '15px', 'important');
                    element.style.setProperty('font-weight', '500', 'important');
                    
                    console.log(`✅ Elemento ${index + 1} (${element.tagName}) limpo: "${element.textContent.trim()}"`);
                }
            });
            
            // 3. Aplicar hover a TODOS os elementos clicáveis
            const clickableElements = mainNav.querySelectorAll('a, button, [onclick], [href], .nav-link, [class*="link"]');
            console.log(`🖱️ Aplicando hover a ${clickableElements.length} elementos clicáveis`);
            
            clickableElements.forEach((element, index) => {
                // Remover listeners antigos
                element.removeEventListener('mouseenter', element._forceHoverIn);
                element.removeEventListener('mouseleave', element._forceHoverOut);
                
                // Adicionar hover simples
                element._forceHoverIn = function() {
                    this.style.setProperty('color', '#FFD700', 'important');
                    this.style.setProperty('background', 'none', 'important');
                    this.style.setProperty('border', 'none', 'important');
                    this.style.setProperty('box-shadow', 'none', 'important');
                    this.style.setProperty('transform', 'none', 'important');
                    this.style.setProperty('animation', 'none', 'important');
                };
                
                element._forceHoverOut = function() {
                    this.style.setProperty('color', 'white', 'important');
                    this.style.setProperty('background', 'none', 'important');
                    this.style.setProperty('border', 'none', 'important');
                    this.style.setProperty('box-shadow', 'none', 'important');
                    this.style.setProperty('transform', 'none', 'important');
                    this.style.setProperty('animation', 'none', 'important');
                };
                
                element.addEventListener('mouseenter', element._forceHoverIn);
                element.addEventListener('mouseleave', element._forceHoverOut);
                
                console.log(`✅ Hover aplicado ao elemento ${index + 1}: "${element.textContent.trim()}"`);
            });
        }
        
        // 4. Injetar CSS de força máxima
        const existingStyle = document.getElementById('force-complete-menu-css');
        if (existingStyle) {
            existingStyle.remove();
        }
        
        const style = document.createElement('style');
        style.id = 'force-complete-menu-css';
        style.innerHTML = `
            /* CSS DE FORÇA MÁXIMA PARA MENU LIMPO */
            .global-header {
                background: #5865F2 !important;
                background-color: #5865F2 !important;
                background-image: none !important;
            }
            
            /* FORÇA BRUTA - Qualquer elemento dentro do menu */
            .main-nav,
            .main-nav *,
            .main-nav > *,
            .main-nav > * > *,
            .main-nav > * > * > *,
            .main-nav a,
            .main-nav button,
            .main-nav span,
            .main-nav div,
            [class*="nav"],
            [class*="link"] {
                background: none !important;
                background-color: transparent !important;
                background-image: none !important;
                border: none !important;
                border-radius: 0 !important;
                box-shadow: none !important;
                outline: none !important;
                color: white !important;
                text-decoration: none !important;
                transform: none !important;
                animation: none !important;
                transition: color 0.2s ease !important;
            }
            
            /* FORÇA BRUTA - Hover */
            .main-nav *:hover,
            .main-nav > *:hover,
            .main-nav > * > *:hover,
            .main-nav > * > * > *:hover,
            .main-nav a:hover,
            .main-nav button:hover,
            .main-nav span:hover,
            [class*="nav"]:hover,
            [class*="link"]:hover {
                background: none !important;
                background-color: transparent !important;
                background-image: none !important;
                border: none !important;
                box-shadow: none !important;
                color: #FFD700 !important;
                transform: none !important;
                animation: none !important;
            }
            
            /* Remover pseudo-elementos */
            .main-nav *::before,
            .main-nav *::after {
                display: none !important;
                content: none !important;
            }
        `;
        
        document.head.appendChild(style);
        console.log('✅ CSS de força máxima injetado');
        
        console.log('🎉 CORREÇÃO COMPLETA APLICADA!');
    }
    
    // Aplicar múltiplas vezes
    function applyMultipleTimes() {
        forceCompleteMenuFix();
        setTimeout(forceCompleteMenuFix, 300);
        setTimeout(forceCompleteMenuFix, 600);
        setTimeout(forceCompleteMenuFix, 1000);
        setTimeout(forceCompleteMenuFix, 2000);
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
                    (node.classList?.contains('main-nav') || 
                     node.querySelector?.('.main-nav') ||
                     node.classList?.contains('global-header'))
                );
                
                if (hasMenu) {
                    console.log('🔄 Menu detectado, reaplicando correção completa...');
                    setTimeout(forceCompleteMenuFix, 100);
                }
            }
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // Expor função globalmente
    window.forceCompleteMenuFix = forceCompleteMenuFix;
    
    console.log('💡 Para aplicar manualmente: forceCompleteMenuFix()');
    
})();
