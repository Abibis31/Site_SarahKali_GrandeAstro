// menu_login.js - Navegação e utilitários para páginas de login (CORRIGIDO)

// Navegação entre páginas
function navigateTo(page) {
    window.location.href = page;
}

// Verificar autenticação em tempo real - CORRIGIDA para login
function checkAuth() {
    console.log('menu_login.js - Verificando autenticação...');
    console.log('- isLoggedIn:', auth.isLoggedIn());
    console.log('- currentUser:', auth.getCurrentUser());
    console.log('- rememberMe:', localStorage.getItem('rememberMe'));
    
    // Na pasta login, só redireciona SE estiver logado (para evitar ficar na página de login)
    if (auth.isLoggedIn()) {
        console.log('Usuário já logado - redirecionando da página de login...');
        // Não redireciona imediatamente, deixa o auth.js cuidar disso
        // para evitar múltiplos redirecionamentos
        return true;
    }
    
    console.log('Usuário não logado - permanecendo na página de login');
    return false;
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

// Máscara para inputs
function applyInputMasks() {
    // Máscara para telefone (opcional)
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    phoneInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.substring(0, 11);
            
            if (value.length > 10) {
                value = value.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
            } else if (value.length > 6) {
                value = value.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
            } else if (value.length > 2) {
                value = value.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
            } else if (value.length > 0) {
                value = value.replace(/^(\d*)/, '($1');
            }
            
            e.target.value = value;
        });
    });
}

// Mostrar força da senha
function setupPasswordStrength() {
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach(input => {
        // Cria elemento para mostrar força da senha
        const strengthDisplay = document.createElement('div');
        strengthDisplay.className = 'password-strength';
        input.parentNode.appendChild(strengthDisplay);
        
        input.addEventListener('input', function(e) {
            const strength = auth.checkPasswordStrength(e.target.value);
            strengthDisplay.textContent = getStrengthText(strength);
            strengthDisplay.className = `password-strength ${strength}`;
        });
    });
}

function getStrengthText(strength) {
    switch(strength) {
        case 'weak': return 'Senha fraca';
        case 'medium': return 'Senha média';
        case 'strong': return 'Senha forte';
        default: return '';
    }
}

// Utilitário para mostrar/ocultar senha
function setupPasswordToggle() {
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach(input => {
        const toggle = document.createElement('button');
        toggle.type = 'button';
        toggle.innerHTML = '👁️';
        toggle.style.cssText = `
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            cursor: pointer;
            font-size: 16px;
        `;
        
        const container = input.parentNode;
        container.style.position = 'relative';
        container.appendChild(toggle);
        
        toggle.addEventListener('click', function() {
            if (input.type === 'password') {
                input.type = 'text';
                toggle.innerHTML = '🔒';
            } else {
                input.type = 'password';
                toggle.innerHTML = '👁️';
            }
        });
    });
}

// Inicialização quando o DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('menu_login.js inicializado para página de login');
    
    applyInputMasks();
    setupPasswordStrength();
    setupPasswordToggle();
    
    // Delay maior para evitar conflito com auth.js
    setTimeout(() => {
        const shouldRedirect = checkAuth();
        if (shouldRedirect) {
            console.log('menu_login.js: Redirecionamento necessário detectado');
            // O auth.js já deve ter tratado o redirecionamento
            // Esta é apenas uma verificação de segurança
        }
    }, 2000);
    
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
            text-align: left;
            padding-left: 5px;
        }
        
        .password-strength.weak { color: #ff4757; }
        .password-strength.medium { color: #c9a227; }
        .password-strength.strong { color: #2AA198; }
        
        /* Estilos para inputs com toggle de senha */
        .input-container {
            position: relative;
        }
        
        .input-container input {
            padding-right: 40px !important;
        }
    `;
    document.head.appendChild(style);
});

// Exportar funções para uso global
window.menuLogin = {
    navigateTo,
    checkAuth,
    formatDate,
    validateEmail,
    applyInputMasks
};
