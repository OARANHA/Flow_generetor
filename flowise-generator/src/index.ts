import { FlowiseDocProcessor, FlowiseKnowledge } from './documentProcessor';
import { VectorStoreManager } from './vectorStore';
import { FlowiseAgent, FlowiseFlowConfig } from './flowiseAgent';
import fs from 'fs';
import path from 'path';

export class FlowiseGenerator {
  private docProcessor: FlowiseDocProcessor;
  private vectorStore: VectorStoreManager;
  private agent: FlowiseAgent;
  private initialized: boolean = false;

  constructor(docsPath: string = './FlowiseDocs') {
    this.docProcessor = new FlowiseDocProcessor(docsPath);
    this.vectorStore = new VectorStoreManager();
    this.agent = new FlowiseAgent(this.vectorStore);
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      console.log('Initializing Flowise Generator...');
      
      // Initialize vector store
      await this.vectorStore.initialize();
      
      // Process documentation
      console.log('Processing documentation...');
      const knowledge = await this.docProcessor.processDocumentation();
      console.log(`Processed ${knowledge.nodes.length} nodes, ${knowledge.tutorials.length} tutorials, ${knowledge.flows.length} flows, ${knowledge.agentFlows.length} agent flows`);
      
      // Add knowledge to vector store
      console.log('Adding knowledge to vector store...');
      await this.vectorStore.addKnowledge(knowledge);
      
      // Initialize agent
      console.log('Initializing agent...');
      await this.agent.initialize();
      
      this.initialized = true;
      console.log('Flowise Generator initialized successfully!');
    } catch (error) {
      console.error('Error initializing Flowise Generator:', error);
      throw error;
    }
  }

  async generateFlow(
    description: string,
    flowType: 'chatflow' | 'agentflow' = 'chatflow',
    outputPath?: string
  ): Promise<FlowiseFlowConfig> {
    if (!this.initialized) {
      throw new Error('Flowise Generator not initialized. Call initialize() first.');
    }

    try {
      console.log(`Generating ${flowType} for: "${description}"`);
      
      // Generate flow configuration
      const flowConfig = await this.agent.generateFlow(description, flowType);
      
      // Save to file if outputPath is provided
      if (outputPath) {
        await this.saveFlow(flowConfig, outputPath);
      }
      
      console.log(`${flowType} generated successfully!`);
      return flowConfig;
    } catch (error) {
      console.error('Error generating flow:', error);
      throw error;
    }
  }

  async saveFlow(flowConfig: FlowiseFlowConfig, outputPath: string): Promise<void> {
    try {
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      const jsonContent = JSON.stringify(flowConfig, null, 2);
      fs.writeFileSync(outputPath, jsonContent);
      console.log(`Flow saved to: ${outputPath}`);
    } catch (error) {
      console.error('Error saving flow:', error);
      throw error;
    }
  }

  async generateFlowWithTimestamp(
    description: string,
    flowType: 'chatflow' | 'agentflow' = 'chatflow',
    outputDir: string = './output'
  ): Promise<{ flowConfig: FlowiseFlowConfig; filePath: string }> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `flow_${timestamp}.json`;
    const filePath = path.join(outputDir, fileName);
    
    const flowConfig = await this.generateFlow(description, flowType, filePath);
    
    return {
      flowConfig,
      filePath
    };
  }

  async getSuggestions(flowConfig: FlowiseFlowConfig, description: string): Promise<string[]> {
    if (!this.initialized) {
      throw new Error('Flowise Generator not initialized. Call initialize() first.');
    }

    try {
      return await this.agent.suggestImprovements(flowConfig, description);
    } catch (error) {
      console.error('Error getting suggestions:', error);
      return [];
    }
  }

  async searchKnowledge(query: string, limit: number = 10): Promise<any[]> {
    if (!this.initialized) {
      throw new Error('Flowise Generator not initialized. Call initialize() first.');
    }

    try {
      const docs = await this.vectorStore.search(query, limit);
      return docs.map(doc => ({
        content: doc.pageContent,
        metadata: doc.metadata
      }));
    } catch (error) {
      console.error('Error searching knowledge:', error);
      return [];
    }
  }

  async getAvailableNodes(): Promise<any[]> {
    if (!this.initialized) {
      throw new Error('Flowise Generator not initialized. Call initialize() first.');
    }

    try {
      const docs = await this.vectorStore.getAllNodes();
      return docs.map(doc => ({
        content: doc.pageContent,
        metadata: doc.metadata
      }));
    } catch (error) {
      console.error('Error getting available nodes:', error);
      return [];
    }
  }

  async getTutorials(): Promise<any[]> {
    if (!this.initialized) {
      throw new Error('Flowise Generator not initialized. Call initialize() first.');
    }

    try {
      const docs = await this.vectorStore.getTutorials();
      return docs.map(doc => ({
        content: doc.pageContent,
        metadata: doc.metadata
      }));
    } catch (error) {
      console.error('Error getting tutorials:', error);
      return [];
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

// Export for use as module
export default FlowiseGenerator;

// CLI interface
if (require.main === module) {
  async function main() {
    const generator = new FlowiseGenerator();
    
    try {
      await generator.initialize();
      
      const args = process.argv.slice(2);
      if (args.length === 0) {
        console.log('Usage: npm run generate-flow "<description>" [--agentflow] [--output <path>]');
        console.log('Example: npm run generate-flow "Create a chatbot that searches Google and summarizes results" --agentflow');
        return;
      }
      
      const description = args[0];
      const flowType: 'chatflow' | 'agentflow' = args.includes('--agentflow') ? 'agentflow' : 'chatflow';
      const outputIndex = args.indexOf('--output');
      const outputPath = outputIndex !== -1 ? args[outputIndex + 1] : undefined;
      
      console.log(`Generating ${flowType} for: "${description}"`);
      
      const result = outputPath 
        ? await generator.generateFlow(description, flowType, outputPath)
        : await generator.generateFlowWithTimestamp(description, flowType);
      
      if (outputPath) {
        console.log(`Flow saved to: ${outputPath}`);
      } else {
        console.log(`Flow saved to: ${result.filePath}`);
      }
      
      // Get suggestions
      const suggestions = await generator.getSuggestions(
        outputPath ? result : result.flowConfig, 
        description
      );
      
      if (suggestions.length > 0) {
        console.log('\nSuggestions for improvement:');
        suggestions.forEach((suggestion, index) => {
          console.log(`${index + 1}. ${suggestion}`);
        });
      }
      
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  }
  
  main();
}