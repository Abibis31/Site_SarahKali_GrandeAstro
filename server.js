import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Importação CORRETA
import { getGeminiResponse } from './api/chat.js';

// Rota de saúde (OBRIGATÓRIA para Railway)
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Sarah Kali está online! ✨' });
});

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota do Chat
app.post('/api/chat', async (req, res) => {
    try {
        const { messages } = req.body;
        
        // Verifica se a mensagem foi fornecida
        if (!messages || !messages.trim()) {
            return res.status(400).json({ 
                message: "Por favor, envie uma mensagem para conversarmos! 💫" 
            });
        }
        
        console.log(`📨 Enviando para API: ${messages}`);
        const response = await getGeminiResponse(messages);
        
        res.json({ message: response });
        
    } catch (error) {
        console.error('Erro no servidor:', error);
        res.status(500).json({ 
            message: "Estou realinhando minhas energias cósmicas. Por favor, tente novamente. ✨" 
        });
    }
});

// ✅ CORREÇÃO FINAL
app.listen(PORT, '0.0.0.0', () => {
    console.log(`>>> Sarah Kali Chat rodando na porta: ${PORT}`);
});