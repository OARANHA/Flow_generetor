import { Chroma } from '@langchain/community/vectorstores/chroma';
import { Document } from '@langchain/core/documents';
import { OpenAIEmbeddings } from '@langchain/openai';
import { FlowiseKnowledge } from './documentProcessor';

export class VectorStoreManager {
  private collectionName: string;
  private embeddings: OpenAIEmbeddings;
  private vectorStore: Chroma | null = null;

  constructor(collectionName: string = 'flowise-knowledge') {
    this.collectionName = collectionName;
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'text-embedding-ada-002'
    });
  }

  async initialize(): Promise<void> {
    try {
      this.vectorStore = await Chroma.fromDocuments(
        [],
        this.embeddings,
        {
          collectionName: this.collectionName,
          url: process.env.CHROMA_URL || 'http://localhost:8000'
        }
      );
      console.log('Vector store initialized successfully');
    } catch (error) {
      console.error('Error initializing vector store:', error);
      throw error;
    }
  }

  async addKnowledge(knowledge: FlowiseKnowledge): Promise<void> {
    if (!this.vectorStore) {
      throw new Error('Vector store not initialized');
    }

    const documents: Document[] = [];

    // Add nodes as documents
    for (const node of knowledge.nodes) {
      const doc = new Document({
        pageContent: this.formatNodeAsDocument(node),
        metadata: {
          type: 'node',
          category: node.category,
          nodeType: node.type,
          nodeId: node.id,
          name: node.name
        }
      });
      documents.push(doc);
    }

    // Add tutorials
    documents.push(...knowledge.tutorials);

    // Add flows
    documents.push(...knowledge.flows);

    // Add agent flows
    documents.push(...knowledge.agentFlows);

    // Add documents to vector store
    await this.vectorStore.addDocuments(documents);
    console.log(`Added ${documents.length} documents to vector store`);
  }

  private formatNodeAsDocument(node: any): string {
    let content = `Node: ${node.name}\n`;
    content += `Type: ${node.type}\n`;
    content += `Category: ${node.category}\n`;
    content += `Description: ${node.description}\n`;
    
    if (node.parameters && node.parameters.length > 0) {
      content += '\nParameters:\n';
      for (const param of node.parameters) {
        content += `- ${param.name}: ${param.description} (${param.type}${param.required ? ', required' : ''})\n`;
      }
    }
    
    if (node.examples && node.examples.length > 0) {
      content += '\nExamples:\n';
      for (const example of node.examples) {
        content += `- ${example}\n`;
      }
    }
    
    if (node.connections && node.connections.length > 0) {
      content += '\nConnections:\n';
      for (const connection of node.connections) {
        content += `- ${connection}\n`;
      }
    }
    
    return content;
  }

  async search(query: string, k: number = 5): Promise<Document[]> {
    if (!this.vectorStore) {
      throw new Error('Vector store not initialized');
    }

    try {
      const results = await this.vectorStore.similaritySearch(query, k);
      return results;
    } catch (error) {
      console.error('Error searching vector store:', error);
      throw error;
    }
  }

  async searchByType(query: string, type: string, k: number = 5): Promise<Document[]> {
    if (!this.vectorStore) {
      throw new Error('Vector store not initialized');
    }

    try {
      // Create a filter for the specific type
      const filter = { type };
      const results = await this.vectorStore.similaritySearch(query, k, filter);
      return results;
    } catch (error) {
      console.error('Error searching vector store by type:', error);
      throw error;
    }
  }

  async searchByCategory(query: string, category: string, k: number = 5): Promise<Document[]> {
    if (!this.vectorStore) {
      throw new Error('Vector store not initialized');
    }

    try {
      // Create a filter for the specific category
      const filter = { category };
      const results = await this.vectorStore.similaritySearch(query, k, filter);
      return results;
    } catch (error) {
      console.error('Error searching vector store by category:', error);
      throw error;
    }
  }

  async getAllNodes(): Promise<Document[]> {
    if (!this.vectorStore) {
      throw new Error('Vector store not initialized');
    }

    try {
      // Get all documents with type 'node'
      const filter = { type: 'node' };
      const results = await this.vectorStore.similaritySearch('node', 100, filter);
      return results;
    } catch (error) {
      console.error('Error getting all nodes:', error);
      throw error;
    }
  }

  async getTutorials(): Promise<Document[]> {
    if (!this.vectorStore) {
      throw new Error('Vector store not initialized');
    }

    try {
      // Get all documents with type 'tutorial'
      const filter = { type: 'tutorial' };
      const results = await this.vectorStore.similaritySearch('tutorial', 50, filter);
      return results;
    } catch (error) {
      console.error('Error getting tutorials:', error);
      throw error;
    }
  }

  async getFlows(): Promise<Document[]> {
    if (!this.vectorStore) {
      throw new Error('Vector store not initialized');
    }

    try {
      // Get all documents with type 'flow'
      const filter = { type: 'flow' };
      const results = await this.vectorStore.similaritySearch('flow', 50, filter);
      return results;
    } catch (error) {
      console.error('Error getting flows:', error);
      throw error;
    }
  }

  async getAgentFlows(): Promise<Document[]> {
    if (!this.vectorStore) {
      throw new Error('Vector store not initialized');
    }

    try {
      // Get all documents with category 'agentflow'
      const filter = { category: 'agentflow' };
      const results = await this.vectorStore.similaritySearch('agentflow', 50, filter);
      return results;
    } catch (error) {
      console.error('Error getting agent flows:', error);
      throw error;
    }
  }
}