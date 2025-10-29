// api/astrology.js - Sistema Completo de Mapa Astral (ATUALIZADO)

// ======================
// 🌟 DADOS DOS SIGNOS
// ======================
const SIGNOS_SOLARES = [
    { signo: 'Áries', dataInicio: '21/03', dataFim: '19/04', elemento: 'Fogo', regente: 'Marte' },
    { signo: 'Touro', dataInicio: '20/04', dataFim: '20/05', elemento: 'Terra', regente: 'Vênus' },
    { signo: 'Gêmeos', dataInicio: '21/05', dataFim: '20/06', elemento: 'Ar', regente: 'Mercúrio' },
    { signo: 'Câncer', dataInicio: '21/06', dataFim: '22/07', elemento: 'Água', regente: 'Lua' },
    { signo: 'Leão', dataInicio: '23/07', dataFim: '22/08', elemento: 'Fogo', regente: 'Sol' },
    { signo: 'Virgem', dataInicio: '23/08', dataFim: '22/09', elemento: 'Terra', regente: 'Mercúrio' },
    { signo: 'Libra', dataInicio: '23/09', dataFim: '22/10', elemento: 'Ar', regente: 'Vênus' },
    { signo: 'Escorpião', dataInicio: '23/10', dataFim: '21/11', elemento: 'Água', regente: 'Plutão' },
    { signo: 'Sagitário', dataInicio: '22/11', dataFim: '21/12', elemento: 'Fogo', regente: 'Júpiter' },
    { signo: 'Capricórnio', dataInicio: '22/12', dataFim: '19/01', elemento: 'Terra', regente: 'Saturno' },
    { signo: 'Aquário', dataInicio: '20/01', dataFim: '18/02', elemento: 'Ar', regente: 'Urano' },
    { signo: 'Peixes', dataInicio: '19/02', dataFim: '20/03', elemento: 'Água', regente: 'Netuno' }
];

// ======================
// 🪐 DADOS DOS PLANETAS
// ======================
const PLANETAS_INFO = {
    sol: { simbolo: '☀️', significado: 'Ego, essência, identidade' },
    lua: { simbolo: '🌙', significado: 'Emoções, instintos, subconsciente' },
    mercurio: { simbolo: '☿', significado: 'Comunicação, intelecto, lógica' },
    venus: { simbolo: '♀', significado: 'Amor, beleza, valores, harmonia' },
    marte: { simbolo: '♂', significado: 'Ação, energia, desejo, coragem' },
    jupiter: { simbolo: '♃', significado: 'Expansão, sorte, crescimento' },
    saturno: { simbolo: '♄', significado: 'Limites, disciplina, responsabilidade' },
    urano: { simbolo: '♅', significado: 'Mudança, originalidade, revolução' },
    netuno: { simbolo: '♆', significado: 'Intuição, sonhos, espiritualidade' },
    plutao: { simbolo: '♇', significado: 'Transformação, poder, renascimento' }
};

// ======================
// 🔢 FUNÇÕES DE CÁLCULO
// ======================

/**
 * Calcula o Signo Solar baseado na data de nascimento
 */
export function calcularSignoSolar(dataNascimento) {
    const [dia, mes] = dataNascimento.split('/').map(Number);
    
    for (let signo of SIGNOS_SOLARES) {
        const [inicioDia, inicioMes] = signo.dataInicio.split('/').map(Number);
        const [fimDia, fimMes] = signo.dataFim.split('/').map(Number);
        
        if ((mes === inicioMes && dia >= inicioDia) || 
            (mes === fimMes && dia <= fimDia) ||
            (mes > inicioMes && mes < fimMes)) {
            return signo;
        }
    }
    
    // Caso especial para Capricórnio (dezembro/janeiro)
    return SIGNOS_SOLARES[9]; // Capricórnio
}

/**
 * Calcula o Signo Lunar (aproximação simplificada)
 */
export function calcularSignoLunar(dataNascimento) {
    const [dia, mes, ano] = dataNascimento.split('/').map(Number);
    
    // Fórmula simplificada baseada no ciclo lunar aproximado
    const cicloLunar = 29.53; // dias
    const dataRef = new Date(2000, 0, 1); // 01/01/2000 - Lua Nova
    const dataNasc = new Date(ano, mes - 1, dia);
    
    const diffDias = Math.floor((dataNasc - dataRef) / (1000 * 60 * 60 * 24));
    const idadeLunar = (diffDias % cicloLunar) / cicloLunar;
    
    const signosLunares = [...SIGNOS_SOLARES];
    const indiceLunar = Math.floor(idadeLunar * 12);
    
    return signosLunares[indiceLunar];
}

/**
 * ✅ FUNÇÃO MELHORADA: Cálculo de ascendente com mais variáveis
 */
export function calcularAscendente(signoSolar, horaNascimento, localNascimento) {
    if (!horaNascimento || !localNascimento) return null;
    
    const [hora, minuto] = horaNascimento.split(':').map(Number);
    const signos = [...SIGNOS_SOLARES];
    const indiceSolar = signos.findIndex(s => s.signo === signoSolar.signo);
    
    // Fórmula melhorada considerando minutos e localização aproximada
    const horaDecimal = hora + (minuto / 60);
    
    // Ajuste baseado na latitude (simplificado para Brasil)
    const ajusteLatitude = localNascimento.toLowerCase().includes('norte') ? 1 : 
                          localNascimento.toLowerCase().includes('sul') ? -1 : 0;
    
    const velocidadeAscendente = 2 + (ajusteLatitude * 0.5); // graus por hora
    const indiceAscendente = (indiceSolar + Math.floor(horaDecimal / velocidadeAscendente)) % 12;
    
    return signos[indiceAscendente];
}

/**
 * Calcula as Casas Astrológicas (simplificado)
 */
export function calcularCasasAstrologicas(ascendente) {
    if (!ascendente) return [];
    
    const casas = [];
    const signos = [...SIGNOS_SOLARES];
    const indiceAsc = signos.findIndex(s => s.signo === ascendente.signo);
    
    for (let i = 0; i < 12; i++) {
        const indiceCasa = (indiceAsc + i) % 12;
        casas.push({
            casa: i + 1,
            signo: signos[indiceCasa].signo,
            significado: obterSignificadoCasa(i + 1)
        });
    }
    
    return casas;
}

// ======================
// 📖 BANCO DE INTERPRETAÇÕES
// ======================

function obterSignificadoCasa(numeroCasa) {
    const significados = {
        1: 'Personalidade, aparência, ego',
        2: 'Valores, recursos, autoestima',
        3: 'Comunicação, irmãos, estudos',
        4: 'Família, raízes, lar',
        5: 'Criatividade, amor, filhos',
        6: 'Trabalho, saúde, rotina',
        7: 'Parcerias, relacionamentos',
        8: 'Transformação, sexualidade, herança',
        9: 'Filosofia, viagens, expansão',
        10: 'Carreira, ambição, reputação',
        11: 'Amigos, grupos, esperanças',
        12: 'Subconsciente, espiritualidade, isolamento'
    };
    return significados[numeroCasa] || 'Casa não definida';
}

function obterInterpretacaoSigno(signo) {
    const interpretacoes = {
        'Áries': 'Você é pioneiro, corajoso e cheio de energia. Sua espontaneidade e iniciativa são marcas registradas. Cuidado com a impaciência.',
        'Touro': 'Você é estável, prático e sensorial. Valoriza segurança e conforto. Sua perseverança é admirável, mas pode levar à teimosia.',
        'Gêmeos': 'Você é comunicativo, curioso e versátil. Sua mente está sempre ativa. Cuidado com a dispersão e superficialidade.',
        'Câncer': 'Você é sensível, protetor e intuitivo. Família e emoções são importantes. Cuidado com o apego emocional excessivo.',
        'Leão': 'Você é criativo, generoso e magnético. Sua confiança inspira outros. Cuidado com o orgulho e necessidade de reconhecimento.',
        'Virgem': 'Você é analítico, prático e serviçal. Perfeccionismo e organização são suas marcas. Cuidado com a crítica excessiva.',
        'Libra': 'Você é harmonioso, diplomata e artístico. Busca equilíbrio e justiça. Cuidado com a indecisão e dependência.',
        'Escorpião': 'Você é intenso, transformador e perspicaz. Sua profundidade emocional é poderosa. Cuidado com o ciúme e manipulação.',
        'Sagitário': 'Você é aventureiro, otimista e filosófico. Busca liberdade e expansão. Cuidado com o exagero e imprudência.',
        'Capricórnio': 'Você é ambicioso, disciplinado e responsável. Sua perseverança leva ao sucesso. Cuidado com o trabalho excessivo.',
        'Aquário': 'Você é inovador, humanitário e original. Sua mente visionária antecipa o futuro. Cuidado com o distanciamento emocional.',
        'Peixes': 'Você é compassivo, intuitivo e artístico. Sua sensibilidade conecta-se com o divino. Cuidado com a fuga da realidade.'
    };
    return interpretacoes[signo.signo] || 'Interpretação não disponível.';
}

/**
 * ✅ NOVO: Sistema de aspectos mais detalhado
 */
function obterAspectosDetalhados(signoSolar, signoLunar, ascendente) {
    const aspectos = [];
    
    // Conjunção Sol-Lua
    if (signoSolar.elemento === signoLunar.elemento) {
        aspectos.push({
            tipo: 'Conjunção Harmônica',
            planetas: 'Sol e Lua',
            significado: 'Sua identidade e emoções estão alinhadas, trazendo coerência interna',
            influencia: 'Positiva'
        });
    }
    
    // Quadratura (desafio)
    const elementosDesafio = {
        'Fogo': 'Terra', 'Terra': 'Ar', 'Ar': 'Água', 'Água': 'Fogo'
    };
    
    if (elementosDesafio[signoSolar.elemento] === signoLunar.elemento) {
        aspectos.push({
            tipo: 'Quadratura de Desafio',
            planetas: 'Sol e Lua',
            significado: 'Tensão entre sua identidade e emoções, exigindo integração',
            influencia: 'Desafiadora'
        });
    }
    
    // Trígono (harmonia)
    const elementosHarmonia = {
        'Fogo': 'Ar', 'Ar': 'Fogo', 
        'Terra': 'Água', 'Água': 'Terra'
    };
    
    if (elementosHarmonia[signoSolar.elemento] === signoLunar.elemento) {
        aspectos.push({
            tipo: 'Trígono Harmônico',
            planetas: 'Sol e Lua',
            significado: 'Fluidez natural entre vontade e sentimento',
            influencia: 'Muito Positiva'
        });
    }
    
    // Oposição (polaridade)
    const elementosOposicao = {
        'Fogo': 'Água', 'Água': 'Fogo',
        'Terra': 'Ar', 'Ar': 'Terra'
    };
    
    if (elementosOposicao[signoSolar.elemento] === signoLunar.elemento) {
        aspectos.push({
            tipo: 'Oposição de Polaridade',
            planetas: 'Sol e Lua',
            significado: 'Tensão criativa entre aspectos opostos da personalidade',
            influencia: 'Desafiadora mas evolutiva'
        });
    }
    
    return aspectos;
}

function obterAspectosPlanetarios(signoSolar, signoLunar, ascendente) {
    const aspectos = obterAspectosDetalhados(signoSolar, signoLunar, ascendente);
    
    // Converte para formato de texto
    return aspectos.map(aspecto => 
        `${obterEmojiAspecto(aspecto.influencia)} **${aspecto.tipo}**: ${aspecto.significado}`
    );
}

function obterEmojiAspecto(influencia) {
    const emojis = {
        'Positiva': '💫',
        'Muito Positiva': '🌟',
        'Desafiadora': '⚡',
        'Desafiadora mas evolutiva': '🌀'
    };
    return emojis[influencia] || '✨';
}

// ======================
// 📊 FUNÇÃO PRINCIPAL
// ======================

/**
 * Gera relatório completo do Mapa Astral
 */
export function gerarRelatorioMapaAstral(nomeCompleto, dataNascimento, horaNascimento = null, localNascimento = null) {
    try {
        // ✅ VALIDAÇÃO DE DADOS
        if (!dataNascimento) {
            return {
                sucesso: false,
                erro: 'Data de nascimento é obrigatória'
            };
        }
        
        // Valida formato da data
        const dataRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
        if (!dataRegex.test(dataNascimento)) {
            return {
                sucesso: false,
                erro: 'Formato de data inválido. Use DD/MM/AAAA'
            };
        }
        
        // ✅ MELHORIA: Se o nome está vazio ou muito curto, tenta extrair de forma inteligente
        if ((!nomeCompleto || nomeCompleto.length < 3)) {
            // Tenta inferir um nome baseado no contexto (em um sistema real, isso viria do histórico)
            // Por enquanto, usamos um placeholder
            nomeCompleto = nomeCompleto || "Consulta Astral";
        }
        
        // Cálculos astrológicos
        const signoSolar = calcularSignoSolar(dataNascimento);
        const signoLunar = calcularSignoLunar(dataNascimento);
        const ascendente = calcularAscendente(signoSolar, horaNascimento, localNascimento);
        const casas = ascendente ? calcularCasasAstrologicas(ascendente) : [];
        
        // Interpretações
        const interpretacaoSolar = obterInterpretacaoSigno(signoSolar);
        const interpretacaoLunar = obterInterpretacaoSigno(signoLunar);
        const interpretacaoAscendente = ascendente ? obterInterpretacaoSigno(ascendente) : null;
        const aspectos = obterAspectosPlanetarios(signoSolar, signoLunar, ascendente);
        
        // ✅ MELHORIA: Formata o nome para exibição
        const nomeExibicao = nomeCompleto && nomeCompleto.length > 2 ? 
            nomeCompleto.toUpperCase() : "CONSULTA ASTRAL";
        
        // Montagem do relatório
        const relatorio = `
🌌 **MAPA ASTRAL DE ${nomeExibicao}**

📅 **Data de Nascimento:** ${dataNascimento}
${horaNascimento ? `⏰ **Hora de Nascimento:** ${horaNascimento}` : ''}
${localNascimento ? `📍 **Local de Nascimento:** ${localNascimento}` : ''}

---

## ✨ SEUS PRINCIPAIS SIGNOS:

**☀️ SIGNOS SOLAR em ${signoSolar.signo}**
- **Elemento:** ${signoSolar.elemento} | **Regente:** ${signoSolar.regente}
${interpretacaoSolar}

**🌙 SIGNOS LUNAR em ${signoLunar.signo}**
- **Elemento:** ${signoLunar.elemento} | **Regente:** ${signoLunar.regente}
${interpretacaoLunar}

${ascendente ? `
**↑ ASCENDENTE em ${ascendente.signo}**
- **Elemento:** ${ascendente.elemento} | **Regente:** ${ascendente.regente}
${interpretacaoAscendente ? `*${interpretacaoAscendente}*` : '*Sua máscara social, como os outros te veem*'}
` : '*Forneça a hora de nascimento para calcular o Ascendente*'}

---

## 🪐 ASPECTOS PLANETÁRIOS:

${aspectos.length > 0 ? aspectos.map(aspecto => `• ${aspecto}`).join('\n') : '• ✨ **Alinhamento Neutro**: Seus aspectos principais estão em equilíbrio'}

---

## 🏠 CASAS ASTROLÓGICAS:

${ascendente ? casas.slice(0, 6).map(casa => 
    `**Casa ${casa.casa}** (${casa.signo}): ${casa.significado}`
).join('\n') : '*Hora necessária para cálculo das casas*'}

---

## 💫 CONSELHOS ASTROLÓGICOS:

**Para ${signoSolar.signo}:**
- Explore sua natureza ${signoSolar.elemento.toLowerCase()} através de ${signoSolar.elemento === 'Fogo' ? 'ações corajosas' : signoSolar.elemento === 'Terra' ? 'projetos práticos' : signoSolar.elemento === 'Ar' ? 'estudos e comunicação' : 'conexões emocionais'}

**Lua em ${signoLunar.signo}:**
- Cuide de suas emoções através de ${signoLunar.elemento === 'Fogo' ? 'exercícios físicos' : signoLunar.elemento === 'Terra' ? 'rotinas estáveis' : signoLunar.elemento === 'Ar' ? 'diálogo interno' : 'momentos de introspecção'}

${ascendente ? `
**Ascendente em ${ascendente.signo}:**
- Use sua energia ${ascendente.elemento.toLowerCase()} para ${ascendente.elemento === 'Fogo' ? 'inspirar outros' : ascendente.elemento === 'Terra' ? 'construir bases sólidas' : ascendente.elemento === 'Ar' ? 'compartilhar ideias' : 'conectar-se emocionalmente'}
` : ''}

---

Que as estrelas iluminem seu caminho! 🌟
        `.trim();
        
        return {
            sucesso: true,
            relatorio: relatorio,
            dados: {
                signoSolar,
                signoLunar,
                ascendente,
                casas: casas.slice(0, 6)
            }
        };
        
    } catch (error) {
        console.error('❌ Erro em gerarRelatorioMapaAstral:', error);
        return {
            sucesso: false,
            erro: error.message
        };
    }
}

// ======================
// 🧪 TESTES (opcional)
// ======================

/*
// Teste rápido
console.log(gerarRelatorioMapaAstral("Maria Santos", "15/08/1990", "14:30", "São Paulo"));
*/