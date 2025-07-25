// Login JavaScript - Arquivo externo para resolver CSP
console.log('🔐 Carregando sistema de login...');

// Aguardar carregamento completo
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Sistema de login carregado');
    
    // Configurar event listeners
    setupEventListeners();
    
    // Verificar se já está logado
    checkExistingAuth();
});

// Configurar event listeners
function setupEventListeners() {
    // Event listener para o formulário de login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Event listeners para credenciais de teste
    setupCredentialButtons();
    
    // Event listener para mostrar/ocultar senha
    const togglePassword = document.querySelector('.toggle-password');
    if (togglePassword) {
        togglePassword.addEventListener('click', togglePasswordVisibility);
    }
}

// Configurar botões de credenciais
function setupCredentialButtons() {
    const credButtons = document.querySelectorAll('[data-email]');
    credButtons.forEach(button => {
        button.addEventListener('click', function() {
            const email = this.getAttribute('data-email');
            const password = this.getAttribute('data-password');
            fillCredentials(email, password);
        });
    });
}

// Preencher credenciais
function fillCredentials(email, password) {
    console.log('🔑 Preenchendo credenciais:', email);
    
    const emailField = document.getElementById('email');
    const passwordField = document.getElementById('password');
    
    if (emailField) emailField.value = email;
    if (passwordField) passwordField.value = password;
    
    // Adicionar efeito visual
    [emailField, passwordField].forEach(field => {
        if (field) {
            field.classList.add('filled');
            setTimeout(() => field.classList.remove('filled'), 1000);
        }
    });
}

// Alternar visibilidade da senha
function togglePasswordVisibility() {
    const passwordField = document.getElementById('password');
    const toggleIcon = this.querySelector('span');
    
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        toggleIcon.textContent = '🙈';
    } else {
        passwordField.type = 'password';
        toggleIcon.textContent = '👁️';
    }
}

// Verificar autenticação existente
function checkExistingAuth() {
    try {
        const auth = new AuthManager();
        if (auth.isAuthenticated()) {
            console.log('✅ Usuário já autenticado, redirecionando...');
            window.location.href = '/dashboard.html';
        }
    } catch (error) {
        console.log('⚠️ AuthManager não disponível ou erro:', error);
    }
}

// Manipular login
async function handleLogin(e) {
    e.preventDefault();
    console.log('🔐 Tentativa de login...');
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const submitBtn = e.target.querySelector('button[type="submit"]') || document.querySelector('button[type="submit"]');
    const messageDiv = document.getElementById('message');
    
    // Validação básica
    if (!email || !password) {
        showMessage('Por favor, preencha todos os campos.', 'error');
        return;
    }
    
    // Mostrar loading
    let originalText = 'Entrar';
    if (submitBtn) {
        originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '⏳ Entrando...';
        submitBtn.disabled = true;
    }
    
    try {
        // Simular autenticação (substituir por chamada real da API)
        const success = await simulateLogin(email, password);
        
        if (success) {
            showMessage('✅ Login realizado com sucesso!', 'success');
            
            // Redirecionar após sucesso
            setTimeout(() => {
                window.location.href = '/dashboard.html';
            }, 1000);
        } else {
            showMessage('❌ Email ou senha incorretos.', 'error');
        }
    } catch (error) {
        console.error('Erro no login:', error);
        showMessage('❌ Erro de conexão. Tente novamente.', 'error');
    } finally {
        // Restaurar botão
        if (submitBtn) {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }
}

// Simular login (substituir por integração real)
async function simulateLogin(email, password) {
    console.log('🔍 Verificando credenciais...');
    
    // Simular delay da rede
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Credenciais de teste
    const validCredentials = [
        { email: 'admin@oficina.com', password: 'admin123', name: 'Administrador', role: 'admin' },
        { email: 'mecanico@oficina.com', password: 'mecanico123', name: 'João Mecânico', role: 'mechanic' },
        { email: 'atendente@oficina.com', password: 'atendente123', name: 'Maria Atendente', role: 'attendant' }
    ];
    
    const user = validCredentials.find(cred => 
        cred.email === email && cred.password === password
    );
    
    if (user) {
        console.log('✅ Credenciais válidas para:', user.name);
        
        // Salvar no localStorage (substituir por token JWT real)
        const userData = {
            id: Date.now(),
            email: user.email,
            name: user.name,
            role: user.role,
            loginTime: new Date().toISOString()
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Se AuthManager estiver disponível, usar ele também
        try {
            const auth = new AuthManager();
            auth.login(userData);
        } catch (error) {
            console.log('⚠️ AuthManager não disponível:', error);
        }
        
        return true;
    } else {
        console.log('❌ Credenciais inválidas');
        return false;
    }
}

// Mostrar mensagem
function showMessage(message, type = 'info') {
    const messageDiv = document.getElementById('message');
    if (!messageDiv) {
        console.error('❌ Elemento #message não encontrado');
        return;
    }

    messageDiv.innerHTML = `<div class="message ${type}">${message}</div>`;
    messageDiv.style.display = 'block';

    // Auto-ocultar mensagens de sucesso
    if (type === 'success') {
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 3000);
    }
}

// Disponibilizar funções globalmente para compatibilidade
window.fillCredentials = fillCredentials;
window.handleLogin = handleLogin;
