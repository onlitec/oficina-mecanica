// Global Settings - Aplicar configurações personalizadas em todas as páginas
console.log('🌐 Carregando configurações globais...');

// Aplicar configurações quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    applyGlobalSettings();
});

// Aplicar todas as configurações globais
function applyGlobalSettings() {
    console.log('⚙️ Aplicando configurações globais...');
    
    // Aplicar título do sistema
    applySystemTitle();
    
    // Aplicar logotipo customizado
    applyCustomLogo();
    
    // Aplicar favicon customizado
    applyCustomFavicon();
    
    console.log('✅ Configurações globais aplicadas!');
}

// Aplicar título do sistema
function applySystemTitle() {
    const savedTitle = localStorage.getItem('systemTitle');
    const defaultTitle = 'Oficina Mecânica';
    const titleToUse = savedTitle || defaultTitle;

    console.log('📝 Aplicando título:', titleToUse);

    // Atualizar título da página (manter o sufixo se existir)
    const currentTitle = document.title;
    if (currentTitle.includes(' - ')) {
        const suffix = currentTitle.split(' - ').slice(1).join(' - ');
        document.title = `${suffix} - ${titleToUse}`;
    } else {
        document.title = titleToUse;
    }

    // Atualizar textos do logo em todas as páginas
    const logoTexts = document.querySelectorAll('.logo-text');
    logoTexts.forEach(logoText => {
        logoText.textContent = titleToUse;
    });

    // Atualizar spans sem classe que podem ser logos (fallback)
    const logoContainers = document.querySelectorAll('.logo');
    logoContainers.forEach(container => {
        const spans = container.querySelectorAll('span:not(.logo-icon):not(.logo-text)');
        spans.forEach(span => {
            // Verificar se é um texto de logo (não é ícone)
            if (span.textContent && !span.textContent.match(/[🔧🚗⚙️🏪]/)) {
                span.className = 'logo-text';
                span.textContent = titleToUse;
            }
        });
    });
}

// Aplicar logotipo customizado
function applyCustomLogo() {
    const savedLogo = localStorage.getItem('customLogo');
    if (savedLogo) {
        console.log('🖼️ Aplicando logotipo personalizado');

        // Substituir ícones de logo por imagens
        const logoIcons = document.querySelectorAll('.logo-icon');
        logoIcons.forEach(icon => {
            // Verificar se já não foi substituído
            if (icon.tagName === 'SPAN') {
                const img = document.createElement('img');
                img.src = savedLogo;
                img.alt = 'Logo';

                // FORÇA TAMANHO FIXO PARA EVITAR ALTERAÇÕES
                img.style.setProperty('width', '32px', 'important');
                img.style.setProperty('height', '32px', 'important');
                img.style.setProperty('min-width', '32px', 'important');
                img.style.setProperty('min-height', '32px', 'important');
                img.style.setProperty('max-width', '32px', 'important');
                img.style.setProperty('max-height', '32px', 'important');
                img.style.setProperty('object-fit', 'contain', 'important');
                img.style.setProperty('flex-shrink', '0', 'important');
                img.style.setProperty('display', 'block', 'important');

                img.className = 'logo-icon';
                icon.parentNode.replaceChild(img, icon);
            }
        });
    } else {
        // Garantir que todos os ícones sejam consistentes quando não há logo customizado
        const logoIcons = document.querySelectorAll('.logo-icon');
        logoIcons.forEach(icon => {
            if (icon.tagName === 'SPAN' && icon.textContent !== '🔧') {
                icon.textContent = '🔧';
            }
        });
    }
}

// Aplicar favicon customizado
function applyCustomFavicon() {
    const savedFavicon = localStorage.getItem('customFavicon');
    if (savedFavicon) {
        console.log('🔖 Aplicando favicon personalizado');
        
        // Verificar se já existe um favicon
        let favicon = document.querySelector('link[rel="icon"]');
        if (!favicon) {
            // Criar novo favicon se não existir
            favicon = document.createElement('link');
            favicon.rel = 'icon';
            favicon.type = 'image/x-icon';
            document.head.appendChild(favicon);
        }
        
        // Aplicar favicon customizado
        favicon.href = savedFavicon;
    }
}

// Função para resetar todas as configurações (pode ser chamada de outras páginas)
function resetAllGlobalSettings() {
    console.log('🔄 Resetando todas as configurações globais...');

    // Remover configurações do localStorage
    localStorage.removeItem('systemTitle');
    localStorage.removeItem('customLogo');
    localStorage.removeItem('customFavicon');

    // Restaurar título padrão
    const defaultTitle = 'Oficina Mecânica';
    const currentTitle = document.title;
    if (currentTitle.includes(' - ')) {
        const suffix = currentTitle.split(' - ').slice(1).join(' - ');
        document.title = `${suffix} - ${defaultTitle}`;
    } else {
        document.title = defaultTitle;
    }

    // Restaurar textos do logo
    const logoTexts = document.querySelectorAll('.logo-text');
    logoTexts.forEach(logoText => {
        logoText.textContent = defaultTitle;
    });

    // Restaurar spans sem classe que podem ser logos
    const logoContainers = document.querySelectorAll('.logo');
    logoContainers.forEach(container => {
        const spans = container.querySelectorAll('span:not(.logo-icon):not(.logo-text)');
        spans.forEach(span => {
            if (span.textContent && !span.textContent.match(/[🔧🚗⚙️🏪]/)) {
                span.className = 'logo-text';
                span.textContent = defaultTitle;
            }
        });
    });

    // Restaurar ícones do logo
    const logoImages = document.querySelectorAll('.logo-icon');
    logoImages.forEach(img => {
        if (img.tagName === 'IMG') {
            const icon = document.createElement('span');
            icon.className = 'logo-icon';
            icon.textContent = '🔧';
            img.parentNode.replaceChild(icon, img);
        } else if (img.tagName === 'SPAN' && img.textContent !== '🔧') {
            img.textContent = '🔧';
        }
    });

    // Remover favicon customizado
    const favicon = document.querySelector('link[rel="icon"]');
    if (favicon) {
        favicon.remove();
    }

    console.log('✅ Configurações globais resetadas!');
}

// Disponibilizar funções globalmente
window.applyGlobalSettings = applyGlobalSettings;
window.resetAllGlobalSettings = resetAllGlobalSettings;
