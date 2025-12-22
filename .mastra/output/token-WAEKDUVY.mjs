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
import './tools/b4bb918d-ac0b-4f21-a7e2-be17b541264b.mjs';
import './tools/a14f3839-fd98-49bf-9aba-24f9bb57d38f.mjs';
import './tools/280e17e9-9061-4195-8ab4-db6f440c6077.mjs';
import './tools/bd86d401-2379-48fd-b681-1e635a929012.mjs';
import './tools/3cb6a2f5-fe89-4e11-8a37-99904abb0924.mjs';
import './tools/338020ea-ee68-4220-ac6c-c49909ab6ee6.mjs';
import '@ai-sdk/openai';
import '@mastra/core/agent';
import '@mastra/memory';
import './tools/f1842152-a424-4646-aecc-5caab6023634.mjs';
import './tools/cde57a54-34d3-46c5-9a3f-77270722c384.mjs';
import './tools/0e8f4c25-82c5-4329-85af-cd734beadb71.mjs';
import './tools/10aacead-ec23-499c-8e6c-5b16df184e66.mjs';
import './tools/3a38ef64-efba-42dc-bd19-d316aa9697d0.mjs';
import './tools/790af2c5-ddc1-48c9-acce-b0a243d18162.mjs';
import './tools/e26fa63d-daf6-465b-b4af-44b43589f12c.mjs';
import './tools/7d53e7bc-c1a2-4d9a-bcdc-a5d8c104d888.mjs';
import './tools/e13f6e0f-fde4-4060-96f7-9f33dfff4323.mjs';
import './tools/a59b4a5f-fe62-4665-a0fb-60d1ab197b81.mjs';
import './tools/8720dfc5-a71b-4d10-a14b-60894cf7e977.mjs';
import './tools/c738dd40-ea4a-4266-80df-b84af25ddf05.mjs';
import './tools/2dd5083f-2455-4f1f-badd-8a1214e9fa54.mjs';
import './tools/2bb018e9-1f35-4d03-97db-e300fe09ff2e.mjs';
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
