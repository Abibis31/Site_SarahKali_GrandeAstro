// auth.js - Sistema completo de autenticação com registro local

class AuthSystem {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        console.log('Sistema de auth inicializado. Usuários:', this.users.length);
        this.init();
    }

    init() {
        console.log('Verificando autenticação...');
        
        // DEBUG - Verificar estado atual
        console.log('DEBUG - Estado do auth:');
        console.log('- currentUser:', this.currentUser);
        console.log('- users no localStorage:', this.users.length);
        console.log('- rememberMe:', localStorage.getItem('rememberMe'));
        console.log('- pathname:', window.location.pathname);
        
        console.log('Estado de autenticação:', this.isLoggedIn() ? 'Logado' : 'Não logado');
    }

    // Método para registrar eventos na "planilha" local
    logToLocalSheet(user, action = 'login') {
        try {
            console.log(`📊 Registrando ${action} na planilha local...`);
            
            // Obter ou criar a planilha no localStorage
            const sheetData = JSON.parse(localStorage.getItem('loginRecords')) || [];
            
            // Novo registro
            const newRecord = {
                date: new Date().toLocaleDateString('pt-BR'),
                time: new Date().toLocaleTimeString('pt-BR'),
                action: action,
                name: user.name || 'N/A',
                email: user.email,
                timestamp: new Date().toISOString()
            };
            
            // Adicionar ao array
            sheetData.push(newRecord);
            
            // Manter apenas os últimos 1000 registros (opcional)
            if (sheetData.length > 1000) {
                sheetData.splice(0, sheetData.length - 1000);
            }
            
            // Salvar no localStorage
            localStorage.setItem('loginRecords', JSON.stringify(sheetData));
            
            console.log(`✅ ${action} registrado na planilha local. Total: ${sheetData.length} registros`);
            console.log('Último registro:', newRecord);
            
        } catch (error) {
            console.error(`❌ Erro ao registrar ${action} na planilha local:`, error);
        }
    }

    // Cadastrar novo usuário
    register(userData) {
        return new Promise((resolve, reject) => {
            console.log('Iniciando cadastro para:', userData.email);
            
            try {
                // Validações
                if (!userData.name || !userData.email || !userData.password) {
                    throw new Error('Todos os campos são obrigatórios');
                }

                if (userData.password.length < 6) {
                    throw new Error('A senha deve ter pelo menos 6 caracteres');
                }

                if (userData.password !== userData.confirmPassword) {
                    throw new Error('As senhas não coincidem');
                }

                // Verifica se o email já existe
                if (this.users.find(user => user.email === userData.email)) {
                    throw new Error('Este email já está cadastrado');
                }

                // Cria o usuário
                const newUser = {
                    id: Date.now().toString(),
                    name: userData.name,
                    email: userData.email,
                    password: userData.password,
                    createdAt: new Date().toISOString()
                };

                console.log('Novo usuário criado:', newUser);
                this.users.push(newUser);
                this.saveUsers();
                console.log('Usuário salvo com sucesso');

                // REGISTRAR CADASTRO NA PLANILHA LOCAL
                this.logToLocalSheet(newUser, 'register');

                // Loga o usuário automaticamente após o cadastro
                console.log('Fazendo login automático...');
                this.login(userData.email, userData.password)
                    .then(user => {
                        console.log('Login automático bem-sucedido:', user);
                        resolve(user);
                    })
                    .catch(loginError => {
                        console.error('Erro no login automático:', loginError);
                        reject(new Error('Cadastro realizado, mas falha no login automático'));
                    });

            } catch (error) {
                console.error('Erro no cadastro:', error);
                reject(error);
            }
        });
    }

    // Login
    login(email, password, rememberMe = false) {
        return new Promise((resolve, reject) => {
            console.log('Tentando login para:', email);
            
            try {
                const user = this.users.find(u => u.email === email && u.password === password);
                
                if (user) {
                    this.currentUser = user;
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    console.log('Login bem-sucedido:', user);
                    
                    if (rememberMe) {
                        localStorage.setItem('rememberMe', 'true');
                    }
                    
                    // REGISTRAR LOGIN NA PLANILHA LOCAL
                    this.logToLocalSheet(user, 'login');
                    
                    resolve(user);
                } else {
                    console.log('Login falhou: email ou senha incorretos');
                    reject(new Error('Email ou senha incorretos'));
                }
            } catch (error) {
                console.error('Erro no processo de login:', error);
                reject(new Error('Erro interno no sistema de login'));
            }
        });
    }

    // Recuperação de senha
    requestPasswordReset(email) {
        return new Promise((resolve, reject) => {
            try {
                const user = this.users.find(u => u.email === email);
                
                if (user) {
                    // Em um sistema real, aqui enviaríamos um email
                    const resetToken = Math.random().toString(36).substring(2, 15);
                    user.resetToken = resetToken;
                    user.resetTokenExpiry = Date.now() + 3600000; // 1 hora
                    this.saveUsers();
                    
                    // Simula o envio de email
                    console.log(`Link de recuperação simulado: reset-password.html?token=${resetToken}`);
                    
                    resolve({
                        message: 'Um link de recuperação foi enviado para seu email',
                        token: resetToken
                    });
                } else {
                    reject(new Error('Email não encontrado'));
                }
            } catch (error) {
                console.error('Erro na recuperação de senha:', error);
                reject(new Error('Erro interno no sistema de recuperação'));
            }
        });
    }

    // Redefinir senha
    resetPassword(token, newPassword) {
        return new Promise((resolve, reject) => {
            try {
                const user = this.users.find(u => u.resetToken === token && u.resetTokenExpiry > Date.now());
                
                if (user) {
                    user.password = newPassword;
                    delete user.resetToken;
                    delete user.resetTokenExpiry;
                    this.saveUsers();
                    resolve('Senha redefinida com sucesso');
                } else {
                    reject(new Error('Token inválido ou expirado'));
                }
            } catch (error) {
                console.error('Erro ao redefinir senha:', error);
                reject(new Error('Erro interno ao redefinir senha'));
            }
        });
    }

    // Logout
    logout() {
        console.log('Fazendo logout...');
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        localStorage.removeItem('rememberMe');
        
        // Redireciona para o login
        window.location.href = 'login/index.html';
    }

    // Verificar se está logado
    isLoggedIn() {
        return this.currentUser !== null;
    }

    // Obter usuário atual
    getCurrentUser() {
        return this.currentUser;
    }

    // Salvar usuários no localStorage
    saveUsers() {
        try {
            localStorage.setItem('users', JSON.stringify(this.users));
            console.log('Usuários salvos no localStorage. Total:', this.users.length);
        } catch (error) {
            console.error('Erro ao salvar usuários no localStorage:', error);
            throw new Error('Erro ao salvar dados');
        }
    }

    // Verificar força da senha
    checkPasswordStrength(password) {
        const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;
        const mediumRegex = /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/;

        if (strongRegex.test(password)) {
            return 'strong';
        } else if (mediumRegex.test(password)) {
            return 'medium';
        } else {
            return 'weak';
        }
    }
}

// Inicializar sistema de autenticação
console.log('Inicializando sistema de autenticação...');
const auth = new AuthSystem();

// Funções globais para uso nos HTMLs
window.auth = auth;

// Utilitários para forms
function showLoading(button) {
    console.log('Mostrando loading...');
    const originalText = button.innerHTML;
    button.innerHTML = '<div class="loading-spinner"></div>';
    button.disabled = true;
    return originalText;
}

function hideLoading(button, originalText) {
    console.log('Escondendo loading...');
    button.innerHTML = originalText;
    button.disabled = false;
}

function showMessage(message, type = 'success') {
    console.log(`Mostrando mensagem [${type}]:`, message);
    
    // Remove mensagens existentes
    const existingMessage = document.querySelector('.message-container');
    if (existingMessage) {
        existingMessage.remove();
    }

    // Cria nova mensagem
    const messageDiv = document.createElement('div');
    messageDiv.className = `message-container ${type}`;
    messageDiv.innerHTML = `
        <div class="message-content">
            <span class="message-icon">${type === 'success' ? '✓' : '!'}</span>
            <span class="message-text">${message}</span>
        </div>
    `;

    document.body.appendChild(messageDiv);

    // Remove após 5 segundos
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 5000);
}

// CSS para mensagens
const messageStyles = `
.message-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
    animation: slideInRight 0.3s ease-out;
}

.message-container.success {
    background: linear-gradient(135deg, #2AA198, #4A1D6B);
    border: 1px solid rgba(42, 161, 152, 0.3);
}

.message-container.error {
    background: linear-gradient(135deg, #ff4757, #c9a227);
    border: 1px solid rgba(255, 71, 87, 0.3);
}

.message-content {
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    gap: 10px;
    backdrop-filter: blur(10px);
}

.message-icon {
    font-weight: bold;
    font-size: 1.1rem;
}

@keyframes slideInRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}
`;

// Adicionar estilos das mensagens
const styleSheet = document.createElement('style');
styleSheet.textContent = messageStyles;
document.head.appendChild(styleSheet);

console.log('Auth system carregado com sucesso!');