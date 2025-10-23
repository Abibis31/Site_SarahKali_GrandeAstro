import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuração de diretórios para ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inicialização do Express
const app = express();
const PORT = process.env.PORT || 8080;

// ======================
// 🛡️  MIDDLEWARES SIMPLES
// ======================
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// ======================
// 🩺  HEALTH CHECK SIMPLES (CRÍTICO)
// ======================
app.get('/health', (req, res) => {
    console.log('✅ Health check executado');
    res.status(200).json({ 
        status: 'OK', 
        message: 'Sarah Kali está online! ✨',
        timestamp: new Date().toISOString()
    });
});

// ======================
// 🌐  ROTAS ESSENCIAIS
// ======================

// Rota raiz
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota do Chat SIMPLIFICADA
app.post('/api/chat', async (req, res) => {
    try {
        const { messages } = req.body;
        
        // Resposta FIXA temporária - DEPOIS adicionamos a IA
        const respostaFixa = "✨ Sarah Kali aqui! Estou conectando com as energias cósmicas... Em breve estarei completa! 🔮";
        
        console.log('💬 Chat respondendo com mensagem fixa');
        res.json({ message: respostaFixa });
        
    } catch (error) {
        console.error('Erro no chat:', error);
        res.json({ message: "Estou realinhando minhas energias... ✨" });
    }
});

// ======================
// 🚀  INICIALIZAÇÃO SIMPLES
// ======================
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`>>> 🎯 Sarah Kali Server RODANDO na porta: ${PORT}`);
    console.log(`>>> ✅ Health: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('>>> 🛑 SIGTERM recebido, encerrando...');
    server.close(() => {
        console.log('>>> ✅ Servidor encerrado');
        process.exit(0);
    });
});