import { r as require_token_util } from './chunk-SIW6CYO3.mjs';
import { _ as __commonJS, r as require_token_error } from './index.mjs';
import '@mastra/core/eval';
import '@mastra/core/hooks';
import '@mastra/core/storage';
import '@mastra/core/scores/scoreTraces';
import '@mastra/core/utils';
import '@mastra/core';
import '@mastra/core/error';
import '@mastra/loggers';
import '@mastra/mcp';
import 'inngest';
import 'zod';
import 'drizzle-orm';
import 'axios';
import '@mastra/pg';
import '@inngest/realtime';
import '@mastra/inngest';
import 'crypto';
import './client.mjs';
import 'drizzle-orm/node-postgres';
import 'pg';
import 'drizzle-orm/pg-core';
import '@solana/web3.js';
import 'bs58';
import './technicalAnalysisTool.mjs';
import '@mastra/core/tools';
import 'technicalindicators';
import './subscriptionCheck.mjs';
import 'uuid';
import 'pino';
import 'ethers';
import './tools/55045d40-84a3-4eb3-ba0e-9ca35ff9abef.mjs';
import './tools/82ec07ff-fc67-4d46-84fa-85eea7d954f1.mjs';
import './tools/0b3f53dd-cf89-4f9d-9694-9d0e69a1b1bb.mjs';
import './tools/fdf463d5-9dd7-4d35-9a5d-3e60d7bd762e.mjs';
import './tools/3be11174-4d50-40ba-ae8b-10d79def374a.mjs';
import './tools/f0218488-29ac-406b-809a-59680894496c.mjs';
import '@ai-sdk/openai';
import '@mastra/core/agent';
import '@mastra/memory';
import './tools/1069c65f-37e2-4cb6-9618-4311cbf7fa74.mjs';
import './tools/ecffb188-f82a-4234-8fa9-953e31853473.mjs';
import './tools/24436ad7-7166-4483-9f4f-6bf27917f740.mjs';
import './tools/6f5426b6-f8f2-4bd2-9c23-0565873924a9.mjs';
import './tools/3ca5dac6-c6d9-4c54-8841-87cef4b3eaef.mjs';
import './tools/4c4fc16d-7929-403c-8384-154be61dd421.mjs';
import './tools/b2b2649f-5c00-4bad-ab13-0929e25f3d48.mjs';
import './tools/3373e7de-bcf2-4b9c-8779-8b9de0869a94.mjs';
import './tools/acbfa4c1-eb18-4039-832a-4f349147a7b0.mjs';
import './tools/cc1a6f18-d358-4ee6-94d8-3a4c67da9bbe.mjs';
import './tools/48981ff1-224e-4f87-b372-5ad1500be604.mjs';
import './tools/78bef1e7-61d2-4c2a-8b52-b97a8f020039.mjs';
import './tools/31e42191-c3a5-4a96-857b-93fb15e23f5c.mjs';
import './tools/9dc829a4-ce50-4203-b8fc-4df9a4208787.mjs';
import 'stripe';
import 'bip39';
import 'ed25519-hd-key';
import '@trustwallet/wallet-core';
import '@solana/spl-token';
import '@sqds/multisig';
import '@safe-global/protocol-kit';
import 'bcrypt';
import '@simplewebauthn/server';
import 'fs/promises';
import 'https';
import 'path/posix';
import 'http';
import 'http2';
import 'stream';
import 'fs';
import 'path';
import '@mastra/core/runtime-context';
import '@mastra/core/telemetry';
import '@mastra/core/llm';
import '@mastra/core/stream';
import 'util';
import 'buffer';
import '@mastra/core/ai-tracing';
import '@mastra/core/utils/zod-to-json';
import '@mastra/core/a2a';
import 'stream/web';
import '@mastra/core/memory';
import 'zod/v4';
import 'zod/v3';
import 'child_process';
import 'module';
import 'os';
import '@mastra/core/workflows';
import './tools.mjs';

// ../../node_modules/.pnpm/@vercel+oidc@3.0.1/node_modules/@vercel/oidc/dist/token.js
var require_token = __commonJS({
  "../../node_modules/.pnpm/@vercel+oidc@3.0.1/node_modules/@vercel/oidc/dist/token.js"(exports, module) {
    var __defProp = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames = Object.getOwnPropertyNames;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export = (target, all) => {
      for (var name in all)
        __defProp(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
    var token_exports = {};
    __export(token_exports, {
      refreshToken: () => refreshToken
    });
    module.exports = __toCommonJS(token_exports);
    var import_token_error = require_token_error();
    var import_token_util = require_token_util();
    async function refreshToken() {
      const { projectId, teamId } = (0, import_token_util.findProjectInfo)();
      let maybeToken = (0, import_token_util.loadToken)(projectId);
      if (!maybeToken || (0, import_token_util.isExpired)((0, import_token_util.getTokenPayload)(maybeToken.token))) {
        const authToken = (0, import_token_util.getVercelCliToken)();
        if (!authToken) {
          throw new import_token_error.VercelOidcTokenError(
            "Failed to refresh OIDC token: login to vercel cli"
          );
        }
        if (!projectId) {
          throw new import_token_error.VercelOidcTokenError(
            "Failed to refresh OIDC token: project id not found"
          );
        }
        maybeToken = await (0, import_token_util.getVercelOidcToken)(authToken, projectId, teamId);
        if (!maybeToken) {
          throw new import_token_error.VercelOidcTokenError("Failed to refresh OIDC token");
        }
        (0, import_token_util.saveToken)(maybeToken, projectId);
      }
      process.env.VERCEL_OIDC_TOKEN = maybeToken.token;
      return;
    }
  }
});
var tokenWAEKDUVY = require_token();

export { tokenWAEKDUVY as default };
//# sourceMappingURL=token-WAEKDUVY.mjs.map
