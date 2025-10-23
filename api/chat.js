const GROQ_API_KEY = process.env.GROQ_API_KEY;

export async function getGeminiResponse(messages) {
    console.log('🔧 TESTE: Função chat chamada');
    
    // Verificação básica
    if (!GROQ_API_KEY) {
        console.log('❌ GROQ_API_KEY não encontrada');
        return "Estou realinhando minhas energias cósmicas... 🔮";
    }
    
    console.log('✅ GROQ_API_KEY encontrada');
    
    // Resposta fixa temporária - DEPOIS adicionamos a API
    return "✨ Sarah Kali aqui! Estou conectada e pronta para ajudar! Como posso orientar você hoje? 💫";
}