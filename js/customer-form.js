// Customer Form JavaScript - Arquivo externo para resolver CSP
console.log('🚗 Carregando formulário de cliente...');

// Variáveis globais
let vehicleCounter = 0;
let zipCodeTimeout;

// Aguardar carregamento completo
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Formulário de cliente carregado');
    
    // Verificar autenticação
    checkAuth();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Aplicar máscaras
    applyMasks();
    
    // Configurar tipo inicial
    toggleCustomerType();
    
    // Adicionar um veículo por padrão se não estiver editando
    const isEditing = new URLSearchParams(window.location.search).has('id');
    if (!isEditing) {
        addVehicle();
    }
});

// Configurar event listeners
function setupEventListeners() {
    // Event listeners para tipo de cliente
    document.querySelectorAll('input[name="type"]').forEach(radio => {
        radio.addEventListener('change', toggleCustomerType);
    });
    
    // Event listener para CEP
    const zipCodeInput = document.getElementById('zipCode');
    if (zipCodeInput) {
        zipCodeInput.addEventListener('input', function(e) {
            clearTimeout(zipCodeTimeout);
            zipCodeTimeout = setTimeout(() => {
                searchZipCode(e.target.value);
            }, 500);
        });
    }
    
    // Event listener para formulário
    const customerForm = document.getElementById('customerForm');
    if (customerForm) {
        customerForm.addEventListener('submit', submitForm);
    }
    
    // Event listeners para botões
    setupButtonListeners();
}

// Configurar event listeners para botões
function setupButtonListeners() {
    // Botão adicionar veículo
    const addVehicleBtn = document.querySelector('[data-action="add-vehicle"]');
    if (addVehicleBtn) {
        addVehicleBtn.addEventListener('click', addVehicle);
    }
    
    // Botão limpar formulário
    const clearBtn = document.querySelector('[data-action="clear-form"]');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearForm);
    }
    
    // Menu do usuário
    const userMenu = document.querySelector('.user-info');
    if (userMenu) {
        userMenu.addEventListener('click', toggleUserMenu);
    }
}

// Verificar autenticação
function checkAuth() {
    const user = localStorage.getItem('user');
    if (!user) {
        window.location.href = '/login.html';
        return null;
    }
    return JSON.parse(user);
}

// Logout
function logout() {
    localStorage.removeItem('user');
    window.location.href = '/login.html';
}

// Carregar dados do usuário
function loadUserInfo() {
    const user = checkAuth();
    if (user) {
        const userNameEl = document.getElementById('userName');
        if (userNameEl) {
            userNameEl.textContent = `${user.name} (${user.role})`;
        }
    }
}

// Alternar entre PF e PJ
function toggleCustomerType() {
    const typeRadio = document.querySelector('input[name="type"]:checked');
    if (!typeRadio) return;
    
    const type = typeRadio.value;
    const individualFields = document.getElementById('individualFields');
    const companyFields = document.getElementById('companyFields');
    const cpfCnpjLabel = document.getElementById('cpfCnpjLabel');
    const cpfCnpjInput = document.getElementById('cpfCnpj');
    
    if (type === 'INDIVIDUAL') {
        individualFields.classList.remove('hidden');
        companyFields.classList.add('hidden');
        cpfCnpjLabel.textContent = 'CPF';
        cpfCnpjInput.placeholder = '000.000.000-00';
        cpfCnpjInput.removeAttribute('maxLength');
    } else {
        individualFields.classList.add('hidden');
        companyFields.classList.remove('hidden');
        cpfCnpjLabel.textContent = 'CNPJ';
        cpfCnpjInput.placeholder = '00.000.000/0000-00';
        cpfCnpjInput.removeAttribute('maxLength');
    }
    
    // Limpar validações
    clearErrors();
}

// Máscaras de input
function applyMasks() {
    const cpfCnpjInput = document.getElementById('cpfCnpj');
    const phoneInput = document.getElementById('phone');
    const phone2Input = document.getElementById('phone2');
    
    // Máscara CPF/CNPJ
    if (cpfCnpjInput) {
        cpfCnpjInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            const typeRadio = document.querySelector('input[name="type"]:checked');
            const type = typeRadio ? typeRadio.value : 'INDIVIDUAL';

            if (type === 'INDIVIDUAL') {
                // CPF: 000.000.000-00
                if (value.length > 11) {
                    value = value.substring(0, 11);
                }
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
                value = value.replace(/(\d{3})\.(\d{3})\.(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
            } else {
                // CNPJ: 00.000.000/0000-00
                if (value.length > 14) {
                    value = value.substring(0, 14);
                }
                value = value.replace(/(\d{2})(\d)/, '$1.$2');
                value = value.replace(/(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
                value = value.replace(/(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3/$4');
                value = value.replace(/(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d{1,2})/, '$1.$2.$3/$4-$5');
            }

            e.target.value = value;
        });
    }
    
    // Máscara telefone
    [phoneInput, phone2Input].forEach(input => {
        if (input) {
            input.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                value = value.replace(/(\d{2})(\d)/, '($1) $2');
                value = value.replace(/(\d{4,5})(\d{4})$/, '$1-$2');
                e.target.value = value;
            });
        }
    });
}

// Adicionar veículo
function addVehicle() {
    console.log('🚗 Adicionando veículo...');
    
    vehicleCounter++;
    const vehicleId = Date.now();
    const vehiclesContainer = document.getElementById('vehiclesContainer');
    
    if (!vehiclesContainer) {
        console.error('❌ Container de veículos não encontrado');
        return;
    }

    const vehicleHtml = `
        <div class="vehicle-card" data-vehicle-id="${vehicleId}">
            <div class="vehicle-header">
                <div class="vehicle-title">🚗 Veículo ${vehicleCounter}</div>
                <button type="button" class="remove-vehicle" data-action="remove-vehicle">🗑️ Remover</button>
            </div>

            <input type="hidden" name="vehicles[${vehicleCounter}][id]" value="${vehicleId}">

            <div class="form-row">
                <div class="form-group">
                    <label for="vehicle_brand_${vehicleCounter}">Marca</label>
                    <input type="text" id="vehicle_brand_${vehicleCounter}" name="vehicles[${vehicleCounter}][brand]" required>
                </div>
                <div class="form-group">
                    <label for="vehicle_model_${vehicleCounter}">Modelo</label>
                    <input type="text" id="vehicle_model_${vehicleCounter}" name="vehicles[${vehicleCounter}][model]" required>
                </div>
                <div class="form-group">
                    <label for="vehicle_year_${vehicleCounter}">Ano</label>
                    <input type="number" id="vehicle_year_${vehicleCounter}" name="vehicles[${vehicleCounter}][year]" min="1900" max="2030" required>
                </div>
            </div>

            <div class="form-row">
                <div class="form-group">
                    <label for="vehicle_plate_${vehicleCounter}">Placa</label>
                    <input type="text" id="vehicle_plate_${vehicleCounter}" name="vehicles[${vehicleCounter}][plate]" placeholder="ABC-1234" required>
                </div>
                <div class="form-group">
                    <label for="vehicle_color_${vehicleCounter}">Cor</label>
                    <input type="text" id="vehicle_color_${vehicleCounter}" name="vehicles[${vehicleCounter}][color]">
                </div>
                <div class="form-group">
                    <label for="vehicle_fuel_${vehicleCounter}">Combustível</label>
                    <select id="vehicle_fuel_${vehicleCounter}" name="vehicles[${vehicleCounter}][fuel]">
                        <option value="">Selecione...</option>
                        <option value="GASOLINE">Gasolina</option>
                        <option value="ETHANOL">Etanol</option>
                        <option value="FLEX">Flex</option>
                        <option value="DIESEL">Diesel</option>
                        <option value="CNG">GNV</option>
                        <option value="ELECTRIC">Elétrico</option>
                        <option value="HYBRID">Híbrido</option>
                    </select>
                </div>
            </div>

            <div class="form-group">
                <label for="vehicle_notes_${vehicleCounter}">Observações</label>
                <textarea id="vehicle_notes_${vehicleCounter}" name="vehicles[${vehicleCounter}][notes]" rows="2" placeholder="Observações sobre o veículo..."></textarea>
            </div>
        </div>
    `;

    vehiclesContainer.insertAdjacentHTML('beforeend', vehicleHtml);
    
    // Adicionar event listener para o botão remover
    const removeBtn = vehiclesContainer.querySelector(`[data-vehicle-id="${vehicleId}"] [data-action="remove-vehicle"]`);
    if (removeBtn) {
        removeBtn.addEventListener('click', function() {
            removeVehicle(this);
        });
    }
    
    console.log('✅ Veículo adicionado com sucesso');
}

// Remover veículo
function removeVehicle(button) {
    console.log('🗑️ Removendo veículo...');
    
    const vehicleCard = button.closest('.vehicle-card');
    if (vehicleCard) {
        vehicleCard.remove();
        console.log('✅ Veículo removido com sucesso');
    }
}

// Limpar formulário
function clearForm() {
    console.log('🗑️ Limpando formulário...');
    
    if (confirm('Tem certeza que deseja limpar todos os dados do formulário?')) {
        const form = document.getElementById('customerForm');
        if (form) {
            form.reset();
            
            // Limpar veículos
            const vehiclesContainer = document.getElementById('vehiclesContainer');
            if (vehiclesContainer) {
                vehiclesContainer.innerHTML = '';
            }
            
            // Resetar contador
            vehicleCounter = 0;
            
            // Adicionar um veículo padrão
            addVehicle();
            
            // Configurar tipo inicial
            toggleCustomerType();
            
            console.log('✅ Formulário limpo com sucesso');
        }
    }
}

// Buscar CEP
function searchZipCode(zipCode) {
    console.log('🔍 Buscando CEP:', zipCode);
    
    // Remover caracteres não numéricos
    const cleanZipCode = zipCode.replace(/\D/g, '');
    
    if (cleanZipCode.length !== 8) {
        return;
    }
    
    // Simular busca de CEP
    setTimeout(() => {
        const addressField = document.getElementById('address');
        const neighborhoodField = document.getElementById('neighborhood');
        const cityField = document.getElementById('city');
        const stateField = document.getElementById('state');
        
        if (addressField) addressField.value = 'Rua Exemplo, 123';
        if (neighborhoodField) neighborhoodField.value = 'Centro';
        if (cityField) cityField.value = 'São Paulo';
        if (stateField) stateField.value = 'SP';
        
        console.log('✅ CEP encontrado e campos preenchidos');
    }, 1000);
}

// Limpar erros
function clearErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(el => el.remove());
    
    const invalidFields = document.querySelectorAll('.invalid');
    invalidFields.forEach(field => field.classList.remove('invalid'));
}

// Submeter formulário
function submitForm(e) {
    e.preventDefault();
    console.log('💾 Submetendo formulário...');
    
    // Simular salvamento
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span>⏳</span> Salvando...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            alert('✅ Cliente salvo com sucesso!');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }, 2000);
    }
}

// Menu do usuário
function toggleUserMenu() {
    const confirmed = confirm("Deseja fazer logout?");
    if (confirmed) {
        logout();
    }
}

// Disponibilizar funções globalmente para compatibilidade
window.addVehicle = addVehicle;
window.removeVehicle = removeVehicle;
window.clearForm = clearForm;
window.toggleUserMenu = toggleUserMenu;
window.toggleCustomerType = toggleCustomerType;
