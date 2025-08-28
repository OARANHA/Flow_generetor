import { Chroma } from 'chromadb';
import { Document } from '@langchain/core/documents';
import { FlowiseKnowledge } from './documentProcessor';

export class VectorStoreManager {
  private collectionName: string;
  private client: any;
  private collection: any;
  private embeddings: any;

  constructor(collectionName: string = 'flowise-knowledge') {
    this.collectionName = collectionName;
    this.client = null;
    this.collection = null;
    this.embeddings = null;
  }

  async initialize(): Promise<void> {
    try {
      // Initialize ChromaDB client
      const { ChromaClient } = await import('chromadb');
      this.client = new ChromaClient({
        path: process.env.CHROMA_URL || 'http://localhost:8000'
      });

      // Get or create collection
      try {
        this.collection = await this.client.getCollection({ name: this.collectionName });
        console.log('Using existing collection:', this.collectionName);
      } catch (error) {
        this.collection = await this.client.createCollection({ name: this.collectionName });
        console.log('Created new collection:', this.collectionName);
      }

      console.log('Vector store initialized successfully');
    } catch (error) {
      console.error('Error initializing vector store:', error);
      throw error;
    }
  }

  async addKnowledge(knowledge: FlowiseKnowledge): Promise<void> {
    if (!this.collection) {
      throw new Error('Vector store not initialized');
    }

    try {
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
      for (let i = 0; i < documents.length; i++) {
        const doc = documents[i];
        await this.collection.add({
          ids: [doc.metadata.id || `doc_${i}`],
          documents: [doc.pageContent],
          metadatas: [doc.metadata]
        });
      }

      console.log(`Added ${documents.length} documents to vector store`);
    } catch (error) {
      console.error('Error adding knowledge to vector store:', error);
      throw error;
    }
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
    if (!this.collection) {
      throw new Error('Vector store not initialized');
    }

    try {
      const results = await this.collection.query({
        queryTexts: [query],
        nResults: k
      });

      const documents: Document[] = [];
      for (let i = 0; i < results.ids[0].length; i++) {
        documents.push(new Document({
          pageContent: results.documents[0][i],
          metadata: results.metadatas[0][i]
        }));
      }

      return documents;
    } catch (error) {
      console.error('Error searching vector store:', error);
      throw error;
    }
  }

  async searchByType(query: string, type: string, k: number = 5): Promise<Document[]> {
    if (!this.collection) {
      throw new Error('Vector store not initialized');
    }

    try {
      const results = await this.collection.query({
        queryTexts: [query],
        nResults: k,
        where: { type }
      });

      const documents: Document[] = [];
      for (let i = 0; i < results.ids[0].length; i++) {
        documents.push(new Document({
          pageContent: results.documents[0][i],
          metadata: results.metadatas[0][i]
        }));
      }

      return documents;
    } catch (error) {
      console.error('Error searching vector store by type:', error);
      throw error;
    }
  }

  async searchByCategory(query: string, category: string, k: number = 5): Promise<Document[]> {
    if (!this.collection) {
      throw new Error('Vector store not initialized');
    }

    try {
      const results = await this.collection.query({
        queryTexts: [query],
        nResults: k,
        where: { category }
      });

      const documents: Document[] = [];
      for (let i = 0; i < results.ids[0].length; i++) {
        documents.push(new Document({
          pageContent: results.documents[0][i],
          metadata: results.metadatas[0][i]
        }));
      }

      return documents;
    } catch (error) {
      console.error('Error searching vector store by category:', error);
      throw error;
    }
  }

  async getAllNodes(): Promise<Document[]> {
    if (!this.collection) {
      throw new Error('Vector store not initialized');
    }

    try {
      const results = await this.collection.query({
        queryTexts: ['node'],
        nResults: 100,
        where: { type: 'node' }
      });

      const documents: Document[] = [];
      for (let i = 0; i < results.ids[0].length; i++) {
        documents.push(new Document({
          pageContent: results.documents[0][i],
          metadata: results.metadatas[0][i]
        }));
      }

      return documents;
    } catch (error) {
      console.error('Error getting all nodes:', error);
      throw error;
    }
  }

  async getTutorials(): Promise<Document[]> {
    if (!this.collection) {
      throw new Error('Vector store not initialized');
    }

    try {
      const results = await this.collection.query({
        queryTexts: ['tutorial'],
        nResults: 50,
        where: { type: 'tutorial' }
      });

      const documents: Document[] = [];
      for (let i = 0; i < results.ids[0].length; i++) {
        documents.push(new Document({
          pageContent: results.documents[0][i],
          metadata: results.metadatas[0][i]
        }));
      }

      return documents;
    } catch (error) {
      console.error('Error getting tutorials:', error);
      throw error;
    }
  }

  async getFlows(): Promise<Document[]> {
    if (!this.collection) {
      throw new Error('Vector store not initialized');
    }

    try {
      const results = await this.collection.query({
        queryTexts: ['flow'],
        nResults: 50,
        where: { type: 'flow' }
      });

      const documents: Document[] = [];
      for (let i = 0; i < results.ids[0].length; i++) {
        documents.push(new Document({
          pageContent: results.documents[0][i],
          metadata: results.metadatas[0][i]
        }));
      }

      return documents;
    } catch (error) {
      console.error('Error getting flows:', error);
      throw error;
    }
  }

  async getAgentFlows(): Promise<Document[]> {
    if (!this.collection) {
      throw new Error('Vector store not initialized');
    }

    try {
      const results = await this.collection.query({
        queryTexts: ['agentflow'],
        nResults: 50,
        where: { category: 'agentflow' }
      });

      const documents: Document[] = [];
      for (let i = 0; i < results.ids[0].length; i++) {
        documents.push(new Document({
          pageContent: results.documents[0][i],
          metadata: results.metadatas[0][i]
        }));
      }

      return documents;
    } catch (error) {
      console.error('Error getting agent flows:', error);
      throw error;
    }
  }
}