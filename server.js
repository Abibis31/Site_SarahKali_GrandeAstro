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

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota do Chat
app.post('/api/chat', async (req, res) => {
    try {
        const { messages } = req.body;
        const response = await getGeminiResponse(messages);
        
        res.json({ message: response });
        
    } catch (error) {
        console.error('Erro no servidor:', error);
        res.json({ 
            message: "Estou realinhando minhas energias cósmicas. Por favor, tente novamente. ✨" 
        });
    }
});

// ✅ CORREÇÃO AQUI - '0.0.0.0' em vez de localhost
app.listen(PORT, '0.0.0.0', () => {
    console.log(`>>> Sarah Kali Chat rodando na porta: ${PORT}`);
});