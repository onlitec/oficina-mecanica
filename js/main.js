// Redirecionar sempre para o dashboard
// O dashboard fará a verificação de autenticação e redirecionará para login se necessário

// Animar barra de progresso
document.addEventListener('DOMContentLoaded', () => {
    const progressBar = document.getElementById('progressBar');
    setTimeout(() => {
        if (progressBar) {
            progressBar.style.width = '100%';
        }
    }, 100);

    // Redirecionar para o dashboard após 1 segundo
    setTimeout(() => {
        window.location.href = '/dashboard.html';
    }, 1000);

    // Verificar status da API automaticamente
    fetch('/health')
        .then(response => response.json())
        .then(data => {
            console.log('API Status:', data);
        })
        .catch(error => {
            console.error('Erro ao verificar API:', error);
        });
});
