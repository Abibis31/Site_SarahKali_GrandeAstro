import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import fs from 'fs';

// ✅ IMPORTE DA FUNÇÃO DA IA (agora usando Groq)
import { getOpenAIResponse } from './api/chat.js';

// ✅ IMPORTE DO DATABASE
import { ChatDatabase } from './database.js';

// Configuração de diretórios para ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inicialização do Express
const app = express();
const PORT = process.env.PORT || 10000;

// ✅ INICIALIZAR DATABASE
const chatDB = new ChatDatabase();

// ======================
// 📁 CONFIGURAÇÃO DE UPLOAD DE ARQUIVOS
// ======================

// Criar diretório de uploads se não existir
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuração do Multer para upload de arquivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Nome único para evitar conflitos
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'comprovante-' + uniqueSuffix + ext);
    }
});

// Filtro para tipos de arquivo permitidos
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/jpeg', 
        'image/jpg', 
        'image/png', 
        'image/gif',
        'application/pdf',
        'image/webp'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de arquivo não permitido. Use JPG, PNG, GIF, PDF ou WEBP.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB máximo
        files: 1 // 1 arquivo por vez
    }
});

// ======================
// 🛡️  MIDDLEWARES
// ======================
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));
app.use('/uploads', express.static(uploadsDir)); // Servir arquivos estáticos

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
    res.sendFile(path.join(__dirname, 'home.html'));
});

// ======================
// 📤  ROTA DE UPLOAD DE COMPROVANTE
// ======================
app.post('/api/upload-comprovante', upload.single('comprovante'), async (req, res) => {
    try {
        console.log('📤 Recebendo comprovante...');
        
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Nenhum arquivo enviado.'
            });
        }

        const { sessionId, userId, servico } = req.body;
        
        console.log(`📁 Arquivo recebido:`, {
            originalName: req.file.originalname,
            fileName: req.file.filename,
            size: req.file.size,
            mimetype: req.file.mimetype,
            sessionId: sessionId,
            servico: servico
        });

        // ✅ SALVAR INFORMAÇÕES DO COMPROVANTE NO DATABASE
        await chatDB.addMessage(
            sessionId || 'default', 
            'comprovante', 
            JSON.stringify({
                type: 'comprovante',
                fileName: req.file.filename,
                originalName: req.file.originalname,
                mimeType: req.file.mimetype,
                size: req.file.size,
                servico: servico,
                timestamp: new Date().toISOString(),
                url: `/uploads/${req.file.filename}`
            })
        );

        res.json({
            success: true,
            message: 'Comprovante recebido com sucesso! ✅',
            file: {
                id: req.file.filename,
                name: req.file.originalname,
                url: `/uploads/${req.file.filename}`,
                size: req.file.size,
                type: req.file.mimetype
            }
        });

    } catch (error) {
        console.error('❌ Erro no upload:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao processar comprovante. Tente novamente.'
        });
    }
});

// ======================
// 💬  ROTA DO CHAT COM GROQ - CORRIGIDA
// ======================
app.post('/api/chat', async (req, res) => {
    const startTime = Date.now();
    
    try {
        console.log('🔮 Nova consulta espiritual recebida...');
        
        const { messages, sessionId = 'default' } = req.body;

        // Validação da mensagem
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            console.warn('⚠️ Mensagem inválida recebida');
            return res.status(400).json({
                error: 'Mensagem inválida',
                message: 'Por favor, envie uma mensagem para conversarmos! 💫'
            });
        }

        console.log(`📊 Histórico recebido: ${messages.length} mensagens`);
        console.log(`🔑 Session ID: ${sessionId}`);

        // ✅ SALVAR APENAS A ÚLTIMA MENSAGEM DO USUÁRIO NO DATABASE
        const lastMessage = messages[messages.length - 1];
        if (lastMessage.role === 'user') {
            await chatDB.addMessage(sessionId, 'user', lastMessage.content);
        }

        // ✅ PROCESSAMENTO COM GROQ (envia histórico completo)
        const response = await getOpenAIResponse(messages);
        
        // ✅ SALVAR RESPOSTA DA IA NO DATABASE
        await chatDB.addMessage(sessionId, 'assistant', response);

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
// 🗑️  ROTA PARA LIMPEZA DE ARQUIVOS TEMPORÁRIOS (opcional)
// ======================
app.delete('/api/cleanup-files', async (req, res) => {
    try {
        const files = fs.readdirSync(uploadsDir);
        const now = Date.now();
        const maxAge = 24 * 60 * 60 * 1000; // 24 horas
        
        let deletedCount = 0;
        
        files.forEach(file => {
            const filePath = path.join(uploadsDir, file);
            const stats = fs.statSync(filePath);
            
            if (now - stats.mtime.getTime() > maxAge) {
                fs.unlinkSync(filePath);
                deletedCount++;
            }
        });
        
        res.json({
            success: true,
            message: `Limpeza concluída. ${deletedCount} arquivos removidos.`,
            deletedCount: deletedCount
        });
        
    } catch (error) {
        console.error('❌ Erro na limpeza:', error);
        res.status(500).json({
            success: false,
            message: 'Erro na limpeza de arquivos.'
        });
    }
});

// ======================
// 🚀  INICIALIZAÇÃO DO SERVIDOR
// ======================
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('✨' + '='.repeat(60));
    console.log(`🔮  Sarah Kali Chat Server - COM UPLOAD ATIVO`);
    console.log(`📍  Rodando na porta: ${PORT}`);
    console.log(`🌐  Ambiente: ${process.env.NODE_ENV || 'production'}`);
    console.log(`📁  Uploads dir: ${uploadsDir}`);
    console.log(`🕐  Iniciado em: ${new Date().toISOString()}`);
    console.log('✨' + '='.repeat(60));
    console.log(`✅  Health Check: http://localhost:${PORT}/health`);
    console.log(`🚀  IA Groq: ${process.env.GROQ_API_KEY ? 'CONFIGURADA ✅' : 'NÃO CONFIGURADA ❌'}`);
    console.log(`📤  Uploads: ATIVADO ✅`);
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