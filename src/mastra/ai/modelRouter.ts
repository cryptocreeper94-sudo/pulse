import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";

export type ModelProvider = 'openai' | 'claude' | 'auto';
export type TaskType = 'analysis' | 'reasoning' | 'creative' | 'fast' | 'code';

const openai = createOpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
});

const anthropic = createAnthropic({
  baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY,
});

export const models = {
  openai: {
    fast: openai.responses("gpt-4o-mini"),
    standard: openai.responses("gpt-4o"),
    reasoning: openai.responses("o3-mini"),
  },
  claude: {
    fast: anthropic("claude-haiku-4-5"),
    standard: anthropic("claude-sonnet-4-5"),
    reasoning: anthropic("claude-opus-4-1"),
  }
};

export function getModelForTask(taskType: TaskType, preferredProvider: ModelProvider = 'auto') {
  if (preferredProvider === 'openai') {
    switch (taskType) {
      case 'fast': return models.openai.fast;
      case 'reasoning': return models.openai.reasoning;
      case 'code': return models.openai.standard;
      case 'analysis': return models.openai.standard;
      case 'creative': return models.openai.standard;
      default: return models.openai.standard;
    }
  }
  
  if (preferredProvider === 'claude') {
    switch (taskType) {
      case 'fast': return models.claude.fast;
      case 'reasoning': return models.claude.reasoning;
      case 'code': return models.claude.reasoning;
      case 'analysis': return models.claude.standard;
      case 'creative': return models.claude.standard;
      default: return models.claude.standard;
    }
  }
  
  switch (taskType) {
    case 'fast':
      return models.openai.fast;
    case 'reasoning':
      return models.claude.reasoning;
    case 'code':
      return models.claude.reasoning;
    case 'analysis':
      return models.openai.standard;
    case 'creative':
      return models.claude.standard;
    default:
      return models.openai.standard;
  }
}

export function detectTaskType(prompt: string): TaskType {
  const promptLower = prompt.toLowerCase();
  
  if (promptLower.includes('analyze') || 
      promptLower.includes('chart') || 
      promptLower.includes('technical') ||
      promptLower.includes('rsi') ||
      promptLower.includes('macd')) {
    return 'analysis';
  }
  
  if (promptLower.includes('why') || 
      promptLower.includes('explain') ||
      promptLower.includes('reason') ||
      promptLower.includes('strategy')) {
    return 'reasoning';
  }
  
  if (promptLower.includes('write') || 
      promptLower.includes('create') ||
      promptLower.includes('story') ||
      promptLower.includes('describe')) {
    return 'creative';
  }
  
  if (promptLower.includes('code') || 
      promptLower.includes('script') ||
      promptLower.includes('function') ||
      promptLower.includes('debug')) {
    return 'code';
  }
  
  if (promptLower.length < 50) {
    return 'fast';
  }
  
  return 'analysis';
}

export interface MultiModelResponse {
  text: string;
  provider: string;
  model: string;
  taskType: TaskType;
  confidence?: number;
  usage?: {
    promptTokens: number;
    completionTokens: number;
  };
}

export async function multiModelQuery(
  prompt: string,
  options: {
    provider?: ModelProvider;
    taskType?: TaskType;
    systemPrompt?: string;
  } = {}
): Promise<MultiModelResponse> {
  const { generateText } = await import('ai');
  
  const taskType = options.taskType || detectTaskType(prompt);
  const provider = options.provider || 'auto';
  
  const modelConfig = getModelForTask(taskType, provider);
  const actualProvider = provider === 'auto' ? 
    (taskType === 'reasoning' || taskType === 'code' ? 'claude' : 'openai') : provider;
  
  const modelName = actualProvider === 'claude' ? 
    (taskType === 'fast' ? 'claude-haiku-4-5' : taskType === 'reasoning' ? 'claude-opus-4-1' : 'claude-sonnet-4-5') :
    (taskType === 'fast' ? 'gpt-4o-mini' : taskType === 'reasoning' ? 'o3-mini' : 'gpt-4o');
  
  try {
    const result = await generateText({
      model: modelConfig as any,
      system: options.systemPrompt || 'You are a helpful AI assistant.',
      prompt,
    });
    
    return {
      text: result.text,
      provider: actualProvider,
      model: modelName,
      taskType,
      confidence: 0.9,
      usage: {
        promptTokens: result.usage?.promptTokens || 0,
        completionTokens: result.usage?.completionTokens || 0,
      }
    };
  } catch (error: any) {
    if (actualProvider === 'claude') {
      try {
        const fallbackModel = models.openai.standard;
        const fallbackResult = await generateText({
          model: fallbackModel as any,
          system: options.systemPrompt || 'You are a helpful AI assistant.',
          prompt,
        });
        
        return {
          text: fallbackResult.text,
          provider: 'openai',
          model: 'gpt-4o',
          taskType,
          confidence: 0.85,
          usage: {
            promptTokens: fallbackResult.usage?.promptTokens || 0,
            completionTokens: fallbackResult.usage?.completionTokens || 0,
          }
        };
      } catch (fallbackError) {
        throw new Error(`Both providers failed: ${error.message}`);
      }
    }
    throw error;
  }
}
