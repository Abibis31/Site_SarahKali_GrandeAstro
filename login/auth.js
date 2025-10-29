// auth.js - Sistema de autenticação com SQLite (SEM REDIRECIONAMENTOS AUTOMÁTICOS)

class AuthSystem {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        
        // VERIFICAÇÃO SIMPLES - Só carrega usuário se existir
        const storedUser = JSON.parse(localStorage.getItem('currentUser'));
        if (storedUser && this.users.find(user => user.email === storedUser.email)) {
            this.currentUser = storedUser;
            console.log('✅ Usuário logado:', storedUser.email);
        } else {
            this.currentUser = null;
            if (storedUser) {
                localStorage.removeItem('currentUser');
                console.log('🗑️ Usuário inválido removido');
            }
            console.log('🔒 Nenhum usuário logado');
        }
        
        this.db = null;
        this.initDatabase();
    }

    // Inicializar banco de dados SQLite
    async initDatabase() {
        return new Promise((resolve, reject) => {
            try {
                this.db = window.openDatabase('AuthSystem', '1.0', 'Authentication Database', 2 * 1024 * 1024);
                
                this.db.transaction(tx => {
                    tx.executeSql(`
                        CREATE TABLE IF NOT EXISTS login_logs (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            date TEXT,
                            time TEXT,
                            action TEXT,
                            name TEXT,
                            email TEXT,
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                        )
                    `);
                    
                    tx.executeSql(`
                        CREATE TABLE IF NOT EXISTS users (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            name TEXT,
                            email TEXT UNIQUE,
                            password TEXT,
                            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                        )
                    `);
                }, (error) => {
                    console.error('❌ Erro ao criar tabelas:', error);
                    reject(error);
                }, () => {
                    console.log('✅ Banco de dados SQLite inicializado');
                    resolve();
                });
                
            } catch (error) {
                console.error('❌ Erro ao inicializar banco de dados:', error);
                resolve();
            }
        });
    }

    // Registrar eventos no SQLite
    async logToSheet(user, action = 'login') {
        try {
            if (this.db) {
                await this.logToSQLite(user, action);
            }
            
            const sheetData = JSON.parse(localStorage.getItem('loginRecords')) || [];
            const newRecord = {
                date: new Date().toLocaleDateString('pt-BR'),
                time: new Date().toLocaleTimeString('pt-BR'),
                action: action,
                name: user.name || 'N/A',
                email: user.email
            };
            
            sheetData.push(newRecord);
            localStorage.setItem('loginRecords', JSON.stringify(sheetData));
            
            console.log(`✅ ${action} registrado. Total: ${sheetData.length} registros`);
            
        } catch (error) {
            console.error(`❌ Erro ao registrar ${action}:`, error);
        }
    }

    // Registrar no SQLite
    logToSQLite(user, action) {
        return new Promise((resolve, reject) => {
            this.db.transaction(tx => {
                tx.executeSql(
                    `INSERT INTO login_logs (date, time, action, name, email) VALUES (?, ?, ?, ?, ?)`,
                    [
                        new Date().toLocaleDateString('pt-BR'),
                        new Date().toLocaleTimeString('pt-BR'),
                        action,
                        user.name || 'N/A',
                        user.email
                    ],
                    (tx, results) => {
                        console.log(`✅ ${action} registrado no SQLite. ID: ${results.insertId}`);
                        resolve(results);
                    },
                    (tx, error) => {
                        console.error(`❌ Erro SQLite:`, error);
                        reject(error);
                    }
                );
            });
        });
    }

    // Buscar logs do SQLite (para página admin)
    async getLoginLogs(limit = 100) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                const logs = JSON.parse(localStorage.getItem('loginRecords')) || [];
                resolve(logs.slice(-limit).reverse());
                return;
            }

            this.db.transaction(tx => {
                tx.executeSql(
                    `SELECT * FROM login_logs ORDER BY created_at DESC LIMIT ?`,
                    [limit],
                    (tx, results) => {
                        const logs = [];
                        for (let i = 0; i < results.rows.length; i++) {
                            logs.push(results.rows.item(i));
                        }
                        resolve(logs);
                    },
                    (tx, error) => {
                        console.error('❌ Erro ao buscar logs:', error);
                        const logs = JSON.parse(localStorage.getItem('loginRecords')) || [];
                        resolve(logs.slice(-limit).reverse());
                    }
                );
            });
        });
    }

    // Método OPCIONAL para exportar CSV manualmente
    exportToCSV(logs = null) {
        try {
            if (!logs) {
                logs = JSON.parse(localStorage.getItem('loginRecords')) || [];
            }
            
            if (logs.length === 0) {
                alert('Nenhum registro para exportar');
                return;
            }
            
            let csv = 'Data,Hora,Ação,Nome,Email\n';
            
            logs.forEach(record => {
                csv += `"${record.date}","${record.time}","${record.action}","${record.name}","${record.email}"\n`;
            });
            
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
            
            console.log('📁 Arquivo CSV exportado manualmente: planilha_logins.csv');
            
        } catch (error) {
            console.error('❌ Erro ao exportar CSV:', error);
        }
    }

    // Cadastrar novo usuário
    register(userData) {
        return new Promise((resolve, reject) => {
            try {
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

                const newUser = {
                    id: Date.now().toString(),
                    name: userData.name,
                    email: userData.email,
                    password: userData.password,
                    createdAt: new Date().toISOString()
                };

                this.users.push(newUser);
                this.saveUsers();

                // REGISTRAR CADASTRO
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

    // Login - SEM REDIRECIONAMENTO AUTOMÁTICO
    login(email, password, rememberMe = false) {
        return new Promise((resolve, reject) => {
            try {
                const user = this.users.find(u => u.email === email && u.password === password);
                
                if (user) {
                    this.currentUser = user;
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    
                    if (rememberMe) {
                        localStorage.setItem('rememberMe', 'true');
                    } else {
                        localStorage.removeItem('rememberMe');
                    }
                    
                    // REGISTRAR LOGIN
                    this.logToSheet(user, 'login');
                    
                    console.log('✅ Login realizado com sucesso:', user.email);
                    resolve(user);
                } else {
                    this.currentUser = null;
                    localStorage.removeItem('currentUser');
                    console.log('❌ Login falhou: credenciais inválidas');
                    reject(new Error('Email ou senha incorretos'));
                }
            } catch (error) {
                this.currentUser = null;
                localStorage.removeItem('currentUser');
                console.error('❌ Erro interno no login:', error);
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
        console.log('🔒 Logout realizado:', this.currentUser?.email);
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        localStorage.removeItem('rememberMe');
        // Redireciona para a página inicial
        window.location.href = '../index.html';
    }

    // Verificar se está logado
    isLoggedIn() {
        return this.currentUser !== null && this.users.find(user => user.email === this.currentUser.email);
    }

    // Obter usuário atual
    getCurrentUser() {
        return this.currentUser;
    }

    // Salvar usuários no localStorage
    saveUsers() {
        localStorage.setItem('users', JSON.stringify(this.users));
    }

    // MÉTODO PARA LIMPAR SESSÃO
    clearSession() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        localStorage.removeItem('rememberMe');
        console.log('✅ Sessão limpa completamente');
    }

    // Verificar força da senha
    checkPasswordStrength(password) {
        const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;
        const mediumRegex = /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/;

        if (strongRegex.test(password)) return 'strong';
        if (mediumRegex.test(password)) return 'medium';
        return 'weak';
    }

    // Limpar logs antigos (manter apenas últimos 1000)
    async clearOldLogs() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                const logs = JSON.parse(localStorage.getItem('loginRecords')) || [];
                const recentLogs = logs.slice(-1000);
                localStorage.setItem('loginRecords', JSON.stringify(recentLogs));
                resolve();
                return;
            }

            this.db.transaction(tx => {
                tx.executeSql(
                    `DELETE FROM login_logs WHERE id NOT IN (
                        SELECT id FROM login_logs ORDER BY created_at DESC LIMIT 1000
                    )`,
                    [],
                    (tx, results) => {
                        console.log(`✅ Logs antigos removidos. Linhas afetadas: ${results.rowsAffected}`);
                        resolve(results);
                    },
                    (tx, error) => {
                        reject(error);
                    }
                );
            });
        });
    }
}

// Inicializar sistema
const auth = new AuthSystem();
window.auth = auth;

// REMOVIDO COMPLETAMENTE O REDIRECIONAMENTO AUTOMÁTICO
// O controle de navegação agora é 100% manual nos formulários

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