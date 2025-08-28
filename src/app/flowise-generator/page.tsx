'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Download, Lightbulb, Copy, Check } from 'lucide-react';

interface FlowiseFlowConfig {
  nodes: any[];
  edges: any[];
  viewport?: { x: number; y: number; zoom: number };
}

export default function FlowiseGeneratorPage() {
  const [description, setDescription] = useState('');
  const [flowType, setFlowType] = useState<'chatflow' | 'agentflow'>('chatflow');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedFlow, setGeneratedFlow] = useState<FlowiseFlowConfig | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateFlow = async () => {
    if (!description.trim()) {
      setError('Please enter a description for your flow');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedFlow(null);
    setSuggestions([]);

    try {
      const response = await fetch('/api/flowise/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description,
          flowType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate flow');
      }

      const data = await response.json();
      setGeneratedFlow(data.flowConfig);
      setSuggestions(data.suggestions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadFlow = () => {
    if (!generatedFlow) return;

    const blob = new Blob([JSON.stringify(generatedFlow, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flowise-${flowType}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    if (!generatedFlow) return;

    navigator.clipboard.writeText(JSON.stringify(generatedFlow, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exampleDescriptions = [
    "Create a chatbot that searches Google and summarizes the results using GPT-4",
    "Build an AgentFlow v2 that can read PDF files, answer questions about the content, and save responses to a database",
    "Create a chatbot with memory that can maintain conversation context across multiple sessions",
    "Build a flow that processes CSV files, performs data analysis, and generates reports",
    "Create an agent that can browse websites, extract information, and create structured summaries"
  ];

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Flowise Flow Generator</h1>
        <p className="text-muted-foreground">
          Generate valid Flowise flows from natural language descriptions using AI
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Describe Your Flow</CardTitle>
            <CardDescription>
              Enter a natural language description of the flow you want to create
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Flow Type</label>
              <Select value={flowType} onValueChange={(value: 'chatflow' | 'agentflow') => setFlowType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chatflow">ChatFlow</SelectItem>
                  <SelectItem value="agentflow">AgentFlow v2</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Textarea
                placeholder="Describe the flow you want to create..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                className="resize-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Examples</label>
              <div className="space-y-2">
                {exampleDescriptions.map((example, index) => (
                  <div
                    key={index}
                    className="p-2 bg-muted rounded-md text-sm cursor-pointer hover:bg-muted/80 transition-colors"
                    onClick={() => setDescription(example)}
                  >
                    {example}
                  </div>
                ))}
              </div>
            </div>

            <Button 
              onClick={generateFlow} 
              disabled={isGenerating || !description.trim()}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Flow...
                </>
              ) : (
                'Generate Flow'
              )}
            </Button>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card>
          <CardHeader>
            <CardTitle>Generated Flow</CardTitle>
            <CardDescription>
              Your Flowise-compatible JSON configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            {generatedFlow ? (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button onClick={downloadFlow} variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download JSON
                  </Button>
                  <Button onClick={copyToClipboard} variant="outline" size="sm">
                    {copied ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy JSON
                      </>
                    )}
                  </Button>
                </div>

                <Tabs defaultValue="preview" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                    <TabsTrigger value="json">JSON</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="preview" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Nodes:</span> {generatedFlow.nodes.length}
                      </div>
                      <div>
                        <span className="font-medium">Edges:</span> {generatedFlow.edges.length}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Nodes:</h4>
                      <div className="space-y-1">
                        {generatedFlow.nodes.map((node, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Badge variant="secondary">{node.type}</Badge>
                            <span className="text-sm">{node.data.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="json">
                    <pre className="bg-muted p-4 rounded-md overflow-auto max-h-96 text-sm">
                      {JSON.stringify(generatedFlow, null, 2)}
                    </pre>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                {isGenerating ? (
                  <div className="space-y-2">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                    <p>Generating your flow...</p>
                  </div>
                ) : (
                  <p>Enter a description and click "Generate Flow" to create your Flowise configuration</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Suggestions Section */}
      {suggestions.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Suggestions for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">
                    {index + 1}
                  </Badge>
                  <p className="text-sm">{suggestion}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}