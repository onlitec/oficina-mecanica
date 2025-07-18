// Script para testar se os links do menu estão funcionando
(function() {
    'use strict';
    
    console.log('🔗 Testando funcionalidade dos links do menu...');
    
    function testMenuLinks() {
        const allLinks = document.querySelectorAll('.nav-link, .main-nav a');
        
        console.log(`🔍 Encontrados ${allLinks.length} links para testar`);
        
        allLinks.forEach((link, index) => {
            const text = link.textContent.trim();
            const href = link.href;
            const hasClick = link.onclick !== null;
            
            console.log(`📋 Link ${index + 1}:`);
            console.log(`   Texto: "${text}"`);
            console.log(`   Href: ${href}`);
            console.log(`   Onclick: ${hasClick ? 'Sim' : 'Não'}`);
            console.log(`   Funcional: ${href && !href.includes('javascript:') ? '✅' : '❌'}`);
            
            // Verificar se o link responde a cliques
            link.addEventListener('click', function(e) {
                console.log(`🖱️ Clique detectado em: "${text}"`);
                console.log(`   Navegando para: ${this.href}`);
                
                // Se não tiver href válido, prevenir navegação
                if (!this.href || this.href.includes('javascript:')) {
                    e.preventDefault();
                    console.log(`❌ Navegação bloqueada - href inválido`);
                    alert(`Link "${text}" não tem destino válido!`);
                }
            });
        });
        
        // Criar botões de teste
        createTestButtons();
    }
    
    function createTestButtons() {
        // Verificar se já existe
        if (document.getElementById('menu-test-panel')) {
            return;
        }
        
        const testPanel = document.createElement('div');
        testPanel.id = 'menu-test-panel';
        testPanel.style.cssText = `
            position: fixed;
            top: 70px;
            right: 10px;
            background: white;
            border: 2px solid #5865F2;
            border-radius: 8px;
            padding: 15px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            z-index: 10000;
            font-family: Arial, sans-serif;
            font-size: 12px;
            max-width: 250px;
        `;
        
        testPanel.innerHTML = `
            <h4 style="margin: 0 0 10px 0; color: #5865F2;">🔗 Teste dos Links</h4>
            <button onclick="testAllLinks()" style="background: #5865F2; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin: 2px;">
                🧪 Testar Todos
            </button>
            <button onclick="fixMenuLinks()" style="background: #28a745; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin: 2px;">
                🔧 Corrigir Links
            </button>
            <button onclick="document.getElementById('menu-test-panel').remove()" style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin: 2px;">
                ❌ Fechar
            </button>
            <div id="test-results" style="margin-top: 10px; font-size: 11px; max-height: 200px; overflow-y: auto;"></div>
        `;
        
        document.body.appendChild(testPanel);
        
        // Expor funções globalmente
        window.testAllLinks = function() {
            const results = document.getElementById('test-results');
            results.innerHTML = '<strong>🔍 Testando links...</strong><br>';
            
            const links = document.querySelectorAll('.nav-link, .main-nav a');
            links.forEach((link, index) => {
                const text = link.textContent.trim();
                const href = link.href;
                const isValid = href && !href.includes('javascript:') && href !== window.location.href;
                
                results.innerHTML += `
                    <div style="margin: 5px 0; padding: 5px; background: ${isValid ? '#e8f5e8' : '#ffe8e8'}; border-radius: 3px;">
                        <strong>${text}</strong><br>
                        <small>${href}</small><br>
                        <span style="color: ${isValid ? 'green' : 'red'};">
                            ${isValid ? '✅ Funcional' : '❌ Problema'}
                        </span>
                    </div>
                `;
            });
        };
        
        window.fixMenuLinks = function() {
            const results = document.getElementById('test-results');
            results.innerHTML = '<strong>🔧 Corrigindo links...</strong><br>';
            
            const links = document.querySelectorAll('.nav-link, .main-nav a');
            let fixed = 0;
            
            links.forEach((link, index) => {
                const text = link.textContent.trim();
                
                // Verificar se precisa corrigir href
                if (!link.href || link.href.includes('javascript:')) {
                    // Tentar determinar href correto baseado no texto
                    let correctHref = '';
                    
                    if (text.includes('Clientes')) {
                        correctHref = '/customers.html';
                    } else if (text.includes('Ordens')) {
                        correctHref = '/service-orders.html';
                    } else if (text.includes('Peças')) {
                        correctHref = '/parts.html';
                    } else if (text.includes('Orçamentos')) {
                        correctHref = '/quotes.html';
                    } else if (text.includes('Financeiro')) {
                        correctHref = '/financial.html';
                    } else if (text.includes('Analytics')) {
                        correctHref = '/analytics.html';
                    }
                    
                    if (correctHref) {
                        link.href = correctHref;
                        fixed++;
                        results.innerHTML += `✅ Corrigido: ${text} -> ${correctHref}<br>`;
                    } else {
                        results.innerHTML += `❌ Não foi possível corrigir: ${text}<br>`;
                    }
                } else {
                    results.innerHTML += `✅ OK: ${text}<br>`;
                }
            });
            
            results.innerHTML += `<br><strong>🎉 ${fixed} links corrigidos!</strong>`;
        };
    }
    
    // Aguardar menu carregar
    setTimeout(() => {
        testMenuLinks();
    }, 2000);
    
    // Expor função globalmente
    window.testMenuLinks = testMenuLinks;
    
    console.log('💡 Painel de teste criado no canto superior direito');
    console.log('💡 Para testar manualmente: testMenuLinks()');
    
})();
