import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// ✅ IMPORTE DA FUNÇÃO DA IA (agora usando Groq)
import { getOpenAIResponse } from './api/chat.js';

// Configuração de diretórios para ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inicialização do Express
const app = express();
const PORT = process.env.PORT || 10000;

// ======================
// 🛡️  MIDDLEWARES
// ======================
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// ======================
// 🩺  HEALTH CHECK (CRÍTICO para Render)
// ======================
app.get('/health', (req, res) => {
    console.log('✅ Health check executado - Servidor saudável');
    res.status(200).json({ 
        status: 'OK', 
        message: 'Sarah Kali está online e conectada com o universo! ✨',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        groq_configured: !!process.env.GROQ_API_KEY
    });
});

// ======================
// 🌐  ROTAS PRINCIPAIS
// ======================

// Rota raiz - Página principal
app.get('/', (req, res) => {
    console.log('📄 Página principal acessada');
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ======================
// 💬  ROTA DO CHAT COM GROQ
// ======================
app.post('/api/chat', async (req, res) => {
    const startTime = Date.now();
    
    try {
        console.log('🔮 Nova consulta espiritual recebida...');
        
        const { messages } = req.body;

        // Validação da mensagem
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            console.warn('⚠️ Mensagem inválida recebida');
            return res.status(400).json({
                error: 'Mensagem inválida',
                message: 'Por favor, envie uma mensagem para conversarmos! 💫'
            });
        }

        console.log(`📊 Histórico recebido: ${messages.length} mensagens`);

        const lastMessage = messages[messages.length - 1];
        const userMessage = lastMessage?.content?.trim() || '';

        if (!userMessage) {
            console.warn('⚠️ Mensagem vazia recebida');
            return res.status(400).json({
                error: 'Mensagem vazia', 
                message: 'Querida alma, compartilhe sua questão comigo... ✨'
            });
        }

        console.log(`📨 Processando consulta: "${userMessage.substring(0, 50)}..."`);

        // ✅ PROCESSAMENTO COM GROQ
        const response = await getOpenAIResponse(messages);
        
        const processingTime = Date.now() - startTime;
        console.log(`✅ Consulta espiritual respondida em ${processingTime}ms`);

        res.json({
            success: true,
            message: response,
            processingTime: `${processingTime}ms`,
            model: 'llama-3.1-8b-instant'
        });

    } catch (error) {
        const processingTime = Date.now() - startTime;
        console.error('❌ Erro na rota /api/chat:', error.message);
        
        res.status(500).json({
            success: false,
            message: 'Estou realinhando minhas energias cósmicas... Por favor, tente novamente. 🔮',
            processingTime: `${processingTime}ms`,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// ======================
// 🚀  INICIALIZAÇÃO DO SERVIDOR
// ======================
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('✨' + '='.repeat(60));
    console.log(`🔮  Sarah Kali Chat Server - COM GROQ ATIVO`);
    console.log(`📍  Rodando na porta: ${PORT}`);
    console.log(`🌐  Ambiente: ${process.env.NODE_ENV || 'production'}`);
    console.log(`🕐  Iniciado em: ${new Date().toISOString()}`);
    console.log('✨' + '='.repeat(60));
    console.log(`✅  Health Check: http://localhost:${PORT}/health`);
    console.log(`🚀  IA Groq: ${process.env.GROQ_API_KEY ? 'CONFIGURADA ✅' : 'NÃO CONFIGURADA ❌'}`);
    console.log(`💫  Pronta para consultas espirituais!`);
    console.log(`🔗  URL: ${process.env.CLIENT_URL || `http://localhost:${PORT}`}`);
});

// ======================
// ⚡  GRACEFUL SHUTDOWN
// ======================
process.on('SIGTERM', () => {
    console.log('>>> 🛑 SIGTERM recebido, encerrando graciosamente...');
    server.close(() => {
        console.log('>>> ✅ Servidor encerrado com sucesso');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('>>> 🛑 SIGINT recebido, encerrando servidor...');
    server.close(() => {
        console.log('>>> ✅ Servidor encerrado com sucesso');
        process.exit(0);
    });
});