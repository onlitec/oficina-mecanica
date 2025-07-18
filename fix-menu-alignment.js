// Script para corrigir alinhamento irregular dos itens do menu
(function() {
    'use strict';
    
    console.log('📐 Corrigindo alinhamento irregular dos itens do menu...');
    
    function fixMenuAlignment() {
        console.log('🔧 Aplicando correção de alinhamento...');
        
        // 1. Corrigir container principal
        const headerContent = document.querySelector('.header-content');
        if (headerContent) {
            headerContent.style.cssText = `
                display: flex !important;
                justify-content: space-between !important;
                align-items: center !important;
                max-width: 1200px !important;
                width: 100% !important;
                margin: 0 auto !important;
                padding: 0 20px !important;
                height: 60px !important;
                box-sizing: border-box !important;
                position: relative !important;
            `;
            console.log('✅ Header content alinhado');
        }
        
        // 2. Corrigir navegação principal
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
                gap: 16px !important;
                white-space: nowrap !important;
                z-index: 10 !important;
                margin: 0 !important;
                padding: 0 !important;
                width: auto !important;
                height: auto !important;
                flex-wrap: nowrap !important;
            `;
            console.log('✅ Main nav centralizado');
        }
        
        // 3. Corrigir cada link individualmente
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach((link, index) => {
            link.style.cssText = `
                background: transparent !important;
                border: none !important;
                color: white !important;
                padding: 8px 12px !important;
                font-size: 15px !important;
                font-weight: 500 !important;
                text-decoration: none !important;
                margin: 0 !important;
                box-shadow: none !important;
                outline: none !important;
                border-radius: 0 !important;
                display: inline-block !important;
                vertical-align: middle !important;
                text-align: center !important;
                white-space: nowrap !important;
                line-height: 1.4 !important;
                cursor: pointer !important;
                transition: all 0.3s ease !important;
            `;
            
            console.log(`✅ Link ${index + 1} alinhado: "${link.textContent.trim()}"`);
        });
        
        // 4. Corrigir seção da logo
        const logoSection = document.querySelector('.logo-section');
        if (logoSection) {
            logoSection.style.cssText = `
                display: flex !important;
                align-items: center !important;
                gap: 8px !important;
                flex: 0 0 auto !important;
                min-width: 150px !important;
                max-width: 180px !important;
                overflow: hidden !important;
                padding-left: 0 !important;
            `;
            console.log('✅ Logo section alinhada');
        }
        
        // 5. Corrigir seção do usuário
        const userSection = document.querySelector('.user-section');
        if (userSection) {
            userSection.style.cssText = `
                display: flex !important;
                align-items: center !important;
                gap: 8px !important;
                flex: 0 0 auto !important;
                min-width: 180px !important;
                max-width: 200px !important;
                justify-content: flex-end !important;
                overflow: hidden !important;
                padding-right: 0 !important;
            `;
            console.log('✅ User section alinhada');
        }
        
        // 6. Aplicar hover nos links
        navLinks.forEach(link => {
            // Remover listeners antigos
            link.removeEventListener('mouseenter', link._alignmentHoverIn);
            link.removeEventListener('mouseleave', link._alignmentHoverOut);
            
            // Adicionar novos listeners
            link._alignmentHoverIn = function() {
                this.style.setProperty('color', '#FFD700', 'important');
                this.style.setProperty('text-shadow', '0 0 8px rgba(255,215,0,0.6)', 'important');
                this.style.setProperty('transform', 'scale(1.02)', 'important');
                this.style.setProperty('background', 'transparent', 'important');
                this.style.setProperty('border', 'none', 'important');
                this.style.setProperty('box-shadow', 'none', 'important');
            };
            
            link._alignmentHoverOut = function() {
                this.style.setProperty('color', 'white', 'important');
                this.style.setProperty('text-shadow', 'none', 'important');
                this.style.setProperty('transform', 'scale(1)', 'important');
                this.style.setProperty('background', 'transparent', 'important');
                this.style.setProperty('border', 'none', 'important');
                this.style.setProperty('box-shadow', 'none', 'important');
            };
            
            link.addEventListener('mouseenter', link._alignmentHoverIn);
            link.addEventListener('mouseleave', link._alignmentHoverOut);
        });
        
        // 7. Injetar CSS adicional para garantir
        const existingStyle = document.getElementById('menu-alignment-fix');
        if (existingStyle) {
            existingStyle.remove();
        }
        
        const style = document.createElement('style');
        style.id = 'menu-alignment-fix';
        style.innerHTML = `
            /* CSS PARA CORRIGIR ALINHAMENTO IRREGULAR */
            .global-header {
                background: #5865F2 !important;
                background-color: #5865F2 !important;
                background-image: none !important;
            }
            
            .header-content {
                display: flex !important;
                justify-content: space-between !important;
                align-items: center !important;
                height: 60px !important;
                padding: 0 20px !important;
            }
            
            .main-nav {
                position: absolute !important;
                left: 50% !important;
                top: 50% !important;
                transform: translate(-50%, -50%) !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                gap: 16px !important;
                z-index: 10 !important;
            }
            
            .nav-link {
                background: transparent !important;
                border: none !important;
                color: white !important;
                padding: 8px 12px !important;
                font-size: 15px !important;
                font-weight: 500 !important;
                text-decoration: none !important;
                margin: 0 !important;
                box-shadow: none !important;
                outline: none !important;
                display: inline-block !important;
                vertical-align: middle !important;
                text-align: center !important;
                white-space: nowrap !important;
                line-height: 1.4 !important;
            }
            
            .nav-link:hover {
                color: #FFD700 !important;
                text-shadow: 0 0 8px rgba(255,215,0,0.6) !important;
                background: transparent !important;
                border: none !important;
                box-shadow: none !important;
            }
            
            .logo-section {
                flex: 0 0 auto !important;
                min-width: 150px !important;
                max-width: 180px !important;
                overflow: hidden !important;
            }
            
            .user-section {
                flex: 0 0 auto !important;
                min-width: 180px !important;
                max-width: 200px !important;
                justify-content: flex-end !important;
                overflow: hidden !important;
            }
        `;
        
        document.head.appendChild(style);
        console.log('✅ CSS de alinhamento injetado');
        
        console.log('🎉 ALINHAMENTO CORRIGIDO COM SUCESSO!');
        
        // Verificar resultado
        setTimeout(() => {
            const nav = document.querySelector('.main-nav');
            if (nav) {
                const rect = nav.getBoundingClientRect();
                const headerRect = document.querySelector('.global-header').getBoundingClientRect();
                const centerX = headerRect.width / 2;
                const navCenterX = rect.left + rect.width / 2 - headerRect.left;
                
                console.log(`🔍 Verificação de centralização:`);
                console.log(`- Centro do header: ${centerX}px`);
                console.log(`- Centro do nav: ${navCenterX}px`);
                console.log(`- Diferença: ${Math.abs(centerX - navCenterX)}px`);
                
                if (Math.abs(centerX - navCenterX) < 10) {
                    console.log('✅ Menu está centralizado!');
                } else {
                    console.log('⚠️ Menu ainda não está perfeitamente centralizado');
                }
            }
        }, 500);
    }
    
    // Aplicar múltiplas vezes
    function applyMultipleTimes() {
        fixMenuAlignment();
        setTimeout(fixMenuAlignment, 200);
        setTimeout(fixMenuAlignment, 500);
        setTimeout(fixMenuAlignment, 1000);
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
                     node.querySelector?.('.global-header'))
                );
                
                if (hasMenu) {
                    console.log('🔄 Menu detectado, reaplicando alinhamento...');
                    setTimeout(fixMenuAlignment, 100);
                }
            }
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // Expor função globalmente
    window.fixMenuAlignment = fixMenuAlignment;
    
    console.log('💡 Para aplicar manualmente: fixMenuAlignment()');
    
})();
