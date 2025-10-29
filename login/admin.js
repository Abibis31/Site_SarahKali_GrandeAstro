// admin.js - Painel administrativo (focado em registros de criação de conta)
class AdminPanel {
    constructor() {
        this.currentUser = auth.getCurrentUser();
        this.logs = [];
        this.init();
    }

    async init() {
        if (!this.checkAdminAccess()) {
            return;
        }
        
        await this.loadAdminData();
        this.setupEventListeners();
    }

    // Verificar se o usuário atual é admin
    checkAdminAccess() {
        // DEFINA SEU EMAIL DE ADMIN AQUI ⬇️
        const adminEmails = ['seu-email@admin.com', 'admin@sarahkali.com']; // ALTERE PARA SEUS EMAILS
        
        const isAdmin = this.currentUser && adminEmails.includes(this.currentUser.email);
        
        if (!isAdmin) {
            document.getElementById('adminContent').style.display = 'none';
            document.getElementById('accessDenied').style.display = 'block';
            console.log('❌ Acesso negado. Email atual:', this.currentUser?.email);
            return false;
        }
        
        console.log('✅ Acesso admin concedido para:', this.currentUser.email);
        return true;
    }

    async loadAdminData() {
        try {
            this.showLoading();
            this.logs = await auth.getLoginLogs(100);
            this.updateStats();
            this.renderLogsTable();
            this.hideLoading();
        } catch (error) {
            console.error('Erro ao carregar dados admin:', error);
            this.showError('Erro ao carregar dados: ' + error.message);
        }
    }

    updateStats() {
        const today = new Date().toLocaleDateString('pt-BR');
        
        // Filtrar apenas registros de criação de conta
        const registerLogs = this.logs.filter(log => log.action === 'register');
        const todayRegisterLogs = registerLogs.filter(log => log.date === today);
        
        const stats = {
            total: registerLogs.length,
            logins: this.logs.filter(log => log.action === 'login').length,
            registers: registerLogs.length,
            today: todayRegisterLogs.length
        };

        document.getElementById('statTotal').textContent = stats.total;
        document.getElementById('statLogins').textContent = stats.logins;
        document.getElementById('statRegisters').textContent = stats.registers;
        document.getElementById('statToday').textContent = stats.today;
    }

    renderLogsTable() {
        const logsTable = document.getElementById('logsTable');
        
        // Filtrar apenas registros de criação de conta
        const registerLogs = this.logs.filter(log => log.action === 'register');
        
        if (registerLogs.length === 0) {
            logsTable.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--text-dark);">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">👤</div>
                    <p>Nenhum registro de criação de conta encontrado.</p>
                    <p style="font-size: 0.9rem; margin-top: 0.5rem; opacity: 0.7;">
                        A tabela mostra apenas quando novos usuários se cadastram no sistema.
                    </p>
                </div>
            `;
            return;
        }

        const tableHTML = `
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Hora</th>
                            <th>Ação</th>
                            <th>Nome</th>
                            <th>Email</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${registerLogs.map(log => `
                            <tr>
                                <td>${log.date}</td>
                                <td>${log.time}</td>
                                <td>
                                    <span class="action-badge ${log.action}">
                                        ${this.getActionIcon(log.action)} ${this.getActionText(log.action)}
                                    </span>
                                </td>
                                <td>${log.name || 'N/A'}</td>
                                <td class="email-cell">${log.email}</td>
                                <td>
                                    <span class="status-badge new-account">
                                        📝 Nova Conta
                                    </span>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div class="table-footer">
                <span>Mostrando ${registerLogs.length} registros de criação de conta</span>
                <span style="opacity: 0.7;">
                    Total de logs no sistema: ${this.logs.length}
                </span>
            </div>
        `;

        logsTable.innerHTML = tableHTML;
    }

    getActionIcon(action) {
        const icons = {
            'register': '👤',
            'login': '🔑',
            'logout': '🚪'
        };
        return icons[action] || '📝';
    }

    getActionText(action) {
        const texts = {
            'register': 'Cadastro',
            'login': 'Login',
            'logout': 'Logout'
        };
        return texts[action] || action;
    }

    showLoading() {
        const logsTable = document.getElementById('logsTable');
        logsTable.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <div class="loading-spinner"></div>
                <p style="margin-top: 1rem; color: var(--text-dark);">Carregando registros de criação de conta...</p>
            </div>
        `;
    }

    hideLoading() {
        // Loading é removido quando a tabela é renderizada
    }

    showError(message) {
        const logsTable = document.getElementById('logsTable');
        logsTable.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--danger-color);">
                <div style="font-size: 3rem; margin-bottom: 1rem;">❌</div>
                <p>${message}</p>
                <button onclick="adminPanel.loadAdminData()" class="login-btn" style="margin-top: 1rem;">
                    Tentar Novamente
                </button>
            </div>
        `;
    }

    setupEventListeners() {
        // Atualizar dados a cada 30 segundos
        setInterval(() => {
            this.loadAdminData();
        }, 30000);
    }
}

// Funções globais para os botões
async function exportLogs() {
    try {
        const allLogs = await auth.getLoginLogs(1000);
        // Exportar apenas registros de criação de conta
        const registerLogs = allLogs.filter(log => log.action === 'register');
        
        if (registerLogs.length === 0) {
            showMessage('Nenhum registro de criação de conta para exportar', 'error');
            return;
        }
        
        auth.exportToCSV(registerLogs);
        showMessage('CSV com registros de criação de conta exportado com sucesso!', 'success');
    } catch (error) {
        showMessage('Erro ao exportar: ' + error.message, 'error');
    }
}

async function refreshLogs() {
    if (window.adminPanel) {
        await window.adminPanel.loadAdminData();
        showMessage('Registros de criação de conta atualizados!', 'success');
    }
}

async function clearOldLogs() {
    if (confirm('Tem certeza que deseja limpar logs antigos?\n\nIsso manterá apenas os 1000 registros mais recentes.')) {
        try {
            await auth.clearOldLogs();
            await refreshLogs();
            showMessage('Logs antigos removidos!', 'success');
        } catch (error) {
            showMessage('Erro ao limpar logs: ' + error.message, 'error');
        }
    }
}

function logout() {
    auth.logout();
}

// Função auxiliar para mostrar mensagens
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

    setTimeout(() => messageDiv.remove(), 4000);
}

// Inicializar admin panel quando DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    window.adminPanel = new AdminPanel();
});