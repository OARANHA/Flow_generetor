import ZAI from 'z-ai-web-dev-sdk';
import { VectorStoreManager } from './vectorStore';
import { Document } from '@langchain/core/documents';

export interface FlowiseNodeConfig {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    name: string;
    type: string;
    category: string;
    inputs: Record<string, any>;
    outputs: Record<string, any>;
  };
}

export interface FlowiseEdgeConfig {
  id: string;
  source: string;
  target: string;
  sourceHandle: string;
  targetHandle: string;
}

export interface FlowiseFlowConfig {
  nodes: FlowiseNodeConfig[];
  edges: FlowiseEdgeConfig[];
  viewport?: { x: number; y: number; zoom: number };
}

export class FlowiseAgent {
  private vectorStore: VectorStoreManager;
  private zai: any;

  constructor(vectorStore: VectorStoreManager) {
    this.vectorStore = vectorStore;
  }

  async initialize(): Promise<void> {
    try {
      this.zai = await ZAI.create();
      console.log('Flowise agent initialized successfully');
    } catch (error) {
      console.error('Error initializing Flowise agent:', error);
      throw error;
    }
  }

  async generateFlow(description: string, flowType: 'chatflow' | 'agentflow' = 'chatflow'): Promise<FlowiseFlowConfig> {
    try {
      // Step 1: Retrieve relevant knowledge from vector store
      const relevantDocs = await this.retrieveRelevantKnowledge(description, flowType);
      
      // Step 2: Generate flow configuration using AI
      const flowConfig = await this.generateFlowConfig(description, flowType, relevantDocs);
      
      // Step 3: Validate the generated flow
      const validatedFlow = await this.validateFlow(flowConfig);
      
      return validatedFlow;
    } catch (error) {
      console.error('Error generating flow:', error);
      throw error;
    }
  }

  private async retrieveRelevantKnowledge(description: string, flowType: string): Promise<Document[]> {
    const relevantDocs: Document[] = [];
    
    try {
      // Search for relevant nodes
      const nodeDocs = await this.vectorStore.search(description, 10);
      relevantDocs.push(...nodeDocs);
      
      // Search for relevant tutorials
      const tutorialDocs = await this.vectorStore.searchByType(description, 'tutorial', 5);
      relevantDocs.push(...tutorialDocs);
      
      // Search for relevant flows
      const flowDocs = await this.vectorStore.searchByType(description, 'flow', 5);
      relevantDocs.push(...flowDocs);
      
      // If agentflow, search for agent-specific documentation
      if (flowType === 'agentflow') {
        const agentDocs = await this.vectorStore.getAgentFlows();
        relevantDocs.push(...agentDocs.slice(0, 5));
      }
      
      return relevantDocs;
    } catch (error) {
      console.error('Error retrieving relevant knowledge:', error);
      throw error;
    }
  }

  private async generateFlowConfig(description: string, flowType: string, relevantDocs: Document[]): Promise<FlowiseFlowConfig> {
    const context = this.formatContextForAI(relevantDocs);
    
    const prompt = `
You are an expert Flowise flow generator. Based on the user's description and the provided documentation, generate a valid Flowise ${flowType} configuration.

User Description: "${description}"

Flow Type: ${flowType}

Relevant Documentation:
${context}

Generate a Flowise flow configuration that includes:
1. Nodes with proper IDs, types, positions, and data
2. Edges with proper connections between nodes
3. Proper input/output handling
4. Use of templates and variables where appropriate (e.g., {{input}}, {{OPENAI_API_KEY}})

The JSON should follow this structure:
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

Important considerations:
- Use proper node types from the documentation
- Ensure connections are valid between nodes
- Include necessary parameters for each node
- Use appropriate positions for layout
- For ${flowType}, include agent-specific nodes if applicable
- Handle input/output connections properly
- Use template variables for dynamic content

Generate the complete JSON configuration:
`;

    try {
      const completion = await this.zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an expert Flowise flow generator. You generate valid Flowise JSON configurations based on user descriptions and documentation.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 4000
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from AI');
      }

      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const flowConfig = JSON.parse(jsonMatch[0]);
      return flowConfig;
    } catch (error) {
      console.error('Error generating flow config:', error);
      throw error;
    }
  }

  private formatContextForAI(docs: Document[]): string {
    let context = '';
    
    for (const doc of docs.slice(0, 10)) { // Limit to first 10 docs
      context += `\n--- Document: ${doc.metadata.source || 'Unknown'} ---\n`;
      context += `Type: ${doc.metadata.type || 'Unknown'}\n`;
      context += `Content: ${doc.pageContent.substring(0, 500)}...\n\n`;
    }
    
    return context;
  }

  private async validateFlow(flowConfig: FlowiseFlowConfig): Promise<FlowiseFlowConfig> {
    // Basic validation
    if (!flowConfig.nodes || !Array.isArray(flowConfig.nodes)) {
      throw new Error('Flow must have nodes array');
    }
    
    if (!flowConfig.edges || !Array.isArray(flowConfig.edges)) {
      throw new Error('Flow must have edges array');
    }
    
    // Validate each node
    for (const node of flowConfig.nodes) {
      if (!node.id || !node.type || !node.position || !node.data) {
        throw new Error('Node must have id, type, position, and data');
      }
      
      if (!node.data.label || !node.data.name || !node.data.category) {
        throw new Error('Node data must have label, name, and category');
      }
    }
    
    // Validate each edge
    for (const edge of flowConfig.edges) {
      if (!edge.id || !edge.source || !edge.target || !edge.sourceHandle || !edge.targetHandle) {
        throw new Error('Edge must have id, source, target, sourceHandle, and targetHandle');
      }
      
      // Check if source and target nodes exist
      const sourceNode = flowConfig.nodes.find(n => n.id === edge.source);
      const targetNode = flowConfig.nodes.find(n => n.id === edge.target);
      
      if (!sourceNode) {
        throw new Error(`Source node ${edge.source} not found`);
      }
      
      if (!targetNode) {
        throw new Error(`Target node ${edge.target} not found`);
      }
    }
    
    return flowConfig;
  }

  async suggestImprovements(flowConfig: FlowiseFlowConfig, description: string): Promise<string[]> {
    const prompt = `
Review the following Flowise flow configuration and suggest improvements based on the user's description.

User Description: "${description}"

Current Flow Configuration:
${JSON.stringify(flowConfig, null, 2)}

Suggest improvements in the following areas:
1. Node selection and configuration
2. Edge connections and flow logic
3. Parameter optimization
4. Error handling
5. Performance considerations
6. Best practices

Provide specific, actionable suggestions as a numbered list.
`;

    try {
      const completion = await this.zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an expert Flowise flow optimizer. You provide specific, actionable improvements to Flowise configurations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        return [];
      }

      // Parse suggestions from response
      const suggestions = response.split(/\d+\./).filter(s => s.trim().length > 0);
      return suggestions.map(s => s.trim());
    } catch (error) {
      console.error('Error generating suggestions:', error);
      return [];
    }
  }
}