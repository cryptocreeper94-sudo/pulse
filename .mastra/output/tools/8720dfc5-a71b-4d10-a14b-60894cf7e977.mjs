import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

const chartGeneratorTool = createTool({
  id: "chart-generator-tool",
  description: "Generates a price chart with 50-day and 200-day moving averages overlaid. Returns a chart URL that can be displayed in Telegram.",
  inputSchema: z.object({
    ticker: z.string().describe("Ticker symbol"),
    prices: z.array(z.object({
      timestamp: z.number(),
      open: z.number().optional(),
      high: z.number().optional(),
      low: z.number().optional(),
      close: z.number()
    })).describe("Historical price data"),
    ema50: z.array(z.number()).describe("50-day EMA values"),
    ema200: z.array(z.number()).describe("200-day EMA values"),
    chartType: z.enum(["line", "candlestick"]).optional().describe("Chart type: line or candlestick (defaults to line)")
  }),
  outputSchema: z.object({
    chartUrl: z.string(),
    success: z.boolean(),
    message: z.string()
  }),
  execute: async ({ context, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info("\u{1F527} [ChartGeneratorTool] Starting chart generation", { ticker: context.ticker });
    try {
      const dataPoints = Math.min(90, context.prices.length);
      const recentPrices = context.prices.slice(-dataPoints);
      const labels = recentPrices.map((p) => {
        const date = new Date(p.timestamp * 1e3);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      });
      const closePrices = recentPrices.map((p) => p.close);
      const ema50Data = context.ema50.length > 0 ? context.ema50.slice(-Math.min(dataPoints, context.ema50.length)) : [];
      const ema200Data = context.ema200.length > 0 ? context.ema200.slice(-Math.min(dataPoints, context.ema200.length)) : [];
      const ema50PadLength = Math.max(0, dataPoints - ema50Data.length);
      const ema200PadLength = Math.max(0, dataPoints - ema200Data.length);
      const ema50Padded = [...Array(ema50PadLength).fill(null), ...ema50Data];
      const ema200Padded = [...Array(ema200PadLength).fill(null), ...ema200Data];
      const chartType = context.chartType || "line";
      let chartConfig;
      if (chartType === "candlestick") {
        const candlestickData = recentPrices.map((p) => ({
          x: p.timestamp * 1e3,
          o: p.open || p.close,
          h: p.high || p.close,
          l: p.low || p.close,
          c: p.close
        }));
        chartConfig = {
          type: "candlestick",
          data: {
            datasets: [
              {
                label: context.ticker,
                data: candlestickData,
                borderColor: {
                  up: "rgb(75, 192, 128)",
                  down: "rgb(239, 68, 68)",
                  unchanged: "rgb(156, 163, 175)"
                },
                backgroundColor: {
                  up: "rgba(75, 192, 128, 0.5)",
                  down: "rgba(239, 68, 68, 0.5)",
                  unchanged: "rgba(156, 163, 175, 0.5)"
                }
              }
            ]
          },
          options: {
            plugins: {
              title: {
                display: true,
                text: `${context.ticker} - Candlestick Chart`,
                font: { size: 16 }
              },
              legend: { display: false }
            },
            scales: {
              x: {
                type: "time",
                time: { unit: "day" }
              },
              y: {
                ticks: {
                  callback: function(value) {
                    return "$" + value.toFixed(2);
                  }
                }
              }
            }
          }
        };
      } else {
        chartConfig = {
          type: "line",
          data: {
            labels,
            datasets: [
              {
                label: "Price",
                data: closePrices,
                borderColor: "rgb(75, 192, 192)",
                backgroundColor: "rgba(75, 192, 192, 0.1)",
                borderWidth: 2,
                fill: true,
                tension: 0.1
              },
              {
                label: "EMA 50",
                data: ema50Padded,
                borderColor: "rgb(255, 159, 64)",
                borderWidth: 2,
                fill: false,
                tension: 0.1,
                pointRadius: 0
              },
              {
                label: "EMA 200",
                data: ema200Padded,
                borderColor: "rgb(153, 102, 255)",
                borderWidth: 2,
                fill: false,
                tension: 0.1,
                pointRadius: 0
              }
            ]
          },
          options: {
            plugins: {
              title: {
                display: true,
                text: `${context.ticker} - Price with Moving Averages`,
                font: {
                  size: 16
                }
              },
              legend: {
                display: true,
                position: "bottom"
              }
            },
            scales: {
              y: {
                ticks: {
                  callback: function(value) {
                    return "$" + value.toFixed(2);
                  }
                }
              }
            }
          }
        };
      }
      const chartJson = JSON.stringify(chartConfig);
      const encodedChart = encodeURIComponent(chartJson);
      const pluginParam = chartType === "candlestick" ? "&plugins=chartjs-chart-financial" : "";
      const chartUrl = `https://quickchart.io/chart?width=800&height=400&chart=${encodedChart}${pluginParam}`;
      logger?.info("\u2705 [ChartGeneratorTool] Chart generated successfully", {
        ticker: context.ticker,
        dataPoints
      });
      return {
        chartUrl,
        success: true,
        message: `Chart generated for ${context.ticker} with ${dataPoints} days of data`
      };
    } catch (error) {
      logger?.error("\u274C [ChartGeneratorTool] Error generating chart", { error: error.message });
      return {
        chartUrl: "",
        success: false,
        message: `Chart generation failed: ${error.message}`
      };
    }
  }
});

export { chartGeneratorTool };
//# sourceMappingURL=8720dfc5-a71b-4d10-a14b-60894cf7e977.mjs.map
