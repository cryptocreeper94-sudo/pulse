import { z } from './mastra.mjs';
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

z.object({
  to: z.union([z.string().email(), z.array(z.string().email())]).describe("Recipient email address(es)"),
  cc: z.union([z.string().email(), z.array(z.string().email())]).optional().describe("CC recipient email address(es)"),
  subject: z.string().describe("Email subject"),
  text: z.string().optional().describe("Plain text body"),
  html: z.string().optional().describe("HTML body"),
  attachments: z.array(
    z.object({
      filename: z.string().describe("File name"),
      content: z.string().describe("Base64 encoded content"),
      contentType: z.string().optional().describe("MIME type"),
      encoding: z.enum(["base64", "7bit", "quoted-printable", "binary"]).default("base64")
    })
  ).optional().describe("Email attachments")
});
function getAuthToken() {
  const xReplitToken = process.env.REPL_IDENTITY ? "repl " + process.env.REPL_IDENTITY : process.env.WEB_REPL_RENEWAL ? "depl " + process.env.WEB_REPL_RENEWAL : null;
  if (!xReplitToken) {
    throw new Error(
      "No authentication token found. Please set REPL_IDENTITY or ensure you're running in Replit environment."
    );
  }
  return xReplitToken;
}
async function sendEmail(message) {
  const authToken = getAuthToken();
  const response = await fetch(
    "https://connectors.replit.com/api/v2/mailer/send",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X_REPLIT_TOKEN": authToken
      },
      body: JSON.stringify({
        to: message.to,
        cc: message.cc,
        subject: message.subject,
        text: message.text,
        html: message.html,
        attachments: message.attachments
      })
    }
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to send email");
  }
  return await response.json();
}

export { sendEmail };
//# sourceMappingURL=replitmail.mjs.map
