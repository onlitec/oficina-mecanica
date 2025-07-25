// LOGO IMUTÁVEL - FORÇA ABSOLUTA
console.log('🔒 Iniciando sistema de logo imutável...');

class LogoImmutable {
    constructor() {
        this.originalStates = new Map();
        this.observers = [];
        this.isActive = false;
    }

    // Capturar estado original do logo
    captureOriginalState() {
        // FOCAR APENAS NOS ÍCONES, NÃO NO CONTAINER
        const logoIcons = document.querySelectorAll('.logo-icon, .logo img, img.logo-icon');

        logoIcons.forEach((element, index) => {
            const rect = element.getBoundingClientRect();
            const computedStyle = window.getComputedStyle(element);

            const state = {
                element: element,
                width: computedStyle.width,
                height: computedStyle.height,
                fontSize: computedStyle.fontSize,
                transform: computedStyle.transform,
                transition: computedStyle.transition,
                objectFit: computedStyle.objectFit,
                boundingRect: {
                    x: rect.x,
                    y: rect.y,
                    width: rect.width,
                    height: rect.height
                }
            };

            this.originalStates.set(`logo-icon-${index}`, state);
            console.log(`📸 Estado original capturado para logo-icon-${index}:`, state);
        });

        // CAPTURAR CONTAINER LOGO APENAS PARA MONITORAR TRANSFORMS
        const logoContainers = document.querySelectorAll('.logo');
        logoContainers.forEach((element, index) => {
            const computedStyle = window.getComputedStyle(element);

            const state = {
                element: element,
                transform: computedStyle.transform,
                transition: computedStyle.transition,
                animation: computedStyle.animation
            };

            this.originalStates.set(`logo-container-${index}`, state);
            console.log(`📸 Estado do container capturado para logo-container-${index}:`, state);
        });
    }

    // Forçar estado original
    forceOriginalState() {
        this.originalStates.forEach((state, key) => {
            const element = state.element;

            if (element && element.parentNode) {
                // APLICAR APENAS A ELEMENTOS DE ÍCONE, NÃO AO CONTAINER
                if (element.classList.contains('logo-icon') ||
                    (element.tagName === 'IMG' && element.closest('.logo-icon')) ||
                    (element.tagName === 'SPAN' && element.closest('.logo-icon'))) {

                    // FORÇA ESTILO APENAS PARA ÍCONES
                    element.style.setProperty('width', '32px', 'important');
                    element.style.setProperty('height', '32px', 'important');
                    element.style.setProperty('min-width', '32px', 'important');
                    element.style.setProperty('min-height', '32px', 'important');
                    element.style.setProperty('max-width', '32px', 'important');
                    element.style.setProperty('max-height', '32px', 'important');
                    element.style.setProperty('font-size', '1.5rem', 'important');
                    element.style.setProperty('transform', 'none', 'important');
                    element.style.setProperty('transition', 'none', 'important');
                    element.style.setProperty('animation', 'none', 'important');
                    element.style.setProperty('object-fit', 'contain', 'important');
                    element.style.setProperty('flex-shrink', '0', 'important');
                    element.style.setProperty('display', 'flex', 'important');
                    element.style.setProperty('align-items', 'center', 'important');
                    element.style.setProperty('justify-content', 'center', 'important');

                    // FORÇA ATRIBUTOS PARA IMAGENS
                    if (element.tagName === 'IMG') {
                        element.setAttribute('width', '32');
                        element.setAttribute('height', '32');
                    }
                }

                // NÃO MEXER NO POSICIONAMENTO DO CONTAINER .logo
                if (element.classList.contains('logo')) {
                    // Apenas garantir que não há transforms problemáticos
                    element.style.setProperty('transform', 'none', 'important');
                    element.style.setProperty('transition', 'none', 'important');
                    element.style.setProperty('animation', 'none', 'important');
                    // NÃO FORÇAR POSITION, DEIXAR O CSS CONTROLAR
                }
            }
        });
    }

    // Criar observer para detectar mudanças
    createObserver() {
        const observer = new MutationObserver((mutations) => {
            let needsCorrection = false;
            
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes') {
                    const target = mutation.target;
                    
                    // Verificar se é um elemento de logo
                    if (target.classList.contains('logo-icon') || 
                        target.classList.contains('logo') ||
                        target.classList.contains('logo-text') ||
                        target.tagName === 'IMG' && target.closest('.logo')) {
                        
                        console.warn('⚠️ Mudança detectada no logo:', mutation.attributeName, target);
                        needsCorrection = true;
                    }
                }
                
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) {
                            if (node.classList.contains('logo-icon') || 
                                node.classList.contains('logo') ||
                                node.querySelector && node.querySelector('.logo-icon, .logo')) {
                                console.warn('⚠️ Novo elemento de logo adicionado:', node);
                                needsCorrection = true;
                            }
                        }
                    });
                }
            });
            
            if (needsCorrection) {
                console.log('🔧 Aplicando correção imediata...');
                setTimeout(() => {
                    this.forceOriginalState();
                }, 10);
            }
        });

        // Observar mudanças em todo o header
        const header = document.querySelector('.header');
        if (header) {
            observer.observe(header, {
                attributes: true,
                childList: true,
                subtree: true,
                attributeFilter: ['style', 'class', 'width', 'height', 'src']
            });
            
            this.observers.push(observer);
            console.log('👁️ Observer criado para o header');
        }

        // Observar mudanças no body também
        observer.observe(document.body, {
            attributes: true,
            childList: true,
            subtree: true,
            attributeFilter: ['style', 'class']
        });
        
        this.observers.push(observer);
        console.log('👁️ Observer criado para o body');
    }

    // Monitoramento contínuo
    startContinuousMonitoring() {
        setInterval(() => {
            this.forceOriginalState();
        }, 50); // A cada 50ms
        
        console.log('🔄 Monitoramento contínuo iniciado (50ms)');
    }

    // Interceptar mudanças de estilo
    interceptStyleChanges() {
        const logoElements = document.querySelectorAll('.logo, .logo-icon, .logo-text, .logo img, img.logo-icon');
        
        logoElements.forEach(element => {
            // Interceptar setProperty
            const originalSetProperty = element.style.setProperty;
            element.style.setProperty = function(property, value, priority) {
                // Permitir apenas nossas mudanças
                if (priority === 'important' && 
                    (property === 'width' || property === 'height') && 
                    value === '32px') {
                    return originalSetProperty.call(this, property, value, priority);
                }
                
                // Bloquear outras mudanças de tamanho
                if (property === 'width' || property === 'height' || 
                    property === 'font-size' || property === 'transform' ||
                    property === 'transition' || property === 'animation') {
                    console.warn('🚫 Mudança de estilo bloqueada:', property, value);
                    return;
                }
                
                return originalSetProperty.call(this, property, value, priority);
            };
        });
    }

    // Inicializar sistema
    init() {
        if (this.isActive) return;
        
        console.log('🚀 Inicializando sistema de logo imutável...');
        
        // Aguardar DOM estar pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.start();
            });
        } else {
            this.start();
        }
    }

    start() {
        this.isActive = true;
        
        // Capturar estado original
        this.captureOriginalState();
        
        // Forçar estado inicial
        this.forceOriginalState();
        
        // Criar observers
        this.createObserver();
        
        // Interceptar mudanças
        this.interceptStyleChanges();
        
        // Iniciar monitoramento contínuo
        this.startContinuousMonitoring();
        
        console.log('✅ Sistema de logo imutável ativado!');
    }

    // Parar sistema
    stop() {
        this.isActive = false;
        this.observers.forEach(observer => observer.disconnect());
        this.observers = [];
        console.log('🛑 Sistema de logo imutável desativado');
    }
}

// Instância global
window.logoImmutable = new LogoImmutable();

// TEMPORARIAMENTE DESABILITADO PARA TESTE
// window.logoImmutable.init();
console.log('⚠️ Logo Imutável temporariamente desabilitado para teste');

// Reforçar após carregamento completo
window.addEventListener('load', () => {
    setTimeout(() => {
        window.logoImmutable.forceOriginalState();
    }, 100);
});

console.log('🔒 Sistema de logo imutável carregado!');
