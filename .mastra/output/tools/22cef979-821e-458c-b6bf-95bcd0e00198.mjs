import { c as createTool, z } from '../mastra.mjs';
import 'stream/web';
import 'crypto';
import 'node:url';
import 'node:path';
import 'node:module';
import 'events';
import 'pino';
import 'node:crypto';
import 'path';
import 'util';
import 'buffer';
import 'string_decoder';
import 'stream';
import 'async_hooks';
import 'url';
import 'node:process';
import 'inngest';
import 'http';
import 'https';
import 'fs';
import 'http2';
import 'assert';
import 'tty';
import 'os';
import 'zlib';
import 'pg';
import '@mastra/inngest';
import '@solana/web3.js';
import 'uuid';
import 'net';
import 'tls';
import 'child_process';
import 'fs/promises';
import '@solana/spl-token';
import '@sqds/multisig';
import 'bcrypt';
import '@simplewebauthn/server';

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
//# sourceMappingURL=22cef979-821e-458c-b6bf-95bcd0e00198.mjs.map
