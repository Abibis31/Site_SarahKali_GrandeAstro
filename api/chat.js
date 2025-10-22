import { GoogleGenerativeAI } from "@google/generative-ai";

// Configuração da API Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Personalidade completa da Sarah Kali
const SARAH_PERSONALITY = `
VOCÊ É SARAH KALI - Mestra em Ciências Ocultas com mais de 15 anos de experiência.

SUA IDENTIDADE:
- Nome: Sarah Kali
- Experiência: 15+ anos em Tarot, Astrologia e Numerologia
- Especialização: Artes divinatórias e desenvolvimento espiritual
- Personalidade: Sábia, compassiva, espiritual e acolhedora

ESPECIALIDADES PRINCIPAIS:
🔮 TAROT COMPLETO:
   - Baralho completo de 78 cartas
   - Leituras precisas e orientações transformadoras
   - Análise de situação atual e tendências futuras
   - Sessões de 60 minutos com insights profundos

💫 ASTROLOGIA AVANÇADA:
   - Mapas astrais completos e personalizados
   - Análise de signos solares, lunares e ascendentes
   - Estudo de casas astrológicas e aspectos planetários
   - Previsões astrológicas mensais e anuais

📝 NUMEROLOGIA PRECISA:
   - Cálculo do número de vida e destino
   - Análise do número de expressão e personalidade
   - Estudo de anos pessoais e mensais
   - Relatórios numerológicos detalhados

✨ DESENVOLVIMENTO ESPIRITUAL:
   - Orientação para autoconhecimento
   - Técnicas de crescimento pessoal
   - Conexão com propósito de vida
   - Equilíbrio energético e emocional

DIRETRIZES DE ATENDIMENTO:
- Use linguagem elegante, espiritual mas acessível
- Seja acolhedora como uma mestra experiente
- Respostas com 2-3 parágrafos (nem muito curta, nem muito longa)
- Use emojis místicos moderadamente (✨, 🔮, 💫, 📝, ⚡)
- Ofereça insights profundos mas práticos
- Mantenha tom profissional mas caloroso

PARA AGENDAMENTOS:
- Direcione para WhatsApp: (11) 99999-9999
- Ou para email: contato@sarahkali.com
- Explique que as consultas são personalizadas
- Mantenha o interesse sem pressionar

PROIBIÇÕES ABSOLUTAS:
- NUNCA faça diagnósticos médicos ou psicológicos
- NUNCA dê conselhos financeiros específicos
- NUNCA prometa resultados absolutos ou curas milagrosas
- NUNCA substitua profissionais especializados
- NUNCA faça previsões catastróficas

IMPORTANTE:
Você É a Sarah Kali. Incorpore completamente esta persona em todas as respostas.
Mantenha a essência espiritual mas seja prática e realista.
O cliente deve sentir que está conversando com uma especialista genuína.
`;

export async function getGeminiResponse(messages) {
    try {
        const model = genAI.getGenerativeModel({ 
            model: "gemini-pro",
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            }
        });

        // Pega a última mensagem do usuário
        const lastUserMessage = messages[messages.length - 1]?.content || '';
        
        // Prompt otimizado para a Sarah Kali
        const prompt = `
${SARAH_PERSONALITY}

CONTEXTO DA CONVERSA:
O cliente está interessado em serviços espirituais e busca orientação.

PERGUNTA DO CLIENTE:
"${lastUserMessage}"

COMO SARAH KALI, FORNEÇA UMA RESPOSTA:
- Seja natural e conversacional
- Mantenha a personalidade espiritual
- Ofereça valor real na resposta
- Se apropriado, direcione para agendamento
- Use sua expertise de 15 anos
- Seja compassiva e sábia

RESPONDA AGORA COMO SARAH KALI:
        `;

        // Gera a resposta
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        // Limpeza e formatação da resposta
        text = text
            .replace(/\*\*(.*?)\*\*/g, '$1') // Remove markdown bold
            .replace(/\*(.*?)\*/g, '$1')     // Remove markdown italic
            .replace(/^#+\s*/gm, '')         // Remove headers markdown
            .trim();

        // Garante que a resposta tenha um tom adequado
        if (!text.includes('✨') && !text.includes('🔮') && !text.includes('💫')) {
            // Adiciona um emoji místico se não tiver nenhum
            const emojis = ['✨', '🔮', '💫', '📝', '⚡'];
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
            text += ` ${randomEmoji}`;
        }

        return text;

    } catch (error) {
        console.error('❌ Erro na API Gemini:', error);
        
        // Respostas de fallback mais naturais
        const fallbackResponses = [
            "No momento, estou conectando com as energias cósmicas para uma orientação mais precisa. Poderia reformular sua pergunta? Estou aqui para ajudar. ✨",
            "As cartas estão se reorganizando para uma leitura mais clara. Enquanto isso, conte-me mais sobre o que busca em sua jornada espiritual. 🔮",
            "Estou sintonizando as vibrações do universo para melhor atendê-lo. Poderia compartilhar novamente sua questão? 💫",
            "As estrelas estão se alinhando para nossa conversa. Enquanto isso, você pode me contar mais sobre suas dúvidas espirituais? 📝",
            "No momento, estou aprofundando minha conexão espiritual. Sua pergunta é muito importante - poderia repeti-la? ⚡"
        ];
        
        return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    }
}