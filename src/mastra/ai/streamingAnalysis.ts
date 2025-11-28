import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { streamText } from "ai";

const openai = createOpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
});

const anthropic = createAnthropic({
  baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY,
});

export interface StreamingAnalysisOptions {
  ticker: string;
  analysisType: 'technical' | 'fundamental' | 'sentiment' | 'full';
  provider?: 'openai' | 'claude';
  personality?: string;
}

export async function* streamAnalysis(
  options: StreamingAnalysisOptions
): AsyncGenerator<string, void, unknown> {
  const { ticker, analysisType, provider = 'openai', personality } = options;
  
  const systemPrompt = `You are an expert trading analyst providing real-time analysis for ${ticker}.
${personality ? `Personality: ${personality}` : ''}

Provide ${analysisType} analysis in a streaming format, delivering insights as they're computed.
Use markdown formatting with bold headers and bullet points.
Include specific numbers, percentages, and actionable recommendations.`;

  const userPrompt = `Analyze ${ticker} with ${analysisType} analysis. Stream your insights in real-time.`;

  try {
    const model = provider === 'claude' 
      ? anthropic("claude-sonnet-4-5")
      : openai("gpt-4o");

    const result = streamText({
      model: model as any,
      system: systemPrompt,
      prompt: userPrompt,
    });

    for await (const chunk of result.textStream) {
      yield chunk;
    }
  } catch (error: any) {
    if (provider === 'claude') {
      try {
        const fallbackResult = streamText({
          model: openai("gpt-4o") as any,
          system: systemPrompt,
          prompt: userPrompt,
        });
        
        yield "[Fallback to OpenAI] ";
        for await (const chunk of fallbackResult.textStream) {
          yield chunk;
        }
      } catch (fallbackError) {
        yield `Error: Both providers failed - ${error.message}`;
      }
    } else {
      yield `Error streaming analysis: ${error.message}`;
    }
  }
}

export async function streamMultiModelAnalysis(
  ticker: string,
  onChunk: (chunk: string, source: string) => void
): Promise<{ openai: string; claude: string; consensus: string }> {
  const results = {
    openai: '',
    claude: '',
    consensus: ''
  };

  const systemPrompt = `You are an expert trading analyst. Provide concise technical analysis for ${ticker}.
Include: Current trend, key levels, RSI assessment, MACD signal, and recommendation (BUY/SELL/HOLD).
Keep response under 200 words.`;

  const openaiPromise = (async () => {
    try {
      const result = streamText({
        model: openai("gpt-4o") as any,
        system: systemPrompt,
        prompt: `Analyze ${ticker}`,
      });
      for await (const chunk of result.textStream) {
        results.openai += chunk;
        onChunk(chunk, 'openai');
      }
    } catch (error: any) {
      results.openai = `[OpenAI Error: ${error.message}]`;
      onChunk(results.openai, 'openai');
    }
  })();
  
  const claudePromise = (async () => {
    try {
      const result = streamText({
        model: anthropic("claude-sonnet-4-5") as any,
        system: systemPrompt,
        prompt: `Analyze ${ticker}`,
      });
      for await (const chunk of result.textStream) {
        results.claude += chunk;
        onChunk(chunk, 'claude');
      }
    } catch (error: any) {
      results.claude = `[Claude Error: ${error.message}]`;
      onChunk(results.claude, 'claude');
    }
  })();

  await Promise.all([openaiPromise, claudePromise]);

  if (results.openai && results.claude && 
      !results.openai.startsWith('[') && !results.claude.startsWith('[')) {
    try {
      const consensusResult = streamText({
        model: anthropic("claude-sonnet-4-5") as any,
        system: "You are a meta-analyst. Given two AI analyses, synthesize a consensus view.",
        prompt: `OpenAI Analysis:\n${results.openai}\n\nClaude Analysis:\n${results.claude}\n\nProvide a brief consensus analysis combining both perspectives.`,
      });

      for await (const chunk of consensusResult.textStream) {
        results.consensus += chunk;
        onChunk(chunk, 'consensus');
      }
    } catch (error: any) {
      results.consensus = results.openai || results.claude;
      onChunk("[Using single model result as consensus]", 'consensus');
    }
  } else {
    results.consensus = results.openai || results.claude || "Unable to generate analysis";
    onChunk("[Using available result as consensus]", 'consensus');
  }

  return results;
}

export interface RealTimeMarketData {
  ticker: string;
  price: number;
  change24h: number;
  volume: number;
  rsi?: number;
  macd?: { value: number; signal: number; histogram: number };
}

export async function* streamLiveAnalysis(
  marketData: RealTimeMarketData,
  previousAnalysis?: string
): AsyncGenerator<string, void, unknown> {
  const prompt = `
LIVE MARKET UPDATE for ${marketData.ticker}:
- Price: $${marketData.price.toFixed(2)}
- 24h Change: ${marketData.change24h >= 0 ? '+' : ''}${marketData.change24h.toFixed(2)}%
- Volume: $${(marketData.volume / 1_000_000).toFixed(2)}M
${marketData.rsi ? `- RSI(14): ${marketData.rsi.toFixed(1)}` : ''}
${marketData.macd ? `- MACD: ${marketData.macd.value.toFixed(4)}` : ''}

${previousAnalysis ? `Previous Analysis Summary: ${previousAnalysis}` : ''}

Provide real-time commentary on this data. Be concise and actionable.`;

  try {
    const result = streamText({
      model: openai("gpt-4o-mini") as any,
      system: "You are a real-time market commentator. Provide brief, punchy analysis updates.",
      prompt,
    });

    for await (const chunk of result.textStream) {
      yield chunk;
    }
  } catch (error: any) {
    yield `Error: ${error.message}`;
  }
}
