import express from 'express';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

// Rota de saúde SUPER SIMPLES
app.get('/health', (req, res) => {
    console.log('✅ Health check recebido');
    res.json({ status: 'OK', message: 'Sarah Kali TESTE online!' });
});

// Rota principal
app.get('/', (req, res) => {
    res.send(`
        <html>
            <head><title>Sarah Kali TESTE</title></head>
            <body>
                <h1>🧪 Sarah Kali - MODO TESTE</h1>
                <p>Aplicação básica funcionando!</p>
            </body>
        </html>
    `);
});

// Rota do chat DESATIVADA temporariamente
app.post('/api/chat', (req, res) => {
    console.log('📨 Chat desativado para testes');
    res.json({ 
        message: '🔧 Modo manutenção - Volto em instantes!' 
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`>>> 🧪 APP TESTE rodando na porta: ${PORT}`);
});