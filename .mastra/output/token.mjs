import { aj as getDefaultExportFromCjs } from './mastra.mjs';
import { t as tokenError } from './streamingAnalysis.mjs';
import { a as tokenUtil } from './token-util.mjs';
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
import './trace-api.mjs';

function _mergeNamespaces$1(n, m) {
  m.forEach(function (e) {
    e && typeof e !== 'string' && !Array.isArray(e) && Object.keys(e).forEach(function (k) {
      if (k !== 'default' && !(k in n)) {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  });
  return Object.freeze(n);
}

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
var token = __toCommonJS(token_exports);
var import_token_error = tokenError;
var import_token_util = tokenUtil;
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

var token_default = /*@__PURE__*/getDefaultExportFromCjs(token);

var token$1 = /*#__PURE__*/_mergeNamespaces$1({
  __proto__: null,
  default: token_default
}, [token]);

export { token$1 as t };
//# sourceMappingURL=token.mjs.map
