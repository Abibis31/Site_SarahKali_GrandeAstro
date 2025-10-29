// menu.js - Navegação e utilitários (ATUALIZADO COM ADMIN)

// Navegação entre páginas
function navigateTo(page) {
    window.location.href = page;
}

// Verificar autenticação em tempo real
function checkAuth() {
    // Só redireciona se NÃO estiver logado E estiver em página protegida
    const isProtectedPage = window.location.pathname.includes('dashboard.html') || 
                           (window.location.pathname.includes('index.html') && 
                            !window.location.pathname.includes('login/'));
    
    if (!auth.isLoggedIn() && isProtectedPage) {
        console.log('Acesso não autorizado - redirecionando para login');
        setTimeout(() => {
            window.location.href = 'login/index.html';
        }, 500);
    }
}

// Formatação de dados
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('pt-BR');
}

// Validação de email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Configurar link de admin para usuários autorizados
function setupAdminLink() {
    // DEFINA OS EMAILS DE ADMIN AQUI ⬇️ (mesmo do admin.js)
    const adminEmails = ['seu-email@admin.com', 'admin@sarahkali.com'];
    
    setTimeout(() => {
        try {
            const currentUser = auth.getCurrentUser();
            if (currentUser && adminEmails.includes(currentUser.email)) {
                console.log('✅ Usuário admin detectado:', currentUser.email);
                
                // Verificar se já existe um link de admin
                if (document.getElementById('adminFloatingBtn')) {
                    return;
                }
                
                // Criar botão flutuante para admin
                const adminLink = document.createElement('a');
                adminLink.id = 'adminFloatingBtn';
                adminLink.href = 'login/admin.html';
                adminLink.innerHTML = `
                    <span class="admin-icon">🔧</span>
                    <span class="admin-text">Admin</span>
                `;
                adminLink.style.cssText = `
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background: linear-gradient(135deg, var(--cosmic-purple), var(--aura-teal));
                    color: white;
                    padding: 12px 16px;
                    border-radius: 25px;
                    text-decoration: none;
                    font-size: 0.9rem;
                    font-family: 'Cinzel', serif;
                    z-index: 1000;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.3s ease;
                    border: 1px solid rgba(201, 162, 39, 0.3);
                `;
                
                // Efeitos hover
                adminLink.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-2px)';
                    this.style.boxShadow = '0 6px 20px rgba(201, 162, 39, 0.4)';
                });
                
                adminLink.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0)';
                    this.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
                });
                
                // Adicionar estilos para os elementos internos
                const style = document.createElement('style');
                style.textContent = `
                    .admin-icon {
                        font-size: 1.1rem;
                    }
                    .admin-text {
                        font-weight: 500;
                    }
                    
                    /* Responsivo */
                    @media (max-width: 768px) {
                        #adminFloatingBtn {
                            bottom: 15px;
                            right: 15px;
                            padding: 10px 14px;
                            font-size: 0.8rem;
                        }
                        .admin-text {
                            display: none;
                        }
                    }
                    
                    @media (max-width: 480px) {
                        #adminFloatingBtn {
                            bottom: 10px;
                            right: 10px;
                            padding: 8px 12px;
                        }
                    }
                `;
                document.head.appendChild(style);
                
                document.body.appendChild(adminLink);
                
                console.log('🔧 Botão admin adicionado para:', currentUser.email);
            }
        } catch (error) {
            console.error('❌ Erro ao configurar link admin:', error);
        }
    }, 3000);
}

// Verificar e redirecionar para admin se necessário
function checkAdminRedirect() {
    // Se estiver na página de login e for admin, pode redirecionar direto para admin
    if (window.location.pathname.includes('login/index.html')) {
        setTimeout(() => {
            try {
                const adminEmails = ['seu-email@admin.com', 'admin@sarahkali.com'];
                const currentUser = auth.getCurrentUser();
                
                if (currentUser && adminEmails.includes(currentUser.email)) {
                    console.log('👑 Admin detectado na página de login');
                    // Pode adicionar lógica de redirecionamento automático se desejar
                }
            } catch (error) {
                console.error('Erro ao verificar admin redirect:', error);
            }
        }, 2000);
    }
}

// Utilitário para mostrar/esconder elementos baseado em permissões
function checkUserPermissions() {
    return new Promise((resolve) => {
        setTimeout(() => {
            try {
                const currentUser = auth.getCurrentUser();
                const adminEmails = ['seu-email@admin.com', 'admin@sarahkali.com'];
                
                const permissions = {
                    isAdmin: currentUser && adminEmails.includes(currentUser.email),
                    isLoggedIn: auth.isLoggedIn(),
                    user: currentUser
                };
                
                // Disparar evento customizado com as permissões
                const permissionEvent = new CustomEvent('userPermissionsChecked', {
                    detail: permissions
                });
                document.dispatchEvent(permissionEvent);
                
                resolve(permissions);
            } catch (error) {
                console.error('Erro ao verificar permissões:', error);
                resolve({
                    isAdmin: false,
                    isLoggedIn: false,
                    user: null
                });
            }
        }, 1000);
    });
}

// Adicionar CSS global para elementos admin
function addAdminStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .admin-only {
            display: none;
        }
        
        .user-admin .admin-only {
            display: block;
        }
        
        .admin-badge {
            background: linear-gradient(135deg, var(--spiritual-gold), var(--cosmic-purple));
            color: white;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 0.7rem;
            font-weight: bold;
            margin-left: 8px;
            vertical-align: middle;
        }
        
        /* Loading states */
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
        
        .password-strength {
            margin-top: 5px;
            font-size: 0.8rem;
            transition: all 0.3s ease;
        }
        
        .password-strength.weak { color: #ff4757; }
        .password-strength.medium { color: #c9a227; }
        .password-strength.strong { color: #2AA198; }
        
        /* Variáveis CSS */
        :root {
            --deep-space: #0A0A1F;
            --dark-matter: #1A1A2E;
            --cosmic-purple: #4A1D6B;
            --spiritual-gold: #C9A227;
            --aura-teal: #2AA198;
            --light-text: #F5F5F5;
            --medium-text: #E8E8E8;
            --border-color: rgba(201, 162, 39, 0.3);
        }
    `;
    document.head.appendChild(style);
}

// Inicialização quando o DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('Menu.js inicializado - verificando autenticação...');
    
    // Adicionar estilos globais
    addAdminStyles();
    
    // Delay para evitar conflito com auth.js
    setTimeout(() => {
        checkAuth();
        checkAdminRedirect();
    }, 1000);
    
    // Configurar link de admin
    setupAdminLink();
    
    // Verificar permissões do usuário
    checkUserPermissions().then(permissions => {
        console.log('Permissões do usuário:', permissions);
        
        // Adicionar classe admin ao body se for admin
        if (permissions.isAdmin) {
            document.body.classList.add('user-admin');
            console.log('👑 Modo admin ativado na página');
        }
    });
});

// Exportar funções para uso global
window.menu = {
    navigateTo,
    checkAuth,
    formatDate,
    validateEmail,
    setupAdminLink,
    checkUserPermissions,
    checkAdminRedirect
};

// Event listener para quando o usuário fizer login
document.addEventListener('userLoggedIn', function() {
    console.log('Usuário fez login - reconfigurando menu...');
    setTimeout(() => {
        setupAdminLink();
        checkUserPermissions();
    }, 1500);
});

// Event listener para quando o usuário fizer logout
document.addEventListener('userLoggedOut', function() {
    console.log('Usuário fez logout - limpando menu...');
    const adminBtn = document.getElementById('adminFloatingBtn');
    if (adminBtn) {
        adminBtn.remove();
    }
    document.body.classList.remove('user-admin');
});
// 🔧 BOTÃO ADMIN FORÇADO - Adicione no FINAL do menu.js
function addForcedAdminButton() {
    console.log('🎯 ADICIONANDO BOTÃO ADMIN FORÇADO...');
    
    // Remover botão existente se houver
    const existingBtn = document.getElementById('forcedAdminBtn');
    if (existingBtn) existingBtn.remove();
    
    // Criar botão bem visível
    const adminBtn = document.createElement('a');
    adminBtn.id = 'forcedAdminBtn';
    adminBtn.href = 'login/admin.html';
    adminBtn.innerHTML = '🔧 PAINEL ADMIN';
    adminBtn.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #FF0000, #FF6B6B);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        text-decoration: none;
        font-family: 'Cinzel', serif;
        font-weight: bold;
        font-size: 16px;
        z-index: 9999;
        box-shadow: 0 4px 20px rgba(255,0,0,0.5);
        border: 2px solid white;
        animation: pulse 2s infinite;
    `;
    
    // Adicionar animação de pulsar
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        
        #forcedAdminBtn:hover {
            background: linear-gradient(135deg, #FF6B6B, #FF0000);
            transform: scale(1.1);
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(adminBtn);
    console.log('✅ BOTÃO ADMIN FORÇADO ADICIONADO! Deve estar visível no canto superior direito.');
}

// Executar depois que a página carregar
setTimeout(addForcedAdminButton, 2000);

// Também executar quando o usuário fizer login
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(addForcedAdminButton, 3000);
});
