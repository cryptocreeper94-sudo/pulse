import type { ContentfulStatusCode } from "hono/utils/http-status";

import { registerApiRoute } from "../mastra/inngest";
import { Mastra } from "@mastra/core";
import { darkwaveWorkflow } from "../mastra/workflows/darkwaveWorkflow";

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN_NEW || process.env.TELEGRAM_BOT_TOKEN;

if (!TELEGRAM_TOKEN) {
  console.warn(
    "Trying to initialize Telegram triggers without TELEGRAM_TOKEN_NEW or TELEGRAM_BOT_TOKEN. Can you confirm that the Telegram integration is configured correctly?",
  );
}

export type TriggerInfoTelegramOnNewMessage = {
  type: "telegram/message";
  params: {
    userName: string;
    message: string;
  };
  payload: any;
};

export function registerTelegramTrigger({
  triggerType,
  handler,
}: {
  triggerType: string;
  handler: (
    mastra: Mastra,
    triggerInfo: TriggerInfoTelegramOnNewMessage,
  ) => Promise<void>;
}) {
  return [
    registerApiRoute("/webhooks/telegram/action", {
      method: "POST",
      handler: async (c) => {
        const mastra = c.get("mastra");
        const logger = mastra.getLogger();
        try {
          const payload = await c.req.json();

          logger?.info("📝 [Telegram] Received message", { 
            from: payload.message?.from?.username,
            text: payload.message?.text?.substring(0, 50)
          });

          // Extract message and user info
          const messageText = payload.message?.text || "";
          const userId = payload.message?.from?.id?.toString() || "unknown";

          // Execute DarkWave-V2 workflow
          logger?.info("🚀 [Telegram] Triggering DarkWave-V2 workflow");
          
          const run = await darkwaveWorkflow.createRunAsync();
          const workflowResult = await run.start({ 
            inputData: {
              message: messageText,
              userId: userId,
            }
          });

          logger?.info("✅ [Telegram] Workflow completed", { status: workflowResult.status });

          // Send response back to Telegram
          let responseText = "";
          if (workflowResult.status === "success" && workflowResult.result) {
            responseText = workflowResult.result.response || "⚠️ No response generated";
          } else if (workflowResult.status === "failed") {
            responseText = "⚠️ Error processing your request. Please try again.";
          }

          if (responseText) {
            const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
            await fetch(telegramApiUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chat_id: payload.message.chat.id,
                text: responseText,
                parse_mode: "Markdown",
              }),
            });
          }

          // Also call the original handler for compatibility
          await handler(mastra, {
            type: triggerType,
            params: {
              userName: payload.message.from.username,
              message: messageText,
            },
            payload,
          } as TriggerInfoTelegramOnNewMessage);

          return c.text("OK", 200);
        } catch (error: any) {
          logger?.error("❌ [Telegram] Error handling webhook", { error: error.message });
          return c.text("Internal Server Error", 500);
        }
      },
    }),
  ];
}
