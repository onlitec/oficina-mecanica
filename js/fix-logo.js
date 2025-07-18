// Script para forçar a exibição do logo
console.log('Fix Logo Script - Iniciando...');

function forceCreateLogo() {
    console.log('Forçando criação do logo...');
    
    // Encontrar o header
    const header = document.querySelector('.global-header .header-content');
    if (!header) {
        console.log('Header não encontrado');
        return;
    }
    
    // Remover logo existente se houver
    const existingLogo = header.querySelector('.logo');
    if (existingLogo) {
        existingLogo.remove();
        console.log('Logo existente removido');
    }
    
    // Criar novo logo
    const logoDiv = document.createElement('div');
    logoDiv.className = 'logo';
    logoDiv.style.cssText = 'flex-shrink: 0;';
    
    const logoLink = document.createElement('a');
    logoLink.href = '/dashboard.html';
    logoLink.style.cssText = 'color: white; text-decoration: none; display: flex; align-items: center; gap: 8px; transition: opacity 0.3s ease;';
    
    const logoIcon = document.createElement('div');
    logoIcon.style.cssText = 'width: 32px; height: 32px; background: #ef4444; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; color: white; flex-shrink: 0;';
    logoIcon.innerHTML = '🔧';
    
    const logoTextDiv = document.createElement('div');
    logoTextDiv.style.cssText = 'display: flex; flex-direction: column;';
    
    const logoTitle = document.createElement('div');
    logoTitle.style.cssText = 'font-size: 20px; font-weight: 700; line-height: 1.2; color: white; margin: 0;';
    logoTitle.innerHTML = 'Oficina';
    
    const logoSubtitle = document.createElement('div');
    logoSubtitle.style.cssText = 'font-size: 14px; opacity: 0.9; line-height: 1.2; color: white; margin: 0;';
    logoSubtitle.innerHTML = 'Mecânica';
    
    // Montar estrutura
    logoTextDiv.appendChild(logoTitle);
    logoTextDiv.appendChild(logoSubtitle);
    logoLink.appendChild(logoIcon);
    logoLink.appendChild(logoTextDiv);
    logoDiv.appendChild(logoLink);
    
    // Inserir no início do header
    header.insertBefore(logoDiv, header.firstChild);
    
    console.log('Logo criado e inserido com sucesso!');
    console.log('Logo HTML:', logoDiv.outerHTML);
}

// Executar quando o DOM estiver carregado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(forceCreateLogo, 1000);
    });
} else {
    setTimeout(forceCreateLogo, 1000);
}

// Também executar quando a página estiver completamente carregada
window.addEventListener('load', () => {
    setTimeout(forceCreateLogo, 1500);
});

console.log('Fix Logo Script - Configurado');
