// Script para forçar a exibição do logo APÓS o global-menu ser carregado
console.log('Fix Logo Script - Iniciando (v2.0)...');

function waitForGlobalMenu() {
    return new Promise((resolve) => {
        const checkMenu = () => {
            const header = document.querySelector('.global-header');
            if (header) {
                console.log('Global menu encontrado!');
                resolve(true);
            } else {
                console.log('Aguardando global menu...');
                setTimeout(checkMenu, 100);
            }
        };
        checkMenu();
    });
}

function forceCreateLogo() {
    console.log('🔧 Forçando criação do logo...');

    // Verificar se já existe um logo fixo
    if (document.getElementById('fixed-logo')) {
        console.log('✅ Logo já existe, pulando criação');
        return true;
    }

    // Encontrar o header - tentar múltiplos seletores
    let header = document.querySelector('.global-header .header-content');
    if (!header) {
        header = document.querySelector('.global-header');
        if (header) {
            // Se encontrou só o global-header, procurar ou criar header-content
            let headerContent = header.querySelector('.header-content');
            if (!headerContent) {
                headerContent = document.createElement('div');
                headerContent.className = 'header-content';
                headerContent.style.cssText = 'max-width: 1000px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; gap: 20px;';
                header.appendChild(headerContent);
            }
            header = headerContent;
        }
    }

    if (!header) {
        console.log('❌ Header não encontrado, tentando novamente...');
        return false;
    }

    console.log('✅ Header encontrado:', header);

    // Remover TODOS os logos existentes
    const existingLogos = header.querySelectorAll('.logo');
    existingLogos.forEach((logo, index) => {
        logo.remove();
        console.log(`Logo existente ${index + 1} removido`);
    });

    // Criar HTML do logo diretamente
    const logoHTML = `
        <div class="logo" id="fixed-logo" style="flex-shrink: 0 !important;">
            <a href="/dashboard.html" style="color: white !important; text-decoration: none !important; display: flex !important; align-items: center !important; gap: 8px !important; transition: opacity 0.3s ease !important;">
                <div style="width: 32px !important; height: 32px !important; background: #ef4444 !important; border-radius: 50% !important; display: flex !important; align-items: center !important; justify-content: center !important; font-size: 16px !important; color: white !important; flex-shrink: 0 !important;">🔧</div>
                <div style="display: flex !important; flex-direction: column !important;">
                    <div style="font-size: 20px !important; font-weight: 700 !important; line-height: 1.2 !important; color: white !important; margin: 0 !important;">Oficina</div>
                    <div style="font-size: 14px !important; opacity: 0.9 !important; line-height: 1.2 !important; color: white !important; margin: 0 !important;">Mecânica</div>
                </div>
            </a>
        </div>
    `;

    // Inserir no início do header
    header.insertAdjacentHTML('afterbegin', logoHTML);

    console.log('✅ Logo HTML inserido!');

    // Verificar se realmente foi inserido
    const verificacao = document.getElementById('fixed-logo');
    if (verificacao) {
        console.log('✅ Verificação: Logo está presente no DOM');
        console.log('Logo HTML final:', verificacao.outerHTML);
        return true;
    } else {
        console.log('❌ Verificação: Logo NÃO está presente no DOM');
        return false;
    }
}

// Função principal que aguarda o menu e força o logo
async function initFixLogo() {
    console.log('Aguardando global menu ser carregado...');
    await waitForGlobalMenu();

    // Tentar múltiplas vezes com intervalos diferentes
    const tentativas = [500, 1000, 1500, 2000, 3000];

    for (let i = 0; i < tentativas.length; i++) {
        setTimeout(() => {
            console.log(`Tentativa ${i + 1} de ${tentativas.length}`);
            const sucesso = forceCreateLogo();
            if (sucesso) {
                console.log('🎉 Logo corrigido com sucesso!');
            }
        }, tentativas[i]);
    }
}

// Executar quando o DOM estiver carregado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFixLogo);
} else {
    initFixLogo();
}

// Também executar quando a página estiver completamente carregada
window.addEventListener('load', () => {
    setTimeout(initFixLogo, 1000);
});

console.log('Fix Logo Script v2.0 - Configurado e aguardando global menu');
