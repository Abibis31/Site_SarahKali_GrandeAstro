import OpenAI from 'openai';

// Configuração do cliente OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Personalidade da Sarah Kali - Versão Otimizada para GPT-4
const SARAH_PERSONALITY = `Você é Sarah Kali, uma cartomante espiritual, sábia e acolhedora com mais de 15 anos de experiência em tarot, astrologia e magias espirituais.

CARACTERÍSTICAS PRINCIPAIS:
🎴 Cartomante espiritual e conselheira intuitiva
💫 Fala de forma mística mas acessível  
🔮 Usa emojis espirituais naturalmente
✨ Empática, intuitiva e extremamente acolhedora
🌙 Conecta com sabedoria ancestral e energia cósmica
📿 Oferece orientação espiritual genuína e prática

SERVIÇOS ESPIRITUAIS:
🔮 3 Perguntas — R$10
🔮 7 Perguntas — R$20  
💖 Templo de Afrodite (Amor) — R$30
🌟 Leitura da Semana — R$20
📅 Leitura Mensal — R$25
🔍 Área da Vida — R$15
🌀 Mapa Astral — R$30
🔢 Numerologia — R$25
❤️ Jogo: Tem Volta? — R$20
✨ Magias Espirituais — Valores variados

FORMA DE PAGAMENTO:
📱 CHAVE PIX: 48999017075 (Rosani)

DIRETRIZES DE RESPOSTA IMPORTANTES:
• MANTENHA o contexto da conversa - lembre-se do que foi dito anteriormente
• CONTINUE a linha de pensamento da conversa
• NUNCA corte respostas no meio - sempre complete seus pensamentos
• Seja completa mas concisa - equilibre profundidade com clareza
• Use emojis relevantes naturalmente (máximo 3-4 por resposta)
• Mostre compreensão emocional profunda
• Termine convidando para aprofundar a conversa
• Mantenha tom místico porém acessível
• Estruture respostas em tópicos curtos para melhor legibilidade

SUA MISSÃO: Orientar, confortar e iluminar almas buscando direção espiritual.`;

/**
 * Função principal para obter resposta da OpenAI (GPT-4) com contexto completo
 * @param {Array} messages - Array completo do histórico de mensagens
 * @returns {Promise<string>} - Resposta contextual da Sarah Kali
 */
export async function getOpenAIResponse(messages) {
    console.log('🔮 Sarah Kali - Iniciando consulta espiritual com GPT-4...');
    
    // Verificação CRÍTICA da API Key
    if (!process.env.OPENAI_API_KEY) {
        console.error('❌ CRÍTICO: OPENAI_API_KEY não encontrada');
        return "Estou realinhando minhas energias cósmicas... Por favor, configure minha conexão espiritual. 🔮";
    }

    try {
        // Verifica se há mensagens
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            console.log('⚠️ Nenhuma mensagem recebida');
            return "Querida alma, compartilhe sua questão comigo... O universo aguarda suas palavras. ✨";
        }

        console.log(`📨 Processando ${messages.length} mensagens de histórico`);
        
        // Log do histórico para debugging
        messages.forEach((msg, index) => {
            console.log(`   ${index + 1}. [${msg.role}] ${msg.content.substring(0, 50)}...`);
        });

        // Prepara o array de mensagens para a OpenAI mantendo TODO o histórico
        const mensagensCompletas = [
            {
                role: "system",
                content: SARAH_PERSONALITY
            },
            ...messages.map(msg => ({
                role: msg.role,
                content: msg.content
            }))
        ];

        console.log(`📊 Total de mensagens no contexto: ${mensagensCompletas.length}`);

        // Chamada para API OpenAI com GPT-4 - COM HISTÓRICO COMPLETO
        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: mensagensCompletas,
            temperature: 0.7,
            max_tokens: 1500,
            top_p: 0.9,
            frequency_penalty: 0.1,
            presence_penalty: 0.1,
        });

        console.log(`📊 Resposta GPT-4 gerada com sucesso`);
        console.log(`🔢 Tokens usados: ${completion.usage?.total_tokens || 'N/A'}`);
        console.log(`📝 Comprimento da resposta: ${completion.choices[0]?.message?.content?.length || 0} caracteres`);

        if (!completion.choices || !completion.choices[0] || !completion.choices[0].message) {
            console.error('❌ Resposta inválida da API:', completion);
            throw new Error('Resposta da API incompleta');
        }

        let resposta = completion.choices[0].message.content.trim();
        
        // Verifica se a resposta foi cortada
        const respostaCortada = isRespostaCortada(resposta);
        if (respostaCortada) {
            console.warn('⚠️ Resposta possivelmente cortada');
            resposta = resposta.replace(/[,;:]$/, '.') + ' ✨';
        }

        console.log(`✅ Resposta GPT-4: ${resposta.substring(0, 100)}...`);

        // Verificação e enriquecimento espiritual da resposta
        resposta = enriquecerRespostaEspiritual(resposta);

        return resposta;

    } catch (error) {
        console.error('❌ Erro durante consulta espiritual com GPT-4:', error.message);
        
        // Respostas de fallback que mantém o contexto
        const respostasFallback = [
            "Estou sentindo que precisamos aprofundar essa conexão... Poderia me contar mais sobre seus pensamentos? 💫",
            "Vamos continuar nossa jornada espiritual... Em que mais posso iluminar seu caminho hoje? ✨", 
            "Estou aqui para acompanhá-la nessa busca... O que mais gostaria de explorar? 🔮",
            "Sua energia está se conectando com a minha intuição... Vamos seguir com essa conversa espiritual? 🌙"
        ];
        
        return respostasFallback[Math.floor(Math.random() * respostasFallback.length)];
    }
}

/**
 * Detecta se a resposta foi cortada no meio do pensamento
 * @param {string} resposta - Resposta a ser verificada
 * @returns {boolean} - True se a resposta foi cortada
 */
function isRespostaCortada(resposta) {
    if (!resposta || resposta.length < 50) return false;
    
    const ultimosCaracteres = resposta.slice(-20);
    const sinaisDeCorte = [
        /[,;:]$/i,
        / e$/i,
        / mas$/i,
        / porém$/i,
        / contudo$/i,
        / no entanto$/i
    ];
    
    return sinaisDeCorte.some(pattern => pattern.test(ultimosCaracteres));
}

/**
 * Enriquece a resposta com elementos espirituais
 * @param {string} resposta - Resposta original
 * @returns {string} - Resposta enriquecida
 */
function enriquecerRespostaEspiritual(resposta) {
    const emojisEspirituais = ['✨', '🔮', '💫', '🌙', '⭐', '🙏', '🌌', '🕯️'];
    
    // Remove possíveis cortes no final
    resposta = resposta.replace(/[,;:]$/, '').trim();
    
    // Adiciona emoji se não tiver muitos
    const emojiCount = (resposta.match(/✨|🔮|💫|🌙|⭐|🙏|🌌|🕯️/g) || []).length;
    if (emojiCount < 2) {
        const emojiAleatorio = emojisEspirituais[Math.floor(Math.random() * emojisEspirituais.length)];
        resposta += ` ${emojiAleatorio}`;
    }
    
    // Garante que termina com pontuação adequada
    if (!/[.!?]$/.test(resposta)) {
        resposta += '.';
    }
    
    return resposta;
}

// Exportação adicional para compatibilidade com código antigo
export { getOpenAIResponse as getGeminiResponse };