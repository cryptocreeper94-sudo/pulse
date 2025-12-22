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
import './tools/34d9b7b7-f40c-434c-a860-919d1ff4ab2a.mjs';
import './tools/0f409d47-cdb5-45f2-87bc-f17ce289ea9d.mjs';
import './tools/83d15379-38a8-43c3-b22f-2b0a11076ce0.mjs';
import './tools/930c59dd-b30b-4f41-a14e-1f89b5d9a84e.mjs';
import './tools/b91884d8-00fd-47e9-8c09-f4ca78412f76.mjs';
import './tools/45bed40b-0bf8-47a1-b5f4-eaa677dc0ac5.mjs';
import '@ai-sdk/openai';
import '@mastra/core/agent';
import '@mastra/memory';
import './tools/20e0f007-00e2-4398-a84b-de6caf6e5fb0.mjs';
import './tools/0f1438e6-4d2d-4177-816f-6ec2373ac9cc.mjs';
import './tools/ab5c7e75-0012-4e58-af26-d7bac39b7922.mjs';
import './tools/86bb5238-e304-44dc-8236-ca38d8ccc974.mjs';
import './tools/953a2b23-818f-4481-8f66-6aeb3cf4bf54.mjs';
import './tools/37a01bc9-0430-41fb-a6a9-d867b598cb5f.mjs';
import './tools/38c107ea-b703-4ea5-ab5d-968646d90867.mjs';
import './tools/2263742b-ac88-417e-b4df-cc188995e724.mjs';
import './tools/9c55b3ea-0a63-4e68-a098-c253e71c8731.mjs';
import './tools/5161d8a7-6272-41a7-ba3b-b19eb3e4437c.mjs';
import './tools/7bc41867-2fcd-40da-b650-36b44678dc88.mjs';
import './tools/eb2be423-fab3-481d-95cd-8faca7a5383e.mjs';
import './tools/bb7aa321-6bc5-4b04-bef4-9e7319afaccf.mjs';
import './tools/e56427b1-ed00-4c50-a307-2255c2ce8cac.mjs';
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
