import OpenAI from 'openai';

// Configuração do cliente OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Personalidade da Sarah Kali - Versão Natural e Funcional
const SARAH_PERSONALITY = `Você é Sarah Kali, uma cartomante espiritual com mais de 15 anos de experiência em tarot, astrologia e numerologia.

SUA PERSONALIDADE:
- Fala de forma natural, direta e acolhedora
- Evita linguagem excessivamente formal ou rebuscada
- É prática e focada em ajudar
- Usa emojis com moderação (1-2 por resposta)
- Mantém conversas fluidas e contextualizadas

FLUXO DE ATENDIMENTO:
1. Quando alguém pedir MAPA ASTRAL:
   - Peça: data, horário e cidade de nascimento
   - Após receber, faça a análise astral completa

2. Quando alguém pedir NUMEROLOGIA:
   - Peça: nome completo e data de nascimento
   - Após receber, faça a análise numerológica

3. Para outras questões:
   - Responda de forma direta e útil
   - Mantenha o contexto da conversa
   - Seja natural como em uma conversa real

IMPORTANTE: SEMPRE mantenha o contexto da conversa anterior. Lembre-se do que foi discutido e continue naturalmente.

EVITE:
- Saudações muito longas ou formais
- Linguagem excessivamente poética
- Repetir a mesma estrutura de resposta
- Excesso de emojis
- Mensagens comerciais ou pedidos de pagamento

SEJA:
- Natural e conversacional
- Direta e clara
- Acolhedora mas prática
- Contextualizada na conversa`;

/**
 * Função para detectar se o usuário está pedindo um serviço específico
 */
function detectarServicoSolicitado(mensagem) {
    const mensagemLower = mensagem.toLowerCase();
    
    if (mensagemLower.includes('mapa astral') || mensagemLower.includes('astral') || 
        mensagemLower.includes('signos') || mensagemLower.includes('zodíaco') ||
        mensagemLower.includes('planetas') || mensagemLower.includes('casas astrológicas')) {
        return 'mapa_astral';
    }
    
    if (mensagemLower.includes('numerologia') || mensagemLower.includes('número') || 
        mensagemLower.includes('caminho de vida') || mensagemLower.includes('vibração')) {
        return 'numerologia';
    }
    
    return 'geral';
}

/**
 * Função para verificar se a mensagem contém dados para o serviço solicitado
 */
function verificarDadosCompletos(servico, mensagem, historico) {
    const mensagemLower = mensagem.toLowerCase();
    
    if (servico === 'mapa_astral') {
        // Verifica se a mensagem atual parece conter dados de nascimento
        const temData = /\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2} de [a-z]+ de \d{4}/i.test(mensagem);
        const temHorario = /\d{1,2}[:h]\d{2}|\d{1,2}\s*(h|horas)/i.test(mensagem);
        const temLocal = /(em|de|na|no) [a-z]+/i.test(mensagem);
        
        return temData && temHorario && temLocal;
    }
    
    if (servico === 'numerologia') {
        const temNomeCompleto = /[a-z]{3,} [a-z]{3,} [a-z]{3,}/i.test(mensagem);
        const temData = /\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2} de [a-z]+ de \d{4}/i.test(mensagem);
        
        return temNomeCompleto && temData;
    }
    
    return false;
}

/**
 * Verifica se já pedimos dados para um serviço específico
 */
function jaPediuDados(servico, historico) {
    if (servico === 'mapa_astral') {
        return historico.some(msg => 
            msg.role === 'assistant' && 
            (msg.content.includes('data de nascimento') || msg.content.includes('mapa astral'))
        );
    }
    
    if (servico === 'numerologia') {
        return historico.some(msg => 
            msg.role === 'assistant' && 
            (msg.content.includes('nome completo') || msg.content.includes('numerologia'))
        );
    }
    
    return false;
}

export async function getOpenAIResponse(messages) {
    console.log('🔮 Sarah Kali - Processando mensagem...');
    
    // Verificação da API Key
    if (!process.env.OPENAI_API_KEY) {
        console.error('❌ OPENAI_API_KEY não encontrada');
        return "Estou com problemas de conexão no momento. Por favor, tente novamente mais tarde.";
    }

    try {
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return "Olá! Como posso ajudar você hoje?";
        }

        // Pega a última mensagem do usuário e o histórico completo
        const lastMessage = messages[messages.length - 1]?.content || '';
        const historicoCompleto = messages; // AGORA usamos TODO o histórico

        if (!lastMessage.trim()) {
            return "Conte-me como posso ajudar você hoje.";
        }

        console.log(`📨 Mensagem: "${lastMessage.substring(0, 50)}..."`);
        console.log(`📊 Histórico completo: ${historicoCompleto.length} mensagens`);

        // Detecta se é um serviço específico
        const servico = detectarServicoSolicitado(lastMessage);
        
        // Verifica se já temos dados para processar o serviço
        const dadosCompletos = verificarDadosCompletos(servico, lastMessage, historicoCompleto);

        console.log(`🎯 Serviço detectado: ${servico}, Dados completos: ${dadosCompletos}`);

        // Se detectamos um serviço específico mas não temos dados ainda, forçamos um prompt específico
        if (servico !== 'geral' && !dadosCompletos) {
            const jaPediu = jaPediuDados(servico, historicoCompleto);
            
            if (!jaPediu) {
                if (servico === 'mapa_astral') {
                    return "Claro! Para fazer seu mapa astral, preciso que você me informe:\n\n• Data de nascimento (dia/mês/ano)\n• Horário de nascimento\n• Cidade e estado onde nasceu\n\nPode me passar essas informações?";
                }
                
                if (servico === 'numerologia') {
                    return "Perfeito! Para fazer sua análise numerológica, preciso de:\n\n• Seu nome completo\n• Sua data de nascimento (dia/mês/ano)\n\nPode me informar esses dados?";
                }
            }
            // Se já pediu os dados antes, deixamos o fluxo normal continuar com o histórico completo
        }

        // ✅✅✅ CORREÇÃO PRINCIPAL: SEMPRE enviamos TODO o histórico para a OpenAI
        const mensagensCompletas = [
            {
                role: "system",
                content: SARAH_PERSONALITY
            },
            ...historicoCompleto.map(msg => ({
                role: msg.role,
                content: msg.content
            }))
        ];

        console.log(`📤 Enviando ${mensagensCompletas.length} mensagens para OpenAI`);

        // Chamada para API OpenAI com HISTÓRICO COMPLETO
        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: mensagensCompletas,
            temperature: 0.7,
            max_tokens: 1200,
            top_p: 0.9,
        });

        console.log(`🔢 Tokens usados: ${completion.usage?.total_tokens || 'N/A'}`);

        if (!completion.choices?.[0]?.message?.content) {
            throw new Error('Resposta da API incompleta');
        }

        let resposta = completion.choices[0].message.content.trim();

        // Limpeza e otimização da resposta
        resposta = otimizarResposta(resposta);

        console.log(`✅ Resposta: ${resposta.substring(0, 80)}...`);

        return resposta;

    } catch (error) {
        console.error('❌ Erro:', error.message);
        
        const respostasFallback = [
            "Desculpe, tive um problema técnico. Pode repetir?",
            "Estou com dificuldades no momento. Podemos tentar novamente?",
            "Hmm, algo deu errado. Pode reformular sua pergunta?"
        ];
        
        return respostasFallback[Math.floor(Math.random() * respostasFallback.length)];
    }
}

/**
 * Função para otimizar e limpar as respostas
 */
function otimizarResposta(resposta) {
    // Remove saudações muito longas
    resposta = resposta.replace(/^(Olá, (querido|querida|amigo|amiga|alma|viajante).+?\..+?\.)/i, '');
    
    // Remove repetições de emojis (mais de 3 seguidos)
    resposta = resposta.replace(/([✨🔮💫🌙⭐🙏]){3,}/g, '$1');
    
    // Garante que não comece com vírgula ou ponto
    resposta = resposta.replace(/^[.,]\s*/, '');
    
    // Se a resposta estiver muito curta após limpeza, adiciona um toque natural
    if (resposta.length < 10) {
        return "Como posso ajudar você?";
    }
    
    // Remove múltiplos espaços
    resposta = resposta.replace(/\s+/g, ' ').trim();
    
    return resposta;
}

// Exportação para compatibilidade
export { getOpenAIResponse as getGeminiResponse };