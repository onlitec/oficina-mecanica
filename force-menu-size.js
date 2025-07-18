// Script FORÇADO para aumentar o tamanho dos itens do menu
(function() {
    'use strict';
    
    console.log('🚀 FORÇANDO aumento do tamanho dos itens do menu...');
    
    function forceMenuSize() {
        console.log('🔧 Aplicando tamanhos FORÇADOS aos itens do menu...');
        
        // Aguardar um pouco para garantir que o DOM está pronto
        setTimeout(() => {
            // 1. Forçar estilos no main-nav
            const mainNav = document.querySelector('.main-nav');
            if (mainNav) {
                // Remover todos os estilos existentes e aplicar novos
                mainNav.style.cssText = `
                    position: absolute !important;
                    left: 50% !important;
                    top: 50% !important;
                    transform: translate(-50%, -50%) !important;
                    display: flex !important;
                    justify-content: center !important;
                    align-items: center !important;
                    gap: 24px !important;
                    z-index: 99999 !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    flex-wrap: nowrap !important;
                    white-space: nowrap !important;
                `;
                console.log('✅ Main nav estilizado');
            }
            
            // 2. Forçar estilos em TODOS os links do menu
            const allNavLinks = document.querySelectorAll('.nav-link, .main-nav a, .main-nav .nav-link');
            console.log(`🔍 Encontrados ${allNavLinks.length} links do menu`);
            
            allNavLinks.forEach((link, index) => {
                // Remover todos os estilos e aplicar novos FORÇADOS
                link.style.cssText = `
                    padding: 8px 16px !important;
                    margin: 0 !important;
                    font-size: 1em !important;
                    font-weight: 500 !important;
                    white-space: nowrap !important;
                    display: inline-block !important;
                    text-decoration: none !important;
                    border-radius: 0 !important;
                    color: white !important;
                    background: transparent !important;
                    border: none !important;
                    transition: all 0.3s ease !important;
                    overflow: visible !important;
                    text-overflow: clip !important;
                    max-width: none !important;
                    min-width: auto !important;
                    width: auto !important;
                    height: auto !important;
                    min-height: auto !important;
                    line-height: 1.4 !important;
                    text-align: center !important;
                    vertical-align: middle !important;
                    box-sizing: border-box !important;
                    cursor: pointer !important;
                    user-select: none !important;
                    box-shadow: none !important;
                    outline: none !important;
                `;
                
                // Adicionar efeitos hover via JavaScript - APENAS TEXTO
                link.addEventListener('mouseenter', function() {
                    this.style.color = '#FFD700 !important'; // Dourado no hover
                    this.style.textShadow = '0 0 8px rgba(255,215,0,0.6) !important';
                    this.style.transform = 'scale(1.05) !important';
                });

                link.addEventListener('mouseleave', function() {
                    this.style.color = 'white !important';
                    this.style.textShadow = 'none !important';
                    this.style.transform = 'scale(1) !important';
                });
                
                console.log(`✅ Link ${index + 1} estilizado: "${link.textContent.trim()}"`);
            });
            
            // 3. Verificar se os estilos foram aplicados
            setTimeout(() => {
                const testLink = document.querySelector('.nav-link');
                if (testLink) {
                    const computedStyle = window.getComputedStyle(testLink);
                    console.log('🔍 Verificação dos estilos aplicados:');
                    console.log(`- Padding: ${computedStyle.padding}`);
                    console.log(`- Font-size: ${computedStyle.fontSize}`);
                    console.log(`- Font-weight: ${computedStyle.fontWeight}`);
                    console.log(`- Min-height: ${computedStyle.minHeight}`);
                    
                    // Se ainda estiver pequeno, aplicar via setAttribute
                    if (parseFloat(computedStyle.fontSize) < 16) {
                        console.log('⚠️ Font-size ainda pequeno, aplicando método alternativo...');
                        forceViaAttribute();
                    } else {
                        console.log('✅ Estilos aplicados com sucesso!');
                    }
                } else {
                    console.log('❌ Nenhum link encontrado para verificação');
                }
            }, 500);
            
        }, 100);
    }
    
    // Método alternativo usando setAttribute
    function forceViaAttribute() {
        console.log('🔧 Aplicando método alternativo via setAttribute...');
        
        const allLinks = document.querySelectorAll('.nav-link, .main-nav a');
        allLinks.forEach(link => {
            // Criar um style inline muito específico
            const forceStyle = `
                padding: 12px 20px !important;
                font-size: 16px !important;
                font-weight: 600 !important;
                min-height: 44px !important;
                line-height: 1.4 !important;
                display: inline-block !important;
                background: rgba(255,255,255,0.1) !important;
                border: 2px solid rgba(255,255,255,0.2) !important;
                border-radius: 8px !important;
                color: white !important;
                text-decoration: none !important;
                margin: 0 2px !important;
                white-space: nowrap !important;
                text-align: center !important;
                cursor: pointer !important;
            `;
            
            link.setAttribute('style', forceStyle);
            
            // Também adicionar via propriedade style
            link.style.setProperty('padding', '12px 20px', 'important');
            link.style.setProperty('font-size', '16px', 'important');
            link.style.setProperty('font-weight', '600', 'important');
            link.style.setProperty('min-height', '44px', 'important');
            link.style.setProperty('line-height', '1.4', 'important');
        });
        
        console.log('✅ Método alternativo aplicado!');
    }
    
    // Método de força bruta - criar CSS inline no head
    function forceViaCSSInjection() {
        console.log('💉 Injetando CSS de força bruta...');
        
        // Remover CSS anterior se existir
        const existingStyle = document.getElementById('force-menu-size-css');
        if (existingStyle) {
            existingStyle.remove();
        }
        
        // Criar novo CSS
        const style = document.createElement('style');
        style.id = 'force-menu-size-css';
        style.innerHTML = `
            /* CSS DE FORÇA BRUTA PARA TAMANHO DO MENU */
            .nav-link,
            .main-nav .nav-link,
            .main-nav a,
            a.nav-link,
            [class*="nav-link"] {
                padding: 12px 20px !important;
                font-size: 16px !important;
                font-weight: 600 !important;
                min-height: 44px !important;
                line-height: 1.4 !important;
                display: inline-block !important;
                background: rgba(255,255,255,0.1) !important;
                border: 2px solid rgba(255,255,255,0.2) !important;
                border-radius: 8px !important;
                color: white !important;
                text-decoration: none !important;
                margin: 0 2px !important;
                white-space: nowrap !important;
                text-align: center !important;
                cursor: pointer !important;
                box-sizing: border-box !important;
                vertical-align: middle !important;
            }
            
            .main-nav {
                gap: 24px !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
            }
            
            .nav-link:hover,
            .main-nav .nav-link:hover,
            .main-nav a:hover {
                background: rgba(255,255,255,0.2) !important;
                transform: translateY(-1px) !important;
                box-shadow: 0 4px 8px rgba(0,0,0,0.2) !important;
            }
        `;
        
        // Inserir no head
        document.head.appendChild(style);
        console.log('✅ CSS de força bruta injetado!');
    }
    
    // Aplicar todos os métodos
    function applyAllMethods() {
        console.log('🚀 Aplicando TODOS os métodos de força...');
        
        // Método 1: CSS Injection (mais forte)
        forceViaCSSInjection();
        
        // Método 2: JavaScript direto
        setTimeout(forceMenuSize, 100);
        
        // Método 3: Atributo style
        setTimeout(forceViaAttribute, 300);
        
        // Método 4: Reaplicar após um tempo
        setTimeout(() => {
            forceMenuSize();
            forceViaAttribute();
        }, 1000);
        
        console.log('🎉 Todos os métodos aplicados!');
    }
    
    // Aguardar DOM estar pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyAllMethods);
    } else {
        applyAllMethods();
    }
    
    // Também aplicar quando a janela carregar
    window.addEventListener('load', applyAllMethods);
    
    // Reaplicar quando o menu for criado
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                const addedNodes = Array.from(mutation.addedNodes);
                const hasNavLink = addedNodes.some(node => 
                    node.nodeType === 1 && 
                    (node.classList?.contains('nav-link') || 
                     node.querySelector?.('.nav-link'))
                );
                
                if (hasNavLink) {
                    console.log('🔄 Menu detectado, reaplicando estilos...');
                    setTimeout(applyAllMethods, 100);
                }
            }
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // Expor função globalmente
    window.forceMenuSize = applyAllMethods;
    
    console.log('💡 Para aplicar manualmente: forceMenuSize()');
    
})();
