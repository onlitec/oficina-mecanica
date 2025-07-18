# Solução de Problemas - Sistema de Gestão de Oficina Mecânica

## 🔧 Problemas Comuns e Soluções

### ❌ "Service Unavailable" no Navegador

**Problema**: O navegador mostra "Service Unavailable" mas o curl funciona.

**Causas Possíveis**:
1. **Cache do navegador**
2. **Node.js não está rodando**
3. **Timing de inicialização**

**Soluções**:

#### 1. **Limpar Cache do Navegador**
- **Chrome/Firefox**: `Ctrl + Shift + R` (hard refresh)
- **Ou**: `Ctrl + F5`
- **Ou**: Abrir DevTools (F12) → Network → Disable cache

#### 2. **Verificar se Node.js está rodando**
```bash
# Verificar se a porta 3000 está em uso
netstat -tlnp | grep :3000

# Se não estiver, iniciar a aplicação
cd /var/www/html
./start-oficina.sh
```

#### 3. **Verificar Apache**
```bash
# Status do Apache
sudo systemctl status apache2

# Reiniciar se necessário
sudo systemctl restart apache2
```

#### 4. **Testar via Terminal**
```bash
# Testar conexão direta Node.js
curl http://localhost:3000/health

# Testar via Apache
curl http://toledooficina.local/health
curl http://toledooficina.local/api/users
```

### 🌐 URLs de Acesso

#### **✅ URLs que DEVEM funcionar**:
- **http://toledooficina.local/** - Interface web
- **http://toledooficina.local/health** - Health check
- **http://toledooficina.local/api** - Info da API
- **http://toledooficina.local/api/users** - Lista usuários
- **http://toledooficina.local/api/customers** - Lista clientes

#### **🔧 URLs diretas (Node.js)**:
- **http://localhost:3000/health** - Health check direto
- **http://localhost:3000/api** - API direta

### 🚀 Como Iniciar Corretamente

#### **Método 1: Script Automático**
```bash
cd /var/www/html
./start-oficina.sh
```

#### **Método 2: Manual**
```bash
cd /var/www/html
export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
npm run dev
```

### 🔍 Verificação de Status

#### **Verificar se tudo está funcionando**:
```bash
# 1. Apache rodando?
sudo systemctl status apache2

# 2. Node.js rodando?
curl http://localhost:3000/health

# 3. Proxy funcionando?
curl http://toledooficina.local/health

# 4. API funcionando?
curl http://toledooficina.local/api/users
```

### 📊 Logs para Diagnóstico

#### **Logs do Apache**:
```bash
# Logs de erro
sudo tail -f /var/log/apache2/oficina_error.log

# Logs de acesso
sudo tail -f /var/log/apache2/oficina_access.log
```

#### **Logs do Node.js**:
- Visíveis no terminal onde rodou `npm run dev`

### 🛠️ Comandos Úteis

#### **Reiniciar Serviços**:
```bash
# Reiniciar Apache
sudo systemctl restart apache2

# Parar Node.js: Ctrl+C no terminal
# Iniciar Node.js: npm run dev
```

#### **Verificar Portas**:
```bash
# Porta 80 (Apache)
sudo lsof -i :80

# Porta 3000 (Node.js)
lsof -i :3000
```

### 🎯 Teste Rápido

**Execute este comando para testar tudo**:
```bash
echo "=== TESTE COMPLETO ==="
echo "1. Apache:" && curl -s http://localhost/ | head -5
echo "2. Health:" && curl -s http://localhost/health
echo "3. API:" && curl -s http://localhost/api | head -3
echo "4. Users:" && curl -s http://localhost/api/users | head -3
echo "=== FIM DO TESTE ==="
```

### ✅ Status Esperado

**Se tudo estiver funcionando, você deve ver**:
- ✅ Apache ativo na porta 80
- ✅ Node.js ativo na porta 3000
- ✅ Proxy funcionando (Apache → Node.js)
- ✅ API retornando dados JSON
- ✅ Interface web carregando

### 🆘 Se Nada Funcionar

1. **Reiniciar tudo**:
   ```bash
   sudo systemctl restart apache2
   cd /var/www/html && ./start-oficina.sh
   ```

2. **Verificar logs**:
   ```bash
   sudo tail -20 /var/log/apache2/oficina_error.log
   ```

3. **Testar passo a passo**:
   - Node.js direto: `curl http://localhost:3000/health`
   - Apache: `curl http://localhost/health`
   - Navegador: Limpar cache + `http://localhost/`
