// menu.js - Navegação e utilitários (CORRIGIDO)

// Navegação entre páginas
function navigateTo(page) {
    window.location.href = page;
}

// Verificar autenticação em tempo real - CORRIGIDA
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

// Inicialização quando o DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('Menu.js inicializado - verificando autenticação...');
    
    // Delay para evitar conflito com auth.js
    setTimeout(() => {
        checkAuth();
    }, 1000);
    
    // Adicionar classe de loading global
    const style = document.createElement('style');
    style.textContent = `
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
    `;
    document.head.appendChild(style);
});