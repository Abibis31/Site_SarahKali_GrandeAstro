const GROQ_URL = process.env.GROQ_URL || 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Personalidade da Sarah Kali (pode editar como quiser)
const SARAH_PERSONALITY = `Você é Sarah Kali, uma cartomante sábia, intuitiva e acolhedora.
Fale de forma mística, com leveza e empatia, usando emojis como ✨🔮💫 quando fizer sentido.

Você atende com tarot, astrologia e magias espirituais. Seja acolhedora e ofereça ajuda espiritual.

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

Seja gentil, use emojis e ofereça orientação espiritual.`;

export async function getGeminiResponse(messages) {
    // Verificação de segurança
    if (!GROQ_API_KEY) {
        console.error('❌ GROQ_API_KEY não configurada nas variáveis de ambiente');
        return "Estou realinhando minhas energias cósmicas. Por favor, verifique minha configuração espiritual. 🔮";
    }

    try {
        const lastMessage = messages[messages.length - 1]?.content || '';
        console.log('📨 Enviando para Groq:', lastMessage);
        
        const response = await fetch(GROQ_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [
                    { role: "system", content: SARAH_PERSONALITY },
                    { role: "user", content: lastMessage }
                ],
                temperature: 0.7,
                max_tokens: 500
            })
        });

        console.log('📊 Status da resposta:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.log('❌ Erro HTTP:', response.status, errorText);
            throw new Error(`Erro HTTP: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('✅ Resposta Groq recebida');
        
        if (data.choices && data.choices[0]) {
            let text = data.choices[0].message.content;
            console.log('📝 Texto extraído:', text.substring(0, 100) + '...');
            
            // Adiciona emoji se não tiver
            if (!text.includes('✨') && !text.includes('🔮') && !text.includes('💫')) {
                const emojis = ['✨', '🔮', '💫', '📝', '⚡'];
                const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                text += ` ${randomEmoji}`;
            }
            
            return text;
        } else {
            console.error('❌ Resposta inválida da API:', data);
            throw new Error('Resposta inválida da API');
        }
        
    } catch (error) {
        console.error('❌ Erro na API Groq:', error.message);
        
        const fallbackResponses = [
            "Estou sintonizando as vibrações do universo. Poderia compartilhar novamente sua questão? 💫",
            "No momento, estou conectando com as energias cósmicas. Poderia repetir? ✨",
            "As cartas estão se reorganizando. Enquanto isso, conte-me mais? 🔮"
        ];
        
        return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    }
}