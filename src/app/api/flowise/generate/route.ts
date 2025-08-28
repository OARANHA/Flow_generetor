import { NextRequest, NextResponse } from 'next/server';
import FlowiseGenerator from '../../../../flowise-generator/src/index';

// Global generator instance to avoid reinitialization
let generator: FlowiseGenerator | null = null;

async function getGenerator(): Promise<FlowiseGenerator> {
  if (!generator) {
    generator = new FlowiseGenerator();
    await generator.initialize();
  }
  return generator;
}

export async function POST(request: NextRequest) {
  try {
    const { description, flowType = 'chatflow' } = await request.json();

    if (!description) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }

    const generator = await getGenerator();
    
    // Generate flow with timestamp
    const result = await generator.generateFlowWithTimestamp(description, flowType);
    
    // Get suggestions for improvement
    const suggestions = await generator.getSuggestions(result.flowConfig, description);

    return NextResponse.json({
      flowConfig: result.flowConfig,
      filePath: result.filePath,
      suggestions,
      flowType,
      description
    });

  } catch (error) {
    console.error('Error generating flow:', error);
    return NextResponse.json(
      { error: 'Failed to generate flow' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const generator = await getGenerator();
    
    // Get available nodes and tutorials for reference
    const [nodes, tutorials] = await Promise.all([
      generator.getAvailableNodes(),
      generator.getTutorials()
    ]);

    return NextResponse.json({
      nodes: nodes.slice(0, 10), // Return first 10 nodes
      tutorials: tutorials.slice(0, 5), // Return first 5 tutorials
      status: 'ready'
    });

  } catch (error) {
    console.error('Error getting generator info:', error);
    return NextResponse.json(
      { error: 'Failed to get generator info' },
      { status: 500 }
    );
  }
}