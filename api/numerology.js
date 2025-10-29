// api/numerology.js - Sistema Completo de Numerologia (ATUALIZADO)

// ======================
// 📊 TABELA PITAGÓRICA
// ======================
const TABELA_PITAGORICA = {
    'a': 1, 'j': 1, 's': 1,
    'b': 2, 'k': 2, 't': 2,
    'c': 3, 'l': 3, 'u': 3,
    'd': 4, 'm': 4, 'v': 4,
    'e': 5, 'n': 5, 'w': 5,
    'f': 6, 'o': 6, 'x': 6,
    'g': 7, 'p': 7, 'y': 7,
    'h': 8, 'q': 8, 'z': 8,
    'i': 9, 'r': 9
};

// ======================
// 🔢 FUNÇÕES DE CÁLCULO
// ======================

/**
 * Reduz número para dígito único (exceto números mestres)
 */
function reduzirNumero(numero) {
    let resultado = numero;
    
    // Números mestres não são reduzidos
    const numerosMestres = [11, 22, 33];
    if (numerosMestres.includes(resultado)) {
        return resultado;
    }
    
    // Redução até chegar a 1-9
    while (resultado > 9) {
        resultado = resultado.toString()
            .split('')
            .reduce((soma, digito) => soma + parseInt(digito), 0);
    }
    
    return resultado;
}

/**
 * ✅ FUNÇÃO MELHORADA: Validação de nome completo
 */
export function validarNomeCompleto(nome) {
    if (!nome || typeof nome !== 'string') return false;
    
    const nomeLimpo = nome.trim();
    const partes = nomeLimpo.split(/\s+/);
    
    // Deve ter pelo menos 2 partes (nome e sobrenome)
    if (partes.length < 2) return false;
    
    // Cada parte deve ter pelo menos 2 caracteres
    if (partes.some(parte => parte.length < 2)) return false;
    
    // Deve conter apenas letras e espaços
    if (!/^[A-Za-zÀ-ÿ\s]+$/.test(nomeLimpo)) return false;
    
    return true;
}

/**
 * ✅ FUNÇÃO MELHORADA: Validação de data
 */
function validarData(data) {
    const regex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const match = data.match(regex);
    
    if (!match) return false;
    
    const [_, dia, mes, ano] = match.map(Number);
    
    // Verifica se a data é válida
    if (mes < 1 || mes > 12) return false;
    if (dia < 1 || dia > 31) return false;
    
    // Verifica meses com 30 dias
    if ([4, 6, 9, 11].includes(mes) && dia > 30) return false;
    
    // Verifica fevereiro e anos bissextos
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
 * Calcula Número da Vida (Caminho de Vida)
 */
export function calcularNumeroVida(dataNascimento) {
    // Remove caracteres não numéricos e formata
    const numeros = dataNascimento.replace(/[^\d]/g, '');
    
    if (numeros.length !== 8) {
        throw new Error('Data de nascimento inválida. Use o formato DD/MM/AAAA');
    }
    
    const dia = parseInt(numeros.substring(0, 2));
    const mes = parseInt(numeros.substring(2, 4));
    const ano = parseInt(numeros.substring(4, 8));
    
    const somaTotal = dia + mes + ano;
    return reduzirNumero(somaTotal);
}

/**
 * Calcula Número de Expressão (Destino)
 */
export function calcularNumeroExpressao(nomeCompleto) {
    if (!validarNomeCompleto(nomeCompleto)) {
        throw new Error('Nome completo deve conter nome e sobrenome');
    }
    
    const nomeLimpo = nomeCompleto.toLowerCase().replace(/[^a-z]/g, '');
    
    if (nomeLimpo.length === 0) {
        throw new Error('Nome completo é obrigatório');
    }
    
    let soma = 0;
    for (let letra of nomeLimpo) {
        soma += TABELA_PITAGORICA[letra] || 0;
    }
    
    return reduzirNumero(soma);
}

/**
 * Calcula Número da Alma (Desejo da Alma)
 */
export function calcularNumeroAlma(nomeCompleto) {
    const vogais = nomeCompleto.toLowerCase().match(/[aeiou]/g);
    
    if (!vogais) return 7; // Default se não encontrar vogais
    
    let soma = 0;
    for (let vogal of vogais) {
        soma += TABELA_PITAGORICA[vogal] || 0;
    }
    
    return reduzirNumero(soma);
}

/**
 * Calcula Número de Personalidade
 */
export function calcularNumeroPersonalidade(nomeCompleto) {
    const consoantes = nomeCompleto.toLowerCase().match(/[bcdfghjklmnpqrstvwxyz]/g);
    
    if (!consoantes) return 4; // Default se não encontrar consoantes
    
    let soma = 0;
    for (let consoante of consoantes) {
        soma += TABELA_PITAGORICA[consoante] || 0;
    }
    
    return reduzirNumero(soma);
}

/**
 * Calcula Ano Pessoal
 */
export function calcularAnoPessoal(dataNascimento, anoAtual = new Date().getFullYear()) {
    const [dia, mes] = dataNascimento.split('/').map(Number);
    const somaAnoPessoal = dia + mes + anoAtual;
    return reduzirNumero(somaAnoPessoal);
}

/**
 * ✅ NOVO: Número de Lição de Vida
 */
export function calcularNumeroLicaoVida(nomeCompleto, dataNascimento) {
    const numeroVida = calcularNumeroVida(dataNascimento);
    const numeroExpressao = calcularNumeroExpressao(nomeCompleto);
    
    // Lição de Vida = diferença entre Expressão e Vida
    const diferenca = Math.abs(numeroExpressao - numeroVida);
    return diferenca === 0 ? 9 : diferenca; // 9 representa completude
}

/**
 * ✅ NOVO: Ano Pessoal Detalhado
 */
export function calcularCicloPessoal(dataNascimento, anoAtual = new Date().getFullYear()) {
    const numeroVida = calcularNumeroVida(dataNascimento);
    const anoPessoal = calcularAnoPessoal(dataNascimento, anoAtual);
    
    return {
        anoPessoal,
        ciclo: Math.floor((anoAtual - parseInt(dataNascimento.split('/')[2])) / 9) + 1,
        desafioAnual: reduzirNumero(anoPessoal + numeroVida)
    };
}

// ======================
// 📖 BANCO DE INTERPRETAÇÕES
// ======================

const INTERPRETACOES = {
    // NÚMERO DE VIDA
    1: {
        titulo: "LÍDER E PIONEIRO",
        positivo: "Independência, criatividade, ambição, originalidade",
        desafio: "Autoritarismo, egoísmo, impaciência",
        missao: "Aprender a liderar sem dominar, iniciar projetos originais",
        carreira: "Empreendedorismo, gestão, cargos de comando",
        conselho: "Confie em sua iniciativa, mas aprenda a ouvir os outros"
    },
    2: {
        titulo: "DIPLOMATA E COOPERADOR", 
        positivo: "Cooperação, sensibilidade, diplomacia, paciência",
        desafio: "Timidez, indecisão, dependência emocional",
        missao: "Desenvolver parcerias, mediar conflitos, trabalhar em equipe",
        carreira: "Mediação, recursos humanos, terapia, ensino",
        conselho: "Sua sensibilidade é uma força, não uma fraqueza"
    },
    3: {
        titulo: "COMUNICADOR E CRIATIVO",
        positivo: "Expressão, otimismo, criatividade, socialização",
        desafio: "Superficialidade, dispersão, crítica excessiva",
        missao: "Expressar talentos criativos, inspirar outros através da comunicação",
        carreira: "Artes, comunicação, ensino, entretenimento",
        conselho: "Use sua criatividade para inspirar, não apenas para entreter"
    },
    4: {
        titulo: "CONSTRUTOR E PRÁTICO",
        positivo: "Estabilidade, organização, praticidade, lealdade",
        desafio: "Rigidez, teimosia, excesso de trabalho",
        missao: "Construir bases sólidas, organizar sistemas eficientes",
        carreira: "Engenharia, administração, construção, planejamento",
        conselho: "Sua estabilidade constrói impérios, mas permita-se ser flexível"
    },
    5: {
        titulo: "LIVRE E VERSÁTIL",
        positivo: "Liberdade, adaptabilidade, versatilidade, curiosidade",
        desafio: "Inconstância, impulsividade, falta de foco",
        missao: "Aprender através de experiências diversas, adaptar-se a mudanças",
        carreira: "Viagens, vendas, marketing, comunicação",
        conselho: "Sua liberdade é preciosa, mas a consistência traz frutos"
    },
    6: {
        titulo: "PROTETOR E RESPONSÁVEL",
        positivo: "Responsabilidade, amor, serviço, harmonia",
        desafio: "Posessividade, preocupação excessiva, auto-sacrifício",
        missao: "Criar harmonia, cuidar da família e comunidade",
        carreira: "Educação, saúde, serviço social, aconselhamento",
        conselho: "Cuide dos outros, mas não se esqueça de cuidar de si mesmo"
    },
    7: {
        titulo: "ANALÍTICO E ESPIRITUAL",
        positivo: "Análise, intuição, espiritualidade, sabedoria",
        desafio: "Ceticismo, isolamento, perfeccionismo",
        missao: "Buscar conhecimento profundo, desenvolver intuição",
        carreira: "Pesquisa, ciência, espiritualidade, análise",
        conselho: "Sua busca pela verdade é nobre, mas compartilhe suas descobertas"
    },
    8: {
        titulo: "EXECUTIVO E PODEROSO",
        positivo: "Poder, realização, abundância, eficiência",
        desafio: "Materialismo, trabalho excessivo, autoritarismo",
        missao: "Aprender a usar o poder com sabedoria, realizar grandes projetos",
        carreira: "Executiva, finanças, direito, grandes negócios",
        conselho: "O verdadeiro poder está em servir, não apenas em controlar"
    },
    9: {
        titulo: "HUMANITÁRIO E COMPASSIVO",
        positivo: "Compaixão, generosidade, idealismo, criatividade universal",
        desafio: "Emocionalidade excessiva, martírio, dispersão",
        missao: "Servir à humanidade, compartilhar sabedoria universal",
        carreira: "Serviço humanitário, arte, cura, ensino superior",
        conselho: "Sua compaixão cura o mundo, mas lembre-se de seus próprios limites"
    },
    // NÚMEROS MESTRES
    11: {
        titulo: "MESTRE INSPIRADOR",
        positivo: "Intuição elevada, inspiração, iluminação, idealismo",
        desafio: "Nervosismo, ansiedade, expectativas irreais",
        missao: "Inspirar outros através da intuição e visão espiritual",
        carreira: "Liderança espiritual, arte inspiradora, ensino místico",
        conselho: "Sua luz inspira muitos, mas proteja sua energia espiritual"
    },
    22: {
        titulo: "MESTRE CONSTRUTOR", 
        positivo: "Poder prático, visão global, realização em larga escala",
        desafio: "Pressão excessiva, perfeccionismo, ansiedade",
        missao: "Construir projetos que beneficiem a humanidade",
        carreira: "Grandes construções, projetos globais, arquitetura",
        conselho: "Seus sonhos são grandes demais para não serem realizados"
    },
    33: {
        titulo: "MESTRE DOS MESTRES",
        positivo: "Compaixão universal, serviço à humanidade, amor incondicional",
        desafio: "Auto-sacrifício excessivo, sobrecarga emocional",
        missao: "Elevar a consciência humana através do amor e serviço",
        carreira: "Liderança humanitária, cura em massa, ensino espiritual",
        conselho: "Seu amor transforma vidas, mas lembre-se de que você também precisa receber"
    }
};

// ======================
// 📊 FUNÇÃO PRINCIPAL
// ======================

/**
 * Gera relatório numerológico completo
 */
export function gerarRelatorioNumerologico(nomeCompleto, dataNascimento) {
    try {
        // ✅ VALIDAÇÕES INICIAIS
        if (!validarNomeCompleto(nomeCompleto)) {
            return {
                sucesso: false,
                erro: 'Nome completo inválido. Forneça nome e sobrenome com pelo menos 2 caracteres cada.'
            };
        }
        
        if (!validarData(dataNascimento)) {
            return {
                sucesso: false,
                erro: 'Data de nascimento inválida. Use o formato DD/MM/AAAA com uma data válida.'
            };
        }
        
        // Cálculos principais
        const numeroVida = calcularNumeroVida(dataNascimento);
        const numeroExpressao = calcularNumeroExpressao(nomeCompleto);
        const numeroAlma = calcularNumeroAlma(nomeCompleto);
        const numeroPersonalidade = calcularNumeroPersonalidade(nomeCompleto);
        const anoPessoal = calcularAnoPessoal(dataNascimento);
        
        // ✅ NOVOS CÁLCULOS
        const numeroLicaoVida = calcularNumeroLicaoVida(nomeCompleto, dataNascimento);
        const cicloPessoal = calcularCicloPessoal(dataNascimento);
        
        // Interpretações
        const interpretacaoVida = INTERPRETACOES[numeroVida];
        const interpretacaoExpressao = INTERPRETACOES[numeroExpressao];
        const interpretacaoAlma = INTERPRETACOES[numeroAlma];
        const interpretacaoPersonalidade = INTERPRETACOES[numeroPersonalidade];
        const interpretacaoAnoPessoal = INTERPRETACOES[anoPessoal];
        const interpretacaoLicaoVida = INTERPRETACOES[numeroLicaoVida];
        
        // Montagem do relatório
        const relatorio = `
🔮 **ANÁLISE NUMEROLÓGICA DE ${nomeCompleto.toUpperCase()}**

📅 **Data de Nascimento:** ${dataNascimento}
📊 **Ciclo Pessoal Atual:** ${cicloPessoal.ciclo}º Ciclo de 9 anos

---

## 📊 SEUS NÚMEROS PRINCIPAIS:

**1. NÚMERO DA VIDA ${numeroVida}** - ${interpretacaoVida.titulo}
- **Missão de Vida:** ${interpretacaoVida.missao}
- **Pontos Fortes:** ${interpretacaoVida.positivo}
- **Desafios Kármicos:** ${interpretacaoVida.desafio}
- **Carreira Ideal:** ${interpretacaoVida.carreira}

**2. NÚMERO DE EXPRESSÃO ${numeroExpressao}** - ${interpretacaoExpressao.titulo}
- **Talentos Natos:** ${interpretacaoExpressao.positivo}
- **Desafios Expressivos:** ${interpretacaoExpressao.desafio}
- **Vocação Profissional:** ${interpretacaoExpressao.carreira}

**3. NÚMERO DA ALMA ${numeroAlma}** - ${interpretacaoAlma.titulo}
- **Desejos Profundos:** ${interpretacaoAlma.positivo}
- **Anseios Internos:** ${interpretacaoAlma.missao}

**4. NÚMERO DE PERSONALIDADE ${numeroPersonalidade}** - ${interpretacaoPersonalidade.titulo}
- **Como os Outros te Veem:** ${interpretacaoPersonalidade.positivo}

**5. LIÇÃO DE VIDA ${numeroLicaoVida}** - ${interpretacaoLicaoVida.titulo}
- **Aprendizado Principal:** ${interpretacaoLicaoVida.missao}

**6. ANO PESSOAL ${anoPessoal}** - ${interpretacaoAnoPessoal.titulo}
- **Energia do Ano:** ${interpretacaoAnoPessoal.missao}
- **Oportunidades:** ${interpretacaoAnoPessoal.positivo}
- **Desafio Anual:** ${cicloPessoal.desafioAnual} - ${INTERPRETACOES[cicloPessoal.desafioAnual]?.desafio || 'Foco no crescimento'}

---

## 💫 SINERGIA NUMEROLÓGICA:

**🔗 Vida (${numeroVida}) + Expressão (${numeroExpressao})**
- ${numeroVida === numeroExpressao ? 
    '**Alinhamento Perfeito**: Sua missão e talentos estão em completa harmonia' : 
    '**Dinâmica Complementar**: Seus talentos complementam sua missão de vida'}

**❤️ Alma (${numeroAlma}) + Personalidade (${numeroPersonalidade})**
- ${Math.abs(numeroAlma - numeroPersonalidade) <= 2 ? 
    '**Autenticidade**: Seu interior e exterior estão alinhados' : 
    '**Complexidade Rica**: Sua profundidade emocional enriquece suas relações'}

---

## 🌟 CONSELHOS NUMEROLÓGICOS:

**${interpretacaoVida.conselho}**

**${interpretacaoExpressao.conselho}**

**Para seu Ano Pessoal ${anoPessoal}:**
- Foque em ${interpretacaoAnoPessoal.positivo.split(',')[0].toLowerCase()}
- Trabalhe para superar ${interpretacaoAnoPessoal.desafio.split(',')[0].toLowerCase()}

---

Que os números guiem seu caminho com sabedoria e luz! ✨
        `.trim();
        
        return {
            sucesso: true,
            relatorio: relatorio,
            numeros: {
                vida: numeroVida,
                expressao: numeroExpressao,
                alma: numeroAlma,
                personalidade: numeroPersonalidade,
                anoPessoal: anoPessoal,
                licaoVida: numeroLicaoVida,
                cicloPessoal: cicloPessoal
            }
        };
        
    } catch (error) {
        console.error('❌ Erro em gerarRelatorioNumerologico:', error);
        return {
            sucesso: false,
            erro: `Erro no cálculo: ${error.message}`
        };
    }
}

// ======================
// 🧪 TESTES (opcional)
// ======================

/*
// Teste rápido
console.log(gerarRelatorioNumerologico("João Silva", "15/03/1990"));
*/