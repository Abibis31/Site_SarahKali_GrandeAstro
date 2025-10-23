import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

// Configuração de ambiente
config();

// Configuração de diretórios para ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Importação da função do chat
import { getGeminiResponse } from './api/chat.js';

// Inicialização do Express
const app = express();
const PORT = process.env.PORT || 8080;

// ======================
// 🛡️  MIDDLEWARES
// ======================
app.use(cors({
    origin: process.env.CLIENT_URL || true, // Aceita qualquer origem em produção
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// ======================
// 🩺  HEALTH CHECKS (CRÍTICO para Railway)
// ======================
app.get('/health', (req, res) => {
    const healthData = {
        status: 'OK',
        message: 'Sarah Kali está online e conectada com o universo! ✨',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0'
    };
    
    console.log('✅ Health check executado - Servidor saudável');
    res.status(200).json(healthData);
});

// ======================
// 🌐  ROTAS PRINCIPAIS
// ======================

// Rota raiz - Página principal
app.get('/', (req, res) => {
    console.log('📄 Página principal acessada');
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota de status da API
app.get('/api/status', (req, res) => {
    res.json({
        service: 'Sarah Kali Chat API',
        status: 'operational',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// ======================
// 💬  ROTA DO CHAT (PRINCIPAL)
// ======================
app.post('/api/chat', async (req, res) => {
    const startTime = Date.now();
    
    try {
        console.log('🔮 Nova consulta espiritual recebida...');
        
        const { messages } = req.body;

        // Validação robusta da mensagem
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            console.warn('⚠️ Mensagem inválida recebida');
            return res.status(400).json({
                error: 'Mensagem inválida',
                message: 'Por favor, envie uma mensagem para conversarmos! 💫'
            });
        }

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

        // Processa a resposta da IA
        const response = await getGeminiResponse(messages);
        
        const processingTime = Date.now() - startTime;
        console.log(`✅ Consulta respondida em ${processingTime}ms`);

        res.json({
            success: true,
            message: response,
            processingTime: `${processingTime}ms`
        });

    } catch (error) {
        const processingTime = Date.now() - startTime;
        console.error('❌ Erro na rota /api/chat:', error.message);
        
        res.status(500).json({
            success: false,
            message: 'Estou realinhando minhas energias cósmicas... Por favor, tente novamente. 🔮',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// ======================
// 🚨  TRATAMENTO DE ERROS
// ======================

// Rota não encontrada
app.use('*', (req, res) => {
    console.log(`❌ Rota não encontrada: ${req.originalUrl}`);
    res.status(404).json({
        error: 'Rota não encontrada',
        message: 'O caminho espiritual que você busca não existe... 🌙'
    });
});

// Middleware de erro global
app.use((error, req, res, next) => {
    console.error('🚨 Erro global capturado:', error);
    res.status(500).json({
        error: 'Erro interno do servidor',
        message: 'Algo inesperado aconteceu no plano espiritual... ✨'
    });
});

// ======================
// 🚀  INICIALIZAÇÃO DO SERVIDOR
// ======================
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('✨' + '='.repeat(50));
    console.log(`🔮  Sarah Kali Chat Server`);
    console.log(`📍  Rodando na porta: ${PORT}`);
    console.log(`🌐  Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🕐  Iniciado em: ${new Date().toISOString()}`);
    console.log('✨' + '='.repeat(50));
    console.log(`✅  Health Check: http://localhost:${PORT}/health`);
    console.log(`🚀  Pronto para receber consultas espirituais!`);
});

// ======================
// ⚡  GRACEFUL SHUTDOWN
// ======================
const gracefulShutdown = (signal) => {
    console.log(`\n${signal} recebido. Encerrando graciosamente...`);
    
    server.close(() => {
        console.log('✅ Servidor encerrado com sucesso');
        process.exit(0);
    });

    // Force close after 10s
    setTimeout(() => {
        console.error('❌ Timeout do graceful shutdown');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default app;