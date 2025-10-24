const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

// ✅ IMPORTE DO SISTEMA DE NUMEROLOGIA
import { gerarRelatorioNumerologico } from './numerology.js';
// ✅ IMPORTE DO SISTEMA DE MAPA ASTRAL
import { gerarRelatorioMapaAstral } from './astrology.js';

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

3. PARA MAPA ASTRAL ESPECIFICAMENTE:
   - Se o usuário fornecer dados completos, faça os cálculos astrológicos reais
   - Use o sistema de astrologia para gerar relatórios precisos
   - Calcule signo solar, lunar, ascendente e casas astrológicas
   - Se faltarem dados, identifique especificamente o que está faltando e peça apenas isso

4. IMPORTANTE: Após gerar um relatório completo, não gere outro relatório para mensagens subsequentes a menos que o usuário peça explicitamente.

5. SEMPRE mantenha o contexto da conversa anterior. 
   - Se o usuário já escolheu tarot, continue com tarot
   - Se já escolheu numerologia, continue com numerologia  
   - Se já escolheu mapa astral, continue com mapa astral

NUNCA:
- Repita a oferta de serviços depois que o usuário já escolheu um
- Peça confirmações desnecessárias
- Entre em loops de repetição
- Volte ao início depois que o fluxo já começou
- Gere relatórios duplicados para a mesma consulta

EXEMPLOS DE FLUXO CORRETO:
Usuário: "quero mapa astral"
Sarah: "Perfeito! Para seu mapa astral completo, preciso do seu nome completo, data de nascimento (formato DD/MM/AAAA), hora (se souber) e cidade."

Usuário: "21/12/2005 06:00 São Paulo"
Sarah: "✨ Perfeito! Tenho sua data de nascimento (21/12/2005), hora (06:00) e cidade (São Paulo). Para personalizar seu mapa astral, está faltando apenas seu nome completo. Pode me informar?"

Usuário: "Meu nome é João Silva"
Sarah: "[GERA RELATÓRIO ASTRAL REAL COM CÁLCULOS]"

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
 * ✅ FUNÇÃO: Extrair nome e data da mensagem do usuário
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
 * ✅ FUNÇÃO: Verificar se temos dados para numerologia no histórico
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

/**
 * ✅ NOVA FUNÇÃO: Verificar se já gerou relatório recentemente
 */
function jaGerouRelatorioRecentemente(historico, servico) {
    const ultimasMensagens = historico.slice(-4);
    
    for (let i = ultimasMensagens.length - 1; i >= 0; i--) {
        const msg = ultimasMensagens[i];
        
        if (msg.role === 'assistant') {
            // Verifica se já gerou relatório deste serviço recentemente
            if (servico === 'mapa_astral' && msg.content.includes('MAPA ASTRAL DE')) {
                return true;
            }
            if (servico === 'numerologia' && msg.content.includes('ANÁLISE NUMEROLÓGICA')) {
                return true;
            }
        }
        
        // Se encontrou uma mensagem do usuário pedindo o serviço novamente, não bloqueia
        if (msg.role === 'user') {
            const servicoSolicitado = detectarServicoSolicitado(msg.content);
            if (servicoSolicitado === servico) {
                return false;
            }
        }
    }
    
    return false;
}

/**
 * ✅ NOVA FUNÇÃO: Verificar dados para mapa astral no histórico
 */
function verificarDadosMapaAstralNoHistorico(historico) {
    const mensagensRelevantes = historico.slice(-8);
    
    let nome = '';
    let data = '';
    let hora = null;
    let local = null;
    
    // Procura dados nas últimas mensagens
    for (let i = mensagensRelevantes.length - 1; i >= 0; i--) {
        const msg = mensagensRelevantes[i];
        
        if (msg.role === 'user') {
            const texto = msg.content.toLowerCase();
            
            // Tenta extrair data (formato DD/MM/AAAA)
            const dataMatch = texto.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
            if (dataMatch && !data) {
                data = dataMatch[0];
            }
            
            // ✅ CORREÇÃO MELHORADA: Extrair hora de formato textual
            const horaMatch = texto.match(/(\d{1,2}):(\d{2})/);
            if (horaMatch && !hora) {
                hora = horaMatch[0];
            } else {
                // Tenta extrair hora por extenso (ex: "06 da manhã")
                const horaExtensoMatch = texto.match(/(\d{1,2})\s*(?:h|horas?)?\s*(?:da\s*(manhã|tarde|noite))/i);
                if (horaExtensoMatch && !hora) {
                    let horaNum = parseInt(horaExtensoMatch[1]);
                    const periodo = horaExtensoMatch[2].toLowerCase();
                    
                    // Converter para formato 24h
                    if (periodo === 'tarde' && horaNum < 12) {
                        horaNum += 12;
                    } else if (periodo === 'noite' && horaNum < 12) {
                        horaNum += 12;
                    }
                    // Formata para HH:MM
                    hora = horaNum.toString().padStart(2, '0') + ':00';
                }
            }
            
            // ✅ CORREÇÃO MELHORADA: Extrair nome de mensagens que contêm dados
            if (dataMatch && !nome) {
                let possivelNome = msg.content.split(dataMatch[0])[0].trim();
                
                // Remove padrões comuns que não são nomes
                possivelNome = possivelNome.replace(/^(ok|okay|sim|claro|tudo bem|beleza),?\s*/i, '');
                possivelNome = possivelNome.replace(/^(quero|gostaria|preciso|desejo|meu|o|a)\s+/i, '');
                possivelNome = possivelNome.replace(/\s*(mapa astral|astral|signo|zodíaco|horóscopo).*$/i, '');
                
                // Se o texto restante parece um nome (tem pelo menos 2 palavras e não é muito curto)
                const palavras = possivelNome.split(/\s+/);
                if (palavras.length >= 2 && possivelNome.length >= 6) {
                    nome = possivelNome;
                }
            }
            
            // Tenta identificar local
            const locaisComuns = ['são paulo', 'rio de janeiro', 'brasília', 'salvador', 'fortaleza', 'belo horizonte', 
                                'manaus', 'curitiba', 'recife', 'porto alegre', 'são luiz', 'são luís', 'são paulo capital'];
            for (const localComum of locaisComuns) {
                if (texto.includes(localComum) && !local) {
                    local = localComum;
                    break;
                }
            }
            
            // Se não encontrou por lista, tenta extrair texto após vírgulas
            if (!local) {
                const partes = msg.content.split(',');
                if (partes.length >= 4) {
                    local = partes[3].trim();
                } else if (partes.length >= 3 && !horaMatch) {
                    // Se não tem hora, o terceiro item pode ser o local
                    const possivelLocal = partes[2].trim();
                    if (possivelLocal.length > 3 && !possivelLocal.match(/\d/)) {
                        local = possivelLocal;
                    }
                }
            }
        }
    }
    
    console.log(`🔍 Dados extraídos - Nome: "${nome}", Data: "${data}", Hora: "${hora}", Local: "${local}"`);
    
    // Retorna mesmo se não tiver nome, para podermos pedir especificamente
    return { nome, data, hora, local };
}

/**
 * ✅ NOVA FUNÇÃO: Verificar quais dados estão faltando
 */
function verificarDadosFaltantesMapaAstral(dados) {
    const faltantes = [];
    
    if (!dados.nome || dados.nome.length < 3) {
        faltantes.push('nome completo');
    }
    if (!dados.data) {
        faltantes.push('data de nascimento (DD/MM/AAAA)');
    }
    if (!dados.hora) {
        faltantes.push('hora de nascimento (opcional, formato HH:MM)');
    }
    if (!dados.local) {
        faltantes.push('cidade de nascimento');
    }
    
    return faltantes;
}

/**
 * ✅ NOVA FUNÇÃO: Mensagens específicas para dados faltantes
 */
function gerarMensagemDadosFaltantes(dadosFaltantes, dadosColetados) {
    console.log(`📋 Dados coletados:`, dadosColetados);
    console.log(`❌ Dados faltantes:`, dadosFaltantes);
    
    // Contar quantos dados já temos
    const dadosColetadosCount = Object.values(dadosColetados).filter(val => val && val.length > 0).length;
    
    // Se temos alguns dados mas falta nome
    if (dadosFaltantes.includes('nome completo') && dadosColetadosCount > 0) {
        const partes = [];
        if (dadosColetados.data) partes.push(`data de nascimento (${dadosColetados.data})`);
        if (dadosColetados.hora) partes.push(`hora (${dadosColetados.hora})`);
        if (dadosColetados.local) partes.push(`cidade (${dadosColetados.local})`);
        
        return `✨ **Perfeito!** Tenho sua ${partes.join(', ')}. Para personalizar seu mapa astral, **está faltando apenas seu nome completo**. Pode me informar?`;
    }
    
    // Se temos nome mas falta data
    if (dadosFaltantes.includes('data de nascimento (DD/MM/AAAA)') && dadosColetados.nome) {
        return `✨ **Obrigada, ${dadosColetados.nome}!** Para calcular seu mapa astral, **está faltando sua data de nascimento** no formato DD/MM/AAAA. Pode me informar?`;
    }
    
    // Se temos vários dados mas falta cidade
    if (dadosFaltantes.includes('cidade de nascimento') && dadosColetadosCount >= 2) {
        const partes = [];
        if (dadosColetados.nome) partes.push(`nome (${dadosColetados.nome})`);
        if (dadosColetados.data) partes.push(`data (${dadosColetados.data})`);
        if (dadosColetados.hora) partes.push(`hora (${dadosColetados.hora})`);
        
        return `✨ **Quase lá!** Tenho seus dados: ${partes.join(', ')}. **Está faltando apenas a cidade onde você nasceu**. Pode me informar?`;
    }
    
    // Se falta apenas a hora (opcional)
    if (dadosFaltantes.length === 1 && dadosFaltantes[0] === 'hora de nascimento (opcional, formato HH:MM)') {
        return `✨ **Excelente!** Tenho todos os dados essenciais. Para calcular seu **ascendente com mais precisão**, você poderia informar sua **hora de nascimento**? Se não souber, posso fazer o mapa astral mesmo assim.`;
    }
    
    // Mensagem genérica para múltiplos dados faltantes
    if (dadosFaltantes.length > 0) {
        const listaFaltantes = dadosFaltantes.map(d => {
            if (d.includes('nome completo')) return '**nome completo**';
            if (d.includes('data de nascimento')) return '**data de nascimento** (DD/MM/AAAA)';
            if (d.includes('hora de nascimento')) return '**hora de nascimento** (opcional)';
            if (d.includes('cidade de nascimento')) return '**cidade de nascimento**';
            return d;
        }).join(', ');
        
        return `✨ Para seu mapa astral completo, **está faltando**: ${listaFaltantes}. Pode me fornecer essas informações?`;
    }
    
    // Mensagem padrão
    return "Perfeito! Para seu mapa astral completo, preciso do seu **nome completo**, **data de nascimento** (formato DD/MM/AAAA), **hora de nascimento** (se souber) e **cidade de nascimento**. Pode me informar? ✨";
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
            
            // ✅ VERIFICA SE JÁ GEROU RELATÓRIO RECENTEMENTE
            if (jaGerouRelatorioRecentemente(historicoCompleto, 'numerologia')) {
                console.log('📝 Já gerou relatório de numerologia recentemente - usando IA geral');
            } else {
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
        }

        // ======================
        // 🌟 FLUXO MAPA ASTRAL - CÁLCULOS REAIS
        // ======================
        if (servicoParaUsar === 'mapa_astral') {
            console.log('🎯 Iniciando fluxo de mapa astral...');
            
            // ✅ VERIFICA SE JÁ GEROU RELATÓRIO RECENTEMENTE
            if (jaGerouRelatorioRecentemente(historicoCompleto, 'mapa_astral')) {
                console.log('📝 Já gerou relatório de mapa astral recentemente - usando IA geral');
            } else {
                // Verifica se já temos dados no histórico
                const dadosUsuario = verificarDadosMapaAstralNoHistorico(historicoCompleto);
                
                // ✅ VERIFICA DADOS FALTANTES
                const dadosFaltantes = verificarDadosFaltantesMapaAstral(dadosUsuario);
                
                if (dadosFaltantes.length === 0) {
                    // ✅ TEMOS TODOS OS DADOS - GERA RELATÓRIO
                    console.log(`📊 Dados completos: ${dadosUsuario.nome}, ${dadosUsuario.data}, ${dadosUsuario.hora}, ${dadosUsuario.local}`);
                    
                    const relatorio = gerarRelatorioMapaAstral(dadosUsuario.nome, dadosUsuario.data, dadosUsuario.hora, dadosUsuario.local);
                    
                    if (relatorio.sucesso) {
                        console.log('✅ Relatório de mapa astral gerado com sucesso!');
                        return relatorio.relatorio;
                    } else {
                        console.error('❌ Erro no relatório:', relatorio.erro);
                        return "Encontrei seus dados, mas tive um problema técnico nos cálculos astrológicos.";
                    }
                } else {
                    // ✅ USA MENSAGEM ESPECÍFICA PARA DADOS FALTANTES
                    console.log(`📝 Dados faltantes: ${dadosFaltantes.join(', ')}`);
                    return gerarMensagemDadosFaltantes(dadosFaltantes, dadosUsuario);
                }
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