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

DIRETRIZES DE RESPOSTA:
• Sempre seja calorosa e acolhedora
• Use emojis relevantes naturalmente (máximo 3-4 por resposta)
• Mostre compreensão emocional profunda
• Ofereça insights espirituais práticos
• Termine convidando para aprofundar a conversa
• Mantenha tom místico porém acessível
• Nunca seja muito técnica ou formal

SUA MISSÃO: Orientar, confortar e iluminar almas buscando direção espiritual.`;

/**
 * Função principal para obter resposta da OpenAI (GPT-4)
 * @param {Array} messages - Array de mensagens do chat
 * @returns {Promise<string>} - Resposta da Sarah Kali
 */
export async function getOpenAIResponse(messages) {
    console.log('🔮 Sarah Kali - Iniciando consulta espiritual com GPT-4...');
    
    // Verificação CRÍTICA da API Key
    if (!process.env.OPENAI_API_KEY) {
        console.error('❌ CRÍTICO: OPENAI_API_KEY não encontrada');
        return "Estou realinhando minhas energias cósmicas... Por favor, configure minha conexão espiritual. 🔮";
    }

    try {
        // Extrai a última mensagem do usuário
        const lastMessage = Array.isArray(messages) && messages.length > 0 
            ? messages[messages.length - 1]?.content || ''
            : '';

        if (!lastMessage.trim()) {
            console.log('⚠️ Mensagem vazia recebida');
            return "Querida alma, compartilhe sua questão comigo... O universo aguarda suas palavras. ✨";
        }

        console.log(`📨 Consulta recebida: "${lastMessage.substring(0, 50)}..."`);

        // Chamada para API OpenAI com GPT-4
        const completion = await openai.chat.completions.create({
            model: "gpt-4", // ✅ Usando GPT-4
            messages: [
                {
                    role: "system",
                    content: SARAH_PERSONALITY
                },
                {
                    role: "user", 
                    content: lastMessage
                }
            ],
            temperature: 0.8, // Levemente aumentado para mais criatividade
            max_tokens: 1000, // Aumentado para respostas mais completas
            top_p: 0.9,
            frequency_penalty: 0.1, // Adicionado para variar expressões
            presence_penalty: 0.1, // Adicionado para manter conversa natural
        });

        console.log(`📊 Resposta GPT-4 gerada com sucesso`);
        console.log(`🔢 Tokens usados: ${completion.usage?.total_tokens || 'N/A'}`);

        if (!completion.choices || !completion.choices[0] || !completion.choices[0].message) {
            console.error('❌ Resposta inválida da API:', completion);
            throw new Error('Resposta da API incompleta');
        }

        let resposta = completion.choices[0].message.content.trim();
        console.log(`✅ Resposta GPT-4: ${resposta.substring(0, 100)}...`);

        // Verificação e enriquecimento espiritual da resposta
        resposta = enriquecerRespostaEspiritual(resposta);

        return resposta;

    } catch (error) {
        console.error('❌ Erro durante consulta espiritual com GPT-4:', error.message);
        
        // Respostas de fallback específicas para GPT-4
        const respostasFallback = [
            "As cartas cósmicas estão se realinhando... Conte-me mais sobre sua questão, querida alma? 💫",
            "Estou sintonizando as vibrações mais profundas do universo... Poderia compartilhar novamente seus pensamentos? ✨", 
            "O universo pede um momento de reflexão... Em que mais posso iluminar seu caminho hoje? 🔮",
            "Minha intuição está se conectando com energias superiores... Compartilhe sua jornada comigo? 🌙",
            "As estrelas estão se comunicando... Vamos aprofundar essa conexão espiritual? ⭐"
        ];
        
        return respostasFallback[Math.floor(Math.random() * respostasFallback.length)];
    }
}

/**
 * Função para enriquecer respostas com toque espiritual
 * @param {string} resposta - Resposta original da IA
 * @returns {string} - Resposta enriquecida
 */
function enriquecerRespostaEspiritual(resposta) {
    const emojisEspirituais = ['✨', '🔮', '💫', '🌙', '⭐', '🙏', '🌌', '🕯️'];
    const frasesEspirituais = [
        "Que as estrelas guiem seu caminho",
        "O universo conspira a seu favor",
        "Sua alma tem sabedoria ancestral",
        "As energias cósmicas estão com você",
        "Sua luz interior brilha intensamente"
    ];
    
    // Adiciona emoji se não tiver muitos
    const emojiCount = (resposta.match(/✨|🔮|💫|🌙|⭐|🙏|🌌|🕯️/g) || []).length;
    if (emojiCount < 2) {
        const emojiAleatorio = emojisEspirituais[Math.floor(Math.random() * emojisEspirituais.length)];
        resposta += ` ${emojiAleatorio}`;
    }
    
    // Garante que termina com tom convidativo se muito curta
    if (resposta.length < 150 && !resposta.includes('?')) {
        const fraseAleatoria = frasesEspirituais[Math.floor(Math.random() * frasesEspirituais.length)];
        resposta += ` ${fraseAleatoria}. Em que mais posso ajudá-la hoje? 💫`;
    }
    
    return resposta;
}

// Exportação adicional para compatibilidade com código antigo
export { getOpenAIResponse as getGeminiResponse };