const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

// ✅ IMPORTE DO SISTEMA DE NUMEROLOGIA
import { gerarRelatorioNumerologico } from './numerology.js';
// ✅ IMPORTE DO SISTEMA DE MAPA ASTRAL
import { gerarRelatorioMapaAstral } from './astrology.js';

// Personalidade da Sarah Kali - Versão Comercial
const SARAH_PERSONALITY = `Você é Sarah Kali, uma cartomante espiritual com mais de 15 anos de experiência em tarot, astrologia e numerologia.

SUA PERSONALIDADE:
- Fala de forma natural, direta e acolhedora
- É prática e focada em ajudar
- Usa emojis com moderação (1-2 por resposta)
- Mantém conversas fluidas e contextualizadas

SISTEMA DE VENDAS - FLUXO CRÍTICO:
1. SEMPRE comece com a mensagem de boas-vindas padrão oferecendo os serviços
2. Quando o usuário escolher um serviço, informe imediatamente o valor e chave PIX
3. PEÇA explicitamente o comprovante de pagamento
4. Só prossiga com o serviço após confirmação do pagamento
5. Seja clara e direta sobre o processo comercial

NUNCA:
- Pule a etapa de pagamento
- Ofereça serviços gratuitos
- Seja vaga sobre valores e processo
- Prossiga sem confirmação de pagamento

SEJA:
- Profissional e clara
- Acolhedora mas objetiva
- Direta sobre valores e processo
- Agradecida pelos pagamentos`;

// ✅ SERVIÇOS E VALORES
const SERVICOS = {
    1: { nome: '🌀 Leitura de Mapa Astral', valor: 29, tipo: 'mapa_astral' },
    2: { nome: '🔢 Numerologia', valor: 24, tipo: 'numerologia' },
    3: { nome: '🔮 Três Perguntas (Tarot)', valor: 10, tipo: 'tarot' },
    4: { nome: '🔮 Sete Perguntas (Tarot)', valor: 20, tipo: 'tarot' }
};

// ✅ CHAVE PIX
const PIX_CHAVE = '48999171910';

// ✅ Sistema de Cache para Relatórios
const relatorioCache = new Map();
const pagamentosConfirmados = new Map();

function gerarChaveCache(servico, dados) {
    return `${servico}_${JSON.stringify(dados)}`;
}

function verificarCache(servico, dados) {
    const chave = gerarChaveCache(servico, dados);
    const cached = relatorioCache.get(chave);
    
    if (cached && Date.now() < cached.expiraEm) {
        return cached.relatorio;
    }
    
    if (cached) {
        relatorioCache.delete(chave);
    }
    
    return null;
}

function adicionarCache(servico, dados, relatorio) {
    const chave = gerarChaveCache(servico, dados);
    relatorioCache.set(chave, {
        relatorio,
        timestamp: Date.now(),
        expiraEm: Date.now() + (30 * 60 * 1000)
    });
}

/**
 * ✅ Verificar se pagamento foi confirmado para um usuário
 */
function verificarPagamentoConfirmado(userId) {
    return pagamentosConfirmados.get(userId);
}

/**
 * ✅ Confirmar pagamento para um usuário
 */
function confirmarPagamento(userId, servico) {
    pagamentosConfirmados.set(userId, {
        servico: servico.tipo,
        timestamp: Date.now(),
        expiraEm: Date.now() + (2 * 60 * 60 * 1000) // 2 horas para usar o serviço
    });
}

/**
 * ✅ MENSAGEM DE BOAS-VINDAS PADRÃO
 */
function getMensagemBoasVindas() {
    return `✨ **Sarah Kali - Cartomancia & Astrologia agradece o seu contato!** 💫

Estamos prontos para iluminar seu caminho com a sabedoria do tarot. 🔮

**ATENDIMENTO IMEDIATO, SEM FILA DE ESPERA!**

Como podemos ajudar a transformar seu dia hoje? 🌟

1. 🌀 Leitura de Mapa Astral por R$29
2. 🔢 Numerologia por R$24  
3. 🔮 Três Perguntas (Tarot) por R$10
4. 🔮 Sete Perguntas (Tarot) por R$20

**Digite o número da opção desejada**`;
}

/**
 * ✅ MENSAGEM DE PAGAMENTO PIX
 */
function getMensagemPagamento(servicoEscolhido) {
    return `💫 **Perfeita escolha!** Você selecionou: **${servicoEscolhido.nome}**

💰 **Valor: R$${servicoEscolhido.valor},00**

📱 **PAGAMENTO VIA PIX:**

**Chave Pix:** \`${PIX_CHAVE}\`
**Nome:** Sarah Kali
**Valor:** R$${servicoEscolhido.valor},00

💎 **Após o pagamento, envie o comprovante aqui mesmo** (pode ser print, imagem ou documento) para liberarmos seu atendimento imediatamente!

✨ Estamos aguardando para começar sua consulta...`;
}

/**
 * ✅ MENSAGEM DE PAGAMENTO CONFIRMADO
 */
function getMensagemPosPagamento(servico) {
    const mensagens = {
        'mapa_astral': '🌈 **Pagamento confirmado! Agora vamos criar seu Mapa Astral completo!**\n\nPor favor, me informe:\n• **Nome completo**\n• **Data de nascimento** (DD/MM/AAAA)\n• **Hora de nascimento** (se souber)\n• **Cidade onde nasceu**',
        
        'numerologia': '🔢 **Pagamento confirmado! Vamos fazer sua Análise Numerológica!**\n\nPreciso do seu:\n• **Nome completo**\n• **Data de nascimento** (DD/MM/AAAA)',
        
        'tarot': '🔮 **Pagamento confirmado! As cartas estão esperando por você!**\n\nVamos começar sua consulta de Tarot. Pode fazer suas perguntas!'
    };
    
    return mensagens[servico] || '✨ **Pagamento confirmado!** Vamos começar seu atendimento...';
}

/**
 * Função para detectar se o usuário está pedindo um serviço específico
 */
function detectarServicoSolicitado(mensagem) {
    const mensagemLower = mensagem.toLowerCase();
    
    if (mensagemLower.includes('1') || mensagemLower.includes('mapa astral') || mensagemLower.includes('astral')) {
        return 'mapa_astral';
    }
    
    if (mensagemLower.includes('2') || mensagemLower.includes('numerologia') || mensagemLower.includes('número')) {
        return 'numerologia';
    }
    
    if (mensagemLower.includes('3') || mensagemLower.includes('4') || mensagemLower.includes('tarot') || mensagemLower.includes('perguntas')) {
        return 'tarot';
    }
    
    return 'geral';
}

/**
 * ✅ FUNÇÃO: Detectar escolha de serviço por número
 */
function detectarEscolhaServico(mensagem) {
    const mensagemLower = mensagem.toLowerCase().trim();
    
    // Verifica escolha por número
    if (mensagemLower === '1') return SERVICOS[1];
    if (mensagemLower === '2') return SERVICOS[2];
    if (mensagemLower === '3') return SERVICOS[3];
    if (mensagemLower === '4') return SERVICOS[4];
    
    // Verifica por texto
    if (mensagemLower.includes('mapa astral') || mensagemLower.includes('astral')) return SERVICOS[1];
    if (mensagemLower.includes('numerologia')) return SERVICOS[2];
    if (mensagemLower.includes('três perguntas') || mensagemLower.includes('3 perguntas')) return SERVICOS[3];
    if (mensagemLower.includes('sete perguntas') || mensagemLower.includes('7 perguntas')) return SERVICOS[4];
    
    return null;
}

/**
 * ✅ FUNÇÃO: Detectar comprovante de pagamento
 */
function detectarComprovante(mensagem) {
    const mensagemLower = mensagem.toLowerCase();
    
    // Palavras-chave que indicam envio de comprovante
    const indicadores = [
        'comprovante', 'paguei', 'transferência', 'transferi', 'pagamento', 
        'feito', 'pronto', 'enviado', 'mandei', 'feito o pagamento',
        'pix', 'comprovar', 'recibo', 'print', 'imagem', 'foto'
    ];
    
    return indicadores.some(indicador => mensagemLower.includes(indicador));
}

/**
 * ✅ FUNÇÃO: Verificar se é início de conversa
 */
function isInicioConversa(historico) {
    return historico.length <= 2;
}

/**
 * ✅ FUNÇÃO MELHORADA: Validação robusta de data
 */
function validarData(data) {
    const regex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const match = data.match(regex);
    
    if (!match) return false;
    
    const [_, dia, mes, ano] = match.map(Number);
    
    if (mes < 1 || mes > 12) return false;
    if (dia < 1 || dia > 31) return false;
    
    if ([4, 6, 9, 11].includes(mes) && dia > 30) return false;
    
    if (mes === 2) {
        const isBissexto = (ano % 4 === 0 && ano % 100 !== 0) || (ano % 400 === 0);
        if (dia > (isBissexto ? 29 : 28)) return false;
    }
    
    const dataObj = new Date(ano, mes - 1, dia);
    return dataObj.getDate() === dia && 
           dataObj.getMonth() === mes - 1 && 
           dataObj.getFullYear() === ano;
}

/**
 * ✅ FUNÇÃO MELHORADA: Extração de nome e data
 */
function extrairNomeEData(mensagem) {
    const dataRegex = /(\d{1,2})\/(\d{1,2})\/(\d{4})/g;
    const datas = [];
    let match;
    
    while ((match = dataRegex.exec(mensagem)) !== null) {
        if (validarData(match[0])) {
            datas.push(match[0]);
        }
    }
    
    if (datas.length === 0) return null;
    
    const data = datas[0];
    let nome = mensagem
        .replace(dataRegex, '')
        .replace(/[,\-\.]/g, '')
        .trim();
    
    const padroesRemover = [
        /^(ok|okay|sim|claro|tudo bem|beleza),?\s*/i,
        /^(quero|gostaria|preciso|desejo|meu|o|a)\s+/i,
        /\s*(mapa astral|numerologia|tarot|signo|zodíaco).*$/i,
        /\s*nascimento.*$/i,
        /\s*data.*$/i
    ];
    
    padroesRemover.forEach(regex => {
        nome = nome.replace(regex, '');
    });
    
    nome = nome.replace(/\s+/g, ' ').trim();
    
    return nome.length >= 2 ? { nome, data } : null;
}

/**
 * ✅ FUNÇÃO: Verificar se temos dados para numerologia no histórico
 */
function verificarDadosNumerologiaNoHistorico(historico) {
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
 * ✅ FUNÇÃO: Verificar dados para mapa astral no histórico
 */
function verificarDadosMapaAstralNoHistorico(historico) {
    const mensagensRelevantes = historico.slice(-8);
    
    let nome = '';
    let data = '';
    let hora = null;
    let local = null;
    
    for (let i = mensagensRelevantes.length - 1; i >= 0; i--) {
        const msg = mensagensRelevantes[i];
        
        if (msg.role === 'user') {
            const texto = msg.content.toLowerCase();
            
            const dataMatch = texto.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
            if (dataMatch && !data && validarData(dataMatch[0])) {
                data = dataMatch[0];
            }
            
            const horaMatch = texto.match(/(\d{1,2}):(\d{2})/);
            if (horaMatch && !hora) {
                hora = horaMatch[0];
            } else {
                const horaExtensoMatch = texto.match(/(\d{1,2})\s*(?:h|horas?)?\s*(?:da\s*(manhã|tarde|noite))/i);
                if (horaExtensoMatch && !hora) {
                    let horaNum = parseInt(horaExtensoMatch[1]);
                    const periodo = horaExtensoMatch[2].toLowerCase();
                    
                    if (periodo === 'tarde' && horaNum < 12) {
                        horaNum += 12;
                    } else if (periodo === 'noite' && horaNum < 12) {
                        horaNum += 12;
                    }
                    hora = horaNum.toString().padStart(2, '0') + ':00';
                }
            }
            
            if (dataMatch && !nome) {
                let possivelNome = msg.content.split(dataMatch[0])[0].trim();
                
                possivelNome = possivelNome.replace(/^(ok|okay|sim|claro|tudo bem|beleza),?\s*/i, '');
                possivelNome = possivelNome.replace(/^(quero|gostaria|preciso|desejo|meu|o|a)\s+/i, '');
                possivelNome = possivelNome.replace(/\s*(mapa astral|astral|signo|zodíaco|horóscopo).*$/i, '');
                
                const palavras = possivelNome.split(/\s+/);
                if (palavras.length >= 2 && possivelNome.length >= 6) {
                    nome = possivelNome;
                }
            }
            
            const locaisComuns = ['são paulo', 'rio de janeiro', 'brasília', 'salvador', 'fortaleza', 'belo horizonte', 
                                'manaus', 'curitiba', 'recife', 'porto alegre', 'são luiz', 'são luís'];
            for (const localComum of locaisComuns) {
                if (texto.includes(localComum) && !local) {
                    local = localComum;
                    break;
                }
            }
            
            if (!local) {
                const partes = msg.content.split(',');
                if (partes.length >= 4) {
                    local = partes[3].trim();
                } else if (partes.length >= 3 && !horaMatch) {
                    const possivelLocal = partes[2].trim();
                    if (possivelLocal.length > 3 && !possivelLocal.match(/\d/)) {
                        local = possivelLocal;
                    }
                }
            }
        }
    }
    
    return { nome, data, hora, local };
}

/**
 * ✅ FUNÇÃO: Verificar quais dados estão faltando
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
 * ✅ FUNÇÃO: Mensagens específicas para dados faltantes
 */
function gerarMensagemDadosFaltantes(dadosFaltantes, dadosColetados) {
    const dadosColetadosCount = Object.values(dadosColetados).filter(val => val && val.length > 0).length;
    
    if (dadosFaltantes.includes('nome completo') && dadosColetadosCount > 0) {
        const partes = [];
        if (dadosColetados.data) partes.push(`data de nascimento (${dadosColetados.data})`);
        if (dadosColetados.hora) partes.push(`hora (${dadosColetados.hora})`);
        if (dadosColetados.local) partes.push(`cidade (${dadosColetados.local})`);
        
        return `✨ **Perfeito!** Tenho sua ${partes.join(', ')}. Para personalizar seu mapa astral, **está faltando apenas seu nome completo**. Pode me informar?`;
    }
    
    if (dadosFaltantes.includes('data de nascimento (DD/MM/AAAA)') && dadosColetados.nome) {
        return `✨ **Obrigada, ${dadosColetados.nome}!** Para calcular seu mapa astral, **está faltando sua data de nascimento** no formato DD/MM/AAAA. Pode me informar?`;
    }
    
    if (dadosFaltantes.includes('cidade de nascimento') && dadosColetadosCount >= 2) {
        const partes = [];
        if (dadosColetados.nome) partes.push(`nome (${dadosColetados.nome})`);
        if (dadosColetados.data) partes.push(`data (${dadosColetados.data})`);
        if (dadosColetados.hora) partes.push(`hora (${dadosColetados.hora})`);
        
        return `✨ **Quase lá!** Tenho seus dados: ${partes.join(', ')}. **Está faltando apenas a cidade onde você nasceu**. Pode me informar?`;
    }
    
    if (dadosFaltantes.length === 1 && dadosFaltantes[0] === 'hora de nascimento (opcional, formato HH:MM)') {
        return `✨ **Excelente!** Tenho todos os dados essenciais. Para calcular seu **ascendente com mais precisão**, você poderia informar sua **hora de nascimento**? Se não souber, posso fazer o mapa astral mesmo assim.`;
    }
    
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
    
    return "Perfeito! Para seu mapa astral completo, preciso do seu **nome completo**, **data de nascimento** (formato DD/MM/AAAA), **hora de nascimento** (se souber) e **cidade de nascimento**. Pode me informar? ✨";
}

/**
 * ✅ NOVA FUNÇÃO: Chamada robusta para Groq API com fallback
 */
async function chamarGroqAPI(mensagensCompletas) {
    const modelos = [
        "llama-3.1-8b-instant",
        "mixtral-8x7b-32768",
        "gemma-7b-it"
    ];
    
    for (const modelo of modelos) {
        try {
            const response = await fetch(GROQ_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: modelo,
                    messages: mensagensCompletas,
                    temperature: 0.7,
                    max_tokens: 1024,
                    top_p: 0.9,
                    stream: false,
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                return data.choices[0].message.content.trim();
            }
        } catch (error) {
            continue;
        }
    }
    
    throw new Error('Todos os modelos falharam');
}

export async function getOpenAIResponse(messages, userId = 'default') {
    console.log('🔮 Sarah Kali - Processando mensagem...');
    
    if (!GROQ_API_KEY) {
        console.error('❌ GROQ_API_KEY não encontrada');
        return "Estou com problemas de conexão no momento. Por favor, tente novamente mais tarde.";
    }

    try {
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return getMensagemBoasVindas();
        }

        const lastMessage = messages[messages.length - 1]?.content || '';
        const historicoCompleto = messages;

        if (!lastMessage.trim()) {
            return getMensagemBoasVindas();
        }

        console.log(`📨 Mensagem: "${lastMessage.substring(0, 100)}..."`);
        console.log(`📊 Histórico: ${historicoCompleto.length} mensagens`);
        console.log(`👤 User ID: ${userId}`);

        // ✅ VERIFICAR SE É INÍCIO DE CONVERSA
        if (isInicioConversa(historicoCompleto)) {
            return getMensagemBoasVindas();
        }

        // ✅ VERIFICAR SE HÁ PAGAMENTO CONFIRMADO
        const pagamentoConfirmado = verificarPagamentoConfirmado(userId);
        
        // ✅ DETECTAR ESCOLHA DE SERVIÇO
        const servicoEscolhido = detectarEscolhaServico(lastMessage);
        
        if (servicoEscolhido && !pagamentoConfirmado) {
            console.log(`💰 Serviço escolhido: ${servicoEscolhido.nome}`);
            return getMensagemPagamento(servicoEscolhido);
        }

        // ✅ DETECTAR COMPROVANTE DE PAGAMENTO
        if (detectarComprovante(lastMessage) && !pagamentoConfirmado) {
            // Aqui você normalmente validaria o comprovante
            // Por enquanto, assumimos que o usuário enviou o comprovante
            const servicoAnterior = detectarEscolhaServico(historicoCompleto[historicoCompleto.length - 2]?.content || '');
            
            if (servicoAnterior) {
                confirmarPagamento(userId, servicoAnterior);
                console.log(`✅ Pagamento confirmado para: ${servicoAnterior.nome}`);
                return getMensagemPosPagamento(servicoAnterior.tipo);
            }
        }

        // ✅ SE PAGAMENTO CONFIRMADO, PROCESSAR SERVIÇO
        if (pagamentoConfirmado) {
            const servicoTipo = pagamentoConfirmado.servico;
            
            // 🔢 NUMEROLOGIA
            if (servicoTipo === 'numerologia') {
                const dadosUsuario = verificarDadosNumerologiaNoHistorico(historicoCompleto);
                
                if (dadosUsuario) {
                    const cached = verificarCache('numerologia', dadosUsuario);
                    if (cached) {
                        return cached;
                    }
                    
                    const relatorio = gerarRelatorioNumerologico(dadosUsuario.nome, dadosUsuario.data);
                    
                    if (relatorio.sucesso) {
                        adicionarCache('numerologia', dadosUsuario, relatorio.relatorio);
                        return relatorio.relatorio;
                    } else {
                        return "Encontrei seus dados, mas tive um problema técnico nos cálculos. Pode verificar se a data está no formato DD/MM/AAAA?";
                    }
                } else {
                    return "Para sua análise numerológica, preciso do seu **nome completo** e **data de nascimento** (formato DD/MM/AAAA). Pode me informar?";
                }
            }
            
            // 🌟 MAPA ASTRAL
            if (servicoTipo === 'mapa_astral') {
                const dadosUsuario = verificarDadosMapaAstralNoHistorico(historicoCompleto);
                const dadosFaltantes = verificarDadosFaltantesMapaAstral(dadosUsuario);
                
                if (dadosFaltantes.length === 0) {
                    const cached = verificarCache('mapa_astral', dadosUsuario);
                    if (cached) {
                        return cached;
                    }
                    
                    const relatorio = gerarRelatorioMapaAstral(dadosUsuario.nome, dadosUsuario.data, dadosUsuario.hora, dadosUsuario.local);
                    
                    if (relatorio.sucesso) {
                        adicionarCache('mapa_astral', dadosUsuario, relatorio.relatorio);
                        return relatorio.relatorio;
                    } else {
                        return "Encontrei seus dados, mas tive um problema técnico nos cálculos astrológicos.";
                    }
                } else {
                    return gerarMensagemDadosFaltantes(dadosFaltantes, dadosUsuario);
                }
            }
            
            // 🔮 TAROT - Usa IA normal
            if (servicoTipo === 'tarot') {
                // Continua com o fluxo normal da IA para tarot
            }
        }

        // ✅ SE NÃO HÁ PAGAMENTO, LEMBRAR DO PROCESSO
        if (!pagamentoConfirmado && !servicoEscolhido && !detectarComprovante(lastMessage)) {
            return `💫 **Sarah Kali - Cartomancia & Astrologia** 🔮

Para começarmos seu atendimento, preciso que escolha um dos nossos serviços:

1. 🌀 Leitura de Mapa Astral por R$29
2. 🔢 Numerologia por R$24  
3. 🔮 Três Perguntas (Tarot) por R$10
4. 🔮 Sete Perguntas (Tarot) por R$20

**Digite o número da opção desejada**`;
        }

        // ✅ FLUXO NORMAL DA IA PARA TAROT OU CONVERSA GERAL
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

        const resposta = await chamarGroqAPI(mensagensCompletas);
        const respostaOtimizada = otimizarResposta(resposta);

        console.log(`✅ Resposta: ${respostaOtimizada.substring(0, 100)}...`);

        return respostaOtimizada;

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
    if (!resposta) return getMensagemBoasVindas();
    
    resposta = resposta.replace(/^(Olá, (querido|querida|amigo|amiga|alma|viajante).+?\..+?\.)/i, '');
    resposta = resposta.replace(/([✨🔮💫🌙⭐🙏]){3,}/g, '$1');
    resposta = resposta.replace(/^[.,]\s*/, '');
    
    if (resposta.length < 10) {
        return getMensagemBoasVindas();
    }
    
    resposta = resposta.replace(/\s+/g, ' ').trim();
    
    return resposta;
}

// Exportação para compatibilidade
export { getOpenAIResponse as getGeminiResponse };