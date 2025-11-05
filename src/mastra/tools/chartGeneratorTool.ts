import { createTool } from "@mastra/core/tools";
import { z } from "zod";

/**
 * Chart Generator Tool - Creates price chart with moving averages using QuickChart.io
 * Generates a visual chart showing price action with EMA 50 and EMA 200 overlaid
 */

export const chartGeneratorTool = createTool({
  id: "chart-generator-tool",
  description: "Generates a price chart with 50-day and 200-day moving averages overlaid. Returns a chart URL that can be displayed in Telegram.",

  inputSchema: z.object({
    ticker: z.string().describe("Ticker symbol"),
    prices: z.array(z.object({
      timestamp: z.number(),
      close: z.number(),
    })).describe("Historical price data"),
    ema50: z.array(z.number()).describe("50-day EMA values"),
    ema200: z.array(z.number()).describe("200-day EMA values"),
  }),

  outputSchema: z.object({
    chartUrl: z.string(),
    success: z.boolean(),
    message: z.string(),
  }),

  execute: async ({ context, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info('🔧 [ChartGeneratorTool] Starting chart generation', { ticker: context.ticker });

    try {
      // Take last 90 days of data for the chart
      const dataPoints = Math.min(90, context.prices.length);
      const recentPrices = context.prices.slice(-dataPoints);
      
      // Format dates for labels
      const labels = recentPrices.map(p => {
        const date = new Date(p.timestamp * 1000);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      });

      // Get close prices
      const closePrices = recentPrices.map(p => p.close);

      // Align EMAs with price data (EMAs are shorter due to calculation period)
      // Guard against edge cases where EMA arrays might be empty or too short
      const ema50Data = context.ema50.length > 0 ? context.ema50.slice(-Math.min(dataPoints, context.ema50.length)) : [];
      const ema200Data = context.ema200.length > 0 ? context.ema200.slice(-Math.min(dataPoints, context.ema200.length)) : [];

      // Pad EMAs with nulls at the beginning to align with price data
      const ema50PadLength = Math.max(0, dataPoints - ema50Data.length);
      const ema200PadLength = Math.max(0, dataPoints - ema200Data.length);
      const ema50Padded = [...Array(ema50PadLength).fill(null), ...ema50Data];
      const ema200Padded = [...Array(ema200PadLength).fill(null), ...ema200Data];

      // Create Chart.js v4 configuration
      const chartConfig = {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Price',
              data: closePrices,
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.1)',
              borderWidth: 2,
              fill: true,
              tension: 0.1,
            },
            {
              label: 'EMA 50',
              data: ema50Padded,
              borderColor: 'rgb(255, 159, 64)',
              borderWidth: 2,
              fill: false,
              tension: 0.1,
              pointRadius: 0,
            },
            {
              label: 'EMA 200',
              data: ema200Padded,
              borderColor: 'rgb(153, 102, 255)',
              borderWidth: 2,
              fill: false,
              tension: 0.1,
              pointRadius: 0,
            },
          ],
        },
        options: {
          plugins: {
            title: {
              display: true,
              text: `${context.ticker} - Price with Moving Averages`,
              font: {
                size: 16,
              },
            },
            legend: {
              display: true,
              position: 'bottom',
            },
          },
          scales: {
            y: {
              ticks: {
                callback: function(value: any) {
                  return '$' + value.toFixed(2);
                },
              },
            },
          },
        },
      };

      // Encode chart config for QuickChart.io
      const chartJson = JSON.stringify(chartConfig);
      const encodedChart = encodeURIComponent(chartJson);

      // Generate QuickChart.io URL (free service, no API key needed)
      const chartUrl = `https://quickchart.io/chart?width=800&height=400&chart=${encodedChart}`;

      logger?.info('✅ [ChartGeneratorTool] Chart generated successfully', { 
        ticker: context.ticker,
        dataPoints 
      });

      return {
        chartUrl,
        success: true,
        message: `Chart generated for ${context.ticker} with ${dataPoints} days of data`,
      };
    } catch (error: any) {
      logger?.error('❌ [ChartGeneratorTool] Error generating chart', { error: error.message });
      
      // Return a fallback - don't fail the entire analysis
      return {
        chartUrl: '',
        success: false,
        message: `Chart generation failed: ${error.message}`,
      };
    }
  },
});
