// Script de emergência para corrigir sobreposição dos itens do menu
(function() {
    'use strict';
    
    console.log('🚨 EMERGÊNCIA: Corrigindo sobreposição dos itens do menu...');
    
    function fixMenuOverlap() {
        console.log('🔧 Iniciando correção de sobreposição...');
        
        // 1. Corrigir header content
        const headerContent = document.querySelector('.header-content');
        if (headerContent) {
            headerContent.style.cssText = `
                display: flex !important;
                justify-content: space-between !important;
                align-items: center !important;
                padding: 6px 12px !important;
                position: relative !important;
                max-width: 1200px !important;
                width: 100% !important;
                margin: 0 auto !important;
                box-sizing: border-box !important;
            `;
            console.log('✅ Header content corrigido');
        }
        
        // 2. Corrigir logo section
        const logoSection = document.querySelector('.logo-section');
        if (logoSection) {
            logoSection.style.cssText = `
                display: flex !important;
                align-items: center !important;
                gap: 6px !important;
                flex: 0 0 auto !important;
                min-width: 140px !important;
                max-width: 180px !important;
                overflow: hidden !important;
                padding-left: 8px !important;
            `;
            console.log('✅ Logo section corrigida');
        }
        
        // 3. Corrigir main nav (menu principal)
        const mainNav = document.querySelector('.main-nav');
        if (mainNav) {
            mainNav.style.cssText = `
                position: absolute !important;
                left: 50% !important;
                top: 50% !important;
                transform: translate(-50%, -50%) !important;
                display: flex !important;
                justify-content: center !important;
                align-items: center !important;
                gap: 10px !important;
                z-index: 9999 !important;
                margin: 0 !important;
                padding: 0 !important;
                flex-wrap: nowrap !important;
                white-space: nowrap !important;
            `;
            
            // Corrigir cada link do menu
            const navLinks = mainNav.querySelectorAll('.nav-link');
            navLinks.forEach((link, index) => {
                link.style.cssText = `
                    padding: 8px 12px !important;
                    margin: 0 !important;
                    font-size: 0.9em !important;
                    white-space: nowrap !important;
                    display: inline-block !important;
                    text-decoration: none !important;
                    border-radius: 6px !important;
                    color: white !important;
                    background: rgba(255,255,255,0.1) !important;
                    border: 1px solid rgba(255,255,255,0.2) !important;
                    transition: all 0.3s ease !important;
                    overflow: hidden !important;
                    text-overflow: ellipsis !important;
                    max-width: 120px !important;
                    text-align: center !important;
                    font-weight: 500 !important;
                    min-height: 36px !important;
                    line-height: 1.2 !important;
                `;
                console.log(`✅ Link ${index + 1} corrigido: ${link.textContent.trim()}`);
            });
            
            console.log('✅ Main nav corrigido');
        }
        
        // 4. Corrigir user section
        const userSection = document.querySelector('.user-section');
        if (userSection) {
            userSection.style.cssText = `
                display: flex !important;
                align-items: center !important;
                gap: 4px !important;
                flex: 0 0 auto !important;
                min-width: 160px !important;
                max-width: 200px !important;
                justify-content: flex-end !important;
                overflow: hidden !important;
                padding-right: 8px !important;
            `;
            console.log('✅ User section corrigida');
        }
        
        // 5. Corrigir user info
        const userInfo = document.querySelector('.user-info');
        if (userInfo) {
            userInfo.style.cssText = `
                display: flex !important;
                flex-direction: column !important;
                align-items: flex-end !important;
                max-width: 80px !important;
                overflow: hidden !important;
                margin-right: 4px !important;
            `;
            
            const userName = userInfo.querySelector('.user-name');
            const userRole = userInfo.querySelector('.user-role');
            
            if (userName) {
                userName.style.cssText = `
                    font-size: 0.65em !important;
                    font-weight: 600 !important;
                    white-space: nowrap !important;
                    overflow: hidden !important;
                    text-overflow: ellipsis !important;
                    max-width: 100% !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    line-height: 1.1 !important;
                    color: white !important;
                `;
            }
            
            if (userRole) {
                userRole.style.cssText = `
                    font-size: 0.55em !important;
                    opacity: 0.8 !important;
                    white-space: nowrap !important;
                    overflow: hidden !important;
                    text-overflow: ellipsis !important;
                    max-width: 100% !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    line-height: 1 !important;
                    color: white !important;
                `;
            }
            
            console.log('✅ User info corrigida');
        }
        
        // 6. Corrigir botões
        const settingsBtn = document.querySelector('.settings-btn');
        if (settingsBtn) {
            settingsBtn.style.cssText = `
                width: 24px !important;
                height: 24px !important;
                font-size: 0.8em !important;
                flex-shrink: 0 !important;
                margin: 0 !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                background: rgba(255,255,255,0.15) !important;
                color: white !important;
                text-decoration: none !important;
                border-radius: 50% !important;
                border: 1px solid rgba(255,255,255,0.3) !important;
            `;
            console.log('✅ Settings button corrigido');
        }
        
        const logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.style.cssText = `
                padding: 3px 6px !important;
                font-size: 0.6em !important;
                border-radius: 10px !important;
                white-space: nowrap !important;
                flex-shrink: 0 !important;
                margin: 0 !important;
                background: rgba(255,255,255,0.15) !important;
                color: white !important;
                border: 1px solid rgba(255,255,255,0.3) !important;
                cursor: pointer !important;
            `;
            console.log('✅ Logout button corrigido');
        }
        
        console.log('🎉 CORREÇÃO COMPLETA! Menu deve estar sem sobreposições.');
        
        // Verificar se ainda há sobreposições
        setTimeout(() => {
            const allElements = document.querySelectorAll('.nav-link, .user-name, .user-role, .settings-btn, .logout-btn');
            let hasOverlap = false;
            
            allElements.forEach((el, i) => {
                const rect1 = el.getBoundingClientRect();
                allElements.forEach((el2, j) => {
                    if (i !== j) {
                        const rect2 = el2.getBoundingClientRect();
                        if (rect1.left < rect2.right && rect1.right > rect2.left && 
                            rect1.top < rect2.bottom && rect1.bottom > rect2.top) {
                            console.warn(`⚠️ Possível sobreposição entre ${el.textContent.trim()} e ${el2.textContent.trim()}`);
                            hasOverlap = true;
                        }
                    }
                });
            });
            
            if (!hasOverlap) {
                console.log('✅ SUCESSO! Nenhuma sobreposição detectada.');
            }
        }, 500);
    }
    
    // Aplicar correção múltiplas vezes
    function applyMultipleTimes() {
        fixMenuOverlap();
        setTimeout(fixMenuOverlap, 200);
        setTimeout(fixMenuOverlap, 500);
        setTimeout(fixMenuOverlap, 1000);
    }
    
    // Aguardar DOM estar pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyMultipleTimes);
    } else {
        applyMultipleTimes();
    }
    
    // Também aplicar quando a janela carregar
    window.addEventListener('load', applyMultipleTimes);
    
    // Expor função globalmente
    window.fixMenuOverlap = fixMenuOverlap;
    
    console.log('💡 Para aplicar manualmente: fixMenuOverlap()');
    
})();
