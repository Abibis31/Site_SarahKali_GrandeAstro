// auth.js - Sistema de autenticação com exportação para CSV

class AuthSystem {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        console.log('Sistema de auth inicializado. Usuários:', this.users.length);
    }

    // Registrar eventos e criar arquivo CSV
    logToSheet(user, action = 'login') {
        try {
            console.log(`📊 Registrando ${action}...`);
            
            // Obter ou criar os dados
            const sheetData = JSON.parse(localStorage.getItem('loginRecords')) || [];
            
            // Novo registro
            const newRecord = {
                date: new Date().toLocaleDateString('pt-BR'),
                time: new Date().toLocaleTimeString('pt-BR'),
                action: action,
                name: user.name || 'N/A',
                email: user.email
            };
            
            // Adicionar ao array
            sheetData.push(newRecord);
            
            // Salvar no localStorage
            localStorage.setItem('loginRecords', JSON.stringify(sheetData));
            
            console.log(`✅ ${action} registrado. Total: ${sheetData.length} registros`);
            
            // CRIAR ARQUIVO CSV FÍSICO
            this.createCSVFile(sheetData);
            
        } catch (error) {
            console.error(`❌ Erro ao registrar ${action}:`, error);
        }
    }

    // Criar arquivo CSV físico
    createCSVFile(records) {
        try {
            // Cabeçalho do CSV
            let csv = 'Data,Hora,Ação,Nome,Email\n';
            
            // Adicionar todos os registros
            records.forEach(record => {
                csv += `"${record.date}","${record.time}","${record.action}","${record.name}","${record.email}"\n`;
            });
            
            // Criar arquivo
            const blob = new Blob([csv], { 
                type: 'text/csv;charset=utf-8;' 
            });
            
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'planilha_logins.csv';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            console.log('📁 Arquivo CSV criado: planilha_logins.csv');
            
        } catch (error) {
            console.error('❌ Erro ao criar arquivo CSV:', error);
        }
    }

    // Cadastrar novo usuário
    register(userData) {
        return new Promise((resolve, reject) => {
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

                this.users.push(newUser);
                this.saveUsers();

                // REGISTRAR CADASTRO E CRIAR ARQUIVO
                this.logToSheet(newUser, 'register');

                // Login automático
                this.login(userData.email, userData.password)
                    .then(resolve)
                    .catch(() => reject(new Error('Cadastro realizado, mas falha no login automático')));

            } catch (error) {
                reject(error);
            }
        });
    }

    // Login
    login(email, password, rememberMe = false) {
        return new Promise((resolve, reject) => {
            try {
                const user = this.users.find(u => u.email === email && u.password === password);
                
                if (user) {
                    this.currentUser = user;
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    
                    if (rememberMe) {
                        localStorage.setItem('rememberMe', 'true');
                    }
                    
                    // REGISTRAR LOGIN E CRIAR ARQUIVO
                    this.logToSheet(user, 'login');
                    
                    resolve(user);
                } else {
                    reject(new Error('Email ou senha incorretos'));
                }
            } catch (error) {
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
                    const resetToken = Math.random().toString(36).substring(2, 15);
                    user.resetToken = resetToken;
                    user.resetTokenExpiry = Date.now() + 3600000;
                    this.saveUsers();
                    
                    resolve({
                        message: 'Um link de recuperação foi enviado para seu email',
                        token: resetToken
                    });
                } else {
                    reject(new Error('Email não encontrado'));
                }
            } catch (error) {
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
                reject(new Error('Erro interno ao redefinir senha'));
            }
        });
    }

    // Logout
    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        localStorage.removeItem('rememberMe');
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
        localStorage.setItem('users', JSON.stringify(this.users));
    }

    // Verificar força da senha
    checkPasswordStrength(password) {
        const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;
        const mediumRegex = /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/;

        if (strongRegex.test(password)) return 'strong';
        if (mediumRegex.test(password)) return 'medium';
        return 'weak';
    }
}

// Inicializar sistema
const auth = new AuthSystem();
window.auth = auth;

// Funções auxiliares
function showLoading(button) {
    const originalText = button.innerHTML;
    button.innerHTML = '<div class="loading-spinner"></div>';
    button.disabled = true;
    return originalText;
}

function hideLoading(button, originalText) {
    button.innerHTML = originalText;
    button.disabled = false;
}

function showMessage(message, type = 'success') {
    const existingMessage = document.querySelector('.message-container');
    if (existingMessage) existingMessage.remove();

    const messageDiv = document.createElement('div');
    messageDiv.className = `message-container ${type}`;
    messageDiv.innerHTML = `
        <div class="message-content">
            <span class="message-icon">${type === 'success' ? '✓' : '!'}</span>
            <span class="message-text">${message}</span>
        </div>
    `;
    document.body.appendChild(messageDiv);

    setTimeout(() => messageDiv.remove(), 5000);
}

// CSS para mensagens
const styleSheet = document.createElement('style');
styleSheet.textContent = `
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
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}
.loading-spinner {
    width: 20px;
    height: 20px;
    border: 2px solid transparent;
    border-top: 2px solid currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto;
}
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
`;
document.head.appendChild(styleSheet);