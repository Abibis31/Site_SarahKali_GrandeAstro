// api/numerology.js - Sistema Completo de Numerologia

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
        carreira: "Empreendedorismo, gestão, cargos de comando"
    },
    2: {
        titulo: "DIPLOMATA E COOPERADOR", 
        positivo: "Cooperação, sensibilidade, diplomacia, paciência",
        desafio: "Timidez, indecisão, dependência emocional",
        missao: "Desenvolver parcerias, mediar conflitos, trabalhar em equipe",
        carreira: "Mediação, recursos humanos, terapia, ensino"
    },
    3: {
        titulo: "COMUNICADOR E CRIATIVO",
        positivo: "Expressão, otimismo, criatividade, socialização",
        desafio: "Superficialidade, dispersão, crítica excessiva",
        missao: "Expressar talentos criativos, inspirar outros através da comunicação",
        carreira: "Artes, comunicação, ensino, entretenimento"
    },
    4: {
        titulo: "CONSTRUTOR E PRÁTICO",
        positivo: "Estabilidade, organização, praticidade, lealdade",
        desafio: "Rigidez, teimosia, excesso de trabalho",
        missao: "Construir bases sólidas, organizar sistemas eficientes",
        carreira: "Engenharia, administração, construção, planejamento"
    },
    5: {
        titulo: "LIVRE E VERSÁTIL",
        positivo: "Liberdade, adaptabilidade, versatilidade, curiosidade",
        desafio: "Inconstância, impulsividade, falta de foco",
        missao: "Aprender através de experiências diversas, adaptar-se a mudanças",
        carreira: "Viagens, vendas, marketing, comunicação"
    },
    6: {
        titulo: "PROTETOR E RESPONSÁVEL",
        positivo: "Responsabilidade, amor, serviço, harmonia",
        desafio: "Posessividade, preocupação excessiva, auto-sacrifício",
        missao: "Criar harmonia, cuidar da família e comunidade",
        carreira: "Educação, saúde, serviço social, aconselhamento"
    },
    7: {
        titulo: "ANALÍTICO E ESPIRITUAL",
        positivo: "Análise, intuição, espiritualidade, sabedoria",
        desafio: "Ceticismo, isolamento, perfeccionismo",
        missao: "Buscar conhecimento profundo, desenvolver intuição",
        carreira: "Pesquisa, ciência, espiritualidade, análise"
    },
    8: {
        titulo: "EXECUTIVO E PODEROSO",
        positivo: "Poder, realização, abundância, eficiência",
        desafio: "Materialismo, trabalho excessivo, autoritarismo",
        missao: "Aprender a usar o poder com sabedoria, realizar grandes projetos",
        carreira: "Executiva, finanças, direito, grandes negócios"
    },
    9: {
        titulo: "HUMANITÁRIO E COMPASSIVO",
        positivo: "Compaixão, generosidade, idealismo, criatividade universal",
        desafio: "Emocionalidade excessiva, martírio, dispersão",
        missao: "Servir à humanidade, compartilhar sabedoria universal",
        carreira: "Serviço humanitário, arte, cura, ensino superior"
    },
    // NÚMEROS MESTRES
    11: {
        titulo: "MESTRE INSPIRADOR",
        positivo: "Intuição elevada, inspiração, iluminação, idealismo",
        desafio: "Nervosismo, ansiedade, expectativas irreais",
        missao: "Inspirar outros através da intuição e visão espiritual",
        carreira: "Liderança espiritual, arte inspiradora, ensino místico"
    },
    22: {
        titulo: "MESTRE CONSTRUTOR", 
        positivo: "Poder prático, visão global, realização em larga escala",
        desafio: "Pressão excessiva, perfeccionismo, ansiedade",
        missao: "Construir projetos que beneficiem a humanidade",
        carreira: "Grandes construções, projetos globais, arquitetura"
    },
    33: {
        titulo: "MESTRE DOS MESTRES",
        positivo: "Compaixão universal, serviço à humanidade, amor incondicional",
        desafio: "Auto-sacrifício excessivo, sobrecarga emocional",
        missao: "Elevar a consciência humana através do amor e serviço",
        carreira: "Liderança humanitária, cura em massa, ensino espiritual"
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
        // Cálculos
        const numeroVida = calcularNumeroVida(dataNascimento);
        const numeroExpressao = calcularNumeroExpressao(nomeCompleto);
        const numeroAlma = calcularNumeroAlma(nomeCompleto);
        const numeroPersonalidade = calcularNumeroPersonalidade(nomeCompleto);
        const anoPessoal = calcularAnoPessoal(dataNascimento);
        
        // Interpretações
        const interpretacaoVida = INTERPRETACOES[numeroVida];
        const interpretacaoExpressao = INTERPRETACOES[numeroExpressao];
        const interpretacaoAlma = INTERPRETACOES[numeroAlma];
        const interpretacaoPersonalidade = INTERPRETACOES[numeroPersonalidade];
        const interpretacaoAnoPessoal = INTERPRETACOES[anoPessoal];
        
        // Montagem do relatório
        const relatorio = `
🔮 **ANÁLISE NUMEROLÓGICA DE ${nomeCompleto.toUpperCase()}**

📅 **Data de Nascimento:** ${dataNascimento}

---

## 📊 SEUS NÚMEROS PRINCIPAIS:

**1. NÚMERO DA VIDA ${numeroVida}** - ${interpretacaoVida.titulo}
- **Missão:** ${interpretacaoVida.missao}
- **Pontos Fortes:** ${interpretacaoVida.positivo}
- **Desafios:** ${interpretacaoVida.desafio}
- **Carreira Ideal:** ${interpretacaoVida.carreira}

**2. NÚMERO DE EXPRESSÃO ${numeroExpressao}** - ${interpretacaoExpressao.titulo}
- **Talentos Natos:** ${interpretacaoExpressao.positivo}
- **Desafios:** ${interpretacaoExpressao.desafio}
- **Carreira:** ${interpretacaoExpressao.carreira}

**3. NÚMERO DA ALMA ${numeroAlma}** - ${interpretacaoAlma.titulo}
- **Desejos Profundos:** ${interpretacaoAlma.positivo}
- **Anseios Internos:** ${interpretacaoAlma.missao}

**4. NÚMERO DE PERSONALIDADE ${numeroPersonalidade}** - ${interpretacaoPersonalidade.titulo}
- **Como os Outros te Veem:** ${interpretacaoPersonalidade.positivo}

**5. ANO PESSOAL ${anoPessoal}** - ${interpretacaoAnoPessoal.titulo}
- **Energia do Ano:** ${interpretacaoAnoPessoal.missao}
- **Oportunidades:** ${interpretacaoAnoPessoal.positivo}

---

💫 **CONSELHO NUMEROLÓGICO:**
Foque em desenvolver seus talentos de ${interpretacaoExpressao.positivo.split(',')[0]} enquanto trabalha para superar ${interpretacaoVida.desafio.split(',')[0]}. Este ano é propício para ${interpretacaoAnoPessoal.positivo.split(',')[0].toLowerCase()}.

Que os números guiem seu caminho! ✨
        `.trim();
        
        return {
            sucesso: true,
            relatorio: relatorio,
            numeros: {
                vida: numeroVida,
                expressao: numeroExpressao,
                alma: numeroAlma,
                personalidade: numeroPersonalidade,
                anoPessoal: anoPessoal
            }
        };
        
    } catch (error) {
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
console.log(gerarRelatorioNumerologico("João Silva", "15/03/1990"));
*/