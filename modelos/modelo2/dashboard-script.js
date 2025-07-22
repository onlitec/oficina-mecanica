// Dashboard JavaScript - Funcionalidades Interativas

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar funcionalidades
    initializeNavigation();
    initializeSearch();
    initializeManagement();
    initializeAnimations();
    updateDashboardData();
});

// Navegação
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const section = this.dataset.section;
            highlightNavItem(this);
            scrollToSection(section);
        });
    });
}

function highlightNavItem(activeItem) {
    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to clicked item
    activeItem.classList.add('active');
}

function scrollToSection(section) {
    const targetElement = document.querySelector(`.search-${section}, .management-${section}`);
    if (targetElement) {
        targetElement.scrollIntoView({ 
            behavior: 'smooth',
            block: 'center'
        });
    }
}

// Funcionalidades de Busca
function initializeSearch() {
    const searchInputs = document.querySelectorAll('.search-input');
    const searchButtons = document.querySelectorAll('.btn-primary');
    
    // Auto-complete e validação
    searchInputs.forEach(input => {
        input.addEventListener('input', function() {
            validateSearchInput(this);
        });
        
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch(this);
            }
        });
    });
    
    // Botões de busca
    searchButtons.forEach(button => {
        if (button.textContent.includes('Buscar')) {
            button.addEventListener('click', function() {
                const searchCard = this.closest('.search-card');
                const input = searchCard.querySelector('.search-input');
                performSearch(input);
            });
        }
    });
    
    // Botões de listar
    document.querySelectorAll('.btn-secondary').forEach(button => {
        if (button.textContent.includes('Listar')) {
            button.addEventListener('click', function() {
                const searchCard = this.closest('.search-card');
                listAllItems(searchCard);
            });
        }
    });
}

function validateSearchInput(input) {
    const value = input.value.trim();
    const wrapper = input.closest('.search-input-wrapper');
    
    // Remove previous validation classes
    wrapper.classList.remove('valid', 'invalid');
    
    if (value.length > 0) {
        wrapper.classList.add('valid');
    }
}

function performSearch(input) {
    const value = input.value.trim();
    const searchCard = input.closest('.search-card');
    const searchType = getSearchType(searchCard);
    
    if (value.length === 0) {
        showNotification('Por favor, digite um termo para buscar', 'warning');
        return;
    }
    
    // Simular busca
    showLoadingState(searchCard);
    
    setTimeout(() => {
        hideLoadingState(searchCard);
        showSearchResults(searchType, value);
    }, 1500);
}

function getSearchType(searchCard) {
    if (searchCard.classList.contains('search-clientes')) return 'clientes';
    if (searchCard.classList.contains('search-veiculos')) return 'veiculos';
    if (searchCard.classList.contains('search-pecas')) return 'pecas';
    return 'unknown';
}

function listAllItems(searchCard) {
    const searchType = getSearchType(searchCard);
    showLoadingState(searchCard);
    
    setTimeout(() => {
        hideLoadingState(searchCard);
        showAllItems(searchType);
    }, 1000);
}

// Funcionalidades de Gerenciamento
function initializeManagement() {
    const addButtons = document.querySelectorAll('.management-card .btn-primary');
    const listButtons = document.querySelectorAll('.management-card .btn-secondary');
    
    addButtons.forEach(button => {
        button.addEventListener('click', function() {
            const managementCard = this.closest('.management-card');
            const type = getManagementType(managementCard);
            openAddForm(type);
        });
    });
    
    listButtons.forEach(button => {
        button.addEventListener('click', function() {
            const managementCard = this.closest('.management-card');
            const type = getManagementType(managementCard);
            openListView(type);
        });
    });
}

function getManagementType(managementCard) {
    if (managementCard.classList.contains('management-clientes')) return 'clientes';
    if (managementCard.classList.contains('management-veiculos')) return 'veiculos';
    if (managementCard.classList.contains('management-pecas')) return 'pecas';
    return 'unknown';
}

function openAddForm(type) {
    showNotification(`Abrindo formulário para adicionar ${type}`, 'info');
    // Aqui você redirecionaria para a página de adicionar
    // window.location.href = `add-${type}.php`;
}

function openListView(type) {
    showNotification(`Carregando lista de ${type}`, 'info');
    // Aqui você redirecionaria para a página de listagem
    // window.location.href = `list-${type}.php`;
}

// Animações e Estados Visuais
function initializeAnimations() {
    // Animação dos cards de estatísticas
    const statCards = document.querySelectorAll('.stat-card');
    
    statCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05) rotateY(5deg)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1) rotateY(0deg)';
        });
    });
    
    // Efeito de ripple nos botões
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            createRippleEffect(e, this);
        });
    });
}

function createRippleEffect(event, element) {
    const ripple = document.createElement('span');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    element.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Estados de Loading
function showLoadingState(element) {
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.innerHTML = `
        <div class="loading-spinner"></div>
        <p>Carregando...</p>
    `;
    
    element.style.position = 'relative';
    element.appendChild(loadingOverlay);
}

function hideLoadingState(element) {
    const loadingOverlay = element.querySelector('.loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.remove();
    }
}

// Notificações
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${getNotificationIcon(type)}</span>
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove após 5 segundos
    setTimeout(() => {
        removeNotification(notification);
    }, 5000);
    
    // Botão de fechar
    notification.querySelector('.notification-close').addEventListener('click', () => {
        removeNotification(notification);
    });
}

function getNotificationIcon(type) {
    const icons = {
        'info': 'ℹ️',
        'success': '✅',
        'warning': '⚠️',
        'error': '❌'
    };
    return icons[type] || icons.info;
}

function removeNotification(notification) {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

// Simulação de Resultados
function showSearchResults(type, searchTerm) {
    const results = generateMockResults(type, searchTerm);
    showNotification(`Encontrados ${results.length} resultados para "${searchTerm}"`, 'success');
}

function showAllItems(type) {
    const totalItems = {
        'clientes': 1247,
        'veiculos': 2156,
        'pecas': 15634
    };
    
    showNotification(`Listando todos os ${totalItems[type]} ${type}`, 'info');
}

function generateMockResults(type, searchTerm) {
    // Simular resultados baseados no tipo e termo de busca
    const mockData = {
        'clientes': [
            { id: 1, nome: 'João Silva', telefone: '(11) 99999-9999' },
            { id: 2, nome: 'Maria Santos', telefone: '(11) 88888-8888' }
        ],
        'veiculos': [
            { id: 1, placa: 'ABC-1234', modelo: 'Honda Civic', ano: 2020 },
            { id: 2, placa: 'XYZ-5678', modelo: 'Toyota Corolla', ano: 2019 }
        ],
        'pecas': [
            { id: 1, codigo: 'P001', nome: 'Filtro de Óleo', preco: 25.90 },
            { id: 2, codigo: 'P002', nome: 'Pastilha de Freio', preco: 89.90 }
        ]
    };
    
    return mockData[type] || [];
}

// Atualização de Dados do Dashboard
function updateDashboardData() {
    // Simular atualização em tempo real dos dados
    setInterval(() => {
        updateStatCards();
        updateQuickStats();
    }, 30000); // Atualiza a cada 30 segundos
}

function updateStatCards() {
    const cards = document.querySelectorAll('.stat-card');
    
    cards.forEach(card => {
        const valueElement = card.querySelector('.card-value');
        const currentValue = parseInt(valueElement.textContent.replace(/[^\d]/g, ''));
        const newValue = currentValue + Math.floor(Math.random() * 5);
        
        // Animação de contagem
        animateValue(valueElement, currentValue, newValue, 1000);
    });
}

function updateQuickStats() {
    const stats = document.querySelectorAll('.stat-value');
    
    stats.forEach((stat, index) => {
        if (index === 0) { // Serviços Hoje
            const current = parseInt(stat.textContent);
            const newValue = current + Math.floor(Math.random() * 3);
            animateValue(stat, current, newValue, 800);
        }
    });
}

function animateValue(element, start, end, duration) {
    const startTime = performance.now();
    const isNumber = !isNaN(start) && !isNaN(end);
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        if (isNumber) {
            const current = Math.floor(start + (end - start) * progress);
            element.textContent = current.toLocaleString();
        }
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

// CSS adicional para loading e notificações
const additionalStyles = `
    .loading-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.9);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border-radius: 1rem;
        z-index: 10;
    }
    
    .loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f3f4f6;
        border-top: 4px solid #3b82f6;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 1rem;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        transform: translateX(100%);
        opacity: 0;
        transition: all 0.3s ease;
        max-width: 400px;
    }
    
    .notification.notification-info {
        border-left: 4px solid #3b82f6;
    }
    
    .notification.notification-success {
        border-left: 4px solid #10b981;
    }
    
    .notification.notification-warning {
        border-left: 4px solid #f59e0b;
    }
    
    .notification.notification-error {
        border-left: 4px solid #ef4444;
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        padding: 1rem;
        gap: 0.5rem;
    }
    
    .notification-message {
        flex: 1;
        font-size: 0.875rem;
        color: #374151;
    }
    
    .notification-close {
        background: none;
        border: none;
        font-size: 1.25rem;
        color: #9ca3af;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .notification-close:hover {
        color: #374151;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .search-input-wrapper.valid .search-input {
        border-color: #10b981;
    }
    
    .search-input-wrapper.invalid .search-input {
        border-color: #ef4444;
    }
    
    .nav-item.active {
        background: rgba(59, 130, 246, 0.1);
        color: #2563eb;
    }
`;

// Adicionar estilos ao documento
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Mostrar notificação quando a página carrega
setTimeout(() => {
    const notification = document.createElement('div');
    notification.className = 'notification notification-success';
    notification.style.transform = 'translateX(0)';
    notification.style.opacity = '1';
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">✅</span>
            <span class="notification-message">Dashboard carregado com sucesso!</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        removeNotification(notification);
    }, 3000);
    
    notification.querySelector('.notification-close').addEventListener('click', () => {
        removeNotification(notification);
    });
}, 1000);