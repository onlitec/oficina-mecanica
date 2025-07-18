/**
 * Sistema de Autenticação Global
 * Gerencia login, logout e verificação de autenticação
 */

class AuthManager {
    constructor() {
        this.storageKey = 'user';
        this.loginUrl = '/login.html';
        this.dashboardUrl = '/dashboard.html';
    }

    /**
     * Verificar se o usuário está logado
     */
    isAuthenticated() {
        const user = localStorage.getItem(this.storageKey);
        if (!user) return false;

        try {
            const userData = JSON.parse(user);
            // Verificar se o token não expirou (opcional)
            if (userData.loginTime) {
                const loginTime = new Date(userData.loginTime);
                const now = new Date();
                const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
                
                // Token expira em 24 horas
                if (hoursDiff > 24) {
                    this.logout();
                    return false;
                }
            }
            return true;
        } catch (error) {
            console.error('Erro ao verificar autenticação:', error);
            this.logout();
            return false;
        }
    }

    /**
     * Obter dados do usuário logado
     */
    getUser() {
        if (!this.isAuthenticated()) return null;
        
        try {
            return JSON.parse(localStorage.getItem(this.storageKey));
        } catch (error) {
            console.error('Erro ao obter dados do usuário:', error);
            return null;
        }
    }

    /**
     * Fazer login
     */
    login(userData) {
        try {
            const userWithTimestamp = {
                ...userData,
                loginTime: new Date().toISOString()
            };
            localStorage.setItem(this.storageKey, JSON.stringify(userWithTimestamp));
            return true;
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            return false;
        }
    }

    /**
     * Fazer logout
     */
    logout() {
        localStorage.removeItem(this.storageKey);
        window.location.href = this.loginUrl;
    }

    /**
     * Redirecionar para login se não estiver autenticado
     */
    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = this.loginUrl;
            return false;
        }
        return true;
    }

    /**
     * Redirecionar para dashboard se já estiver autenticado
     */
    redirectIfAuthenticated() {
        if (this.isAuthenticated()) {
            window.location.href = this.dashboardUrl;
            return true;
        }
        return false;
    }

    /**
     * Verificar permissões do usuário
     */
    hasRole(role) {
        const user = this.getUser();
        return user && user.role === role;
    }

    /**
     * Verificar se é administrador
     */
    isAdmin() {
        return this.hasRole('ADMIN');
    }

    /**
     * Verificar se é mecânico
     */
    isMechanic() {
        return this.hasRole('MECHANIC');
    }
}

// Instância global do gerenciador de autenticação
const auth = new AuthManager();

// Exportar para uso global
window.auth = auth;

// Função de conveniência para verificar autenticação
window.checkAuth = () => auth.requireAuth();

// Função de conveniência para logout
window.logout = () => auth.logout();
