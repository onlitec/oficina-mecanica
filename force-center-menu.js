// Script de emergência para forçar centralização do menu
// Use este script se o menu ainda não estiver centralizado

(function() {
    'use strict';
    
    console.log('🚨 SCRIPT DE EMERGÊNCIA: Forçando centralização do menu...');
    
    function forceCenterMenuEmergency() {
        const mainNav = document.querySelector('.main-nav');
        const headerContent = document.querySelector('.header-content');
        
        if (!mainNav) {
            console.error('❌ Elemento .main-nav não encontrado!');
            return false;
        }
        
        if (!headerContent) {
            console.error('❌ Elemento .header-content não encontrado!');
            return false;
        }
        
        console.log('📍 Elementos encontrados, aplicando centralização...');
        
        // Remover todos os estilos existentes
        mainNav.removeAttribute('style');
        
        // Aplicar estilos de centralização com máxima prioridade
        const styles = {
            'position': 'absolute',
            'left': '50%',
            'top': '50%',
            'transform': 'translate(-50%, -50%)',
            'z-index': '99999',
            'display': 'flex',
            'justify-content': 'center',
            'align-items': 'center',
            'margin': '0',
            'padding': '0',
            'width': 'auto',
            'height': 'auto',
            'right': 'auto',
            'bottom': 'auto',
            'float': 'none',
            'clear': 'none'
        };
        
        // Aplicar cada estilo com !important
        Object.entries(styles).forEach(([property, value]) => {
            mainNav.style.setProperty(property, value, 'important');
        });
        
        // Garantir que o header tenha position relative
        headerContent.style.setProperty('position', 'relative', 'important');
        headerContent.style.setProperty('overflow', 'visible', 'important');
        
        console.log('✅ Estilos aplicados com !important');
        
        // Verificar centralização
        setTimeout(() => {
            const rect = mainNav.getBoundingClientRect();
            const headerRect = headerContent.getBoundingClientRect();
            const navCenter = rect.left + rect.width / 2;
            const headerCenter = headerRect.left + headerRect.width / 2;
            const offset = Math.abs(navCenter - headerCenter);
            
            console.log(`📊 VERIFICAÇÃO: nav=${navCenter.toFixed(1)}, header=${headerCenter.toFixed(1)}, offset=${offset.toFixed(1)}`);
            
            if (offset <= 5) {
                console.log('🎉 SUCESSO! Menu centralizado com offset de ' + offset.toFixed(1) + 'px');
                return true;
            } else {
                console.warn('⚠️ Menu ainda não está perfeitamente centralizado. Offset: ' + offset.toFixed(1) + 'px');
                
                // Tentar correção adicional
                console.log('🔧 Tentando correção adicional...');
                mainNav.style.setProperty('left', '50%', 'important');
                mainNav.style.setProperty('transform', 'translate(-50%, -50%)', 'important');
                
                return false;
            }
        }, 100);
        
        return true;
    }
    
    // Aplicar centralização múltiplas vezes
    function applyMultipleTimes() {
        console.log('🔄 Aplicando centralização múltiplas vezes...');
        
        // Imediatamente
        forceCenterMenuEmergency();
        
        // Após 100ms
        setTimeout(forceCenterMenuEmergency, 100);
        
        // Após 300ms
        setTimeout(forceCenterMenuEmergency, 300);
        
        // Após 500ms
        setTimeout(forceCenterMenuEmergency, 500);
        
        // Após 1 segundo
        setTimeout(forceCenterMenuEmergency, 1000);
        
        // Verificação final após 2 segundos
        setTimeout(() => {
            const mainNav = document.querySelector('.main-nav');
            const headerContent = document.querySelector('.header-content');
            
            if (mainNav && headerContent) {
                const rect = mainNav.getBoundingClientRect();
                const headerRect = headerContent.getBoundingClientRect();
                const navCenter = rect.left + rect.width / 2;
                const headerCenter = headerRect.left + headerRect.width / 2;
                const offset = Math.abs(navCenter - headerCenter);
                
                console.log('🏁 VERIFICAÇÃO FINAL:');
                console.log(`   Nav center: ${navCenter.toFixed(1)}px`);
                console.log(`   Header center: ${headerCenter.toFixed(1)}px`);
                console.log(`   Offset: ${offset.toFixed(1)}px`);
                
                if (offset <= 5) {
                    console.log('✅ MENU CENTRALIZADO COM SUCESSO!');
                } else {
                    console.error('❌ FALHA NA CENTRALIZAÇÃO. Verifique CSS conflitante.');
                    console.log('💡 Dicas:');
                    console.log('   1. Verifique se há CSS conflitante em outros arquivos');
                    console.log('   2. Limpe o cache do navegador');
                    console.log('   3. Verifique se o global-menu.js está carregando corretamente');
                }
            }
        }, 2000);
    }
    
    // Aguardar DOM estar pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyMultipleTimes);
    } else {
        applyMultipleTimes();
    }
    
    // Também aplicar quando a janela carregar completamente
    window.addEventListener('load', applyMultipleTimes);
    
    // Expor função globalmente para uso manual
    window.forceCenterMenuEmergency = forceCenterMenuEmergency;
    
    console.log('💡 Para aplicar manualmente, execute: forceCenterMenuEmergency()');
    
})();
