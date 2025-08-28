import fs from 'fs';
import path from 'path';
import { Document } from '@langchain/core/documents';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

export interface FlowiseNode {
  id: string;
  type: string;
  category: string;
  name: string;
  description: string;
  parameters: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
    defaultValue?: any;
  }>;
  examples?: string[];
  connections?: string[];
}

export interface FlowiseKnowledge {
  nodes: FlowiseNode[];
  tutorials: Document[];
  flows: Document[];
  agentFlows: Document[];
}

export class FlowiseDocProcessor {
  private basePath: string;

  constructor(basePath: string = './FlowiseDocs') {
    this.basePath = basePath;
  }

  async processDocumentation(): Promise<FlowiseKnowledge> {
    const knowledge: FlowiseKnowledge = {
      nodes: [],
      tutorials: [],
      flows: [],
      agentFlows: []
    };

    // Process nodes from integrations/langchain
    await this.processNodes(knowledge);
    
    // Process tutorials
    await this.processTutorials(knowledge);
    
    // Process flows documentation
    await this.processFlows(knowledge);

    return knowledge;
  }

  private async processNodes(knowledge: FlowiseKnowledge): Promise<void> {
    const nodesPath = path.join(this.basePath, 'en/integrations/langchain');
    
    if (!fs.existsSync(nodesPath)) {
      console.warn(`Nodes path not found: ${nodesPath}`);
      return;
    }

    const categories = fs.readdirSync(nodesPath);
    
    for (const category of categories) {
      const categoryPath = path.join(nodesPath, category);
      const stat = fs.statSync(categoryPath);
      
      if (stat.isDirectory()) {
        await this.processNodeCategory(category, categoryPath, knowledge);
      }
    }
  }

  private async processNodeCategory(category: string, categoryPath: string, knowledge: FlowiseKnowledge): Promise<void> {
    const files = fs.readdirSync(categoryPath);
    
    for (const file of files) {
      if (file.endsWith('.md') && file !== 'README.md') {
        const filePath = path.join(categoryPath, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        
        const node = this.parseNodeDocument(content, category, file);
        if (node) {
          knowledge.nodes.push(node);
        }
      }
    }
  }

  private parseNodeDocument(content: string, category: string, filename: string): FlowiseNode | null {
    const lines = content.split('\n');
    const name = filename.replace('.md', '');
    
    let description = '';
    let parameters: any[] = [];
    let examples: string[] = [];
    let connections: string[] = [];
    
    let inParameters = false;
    let inExamples = false;
    let inConnections = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('# ')) {
        // Skip title
        continue;
      } else if (line.startsWith('## ') && !inParameters && !inExamples && !inConnections) {
        description += line.replace('## ', '') + '\n';
      } else if (line.toLowerCase().includes('parameter') || line.toLowerCase().includes('input')) {
        inParameters = true;
        inExamples = false;
        inConnections = false;
      } else if (line.toLowerCase().includes('example')) {
        inExamples = true;
        inParameters = false;
        inConnections = false;
      } else if (line.toLowerCase().includes('connection') || line.toLowerCase().includes('connect')) {
        inConnections = true;
        inParameters = false;
        inExamples = false;
      } else if (line.startsWith('-') && inParameters) {
        const param = this.parseParameter(line);
        if (param) {
          parameters.push(param);
        }
      } else if (line.startsWith('-') && inExamples) {
        examples.push(line.replace('- ', ''));
      } else if (line.startsWith('-') && inConnections) {
        connections.push(line.replace('- ', ''));
      } else if (line.startsWith('##') && (inParameters || inExamples || inConnections)) {
        inParameters = false;
        inExamples = false;
        inConnections = false;
      }
    }
    
    return {
      id: `${category}-${name}`,
      type: name,
      category,
      name,
      description: description.trim(),
      parameters,
      examples,
      connections
    };
  }

  private parseParameter(line: string): any {
    // Simple parameter parsing - can be enhanced
    const match = line.match(/-\s*`([^`]+)`\s*:\s*([^-\n]+)/);
    if (match) {
      const [, name, description] = match;
      return {
        name,
        type: 'string', // Default type
        required: description.toLowerCase().includes('required'),
        description: description.trim()
      };
    }
    return null;
  }

  private async processTutorials(knowledge: FlowiseKnowledge): Promise<void> {
    const tutorialsPath = path.join(this.basePath, 'en/tutorials');
    
    if (!fs.existsSync(tutorialsPath)) {
      console.warn(`Tutorials path not found: ${tutorialsPath}`);
      return;
    }

    const files = fs.readdirSync(tutorialsPath);
    
    for (const file of files) {
      if (file.endsWith('.md') && file !== 'README.md') {
        const filePath = path.join(tutorialsPath, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        
        const doc = new Document({
          pageContent: content,
          metadata: {
            source: file,
            type: 'tutorial',
            category: 'tutorial'
          }
        });
        
        knowledge.tutorials.push(doc);
      }
    }
  }

  private async processFlows(knowledge: FlowiseKnowledge): Promise<void> {
    const flowsPath = path.join(this.basePath, 'en/using-flowise');
    
    if (!fs.existsSync(flowsPath)) {
      console.warn(`Flows path not found: ${flowsPath}`);
      return;
    }

    const files = fs.readdirSync(flowsPath);
    
    for (const file of files) {
      if (file.endsWith('.md')) {
        const filePath = path.join(flowsPath, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        
        const doc = new Document({
          pageContent: content,
          metadata: {
            source: file,
            type: 'flow',
            category: file.includes('agentflow') ? 'agentflow' : 'chatflow'
          }
        });
        
        if (file.includes('agentflow')) {
          knowledge.agentFlows.push(doc);
        } else {
          knowledge.flows.push(doc);
        }
      }
    }
  }

  async splitDocuments(documents: Document[]): Promise<Document[]> {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
      separators: ['\n\n', '\n', ' ', '']
    });
    
    return await splitter.splitDocuments(documents);
  }
}