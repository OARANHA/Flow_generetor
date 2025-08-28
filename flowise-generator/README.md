# Flowise Generator

An autonomous system that generates valid Flowise flows (ChatFlow and AgentFlow v2) from natural language descriptions using AI and RAG (Retrieval-Augmented Generation).

## Features

- 🤖 **AI-Powered Generation**: Uses advanced AI models to generate Flowise-compatible JSON configurations
- 📚 **RAG System**: Leverages official Flowise documentation for accurate flow generation
- 🔍 **Smart Retrieval**: Finds relevant nodes, tutorials, and examples from the knowledge base
- ✅ **Validation**: Ensures generated flows are compatible with Flowise
- 🌐 **Web Interface**: User-friendly web interface for easy flow generation
- 💻 **CLI Support**: Command-line interface for automation and scripting
- 📝 **Suggestions**: Provides improvement suggestions for generated flows
- 📥 **Export Options**: Download flows as JSON files or copy to clipboard

## System Architecture

```
Flowise Generator
├── Documentation Processing
│   ├── FlowiseDocs Repository
│   ├── Document Processor
│   └── Knowledge Base
├── RAG System
│   ├── Vector Store (ChromaDB)
│   ├── Document Embeddings
│   └── Semantic Search
├── AI Agent
│   ├── Natural Language Processing
│   ├── Flow Configuration Generation
│   └── Validation
└── User Interfaces
    ├── Web Interface (Next.js)
    ├── API Endpoints
    └── CLI Tool
```

## Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key (for embeddings and AI generation)
- Access to Flowise documentation (automatically cloned)

### Setup

1. **Initialize the system** (processes documentation and sets up vector store):
```bash
npm run flowise:init
```

2. **Start the development server**:
```bash
npm run dev
```

3. **Access the web interface**:
   - Open http://localhost:3000/flowise-generator
   - Enter your flow description
   - Select flow type (ChatFlow or AgentFlow v2)
   - Click "Generate Flow"

## Usage

### Web Interface

1. Navigate to `/flowise-generator`
2. Choose between ChatFlow or AgentFlow v2
3. Enter a natural language description of your desired flow
4. Click "Generate Flow"
5. Review the generated configuration and suggestions
6. Download the JSON file or copy it to clipboard

### CLI Usage

Generate a basic ChatFlow:
```bash
npm run generate-flow "Create a chatbot that searches Google and summarizes results"
```

Generate an AgentFlow v2:
```bash
npm run generate-flow "Build an agent that reads PDF files and answers questions" --agentflow
```

Save to specific location:
```bash
npm run generate-flow "Create a customer support chatbot" --output ./my-flow.json
```

### API Usage

Generate a flow:
```bash
curl -X POST http://localhost:3000/api/flowise/generate \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Create a chatbot with memory that maintains conversation context",
    "flowType": "chatflow"
  }'
```

Get system information:
```bash
curl http://localhost:3000/api/flowise/generate
```

## Example Descriptions

### ChatFlow Examples
- "Create a chatbot that searches Google and summarizes the results using GPT-4"
- "Build a customer support bot that can answer FAQs and escalate to human agents"
- "Create a flow that processes user input, performs sentiment analysis, and generates appropriate responses"

### AgentFlow v2 Examples
- "Build an AgentFlow v2 that can read PDF files, answer questions about the content, and save responses to a database"
- "Create an agent that can browse websites, extract information, and create structured summaries"
- "Build a multi-agent system where one agent searches for information and another agent synthesizes the results"

## Generated Flow Structure

The system generates Flowise-compatible JSON with the following structure:

```json
{
  "nodes": [
    {
      "id": "unique-id",
      "type": "node-type",
      "position": {"x": 0, "y": 0},
      "data": {
        "label": "Node Label",
        "name": "node-name",
        "type": "node-type",
        "category": "category",
        "inputs": {
          "parameter1": "value1",
          "parameter2": "{{variable}}"
        },
        "outputs": {
          "output1": "output-type"
        }
      }
    }
  ],
  "edges": [
    {
      "id": "edge-id",
      "source": "source-node-id",
      "target": "target-node-id",
      "sourceHandle": "source-handle",
      "targetHandle": "target-handle"
    }
  ]
}
```

## Supported Node Types

The system supports all Flowise node types including:

### Language Model Nodes
- OpenAI, Anthropic, Cohere, Google AI
- Local models (Ollama, LocalAI)
- Azure OpenAI, AWS Bedrock

### Tool Nodes
- Web Search (Google, SerpAPI, Exa)
- File Operations (Read, Write)
- API Integration (REST, GraphQL)
- Calculators and Data Processing

### Memory & Storage
- Buffer Memory, Conversation Summary
- Vector Stores (Chroma, Pinecone, Weaviate)
- Document Stores

### Agent Nodes
- ReAct Agents, Tool Agents
- OpenAI Assistants
- Multi-Agent Systems

## Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# OpenAI API Key (required for embeddings and AI generation)
OPENAI_API_KEY=your_openai_api_key_here

# ChromaDB Configuration (optional)
CHROMA_URL=http://localhost:8000

# Flowise API Configuration (optional)
FLOWISE_API_URL=http://localhost:3000
FLOWISE_API_KEY=your_flowise_api_key
```

### Customization

You can customize the system by:

1. **Adding Custom Documentation**: Place additional markdown files in the `FlowiseDocs` directory
2. **Modifying Prompts**: Edit the prompts in `flowise-generator/src/flowiseAgent.ts`
3. **Adjusting Vector Store**: Modify the ChromaDB configuration in `flowise-generator/src/vectorStore.ts`
4. **Extending Node Types**: Add new node parsing logic in `flowise-generator/src/documentProcessor.ts`

## Troubleshooting

### Common Issues

1. **Documentation Not Found**
   ```
   Error: FlowiseDocs directory not found
   ```
   - Solution: Ensure the FlowiseDocs repository was cloned properly
   - Run: `git clone https://github.com/FlowiseAI/FlowiseDocs.git`

2. **Vector Store Connection Failed**
   ```
   Error: Error initializing vector store
   ```
   - Solution: Check ChromaDB is running and accessible
   - Verify `CHROMA_URL` environment variable

3. **AI Generation Failed**
   ```
   Error: No response from AI
   ```
   - Solution: Check OpenAI API key is valid and has sufficient credits
   - Verify `OPENAI_API_KEY` environment variable

4. **Flow Validation Failed**
   ```
   Error: Flow must have nodes array
   ```
   - Solution: Check the generated flow structure
   - Ensure the AI model is generating valid JSON

### Debug Mode

Enable debug logging by setting:
```env
DEBUG=flowise:*
```

## Development

### Project Structure

```
flowise-generator/
├── src/
│   ├── documentProcessor.ts    # Documentation processing
│   ├── vectorStore.ts          # Vector store management
│   ├── flowiseAgent.ts         # AI agent for flow generation
│   ├── init.ts                # System initialization
│   └── index.ts               # Main entry point
├── package.json
└── tsconfig.json

src/app/flowise-generator/
├── page.tsx                   # Web interface
└── api/
    └── flowise/
        └── generate/
            └── route.ts       # API endpoint
```

### Adding New Features

1. **New Node Types**: Extend the document processor to parse new node documentation
2. **Custom Validation**: Add validation rules in the flow agent
3. **Additional Export Formats**: Extend the export functionality
4. **UI Enhancements**: Modify the web interface components

### Testing

Run the test suite:
```bash
npm test
```

Run linting:
```bash
npm run lint
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the example descriptions

## Acknowledgments

- FlowiseAI for the excellent documentation
- LangChain for the RAG framework
- OpenAI for the AI models
- ChromaDB for vector storage