# 🤖 Flow Generator

Um sistema autônomo que gera fluxos válidos para o Flowise (incluindo AgentFlow v2 e ChatFlow) com base em instruções em linguagem natural, utilizando a documentação oficial como fonte de conhecimento.

## ✨ Funcionalidades

- 🤖 **Geração AI-Powered**: Usa modelos avançados de IA para gerar configurações JSON compatíveis com Flowise
- 📚 **Sistema RAG**: Aproveita a documentação oficial do Flowise para geração precisa de fluxos
- 🔍 **Recuperação Inteligente**: Encontra nós, tutoriais e exemplos relevantes na base de conhecimento
- ✅ **Validação**: Garante que os fluxos gerados são compatíveis com o Flowise
- 🌐 **Interface Web**: Interface amigável para fácil geração de fluxos
- 💻 **Suporte CLI**: Interface de linha de comando para automação e scripts
- 📝 **Sugestões**: Fornece sugestões de melhoria para fluxos gerados
- 📥 **Opções de Exportação**: Baixe fluxos como arquivos JSON ou copie para a área de transferência

## 🚀 Como Usar

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Chave de API da OpenAI (para embeddings e geração de IA)

### Instalação

1. **Clone o repositório**:
```bash
git clone https://github.com/OARANHA/Flow_generetor.git
cd Flow_generetor
```

2. **Instale as dependências**:
```bash
npm install
```

3. **Configure as variáveis de ambiente**:
Crie um arquivo `.env.local` com:
```env
OPENAI_API_KEY=sua_chave_api_aqui
CHROMA_URL=http://localhost:8000
```

4. **Inicialize o sistema**:
```bash
npm run flowise:init
```

5. **Inicie o servidor de desenvolvimento**:
```bash
npm run dev
```

### Interface Web

Acesse: `http://localhost:3000/flowise-generator`

1. Descreva seu fluxo em linguagem natural
2. Escolha entre ChatFlow ou AgentFlow v2
3. Clique em "Generate Flow"
4. Baixe ou copie a configuração JSON gerada

### Uso via CLI

```bash
# Gerar ChatFlow básico
npm run generate-flow "Crie um chatbot que busca no Google e resume os resultados"

# Gerar AgentFlow v2
npm run generate-flow "Construa um agente que lê arquivos PDF" --agentflow

# Salvar em local específico
npm run generate-flow "Bot de suporte ao cliente" --output ./meu-fluxo.json
```

### Exemplos de Descrições

**ChatFlow:**
- "Crie um chatbot que busca no Google e resume os resultados usando GPT-4"
- "Construa um bot de suporte ao cliente que pode responder FAQs e escalar para agentes humanos"
- "Crie um fluxo que processa entrada do usuário, realiza análise de sentimento e gera respostas apropriadas"

**AgentFlow v2:**
- "Construa um AgentFlow v2 que pode ler arquivos PDF, responder perguntas sobre o conteúdo e salvar respostas em um banco de dados"
- "Crie um agente que pode navegar em sites, extrair informações e criar resumos estruturados"
- "Construa um sistema multi-agente onde um agente busca informações e outro sintetiza os resultados"

## 🏗️ Arquitetura do Sistema

```
Flow Generator
├── Processamento de Documentação
│   ├── Repositório FlowiseDocs
│   ├── Processador de Documentos
│   └── Base de Conhecimento
├── Sistema RAG
│   ├── Vector Store (ChromaDB)
│   ├── Embeddings de Documentos
│   └── Busca Semântica
├── Agente de IA
│   ├── Processamento de Linguagem Natural
│   ├── Geração de Configuração de Fluxo
│   └── Validação
└── Interfaces de Usuário
    ├── Interface Web (Next.js)
    ├── Endpoints de API
    └── Ferramenta CLI
```

## 📁 Estrutura do Projeto

```
flowise-generator/
├── src/
│   ├── documentProcessor.ts    # Processamento de documentação
│   ├── vectorStore.ts          # Gerenciamento de vector store
│   ├── flowiseAgent.ts         # Agente de IA para geração de fluxos
│   ├── init.ts                # Inicialização do sistema
│   └── index.ts               # Ponto de entrada principal
├── examples/
│   └── demo.ts                # Demo e modo interativo
├── package.json
├── tsconfig.json
└── README.md

src/app/flowise-generator/
├── page.tsx                   # Interface web
└── api/
    └── flowise/
        └── generate/
            └── route.ts       # Endpoint de API
```

## 🔧 Scripts Disponíveis

```bash
npm run flowise-init          # Inicializa o sistema
npm run generate-flow         # Gera fluxos via CLI
npm run flowise-demo          # Executa exemplos de demonstração
npm run flowise-interactive   # Modo interativo
npm run dev                   # Inicia servidor de desenvolvimento
```

## 📊 Saída Gerada

O sistema gera JSON válido para Flowise como este:

```json
{
  "nodes": [
    {
      "id": "openai-chat-1",
      "type": "OpenAI",
      "position": {"x": 100, "y": 100},
      "data": {
        "label": "OpenAI Chat Model",
        "name": "openai-chat",
        "type": "OpenAI",
        "category": "chat-models",
        "inputs": {
          "modelName": "gpt-4",
          "apiKey": "{{OPENAI_API_KEY}}",
          "temperature": 0.7
        },
        "outputs": {
          "message": "message"
        }
      }
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "source": "input-1",
      "target": "openai-chat-1",
      "sourceHandle": "message",
      "targetHandle": "message"
    }
  ]
}
```

## 🤝 Contribuição

1. Faça um fork do repositório
2. Crie uma branch de feature (`git checkout -b feature/nova-funcionalidade`)
3. Faça commit das suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes.

## 🙏 Agradecimentos

- FlowiseAI pela excelente documentação
- LangChain pelo framework RAG
- OpenAI pelos modelos de IA
- ChromaDB pelo armazenamento vetorial

## 📞 Suporte

Para problemas e perguntas:
- Crie uma issue no repositório
- Verifique a seção de troubleshooting
- Revise os exemplos de descrição

---

**Desenvolvido com ❤️ usando IA e as melhores práticas de desenvolvimento**