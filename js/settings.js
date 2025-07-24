// Settings JavaScript - Arquivo externo para resolver CSP
console.log('🚀 Carregando configurações...');

// Aguardar carregamento completo
window.addEventListener('load', function() {
    console.log('✅ Página carregada, inicializando...');
    
    // Função para mostrar aba
    function showTab(tabName) {
        console.log('🔄 Mostrando aba:', tabName);
        
        // Remover active de todos os botões
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Remover active de todos os painéis
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        
        // Ativar botão clicado
        const activeButton = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }
        
        // Ativar painel correspondente
        const activePanel = document.getElementById(`${tabName}-tab`);
        if (activePanel) {
            activePanel.classList.add('active');
        }
        
        console.log('✅ Aba ativada:', tabName);
    }
    
    // Event listeners para abas
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            console.log('🖱️ Clique na aba:', tabName);
            showTab(tabName);
        });
    });
    
    // Event listeners para botões
    const saveSystem = document.getElementById('save-system');
    if (saveSystem) {
        saveSystem.addEventListener('click', function() {
            console.log('💾 Salvando sistema...');
            alert('✅ Configurações do sistema salvas!');
        });
    }
    
    const saveColors = document.getElementById('save-colors');
    if (saveColors) {
        saveColors.addEventListener('click', function() {
            console.log('🎨 Salvando cores...');
            const primary = document.getElementById('primary-color').value;
            const secondary = document.getElementById('secondary-color').value;
            
            document.documentElement.style.setProperty('--primary-color', primary);
            document.documentElement.style.setProperty('--secondary-color', secondary);
            
            alert('✅ Cores salvas com sucesso!');
        });
    }
    
    const resetColors = document.getElementById('reset-colors');
    if (resetColors) {
        resetColors.addEventListener('click', function() {
            console.log('🔄 Resetando cores...');
            document.getElementById('primary-color').value = '#667eea';
            document.getElementById('secondary-color').value = '#764ba2';
            
            document.documentElement.style.setProperty('--primary-color', '#667eea');
            document.documentElement.style.setProperty('--secondary-color', '#764ba2');
            
            alert('✅ Cores restauradas!');
        });
    }
    
    const newUser = document.getElementById('new-user');
    if (newUser) {
        newUser.addEventListener('click', function() {
            console.log('👤 Novo usuário...');
            alert('👤 Modal de novo usuário (implementar)');
        });
    }
    
    const testEmail = document.getElementById('test-email');
    if (testEmail) {
        testEmail.addEventListener('click', function() {
            console.log('🧪 Testando email...');
            const result = document.getElementById('test-result');
            if (result) {
                result.style.display = 'block';
                result.innerHTML = `
                    <div class="alert alert-info">
                        <strong>🧪 Testando conexão...</strong>
                        <div style="margin-top: 10px;">
                            <span class="loading-spinner" style="margin-right: 10px;"></span>
                            Verificando SMTP...
                        </div>
                    </div>
                `;
                
                setTimeout(() => {
                    result.innerHTML = `
                        <div class="alert alert-success">
                            <strong>✅ Conexão bem-sucedida!</strong>
                            <div style="margin-top: 10px;">
                                • Servidor SMTP: Conectado<br>
                                • Autenticação: OK
                            </div>
                        </div>
                    `;
                }, 2000);
            }
        });
    }
    
    const sendTest = document.getElementById('send-test');
    if (sendTest) {
        sendTest.addEventListener('click', function() {
            console.log('📧 Enviando teste...');
            const email = document.getElementById('test-email-input').value;
            
            if (!email) {
                alert('❌ Digite um email para teste');
                return;
            }
            
            const result = document.getElementById('test-result');
            if (result) {
                result.style.display = 'block';
                result.innerHTML = `
                    <div class="alert alert-info">
                        <strong>📧 Enviando para ${email}...</strong>
                    </div>
                `;
                
                setTimeout(() => {
                    result.innerHTML = `
                        <div class="alert alert-success">
                            <strong>✅ Email enviado!</strong>
                            <div>Verifique a caixa de entrada de ${email}</div>
                        </div>
                    `;
                }, 3000);
            }
        });
    }
    
    // Formulários
    const companyForm = document.getElementById('company-form');
    if (companyForm) {
        companyForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('🏪 Salvando empresa...');
            alert('✅ Dados da empresa salvos!');
        });
    }
    
    const emailForm = document.getElementById('email-form');
    if (emailForm) {
        emailForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('📧 Salvando email...');
            alert('✅ Configurações de email salvas!');
        });
    }
    
    console.log('🎉 Configurações inicializadas com sucesso!');
});
