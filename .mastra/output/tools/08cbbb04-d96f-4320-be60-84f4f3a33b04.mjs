import { c as createTool, z } from '../mastra.mjs';
import 'pino';
import 'path';
import 'fs';
import 'util';
import 'child_process';
import 'node:process';
import 'stream/web';
import 'crypto';
import 'node:crypto';
import 'buffer';
import 'string_decoder';
import 'stream';
import 'async_hooks';
import 'node:url';
import 'http2';
import 'inngest';
import 'http';
import 'https';
import 'url';
import 'assert';
import 'tty';
import 'os';
import 'zlib';
import 'events';
import 'pg';
import 'inngest/hono';
import 'module';
import 'punycode';
import 'uuid';
import 'rpc-websockets';
import 'net';
import 'tls';
import 'bufferutil';
import 'utf-8-validate';
import 'fs/promises';
import 'bcrypt';
import 'xmlbuilder';
import 'timers';

const exampleTool = createTool({
  id: "example-tool",
  // Describe what your tool does - this helps agents understand when to use it
  description: "A simple example tool that demonstrates how to create Mastra tools",
  // Define what inputs your tool expects
  // Use .describe() to add helpful descriptions for each field
  inputSchema: z.object({
    message: z.string().describe("A message to process"),
    count: z.number().optional().describe("Optional number parameter")
  }),
  // Define what your tool will return
  outputSchema: z.object({
    processed: z.string(),
    timestamp: z.string(),
    metadata: z.object({
      characterCount: z.number(),
      wordCount: z.number()
    })
  }),
  // The execute function contains your tool's logic
  // It receives a context object with the validated input data
  execute: async ({ context }) => {
    console.log("\u{1F527} Example tool executing with:", context);
    const processedMessage = context.message.toUpperCase();
    const words = context.message.split(" ").filter((w) => w.length > 0);
    return {
      processed: processedMessage,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      metadata: {
        characterCount: context.message.length,
        wordCount: words.length
      }
    };
  }
});

export { exampleTool };
//# sourceMappingURL=08cbbb04-d96f-4320-be60-84f4f3a33b04.mjs.map
