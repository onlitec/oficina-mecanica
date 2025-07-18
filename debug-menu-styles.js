// Script de diagnóstico para verificar estilos do menu
(function() {
    'use strict';
    
    console.log('🔍 DIAGNÓSTICO DOS ESTILOS DO MENU');
    console.log('================================');
    
    function debugMenuStyles() {
        // 1. Verificar se os elementos existem
        console.log('\n📋 1. VERIFICAÇÃO DE ELEMENTOS:');
        
        const mainNav = document.querySelector('.main-nav');
        const navLinks = document.querySelectorAll('.nav-link');
        const allLinks = document.querySelectorAll('.main-nav a, .nav-link, [class*="nav-link"]');
        
        console.log(`- Main nav encontrado: ${mainNav ? '✅' : '❌'}`);
        console.log(`- Links .nav-link encontrados: ${navLinks.length}`);
        console.log(`- Todos os links encontrados: ${allLinks.length}`);
        
        if (mainNav) {
            console.log(`- Main nav classes: ${mainNav.className}`);
            console.log(`- Main nav innerHTML: ${mainNav.innerHTML.substring(0, 200)}...`);
        }
        
        // 2. Verificar estilos computados
        console.log('\n🎨 2. ESTILOS COMPUTADOS:');
        
        if (navLinks.length > 0) {
            const firstLink = navLinks[0];
            const computedStyle = window.getComputedStyle(firstLink);
            
            console.log(`- Elemento: ${firstLink.tagName}.${firstLink.className}`);
            console.log(`- Texto: "${firstLink.textContent.trim()}"`);
            console.log(`- Padding: ${computedStyle.padding}`);
            console.log(`- Font-size: ${computedStyle.fontSize} (${parseFloat(computedStyle.fontSize)}px)`);
            console.log(`- Font-weight: ${computedStyle.fontWeight}`);
            console.log(`- Min-height: ${computedStyle.minHeight}`);
            console.log(`- Line-height: ${computedStyle.lineHeight}`);
            console.log(`- Display: ${computedStyle.display}`);
            console.log(`- Background: ${computedStyle.background}`);
            console.log(`- Border: ${computedStyle.border}`);
            console.log(`- Width: ${computedStyle.width}`);
            console.log(`- Height: ${computedStyle.height}`);
            
            // Verificar se está sendo sobrescrito
            const inlineStyle = firstLink.style.cssText;
            console.log(`- Style inline: ${inlineStyle || 'Nenhum'}`);
            
            // Verificar atributo style
            const styleAttr = firstLink.getAttribute('style');
            console.log(`- Atributo style: ${styleAttr || 'Nenhum'}`);
        }
        
        // 3. Verificar CSS carregado
        console.log('\n📄 3. ARQUIVOS CSS CARREGADOS:');
        
        const stylesheets = Array.from(document.styleSheets);
        stylesheets.forEach((sheet, index) => {
            try {
                console.log(`- ${index + 1}. ${sheet.href || 'Inline CSS'}`);
                if (sheet.href && sheet.href.includes('menu-center-fix.css')) {
                    console.log('  ✅ menu-center-fix.css encontrado!');
                }
            } catch (e) {
                console.log(`- ${index + 1}. [Erro ao acessar stylesheet]`);
            }
        });
        
        // 4. Verificar scripts carregados
        console.log('\n📜 4. SCRIPTS CARREGADOS:');
        
        const scripts = Array.from(document.scripts);
        const menuScripts = scripts.filter(script => 
            script.src && (
                script.src.includes('global-menu') ||
                script.src.includes('force-menu') ||
                script.src.includes('fix-menu')
            )
        );
        
        menuScripts.forEach(script => {
            console.log(`- ✅ ${script.src}`);
        });
        
        // 5. Verificar conflitos de CSS
        console.log('\n⚠️ 5. VERIFICAÇÃO DE CONFLITOS:');
        
        if (navLinks.length > 0) {
            const firstLink = navLinks[0];
            
            // Verificar se há outros estilos aplicados
            const allRules = [];
            
            try {
                for (let sheet of document.styleSheets) {
                    try {
                        for (let rule of sheet.cssRules || sheet.rules) {
                            if (rule.selectorText && rule.selectorText.includes('nav-link')) {
                                allRules.push({
                                    selector: rule.selectorText,
                                    cssText: rule.cssText,
                                    sheet: sheet.href || 'inline'
                                });
                            }
                        }
                    } catch (e) {
                        // Ignorar erros de CORS
                    }
                }
                
                console.log(`- Regras CSS encontradas para .nav-link: ${allRules.length}`);
                allRules.forEach((rule, index) => {
                    console.log(`  ${index + 1}. ${rule.selector} (${rule.sheet})`);
                });
                
            } catch (e) {
                console.log('- Erro ao verificar regras CSS:', e.message);
            }
        }
        
        // 6. Teste de aplicação manual
        console.log('\n🔧 6. TESTE DE APLICAÇÃO MANUAL:');
        
        if (navLinks.length > 0) {
            const testLink = navLinks[0];
            const originalPadding = testLink.style.padding;
            const originalFontSize = testLink.style.fontSize;
            
            // Aplicar estilos de teste
            testLink.style.setProperty('padding', '20px 30px', 'important');
            testLink.style.setProperty('font-size', '20px', 'important');
            testLink.style.setProperty('background', 'red', 'important');
            
            setTimeout(() => {
                const newComputedStyle = window.getComputedStyle(testLink);
                console.log(`- Teste padding: ${newComputedStyle.padding}`);
                console.log(`- Teste font-size: ${newComputedStyle.fontSize}`);
                console.log(`- Teste background: ${newComputedStyle.background}`);
                
                // Restaurar estilos originais
                testLink.style.padding = originalPadding;
                testLink.style.fontSize = originalFontSize;
                testLink.style.background = '';
                
                if (parseFloat(newComputedStyle.fontSize) >= 20) {
                    console.log('✅ Estilos podem ser aplicados via JavaScript');
                } else {
                    console.log('❌ Estilos estão sendo bloqueados');
                }
            }, 100);
        }
        
        // 7. Informações do navegador
        console.log('\n🌐 7. INFORMAÇÕES DO NAVEGADOR:');
        console.log(`- User Agent: ${navigator.userAgent}`);
        console.log(`- Viewport: ${window.innerWidth}x${window.innerHeight}`);
        console.log(`- Device Pixel Ratio: ${window.devicePixelRatio}`);
        
        // 8. Sugestões de correção
        console.log('\n💡 8. SUGESTÕES DE CORREÇÃO:');
        console.log('- Execute: forceMenuSize() no console');
        console.log('- Ou pressione Ctrl+Shift+R para hard refresh');
        console.log('- Ou execute o código manual abaixo:');
        
        console.log(`
document.querySelectorAll('.nav-link, .main-nav a').forEach(link => {
    link.style.cssText = 'padding: 15px 25px !important; font-size: 18px !important; font-weight: 600 !important; min-height: 50px !important;';
});
        `);
    }
    
    // Aguardar DOM estar pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(debugMenuStyles, 1000);
        });
    } else {
        setTimeout(debugMenuStyles, 1000);
    }
    
    // Expor função globalmente
    window.debugMenuStyles = debugMenuStyles;
    
    console.log('💡 Para executar diagnóstico: debugMenuStyles()');
    
})();
