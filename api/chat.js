import OpenAI from 'openai';

// Configuração do cliente OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Personalidade da Sarah Kali - Versão Melhorada com Contexto
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

2. PARA TAROT ESPECIFICAMENTE:
   - Se o usuário pede "leitura geral", faça uma leitura geral de tarot
   - Não peça para escolher entre serviços novamente
   - Simule uma leitura real com carta(s) específica(s)

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
Usuário: "gostaria de uma leitura de tarot"
Sarah: "Perfeito! Vamos fazer uma leitura de tarot. Você tem uma pergunta específica ou prefere uma leitura geral sobre sua vida?"

Usuário: "leitura geral"  
Sarah: "[FAZ LEITURA DE TAROT COMPLETA]"

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
 * Função para verificar se a mensagem contém dados para numerologia
 */
function verificarDadosNumerologia(mensagem) {
    console.log('🔍 Verificando dados para numerologia...');
    
    // Verifica se tem data de nascimento (formato DD/MM/AAAA)
    const temData = /\d{1,2}\/\d{1,2}\/\d{4}/.test(mensagem);
    
    // Verifica se tem nome completo (pelo menos 2 palavras com mais de 3 letras)
    const palavras = mensagem.split(/\s+/);
    const palavrasComTamanho = palavras.filter(palavra => palavra.length >= 3);
    const temNome = palavrasComTamanho.length >= 2;
    
    console.log(`📊 Data detectada: ${temData}, Nome detectado: ${temNome}`);
    console.log(`📝 Palavras com tamanho: ${palavrasComTamanho.length}`);
    
    return temData && temNome;
}

/**
 * Função para verificar se a mensagem contém dados para mapa astral
 */
function verificarDadosMapaAstral(mensagem) {
    console.log('🔍 Verificando dados para mapa astral...');
    
    // Verifica se tem data de nascimento
    const temData = /\d{1,2}\/\d{1,2}\/\d{4}/.test(mensagem);
    
    // Verifica se tem horário (formato HH:MM ou HHhMM)
    const temHorario = /\d{1,2}[:h]\d{2}/.test(mensagem);
    
    // Verifica se tem local (pelo menos uma palavra que parece cidade/estado)
    const temLocal = /(são paulo|rio de janeiro|minas|bahia|brasília|porto alegre|curitiba|fortaleza|recife|belo horizonte|salvador|manaus)/i.test(mensagem) || 
                    /(sp|rj|mg|rs|pr|sc|ba|pe|ce|df|go|mt|ms|am|pa)/i.test(mensagem);
    
    console.log(`📊 Data: ${temData}, Horário: ${temHorario}, Local: ${temLocal}`);
    
    return temData && temHorario && temLocal;
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

/**
 * Extrai dados da mensagem para criar um prompt específico
 */
function criarPromptComDados(servico, mensagem, historico) {
    if (servico === 'numerologia') {
        // Extrai a data
        const dataMatch = mensagem.match(/\d{1,2}\/\d{1,2}\/\d{4}/);
        const data = dataMatch ? dataMatch[0] : 'data não encontrada';
        
        // Extrai o nome (assume que as primeiras palavras são o nome)
        const palavras = mensagem.split(/\s+/).filter(palavra => palavra.length >= 3);
        const nome = palavras.slice(0, 3).join(' '); // Pega até 3 palavras como nome
        
        return `O usuário forneceu os dados para numerologia:
Nome: ${nome}
Data de nascimento: ${data}

FAÇA uma análise numerológica COMPLETA e detalhada baseada nestes dados. Analise:
- Caminho de vida
- Número de expressão
- Número de alma
- Anos pessoais
- Desafios e oportunidades

Seja específico e detalhado na análise.`;
    }
    
    if (servico === 'mapa_astral') {
        const dataMatch = mensagem.match(/\d{1,2}\/\d{1,2}\/\d{4}/);
        const data = dataMatch ? dataMatch[0] : 'data não encontrada';
        
        const horarioMatch = mensagem.match(/\d{1,2}[:h]\d{2}/);
        const horario = horarioMatch ? horarioMatch[0] : 'horário não encontrado';
        
        return `O usuário forneceu os dados para mapa astral:
Data de nascimento: ${data}
Horário de nascimento: ${horario}

FAÇA uma análise astral COMPLETA e detalhada baseada nestes dados. Analise:
- Signo solar, lunar e ascendente
- Posições planetárias principais
- Casas astrológicas relevantes
- Aspectos importantes
- Tendências e características marcantes

Seja específico e detalhado na análise.`;
    }
    
    return null;
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

        // Verifica se temos dados completos para o serviço
        let dadosCompletos = false;
        let promptEspecifico = null;

        if (servicoParaUsar === 'numerologia') {
            dadosCompletos = verificarDadosNumerologia(lastMessage);
            if (dadosCompletos) {
                promptEspecifico = criarPromptComDados('numerologia', lastMessage, historicoCompleto);
                console.log('✅ Dados completos para numerologia - criando prompt específico');
            }
        } else if (servicoParaUsar === 'mapa_astral') {
            dadosCompletos = verificarDadosMapaAstral(lastMessage);
            if (dadosCompletos) {
                promptEspecifico = criarPromptComDados('mapa_astral', lastMessage, historicoCompleto);
                console.log('✅ Dados completos para mapa astral - criando prompt específico');
            }
        }

        // Se detectamos um serviço específico mas não temos dados ainda
        if (servicoParaUsar !== 'geral' && !dadosCompletos) {
            const jaPediu = jaPediuDados(servicoParaUsar, historicoCompleto);
            
            if (!jaPediu) {
                if (servicoParaUsar === 'mapa_astral') {
                    return "Claro! Para fazer seu mapa astral, preciso que você me informe:\n\n• Data de nascimento (dia/mês/ano)\n• Horário de nascimento\n• Cidade e estado onde nasceu\n\nPode me passar essas informações?";
                }
                
                if (servicoParaUsar === 'numerologia') {
                    return "Perfeito! Para fazer sua análise numerológica, preciso de:\n\n• Seu nome completo\n• Sua data de nascimento (dia/mês/ano)\n\nPode me informar esses dados?";
                }
            }
            // Se já pediu os dados antes, deixa o fluxo normal continuar
        }

        // Prepara mensagens para a OpenAI
        let mensagensCompletas = [
            {
                role: "system",
                content: SARAH_PERSONALITY
            },
            ...historicoCompleto.map(msg => ({
                role: msg.role,
                content: msg.content
            }))
        ];

        // Se temos dados completos, adiciona um prompt específico no final
        if (promptEspecifico) {
            mensagensCompletas.push({
                role: "system",
                content: promptEspecifico
            });
        }

        console.log(`📤 Enviando ${mensagensCompletas.length} mensagens para OpenAI`);

        // Chamada para API OpenAI com HISTÓRICO COMPLETO
        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: mensagensCompletas,
            temperature: 0.7,
            max_tokens: 1500,
            top_p: 0.9,
        });

        console.log(`🔢 Tokens usados: ${completion.usage?.total_tokens || 'N/A'}`);

        if (!completion.choices?.[0]?.message?.content) {
            throw new Error('Resposta da API incompleta');
        }

        let resposta = completion.choices[0].message.content.trim();

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