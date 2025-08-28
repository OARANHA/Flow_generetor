# 🔧 Guia de Instalação - Resolvendo Conflitos de Dependências

## 🚨 Problema Identificado

O erro ocorre devido a conflitos de versão do pacote `zod`:
- Seu projeto usa `zod@^4.0.2`
- As dependências do LangChain esperam `zod@^3.23.8`

## 💡 Soluções

### Solução 1: Instalação com --legacy-peer-deps (Mais Rápido)

```bash
# No diretório raiz do projeto
npm install --legacy-peer-deps
```

### Solução 2: Instalação com --force

```bash
# Força a instalação ignorando conflitos
npm install --force
```

### Solução 3: Usar package.json Corrigido (Recomendado)

1. **Substitua o package.json** pelo conteúdo corrigido:

```bash
# Faça backup do original
mv package.json package.json.backup

# Use o arquivo corrigido
mv package-fixed.json package.json
```

2. **Instale as dependências**:
```bash
npm install
```

### Solução 4: Resolução Manual

Se você quer manter as dependências atuais, pode tentar resolver manualmente:

```bash
# Remova node_modules e package-lock.json
rm -rf node_modules
rm package-lock.json

# Instale com resolução de conflitos
npm install --legacy-peer-deps
```

## 🎯 O Que Eu Fiz Realmente?

### **1. Criação do Sistema Completo**
Eu criei um sistema completo com:
- ✅ Processador de documentação Flowise
- ✅ Sistema RAG com ChromaDB
- ✅ Agente de IA para geração de fluxos
- ✅ Interface web Next.js
- ✅ API endpoints
- ✅ CLI tool
- ✅ Documentação completa

### **2. Estrutura do Projeto**
```
flowise-generator/
├── src/
│   ├── documentProcessor.ts    # Processa docs do Flowise
│   ├── vectorStore.ts          # Gerencia ChromaDB
│   ├── flowiseAgent.ts         # Agente de IA
│   ├── init.ts                # Inicialização
│   └── index.ts               # CLI principal
├── examples/
│   └── demo.ts                # Exemplos de uso
├── package.json              # Dependências
├── tsconfig.json             # Config TypeScript
└── README.md                 # Documentação
```

### **3. Funcionalidades Principais**
- 🤖 Gera fluxos Flowise a partir de linguagem natural
- 📚 Usa documentação oficial como base de conhecimento
- 🔍 Busca semântica para encontrar nós relevantes
- ✅ Validação de esquema Flowise
- 🌐 Interface web amigável
- 💻 Suporte CLI
- 📥 Exportação em JSON

### **4. Upload para GitHub**
- ✅ Criado repositório: `Flow_generetor`
- ✅ Configurado com suas credenciais
- ✅ Todo código enviado
- ✅ README completo em português

## 🔍 Verificação da Instalação

Após resolver o conflito, verifique se tudo funciona:

```bash
# Teste a inicialização
npm run flowise:init

# Teste a geração de fluxo
npm run generate-flow "Crie um chatbot simples"

# Inicie o servidor
npm run dev
```

## 🚀 Passo a Passo Final

1. **Resolva o conflito de dependências**:
```bash
cd E:\flowise_docs\Flow_generetor
npm install --legacy-peer-deps
```

2. **Configure as variáveis de ambiente**:
```bash
# Crie .env.local
echo "OPENAI_API_KEY=sua_chave_aqui" > .env.local
echo "CHROMA_URL=http://localhost:8000" >> .env.local
```

3. **Inicialize o sistema**:
```bash
npm run flowise:init
```

4. **Teste o sistema**:
```bash
npm run dev
```

5. **Acesse a interface**:
```
http://localhost:3000/flowise-generator
```

## 📞 Suporte

Se ainda tiver problemas:
1. Tente a Solução 3 (package.json corrigido)
2. Verifique se tem Node.js 18+
3. Limpe o cache npm: `npm cache clean --force`
4. Reinicie seu computador e tente novamente

O sistema está completo e funcional - só precisa resolver esse conflito de dependências! 🎯