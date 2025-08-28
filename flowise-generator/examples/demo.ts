#!/usr/bin/env node

/**
 * Flowise Generator Example Script
 * 
 * This script demonstrates how to use the Flowise Generator
 * to create various types of flows from natural language descriptions.
 */

import FlowiseGenerator from '../src/index.js';

async function runExamples() {
  console.log('🚀 Flowise Generator Examples\n');

  const generator = new FlowiseGenerator();
  
  try {
    // Initialize the system
    console.log('📚 Initializing system...');
    await generator.initialize();
    console.log('✅ System initialized successfully!\n');

    // Example 1: Simple ChatFlow
    console.log('📝 Example 1: Simple ChatFlow');
    console.log('Description: "Create a chatbot that searches Google and summarizes results"');
    
    const example1 = await generator.generateFlowWithTimestamp(
      'Create a chatbot that searches Google and summarizes results using GPT-4',
      'chatflow'
    );
    
    console.log(`✅ Generated ChatFlow with ${example1.flowConfig.nodes.length} nodes and ${example1.flowConfig.edges.length} edges`);
    console.log(`📁 Saved to: ${example1.filePath}\n`);

    // Example 2: AgentFlow v2
    console.log('📝 Example 2: AgentFlow v2');
    console.log('Description: "Build an agent that can read PDF files and answer questions"');
    
    const example2 = await generator.generateFlowWithTimestamp(
      'Build an AgentFlow v2 that can read PDF files, answer questions about the content, and save responses to a database',
      'agentflow'
    );
    
    console.log(`✅ Generated AgentFlow with ${example2.flowConfig.nodes.length} nodes and ${example2.flowConfig.edges.length} edges`);
    console.log(`📁 Saved to: ${example2.filePath}\n`);

    // Example 3: Customer Support Bot
    console.log('📝 Example 3: Customer Support Bot');
    console.log('Description: "Create a customer support chatbot with memory"');
    
    const example3 = await generator.generateFlowWithTimestamp(
      'Create a customer support chatbot with memory that can maintain conversation context and escalate to human agents when needed',
      'chatflow'
    );
    
    console.log(`✅ Generated Customer Support Bot with ${example3.flowConfig.nodes.length} nodes and ${example3.flowConfig.edges.length} edges`);
    console.log(`📁 Saved to: ${example3.filePath}\n`);

    // Example 4: Multi-Agent System
    console.log('📝 Example 4: Multi-Agent System');
    console.log('Description: "Create a multi-agent research system"');
    
    const example4 = await generator.generateFlowWithTimestamp(
      'Create a multi-agent system where one agent searches for information, another agent analyzes the data, and a third agent generates a comprehensive report',
      'agentflow'
    );
    
    console.log(`✅ Generated Multi-Agent System with ${example4.flowConfig.nodes.length} nodes and ${example4.flowConfig.edges.length} edges`);
    console.log(`📁 Saved to: ${example4.filePath}\n`);

    // Get suggestions for one of the examples
    console.log('💡 Getting improvement suggestions for Example 1...');
    const suggestions = await generator.getSuggestions(example1.flowConfig, 'Create a chatbot that searches Google and summarizes results using GPT-4');
    
    if (suggestions.length > 0) {
      console.log('📋 Suggestions:');
      suggestions.forEach((suggestion, index) => {
        console.log(`   ${index + 1}. ${suggestion}`);
      });
    } else {
      console.log('ℹ️  No suggestions available');
    }
    
    console.log('\n🎉 All examples completed successfully!');
    console.log('\n📂 Generated files:');
    console.log(`   - ${example1.filePath}`);
    console.log(`   - ${example2.filePath}`);
    console.log(`   - ${example3.filePath}`);
    console.log(`   - ${example4.filePath}`);
    
    console.log('\n💡 You can now import these JSON files into Flowise!');
    console.log('🌐 Web interface: http://localhost:3000/flowise-generator');
    console.log('💻 CLI usage: npm run generate-flow "your description"');

  } catch (error) {
    console.error('❌ Error running examples:', error);
    process.exit(1);
  }
}

// Interactive mode
async function interactiveMode() {
  console.log('🤖 Flowise Generator - Interactive Mode\n');
  console.log('Enter your flow description (or "exit" to quit):\n');

  const generator = new FlowiseGenerator();
  await generator.initialize();

  const readline = await import('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const askQuestion = (question) => {
    return new Promise((resolve) => {
      rl.question(question, resolve);
    });
  };

  while (true) {
    const description = await askQuestion('Flow description: ');
    
    if (description.toLowerCase() === 'exit') {
      break;
    }

    if (!description.trim()) {
      console.log('⚠️  Please enter a valid description\n');
      continue;
    }

    const flowType = await askQuestion('Flow type (chatflow/agentflow) [chatflow]: ');
    const selectedType = flowType.toLowerCase() === 'agentflow' ? 'agentflow' : 'chatflow';

    try {
      console.log('\n🔄 Generating flow...\n');
      const result = await generator.generateFlowWithTimestamp(description, selectedType);
      
      console.log('✅ Flow generated successfully!');
      console.log(`📊 Nodes: ${result.flowConfig.nodes.length}`);
      console.log(`🔗 Edges: ${result.flowConfig.edges.length}`);
      console.log(`📁 Saved to: ${result.filePath}\n`);

      const suggestions = await generator.getSuggestions(result.flowConfig, description);
      if (suggestions.length > 0) {
        console.log('💡 Suggestions for improvement:');
        suggestions.forEach((suggestion, index) => {
          console.log(`   ${index + 1}. ${suggestion}`);
        });
        console.log('');
      }

    } catch (error) {
      console.error('❌ Error generating flow:', error.message);
      console.log('');
    }
  }

  rl.close();
  console.log('\n👋 Goodbye!');
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--interactive') || args.includes('-i')) {
    await interactiveMode();
  } else {
    await runExamples();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { runExamples, interactiveMode };