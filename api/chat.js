const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = process.env.GROQ_URL;

// Personalidade da Sarah Kali - Versão Melhorada
const SARAH_PERSONALITY = `Você é Sarah Kali, uma cartomante espiritual, sábia e acolhedora com mais de 15 anos de experiência em tarot, astrologia e magias espirituais.

SEU ESTILO:
💫 Fale de forma mística mas acessível
🔮 Use emojis espirituais naturalmente
✨ Seja empática, intuitiva e acolhedora
🌙 Ofereça orientação espiritual genuína
📿 Mostre sabedoria ancestral

PRINCIPAIS SERVIÇOS:
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

CHAVE PIX: 48999017075 (Rosani)

Sua missão é orientar, confortar e iluminar. Sempre termine com uma pergunta ou convite para aprofundar a conversa.`;

export async function getGeminiResponse(messages) {
    console.log('🔮 Sarah Kali - Iniciando consulta espiritual...');
    
    // Verificação CRÍTICA da API Key
    if (!GROQ_API_KEY) {
        console.error('❌ CRÍTICO: GROQ_API_KEY não encontrada');
        return "Estou realinhando minhas energias cósmicas... Por favor, volte em alguns instantes. 🔮";
    }

    try {
        // Extrai a última mensagem do usuário
        const lastMessage = Array.isArray(messages) && messages.length > 0 
            ? messages[messages.length - 1]?.content || ''
            : '';

        if (!lastMessage.trim()) {
            console.log('⚠️ Mensagem vazia recebida');
            return "Querida alma, compartilhe sua questão comigo... ✨";
        }

        console.log(`📨 Consulta recebida: "${lastMessage.substring(0, 50)}..."`);

        // Chamada para API Groq
        const response = await fetch(GROQ_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
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
                temperature: 0.7,
                max_tokens: 800,
                top_p: 0.9,
            })
        });

        console.log(`📊 Status da resposta: ${response.status}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ Erro API: ${response.status}`, errorText);
            
            if (response.status === 401) {
                return "Minha conexão espiritual está instável no momento... 🔮";
            } else if (response.status === 429) {
                return "O universo está muito movimentado agora... Muitas almas buscando orientação. Tente novamente em alguns minutos. 💫";
            } else {
                return "As energias cósmicas estão se reorganizando... Por favor, tente novamente. ✨";
            }
        }

        const data = await response.json();
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            console.error('❌ Resposta inválida da API:', data);
            throw new Error('Resposta da API incompleta');
        }

        let resposta = data.choices[0].message.content;
        console.log(`✅ Resposta gerada: ${resposta.substring(0, 80)}...`);

        // Garante que a resposta tenha um toque espiritual
        const emojisEspirituais = ['✨', '🔮', '💫', '🌙', '⭐', '🙏'];
        const emojiAleatorio = emojisEspirituais[Math.floor(Math.random() * emojisEspirituais.length)];
        
        if (!resposta.includes('✨') && !resposta.includes('🔮') && !resposta.includes('💫')) {
            resposta += ` ${emojiAleatorio}`;
        }

        return resposta;

    } catch (error) {
        console.error('❌ Erro durante consulta espiritual:', error.message);
        
        // Respostas de fallback melhoradas
        const respostasFallback = [
            "As cartas estão se misturando... Conte-me mais sobre sua questão? 💫",
            "Estou sintonizando as vibrações do universo... Poderia repetir sua pergunta? ✨", 
            "O universo pede um momento de pausa... Em que mais posso ajudá-la? 🔮",
            "Minha intuição está se ajustando às suas energias... Compartilhe novamente seus pensamentos? 🌙"
        ];
        
        return respostasFallback[Math.floor(Math.random() * respostasFallback.length)];
    }
}