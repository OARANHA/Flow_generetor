import { FlowiseDocProcessor } from './documentProcessor';
import { VectorStoreManager } from './vectorStore';
import fs from 'fs';
import path from 'path';

async function initializeSystem() {
  console.log('🚀 Initializing Flowise Generator System...');
  
  try {
    // Check if FlowiseDocs exists
    const docsPath = './FlowiseDocs';
    if (!fs.existsSync(docsPath)) {
      console.error('❌ FlowiseDocs directory not found. Please run the setup script first.');
      process.exit(1);
    }

    console.log('📚 Processing documentation...');
    const docProcessor = new FlowiseDocProcessor(docsPath);
    const knowledge = await docProcessor.processDocumentation();
    
    console.log(`✅ Processed ${knowledge.nodes.length} nodes`);
    console.log(`✅ Processed ${knowledge.tutorials.length} tutorials`);
    console.log(`✅ Processed ${knowledge.flows.length} flows`);
    console.log(`✅ Processed ${knowledge.agentFlows.length} agent flows`);

    console.log('🗄️  Initializing vector store...');
    const vectorStore = new VectorStoreManager();
    await vectorStore.initialize();
    
    console.log('💾 Adding knowledge to vector store...');
    await vectorStore.addKnowledge(knowledge);
    
    console.log('🎉 System initialized successfully!');
    console.log('');
    console.log('You can now use the Flowise Generator:');
    console.log('  - Web interface: http://localhost:3000/flowise-generator');
    console.log('  - CLI: npm run generate-flow "your description"');
    console.log('');
    console.log('Example commands:');
    console.log('  npm run generate-flow "Create a chatbot that searches Google and summarizes results"');
    console.log('  npm run generate-flow "Build an AgentFlow v2 that reads PDF files" --agentflow');
    
  } catch (error) {
    console.error('❌ Error initializing system:', error);
    process.exit(1);
  }
}

// Run initialization
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeSystem();
}

export { initializeSystem };