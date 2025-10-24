const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

// ✅ IMPORTE DO SISTEMA DE NUMEROLOGIA
import { gerarRelatorioNumerologico } from './numerology.js';

// Personalidade da Sarah Kali - Versão Natural e Funcional
const SARAH_PERSONALITY = `Você é Sarah Kali, uma cartomante espiritual com mais de 15 anos de experiência em tarot, astrologia e numerologia.

SUA PERSONALIDADE:
- Fala de forma natural, direta e acolhedora
- Evita linguagem excessivamente formal ou rebuscada
- É prática e focada em ajudar
- Usa emojis com moderação (1-2 por resposta)
- Mantém conversas fluidas e contextualizadas

FLUXO DE ATENDIMENTO CRÍTICO - CONTEXTO É FUNDAMENTAL:
1. QUANDO O USUÁRIO JÁ ESCOLHEU UM SERVIÇO (tarot, numerologia, mapa astral):
   - CONTINUE com esse serviço SEM voltar a oferecer outras opções
   - NUNCA repita a lista de serviços depois que o usuário já escolheu
   - Avance naturalmente no fluxo do serviço escolhido

2. PARA NUMEROLOGIA ESPECIFICAMENTE:
   - Se o usuário fornecer nome e data de nascimento, faça os cálculos numerológicos reais
   - Use o sistema de numerologia para gerar relatórios precisos
   - Não simule cálculos - use as funções reais de numerologia

3. IMPORTANTE: SEMPRE mantenha o contexto da conversa anterior. 
   - Se o usuário já escolheu tarot, continue com tarot
   - Se já escolheu numerologia, continue com numerologia  
   - Se já escolheu mapa astral, continue com mapa astral

NUNCA:
- Repita a oferta de serviços depois que o usuário já escolheu um
- Peça confirmações desnecessárias
- Entre em loops de repetição
- Volte ao início depois que o fluxo já começou

EXEMPLOS DE FLUXO CORRETO:
Usuário: "quero numerologia"
Sarah: "Perfeito! Para sua análise numerológica, preciso do seu nome completo e data de nascimento (formato DD/MM/AAAA)."

Usuário: "João Silva, 15/03/1990"
Sarah: "[GERA RELATÓRIO NUMEROLÓGICO REAL COM CÁLCULOS]"

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
        mensagemLower.includes('caminho de vida') || mensagemLower.includes('vibração') ||
        mensagemLower.includes('numerológica')) {
        return 'numerologia';
    }
    
    if (mensagemLower.includes('tarot') || mensagemLower.includes('cartas') || 
        mensagemLower.includes('leitura') || mensagemLower.includes('tiragem') ||
        mensagemLower.includes('arcanos')) {
        return 'tarot';
    }
    
    return 'geral';
}

/**
 * Função para verificar se já estamos em um fluxo de serviço específico
 */
function verificarFluxoAtivo(historico) {
    // Verifica as últimas mensagens para ver se já escolhemos um serviço
    const ultimasMensagens = historico.slice(-4); // Últimas 4 mensagens
    
    for (let i = ultimasMensagens.length - 1; i >= 0; i--) {
        const msg = ultimasMensagens[i];
        
        if (msg.role === 'assistant') {
            if (msg.content.includes('tarot') && 
                (msg.content.includes('leitura') || msg.content.includes('cartas'))) {
                return 'tarot';
            }
            if (msg.content.includes('numerologia') && msg.content.includes('nome completo')) {
                return 'numerologia';
            }
            if (msg.content.includes('mapa astral') && msg.content.includes('data de nascimento')) {
                return 'mapa_astral';
            }
        }
        
        if (msg.role === 'user') {
            const servico = detectarServicoSolicitado(msg.content);
            if (servico !== 'geral') {
                return servico;
            }
        }
    }
    
    return null;
}

/**
 * ✅ NOVA FUNÇÃO: Extrair nome e data da mensagem do usuário
 */
function extrairNomeEData(mensagem) {
    // Tenta encontrar padrões de data
    const dataRegex = /(\d{1,2})\/(\d{1,2})\/(\d{4})/;
    const matchData = mensagem.match(dataRegex);
    
    if (!matchData) {
        return null;
    }
    
    const data = matchData[0];
    
    // Remove a data da mensagem para extrair o nome
    let nome = mensagem.replace(dataRegex, '').replace(/[,\-]/g, '').trim();
    
    // Limpa possíveis sobras
    nome = nome.replace(/\s+/g, ' ').replace(/^meu nome é /i, '').replace(/^nome /i, '');
    
    if (!nome || nome.length < 2) {
        return null;
    }
    
    return { nome, data };
}

/**
 * ✅ NOVA FUNÇÃO: Verificar se temos dados para numerologia no histórico
 */
function verificarDadosNumerologiaNoHistorico(historico) {
    // Verifica as últimas 6 mensagens
    const mensagensRelevantes = historico.slice(-6);
    
    for (let i = mensagensRelevantes.length - 1; i >= 0; i--) {
        const msg = mensagensRelevantes[i];
        
        if (msg.role === 'user') {
            const dados = extrairNomeEData(msg.content);
            if (dados) {
                return dados;
            }
        }
    }
    
    return null;
}

export async function getOpenAIResponse(messages) {
    console.log('🔮 Sarah Kali - Processando mensagem com Groq...');
    
    // Verificação da API Key
    if (!GROQ_API_KEY) {
        console.error('❌ GROQ_API_KEY não encontrada');
        return "Estou com problemas de conexão no momento. Por favor, tente novamente mais tarde.";
    }

    try {
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return "Olá! Como posso ajudar você hoje?";
        }

        // Pega a última mensagem do usuário e o histórico completo
        const lastMessage = messages[messages.length - 1]?.content || '';
        const historicoCompleto = messages;

        if (!lastMessage.trim()) {
            return "Conte-me como posso ajudar você hoje.";
        }

        console.log(`📨 Mensagem: "${lastMessage.substring(0, 100)}..."`);
        console.log(`📊 Histórico completo: ${historicoCompleto.length} mensagens`);

        // Detecta se é um serviço específico na última mensagem
        const servicoSolicitado = detectarServicoSolicitado(lastMessage);
        
        // Verifica se já estamos em um fluxo ativo
        const fluxoAtivo = verificarFluxoAtivo(historicoCompleto);
        
        console.log(`🎯 Serviço solicitado: ${servicoSolicitado}, Fluxo ativo: ${fluxoAtivo}`);

        // DECISÃO: Qual serviço considerar?
        let servicoParaUsar = servicoSolicitado;
        if (servicoSolicitado === 'geral' && fluxoAtivo) {
            servicoParaUsar = fluxoAtivo; // Mantém o fluxo anterior
        } else if (servicoSolicitado !== 'geral') {
            servicoParaUsar = servicoSolicitado; // Novo serviço solicitado
        }

        console.log(`🔧 Serviço para usar: ${servicoParaUsar}`);

        // ======================
        // 🔢 FLUXO NUMEROLOGIA - CÁLCULOS REAIS
        // ======================
        if (servicoParaUsar === 'numerologia') {
            console.log('🎯 Iniciando fluxo de numerologia...');
            
            // Verifica se já temos nome e data no histórico
            const dadosUsuario = verificarDadosNumerologiaNoHistorico(historicoCompleto);
            
            if (dadosUsuario) {
                console.log(`📊 Dados encontrados: ${dadosUsuario.nome}, ${dadosUsuario.data}`);
                
                // ✅ GERA RELATÓRIO NUMEROLÓGICO REAL
                const relatorio = gerarRelatorioNumerologico(dadosUsuario.nome, dadosUsuario.data);
                
                if (relatorio.sucesso) {
                    console.log('✅ Relatório numerológico gerado com sucesso!');
                    return relatorio.relatorio;
                } else {
                    console.error('❌ Erro no relatório:', relatorio.erro);
                    return "Encontrei seus dados, mas tive um problema técnico nos cálculos. Pode verificar se a data está no formato DD/MM/AAAA?";
                }
            } else {
                // Ainda não temos dados - pede nome e data
                console.log('📝 Pedindo dados para numerologia...');
                return "Perfeito! Para sua análise numerológica completa, preciso do seu **nome completo** e **data de nascimento** (no formato DD/MM/AAAA). Pode me informar? ✨";
            }
        }

        // Prepara mensagens para a Groq API (para outros serviços)
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

        console.log(`📤 Enviando ${mensagensCompletas.length} mensagens para Groq API`);

        // Chamada para Groq API
        const response = await fetch(GROQ_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant", // Modelo rápido e econômico
                messages: mensagensCompletas,
                temperature: 0.7,
                max_tokens: 1024,
                top_p: 0.9,
                stream: false,
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ Erro Groq API: ${response.status}`, errorText);
            
            if (response.status === 429) {
                return "Estou recebendo muitas consultas agora. Por favor, tente novamente em alguns instantes. 🌟";
            }
            
            throw new Error(`Erro na API: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            console.error('❌ Resposta inválida da API:', data);
            throw new Error('Resposta da API incompleta');
        }

        let resposta = data.choices[0].message.content.trim();

        // Limpeza e otimização da resposta
        resposta = otimizarResposta(resposta);

        console.log(`✅ Resposta: ${resposta.substring(0, 100)}...`);

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
    
    // Remove repetições de emojis (mais de 2 seguidos)
    resposta = resposta.replace(/([✨🔮💫🌙⭐🙏]){3,}/g, '$1');
    
    // Garante que não comece com vírgula ou ponto
    resposta = resposta.replace(/^[.,]\s*/, '');
    
    // Se a resposta estiver muito curta após limpeza
    if (resposta.length < 10) {
        return "Como posso ajudar você?";
    }
    
    // Remove múltiplos espaços
    resposta = resposta.replace(/\s+/g, ' ').trim();
    
    return resposta;
}

// Exportação para compatibilidade
export { getOpenAIResponse as getGeminiResponse };