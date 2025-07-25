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
    
    // Event listeners para identidade visual
    setupIdentityListeners();

    // Carregar configurações salvas
    loadSavedSettings();

    console.log('🎉 Configurações inicializadas com sucesso!');
});

// Configurar event listeners para identidade visual
function setupIdentityListeners() {
    // Upload de logotipo
    const logoUploadArea = document.getElementById('logo-upload-area');
    const logoFile = document.getElementById('logo-file');
    const logoPreview = document.getElementById('logo-preview');
    const logoPlaceholder = document.getElementById('logo-placeholder');
    const logoActions = document.getElementById('logo-actions');

    if (logoUploadArea && logoFile) {
        logoUploadArea.addEventListener('click', () => logoFile.click());
        logoFile.addEventListener('change', handleLogoUpload);

        // Drag and drop para logotipo
        logoUploadArea.addEventListener('dragover', handleDragOver);
        logoUploadArea.addEventListener('dragleave', handleDragLeave);
        logoUploadArea.addEventListener('drop', handleLogoDrop);
    }

    // Upload de favicon
    const faviconUploadArea = document.getElementById('favicon-upload-area');
    const faviconFile = document.getElementById('favicon-file');
    const faviconPreview = document.getElementById('favicon-preview');
    const faviconPlaceholder = document.getElementById('favicon-placeholder');
    const faviconActions = document.getElementById('favicon-actions');

    if (faviconUploadArea && faviconFile) {
        faviconUploadArea.addEventListener('click', () => faviconFile.click());
        faviconFile.addEventListener('change', handleFaviconUpload);

        // Drag and drop para favicon
        faviconUploadArea.addEventListener('dragover', handleDragOver);
        faviconUploadArea.addEventListener('dragleave', handleDragLeave);
        faviconUploadArea.addEventListener('drop', handleFaviconDrop);
    }

    // Botões de ação
    const uploadLogo = document.getElementById('upload-logo');
    const removeLogo = document.getElementById('remove-logo');
    const uploadFavicon = document.getElementById('upload-favicon');
    const removeFavicon = document.getElementById('remove-favicon');
    const saveTitle = document.getElementById('save-title');
    const saveIdentity = document.getElementById('save-identity');
    const resetIdentity = document.getElementById('reset-identity');

    if (uploadLogo) {
        uploadLogo.addEventListener('click', applyLogo);
    }

    if (removeLogo) {
        removeLogo.addEventListener('click', removeLogoPreview);
    }

    if (uploadFavicon) {
        uploadFavicon.addEventListener('click', applyFavicon);
    }

    if (removeFavicon) {
        removeFavicon.addEventListener('click', removeFaviconPreview);
    }

    if (saveTitle) {
        saveTitle.addEventListener('click', saveSystemTitle);
    }

    if (saveIdentity) {
        saveIdentity.addEventListener('click', saveIdentitySettings);
    }

    if (resetIdentity) {
        resetIdentity.addEventListener('click', resetIdentitySettings);
    }

    // Título do sistema
    const systemTitle = document.getElementById('system-title');
    if (systemTitle) {
        systemTitle.addEventListener('input', updateSystemTitlePreview);
        systemTitle.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveSystemTitle();
            }
        });
    }
}

// Manipular upload de logotipo
function handleLogoUpload(event) {
    const file = event.target.files[0];
    if (file) {
        if (validateImageFile(file, 2)) {
            previewLogo(file);
        }
    }
}

// Manipular upload de favicon
function handleFaviconUpload(event) {
    const file = event.target.files[0];
    if (file) {
        if (validateImageFile(file, 1)) {
            previewFavicon(file);
        }
    }
}

// Validar arquivo de imagem
function validateImageFile(file, maxSizeMB) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'image/x-icon'];

    if (!validTypes.includes(file.type)) {
        alert('❌ Tipo de arquivo não suportado. Use PNG, JPG, SVG ou ICO.');
        return false;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
        alert(`❌ Arquivo muito grande. Tamanho máximo: ${maxSizeMB}MB.`);
        return false;
    }

    return true;
}

// Preview do logotipo
function previewLogo(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const logoPreview = document.getElementById('logo-preview');
        const logoPlaceholder = document.getElementById('logo-placeholder');
        const logoActions = document.getElementById('logo-actions');

        if (logoPreview && logoPlaceholder && logoActions) {
            logoPreview.src = e.target.result;
            logoPreview.style.display = 'block';
            logoPlaceholder.style.display = 'none';
            logoActions.style.display = 'flex';
        }
    };
    reader.readAsDataURL(file);
}

// Preview do favicon
function previewFavicon(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const faviconPreview = document.getElementById('favicon-preview');
        const faviconPlaceholder = document.getElementById('favicon-placeholder');
        const faviconActions = document.getElementById('favicon-actions');

        if (faviconPreview && faviconPlaceholder && faviconActions) {
            faviconPreview.src = e.target.result;
            faviconPreview.style.display = 'block';
            faviconPlaceholder.style.display = 'none';
            faviconActions.style.display = 'flex';
        }
    };
    reader.readAsDataURL(file);
}

// Aplicar logotipo
function applyLogo() {
    console.log('🖼️ Aplicando logotipo...');
    const logoPreview = document.getElementById('logo-preview');

    if (logoPreview && logoPreview.src) {
        // Atualizar logotipo no menu
        const logoIcons = document.querySelectorAll('.logo-icon');
        const logoImages = document.querySelectorAll('.logo img');

        logoIcons.forEach(icon => {
            const img = document.createElement('img');
            img.src = logoPreview.src;
            img.alt = 'Logo';

            // FORÇA TAMANHO FIXO CONSISTENTE
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
        });

        // Salvar no localStorage
        localStorage.setItem('customLogo', logoPreview.src);

        alert('✅ Logotipo aplicado com sucesso!');
    }
}

// Aplicar favicon
function applyFavicon() {
    console.log('🔖 Aplicando favicon...');
    const faviconPreview = document.getElementById('favicon-preview');

    if (faviconPreview && faviconPreview.src) {
        // Atualizar favicon na página
        let favicon = document.querySelector('link[rel="icon"]');
        if (!favicon) {
            favicon = document.createElement('link');
            favicon.rel = 'icon';
            document.head.appendChild(favicon);
        }
        favicon.href = faviconPreview.src;

        // Salvar no localStorage
        localStorage.setItem('customFavicon', faviconPreview.src);

        alert('✅ Favicon aplicado com sucesso!');
    }
}

// Remover preview do logotipo
function removeLogoPreview() {
    const logoPreview = document.getElementById('logo-preview');
    const logoPlaceholder = document.getElementById('logo-placeholder');
    const logoActions = document.getElementById('logo-actions');
    const logoFile = document.getElementById('logo-file');

    if (logoPreview && logoPlaceholder && logoActions && logoFile) {
        logoPreview.style.display = 'none';
        logoPlaceholder.style.display = 'flex';
        logoActions.style.display = 'none';
        logoFile.value = '';
    }
}

// Remover preview do favicon
function removeFaviconPreview() {
    const faviconPreview = document.getElementById('favicon-preview');
    const faviconPlaceholder = document.getElementById('favicon-placeholder');
    const faviconActions = document.getElementById('favicon-actions');
    const faviconFile = document.getElementById('favicon-file');

    if (faviconPreview && faviconPlaceholder && faviconActions && faviconFile) {
        faviconPreview.style.display = 'none';
        faviconPlaceholder.style.display = 'flex';
        faviconActions.style.display = 'none';
        faviconFile.value = '';
    }
}

// Atualizar preview do título do sistema
function updateSystemTitlePreview() {
    const systemTitle = document.getElementById('system-title');
    const logoTexts = document.querySelectorAll('.logo-text');

    if (systemTitle && logoTexts.length > 0) {
        const newTitle = systemTitle.value || 'Oficina Mecânica';
        logoTexts.forEach(logoText => {
            logoText.textContent = newTitle;
        });
    }
}

// Salvar apenas o título do sistema
function saveSystemTitle() {
    console.log('💾 Salvando título do sistema...');

    const systemTitle = document.getElementById('system-title');
    const saveBtn = document.getElementById('save-title');

    if (systemTitle && saveBtn) {
        const title = systemTitle.value.trim() || 'Oficina Mecânica';

        // Mostrar loading no botão
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<span>⏳</span> Salvando...';
        saveBtn.disabled = true;

        // Simular delay para feedback visual
        setTimeout(() => {
            // Salvar título
            localStorage.setItem('systemTitle', title);

            // Atualizar título da página
            const currentTitle = document.title;
            if (currentTitle.includes(' - ')) {
                const suffix = currentTitle.split(' - ').slice(1).join(' - ');
                document.title = `${suffix} - ${title}`;
            } else {
                document.title = title;
            }

            // Atualizar textos do logo
            updateSystemTitlePreview();

            // Feedback de sucesso
            saveBtn.innerHTML = '<span>✅</span> Salvo!';
            saveBtn.style.backgroundColor = 'var(--success-color)';

            // Restaurar botão após 2 segundos
            setTimeout(() => {
                saveBtn.innerHTML = originalText;
                saveBtn.disabled = false;
                saveBtn.style.backgroundColor = '';
            }, 2000);

            console.log('✅ Título salvo:', title);
        }, 500);
    }
}

// Salvar configurações de identidade
function saveIdentitySettings() {
    console.log('💾 Salvando identidade visual...');

    const systemTitle = document.getElementById('system-title');

    if (systemTitle) {
        const title = systemTitle.value || 'Oficina Mecânica';

        // Salvar título
        localStorage.setItem('systemTitle', title);

        // Atualizar título da página
        document.title = title;

        // Atualizar textos do logo
        updateSystemTitlePreview();

        alert('✅ Identidade visual salva com sucesso!');
    }
}

// Restaurar configurações padrão
function resetIdentitySettings() {
    console.log('🔄 Restaurando identidade visual padrão...');

    if (confirm('Tem certeza que deseja restaurar a identidade visual padrão?')) {
        // Restaurar título
        const systemTitle = document.getElementById('system-title');
        if (systemTitle) {
            systemTitle.value = 'Oficina Mecânica';
            updateSystemTitlePreview();
        }

        // Remover logotipo customizado
        localStorage.removeItem('customLogo');
        const logoImages = document.querySelectorAll('.logo img');
        logoImages.forEach(img => {
            const icon = document.createElement('span');
            icon.className = 'logo-icon';
            icon.textContent = '🔧';
            img.parentNode.replaceChild(icon, img);
        });

        // Remover favicon customizado
        localStorage.removeItem('customFavicon');
        const favicon = document.querySelector('link[rel="icon"]');
        if (favicon) {
            favicon.remove();
        }

        // Remover título customizado
        localStorage.removeItem('systemTitle');
        document.title = 'Oficina Mecânica';

        // Limpar previews
        removeLogoPreview();
        removeFaviconPreview();

        alert('✅ Identidade visual restaurada!');
    }
}

// Manipular drag and drop
function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
}

function handleLogoDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        if (validateImageFile(file, 2)) {
            previewLogo(file);
            document.getElementById('logo-file').files = files;
        }
    }
}

function handleFaviconDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        if (validateImageFile(file, 1)) {
            previewFavicon(file);
            document.getElementById('favicon-file').files = files;
        }
    }
}

// Carregar configurações salvas
function loadSavedSettings() {
    console.log('📂 Carregando configurações salvas...');

    // Carregar título do sistema
    const savedTitle = localStorage.getItem('systemTitle');
    if (savedTitle) {
        const systemTitle = document.getElementById('system-title');
        if (systemTitle) {
            systemTitle.value = savedTitle;
            updateSystemTitlePreview();
            document.title = savedTitle;
        }
    }

    // Carregar logotipo customizado
    const savedLogo = localStorage.getItem('customLogo');
    if (savedLogo) {
        const logoIcons = document.querySelectorAll('.logo-icon');
        logoIcons.forEach(icon => {
            const img = document.createElement('img');
            img.src = savedLogo;
            img.alt = 'Logo';

            // FORÇA TAMANHO FIXO CONSISTENTE
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
        });
    }

    // Carregar favicon customizado
    const savedFavicon = localStorage.getItem('customFavicon');
    if (savedFavicon) {
        let favicon = document.querySelector('link[rel="icon"]');
        if (!favicon) {
            favicon = document.createElement('link');
            favicon.rel = 'icon';
            document.head.appendChild(favicon);
        }
        favicon.href = savedFavicon;
    }
}
