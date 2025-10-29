const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

import { gerarRelatorioNumerologico } from './numerology.js';
import { gerarRelatorioMapaAstral } from './astrology.js';

// ======================
// 🏗️  SISTEMA DE ESTADO ROBUSTO
// ======================

class EstadoUsuario {
    constructor() {
        this.servicoEscolhido = null;
        this.pagamentoConfirmado = false;
        this.aguardandoComprovante = false;
        this.dadosColetados = {};
        this.etapaAtual = 'inicio';
        this.timestampUltimaInteracao = Date.now();
    }
}

class GerenciadorEstado {
    constructor() {
        this.estados = new Map();
        this.cacheRelatorios = new Map();
        this.TEMPO_EXPIRACAO = 2 * 60 * 60 * 1000; // 2 horas
    }

    obterEstado(userId) {
        this.limparExpirados();
        
        if (!this.estados.has(userId)) {
            this.estados.set(userId, new EstadoUsuario());
        }
        return this.estados.get(userId);
    }

    atualizarEstado(userId, updates) {
        const estado = this.obterEstado(userId);
        Object.assign(estado, updates, {
            timestampUltimaInteracao: Date.now()
        });
        return estado;
    }

    limparExpirados() {
        const agora = Date.now();
        for (const [userId, estado] of this.estados.entries()) {
            if (agora - estado.timestampUltimaInteracao > this.TEMPO_EXPIRACAO) {
                this.estados.delete(userId);
            }
        }
    }

    resetarUsuario(userId) {
        this.estados.delete(userId);
    }
}

// ======================
// 📋 CONFIGURAÇÕES
// ======================

const SERVICOS = {
    1: { 
        nome: '🌀 Leitura de Mapa Astral', 
        valor: 29, 
        tipo: 'mapa_astral',
        descricao: 'Análise completa do seu mapa astral com signos, casas e aspectos planetários'
    },
    2: { 
        nome: '🔢 Numerologia', 
        valor: 24, 
        tipo: 'numerologia',
        descricao: 'Estudo dos números do seu nome e data de nascimento'
    },
    3: { 
        nome: '🔮 Três Perguntas (Tarot)', 
        valor: 10, 
        tipo: 'tarot',
        descricao: 'Três perguntas respondidas através das cartas do tarot'
    },
    4: { 
        nome: '🔮 Sete Perguntas (Tarot)', 
        valor: 20, 
        tipo: 'tarot',
        descricao: 'Sete perguntas respondidas através das cartas do tarot'
    }
};

const PIX_CHAVE = '48999171910';

// ======================
// 🧠 SISTEMA PRINCIPAL
// ======================

const gerenciadorEstado = new GerenciadorEstado();

// ✅ PERSONALIDADE OTIMIZADA
const SARAH_PERSONALITY = `Você é Sarah Kali, cartomante espiritual com 15+ anos de experiência.

SEU PAPEL CRÍTICO:
- Você é o SISTEMA DE ATENDIMENTO da Sarah Kali
- SEMPRE mantenha o contexto da conversa
- NUNCA reinicie o fluxo sem motivo
- Siga EXATAMENTE o fluxo comercial estabelecido

FLUXO COMERCIAL IMUTÁVEL:
1. INÍCIO → Oferecer serviços
2. ESCOLHA → Confirmar serviço e mostrar PIX
3. PAGAMENTO → Aguardar comprovante REAL (arquivo)
4. CONFIRMAÇÃO → Processar serviço escolhido
5. ATENDIMENTO → Entregar serviço contratado

REGRA DE OURO: Contexto é sagrado. Nunca esqueça onde o usuário parou.`;

// ======================
// 🗣️  SISTEMA DE MENSAGENS
// ======================

const Mensagens = {
    boasVindas: () => `✨ **Sarah Kali - Cartomancia & Astrologia** 💫

**Atendimento Imediato • Sem Fila de Espera**

Como posso illuminar seu caminho hoje? 🌟

1. 🌀 **Leitura de Mapa Astral** - R$29,00
   *Análise completa do seu mapa astral*

2. 🔢 **Numerologia** - R$24,00  
   *Estudo dos números da sua vida*

3. 🔮 **Três Perguntas (Tarot)** - R$10,00
   *Três perguntas respondidas*

4. 🔮 **Sete Perguntas (Tarot)** - R$20,00
   *Sete perguntas respondidas*

**Digite o número da opção desejada**`,

    confirmacaoServico: (servico) => `💫 **Excelente escolha!** Você selecionou:

**${servico.nome}**
${servico.descricao}

💰 **Valor: R$${servico.valor},00**

📱 **PAGAMENTO VIA PIX**

**Chave Pix:** \`${PIX_CHAVE}\`
**Nome:** Sarah Kali  
**Valor:** R$${servico.valor},00

💎 **Após o pagamento, envie o COMPROVANTE aqui mesmo**
(pode ser print, imagem ou documento)

✨ **Estamos aguardando para começar sua consulta...**`,

    lembretePagamento: (servico) => `💫 **Lembrete do Pagamento**

Você escolheu: **${servico.nome}**
**Valor:** R$${servico.valor},00

📱 **Chave Pix:** \`${PIX_CHAVE}\`

💎 **Envie o comprovante** para liberarmos seu atendimento!`,

    pedirComprovanteReal: (servico) => `📄 **Entendi que você realizou o pagamento!**

Para confirmar o **${servico.nome}**, preciso que **envie o arquivo do comprovante**:

💎 **Clique no clip 📎 e envie:**
• Print da transferência PIX
• Captura de tela do comprovante
• Imagem ou PDF do recibo

**Chave Pix:** \`${PIX_CHAVE}\`
**Valor:** R$${servico.valor},00

Assim que receber o arquivo, iniciaremos imediatamente! ✨`,

    confirmacaoPagamento: (servico) => {
        const mensagens = {
            'mapa_astral': `🌈 **Pagamento confirmado! Agora vamos criar seu Mapa Astral completo!**

Por favor, me informe:
• **Nome completo**
• **Data de nascimento** (DD/MM/AAAA)  
• **Hora de nascimento** (se souber)
• **Cidade onde nasceu**

Vamos desvendar os mistérios do seu universo! 💫`,

            'numerologia': `🔢 **Pagamento confirmado! Vamos fazer sua Análise Numerológica!**

Preciso do seu:
• **Nome completo**  
• **Data de nascimento** (DD/MM/AAAA)

Vamos descobrir a magia dos seus números! ✨`,

            'tarot': `🔮 **Pagamento confirmado! As cartas estão esperando por você!**

Pode fazer suas perguntas! Estou pronta para guiá-lo através da sabedoria do tarot.`
        };
        
        return mensagens[servico.tipo] || `✨ **Pagamento confirmado!** Vamos começar seu atendimento...`;
    },

    servicoNaoEscolhido: () => `💫 **Vamos começar!**

Para iniciarmos, escolha um dos nossos serviços:

1. 🌀 Leitura de Mapa Astral - R$29,00
2. 🔢 Numerologia - R$24,00  
3. 🔮 Três Perguntas (Tarot) - R$10,00
4. 🔮 Sete Perguntas (Tarot) - R$20,00

**Digite o número da opção desejada**`
};

// ======================
// 🔍 SISTEMA DE DETECÇÃO
// ======================

class Detector {
    static servico(mensagem) {
        const texto = mensagem.toLowerCase().trim();
        
        // Detecção por número
        if (texto === '1') return SERVICOS[1];
        if (texto === '2') return SERVICOS[2];
        if (texto === '3') return SERVICOS[3];
        if (texto === '4') return SERVICOS[4];
        
        // Detecção por texto
        if (texto.includes('mapa astral') || texto.includes('astral')) return SERVICOS[1];
        if (texto.includes('numerologia')) return SERVICOS[2];
        if (texto.includes('três perguntas') || texto.includes('3 perguntas')) return SERVICOS[3];
        if (texto.includes('sete perguntas') || texto.includes('7 perguntas')) return SERVICOS[4];
        
        return null;
    }

    static comprovante(mensagem) {
        const texto = mensagem.toLowerCase();
        const indicadores = [
            'comprovante', 'paguei', 'transferência', 'transferi', 'pagamento', 
            'feito', 'pronto', 'enviado', 'mandei', 'feito o pagamento', 'enviei',
            'pix', 'comprovar', 'recibo', 'print', 'imagem', 'foto', 'comprovei',
            'já enviei', 'acabei de enviar', 'mandei agora', 'transferência feita',
            'pagamento realizado', 'já paguei', 'paguei agora'
        ];
        
        return indicadores.some(indicador => texto.includes(indicador));
    }

    static inicioConversa(historico) {
        return historico.length <= 2;
    }
}

// ======================
// 🔄 PROCESSADOR DE FLUXO
// ======================

class ProcessadorFluxo {
    static processar(mensagem, historico, userId) {
        const estado = gerenciadorEstado.obterEstado(userId);
        const servicoDetectado = Detector.servico(mensagem);
        const comprovanteDetectado = Detector.comprovante(mensagem);

        console.log(`🔍 Estado: ${estado.etapaAtual}, Serviço: ${servicoDetectado?.nome}, Comprovante: ${comprovanteDetectado}`);

        // 🎯 FLUXO PRINCIPAL
        switch (estado.etapaAtual) {
            case 'inicio':
                if (servicoDetectado) {
                    return this.processarEscolhaServico(servicoDetectado, estado, userId);
                }
                return Mensagens.boasVindas();

            case 'aguardando_pagamento':
                if (comprovanteDetectado) {
                    return this.processarComprovante(estado, userId);
                }
                if (servicoDetectado) {
                    return this.processarEscolhaServico(servicoDetectado, estado, userId);
                }
                return Mensagens.lembretePagamento(estado.servicoEscolhido);

            case 'pagamento_confirmado':
                return this.processarServico(estado, historico, userId);

            default:
                return this.processarMensagemGenerica(mensagem, estado, historico, userId);
        }
    }

    static processarEscolhaServico(servico, estado, userId) {
        gerenciadorEstado.atualizarEstado(userId, {
            servicoEscolhido: servico,
            aguardandoComprovante: true,
            etapaAtual: 'aguardando_pagamento'
        });

        return Mensagens.confirmacaoServico(servico);
    }

    static processarComprovante(estado, userId) {
        if (!estado.servicoEscolhido) {
            return Mensagens.servicoNaoEscolhido();
        }

        // ✅ AQUI: Quando integrar com upload real, confirmar pagamento
        // Por enquanto, vamos confirmar automaticamente para teste
        gerenciadorEstado.atualizarEstado(userId, {
            pagamentoConfirmado: true,
            aguardandoComprovante: false,
            etapaAtual: 'pagamento_confirmado'
        });

        return Mensagens.confirmacaoPagamento(estado.servicoEscolhido);
    }

    static processarServico(estado, historico, userId) {
        const servico = estado.servicoEscolhido;
        
        if (servico.tipo === 'numerologia') {
            return this.processarNumerologia(estado, historico, userId);
        }
        
        if (servico.tipo === 'mapa_astral') {
            return this.processarMapaAstral(estado, historico, userId);
        }
        
        // Tarot - usa IA normal
        return this.processarMensagemGenerica('', estado, historico, userId);
    }

    static processarNumerologia(estado, historico, userId) {
        const dados = this.extrairDadosNumerologia(historico);
        
        if (dados.nome && dados.data) {
            const relatorio = gerarRelatorioNumerologico(dados.nome, dados.data);
            if (relatorio.sucesso) {
                gerenciadorEstado.resetarUsuario(userId);
                return relatorio.relatorio;
            }
            return "Erro nos cálculos numerológicos. Verifique os dados.";
        }
        
        return `🔢 **Vamos fazer sua Numerologia!**

Preciso dos seguintes dados:
• **Nome completo**
• **Data de nascimento** (formato DD/MM/AAAA)

Por exemplo: "Maria Silva, 15/03/1990"`;
    }

    static processarMapaAstral(estado, historico, userId) {
        const dados = this.extrairDadosMapaAstral(historico);
        const faltantes = this.verificarDadosFaltantesMapaAstral(dados);
        
        if (faltantes.length === 0) {
            const relatorio = gerarRelatorioMapaAstral(dados.nome, dados.data, dados.hora, dados.local);
            if (relatorio.sucesso) {
                gerenciadorEstado.resetarUsuario(userId);
                return relatorio.relatorio;
            }
            return "Erro nos cálculos astrológicos.";
        }
        
        return this.mensagemDadosFaltantesMapaAstral(faltantes, dados);
    }

    static processarMensagemGenerica(mensagem, estado, historico, userId) {
        // Se chegou aqui, usa a IA Groq para resposta natural
        const mensagensCompletas = [
            {
                role: "system",
                content: SARAH_PERSONALITY
            },
            ...historico.map(msg => ({
                role: msg.role,
                content: msg.content
            }))
        ];

        return this.chamarGroqAPI(mensagensCompletas);
    }

    // ======================
    // 🛠️  MÉTODOS AUXILIARES
    // ======================

    static async chamarGroqAPI(mensagensCompletas) {
        const modelos = ["llama-3.1-8b-instant", "mixtral-8x7b-32768"];
        
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
                    return this.otimizarResposta(data.choices[0].message.content.trim());
                }
            } catch (error) {
                continue;
            }
        }
        
        return "Desculpe, estou com dificuldades técnicas. Podemos continuar pelo WhatsApp?";
    }

    static otimizarResposta(resposta) {
        if (!resposta || resposta.length < 10) {
            return "Como posso ajudá-lo em sua jornada espiritual hoje? ✨";
        }
        
        // Limpeza básica
        return resposta
            .replace(/([✨🔮💫🌙⭐🙏]){3,}/g, '$1')
            .replace(/^[.,]\s*/, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    static extrairDadosNumerologia(historico) {
        // Implementação existente
        const ultimasMensagens = historico.slice(-6);
        for (let i = ultimasMensagens.length - 1; i >= 0; i--) {
            const msg = ultimasMensagens[i];
            if (msg.role === 'user') {
                const dados = this.extrairNomeEData(msg.content);
                if (dados) return dados;
            }
        }
        return { nome: '', data: '' };
    }

    static extrairDadosMapaAstral(historico) {
        // Implementação existente  
        const ultimasMensagens = historico.slice(-8);
        let nome = '', data = '', hora = null, local = null;
        
        for (let i = ultimasMensagens.length - 1; i >= 0; i--) {
            const msg = ultimasMensagens[i];
            if (msg.role === 'user') {
                // Lógica de extração existente
                const texto = msg.content.toLowerCase();
                const dataMatch = texto.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
                // ... continuar implementação
            }
        }
        
        return { nome, data, hora, local };
    }

    static verificarDadosFaltantesMapaAstral(dados) {
        const faltantes = [];
        if (!dados.nome || dados.nome.length < 3) faltantes.push('nome completo');
        if (!dados.data) faltantes.push('data de nascimento');
        if (!dados.local) faltantes.push('cidade de nascimento');
        return faltantes;
    }

    static mensagemDadosFaltantesMapaAstral(faltantes, dadosColetados) {
        if (faltantes.includes('nome completo') && dadosColetados.data) {
            return `✨ **Perfeito!** Tenho sua data de nascimento (${dadosColetados.data}). **Está faltando apenas seu nome completo**. Pode me informar?`;
        }
        
        if (faltantes.includes('data de nascimento') && dadosColetados.nome) {
            return `✨ **Obrigada, ${dadosColetados.nome}!** **Está faltando sua data de nascimento** (DD/MM/AAAA). Pode me informar?`;
        }
        
        return `✨ Para seu mapa astral completo, preciso do seu: ${faltantes.join(', ')}.`;
    }

    static extrairNomeEData(mensagem) {
        // Implementação existente
        const dataRegex = /(\d{1,2})\/(\d{1,2})\/(\d{4})/;
        const matchData = mensagem.match(dataRegex);
        
        if (!matchData) return null;
        
        const data = matchData[0];
        let nome = mensagem.replace(dataRegex, '').replace(/[,\-]/g, '').trim();
        nome = nome.replace(/^(ok|sim|claro),?\s*/i, '').replace(/\s+/g, ' ').trim();
        
        return nome.length >= 2 ? { nome, data } : null;
    }

    static validarData(data) {
        const regex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
        const match = data.match(regex);
        if (!match) return false;
        
        const [_, dia, mes, ano] = match.map(Number);
        if (mes < 1 || mes > 12 || dia < 1 || dia > 31) return false;
        
        // Validações de data específicas
        if ([4, 6, 9, 11].includes(mes) && dia > 30) return false;
        if (mes === 2) {
            const isBissexto = (ano % 4 === 0 && ano % 100 !== 0) || (ano % 400 === 0);
            if (dia > (isBissexto ? 29 : 28)) return false;
        }
        
        return true;
    }
}

// ======================
// 🚀 FUNÇÃO PRINCIPAL EXPORTADA
// ======================

export async function getOpenAIResponse(messages, userId = 'default') {
    try {
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return Mensagens.boasVindas();
        }

        const lastMessage = messages[messages.length - 1]?.content || '';
        const historicoCompleto = messages;

        if (!lastMessage.trim()) {
            return "Como posso ajudá-lo em sua jornada espiritual hoje? ✨";
        }

        // ✅ VERIFICAR INÍCIO DE CONVERSA
        if (Detector.inicioConversa(historicoCompleto)) {
            return Mensagens.boasVindas();
        }

        // ✅ PROCESSAR COM O SISTEMA NOVO
        const resposta = await ProcessadorFluxo.processar(lastMessage, historicoCompleto, userId);
        
        console.log(`✅ Resposta gerada para ${userId}: ${resposta.substring(0, 100)}...`);
        return resposta;

    } catch (error) {
        console.error('❌ Erro no processamento:', error);
        return "Desculpe, estou realinhando minhas energias cósmicas. Pode tentar novamente? ✨";
    }
}

// Export para compatibilidade
export { getOpenAIResponse as getGeminiResponse };