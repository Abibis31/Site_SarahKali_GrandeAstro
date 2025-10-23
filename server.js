import express from 'express';
import { getGeminiResponse } from './api/chat.js';

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

// Rota do chat ATIVADA com função básica
app.post('/api/chat', async (req, res) => {
    try {
        const { messages } = req.body;
        console.log('📨 Mensagem recebida no chat');
        
        const response = await getGeminiResponse(messages);
        
        res.json({ message: response });
        
    } catch (error) {
        console.error('Erro no servidor:', error);
        res.json({ 
            message: "Estou realinhando minhas energias cósmicas. Tente novamente! ✨" 
        });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`>>> 🧪 APP TESTE rodando na porta: ${PORT}`);
});