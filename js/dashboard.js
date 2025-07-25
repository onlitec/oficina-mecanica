// Dashboard JavaScript - Sem CSP violations
console.log('📊 Dashboard JavaScript carregado');

// Verificar autenticação
const auth = new AuthManager();
if (!auth.isAuthenticated()) {
    window.location.href = '/login.html';
}

// Atualizar nome do usuário
const user = auth.getUser();
if (user) {
    document.addEventListener('DOMContentLoaded', () => {
        const userNameElement = document.getElementById('userName');
        const userAvatarElement = document.querySelector('.user-avatar');
        
        if (userNameElement) {
            userNameElement.textContent = user.name || user.email;
        }
        
        if (userAvatarElement) {
            userAvatarElement.textContent = (user.name || user.email).charAt(0).toUpperCase();
        }
    });
}

// Toggle user menu
function toggleUserMenu() {
    const confirmed = confirm('Deseja fazer logout?');
    if (confirmed) {
        auth.logout();
        window.location.href = '/login.html';
    }
}

// Funções da API
async function apiCall(endpoint) {
    try {
        const response = await fetch(endpoint);
        return await response.json();
    } catch (error) {
        throw new Error(`Erro na API: ${error.message}`);
    }
}

// Carregar estatísticas
async function loadStats() {
    try {
        // Carregar clientes
        const customersResponse = await apiCall('/api/customers');
        const customersCount = customersResponse.data ? customersResponse.data.length : 0;
        const customersElement = document.getElementById('customersCount');
        if (customersElement) {
            customersElement.textContent = customersCount;
        }

        // Carregar veículos (através dos clientes)
        let vehiclesCount = 0;
        if (customersResponse.data) {
            customersResponse.data.forEach(customer => {
                if (customer.vehicles) {
                    vehiclesCount += customer.vehicles.length;
                }
            });
        }
        const vehiclesElement = document.getElementById('vehiclesCount');
        if (vehiclesElement) {
            vehiclesElement.textContent = vehiclesCount;
        }

        // Carregar peças
        const partsResponse = await apiCall('/api/parts');
        const partsCount = partsResponse.data ? partsResponse.data.length : 0;
        const partsElement = document.getElementById('partsCount');
        if (partsElement) {
            partsElement.textContent = partsCount;
        }

        const servicesElement = document.getElementById('servicesCount');
        if (servicesElement) {
            servicesElement.textContent = '12'; // Exemplo
        }
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
        // Valores padrão em caso de erro
        const elements = ['customersCount', 'vehiclesCount', 'servicesCount', 'partsCount'];
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = '0';
            }
        });
    }
}

// Funções de busca
async function searchClients() {
    const nameElement = document.getElementById('clientName');
    if (!nameElement) return;
    
    const name = nameElement.value;
    if (!name.trim()) {
        alert('Digite o nome do cliente para buscar');
        return;
    }

    try {
        showLoading('clientsResults');
        const response = await apiCall('/api/customers');
        const clients = response.data || response;

        const filteredClients = clients.filter(client =>
            client.name.toLowerCase().includes(name.toLowerCase())
        );

        displayClientsResults(filteredClients, `Resultados da busca por "${name}"`);
    } catch (error) {
        showError('clientsResults', 'Erro ao buscar clientes: ' + error.message);
    }
}

async function listAllClients() {
    try {
        showLoading('clientsResults');
        const response = await apiCall('/api/customers');
        const clients = response.data || response;
        displayClientsResults(clients, 'Todos os Clientes');
    } catch (error) {
        showError('clientsResults', 'Erro ao carregar clientes: ' + error.message);
    }
}

// Funções auxiliares
function showLoading(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.style.display = 'block';
    container.innerHTML = '<div style="text-align: center; padding: 1rem; color: var(--text-secondary);">🔄 Carregando...</div>';
}

function showError(containerId, message) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.style.display = 'block';
    container.innerHTML = `<div style="text-align: center; padding: 1rem; color: var(--error-color); background: rgba(239, 68, 68, 0.1); border-radius: var(--radius-md);">❌ ${message}</div>`;
}

function displayClientsResults(clients, title) {
    const container = document.getElementById('clientsResults');
    if (!container) return;
    
    container.style.display = 'block';

    if (clients.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 1rem; color: var(--text-secondary);">
                <h4>${title}</h4>
                <p>Nenhum cliente encontrado.</p>
            </div>
        `;
        return;
    }

    let html = `<div style="margin-top: 1rem;"><h4 style="margin-bottom: 1rem;">${title}</h4>`;

    clients.forEach(client => {
        html += `
            <div style="background: var(--bg-primary); border: 1px solid var(--bg-tertiary); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 0.5rem;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>${client.name}</strong><br>
                        <small style="color: var(--text-secondary);">
                            ${client.email || 'Sem email'} | ${client.phone || 'Sem telefone'}
                        </small>
                    </div>
                    <div style="display: flex; gap: 0.5rem;">
                        <a href="/customer-form.html?id=${client.id}" class="btn btn-sm btn-secondary">Editar</a>
                        <a href="/service-order-form.html?customerId=${client.id}" class="btn btn-sm btn-primary">Nova OS</a>
                    </div>
                </div>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

// Implementar outras funções de busca...
async function searchVehicles() {
    showError('vehiclesResults', 'Funcionalidade em desenvolvimento');
}

async function listAllVehicles() {
    showError('vehiclesResults', 'Funcionalidade em desenvolvimento');
}

async function searchParts() {
    showError('partsResults', 'Funcionalidade em desenvolvimento');
}

async function listAllParts() {
    showError('partsResults', 'Funcionalidade em desenvolvimento');
}

// Event listeners para data-action
document.addEventListener('DOMContentLoaded', function() {
    // Carregar estatísticas
    loadStats();
    
    // Adicionar event listeners para data-action
    document.addEventListener('click', function(e) {
        const action = e.target.getAttribute('data-action');
        if (!action) return;
        
        e.preventDefault();
        
        switch(action) {
            case 'toggle-user-menu':
                toggleUserMenu();
                break;
            case 'search-clients':
                searchClients();
                break;
            case 'list-all-clients':
                listAllClients();
                break;
            case 'search-vehicles':
                searchVehicles();
                break;
            case 'list-all-vehicles':
                listAllVehicles();
                break;
            case 'search-parts':
                searchParts();
                break;
            case 'list-all-parts':
                listAllParts();
                break;
            default:
                console.warn('Ação não reconhecida:', action);
        }
    });
});

console.log('✅ Dashboard JavaScript inicializado');
