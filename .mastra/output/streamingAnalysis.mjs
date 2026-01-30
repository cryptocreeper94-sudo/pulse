import { ak as object$1, al as _enum, am as array, an as string, ao as union, ap as literal, aq as boolean, ar as number, as as safeParseAsync, at as toJSONSchema, au as discriminatedUnion, av as looseObject, aw as unknown, ax as record, ay as tuple, az as ZodFirstPartyTypeKind, aA as any, aB as _instanceof, aC as custom, aD as lazy, aE as _null, aF as createOpenAI } from './mastra.mjs';
import { t as trace, S as SpanStatusCode } from './trace-api.mjs';

class ParseError extends Error {
  constructor(message, options) {
    super(message), this.name = "ParseError", this.type = options.type, this.field = options.field, this.value = options.value, this.line = options.line;
  }
}
function noop(_arg) {
}
function createParser(callbacks) {
  if (typeof callbacks == "function")
    throw new TypeError(
      "`callbacks` must be an object, got a function instead. Did you mean `{onEvent: fn}`?"
    );
  const { onEvent = noop, onError = noop, onRetry = noop, onComment } = callbacks;
  let incompleteLine = "", isFirstChunk = true, id, data = "", eventType = "";
  function feed(newChunk) {
    const chunk = isFirstChunk ? newChunk.replace(/^\xEF\xBB\xBF/, "") : newChunk, [complete, incomplete] = splitLines(`${incompleteLine}${chunk}`);
    for (const line of complete)
      parseLine(line);
    incompleteLine = incomplete, isFirstChunk = false;
  }
  function parseLine(line) {
    if (line === "") {
      dispatchEvent();
      return;
    }
    if (line.startsWith(":")) {
      onComment && onComment(line.slice(line.startsWith(": ") ? 2 : 1));
      return;
    }
    const fieldSeparatorIndex = line.indexOf(":");
    if (fieldSeparatorIndex !== -1) {
      const field = line.slice(0, fieldSeparatorIndex), offset = line[fieldSeparatorIndex + 1] === " " ? 2 : 1, value = line.slice(fieldSeparatorIndex + offset);
      processField(field, value, line);
      return;
    }
    processField(line, "", line);
  }
  function processField(field, value, line) {
    switch (field) {
      case "event":
        eventType = value;
        break;
      case "data":
        data = `${data}${value}
`;
        break;
      case "id":
        id = value.includes("\0") ? void 0 : value;
        break;
      case "retry":
        /^\d+$/.test(value) ? onRetry(parseInt(value, 10)) : onError(
          new ParseError(`Invalid \`retry\` value: "${value}"`, {
            type: "invalid-retry",
            value,
            line
          })
        );
        break;
      default:
        onError(
          new ParseError(
            `Unknown field "${field.length > 20 ? `${field.slice(0, 20)}\u2026` : field}"`,
            { type: "unknown-field", field, value, line }
          )
        );
        break;
    }
  }
  function dispatchEvent() {
    data.length > 0 && onEvent({
      id,
      event: eventType || void 0,
      // If the data buffer's last character is a U+000A LINE FEED (LF) character,
      // then remove the last character from the data buffer.
      data: data.endsWith(`
`) ? data.slice(0, -1) : data
    }), id = void 0, data = "", eventType = "";
  }
  function reset(options = {}) {
    incompleteLine && options.consume && parseLine(incompleteLine), isFirstChunk = true, id = void 0, data = "", eventType = "", incompleteLine = "";
  }
  return { feed, reset };
}
function splitLines(chunk) {
  const lines = [];
  let incompleteLine = "", searchIndex = 0;
  for (; searchIndex < chunk.length; ) {
    const crIndex = chunk.indexOf("\r", searchIndex), lfIndex = chunk.indexOf(`
`, searchIndex);
    let lineEnd = -1;
    if (crIndex !== -1 && lfIndex !== -1 ? lineEnd = Math.min(crIndex, lfIndex) : crIndex !== -1 ? crIndex === chunk.length - 1 ? lineEnd = -1 : lineEnd = crIndex : lfIndex !== -1 && (lineEnd = lfIndex), lineEnd === -1) {
      incompleteLine = chunk.slice(searchIndex);
      break;
    } else {
      const line = chunk.slice(searchIndex, lineEnd);
      lines.push(line), searchIndex = lineEnd + 1, chunk[searchIndex - 1] === "\r" && chunk[searchIndex] === `
` && searchIndex++;
    }
  }
  return [lines, incompleteLine];
}

class EventSourceParserStream extends TransformStream {
  constructor({ onError, onRetry, onComment } = {}) {
    let parser;
    super({
      start(controller) {
        parser = createParser({
          onEvent: (event) => {
            controller.enqueue(event);
          },
          onError(error) {
            onError === "terminate" ? controller.error(error) : typeof onError == "function" && onError(error);
          },
          onRetry,
          onComment
        });
      },
      transform(chunk) {
        parser.feed(chunk);
      }
    });
  }
}

// src/errors/ai-sdk-error.ts
var marker$3 = "vercel.ai.error";
var symbol$3 = Symbol.for(marker$3);
var _a$3;
var _AISDKError$1 = class _AISDKError extends Error {
  /**
   * Creates an AI SDK Error.
   *
   * @param {Object} params - The parameters for creating the error.
   * @param {string} params.name - The name of the error.
   * @param {string} params.message - The error message.
   * @param {unknown} [params.cause] - The underlying cause of the error.
   */
  constructor({
    name: name14,
    message,
    cause
  }) {
    super(message);
    this[_a$3] = true;
    this.name = name14;
    this.cause = cause;
  }
  /**
   * Checks if the given error is an AI SDK Error.
   * @param {unknown} error - The error to check.
   * @returns {boolean} True if the error is an AI SDK Error, false otherwise.
   */
  static isInstance(error) {
    return _AISDKError.hasMarker(error, marker$3);
  }
  static hasMarker(error, marker15) {
    const markerSymbol = Symbol.for(marker15);
    return error != null && typeof error === "object" && markerSymbol in error && typeof error[markerSymbol] === "boolean" && error[markerSymbol] === true;
  }
};
_a$3 = symbol$3;
var AISDKError$1 = _AISDKError$1;

// src/errors/api-call-error.ts
var name$3 = "AI_APICallError";
var marker2$3 = `vercel.ai.error.${name$3}`;
var symbol2$3 = Symbol.for(marker2$3);
var _a2$3;
var APICallError$1 = class APICallError extends AISDKError$1 {
  constructor({
    message,
    url,
    requestBodyValues,
    statusCode,
    responseHeaders,
    responseBody,
    cause,
    isRetryable = statusCode != null && (statusCode === 408 || // request timeout
    statusCode === 409 || // conflict
    statusCode === 429 || // too many requests
    statusCode >= 500),
    // server error
    data
  }) {
    super({ name: name$3, message, cause });
    this[_a2$3] = true;
    this.url = url;
    this.requestBodyValues = requestBodyValues;
    this.statusCode = statusCode;
    this.responseHeaders = responseHeaders;
    this.responseBody = responseBody;
    this.isRetryable = isRetryable;
    this.data = data;
  }
  static isInstance(error) {
    return AISDKError$1.hasMarker(error, marker2$3);
  }
};
_a2$3 = symbol2$3;

// src/errors/empty-response-body-error.ts
var name2$3 = "AI_EmptyResponseBodyError";
var marker3$2 = `vercel.ai.error.${name2$3}`;
var symbol3$2 = Symbol.for(marker3$2);
var _a3$2;
var EmptyResponseBodyError$1 = class EmptyResponseBodyError extends AISDKError$1 {
  // used in isInstance
  constructor({ message = "Empty response body" } = {}) {
    super({ name: name2$3, message });
    this[_a3$2] = true;
  }
  static isInstance(error) {
    return AISDKError$1.hasMarker(error, marker3$2);
  }
};
_a3$2 = symbol3$2;

// src/errors/get-error-message.ts
function getErrorMessage$2(error) {
  if (error == null) {
    return "unknown error";
  }
  if (typeof error === "string") {
    return error;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return JSON.stringify(error);
}

// src/errors/invalid-argument-error.ts
var name3$2 = "AI_InvalidArgumentError";
var marker4$3 = `vercel.ai.error.${name3$2}`;
var symbol4$3 = Symbol.for(marker4$3);
var _a4$3;
var InvalidArgumentError$2 = class InvalidArgumentError extends AISDKError$1 {
  constructor({
    message,
    cause,
    argument
  }) {
    super({ name: name3$2, message, cause });
    this[_a4$3] = true;
    this.argument = argument;
  }
  static isInstance(error) {
    return AISDKError$1.hasMarker(error, marker4$3);
  }
};
_a4$3 = symbol4$3;

// src/errors/json-parse-error.ts
var name6$3 = "AI_JSONParseError";
var marker7$3 = `vercel.ai.error.${name6$3}`;
var symbol7$3 = Symbol.for(marker7$3);
var _a7$3;
var JSONParseError$1 = class JSONParseError extends AISDKError$1 {
  constructor({ text, cause }) {
    super({
      name: name6$3,
      message: `JSON parsing failed: Text: ${text}.
Error message: ${getErrorMessage$2(cause)}`,
      cause
    });
    this[_a7$3] = true;
    this.text = text;
  }
  static isInstance(error) {
    return AISDKError$1.hasMarker(error, marker7$3);
  }
};
_a7$3 = symbol7$3;

// src/errors/load-api-key-error.ts
var name7$1 = "AI_LoadAPIKeyError";
var marker8$1 = `vercel.ai.error.${name7$1}`;
var symbol8$1 = Symbol.for(marker8$1);
var _a8$1;
var LoadAPIKeyError = class extends AISDKError$1 {
  // used in isInstance
  constructor({ message }) {
    super({ name: name7$1, message });
    this[_a8$1] = true;
  }
  static isInstance(error) {
    return AISDKError$1.hasMarker(error, marker8$1);
  }
};
_a8$1 = symbol8$1;

// src/errors/no-such-model-error.ts
var name10 = "AI_NoSuchModelError";
var marker11$1 = `vercel.ai.error.${name10}`;
var symbol11$1 = Symbol.for(marker11$1);
var _a11$1;
var NoSuchModelError = class extends AISDKError$1 {
  constructor({
    errorName = name10,
    modelId,
    modelType,
    message = `No such ${modelType}: ${modelId}`
  }) {
    super({ name: errorName, message });
    this[_a11$1] = true;
    this.modelId = modelId;
    this.modelType = modelType;
  }
  static isInstance(error) {
    return AISDKError$1.hasMarker(error, marker11$1);
  }
};
_a11$1 = symbol11$1;

// src/errors/type-validation-error.ts
var name12$1 = "AI_TypeValidationError";
var marker13$2 = `vercel.ai.error.${name12$1}`;
var symbol13$2 = Symbol.for(marker13$2);
var _a13$2;
var _TypeValidationError$1 = class _TypeValidationError extends AISDKError$1 {
  constructor({ value, cause }) {
    super({
      name: name12$1,
      message: `Type validation failed: Value: ${JSON.stringify(value)}.
Error message: ${getErrorMessage$2(cause)}`,
      cause
    });
    this[_a13$2] = true;
    this.value = value;
  }
  static isInstance(error) {
    return AISDKError$1.hasMarker(error, marker13$2);
  }
  /**
   * Wraps an error into a TypeValidationError.
   * If the cause is already a TypeValidationError with the same value, it returns the cause.
   * Otherwise, it creates a new TypeValidationError.
   *
   * @param {Object} params - The parameters for wrapping the error.
   * @param {unknown} params.value - The value that failed validation.
   * @param {unknown} params.cause - The original error or cause of the validation failure.
   * @returns {TypeValidationError} A TypeValidationError instance.
   */
  static wrap({
    value,
    cause
  }) {
    return _TypeValidationError.isInstance(cause) && cause.value === value ? cause : new _TypeValidationError({ value, cause });
  }
};
_a13$2 = symbol13$2;
var TypeValidationError$1 = _TypeValidationError$1;

// src/errors/unsupported-functionality-error.ts
var name13$1 = "AI_UnsupportedFunctionalityError";
var marker14$1 = `vercel.ai.error.${name13$1}`;
var symbol14$1 = Symbol.for(marker14$1);
var _a14$1;
var UnsupportedFunctionalityError = class extends AISDKError$1 {
  constructor({
    functionality,
    message = `'${functionality}' functionality not supported.`
  }) {
    super({ name: name13$1, message });
    this[_a14$1] = true;
    this.functionality = functionality;
  }
  static isInstance(error) {
    return AISDKError$1.hasMarker(error, marker14$1);
  }
};
_a14$1 = symbol14$1;

// src/combine-headers.ts
function combineHeaders$1(...headers) {
  return headers.reduce(
    (combinedHeaders, currentHeaders) => ({
      ...combinedHeaders,
      ...currentHeaders != null ? currentHeaders : {}
    }),
    {}
  );
}

// src/delayed-promise.ts
var DelayedPromise$1 = class DelayedPromise {
  constructor() {
    this.status = { type: "pending" };
    this._resolve = void 0;
    this._reject = void 0;
  }
  get promise() {
    if (this._promise) {
      return this._promise;
    }
    this._promise = new Promise((resolve2, reject) => {
      if (this.status.type === "resolved") {
        resolve2(this.status.value);
      } else if (this.status.type === "rejected") {
        reject(this.status.error);
      }
      this._resolve = resolve2;
      this._reject = reject;
    });
    return this._promise;
  }
  resolve(value) {
    var _a;
    this.status = { type: "resolved", value };
    if (this._promise) {
      (_a = this._resolve) == null ? void 0 : _a.call(this, value);
    }
  }
  reject(error) {
    var _a;
    this.status = { type: "rejected", error };
    if (this._promise) {
      (_a = this._reject) == null ? void 0 : _a.call(this, error);
    }
  }
  isResolved() {
    return this.status.type === "resolved";
  }
  isRejected() {
    return this.status.type === "rejected";
  }
  isPending() {
    return this.status.type === "pending";
  }
};

// src/extract-response-headers.ts
function extractResponseHeaders$1(response) {
  return Object.fromEntries([...response.headers]);
}
var createIdGenerator$1 = ({
  prefix,
  size = 16,
  alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  separator = "-"
} = {}) => {
  const generator = () => {
    const alphabetLength = alphabet.length;
    const chars = new Array(size);
    for (let i = 0; i < size; i++) {
      chars[i] = alphabet[Math.random() * alphabetLength | 0];
    }
    return chars.join("");
  };
  if (prefix == null) {
    return generator;
  }
  if (alphabet.includes(separator)) {
    throw new InvalidArgumentError$2({
      argument: "separator",
      message: `The separator "${separator}" must not be part of the alphabet "${alphabet}".`
    });
  }
  return () => `${prefix}${separator}${generator()}`;
};
var generateId$1 = createIdGenerator$1();

// src/is-abort-error.ts
function isAbortError$1(error) {
  return (error instanceof Error || error instanceof DOMException) && (error.name === "AbortError" || error.name === "ResponseAborted" || // Next.js
  error.name === "TimeoutError");
}

// src/handle-fetch-error.ts
var FETCH_FAILED_ERROR_MESSAGES$1 = ["fetch failed", "failed to fetch"];
function handleFetchError$1({
  error,
  url,
  requestBodyValues
}) {
  if (isAbortError$1(error)) {
    return error;
  }
  if (error instanceof TypeError && FETCH_FAILED_ERROR_MESSAGES$1.includes(error.message.toLowerCase())) {
    const cause = error.cause;
    if (cause != null) {
      return new APICallError$1({
        message: `Cannot connect to API: ${cause.message}`,
        cause,
        url,
        requestBodyValues,
        isRetryable: true
        // retry when network error
      });
    }
  }
  return error;
}

// src/get-runtime-environment-user-agent.ts
function getRuntimeEnvironmentUserAgent$1(globalThisAny = globalThis) {
  var _a, _b, _c;
  if (globalThisAny.window) {
    return `runtime/browser`;
  }
  if ((_a = globalThisAny.navigator) == null ? void 0 : _a.userAgent) {
    return `runtime/${globalThisAny.navigator.userAgent.toLowerCase()}`;
  }
  if ((_c = (_b = globalThisAny.process) == null ? void 0 : _b.versions) == null ? void 0 : _c.node) {
    return `runtime/node.js/${globalThisAny.process.version.substring(0)}`;
  }
  if (globalThisAny.EdgeRuntime) {
    return `runtime/vercel-edge`;
  }
  return "runtime/unknown";
}

// src/normalize-headers.ts
function normalizeHeaders$1(headers) {
  if (headers == null) {
    return {};
  }
  const normalized = {};
  if (headers instanceof Headers) {
    headers.forEach((value, key) => {
      normalized[key.toLowerCase()] = value;
    });
  } else {
    if (!Array.isArray(headers)) {
      headers = Object.entries(headers);
    }
    for (const [key, value] of headers) {
      if (value != null) {
        normalized[key.toLowerCase()] = value;
      }
    }
  }
  return normalized;
}

// src/with-user-agent-suffix.ts
function withUserAgentSuffix$1(headers, ...userAgentSuffixParts) {
  const normalizedHeaders = new Headers(normalizeHeaders$1(headers));
  const currentUserAgentHeader = normalizedHeaders.get("user-agent") || "";
  normalizedHeaders.set(
    "user-agent",
    [currentUserAgentHeader, ...userAgentSuffixParts].filter(Boolean).join(" ")
  );
  return Object.fromEntries(normalizedHeaders.entries());
}

// src/version.ts
var VERSION$1$1 = "3.0.18" ;
function loadApiKey({
  apiKey,
  environmentVariableName,
  apiKeyParameterName = "apiKey",
  description
}) {
  if (typeof apiKey === "string") {
    return apiKey;
  }
  if (apiKey != null) {
    throw new LoadAPIKeyError({
      message: `${description} API key must be a string.`
    });
  }
  if (typeof process === "undefined") {
    throw new LoadAPIKeyError({
      message: `${description} API key is missing. Pass it using the '${apiKeyParameterName}' parameter. Environment variables is not supported in this environment.`
    });
  }
  apiKey = process.env[environmentVariableName];
  if (apiKey == null) {
    throw new LoadAPIKeyError({
      message: `${description} API key is missing. Pass it using the '${apiKeyParameterName}' parameter or the ${environmentVariableName} environment variable.`
    });
  }
  if (typeof apiKey !== "string") {
    throw new LoadAPIKeyError({
      message: `${description} API key must be a string. The value of the ${environmentVariableName} environment variable is not a string.`
    });
  }
  return apiKey;
}

// src/load-optional-setting.ts
function loadOptionalSetting$1({
  settingValue,
  environmentVariableName
}) {
  if (typeof settingValue === "string") {
    return settingValue;
  }
  if (settingValue != null || typeof process === "undefined") {
    return void 0;
  }
  settingValue = process.env[environmentVariableName];
  if (settingValue == null || typeof settingValue !== "string") {
    return void 0;
  }
  return settingValue;
}

// src/secure-json-parse.ts
var suspectProtoRx$1 = /"__proto__"\s*:/;
var suspectConstructorRx$1 = /"constructor"\s*:/;
function _parse$1(text) {
  const obj = JSON.parse(text);
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  if (suspectProtoRx$1.test(text) === false && suspectConstructorRx$1.test(text) === false) {
    return obj;
  }
  return filter$1(obj);
}
function filter$1(obj) {
  let next = [obj];
  while (next.length) {
    const nodes = next;
    next = [];
    for (const node of nodes) {
      if (Object.prototype.hasOwnProperty.call(node, "__proto__")) {
        throw new SyntaxError("Object contains forbidden prototype property");
      }
      if (Object.prototype.hasOwnProperty.call(node, "constructor") && Object.prototype.hasOwnProperty.call(node.constructor, "prototype")) {
        throw new SyntaxError("Object contains forbidden prototype property");
      }
      for (const key in node) {
        const value = node[key];
        if (value && typeof value === "object") {
          next.push(value);
        }
      }
    }
  }
  return obj;
}
function secureJsonParse$1(text) {
  const { stackTraceLimit } = Error;
  try {
    Error.stackTraceLimit = 0;
  } catch (e) {
    return _parse$1(text);
  }
  try {
    return _parse$1(text);
  } finally {
    Error.stackTraceLimit = stackTraceLimit;
  }
}
var validatorSymbol$1 = Symbol.for("vercel.ai.validator");
function validator$1(validate) {
  return { [validatorSymbol$1]: true, validate };
}
function isValidator$1(value) {
  return typeof value === "object" && value !== null && validatorSymbol$1 in value && value[validatorSymbol$1] === true && "validate" in value;
}
function asValidator$1(value) {
  return isValidator$1(value) ? value : typeof value === "function" ? value() : standardSchemaValidator$1(value);
}
function standardSchemaValidator$1(standardSchema) {
  return validator$1(async (value) => {
    const result = await standardSchema["~standard"].validate(value);
    return result.issues == null ? { success: true, value: result.value } : {
      success: false,
      error: new TypeValidationError$1({
        value,
        cause: result.issues
      })
    };
  });
}

// src/validate-types.ts
async function validateTypes$1({
  value,
  schema
}) {
  const result = await safeValidateTypes$1({ value, schema });
  if (!result.success) {
    throw TypeValidationError$1.wrap({ value, cause: result.error });
  }
  return result.value;
}
async function safeValidateTypes$1({
  value,
  schema
}) {
  const validator2 = asValidator$1(schema);
  try {
    if (validator2.validate == null) {
      return { success: true, value, rawValue: value };
    }
    const result = await validator2.validate(value);
    if (result.success) {
      return { success: true, value: result.value, rawValue: value };
    }
    return {
      success: false,
      error: TypeValidationError$1.wrap({ value, cause: result.error }),
      rawValue: value
    };
  } catch (error) {
    return {
      success: false,
      error: TypeValidationError$1.wrap({ value, cause: error }),
      rawValue: value
    };
  }
}

// src/parse-json.ts
async function parseJSON$1({
  text,
  schema
}) {
  try {
    const value = secureJsonParse$1(text);
    if (schema == null) {
      return value;
    }
    return validateTypes$1({ value, schema });
  } catch (error) {
    if (JSONParseError$1.isInstance(error) || TypeValidationError$1.isInstance(error)) {
      throw error;
    }
    throw new JSONParseError$1({ text, cause: error });
  }
}
async function safeParseJSON$1({
  text,
  schema
}) {
  try {
    const value = secureJsonParse$1(text);
    if (schema == null) {
      return { success: true, value, rawValue: value };
    }
    return await safeValidateTypes$1({ value, schema });
  } catch (error) {
    return {
      success: false,
      error: JSONParseError$1.isInstance(error) ? error : new JSONParseError$1({ text, cause: error }),
      rawValue: void 0
    };
  }
}
function parseJsonEventStream$1({
  stream,
  schema
}) {
  return stream.pipeThrough(new TextDecoderStream()).pipeThrough(new EventSourceParserStream()).pipeThrough(
    new TransformStream({
      async transform({ data }, controller) {
        if (data === "[DONE]") {
          return;
        }
        controller.enqueue(await safeParseJSON$1({ text: data, schema }));
      }
    })
  );
}
async function parseProviderOptions({
  provider,
  providerOptions,
  schema
}) {
  if ((providerOptions == null ? void 0 : providerOptions[provider]) == null) {
    return void 0;
  }
  const parsedProviderOptions = await safeValidateTypes$1({
    value: providerOptions[provider],
    schema
  });
  if (!parsedProviderOptions.success) {
    throw new InvalidArgumentError$2({
      argument: "providerOptions",
      message: `invalid ${provider} provider options`,
      cause: parsedProviderOptions.error
    });
  }
  return parsedProviderOptions.value;
}
var getOriginalFetch2$1 = () => globalThis.fetch;
var postJsonToApi$1 = async ({
  url,
  headers,
  body,
  failedResponseHandler,
  successfulResponseHandler,
  abortSignal,
  fetch
}) => postToApi$1({
  url,
  headers: {
    "Content-Type": "application/json",
    ...headers
  },
  body: {
    content: JSON.stringify(body),
    values: body
  },
  failedResponseHandler,
  successfulResponseHandler,
  abortSignal,
  fetch
});
var postToApi$1 = async ({
  url,
  headers = {},
  body,
  successfulResponseHandler,
  failedResponseHandler,
  abortSignal,
  fetch = getOriginalFetch2$1()
}) => {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: withUserAgentSuffix$1(
        headers,
        `ai-sdk/provider-utils/${VERSION$1$1}`,
        getRuntimeEnvironmentUserAgent$1()
      ),
      body: body.content,
      signal: abortSignal
    });
    const responseHeaders = extractResponseHeaders$1(response);
    if (!response.ok) {
      let errorInformation;
      try {
        errorInformation = await failedResponseHandler({
          response,
          url,
          requestBodyValues: body.values
        });
      } catch (error) {
        if (isAbortError$1(error) || APICallError$1.isInstance(error)) {
          throw error;
        }
        throw new APICallError$1({
          message: "Failed to process error response",
          cause: error,
          statusCode: response.status,
          url,
          responseHeaders,
          requestBodyValues: body.values
        });
      }
      throw errorInformation.value;
    }
    try {
      return await successfulResponseHandler({
        response,
        url,
        requestBodyValues: body.values
      });
    } catch (error) {
      if (error instanceof Error) {
        if (isAbortError$1(error) || APICallError$1.isInstance(error)) {
          throw error;
        }
      }
      throw new APICallError$1({
        message: "Failed to process successful response",
        cause: error,
        statusCode: response.status,
        url,
        responseHeaders,
        requestBodyValues: body.values
      });
    }
  } catch (error) {
    throw handleFetchError$1({ error, url, requestBodyValues: body.values });
  }
};

// src/types/tool.ts
function tool(tool2) {
  return tool2;
}

// src/provider-defined-tool-factory.ts
function createProviderDefinedToolFactory({
  id,
  name,
  inputSchema
}) {
  return ({
    execute,
    outputSchema,
    toModelOutput,
    onInputStart,
    onInputDelta,
    onInputAvailable,
    ...args
  }) => tool({
    type: "provider-defined",
    id,
    name,
    args,
    inputSchema,
    outputSchema,
    execute,
    toModelOutput,
    onInputStart,
    onInputDelta,
    onInputAvailable
  });
}
function createProviderDefinedToolFactoryWithOutputSchema({
  id,
  name,
  inputSchema,
  outputSchema
}) {
  return ({
    execute,
    toModelOutput,
    onInputStart,
    onInputDelta,
    onInputAvailable,
    ...args
  }) => tool({
    type: "provider-defined",
    id,
    name,
    args,
    inputSchema,
    outputSchema,
    execute,
    toModelOutput,
    onInputStart,
    onInputDelta,
    onInputAvailable
  });
}

// src/resolve.ts
async function resolve$1(value) {
  if (typeof value === "function") {
    value = value();
  }
  return Promise.resolve(value);
}
var createJsonErrorResponseHandler$1 = ({
  errorSchema,
  errorToMessage,
  isRetryable
}) => async ({ response, url, requestBodyValues }) => {
  const responseBody = await response.text();
  const responseHeaders = extractResponseHeaders$1(response);
  if (responseBody.trim() === "") {
    return {
      responseHeaders,
      value: new APICallError$1({
        message: response.statusText,
        url,
        requestBodyValues,
        statusCode: response.status,
        responseHeaders,
        responseBody,
        isRetryable: isRetryable == null ? void 0 : isRetryable(response)
      })
    };
  }
  try {
    const parsedError = await parseJSON$1({
      text: responseBody,
      schema: errorSchema
    });
    return {
      responseHeaders,
      value: new APICallError$1({
        message: errorToMessage(parsedError),
        url,
        requestBodyValues,
        statusCode: response.status,
        responseHeaders,
        responseBody,
        data: parsedError,
        isRetryable: isRetryable == null ? void 0 : isRetryable(response, parsedError)
      })
    };
  } catch (parseError) {
    return {
      responseHeaders,
      value: new APICallError$1({
        message: response.statusText,
        url,
        requestBodyValues,
        statusCode: response.status,
        responseHeaders,
        responseBody,
        isRetryable: isRetryable == null ? void 0 : isRetryable(response)
      })
    };
  }
};
var createEventSourceResponseHandler$1 = (chunkSchema) => async ({ response }) => {
  const responseHeaders = extractResponseHeaders$1(response);
  if (response.body == null) {
    throw new EmptyResponseBodyError$1({});
  }
  return {
    responseHeaders,
    value: parseJsonEventStream$1({
      stream: response.body,
      schema: chunkSchema
    })
  };
};
var createJsonResponseHandler$1 = (responseSchema) => async ({ response, url, requestBodyValues }) => {
  const responseBody = await response.text();
  const parsedResult = await safeParseJSON$1({
    text: responseBody,
    schema: responseSchema
  });
  const responseHeaders = extractResponseHeaders$1(response);
  if (!parsedResult.success) {
    throw new APICallError$1({
      message: "Invalid JSON response",
      cause: parsedResult.error,
      statusCode: response.status,
      responseHeaders,
      responseBody,
      url,
      requestBodyValues
    });
  }
  return {
    responseHeaders,
    value: parsedResult.value,
    rawValue: parsedResult.rawValue
  };
};

// src/zod-to-json-schema/get-relative-path.ts
var getRelativePath$1 = (pathA, pathB) => {
  let i = 0;
  for (; i < pathA.length && i < pathB.length; i++) {
    if (pathA[i] !== pathB[i]) break;
  }
  return [(pathA.length - i).toString(), ...pathB.slice(i)].join("/");
};

// src/zod-to-json-schema/options.ts
var ignoreOverride$1 = Symbol(
  "Let zodToJsonSchema decide on which parser to use"
);
var defaultOptions$1 = {
  name: void 0,
  $refStrategy: "root",
  basePath: ["#"],
  effectStrategy: "input",
  pipeStrategy: "all",
  dateStrategy: "format:date-time",
  mapStrategy: "entries",
  removeAdditionalStrategy: "passthrough",
  allowedAdditionalProperties: true,
  rejectedAdditionalProperties: false,
  definitionPath: "definitions",
  strictUnions: false,
  definitions: {},
  errorMessages: false,
  patternStrategy: "escape",
  applyRegexFlags: false,
  emailStrategy: "format:email",
  base64Strategy: "contentEncoding:base64",
  nameStrategy: "ref"
};
var getDefaultOptions$1 = (options) => typeof options === "string" ? {
  ...defaultOptions$1,
  name: options
} : {
  ...defaultOptions$1,
  ...options
};

// src/zod-to-json-schema/parsers/any.ts
function parseAnyDef$1() {
  return {};
}
function parseArrayDef$1(def, refs) {
  var _a, _b, _c;
  const res = {
    type: "array"
  };
  if (((_a = def.type) == null ? void 0 : _a._def) && ((_c = (_b = def.type) == null ? void 0 : _b._def) == null ? void 0 : _c.typeName) !== ZodFirstPartyTypeKind.ZodAny) {
    res.items = parseDef$1(def.type._def, {
      ...refs,
      currentPath: [...refs.currentPath, "items"]
    });
  }
  if (def.minLength) {
    res.minItems = def.minLength.value;
  }
  if (def.maxLength) {
    res.maxItems = def.maxLength.value;
  }
  if (def.exactLength) {
    res.minItems = def.exactLength.value;
    res.maxItems = def.exactLength.value;
  }
  return res;
}

// src/zod-to-json-schema/parsers/bigint.ts
function parseBigintDef$1(def) {
  const res = {
    type: "integer",
    format: "int64"
  };
  if (!def.checks) return res;
  for (const check of def.checks) {
    switch (check.kind) {
      case "min":
        if (check.inclusive) {
          res.minimum = check.value;
        } else {
          res.exclusiveMinimum = check.value;
        }
        break;
      case "max":
        if (check.inclusive) {
          res.maximum = check.value;
        } else {
          res.exclusiveMaximum = check.value;
        }
        break;
      case "multipleOf":
        res.multipleOf = check.value;
        break;
    }
  }
  return res;
}

// src/zod-to-json-schema/parsers/boolean.ts
function parseBooleanDef$1() {
  return { type: "boolean" };
}

// src/zod-to-json-schema/parsers/branded.ts
function parseBrandedDef$1(_def, refs) {
  return parseDef$1(_def.type._def, refs);
}

// src/zod-to-json-schema/parsers/catch.ts
var parseCatchDef$1 = (def, refs) => {
  return parseDef$1(def.innerType._def, refs);
};

// src/zod-to-json-schema/parsers/date.ts
function parseDateDef$1(def, refs, overrideDateStrategy) {
  const strategy = overrideDateStrategy != null ? overrideDateStrategy : refs.dateStrategy;
  if (Array.isArray(strategy)) {
    return {
      anyOf: strategy.map((item, i) => parseDateDef$1(def, refs, item))
    };
  }
  switch (strategy) {
    case "string":
    case "format:date-time":
      return {
        type: "string",
        format: "date-time"
      };
    case "format:date":
      return {
        type: "string",
        format: "date"
      };
    case "integer":
      return integerDateParser$1(def);
  }
}
var integerDateParser$1 = (def) => {
  const res = {
    type: "integer",
    format: "unix-time"
  };
  for (const check of def.checks) {
    switch (check.kind) {
      case "min":
        res.minimum = check.value;
        break;
      case "max":
        res.maximum = check.value;
        break;
    }
  }
  return res;
};

// src/zod-to-json-schema/parsers/default.ts
function parseDefaultDef$1(_def, refs) {
  return {
    ...parseDef$1(_def.innerType._def, refs),
    default: _def.defaultValue()
  };
}

// src/zod-to-json-schema/parsers/effects.ts
function parseEffectsDef$1(_def, refs) {
  return refs.effectStrategy === "input" ? parseDef$1(_def.schema._def, refs) : parseAnyDef$1();
}

// src/zod-to-json-schema/parsers/enum.ts
function parseEnumDef$1(def) {
  return {
    type: "string",
    enum: Array.from(def.values)
  };
}

// src/zod-to-json-schema/parsers/intersection.ts
var isJsonSchema7AllOfType$1 = (type) => {
  if ("type" in type && type.type === "string") return false;
  return "allOf" in type;
};
function parseIntersectionDef$1(def, refs) {
  const allOf = [
    parseDef$1(def.left._def, {
      ...refs,
      currentPath: [...refs.currentPath, "allOf", "0"]
    }),
    parseDef$1(def.right._def, {
      ...refs,
      currentPath: [...refs.currentPath, "allOf", "1"]
    })
  ].filter((x) => !!x);
  const mergedAllOf = [];
  allOf.forEach((schema) => {
    if (isJsonSchema7AllOfType$1(schema)) {
      mergedAllOf.push(...schema.allOf);
    } else {
      let nestedSchema = schema;
      if ("additionalProperties" in schema && schema.additionalProperties === false) {
        const { additionalProperties, ...rest } = schema;
        nestedSchema = rest;
      }
      mergedAllOf.push(nestedSchema);
    }
  });
  return mergedAllOf.length ? { allOf: mergedAllOf } : void 0;
}

// src/zod-to-json-schema/parsers/literal.ts
function parseLiteralDef$1(def) {
  const parsedType = typeof def.value;
  if (parsedType !== "bigint" && parsedType !== "number" && parsedType !== "boolean" && parsedType !== "string") {
    return {
      type: Array.isArray(def.value) ? "array" : "object"
    };
  }
  return {
    type: parsedType === "bigint" ? "integer" : parsedType,
    const: def.value
  };
}

// src/zod-to-json-schema/parsers/string.ts
var emojiRegex$1 = void 0;
var zodPatterns$1 = {
  /**
   * `c` was changed to `[cC]` to replicate /i flag
   */
  cuid: /^[cC][^\s-]{8,}$/,
  cuid2: /^[0-9a-z]+$/,
  ulid: /^[0-9A-HJKMNP-TV-Z]{26}$/,
  /**
   * `a-z` was added to replicate /i flag
   */
  email: /^(?!\.)(?!.*\.\.)([a-zA-Z0-9_'+\-\.]*)[a-zA-Z0-9_+-]@([a-zA-Z0-9][a-zA-Z0-9\-]*\.)+[a-zA-Z]{2,}$/,
  /**
   * Constructed a valid Unicode RegExp
   *
   * Lazily instantiate since this type of regex isn't supported
   * in all envs (e.g. React Native).
   *
   * See:
   * https://github.com/colinhacks/zod/issues/2433
   * Fix in Zod:
   * https://github.com/colinhacks/zod/commit/9340fd51e48576a75adc919bff65dbc4a5d4c99b
   */
  emoji: () => {
    if (emojiRegex$1 === void 0) {
      emojiRegex$1 = RegExp(
        "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$",
        "u"
      );
    }
    return emojiRegex$1;
  },
  /**
   * Unused
   */
  uuid: /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/,
  /**
   * Unused
   */
  ipv4: /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/,
  ipv4Cidr: /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/,
  /**
   * Unused
   */
  ipv6: /^(([a-f0-9]{1,4}:){7}|::([a-f0-9]{1,4}:){0,6}|([a-f0-9]{1,4}:){1}:([a-f0-9]{1,4}:){0,5}|([a-f0-9]{1,4}:){2}:([a-f0-9]{1,4}:){0,4}|([a-f0-9]{1,4}:){3}:([a-f0-9]{1,4}:){0,3}|([a-f0-9]{1,4}:){4}:([a-f0-9]{1,4}:){0,2}|([a-f0-9]{1,4}:){5}:([a-f0-9]{1,4}:){0,1})([a-f0-9]{1,4}|(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2})))$/,
  ipv6Cidr: /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/,
  base64: /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/,
  base64url: /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/,
  nanoid: /^[a-zA-Z0-9_-]{21}$/,
  jwt: /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/
};
function parseStringDef$1(def, refs) {
  const res = {
    type: "string"
  };
  if (def.checks) {
    for (const check of def.checks) {
      switch (check.kind) {
        case "min":
          res.minLength = typeof res.minLength === "number" ? Math.max(res.minLength, check.value) : check.value;
          break;
        case "max":
          res.maxLength = typeof res.maxLength === "number" ? Math.min(res.maxLength, check.value) : check.value;
          break;
        case "email":
          switch (refs.emailStrategy) {
            case "format:email":
              addFormat$1(res, "email", check.message, refs);
              break;
            case "format:idn-email":
              addFormat$1(res, "idn-email", check.message, refs);
              break;
            case "pattern:zod":
              addPattern$1(res, zodPatterns$1.email, check.message, refs);
              break;
          }
          break;
        case "url":
          addFormat$1(res, "uri", check.message, refs);
          break;
        case "uuid":
          addFormat$1(res, "uuid", check.message, refs);
          break;
        case "regex":
          addPattern$1(res, check.regex, check.message, refs);
          break;
        case "cuid":
          addPattern$1(res, zodPatterns$1.cuid, check.message, refs);
          break;
        case "cuid2":
          addPattern$1(res, zodPatterns$1.cuid2, check.message, refs);
          break;
        case "startsWith":
          addPattern$1(
            res,
            RegExp(`^${escapeLiteralCheckValue$1(check.value, refs)}`),
            check.message,
            refs
          );
          break;
        case "endsWith":
          addPattern$1(
            res,
            RegExp(`${escapeLiteralCheckValue$1(check.value, refs)}$`),
            check.message,
            refs
          );
          break;
        case "datetime":
          addFormat$1(res, "date-time", check.message, refs);
          break;
        case "date":
          addFormat$1(res, "date", check.message, refs);
          break;
        case "time":
          addFormat$1(res, "time", check.message, refs);
          break;
        case "duration":
          addFormat$1(res, "duration", check.message, refs);
          break;
        case "length":
          res.minLength = typeof res.minLength === "number" ? Math.max(res.minLength, check.value) : check.value;
          res.maxLength = typeof res.maxLength === "number" ? Math.min(res.maxLength, check.value) : check.value;
          break;
        case "includes": {
          addPattern$1(
            res,
            RegExp(escapeLiteralCheckValue$1(check.value, refs)),
            check.message,
            refs
          );
          break;
        }
        case "ip": {
          if (check.version !== "v6") {
            addFormat$1(res, "ipv4", check.message, refs);
          }
          if (check.version !== "v4") {
            addFormat$1(res, "ipv6", check.message, refs);
          }
          break;
        }
        case "base64url":
          addPattern$1(res, zodPatterns$1.base64url, check.message, refs);
          break;
        case "jwt":
          addPattern$1(res, zodPatterns$1.jwt, check.message, refs);
          break;
        case "cidr": {
          if (check.version !== "v6") {
            addPattern$1(res, zodPatterns$1.ipv4Cidr, check.message, refs);
          }
          if (check.version !== "v4") {
            addPattern$1(res, zodPatterns$1.ipv6Cidr, check.message, refs);
          }
          break;
        }
        case "emoji":
          addPattern$1(res, zodPatterns$1.emoji(), check.message, refs);
          break;
        case "ulid": {
          addPattern$1(res, zodPatterns$1.ulid, check.message, refs);
          break;
        }
        case "base64": {
          switch (refs.base64Strategy) {
            case "format:binary": {
              addFormat$1(res, "binary", check.message, refs);
              break;
            }
            case "contentEncoding:base64": {
              res.contentEncoding = "base64";
              break;
            }
            case "pattern:zod": {
              addPattern$1(res, zodPatterns$1.base64, check.message, refs);
              break;
            }
          }
          break;
        }
        case "nanoid": {
          addPattern$1(res, zodPatterns$1.nanoid, check.message, refs);
        }
      }
    }
  }
  return res;
}
function escapeLiteralCheckValue$1(literal, refs) {
  return refs.patternStrategy === "escape" ? escapeNonAlphaNumeric$1(literal) : literal;
}
var ALPHA_NUMERIC$1 = new Set(
  "ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvxyz0123456789"
);
function escapeNonAlphaNumeric$1(source) {
  let result = "";
  for (let i = 0; i < source.length; i++) {
    if (!ALPHA_NUMERIC$1.has(source[i])) {
      result += "\\";
    }
    result += source[i];
  }
  return result;
}
function addFormat$1(schema, value, message, refs) {
  var _a;
  if (schema.format || ((_a = schema.anyOf) == null ? void 0 : _a.some((x) => x.format))) {
    if (!schema.anyOf) {
      schema.anyOf = [];
    }
    if (schema.format) {
      schema.anyOf.push({
        format: schema.format
      });
      delete schema.format;
    }
    schema.anyOf.push({
      format: value,
      ...message && refs.errorMessages && { errorMessage: { format: message } }
    });
  } else {
    schema.format = value;
  }
}
function addPattern$1(schema, regex, message, refs) {
  var _a;
  if (schema.pattern || ((_a = schema.allOf) == null ? void 0 : _a.some((x) => x.pattern))) {
    if (!schema.allOf) {
      schema.allOf = [];
    }
    if (schema.pattern) {
      schema.allOf.push({
        pattern: schema.pattern
      });
      delete schema.pattern;
    }
    schema.allOf.push({
      pattern: stringifyRegExpWithFlags$1(regex, refs),
      ...message && refs.errorMessages && { errorMessage: { pattern: message } }
    });
  } else {
    schema.pattern = stringifyRegExpWithFlags$1(regex, refs);
  }
}
function stringifyRegExpWithFlags$1(regex, refs) {
  var _a;
  if (!refs.applyRegexFlags || !regex.flags) {
    return regex.source;
  }
  const flags = {
    i: regex.flags.includes("i"),
    // Case-insensitive
    m: regex.flags.includes("m"),
    // `^` and `$` matches adjacent to newline characters
    s: regex.flags.includes("s")
    // `.` matches newlines
  };
  const source = flags.i ? regex.source.toLowerCase() : regex.source;
  let pattern = "";
  let isEscaped = false;
  let inCharGroup = false;
  let inCharRange = false;
  for (let i = 0; i < source.length; i++) {
    if (isEscaped) {
      pattern += source[i];
      isEscaped = false;
      continue;
    }
    if (flags.i) {
      if (inCharGroup) {
        if (source[i].match(/[a-z]/)) {
          if (inCharRange) {
            pattern += source[i];
            pattern += `${source[i - 2]}-${source[i]}`.toUpperCase();
            inCharRange = false;
          } else if (source[i + 1] === "-" && ((_a = source[i + 2]) == null ? void 0 : _a.match(/[a-z]/))) {
            pattern += source[i];
            inCharRange = true;
          } else {
            pattern += `${source[i]}${source[i].toUpperCase()}`;
          }
          continue;
        }
      } else if (source[i].match(/[a-z]/)) {
        pattern += `[${source[i]}${source[i].toUpperCase()}]`;
        continue;
      }
    }
    if (flags.m) {
      if (source[i] === "^") {
        pattern += `(^|(?<=[\r
]))`;
        continue;
      } else if (source[i] === "$") {
        pattern += `($|(?=[\r
]))`;
        continue;
      }
    }
    if (flags.s && source[i] === ".") {
      pattern += inCharGroup ? `${source[i]}\r
` : `[${source[i]}\r
]`;
      continue;
    }
    pattern += source[i];
    if (source[i] === "\\") {
      isEscaped = true;
    } else if (inCharGroup && source[i] === "]") {
      inCharGroup = false;
    } else if (!inCharGroup && source[i] === "[") {
      inCharGroup = true;
    }
  }
  return pattern;
}

// src/zod-to-json-schema/parsers/record.ts
function parseRecordDef$1(def, refs) {
  var _a, _b, _c, _d, _e, _f;
  const schema = {
    type: "object",
    additionalProperties: (_a = parseDef$1(def.valueType._def, {
      ...refs,
      currentPath: [...refs.currentPath, "additionalProperties"]
    })) != null ? _a : refs.allowedAdditionalProperties
  };
  if (((_b = def.keyType) == null ? void 0 : _b._def.typeName) === ZodFirstPartyTypeKind.ZodString && ((_c = def.keyType._def.checks) == null ? void 0 : _c.length)) {
    const { type, ...keyType } = parseStringDef$1(def.keyType._def, refs);
    return {
      ...schema,
      propertyNames: keyType
    };
  } else if (((_d = def.keyType) == null ? void 0 : _d._def.typeName) === ZodFirstPartyTypeKind.ZodEnum) {
    return {
      ...schema,
      propertyNames: {
        enum: def.keyType._def.values
      }
    };
  } else if (((_e = def.keyType) == null ? void 0 : _e._def.typeName) === ZodFirstPartyTypeKind.ZodBranded && def.keyType._def.type._def.typeName === ZodFirstPartyTypeKind.ZodString && ((_f = def.keyType._def.type._def.checks) == null ? void 0 : _f.length)) {
    const { type, ...keyType } = parseBrandedDef$1(
      def.keyType._def,
      refs
    );
    return {
      ...schema,
      propertyNames: keyType
    };
  }
  return schema;
}

// src/zod-to-json-schema/parsers/map.ts
function parseMapDef$1(def, refs) {
  if (refs.mapStrategy === "record") {
    return parseRecordDef$1(def, refs);
  }
  const keys = parseDef$1(def.keyType._def, {
    ...refs,
    currentPath: [...refs.currentPath, "items", "items", "0"]
  }) || parseAnyDef$1();
  const values = parseDef$1(def.valueType._def, {
    ...refs,
    currentPath: [...refs.currentPath, "items", "items", "1"]
  }) || parseAnyDef$1();
  return {
    type: "array",
    maxItems: 125,
    items: {
      type: "array",
      items: [keys, values],
      minItems: 2,
      maxItems: 2
    }
  };
}

// src/zod-to-json-schema/parsers/native-enum.ts
function parseNativeEnumDef$1(def) {
  const object = def.values;
  const actualKeys = Object.keys(def.values).filter((key) => {
    return typeof object[object[key]] !== "number";
  });
  const actualValues = actualKeys.map((key) => object[key]);
  const parsedTypes = Array.from(
    new Set(actualValues.map((values) => typeof values))
  );
  return {
    type: parsedTypes.length === 1 ? parsedTypes[0] === "string" ? "string" : "number" : ["string", "number"],
    enum: actualValues
  };
}

// src/zod-to-json-schema/parsers/never.ts
function parseNeverDef$1() {
  return { not: parseAnyDef$1() };
}

// src/zod-to-json-schema/parsers/null.ts
function parseNullDef$1() {
  return {
    type: "null"
  };
}

// src/zod-to-json-schema/parsers/union.ts
var primitiveMappings$1 = {
  ZodString: "string",
  ZodNumber: "number",
  ZodBigInt: "integer",
  ZodBoolean: "boolean",
  ZodNull: "null"
};
function parseUnionDef$1(def, refs) {
  const options = def.options instanceof Map ? Array.from(def.options.values()) : def.options;
  if (options.every(
    (x) => x._def.typeName in primitiveMappings$1 && (!x._def.checks || !x._def.checks.length)
  )) {
    const types = options.reduce((types2, x) => {
      const type = primitiveMappings$1[x._def.typeName];
      return type && !types2.includes(type) ? [...types2, type] : types2;
    }, []);
    return {
      type: types.length > 1 ? types : types[0]
    };
  } else if (options.every((x) => x._def.typeName === "ZodLiteral" && !x.description)) {
    const types = options.reduce(
      (acc, x) => {
        const type = typeof x._def.value;
        switch (type) {
          case "string":
          case "number":
          case "boolean":
            return [...acc, type];
          case "bigint":
            return [...acc, "integer"];
          case "object":
            if (x._def.value === null) return [...acc, "null"];
          case "symbol":
          case "undefined":
          case "function":
          default:
            return acc;
        }
      },
      []
    );
    if (types.length === options.length) {
      const uniqueTypes = types.filter((x, i, a) => a.indexOf(x) === i);
      return {
        type: uniqueTypes.length > 1 ? uniqueTypes : uniqueTypes[0],
        enum: options.reduce(
          (acc, x) => {
            return acc.includes(x._def.value) ? acc : [...acc, x._def.value];
          },
          []
        )
      };
    }
  } else if (options.every((x) => x._def.typeName === "ZodEnum")) {
    return {
      type: "string",
      enum: options.reduce(
        (acc, x) => [
          ...acc,
          ...x._def.values.filter((x2) => !acc.includes(x2))
        ],
        []
      )
    };
  }
  return asAnyOf$1(def, refs);
}
var asAnyOf$1 = (def, refs) => {
  const anyOf = (def.options instanceof Map ? Array.from(def.options.values()) : def.options).map(
    (x, i) => parseDef$1(x._def, {
      ...refs,
      currentPath: [...refs.currentPath, "anyOf", `${i}`]
    })
  ).filter(
    (x) => !!x && (!refs.strictUnions || typeof x === "object" && Object.keys(x).length > 0)
  );
  return anyOf.length ? { anyOf } : void 0;
};

// src/zod-to-json-schema/parsers/nullable.ts
function parseNullableDef$1(def, refs) {
  if (["ZodString", "ZodNumber", "ZodBigInt", "ZodBoolean", "ZodNull"].includes(
    def.innerType._def.typeName
  ) && (!def.innerType._def.checks || !def.innerType._def.checks.length)) {
    return {
      type: [
        primitiveMappings$1[def.innerType._def.typeName],
        "null"
      ]
    };
  }
  const base = parseDef$1(def.innerType._def, {
    ...refs,
    currentPath: [...refs.currentPath, "anyOf", "0"]
  });
  return base && { anyOf: [base, { type: "null" }] };
}

// src/zod-to-json-schema/parsers/number.ts
function parseNumberDef$1(def) {
  const res = {
    type: "number"
  };
  if (!def.checks) return res;
  for (const check of def.checks) {
    switch (check.kind) {
      case "int":
        res.type = "integer";
        break;
      case "min":
        if (check.inclusive) {
          res.minimum = check.value;
        } else {
          res.exclusiveMinimum = check.value;
        }
        break;
      case "max":
        if (check.inclusive) {
          res.maximum = check.value;
        } else {
          res.exclusiveMaximum = check.value;
        }
        break;
      case "multipleOf":
        res.multipleOf = check.value;
        break;
    }
  }
  return res;
}

// src/zod-to-json-schema/parsers/object.ts
function parseObjectDef$1(def, refs) {
  const result = {
    type: "object",
    properties: {}
  };
  const required = [];
  const shape = def.shape();
  for (const propName in shape) {
    let propDef = shape[propName];
    if (propDef === void 0 || propDef._def === void 0) {
      continue;
    }
    const propOptional = safeIsOptional$1(propDef);
    const parsedDef = parseDef$1(propDef._def, {
      ...refs,
      currentPath: [...refs.currentPath, "properties", propName],
      propertyPath: [...refs.currentPath, "properties", propName]
    });
    if (parsedDef === void 0) {
      continue;
    }
    result.properties[propName] = parsedDef;
    if (!propOptional) {
      required.push(propName);
    }
  }
  if (required.length) {
    result.required = required;
  }
  const additionalProperties = decideAdditionalProperties$1(def, refs);
  if (additionalProperties !== void 0) {
    result.additionalProperties = additionalProperties;
  }
  return result;
}
function decideAdditionalProperties$1(def, refs) {
  if (def.catchall._def.typeName !== "ZodNever") {
    return parseDef$1(def.catchall._def, {
      ...refs,
      currentPath: [...refs.currentPath, "additionalProperties"]
    });
  }
  switch (def.unknownKeys) {
    case "passthrough":
      return refs.allowedAdditionalProperties;
    case "strict":
      return refs.rejectedAdditionalProperties;
    case "strip":
      return refs.removeAdditionalStrategy === "strict" ? refs.allowedAdditionalProperties : refs.rejectedAdditionalProperties;
  }
}
function safeIsOptional$1(schema) {
  try {
    return schema.isOptional();
  } catch (e) {
    return true;
  }
}

// src/zod-to-json-schema/parsers/optional.ts
var parseOptionalDef$1 = (def, refs) => {
  var _a;
  if (refs.currentPath.toString() === ((_a = refs.propertyPath) == null ? void 0 : _a.toString())) {
    return parseDef$1(def.innerType._def, refs);
  }
  const innerSchema = parseDef$1(def.innerType._def, {
    ...refs,
    currentPath: [...refs.currentPath, "anyOf", "1"]
  });
  return innerSchema ? { anyOf: [{ not: parseAnyDef$1() }, innerSchema] } : parseAnyDef$1();
};

// src/zod-to-json-schema/parsers/pipeline.ts
var parsePipelineDef$1 = (def, refs) => {
  if (refs.pipeStrategy === "input") {
    return parseDef$1(def.in._def, refs);
  } else if (refs.pipeStrategy === "output") {
    return parseDef$1(def.out._def, refs);
  }
  const a = parseDef$1(def.in._def, {
    ...refs,
    currentPath: [...refs.currentPath, "allOf", "0"]
  });
  const b = parseDef$1(def.out._def, {
    ...refs,
    currentPath: [...refs.currentPath, "allOf", a ? "1" : "0"]
  });
  return {
    allOf: [a, b].filter((x) => x !== void 0)
  };
};

// src/zod-to-json-schema/parsers/promise.ts
function parsePromiseDef$1(def, refs) {
  return parseDef$1(def.type._def, refs);
}

// src/zod-to-json-schema/parsers/set.ts
function parseSetDef$1(def, refs) {
  const items = parseDef$1(def.valueType._def, {
    ...refs,
    currentPath: [...refs.currentPath, "items"]
  });
  const schema = {
    type: "array",
    uniqueItems: true,
    items
  };
  if (def.minSize) {
    schema.minItems = def.minSize.value;
  }
  if (def.maxSize) {
    schema.maxItems = def.maxSize.value;
  }
  return schema;
}

// src/zod-to-json-schema/parsers/tuple.ts
function parseTupleDef$1(def, refs) {
  if (def.rest) {
    return {
      type: "array",
      minItems: def.items.length,
      items: def.items.map(
        (x, i) => parseDef$1(x._def, {
          ...refs,
          currentPath: [...refs.currentPath, "items", `${i}`]
        })
      ).reduce(
        (acc, x) => x === void 0 ? acc : [...acc, x],
        []
      ),
      additionalItems: parseDef$1(def.rest._def, {
        ...refs,
        currentPath: [...refs.currentPath, "additionalItems"]
      })
    };
  } else {
    return {
      type: "array",
      minItems: def.items.length,
      maxItems: def.items.length,
      items: def.items.map(
        (x, i) => parseDef$1(x._def, {
          ...refs,
          currentPath: [...refs.currentPath, "items", `${i}`]
        })
      ).reduce(
        (acc, x) => x === void 0 ? acc : [...acc, x],
        []
      )
    };
  }
}

// src/zod-to-json-schema/parsers/undefined.ts
function parseUndefinedDef$1() {
  return {
    not: parseAnyDef$1()
  };
}

// src/zod-to-json-schema/parsers/unknown.ts
function parseUnknownDef$1() {
  return parseAnyDef$1();
}

// src/zod-to-json-schema/parsers/readonly.ts
var parseReadonlyDef$1 = (def, refs) => {
  return parseDef$1(def.innerType._def, refs);
};

// src/zod-to-json-schema/select-parser.ts
var selectParser$1 = (def, typeName, refs) => {
  switch (typeName) {
    case ZodFirstPartyTypeKind.ZodString:
      return parseStringDef$1(def, refs);
    case ZodFirstPartyTypeKind.ZodNumber:
      return parseNumberDef$1(def);
    case ZodFirstPartyTypeKind.ZodObject:
      return parseObjectDef$1(def, refs);
    case ZodFirstPartyTypeKind.ZodBigInt:
      return parseBigintDef$1(def);
    case ZodFirstPartyTypeKind.ZodBoolean:
      return parseBooleanDef$1();
    case ZodFirstPartyTypeKind.ZodDate:
      return parseDateDef$1(def, refs);
    case ZodFirstPartyTypeKind.ZodUndefined:
      return parseUndefinedDef$1();
    case ZodFirstPartyTypeKind.ZodNull:
      return parseNullDef$1();
    case ZodFirstPartyTypeKind.ZodArray:
      return parseArrayDef$1(def, refs);
    case ZodFirstPartyTypeKind.ZodUnion:
    case ZodFirstPartyTypeKind.ZodDiscriminatedUnion:
      return parseUnionDef$1(def, refs);
    case ZodFirstPartyTypeKind.ZodIntersection:
      return parseIntersectionDef$1(def, refs);
    case ZodFirstPartyTypeKind.ZodTuple:
      return parseTupleDef$1(def, refs);
    case ZodFirstPartyTypeKind.ZodRecord:
      return parseRecordDef$1(def, refs);
    case ZodFirstPartyTypeKind.ZodLiteral:
      return parseLiteralDef$1(def);
    case ZodFirstPartyTypeKind.ZodEnum:
      return parseEnumDef$1(def);
    case ZodFirstPartyTypeKind.ZodNativeEnum:
      return parseNativeEnumDef$1(def);
    case ZodFirstPartyTypeKind.ZodNullable:
      return parseNullableDef$1(def, refs);
    case ZodFirstPartyTypeKind.ZodOptional:
      return parseOptionalDef$1(def, refs);
    case ZodFirstPartyTypeKind.ZodMap:
      return parseMapDef$1(def, refs);
    case ZodFirstPartyTypeKind.ZodSet:
      return parseSetDef$1(def, refs);
    case ZodFirstPartyTypeKind.ZodLazy:
      return () => def.getter()._def;
    case ZodFirstPartyTypeKind.ZodPromise:
      return parsePromiseDef$1(def, refs);
    case ZodFirstPartyTypeKind.ZodNaN:
    case ZodFirstPartyTypeKind.ZodNever:
      return parseNeverDef$1();
    case ZodFirstPartyTypeKind.ZodEffects:
      return parseEffectsDef$1(def, refs);
    case ZodFirstPartyTypeKind.ZodAny:
      return parseAnyDef$1();
    case ZodFirstPartyTypeKind.ZodUnknown:
      return parseUnknownDef$1();
    case ZodFirstPartyTypeKind.ZodDefault:
      return parseDefaultDef$1(def, refs);
    case ZodFirstPartyTypeKind.ZodBranded:
      return parseBrandedDef$1(def, refs);
    case ZodFirstPartyTypeKind.ZodReadonly:
      return parseReadonlyDef$1(def, refs);
    case ZodFirstPartyTypeKind.ZodCatch:
      return parseCatchDef$1(def, refs);
    case ZodFirstPartyTypeKind.ZodPipeline:
      return parsePipelineDef$1(def, refs);
    case ZodFirstPartyTypeKind.ZodFunction:
    case ZodFirstPartyTypeKind.ZodVoid:
    case ZodFirstPartyTypeKind.ZodSymbol:
      return void 0;
    default:
      return /* @__PURE__ */ ((_) => void 0)();
  }
};

// src/zod-to-json-schema/parse-def.ts
function parseDef$1(def, refs, forceResolution = false) {
  var _a;
  const seenItem = refs.seen.get(def);
  if (refs.override) {
    const overrideResult = (_a = refs.override) == null ? void 0 : _a.call(
      refs,
      def,
      refs,
      seenItem,
      forceResolution
    );
    if (overrideResult !== ignoreOverride$1) {
      return overrideResult;
    }
  }
  if (seenItem && !forceResolution) {
    const seenSchema = get$ref$1(seenItem, refs);
    if (seenSchema !== void 0) {
      return seenSchema;
    }
  }
  const newItem = { def, path: refs.currentPath, jsonSchema: void 0 };
  refs.seen.set(def, newItem);
  const jsonSchemaOrGetter = selectParser$1(def, def.typeName, refs);
  const jsonSchema2 = typeof jsonSchemaOrGetter === "function" ? parseDef$1(jsonSchemaOrGetter(), refs) : jsonSchemaOrGetter;
  if (jsonSchema2) {
    addMeta$1(def, refs, jsonSchema2);
  }
  if (refs.postProcess) {
    const postProcessResult = refs.postProcess(jsonSchema2, def, refs);
    newItem.jsonSchema = jsonSchema2;
    return postProcessResult;
  }
  newItem.jsonSchema = jsonSchema2;
  return jsonSchema2;
}
var get$ref$1 = (item, refs) => {
  switch (refs.$refStrategy) {
    case "root":
      return { $ref: item.path.join("/") };
    case "relative":
      return { $ref: getRelativePath$1(refs.currentPath, item.path) };
    case "none":
    case "seen": {
      if (item.path.length < refs.currentPath.length && item.path.every((value, index) => refs.currentPath[index] === value)) {
        console.warn(
          `Recursive reference detected at ${refs.currentPath.join(
            "/"
          )}! Defaulting to any`
        );
        return parseAnyDef$1();
      }
      return refs.$refStrategy === "seen" ? parseAnyDef$1() : void 0;
    }
  }
};
var addMeta$1 = (def, refs, jsonSchema2) => {
  if (def.description) {
    jsonSchema2.description = def.description;
  }
  return jsonSchema2;
};

// src/zod-to-json-schema/refs.ts
var getRefs$1 = (options) => {
  const _options = getDefaultOptions$1(options);
  const currentPath = _options.name !== void 0 ? [..._options.basePath, _options.definitionPath, _options.name] : _options.basePath;
  return {
    ..._options,
    currentPath,
    propertyPath: void 0,
    seen: new Map(
      Object.entries(_options.definitions).map(([name, def]) => [
        def._def,
        {
          def: def._def,
          path: [..._options.basePath, _options.definitionPath, name],
          // Resolution of references will be forced even though seen, so it's ok that the schema is undefined here for now.
          jsonSchema: void 0
        }
      ])
    )
  };
};

// src/zod-to-json-schema/zod-to-json-schema.ts
var zodToJsonSchema$1 = (schema, options) => {
  var _a;
  const refs = getRefs$1(options);
  let definitions = typeof options === "object" && options.definitions ? Object.entries(options.definitions).reduce(
    (acc, [name2, schema2]) => {
      var _a2;
      return {
        ...acc,
        [name2]: (_a2 = parseDef$1(
          schema2._def,
          {
            ...refs,
            currentPath: [...refs.basePath, refs.definitionPath, name2]
          },
          true
        )) != null ? _a2 : parseAnyDef$1()
      };
    },
    {}
  ) : void 0;
  const name = typeof options === "string" ? options : (options == null ? void 0 : options.nameStrategy) === "title" ? void 0 : options == null ? void 0 : options.name;
  const main = (_a = parseDef$1(
    schema._def,
    name === void 0 ? refs : {
      ...refs,
      currentPath: [...refs.basePath, refs.definitionPath, name]
    },
    false
  )) != null ? _a : parseAnyDef$1();
  const title = typeof options === "object" && options.name !== void 0 && options.nameStrategy === "title" ? options.name : void 0;
  if (title !== void 0) {
    main.title = title;
  }
  const combined = name === void 0 ? definitions ? {
    ...main,
    [refs.definitionPath]: definitions
  } : main : {
    $ref: [
      ...refs.$refStrategy === "relative" ? [] : refs.basePath,
      refs.definitionPath,
      name
    ].join("/"),
    [refs.definitionPath]: {
      ...definitions,
      [name]: main
    }
  };
  combined.$schema = "http://json-schema.org/draft-07/schema#";
  return combined;
};

// src/zod-to-json-schema/index.ts
var zod_to_json_schema_default$1 = zodToJsonSchema$1;

// src/zod-schema.ts
function zod3Schema$1(zodSchema2, options) {
  var _a;
  const useReferences = (_a = void 0 ) != null ? _a : false;
  return jsonSchema$1(
    // defer json schema creation to avoid unnecessary computation when only validation is needed
    () => zod_to_json_schema_default$1(zodSchema2, {
      $refStrategy: useReferences ? "root" : "none"
    }),
    {
      validate: async (value) => {
        const result = await zodSchema2.safeParseAsync(value);
        return result.success ? { success: true, value: result.data } : { success: false, error: result.error };
      }
    }
  );
}
function zod4Schema$1(zodSchema2, options) {
  var _a;
  const useReferences = (_a = void 0 ) != null ? _a : false;
  return jsonSchema$1(
    // defer json schema creation to avoid unnecessary computation when only validation is needed
    () => toJSONSchema(zodSchema2, {
      target: "draft-7",
      io: "output",
      reused: useReferences ? "ref" : "inline"
    }),
    {
      validate: async (value) => {
        const result = await safeParseAsync(zodSchema2, value);
        return result.success ? { success: true, value: result.data } : { success: false, error: result.error };
      }
    }
  );
}
function isZod4Schema$1(zodSchema2) {
  return "_zod" in zodSchema2;
}
function zodSchema$1(zodSchema2, options) {
  if (isZod4Schema$1(zodSchema2)) {
    return zod4Schema$1(zodSchema2);
  } else {
    return zod3Schema$1(zodSchema2);
  }
}

// src/schema.ts
var schemaSymbol$1 = Symbol.for("vercel.ai.schema");
function lazySchema(createSchema) {
  let schema;
  return () => {
    if (schema == null) {
      schema = createSchema();
    }
    return schema;
  };
}
function jsonSchema$1(jsonSchema2, {
  validate
} = {}) {
  return {
    [schemaSymbol$1]: true,
    _type: void 0,
    // should never be used directly
    [validatorSymbol$1]: true,
    get jsonSchema() {
      if (typeof jsonSchema2 === "function") {
        jsonSchema2 = jsonSchema2();
      }
      return jsonSchema2;
    },
    validate
  };
}

// src/uint8-utils.ts
var { btoa: btoa$1} = globalThis;
function convertUint8ArrayToBase64$1(array) {
  let latin1string = "";
  for (let i = 0; i < array.length; i++) {
    latin1string += String.fromCodePoint(array[i]);
  }
  return btoa$1(latin1string);
}
function convertToBase64(value) {
  return value instanceof Uint8Array ? convertUint8ArrayToBase64$1(value) : value;
}

// src/without-trailing-slash.ts
function withoutTrailingSlash$1(url) {
  return url == null ? void 0 : url.replace(/\/$/, "");
}

// src/anthropic-provider.ts

// src/version.ts
var VERSION$3 = "2.0.50" ;
var anthropicErrorDataSchema = lazySchema(
  () => zodSchema$1(
    object$1({
      type: literal("error"),
      error: object$1({
        type: string(),
        message: string()
      })
    })
  )
);
var anthropicFailedResponseHandler = createJsonErrorResponseHandler$1({
  errorSchema: anthropicErrorDataSchema,
  errorToMessage: (data) => data.error.message
});
var anthropicMessagesResponseSchema = lazySchema(
  () => zodSchema$1(
    object$1({
      type: literal("message"),
      id: string().nullish(),
      model: string().nullish(),
      content: array(
        discriminatedUnion("type", [
          object$1({
            type: literal("text"),
            text: string(),
            citations: array(
              discriminatedUnion("type", [
                object$1({
                  type: literal("web_search_result_location"),
                  cited_text: string(),
                  url: string(),
                  title: string(),
                  encrypted_index: string()
                }),
                object$1({
                  type: literal("page_location"),
                  cited_text: string(),
                  document_index: number(),
                  document_title: string().nullable(),
                  start_page_number: number(),
                  end_page_number: number()
                }),
                object$1({
                  type: literal("char_location"),
                  cited_text: string(),
                  document_index: number(),
                  document_title: string().nullable(),
                  start_char_index: number(),
                  end_char_index: number()
                })
              ])
            ).optional()
          }),
          object$1({
            type: literal("thinking"),
            thinking: string(),
            signature: string()
          }),
          object$1({
            type: literal("redacted_thinking"),
            data: string()
          }),
          object$1({
            type: literal("tool_use"),
            id: string(),
            name: string(),
            input: unknown()
          }),
          object$1({
            type: literal("server_tool_use"),
            id: string(),
            name: string(),
            input: record(string(), unknown()).nullish()
          }),
          object$1({
            type: literal("web_fetch_tool_result"),
            tool_use_id: string(),
            content: union([
              object$1({
                type: literal("web_fetch_result"),
                url: string(),
                retrieved_at: string(),
                content: object$1({
                  type: literal("document"),
                  title: string().nullable(),
                  citations: object$1({ enabled: boolean() }).optional(),
                  source: object$1({
                    type: literal("text"),
                    media_type: string(),
                    data: string()
                  })
                })
              }),
              object$1({
                type: literal("web_fetch_tool_result_error"),
                error_code: string()
              })
            ])
          }),
          object$1({
            type: literal("web_search_tool_result"),
            tool_use_id: string(),
            content: union([
              array(
                object$1({
                  type: literal("web_search_result"),
                  url: string(),
                  title: string(),
                  encrypted_content: string(),
                  page_age: string().nullish()
                })
              ),
              object$1({
                type: literal("web_search_tool_result_error"),
                error_code: string()
              })
            ])
          }),
          // code execution results for code_execution_20250522 tool:
          object$1({
            type: literal("code_execution_tool_result"),
            tool_use_id: string(),
            content: union([
              object$1({
                type: literal("code_execution_result"),
                stdout: string(),
                stderr: string(),
                return_code: number()
              }),
              object$1({
                type: literal("code_execution_tool_result_error"),
                error_code: string()
              })
            ])
          }),
          // bash code execution results for code_execution_20250825 tool:
          object$1({
            type: literal("bash_code_execution_tool_result"),
            tool_use_id: string(),
            content: discriminatedUnion("type", [
              object$1({
                type: literal("bash_code_execution_result"),
                content: array(
                  object$1({
                    type: literal("bash_code_execution_output"),
                    file_id: string()
                  })
                ),
                stdout: string(),
                stderr: string(),
                return_code: number()
              }),
              object$1({
                type: literal("bash_code_execution_tool_result_error"),
                error_code: string()
              })
            ])
          }),
          // text editor code execution results for code_execution_20250825 tool:
          object$1({
            type: literal("text_editor_code_execution_tool_result"),
            tool_use_id: string(),
            content: discriminatedUnion("type", [
              object$1({
                type: literal("text_editor_code_execution_tool_result_error"),
                error_code: string()
              }),
              object$1({
                type: literal("text_editor_code_execution_view_result"),
                content: string(),
                file_type: string(),
                num_lines: number().nullable(),
                start_line: number().nullable(),
                total_lines: number().nullable()
              }),
              object$1({
                type: literal("text_editor_code_execution_create_result"),
                is_file_update: boolean()
              }),
              object$1({
                type: literal(
                  "text_editor_code_execution_str_replace_result"
                ),
                lines: array(string()).nullable(),
                new_lines: number().nullable(),
                new_start: number().nullable(),
                old_lines: number().nullable(),
                old_start: number().nullable()
              })
            ])
          })
        ])
      ),
      stop_reason: string().nullish(),
      stop_sequence: string().nullish(),
      usage: looseObject({
        input_tokens: number(),
        output_tokens: number(),
        cache_creation_input_tokens: number().nullish(),
        cache_read_input_tokens: number().nullish()
      }),
      container: object$1({
        expires_at: string(),
        id: string(),
        skills: array(
          object$1({
            type: union([literal("anthropic"), literal("custom")]),
            skill_id: string(),
            version: string()
          })
        ).nullish()
      }).nullish()
    })
  )
);
var anthropicMessagesChunkSchema = lazySchema(
  () => zodSchema$1(
    discriminatedUnion("type", [
      object$1({
        type: literal("message_start"),
        message: object$1({
          id: string().nullish(),
          model: string().nullish(),
          usage: looseObject({
            input_tokens: number(),
            cache_creation_input_tokens: number().nullish(),
            cache_read_input_tokens: number().nullish()
          })
        })
      }),
      object$1({
        type: literal("content_block_start"),
        index: number(),
        content_block: discriminatedUnion("type", [
          object$1({
            type: literal("text"),
            text: string()
          }),
          object$1({
            type: literal("thinking"),
            thinking: string()
          }),
          object$1({
            type: literal("tool_use"),
            id: string(),
            name: string()
          }),
          object$1({
            type: literal("redacted_thinking"),
            data: string()
          }),
          object$1({
            type: literal("server_tool_use"),
            id: string(),
            name: string(),
            input: record(string(), unknown()).nullish()
          }),
          object$1({
            type: literal("web_fetch_tool_result"),
            tool_use_id: string(),
            content: union([
              object$1({
                type: literal("web_fetch_result"),
                url: string(),
                retrieved_at: string(),
                content: object$1({
                  type: literal("document"),
                  title: string().nullable(),
                  citations: object$1({ enabled: boolean() }).optional(),
                  source: object$1({
                    type: literal("text"),
                    media_type: string(),
                    data: string()
                  })
                })
              }),
              object$1({
                type: literal("web_fetch_tool_result_error"),
                error_code: string()
              })
            ])
          }),
          object$1({
            type: literal("web_search_tool_result"),
            tool_use_id: string(),
            content: union([
              array(
                object$1({
                  type: literal("web_search_result"),
                  url: string(),
                  title: string(),
                  encrypted_content: string(),
                  page_age: string().nullish()
                })
              ),
              object$1({
                type: literal("web_search_tool_result_error"),
                error_code: string()
              })
            ])
          }),
          // code execution results for code_execution_20250522 tool:
          object$1({
            type: literal("code_execution_tool_result"),
            tool_use_id: string(),
            content: union([
              object$1({
                type: literal("code_execution_result"),
                stdout: string(),
                stderr: string(),
                return_code: number()
              }),
              object$1({
                type: literal("code_execution_tool_result_error"),
                error_code: string()
              })
            ])
          }),
          // bash code execution results for code_execution_20250825 tool:
          object$1({
            type: literal("bash_code_execution_tool_result"),
            tool_use_id: string(),
            content: discriminatedUnion("type", [
              object$1({
                type: literal("bash_code_execution_result"),
                content: array(
                  object$1({
                    type: literal("bash_code_execution_output"),
                    file_id: string()
                  })
                ),
                stdout: string(),
                stderr: string(),
                return_code: number()
              }),
              object$1({
                type: literal("bash_code_execution_tool_result_error"),
                error_code: string()
              })
            ])
          }),
          // text editor code execution results for code_execution_20250825 tool:
          object$1({
            type: literal("text_editor_code_execution_tool_result"),
            tool_use_id: string(),
            content: discriminatedUnion("type", [
              object$1({
                type: literal("text_editor_code_execution_tool_result_error"),
                error_code: string()
              }),
              object$1({
                type: literal("text_editor_code_execution_view_result"),
                content: string(),
                file_type: string(),
                num_lines: number().nullable(),
                start_line: number().nullable(),
                total_lines: number().nullable()
              }),
              object$1({
                type: literal("text_editor_code_execution_create_result"),
                is_file_update: boolean()
              }),
              object$1({
                type: literal(
                  "text_editor_code_execution_str_replace_result"
                ),
                lines: array(string()).nullable(),
                new_lines: number().nullable(),
                new_start: number().nullable(),
                old_lines: number().nullable(),
                old_start: number().nullable()
              })
            ])
          })
        ])
      }),
      object$1({
        type: literal("content_block_delta"),
        index: number(),
        delta: discriminatedUnion("type", [
          object$1({
            type: literal("input_json_delta"),
            partial_json: string()
          }),
          object$1({
            type: literal("text_delta"),
            text: string()
          }),
          object$1({
            type: literal("thinking_delta"),
            thinking: string()
          }),
          object$1({
            type: literal("signature_delta"),
            signature: string()
          }),
          object$1({
            type: literal("citations_delta"),
            citation: discriminatedUnion("type", [
              object$1({
                type: literal("web_search_result_location"),
                cited_text: string(),
                url: string(),
                title: string(),
                encrypted_index: string()
              }),
              object$1({
                type: literal("page_location"),
                cited_text: string(),
                document_index: number(),
                document_title: string().nullable(),
                start_page_number: number(),
                end_page_number: number()
              }),
              object$1({
                type: literal("char_location"),
                cited_text: string(),
                document_index: number(),
                document_title: string().nullable(),
                start_char_index: number(),
                end_char_index: number()
              })
            ])
          })
        ])
      }),
      object$1({
        type: literal("content_block_stop"),
        index: number()
      }),
      object$1({
        type: literal("error"),
        error: object$1({
          type: string(),
          message: string()
        })
      }),
      object$1({
        type: literal("message_delta"),
        delta: object$1({
          stop_reason: string().nullish(),
          stop_sequence: string().nullish(),
          container: object$1({
            expires_at: string(),
            id: string(),
            skills: array(
              object$1({
                type: union([
                  literal("anthropic"),
                  literal("custom")
                ]),
                skill_id: string(),
                version: string()
              })
            ).nullish()
          }).nullish()
        }),
        usage: looseObject({
          output_tokens: number(),
          cache_creation_input_tokens: number().nullish()
        })
      }),
      object$1({
        type: literal("message_stop")
      }),
      object$1({
        type: literal("ping")
      })
    ])
  )
);
var anthropicReasoningMetadataSchema = lazySchema(
  () => zodSchema$1(
    object$1({
      signature: string().optional(),
      redactedData: string().optional()
    })
  )
);
var anthropicFilePartProviderOptions = object$1({
  /**
   * Citation configuration for this document.
   * When enabled, this document will generate citations in the response.
   */
  citations: object$1({
    /**
     * Enable citations for this document
     */
    enabled: boolean()
  }).optional(),
  /**
   * Custom title for the document.
   * If not provided, the filename will be used.
   */
  title: string().optional(),
  /**
   * Context about the document that will be passed to the model
   * but not used towards cited content.
   * Useful for storing document metadata as text or stringified JSON.
   */
  context: string().optional()
});
var anthropicProviderOptions = object$1({
  sendReasoning: boolean().optional(),
  /**
   * Determines how structured outputs are generated.
   *
   * - `outputFormat`: Use the `output_format` parameter to specify the structured output format.
   * - `jsonTool`: Use a special 'json' tool to specify the structured output format (default).
   * - `auto`: Use 'outputFormat' when supported, otherwise use 'jsonTool'.
   */
  structuredOutputMode: _enum(["outputFormat", "jsonTool", "auto"]).optional(),
  /**
   * Configuration for enabling Claude's extended thinking.
   *
   * When enabled, responses include thinking content blocks showing Claude's thinking process before the final answer.
   * Requires a minimum budget of 1,024 tokens and counts towards the `max_tokens` limit.
   */
  thinking: object$1({
    type: union([literal("enabled"), literal("disabled")]),
    budgetTokens: number().optional()
  }).optional(),
  /**
   * Whether to disable parallel function calling during tool use. Default is false.
   * When set to true, Claude will use at most one tool per response.
   */
  disableParallelToolUse: boolean().optional(),
  /**
   * Cache control settings for this message.
   * See https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching
   */
  cacheControl: object$1({
    type: literal("ephemeral"),
    ttl: union([literal("5m"), literal("1h")]).optional()
  }).optional(),
  /**
   * Agent Skills configuration. Skills enable Claude to perform specialized tasks
   * like document processing (PPTX, DOCX, PDF, XLSX) and data analysis.
   * Requires code execution tool to be enabled.
   */
  container: object$1({
    id: string().optional(),
    skills: array(
      object$1({
        type: union([literal("anthropic"), literal("custom")]),
        skillId: string(),
        version: string().optional()
      })
    ).optional()
  }).optional(),
  /**
   * @default 'high'
   */
  effort: _enum(["low", "medium", "high"]).optional()
});

// src/get-cache-control.ts
var MAX_CACHE_BREAKPOINTS = 4;
function getCacheControl(providerMetadata) {
  var _a;
  const anthropic2 = providerMetadata == null ? void 0 : providerMetadata.anthropic;
  const cacheControlValue = (_a = anthropic2 == null ? void 0 : anthropic2.cacheControl) != null ? _a : anthropic2 == null ? void 0 : anthropic2.cache_control;
  return cacheControlValue;
}
var CacheControlValidator = class {
  constructor() {
    this.breakpointCount = 0;
    this.warnings = [];
  }
  getCacheControl(providerMetadata, context) {
    const cacheControlValue = getCacheControl(providerMetadata);
    if (!cacheControlValue) {
      return void 0;
    }
    if (!context.canCache) {
      this.warnings.push({
        type: "unsupported-setting",
        setting: "cacheControl",
        details: `cache_control cannot be set on ${context.type}. It will be ignored.`
      });
      return void 0;
    }
    this.breakpointCount++;
    if (this.breakpointCount > MAX_CACHE_BREAKPOINTS) {
      this.warnings.push({
        type: "unsupported-setting",
        setting: "cacheControl",
        details: `Maximum ${MAX_CACHE_BREAKPOINTS} cache breakpoints exceeded (found ${this.breakpointCount}). This breakpoint will be ignored.`
      });
      return void 0;
    }
    return cacheControlValue;
  }
  getWarnings() {
    return this.warnings;
  }
};
var textEditor_20250728ArgsSchema = lazySchema(
  () => zodSchema$1(
    object$1({
      maxCharacters: number().optional()
    })
  )
);
var textEditor_20250728InputSchema = lazySchema(
  () => zodSchema$1(
    object$1({
      command: _enum(["view", "create", "str_replace", "insert"]),
      path: string(),
      file_text: string().optional(),
      insert_line: number().int().optional(),
      new_str: string().optional(),
      old_str: string().optional(),
      view_range: array(number().int()).optional()
    })
  )
);
var factory = createProviderDefinedToolFactory({
  id: "anthropic.text_editor_20250728",
  name: "str_replace_based_edit_tool",
  inputSchema: textEditor_20250728InputSchema
});
var textEditor_20250728 = (args = {}) => {
  return factory(args);
};
var webSearch_20250305ArgsSchema = lazySchema(
  () => zodSchema$1(
    object$1({
      maxUses: number().optional(),
      allowedDomains: array(string()).optional(),
      blockedDomains: array(string()).optional(),
      userLocation: object$1({
        type: literal("approximate"),
        city: string().optional(),
        region: string().optional(),
        country: string().optional(),
        timezone: string().optional()
      }).optional()
    })
  )
);
var webSearch_20250305OutputSchema = lazySchema(
  () => zodSchema$1(
    array(
      object$1({
        url: string(),
        title: string(),
        pageAge: string().nullable(),
        encryptedContent: string(),
        type: literal("web_search_result")
      })
    )
  )
);
var webSearch_20250305InputSchema = lazySchema(
  () => zodSchema$1(
    object$1({
      query: string()
    })
  )
);
var factory2 = createProviderDefinedToolFactoryWithOutputSchema({
  id: "anthropic.web_search_20250305",
  name: "web_search",
  inputSchema: webSearch_20250305InputSchema,
  outputSchema: webSearch_20250305OutputSchema
});
var webSearch_20250305 = (args = {}) => {
  return factory2(args);
};
var webFetch_20250910ArgsSchema = lazySchema(
  () => zodSchema$1(
    object$1({
      maxUses: number().optional(),
      allowedDomains: array(string()).optional(),
      blockedDomains: array(string()).optional(),
      citations: object$1({ enabled: boolean() }).optional(),
      maxContentTokens: number().optional()
    })
  )
);
var webFetch_20250910OutputSchema = lazySchema(
  () => zodSchema$1(
    object$1({
      type: literal("web_fetch_result"),
      url: string(),
      content: object$1({
        type: literal("document"),
        title: string(),
        citations: object$1({ enabled: boolean() }).optional(),
        source: union([
          object$1({
            type: literal("base64"),
            mediaType: literal("application/pdf"),
            data: string()
          }),
          object$1({
            type: literal("text"),
            mediaType: literal("text/plain"),
            data: string()
          })
        ])
      }),
      retrievedAt: string().nullable()
    })
  )
);
var webFetch_20250910InputSchema = lazySchema(
  () => zodSchema$1(
    object$1({
      url: string()
    })
  )
);
var factory3 = createProviderDefinedToolFactoryWithOutputSchema({
  id: "anthropic.web_fetch_20250910",
  name: "web_fetch",
  inputSchema: webFetch_20250910InputSchema,
  outputSchema: webFetch_20250910OutputSchema
});
var webFetch_20250910 = (args = {}) => {
  return factory3(args);
};
async function prepareTools({
  tools,
  toolChoice,
  disableParallelToolUse,
  cacheControlValidator
}) {
  tools = (tools == null ? void 0 : tools.length) ? tools : void 0;
  const toolWarnings = [];
  const betas = /* @__PURE__ */ new Set();
  const validator = cacheControlValidator || new CacheControlValidator();
  if (tools == null) {
    return { tools: void 0, toolChoice: void 0, toolWarnings, betas };
  }
  const anthropicTools2 = [];
  for (const tool of tools) {
    switch (tool.type) {
      case "function": {
        const cacheControl = validator.getCacheControl(tool.providerOptions, {
          type: "tool definition",
          canCache: true
        });
        anthropicTools2.push({
          name: tool.name,
          description: tool.description,
          input_schema: tool.inputSchema,
          cache_control: cacheControl
        });
        break;
      }
      case "provider-defined": {
        switch (tool.id) {
          case "anthropic.code_execution_20250522": {
            betas.add("code-execution-2025-05-22");
            anthropicTools2.push({
              type: "code_execution_20250522",
              name: "code_execution",
              cache_control: void 0
            });
            break;
          }
          case "anthropic.code_execution_20250825": {
            betas.add("code-execution-2025-08-25");
            anthropicTools2.push({
              type: "code_execution_20250825",
              name: "code_execution"
            });
            break;
          }
          case "anthropic.computer_20250124": {
            betas.add("computer-use-2025-01-24");
            anthropicTools2.push({
              name: "computer",
              type: "computer_20250124",
              display_width_px: tool.args.displayWidthPx,
              display_height_px: tool.args.displayHeightPx,
              display_number: tool.args.displayNumber,
              cache_control: void 0
            });
            break;
          }
          case "anthropic.computer_20241022": {
            betas.add("computer-use-2024-10-22");
            anthropicTools2.push({
              name: "computer",
              type: "computer_20241022",
              display_width_px: tool.args.displayWidthPx,
              display_height_px: tool.args.displayHeightPx,
              display_number: tool.args.displayNumber,
              cache_control: void 0
            });
            break;
          }
          case "anthropic.text_editor_20250124": {
            betas.add("computer-use-2025-01-24");
            anthropicTools2.push({
              name: "str_replace_editor",
              type: "text_editor_20250124",
              cache_control: void 0
            });
            break;
          }
          case "anthropic.text_editor_20241022": {
            betas.add("computer-use-2024-10-22");
            anthropicTools2.push({
              name: "str_replace_editor",
              type: "text_editor_20241022",
              cache_control: void 0
            });
            break;
          }
          case "anthropic.text_editor_20250429": {
            betas.add("computer-use-2025-01-24");
            anthropicTools2.push({
              name: "str_replace_based_edit_tool",
              type: "text_editor_20250429",
              cache_control: void 0
            });
            break;
          }
          case "anthropic.text_editor_20250728": {
            const args = await validateTypes$1({
              value: tool.args,
              schema: textEditor_20250728ArgsSchema
            });
            anthropicTools2.push({
              name: "str_replace_based_edit_tool",
              type: "text_editor_20250728",
              max_characters: args.maxCharacters,
              cache_control: void 0
            });
            break;
          }
          case "anthropic.bash_20250124": {
            betas.add("computer-use-2025-01-24");
            anthropicTools2.push({
              name: "bash",
              type: "bash_20250124",
              cache_control: void 0
            });
            break;
          }
          case "anthropic.bash_20241022": {
            betas.add("computer-use-2024-10-22");
            anthropicTools2.push({
              name: "bash",
              type: "bash_20241022",
              cache_control: void 0
            });
            break;
          }
          case "anthropic.memory_20250818": {
            betas.add("context-management-2025-06-27");
            anthropicTools2.push({
              name: "memory",
              type: "memory_20250818"
            });
            break;
          }
          case "anthropic.web_fetch_20250910": {
            betas.add("web-fetch-2025-09-10");
            const args = await validateTypes$1({
              value: tool.args,
              schema: webFetch_20250910ArgsSchema
            });
            anthropicTools2.push({
              type: "web_fetch_20250910",
              name: "web_fetch",
              max_uses: args.maxUses,
              allowed_domains: args.allowedDomains,
              blocked_domains: args.blockedDomains,
              citations: args.citations,
              max_content_tokens: args.maxContentTokens,
              cache_control: void 0
            });
            break;
          }
          case "anthropic.web_search_20250305": {
            const args = await validateTypes$1({
              value: tool.args,
              schema: webSearch_20250305ArgsSchema
            });
            anthropicTools2.push({
              type: "web_search_20250305",
              name: "web_search",
              max_uses: args.maxUses,
              allowed_domains: args.allowedDomains,
              blocked_domains: args.blockedDomains,
              user_location: args.userLocation,
              cache_control: void 0
            });
            break;
          }
          default: {
            toolWarnings.push({ type: "unsupported-tool", tool });
            break;
          }
        }
        break;
      }
      default: {
        toolWarnings.push({ type: "unsupported-tool", tool });
        break;
      }
    }
  }
  if (toolChoice == null) {
    return {
      tools: anthropicTools2,
      toolChoice: disableParallelToolUse ? { type: "auto", disable_parallel_tool_use: disableParallelToolUse } : void 0,
      toolWarnings,
      betas
    };
  }
  const type = toolChoice.type;
  switch (type) {
    case "auto":
      return {
        tools: anthropicTools2,
        toolChoice: {
          type: "auto",
          disable_parallel_tool_use: disableParallelToolUse
        },
        toolWarnings,
        betas
      };
    case "required":
      return {
        tools: anthropicTools2,
        toolChoice: {
          type: "any",
          disable_parallel_tool_use: disableParallelToolUse
        },
        toolWarnings,
        betas
      };
    case "none":
      return { tools: void 0, toolChoice: void 0, toolWarnings, betas };
    case "tool":
      return {
        tools: anthropicTools2,
        toolChoice: {
          type: "tool",
          name: toolChoice.toolName,
          disable_parallel_tool_use: disableParallelToolUse
        },
        toolWarnings,
        betas
      };
    default: {
      const _exhaustiveCheck = type;
      throw new UnsupportedFunctionalityError({
        functionality: `tool choice type: ${_exhaustiveCheck}`
      });
    }
  }
}
var codeExecution_20250522OutputSchema = lazySchema(
  () => zodSchema$1(
    object$1({
      type: literal("code_execution_result"),
      stdout: string(),
      stderr: string(),
      return_code: number()
    })
  )
);
var codeExecution_20250522InputSchema = lazySchema(
  () => zodSchema$1(
    object$1({
      code: string()
    })
  )
);
var factory4 = createProviderDefinedToolFactoryWithOutputSchema({
  id: "anthropic.code_execution_20250522",
  name: "code_execution",
  inputSchema: codeExecution_20250522InputSchema,
  outputSchema: codeExecution_20250522OutputSchema
});
var codeExecution_20250522 = (args = {}) => {
  return factory4(args);
};
var codeExecution_20250825OutputSchema = lazySchema(
  () => zodSchema$1(
    discriminatedUnion("type", [
      object$1({
        type: literal("bash_code_execution_result"),
        content: array(
          object$1({
            type: literal("bash_code_execution_output"),
            file_id: string()
          })
        ),
        stdout: string(),
        stderr: string(),
        return_code: number()
      }),
      object$1({
        type: literal("bash_code_execution_tool_result_error"),
        error_code: string()
      }),
      object$1({
        type: literal("text_editor_code_execution_tool_result_error"),
        error_code: string()
      }),
      object$1({
        type: literal("text_editor_code_execution_view_result"),
        content: string(),
        file_type: string(),
        num_lines: number().nullable(),
        start_line: number().nullable(),
        total_lines: number().nullable()
      }),
      object$1({
        type: literal("text_editor_code_execution_create_result"),
        is_file_update: boolean()
      }),
      object$1({
        type: literal("text_editor_code_execution_str_replace_result"),
        lines: array(string()).nullable(),
        new_lines: number().nullable(),
        new_start: number().nullable(),
        old_lines: number().nullable(),
        old_start: number().nullable()
      })
    ])
  )
);
var codeExecution_20250825InputSchema = lazySchema(
  () => zodSchema$1(
    discriminatedUnion("type", [
      object$1({
        type: literal("bash_code_execution"),
        command: string()
      }),
      discriminatedUnion("command", [
        object$1({
          type: literal("text_editor_code_execution"),
          command: literal("view"),
          path: string()
        }),
        object$1({
          type: literal("text_editor_code_execution"),
          command: literal("create"),
          path: string(),
          file_text: string().nullish()
        }),
        object$1({
          type: literal("text_editor_code_execution"),
          command: literal("str_replace"),
          path: string(),
          old_str: string(),
          new_str: string()
        })
      ])
    ])
  )
);
var factory5 = createProviderDefinedToolFactoryWithOutputSchema({
  id: "anthropic.code_execution_20250825",
  name: "code_execution",
  inputSchema: codeExecution_20250825InputSchema,
  outputSchema: codeExecution_20250825OutputSchema
});
var codeExecution_20250825 = (args = {}) => {
  return factory5(args);
};

// src/convert-to-anthropic-messages-prompt.ts
function convertToString(data) {
  if (typeof data === "string") {
    return Buffer.from(data, "base64").toString("utf-8");
  }
  if (data instanceof Uint8Array) {
    return new TextDecoder().decode(data);
  }
  if (data instanceof URL) {
    throw new UnsupportedFunctionalityError({
      functionality: "URL-based text documents are not supported for citations"
    });
  }
  throw new UnsupportedFunctionalityError({
    functionality: `unsupported data type for text documents: ${typeof data}`
  });
}
async function convertToAnthropicMessagesPrompt({
  prompt,
  sendReasoning,
  warnings,
  cacheControlValidator
}) {
  var _a, _b, _c, _d, _e;
  const betas = /* @__PURE__ */ new Set();
  const blocks = groupIntoBlocks(prompt);
  const validator = cacheControlValidator || new CacheControlValidator();
  let system = void 0;
  const messages = [];
  async function shouldEnableCitations(providerMetadata) {
    var _a2, _b2;
    const anthropicOptions = await parseProviderOptions({
      provider: "anthropic",
      providerOptions: providerMetadata,
      schema: anthropicFilePartProviderOptions
    });
    return (_b2 = (_a2 = anthropicOptions == null ? void 0 : anthropicOptions.citations) == null ? void 0 : _a2.enabled) != null ? _b2 : false;
  }
  async function getDocumentMetadata(providerMetadata) {
    const anthropicOptions = await parseProviderOptions({
      provider: "anthropic",
      providerOptions: providerMetadata,
      schema: anthropicFilePartProviderOptions
    });
    return {
      title: anthropicOptions == null ? void 0 : anthropicOptions.title,
      context: anthropicOptions == null ? void 0 : anthropicOptions.context
    };
  }
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const isLastBlock = i === blocks.length - 1;
    const type = block.type;
    switch (type) {
      case "system": {
        if (system != null) {
          throw new UnsupportedFunctionalityError({
            functionality: "Multiple system messages that are separated by user/assistant messages"
          });
        }
        system = block.messages.map(({ content, providerOptions }) => ({
          type: "text",
          text: content,
          cache_control: validator.getCacheControl(providerOptions, {
            type: "system message",
            canCache: true
          })
        }));
        break;
      }
      case "user": {
        const anthropicContent = [];
        for (const message of block.messages) {
          const { role, content } = message;
          switch (role) {
            case "user": {
              for (let j = 0; j < content.length; j++) {
                const part = content[j];
                const isLastPart = j === content.length - 1;
                const cacheControl = (_a = validator.getCacheControl(part.providerOptions, {
                  type: "user message part",
                  canCache: true
                })) != null ? _a : isLastPart ? validator.getCacheControl(message.providerOptions, {
                  type: "user message",
                  canCache: true
                }) : void 0;
                switch (part.type) {
                  case "text": {
                    anthropicContent.push({
                      type: "text",
                      text: part.text,
                      cache_control: cacheControl
                    });
                    break;
                  }
                  case "file": {
                    if (part.mediaType.startsWith("image/")) {
                      anthropicContent.push({
                        type: "image",
                        source: part.data instanceof URL ? {
                          type: "url",
                          url: part.data.toString()
                        } : {
                          type: "base64",
                          media_type: part.mediaType === "image/*" ? "image/jpeg" : part.mediaType,
                          data: convertToBase64(part.data)
                        },
                        cache_control: cacheControl
                      });
                    } else if (part.mediaType === "application/pdf") {
                      betas.add("pdfs-2024-09-25");
                      const enableCitations = await shouldEnableCitations(
                        part.providerOptions
                      );
                      const metadata = await getDocumentMetadata(
                        part.providerOptions
                      );
                      anthropicContent.push({
                        type: "document",
                        source: part.data instanceof URL ? {
                          type: "url",
                          url: part.data.toString()
                        } : {
                          type: "base64",
                          media_type: "application/pdf",
                          data: convertToBase64(part.data)
                        },
                        title: (_b = metadata.title) != null ? _b : part.filename,
                        ...metadata.context && { context: metadata.context },
                        ...enableCitations && {
                          citations: { enabled: true }
                        },
                        cache_control: cacheControl
                      });
                    } else if (part.mediaType === "text/plain") {
                      const enableCitations = await shouldEnableCitations(
                        part.providerOptions
                      );
                      const metadata = await getDocumentMetadata(
                        part.providerOptions
                      );
                      anthropicContent.push({
                        type: "document",
                        source: part.data instanceof URL ? {
                          type: "url",
                          url: part.data.toString()
                        } : {
                          type: "text",
                          media_type: "text/plain",
                          data: convertToString(part.data)
                        },
                        title: (_c = metadata.title) != null ? _c : part.filename,
                        ...metadata.context && { context: metadata.context },
                        ...enableCitations && {
                          citations: { enabled: true }
                        },
                        cache_control: cacheControl
                      });
                    } else {
                      throw new UnsupportedFunctionalityError({
                        functionality: `media type: ${part.mediaType}`
                      });
                    }
                    break;
                  }
                }
              }
              break;
            }
            case "tool": {
              for (let i2 = 0; i2 < content.length; i2++) {
                const part = content[i2];
                const isLastPart = i2 === content.length - 1;
                const cacheControl = (_d = validator.getCacheControl(part.providerOptions, {
                  type: "tool result part",
                  canCache: true
                })) != null ? _d : isLastPart ? validator.getCacheControl(message.providerOptions, {
                  type: "tool result message",
                  canCache: true
                }) : void 0;
                const output = part.output;
                let contentValue;
                switch (output.type) {
                  case "content":
                    contentValue = output.value.map((contentPart) => {
                      switch (contentPart.type) {
                        case "text":
                          return {
                            type: "text",
                            text: contentPart.text
                          };
                        case "media": {
                          if (contentPart.mediaType.startsWith("image/")) {
                            return {
                              type: "image",
                              source: {
                                type: "base64",
                                media_type: contentPart.mediaType,
                                data: contentPart.data
                              }
                            };
                          }
                          if (contentPart.mediaType === "application/pdf") {
                            betas.add("pdfs-2024-09-25");
                            return {
                              type: "document",
                              source: {
                                type: "base64",
                                media_type: contentPart.mediaType,
                                data: contentPart.data
                              }
                            };
                          }
                          throw new UnsupportedFunctionalityError({
                            functionality: `media type: ${contentPart.mediaType}`
                          });
                        }
                      }
                    });
                    break;
                  case "text":
                  case "error-text":
                    contentValue = output.value;
                    break;
                  case "json":
                  case "error-json":
                  default:
                    contentValue = JSON.stringify(output.value);
                    break;
                }
                anthropicContent.push({
                  type: "tool_result",
                  tool_use_id: part.toolCallId,
                  content: contentValue,
                  is_error: output.type === "error-text" || output.type === "error-json" ? true : void 0,
                  cache_control: cacheControl
                });
              }
              break;
            }
            default: {
              const _exhaustiveCheck = role;
              throw new Error(`Unsupported role: ${_exhaustiveCheck}`);
            }
          }
        }
        messages.push({ role: "user", content: anthropicContent });
        break;
      }
      case "assistant": {
        const anthropicContent = [];
        for (let j = 0; j < block.messages.length; j++) {
          const message = block.messages[j];
          const isLastMessage = j === block.messages.length - 1;
          const { content } = message;
          for (let k = 0; k < content.length; k++) {
            const part = content[k];
            const isLastContentPart = k === content.length - 1;
            const cacheControl = (_e = validator.getCacheControl(part.providerOptions, {
              type: "assistant message part",
              canCache: true
            })) != null ? _e : isLastContentPart ? validator.getCacheControl(message.providerOptions, {
              type: "assistant message",
              canCache: true
            }) : void 0;
            switch (part.type) {
              case "text": {
                anthropicContent.push({
                  type: "text",
                  text: (
                    // trim the last text part if it's the last message in the block
                    // because Anthropic does not allow trailing whitespace
                    // in pre-filled assistant responses
                    isLastBlock && isLastMessage && isLastContentPart ? part.text.trim() : part.text
                  ),
                  cache_control: cacheControl
                });
                break;
              }
              case "reasoning": {
                if (sendReasoning) {
                  const reasoningMetadata = await parseProviderOptions({
                    provider: "anthropic",
                    providerOptions: part.providerOptions,
                    schema: anthropicReasoningMetadataSchema
                  });
                  if (reasoningMetadata != null) {
                    if (reasoningMetadata.signature != null) {
                      validator.getCacheControl(part.providerOptions, {
                        type: "thinking block",
                        canCache: false
                      });
                      anthropicContent.push({
                        type: "thinking",
                        thinking: part.text,
                        signature: reasoningMetadata.signature
                      });
                    } else if (reasoningMetadata.redactedData != null) {
                      validator.getCacheControl(part.providerOptions, {
                        type: "redacted thinking block",
                        canCache: false
                      });
                      anthropicContent.push({
                        type: "redacted_thinking",
                        data: reasoningMetadata.redactedData
                      });
                    } else {
                      warnings.push({
                        type: "other",
                        message: "unsupported reasoning metadata"
                      });
                    }
                  } else {
                    warnings.push({
                      type: "other",
                      message: "unsupported reasoning metadata"
                    });
                  }
                } else {
                  warnings.push({
                    type: "other",
                    message: "sending reasoning content is disabled for this model"
                  });
                }
                break;
              }
              case "tool-call": {
                if (part.providerExecuted) {
                  if (part.toolName === "code_execution" && part.input != null && typeof part.input === "object" && "type" in part.input && typeof part.input.type === "string" && (part.input.type === "bash_code_execution" || part.input.type === "text_editor_code_execution")) {
                    anthropicContent.push({
                      type: "server_tool_use",
                      id: part.toolCallId,
                      name: part.input.type,
                      // map back to subtool name
                      input: part.input,
                      cache_control: cacheControl
                    });
                  } else if (part.toolName === "code_execution" || // code execution 20250522
                  part.toolName === "web_fetch" || part.toolName === "web_search") {
                    anthropicContent.push({
                      type: "server_tool_use",
                      id: part.toolCallId,
                      name: part.toolName,
                      input: part.input,
                      cache_control: cacheControl
                    });
                  } else {
                    warnings.push({
                      type: "other",
                      message: `provider executed tool call for tool ${part.toolName} is not supported`
                    });
                  }
                  break;
                }
                anthropicContent.push({
                  type: "tool_use",
                  id: part.toolCallId,
                  name: part.toolName,
                  input: part.input,
                  cache_control: cacheControl
                });
                break;
              }
              case "tool-result": {
                if (part.toolName === "code_execution") {
                  const output = part.output;
                  if (output.type !== "json") {
                    warnings.push({
                      type: "other",
                      message: `provider executed tool result output type ${output.type} for tool ${part.toolName} is not supported`
                    });
                    break;
                  }
                  if (output.value == null || typeof output.value !== "object" || !("type" in output.value) || typeof output.value.type !== "string") {
                    warnings.push({
                      type: "other",
                      message: `provider executed tool result output value is not a valid code execution result for tool ${part.toolName}`
                    });
                    break;
                  }
                  if (output.value.type === "code_execution_result") {
                    const codeExecutionOutput = await validateTypes$1({
                      value: output.value,
                      schema: codeExecution_20250522OutputSchema
                    });
                    anthropicContent.push({
                      type: "code_execution_tool_result",
                      tool_use_id: part.toolCallId,
                      content: {
                        type: codeExecutionOutput.type,
                        stdout: codeExecutionOutput.stdout,
                        stderr: codeExecutionOutput.stderr,
                        return_code: codeExecutionOutput.return_code
                      },
                      cache_control: cacheControl
                    });
                  } else {
                    const codeExecutionOutput = await validateTypes$1({
                      value: output.value,
                      schema: codeExecution_20250825OutputSchema
                    });
                    anthropicContent.push(
                      codeExecutionOutput.type === "bash_code_execution_result" || codeExecutionOutput.type === "bash_code_execution_tool_result_error" ? {
                        type: "bash_code_execution_tool_result",
                        tool_use_id: part.toolCallId,
                        cache_control: cacheControl,
                        content: codeExecutionOutput
                      } : {
                        type: "text_editor_code_execution_tool_result",
                        tool_use_id: part.toolCallId,
                        cache_control: cacheControl,
                        content: codeExecutionOutput
                      }
                    );
                  }
                  break;
                }
                if (part.toolName === "web_fetch") {
                  const output = part.output;
                  if (output.type !== "json") {
                    warnings.push({
                      type: "other",
                      message: `provider executed tool result output type ${output.type} for tool ${part.toolName} is not supported`
                    });
                    break;
                  }
                  const webFetchOutput = await validateTypes$1({
                    value: output.value,
                    schema: webFetch_20250910OutputSchema
                  });
                  anthropicContent.push({
                    type: "web_fetch_tool_result",
                    tool_use_id: part.toolCallId,
                    content: {
                      type: "web_fetch_result",
                      url: webFetchOutput.url,
                      retrieved_at: webFetchOutput.retrievedAt,
                      content: {
                        type: "document",
                        title: webFetchOutput.content.title,
                        citations: webFetchOutput.content.citations,
                        source: {
                          type: webFetchOutput.content.source.type,
                          media_type: webFetchOutput.content.source.mediaType,
                          data: webFetchOutput.content.source.data
                        }
                      }
                    },
                    cache_control: cacheControl
                  });
                  break;
                }
                if (part.toolName === "web_search") {
                  const output = part.output;
                  if (output.type !== "json") {
                    warnings.push({
                      type: "other",
                      message: `provider executed tool result output type ${output.type} for tool ${part.toolName} is not supported`
                    });
                    break;
                  }
                  const webSearchOutput = await validateTypes$1({
                    value: output.value,
                    schema: webSearch_20250305OutputSchema
                  });
                  anthropicContent.push({
                    type: "web_search_tool_result",
                    tool_use_id: part.toolCallId,
                    content: webSearchOutput.map((result) => ({
                      url: result.url,
                      title: result.title,
                      page_age: result.pageAge,
                      encrypted_content: result.encryptedContent,
                      type: result.type
                    })),
                    cache_control: cacheControl
                  });
                  break;
                }
                warnings.push({
                  type: "other",
                  message: `provider executed tool result for tool ${part.toolName} is not supported`
                });
                break;
              }
            }
          }
        }
        messages.push({ role: "assistant", content: anthropicContent });
        break;
      }
      default: {
        const _exhaustiveCheck = type;
        throw new Error(`content type: ${_exhaustiveCheck}`);
      }
    }
  }
  return {
    prompt: { system, messages },
    betas
  };
}
function groupIntoBlocks(prompt) {
  const blocks = [];
  let currentBlock = void 0;
  for (const message of prompt) {
    const { role } = message;
    switch (role) {
      case "system": {
        if ((currentBlock == null ? void 0 : currentBlock.type) !== "system") {
          currentBlock = { type: "system", messages: [] };
          blocks.push(currentBlock);
        }
        currentBlock.messages.push(message);
        break;
      }
      case "assistant": {
        if ((currentBlock == null ? void 0 : currentBlock.type) !== "assistant") {
          currentBlock = { type: "assistant", messages: [] };
          blocks.push(currentBlock);
        }
        currentBlock.messages.push(message);
        break;
      }
      case "user": {
        if ((currentBlock == null ? void 0 : currentBlock.type) !== "user") {
          currentBlock = { type: "user", messages: [] };
          blocks.push(currentBlock);
        }
        currentBlock.messages.push(message);
        break;
      }
      case "tool": {
        if ((currentBlock == null ? void 0 : currentBlock.type) !== "user") {
          currentBlock = { type: "user", messages: [] };
          blocks.push(currentBlock);
        }
        currentBlock.messages.push(message);
        break;
      }
      default: {
        const _exhaustiveCheck = role;
        throw new Error(`Unsupported role: ${_exhaustiveCheck}`);
      }
    }
  }
  return blocks;
}

// src/map-anthropic-stop-reason.ts
function mapAnthropicStopReason({
  finishReason,
  isJsonResponseFromTool
}) {
  switch (finishReason) {
    case "pause_turn":
    case "end_turn":
    case "stop_sequence":
      return "stop";
    case "refusal":
      return "content-filter";
    case "tool_use":
      return isJsonResponseFromTool ? "stop" : "tool-calls";
    case "max_tokens":
      return "length";
    default:
      return "unknown";
  }
}

// src/anthropic-messages-language-model.ts
function createCitationSource(citation, citationDocuments, generateId3) {
  var _a;
  if (citation.type !== "page_location" && citation.type !== "char_location") {
    return;
  }
  const documentInfo = citationDocuments[citation.document_index];
  if (!documentInfo) {
    return;
  }
  return {
    type: "source",
    sourceType: "document",
    id: generateId3(),
    mediaType: documentInfo.mediaType,
    title: (_a = citation.document_title) != null ? _a : documentInfo.title,
    filename: documentInfo.filename,
    providerMetadata: {
      anthropic: citation.type === "page_location" ? {
        citedText: citation.cited_text,
        startPageNumber: citation.start_page_number,
        endPageNumber: citation.end_page_number
      } : {
        citedText: citation.cited_text,
        startCharIndex: citation.start_char_index,
        endCharIndex: citation.end_char_index
      }
    }
  };
}
var AnthropicMessagesLanguageModel = class {
  constructor(modelId, config) {
    this.specificationVersion = "v2";
    var _a;
    this.modelId = modelId;
    this.config = config;
    this.generateId = (_a = config.generateId) != null ? _a : generateId$1;
  }
  supportsUrl(url) {
    return url.protocol === "https:";
  }
  get provider() {
    return this.config.provider;
  }
  get supportedUrls() {
    var _a, _b, _c;
    return (_c = (_b = (_a = this.config).supportedUrls) == null ? void 0 : _b.call(_a)) != null ? _c : {};
  }
  async getArgs({
    userSuppliedBetas,
    prompt,
    maxOutputTokens,
    temperature,
    topP,
    topK,
    frequencyPenalty,
    presencePenalty,
    stopSequences,
    responseFormat,
    seed,
    tools,
    toolChoice,
    providerOptions
  }) {
    var _a, _b, _c, _d, _e;
    const warnings = [];
    if (frequencyPenalty != null) {
      warnings.push({
        type: "unsupported-setting",
        setting: "frequencyPenalty"
      });
    }
    if (presencePenalty != null) {
      warnings.push({
        type: "unsupported-setting",
        setting: "presencePenalty"
      });
    }
    if (seed != null) {
      warnings.push({
        type: "unsupported-setting",
        setting: "seed"
      });
    }
    if (temperature != null && temperature > 1) {
      warnings.push({
        type: "unsupported-setting",
        setting: "temperature",
        details: `${temperature} exceeds anthropic maximum of 1.0. clamped to 1.0`
      });
      temperature = 1;
    } else if (temperature != null && temperature < 0) {
      warnings.push({
        type: "unsupported-setting",
        setting: "temperature",
        details: `${temperature} is below anthropic minimum of 0. clamped to 0`
      });
      temperature = 0;
    }
    if ((responseFormat == null ? void 0 : responseFormat.type) === "json") {
      if (responseFormat.schema == null) {
        warnings.push({
          type: "unsupported-setting",
          setting: "responseFormat",
          details: "JSON response format requires a schema. The response format is ignored."
        });
      } else if (tools != null) {
        warnings.push({
          type: "unsupported-setting",
          setting: "tools",
          details: "JSON response format does not support tools. The provided tools are ignored."
        });
      }
    }
    const anthropicOptions = await parseProviderOptions({
      provider: "anthropic",
      providerOptions,
      schema: anthropicProviderOptions
    });
    const {
      maxOutputTokens: maxOutputTokensForModel,
      supportsStructuredOutput,
      isKnownModel
    } = getModelCapabilities(this.modelId);
    const structureOutputMode = (_a = anthropicOptions == null ? void 0 : anthropicOptions.structuredOutputMode) != null ? _a : "jsonTool";
    const useStructuredOutput = structureOutputMode === "outputFormat" || structureOutputMode === "auto" && supportsStructuredOutput;
    const jsonResponseTool = (responseFormat == null ? void 0 : responseFormat.type) === "json" && responseFormat.schema != null && !useStructuredOutput ? {
      type: "function",
      name: "json",
      description: "Respond with a JSON object.",
      inputSchema: responseFormat.schema
    } : void 0;
    const cacheControlValidator = new CacheControlValidator();
    const { prompt: messagesPrompt, betas } = await convertToAnthropicMessagesPrompt({
      prompt,
      sendReasoning: (_b = anthropicOptions == null ? void 0 : anthropicOptions.sendReasoning) != null ? _b : true,
      warnings,
      cacheControlValidator
    });
    const isThinking = ((_c = anthropicOptions == null ? void 0 : anthropicOptions.thinking) == null ? void 0 : _c.type) === "enabled";
    const thinkingBudget = (_d = anthropicOptions == null ? void 0 : anthropicOptions.thinking) == null ? void 0 : _d.budgetTokens;
    const maxTokens = maxOutputTokens != null ? maxOutputTokens : maxOutputTokensForModel;
    const baseArgs = {
      // model id:
      model: this.modelId,
      // standardized settings:
      max_tokens: maxTokens,
      temperature,
      top_k: topK,
      top_p: topP,
      stop_sequences: stopSequences,
      // provider specific settings:
      ...isThinking && {
        thinking: { type: "enabled", budget_tokens: thinkingBudget }
      },
      ...(anthropicOptions == null ? void 0 : anthropicOptions.effort) && {
        output_config: { effort: anthropicOptions.effort }
      },
      // structured output:
      ...useStructuredOutput && (responseFormat == null ? void 0 : responseFormat.type) === "json" && responseFormat.schema != null && {
        output_format: {
          type: "json_schema",
          schema: responseFormat.schema
        }
      },
      // container with agent skills:
      ...(anthropicOptions == null ? void 0 : anthropicOptions.container) && {
        container: {
          id: anthropicOptions.container.id,
          skills: (_e = anthropicOptions.container.skills) == null ? void 0 : _e.map((skill) => ({
            type: skill.type,
            skill_id: skill.skillId,
            version: skill.version
          }))
        }
      },
      // prompt:
      system: messagesPrompt.system,
      messages: messagesPrompt.messages
    };
    if (isThinking) {
      if (thinkingBudget == null) {
        throw new UnsupportedFunctionalityError({
          functionality: "thinking requires a budget"
        });
      }
      if (baseArgs.temperature != null) {
        baseArgs.temperature = void 0;
        warnings.push({
          type: "unsupported-setting",
          setting: "temperature",
          details: "temperature is not supported when thinking is enabled"
        });
      }
      if (topK != null) {
        baseArgs.top_k = void 0;
        warnings.push({
          type: "unsupported-setting",
          setting: "topK",
          details: "topK is not supported when thinking is enabled"
        });
      }
      if (topP != null) {
        baseArgs.top_p = void 0;
        warnings.push({
          type: "unsupported-setting",
          setting: "topP",
          details: "topP is not supported when thinking is enabled"
        });
      }
      baseArgs.max_tokens = maxTokens + thinkingBudget;
    }
    if (isKnownModel && baseArgs.max_tokens > maxOutputTokensForModel) {
      if (maxOutputTokens != null) {
        warnings.push({
          type: "unsupported-setting",
          setting: "maxOutputTokens",
          details: `${baseArgs.max_tokens} (maxOutputTokens + thinkingBudget) is greater than ${this.modelId} ${maxOutputTokensForModel} max output tokens. The max output tokens have been limited to ${maxOutputTokensForModel}.`
        });
      }
      baseArgs.max_tokens = maxOutputTokensForModel;
    }
    if ((anthropicOptions == null ? void 0 : anthropicOptions.container) && anthropicOptions.container.skills && anthropicOptions.container.skills.length > 0) {
      betas.add("code-execution-2025-08-25");
      betas.add("skills-2025-10-02");
      betas.add("files-api-2025-04-14");
      if (!(tools == null ? void 0 : tools.some(
        (tool) => tool.type === "provider-defined" && tool.id === "anthropic.code_execution_20250825"
      ))) {
        warnings.push({
          type: "other",
          message: "code execution tool is required when using skills"
        });
      }
    }
    if (anthropicOptions == null ? void 0 : anthropicOptions.effort) {
      betas.add("effort-2025-11-24");
    }
    if (useStructuredOutput) {
      betas.add("structured-outputs-2025-11-13");
    }
    const {
      tools: anthropicTools2,
      toolChoice: anthropicToolChoice,
      toolWarnings,
      betas: toolsBetas
    } = await prepareTools(
      jsonResponseTool != null ? {
        tools: [jsonResponseTool],
        toolChoice: { type: "tool", toolName: jsonResponseTool.name },
        disableParallelToolUse: true,
        cacheControlValidator
      } : {
        tools: tools != null ? tools : [],
        toolChoice,
        disableParallelToolUse: anthropicOptions == null ? void 0 : anthropicOptions.disableParallelToolUse,
        cacheControlValidator
      }
    );
    const cacheWarnings = cacheControlValidator.getWarnings();
    return {
      args: {
        ...baseArgs,
        tools: anthropicTools2,
        tool_choice: anthropicToolChoice
      },
      warnings: [...warnings, ...toolWarnings, ...cacheWarnings],
      betas: /* @__PURE__ */ new Set([...betas, ...toolsBetas, ...userSuppliedBetas]),
      usesJsonResponseTool: jsonResponseTool != null
    };
  }
  async getHeaders({
    betas,
    headers
  }) {
    return combineHeaders$1(
      await resolve$1(this.config.headers),
      headers,
      betas.size > 0 ? { "anthropic-beta": Array.from(betas).join(",") } : {}
    );
  }
  async getBetasFromHeaders(requestHeaders) {
    var _a, _b;
    const configHeaders = await resolve$1(this.config.headers);
    const configBetaHeader = (_a = configHeaders["anthropic-beta"]) != null ? _a : "";
    const requestBetaHeader = (_b = requestHeaders == null ? void 0 : requestHeaders["anthropic-beta"]) != null ? _b : "";
    return new Set(
      [
        ...configBetaHeader.toLowerCase().split(","),
        ...requestBetaHeader.toLowerCase().split(",")
      ].map((beta) => beta.trim()).filter((beta) => beta !== "")
    );
  }
  buildRequestUrl(isStreaming) {
    var _a, _b, _c;
    return (_c = (_b = (_a = this.config).buildRequestUrl) == null ? void 0 : _b.call(_a, this.config.baseURL, isStreaming)) != null ? _c : `${this.config.baseURL}/messages`;
  }
  transformRequestBody(args) {
    var _a, _b, _c;
    return (_c = (_b = (_a = this.config).transformRequestBody) == null ? void 0 : _b.call(_a, args)) != null ? _c : args;
  }
  extractCitationDocuments(prompt) {
    const isCitationPart = (part) => {
      var _a, _b;
      if (part.type !== "file") {
        return false;
      }
      if (part.mediaType !== "application/pdf" && part.mediaType !== "text/plain") {
        return false;
      }
      const anthropic2 = (_a = part.providerOptions) == null ? void 0 : _a.anthropic;
      const citationsConfig = anthropic2 == null ? void 0 : anthropic2.citations;
      return (_b = citationsConfig == null ? void 0 : citationsConfig.enabled) != null ? _b : false;
    };
    return prompt.filter((message) => message.role === "user").flatMap((message) => message.content).filter(isCitationPart).map((part) => {
      var _a;
      const filePart = part;
      return {
        title: (_a = filePart.filename) != null ? _a : "Untitled Document",
        filename: filePart.filename,
        mediaType: filePart.mediaType
      };
    });
  }
  async doGenerate(options) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const { args, warnings, betas, usesJsonResponseTool } = await this.getArgs({
      ...options,
      userSuppliedBetas: await this.getBetasFromHeaders(options.headers)
    });
    const citationDocuments = this.extractCitationDocuments(options.prompt);
    const {
      responseHeaders,
      value: response,
      rawValue: rawResponse
    } = await postJsonToApi$1({
      url: this.buildRequestUrl(false),
      headers: await this.getHeaders({ betas, headers: options.headers }),
      body: this.transformRequestBody(args),
      failedResponseHandler: anthropicFailedResponseHandler,
      successfulResponseHandler: createJsonResponseHandler$1(
        anthropicMessagesResponseSchema
      ),
      abortSignal: options.abortSignal,
      fetch: this.config.fetch
    });
    const content = [];
    for (const part of response.content) {
      switch (part.type) {
        case "text": {
          if (!usesJsonResponseTool) {
            content.push({ type: "text", text: part.text });
            if (part.citations) {
              for (const citation of part.citations) {
                const source = createCitationSource(
                  citation,
                  citationDocuments,
                  this.generateId
                );
                if (source) {
                  content.push(source);
                }
              }
            }
          }
          break;
        }
        case "thinking": {
          content.push({
            type: "reasoning",
            text: part.thinking,
            providerMetadata: {
              anthropic: {
                signature: part.signature
              }
            }
          });
          break;
        }
        case "redacted_thinking": {
          content.push({
            type: "reasoning",
            text: "",
            providerMetadata: {
              anthropic: {
                redactedData: part.data
              }
            }
          });
          break;
        }
        case "tool_use": {
          content.push(
            // when a json response tool is used, the tool call becomes the text:
            usesJsonResponseTool ? {
              type: "text",
              text: JSON.stringify(part.input)
            } : {
              type: "tool-call",
              toolCallId: part.id,
              toolName: part.name,
              input: JSON.stringify(part.input)
            }
          );
          break;
        }
        case "server_tool_use": {
          if (part.name === "text_editor_code_execution" || part.name === "bash_code_execution") {
            content.push({
              type: "tool-call",
              toolCallId: part.id,
              toolName: "code_execution",
              input: JSON.stringify({ type: part.name, ...part.input }),
              providerExecuted: true
            });
          } else if (part.name === "web_search" || part.name === "code_execution" || part.name === "web_fetch") {
            content.push({
              type: "tool-call",
              toolCallId: part.id,
              toolName: part.name,
              input: JSON.stringify(part.input),
              providerExecuted: true
            });
          }
          break;
        }
        case "web_fetch_tool_result": {
          if (part.content.type === "web_fetch_result") {
            content.push({
              type: "tool-result",
              toolCallId: part.tool_use_id,
              toolName: "web_fetch",
              result: {
                type: "web_fetch_result",
                url: part.content.url,
                retrievedAt: part.content.retrieved_at,
                content: {
                  type: part.content.content.type,
                  title: part.content.content.title,
                  citations: part.content.content.citations,
                  source: {
                    type: part.content.content.source.type,
                    mediaType: part.content.content.source.media_type,
                    data: part.content.content.source.data
                  }
                }
              },
              providerExecuted: true
            });
          } else if (part.content.type === "web_fetch_tool_result_error") {
            content.push({
              type: "tool-result",
              toolCallId: part.tool_use_id,
              toolName: "web_fetch",
              isError: true,
              result: {
                type: "web_fetch_tool_result_error",
                errorCode: part.content.error_code
              },
              providerExecuted: true
            });
          }
          break;
        }
        case "web_search_tool_result": {
          if (Array.isArray(part.content)) {
            content.push({
              type: "tool-result",
              toolCallId: part.tool_use_id,
              toolName: "web_search",
              result: part.content.map((result) => {
                var _a2;
                return {
                  url: result.url,
                  title: result.title,
                  pageAge: (_a2 = result.page_age) != null ? _a2 : null,
                  encryptedContent: result.encrypted_content,
                  type: result.type
                };
              }),
              providerExecuted: true
            });
            for (const result of part.content) {
              content.push({
                type: "source",
                sourceType: "url",
                id: this.generateId(),
                url: result.url,
                title: result.title,
                providerMetadata: {
                  anthropic: {
                    pageAge: (_a = result.page_age) != null ? _a : null
                  }
                }
              });
            }
          } else {
            content.push({
              type: "tool-result",
              toolCallId: part.tool_use_id,
              toolName: "web_search",
              isError: true,
              result: {
                type: "web_search_tool_result_error",
                errorCode: part.content.error_code
              },
              providerExecuted: true
            });
          }
          break;
        }
        // code execution 20250522:
        case "code_execution_tool_result": {
          if (part.content.type === "code_execution_result") {
            content.push({
              type: "tool-result",
              toolCallId: part.tool_use_id,
              toolName: "code_execution",
              result: {
                type: part.content.type,
                stdout: part.content.stdout,
                stderr: part.content.stderr,
                return_code: part.content.return_code
              },
              providerExecuted: true
            });
          } else if (part.content.type === "code_execution_tool_result_error") {
            content.push({
              type: "tool-result",
              toolCallId: part.tool_use_id,
              toolName: "code_execution",
              isError: true,
              result: {
                type: "code_execution_tool_result_error",
                errorCode: part.content.error_code
              },
              providerExecuted: true
            });
          }
          break;
        }
        // code execution 20250825:
        case "bash_code_execution_tool_result":
        case "text_editor_code_execution_tool_result": {
          content.push({
            type: "tool-result",
            toolCallId: part.tool_use_id,
            toolName: "code_execution",
            result: part.content,
            providerExecuted: true
          });
          break;
        }
      }
    }
    return {
      content,
      finishReason: mapAnthropicStopReason({
        finishReason: response.stop_reason,
        isJsonResponseFromTool: usesJsonResponseTool
      }),
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
        cachedInputTokens: (_b = response.usage.cache_read_input_tokens) != null ? _b : void 0
      },
      request: { body: args },
      response: {
        id: (_c = response.id) != null ? _c : void 0,
        modelId: (_d = response.model) != null ? _d : void 0,
        headers: responseHeaders,
        body: rawResponse
      },
      warnings,
      providerMetadata: {
        anthropic: {
          usage: response.usage,
          cacheCreationInputTokens: (_e = response.usage.cache_creation_input_tokens) != null ? _e : null,
          stopSequence: (_f = response.stop_sequence) != null ? _f : null,
          container: response.container ? {
            expiresAt: response.container.expires_at,
            id: response.container.id,
            skills: (_h = (_g = response.container.skills) == null ? void 0 : _g.map((skill) => ({
              type: skill.type,
              skillId: skill.skill_id,
              version: skill.version
            }))) != null ? _h : null
          } : null
        }
      }
    };
  }
  async doStream(options) {
    const { args, warnings, betas, usesJsonResponseTool } = await this.getArgs({
      ...options,
      userSuppliedBetas: await this.getBetasFromHeaders(options.headers)
    });
    const citationDocuments = this.extractCitationDocuments(options.prompt);
    const body = { ...args, stream: true };
    const url = this.buildRequestUrl(true);
    const { responseHeaders, value: response } = await postJsonToApi$1({
      url,
      headers: await this.getHeaders({ betas, headers: options.headers }),
      body: this.transformRequestBody(body),
      failedResponseHandler: anthropicFailedResponseHandler,
      successfulResponseHandler: createEventSourceResponseHandler$1(
        anthropicMessagesChunkSchema
      ),
      abortSignal: options.abortSignal,
      fetch: this.config.fetch
    });
    let finishReason = "unknown";
    const usage = {
      inputTokens: void 0,
      outputTokens: void 0,
      totalTokens: void 0
    };
    const contentBlocks = {};
    let rawUsage = void 0;
    let cacheCreationInputTokens = null;
    let stopSequence = null;
    let container = null;
    let blockType = void 0;
    const generateId3 = this.generateId;
    let isFirstChunk = true;
    let stream = void 0;
    const returnPromise = new DelayedPromise$1();
    const transformedStream = response.pipeThrough(
      new TransformStream({
        start(controller) {
          controller.enqueue({ type: "stream-start", warnings });
        },
        async flush() {
          if (returnPromise.isPending()) {
            returnPromise.resolve({
              stream,
              request: { body },
              response: { headers: responseHeaders }
            });
          }
        },
        transform(chunk, controller) {
          var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
          if (options.includeRawChunks) {
            controller.enqueue({ type: "raw", rawValue: chunk.rawValue });
          }
          if (!chunk.success) {
            controller.enqueue({ type: "error", error: chunk.error });
            return;
          }
          if (isFirstChunk) {
            if (chunk.value.type === "error") {
              returnPromise.reject(
                new APICallError$1({
                  message: chunk.value.error.message,
                  url,
                  requestBodyValues: body,
                  statusCode: chunk.value.error.type === "overloaded_error" ? 529 : 500,
                  responseHeaders,
                  responseBody: JSON.stringify(chunk.value.error),
                  isRetryable: chunk.value.error.type === "overloaded_error"
                })
              );
              controller.terminate();
              return;
            }
            isFirstChunk = false;
            returnPromise.resolve({
              stream,
              request: { body },
              response: { headers: responseHeaders }
            });
          }
          const value = chunk.value;
          switch (value.type) {
            case "ping": {
              return;
            }
            case "content_block_start": {
              const contentBlockType = value.content_block.type;
              blockType = contentBlockType;
              switch (contentBlockType) {
                case "text": {
                  contentBlocks[value.index] = { type: "text" };
                  controller.enqueue({
                    type: "text-start",
                    id: String(value.index)
                  });
                  return;
                }
                case "thinking": {
                  contentBlocks[value.index] = { type: "reasoning" };
                  controller.enqueue({
                    type: "reasoning-start",
                    id: String(value.index)
                  });
                  return;
                }
                case "redacted_thinking": {
                  contentBlocks[value.index] = { type: "reasoning" };
                  controller.enqueue({
                    type: "reasoning-start",
                    id: String(value.index),
                    providerMetadata: {
                      anthropic: {
                        redactedData: value.content_block.data
                      }
                    }
                  });
                  return;
                }
                case "tool_use": {
                  contentBlocks[value.index] = usesJsonResponseTool ? { type: "text" } : {
                    type: "tool-call",
                    toolCallId: value.content_block.id,
                    toolName: value.content_block.name,
                    input: "",
                    firstDelta: true
                  };
                  controller.enqueue(
                    usesJsonResponseTool ? { type: "text-start", id: String(value.index) } : {
                      type: "tool-input-start",
                      id: value.content_block.id,
                      toolName: value.content_block.name
                    }
                  );
                  return;
                }
                case "server_tool_use": {
                  if ([
                    "web_fetch",
                    "web_search",
                    // code execution 20250825:
                    "code_execution",
                    // code execution 20250825 text editor:
                    "text_editor_code_execution",
                    // code execution 20250825 bash:
                    "bash_code_execution"
                  ].includes(value.content_block.name)) {
                    contentBlocks[value.index] = {
                      type: "tool-call",
                      toolCallId: value.content_block.id,
                      toolName: value.content_block.name,
                      input: "",
                      providerExecuted: true,
                      firstDelta: true
                    };
                    const mappedToolName = value.content_block.name === "text_editor_code_execution" || value.content_block.name === "bash_code_execution" ? "code_execution" : value.content_block.name;
                    controller.enqueue({
                      type: "tool-input-start",
                      id: value.content_block.id,
                      toolName: mappedToolName,
                      providerExecuted: true
                    });
                  }
                  return;
                }
                case "web_fetch_tool_result": {
                  const part = value.content_block;
                  if (part.content.type === "web_fetch_result") {
                    controller.enqueue({
                      type: "tool-result",
                      toolCallId: part.tool_use_id,
                      toolName: "web_fetch",
                      result: {
                        type: "web_fetch_result",
                        url: part.content.url,
                        retrievedAt: part.content.retrieved_at,
                        content: {
                          type: part.content.content.type,
                          title: part.content.content.title,
                          citations: part.content.content.citations,
                          source: {
                            type: part.content.content.source.type,
                            mediaType: part.content.content.source.media_type,
                            data: part.content.content.source.data
                          }
                        }
                      },
                      providerExecuted: true
                    });
                  } else if (part.content.type === "web_fetch_tool_result_error") {
                    controller.enqueue({
                      type: "tool-result",
                      toolCallId: part.tool_use_id,
                      toolName: "web_fetch",
                      isError: true,
                      result: {
                        type: "web_fetch_tool_result_error",
                        errorCode: part.content.error_code
                      },
                      providerExecuted: true
                    });
                  }
                  return;
                }
                case "web_search_tool_result": {
                  const part = value.content_block;
                  if (Array.isArray(part.content)) {
                    controller.enqueue({
                      type: "tool-result",
                      toolCallId: part.tool_use_id,
                      toolName: "web_search",
                      result: part.content.map((result) => {
                        var _a2;
                        return {
                          url: result.url,
                          title: result.title,
                          pageAge: (_a2 = result.page_age) != null ? _a2 : null,
                          encryptedContent: result.encrypted_content,
                          type: result.type
                        };
                      }),
                      providerExecuted: true
                    });
                    for (const result of part.content) {
                      controller.enqueue({
                        type: "source",
                        sourceType: "url",
                        id: generateId3(),
                        url: result.url,
                        title: result.title,
                        providerMetadata: {
                          anthropic: {
                            pageAge: (_a = result.page_age) != null ? _a : null
                          }
                        }
                      });
                    }
                  } else {
                    controller.enqueue({
                      type: "tool-result",
                      toolCallId: part.tool_use_id,
                      toolName: "web_search",
                      isError: true,
                      result: {
                        type: "web_search_tool_result_error",
                        errorCode: part.content.error_code
                      },
                      providerExecuted: true
                    });
                  }
                  return;
                }
                // code execution 20250522:
                case "code_execution_tool_result": {
                  const part = value.content_block;
                  if (part.content.type === "code_execution_result") {
                    controller.enqueue({
                      type: "tool-result",
                      toolCallId: part.tool_use_id,
                      toolName: "code_execution",
                      result: {
                        type: part.content.type,
                        stdout: part.content.stdout,
                        stderr: part.content.stderr,
                        return_code: part.content.return_code
                      },
                      providerExecuted: true
                    });
                  } else if (part.content.type === "code_execution_tool_result_error") {
                    controller.enqueue({
                      type: "tool-result",
                      toolCallId: part.tool_use_id,
                      toolName: "code_execution",
                      isError: true,
                      result: {
                        type: "code_execution_tool_result_error",
                        errorCode: part.content.error_code
                      },
                      providerExecuted: true
                    });
                  }
                  return;
                }
                // code execution 20250825:
                case "bash_code_execution_tool_result":
                case "text_editor_code_execution_tool_result": {
                  const part = value.content_block;
                  controller.enqueue({
                    type: "tool-result",
                    toolCallId: part.tool_use_id,
                    toolName: "code_execution",
                    result: part.content,
                    providerExecuted: true
                  });
                  return;
                }
                default: {
                  const _exhaustiveCheck = contentBlockType;
                  throw new Error(
                    `Unsupported content block type: ${_exhaustiveCheck}`
                  );
                }
              }
            }
            case "content_block_stop": {
              if (contentBlocks[value.index] != null) {
                const contentBlock = contentBlocks[value.index];
                switch (contentBlock.type) {
                  case "text": {
                    controller.enqueue({
                      type: "text-end",
                      id: String(value.index)
                    });
                    break;
                  }
                  case "reasoning": {
                    controller.enqueue({
                      type: "reasoning-end",
                      id: String(value.index)
                    });
                    break;
                  }
                  case "tool-call":
                    if (!usesJsonResponseTool) {
                      controller.enqueue({
                        type: "tool-input-end",
                        id: contentBlock.toolCallId
                      });
                      const toolName = contentBlock.toolName === "text_editor_code_execution" || contentBlock.toolName === "bash_code_execution" ? "code_execution" : contentBlock.toolName;
                      controller.enqueue({
                        type: "tool-call",
                        toolCallId: contentBlock.toolCallId,
                        toolName,
                        input: contentBlock.input,
                        providerExecuted: contentBlock.providerExecuted
                      });
                    }
                    break;
                }
                delete contentBlocks[value.index];
              }
              blockType = void 0;
              return;
            }
            case "content_block_delta": {
              const deltaType = value.delta.type;
              switch (deltaType) {
                case "text_delta": {
                  if (usesJsonResponseTool) {
                    return;
                  }
                  controller.enqueue({
                    type: "text-delta",
                    id: String(value.index),
                    delta: value.delta.text
                  });
                  return;
                }
                case "thinking_delta": {
                  controller.enqueue({
                    type: "reasoning-delta",
                    id: String(value.index),
                    delta: value.delta.thinking
                  });
                  return;
                }
                case "signature_delta": {
                  if (blockType === "thinking") {
                    controller.enqueue({
                      type: "reasoning-delta",
                      id: String(value.index),
                      delta: "",
                      providerMetadata: {
                        anthropic: {
                          signature: value.delta.signature
                        }
                      }
                    });
                  }
                  return;
                }
                case "input_json_delta": {
                  const contentBlock = contentBlocks[value.index];
                  let delta = value.delta.partial_json;
                  if (delta.length === 0) {
                    return;
                  }
                  if (usesJsonResponseTool) {
                    if ((contentBlock == null ? void 0 : contentBlock.type) !== "text") {
                      return;
                    }
                    controller.enqueue({
                      type: "text-delta",
                      id: String(value.index),
                      delta
                    });
                  } else {
                    if ((contentBlock == null ? void 0 : contentBlock.type) !== "tool-call") {
                      return;
                    }
                    if (contentBlock.firstDelta && (contentBlock.toolName === "bash_code_execution" || contentBlock.toolName === "text_editor_code_execution")) {
                      delta = `{"type": "${contentBlock.toolName}",${delta.substring(1)}`;
                    }
                    controller.enqueue({
                      type: "tool-input-delta",
                      id: contentBlock.toolCallId,
                      delta
                    });
                    contentBlock.input += delta;
                    contentBlock.firstDelta = false;
                  }
                  return;
                }
                case "citations_delta": {
                  const citation = value.delta.citation;
                  const source = createCitationSource(
                    citation,
                    citationDocuments,
                    generateId3
                  );
                  if (source) {
                    controller.enqueue(source);
                  }
                  return;
                }
                default: {
                  const _exhaustiveCheck = deltaType;
                  throw new Error(
                    `Unsupported delta type: ${_exhaustiveCheck}`
                  );
                }
              }
            }
            case "message_start": {
              usage.inputTokens = value.message.usage.input_tokens;
              usage.cachedInputTokens = (_b = value.message.usage.cache_read_input_tokens) != null ? _b : void 0;
              rawUsage = {
                ...value.message.usage
              };
              cacheCreationInputTokens = (_c = value.message.usage.cache_creation_input_tokens) != null ? _c : null;
              controller.enqueue({
                type: "response-metadata",
                id: (_d = value.message.id) != null ? _d : void 0,
                modelId: (_e = value.message.model) != null ? _e : void 0
              });
              return;
            }
            case "message_delta": {
              usage.outputTokens = value.usage.output_tokens;
              usage.totalTokens = ((_f = usage.inputTokens) != null ? _f : 0) + ((_g = value.usage.output_tokens) != null ? _g : 0);
              finishReason = mapAnthropicStopReason({
                finishReason: value.delta.stop_reason,
                isJsonResponseFromTool: usesJsonResponseTool
              });
              stopSequence = (_h = value.delta.stop_sequence) != null ? _h : null;
              container = value.delta.container != null ? {
                expiresAt: value.delta.container.expires_at,
                id: value.delta.container.id,
                skills: (_j = (_i = value.delta.container.skills) == null ? void 0 : _i.map((skill) => ({
                  type: skill.type,
                  skillId: skill.skill_id,
                  version: skill.version
                }))) != null ? _j : null
              } : null;
              rawUsage = {
                ...rawUsage,
                ...value.usage
              };
              return;
            }
            case "message_stop": {
              controller.enqueue({
                type: "finish",
                finishReason,
                usage,
                providerMetadata: {
                  anthropic: {
                    usage: rawUsage != null ? rawUsage : null,
                    cacheCreationInputTokens,
                    stopSequence,
                    container
                  }
                }
              });
              return;
            }
            case "error": {
              controller.enqueue({ type: "error", error: value.error });
              return;
            }
            default: {
              const _exhaustiveCheck = value;
              throw new Error(`Unsupported chunk type: ${_exhaustiveCheck}`);
            }
          }
        }
      })
    );
    const [streamForFirstChunk, streamForConsumer] = transformedStream.tee();
    stream = streamForConsumer;
    const reader = streamForFirstChunk.getReader();
    (async () => {
      try {
        const { done } = await reader.read();
        if (!done) {
          await reader.cancel();
        }
      } catch (error) {
        try {
          await reader.cancel();
        } catch (e) {
        }
      } finally {
        reader.releaseLock();
      }
    })();
    return returnPromise.promise;
  }
};
function getModelCapabilities(modelId) {
  if (modelId.includes("claude-sonnet-4-5") || modelId.includes("claude-opus-4-5")) {
    return {
      maxOutputTokens: 64e3,
      supportsStructuredOutput: true,
      isKnownModel: true
    };
  } else if (modelId.includes("claude-opus-4-1")) {
    return {
      maxOutputTokens: 32e3,
      supportsStructuredOutput: true,
      isKnownModel: true
    };
  } else if (modelId.includes("claude-sonnet-4-") || modelId.includes("claude-3-7-sonnet") || modelId.includes("claude-haiku-4-5")) {
    return {
      maxOutputTokens: 64e3,
      supportsStructuredOutput: false,
      isKnownModel: true
    };
  } else if (modelId.includes("claude-opus-4-")) {
    return {
      maxOutputTokens: 32e3,
      supportsStructuredOutput: false,
      isKnownModel: true
    };
  } else if (modelId.includes("claude-3-5-haiku")) {
    return {
      maxOutputTokens: 8192,
      supportsStructuredOutput: false,
      isKnownModel: true
    };
  } else if (modelId.includes("claude-3-haiku")) {
    return {
      maxOutputTokens: 4096,
      supportsStructuredOutput: false,
      isKnownModel: true
    };
  } else {
    return {
      maxOutputTokens: 4096,
      supportsStructuredOutput: false,
      isKnownModel: false
    };
  }
}
var bash_20241022InputSchema = lazySchema(
  () => zodSchema$1(
    object$1({
      command: string(),
      restart: boolean().optional()
    })
  )
);
var bash_20241022 = createProviderDefinedToolFactory({
  id: "anthropic.bash_20241022",
  name: "bash",
  inputSchema: bash_20241022InputSchema
});
var bash_20250124InputSchema = lazySchema(
  () => zodSchema$1(
    object$1({
      command: string(),
      restart: boolean().optional()
    })
  )
);
var bash_20250124 = createProviderDefinedToolFactory({
  id: "anthropic.bash_20250124",
  name: "bash",
  inputSchema: bash_20250124InputSchema
});
var computer_20241022InputSchema = lazySchema(
  () => zodSchema$1(
    object$1({
      action: _enum([
        "key",
        "type",
        "mouse_move",
        "left_click",
        "left_click_drag",
        "right_click",
        "middle_click",
        "double_click",
        "screenshot",
        "cursor_position"
      ]),
      coordinate: array(number().int()).optional(),
      text: string().optional()
    })
  )
);
var computer_20241022 = createProviderDefinedToolFactory({
  id: "anthropic.computer_20241022",
  name: "computer",
  inputSchema: computer_20241022InputSchema
});
var computer_20250124InputSchema = lazySchema(
  () => zodSchema$1(
    object$1({
      action: _enum([
        "key",
        "hold_key",
        "type",
        "cursor_position",
        "mouse_move",
        "left_mouse_down",
        "left_mouse_up",
        "left_click",
        "left_click_drag",
        "right_click",
        "middle_click",
        "double_click",
        "triple_click",
        "scroll",
        "wait",
        "screenshot"
      ]),
      coordinate: tuple([number().int(), number().int()]).optional(),
      duration: number().optional(),
      scroll_amount: number().optional(),
      scroll_direction: _enum(["up", "down", "left", "right"]).optional(),
      start_coordinate: tuple([number().int(), number().int()]).optional(),
      text: string().optional()
    })
  )
);
var computer_20250124 = createProviderDefinedToolFactory({
  id: "anthropic.computer_20250124",
  name: "computer",
  inputSchema: computer_20250124InputSchema
});
var memory_20250818InputSchema = lazySchema(
  () => zodSchema$1(
    discriminatedUnion("command", [
      object$1({
        command: literal("view"),
        path: string(),
        view_range: tuple([number(), number()]).optional()
      }),
      object$1({
        command: literal("create"),
        path: string(),
        file_text: string()
      }),
      object$1({
        command: literal("str_replace"),
        path: string(),
        old_str: string(),
        new_str: string()
      }),
      object$1({
        command: literal("insert"),
        path: string(),
        insert_line: number(),
        insert_text: string()
      }),
      object$1({
        command: literal("delete"),
        path: string()
      }),
      object$1({
        command: literal("rename"),
        old_path: string(),
        new_path: string()
      })
    ])
  )
);
var memory_20250818 = createProviderDefinedToolFactory({
  id: "anthropic.memory_20250818",
  name: "memory",
  inputSchema: memory_20250818InputSchema
});
var textEditor_20241022InputSchema = lazySchema(
  () => zodSchema$1(
    object$1({
      command: _enum(["view", "create", "str_replace", "insert", "undo_edit"]),
      path: string(),
      file_text: string().optional(),
      insert_line: number().int().optional(),
      new_str: string().optional(),
      old_str: string().optional(),
      view_range: array(number().int()).optional()
    })
  )
);
var textEditor_20241022 = createProviderDefinedToolFactory({
  id: "anthropic.text_editor_20241022",
  name: "str_replace_editor",
  inputSchema: textEditor_20241022InputSchema
});
var textEditor_20250124InputSchema = lazySchema(
  () => zodSchema$1(
    object$1({
      command: _enum(["view", "create", "str_replace", "insert", "undo_edit"]),
      path: string(),
      file_text: string().optional(),
      insert_line: number().int().optional(),
      new_str: string().optional(),
      old_str: string().optional(),
      view_range: array(number().int()).optional()
    })
  )
);
var textEditor_20250124 = createProviderDefinedToolFactory({
  id: "anthropic.text_editor_20250124",
  name: "str_replace_editor",
  inputSchema: textEditor_20250124InputSchema
});
var textEditor_20250429InputSchema = lazySchema(
  () => zodSchema$1(
    object$1({
      command: _enum(["view", "create", "str_replace", "insert"]),
      path: string(),
      file_text: string().optional(),
      insert_line: number().int().optional(),
      new_str: string().optional(),
      old_str: string().optional(),
      view_range: array(number().int()).optional()
    })
  )
);
var textEditor_20250429 = createProviderDefinedToolFactory({
  id: "anthropic.text_editor_20250429",
  name: "str_replace_based_edit_tool",
  inputSchema: textEditor_20250429InputSchema
});

// src/anthropic-tools.ts
var anthropicTools = {
  /**
   * The bash tool enables Claude to execute shell commands in a persistent bash session,
   * allowing system operations, script execution, and command-line automation.
   *
   * Image results are supported.
   *
   * Tool name must be `bash`.
   */
  bash_20241022,
  /**
   * The bash tool enables Claude to execute shell commands in a persistent bash session,
   * allowing system operations, script execution, and command-line automation.
   *
   * Image results are supported.
   *
   * Tool name must be `bash`.
   */
  bash_20250124,
  /**
   * Claude can analyze data, create visualizations, perform complex calculations,
   * run system commands, create and edit files, and process uploaded files directly within
   * the API conversation.
   *
   * The code execution tool allows Claude to run Bash commands and manipulate files,
   * including writing code, in a secure, sandboxed environment.
   *
   * Tool name must be `code_execution`.
   */
  codeExecution_20250522,
  /**
   * Claude can analyze data, create visualizations, perform complex calculations,
   * run system commands, create and edit files, and process uploaded files directly within
   * the API conversation.
   *
   * The code execution tool allows Claude to run both Python and Bash commands and manipulate files,
   * including writing code, in a secure, sandboxed environment.
   *
   * This is the latest version with enhanced Bash support and file operations.
   *
   * Tool name must be `code_execution`.
   */
  codeExecution_20250825,
  /**
   * Claude can interact with computer environments through the computer use tool, which
   * provides screenshot capabilities and mouse/keyboard control for autonomous desktop interaction.
   *
   * Image results are supported.
   *
   * Tool name must be `computer`.
   *
   * @param displayWidthPx - The width of the display being controlled by the model in pixels.
   * @param displayHeightPx - The height of the display being controlled by the model in pixels.
   * @param displayNumber - The display number to control (only relevant for X11 environments). If specified, the tool will be provided a display number in the tool definition.
   */
  computer_20241022,
  /**
   * Claude can interact with computer environments through the computer use tool, which
   * provides screenshot capabilities and mouse/keyboard control for autonomous desktop interaction.
   *
   * Image results are supported.
   *
   * Tool name must be `computer`.
   *
   * @param displayWidthPx - The width of the display being controlled by the model in pixels.
   * @param displayHeightPx - The height of the display being controlled by the model in pixels.
   * @param displayNumber - The display number to control (only relevant for X11 environments). If specified, the tool will be provided a display number in the tool definition.
   */
  computer_20250124,
  /**
   * The memory tool enables Claude to store and retrieve information across conversations through a memory file directory.
   * Claude can create, read, update, and delete files that persist between sessions,
   * allowing it to build knowledge over time without keeping everything in the context window.
   * The memory tool operates client-side—you control where and how the data is stored through your own infrastructure.
   *
   * Supported models: Claude Sonnet 4.5, Claude Sonnet 4, Claude Opus 4.1, Claude Opus 4.
   *
   * Tool name must be `memory`.
   */
  memory_20250818,
  /**
   * Claude can use an Anthropic-defined text editor tool to view and modify text files,
   * helping you debug, fix, and improve your code or other text documents. This allows Claude
   * to directly interact with your files, providing hands-on assistance rather than just suggesting changes.
   *
   * Supported models: Claude Sonnet 3.5
   *
   * Tool name must be `str_replace_editor`.
   */
  textEditor_20241022,
  /**
   * Claude can use an Anthropic-defined text editor tool to view and modify text files,
   * helping you debug, fix, and improve your code or other text documents. This allows Claude
   * to directly interact with your files, providing hands-on assistance rather than just suggesting changes.
   *
   * Supported models: Claude Sonnet 3.7
   *
   * Tool name must be `str_replace_editor`.
   */
  textEditor_20250124,
  /**
   * Claude can use an Anthropic-defined text editor tool to view and modify text files,
   * helping you debug, fix, and improve your code or other text documents. This allows Claude
   * to directly interact with your files, providing hands-on assistance rather than just suggesting changes.
   *
   * Note: This version does not support the "undo_edit" command.
   *
   * Tool name must be `str_replace_based_edit_tool`.
   *
   * @deprecated Use textEditor_20250728 instead
   */
  textEditor_20250429,
  /**
   * Claude can use an Anthropic-defined text editor tool to view and modify text files,
   * helping you debug, fix, and improve your code or other text documents. This allows Claude
   * to directly interact with your files, providing hands-on assistance rather than just suggesting changes.
   *
   * Note: This version does not support the "undo_edit" command and adds optional max_characters parameter.
   *
   * Supported models: Claude Sonnet 4, Opus 4, and Opus 4.1
   *
   * Tool name must be `str_replace_based_edit_tool`.
   *
   * @param maxCharacters - Optional maximum number of characters to view in the file
   */
  textEditor_20250728,
  /**
   * Creates a web fetch tool that gives Claude direct access to real-time web content.
   *
   * Tool name must be `web_fetch`.
   *
   * @param maxUses - The max_uses parameter limits the number of web fetches performed
   * @param allowedDomains - Only fetch from these domains
   * @param blockedDomains - Never fetch from these domains
   * @param citations - Unlike web search where citations are always enabled, citations are optional for web fetch. Set "citations": {"enabled": true} to enable Claude to cite specific passages from fetched documents.
   * @param maxContentTokens - The max_content_tokens parameter limits the amount of content that will be included in the context.
   */
  webFetch_20250910,
  /**
   * Creates a web search tool that gives Claude direct access to real-time web content.
   *
   * Tool name must be `web_search`.
   *
   * @param maxUses - Maximum number of web searches Claude can perform during the conversation.
   * @param allowedDomains - Optional list of domains that Claude is allowed to search.
   * @param blockedDomains - Optional list of domains that Claude should avoid when searching.
   * @param userLocation - Optional user location information to provide geographically relevant search results.
   */
  webSearch_20250305
};

// src/anthropic-provider.ts
function createAnthropic(options = {}) {
  var _a, _b;
  const baseURL = (_a = withoutTrailingSlash$1(
    loadOptionalSetting$1({
      settingValue: options.baseURL,
      environmentVariableName: "ANTHROPIC_BASE_URL"
    })
  )) != null ? _a : "https://api.anthropic.com/v1";
  const providerName = (_b = options.name) != null ? _b : "anthropic.messages";
  const getHeaders = () => withUserAgentSuffix$1(
    {
      "anthropic-version": "2023-06-01",
      "x-api-key": loadApiKey({
        apiKey: options.apiKey,
        environmentVariableName: "ANTHROPIC_API_KEY",
        description: "Anthropic"
      }),
      ...options.headers
    },
    `ai-sdk/anthropic/${VERSION$3}`
  );
  const createChatModel = (modelId) => {
    var _a2;
    return new AnthropicMessagesLanguageModel(modelId, {
      provider: providerName,
      baseURL,
      headers: getHeaders,
      fetch: options.fetch,
      generateId: (_a2 = options.generateId) != null ? _a2 : generateId$1,
      supportedUrls: () => ({
        "image/*": [/^https?:\/\/.*$/]
      })
    });
  };
  const provider = function(modelId) {
    if (new.target) {
      throw new Error(
        "The Anthropic model function cannot be called with the new keyword."
      );
    }
    return createChatModel(modelId);
  };
  provider.languageModel = createChatModel;
  provider.chat = createChatModel;
  provider.messages = createChatModel;
  provider.textEmbeddingModel = (modelId) => {
    throw new NoSuchModelError({ modelId, modelType: "textEmbeddingModel" });
  };
  provider.imageModel = (modelId) => {
    throw new NoSuchModelError({ modelId, modelType: "imageModel" });
  };
  provider.tools = anthropicTools;
  return provider;
}
createAnthropic();

// src/errors/ai-sdk-error.ts
var marker$2 = "vercel.ai.error";
var symbol$2 = Symbol.for(marker$2);
var _a$2;
var _AISDKError = class _AISDKError extends Error {
  /**
   * Creates an AI SDK Error.
   *
   * @param {Object} params - The parameters for creating the error.
   * @param {string} params.name - The name of the error.
   * @param {string} params.message - The error message.
   * @param {unknown} [params.cause] - The underlying cause of the error.
   */
  constructor({
    name: name14,
    message,
    cause
  }) {
    super(message);
    this[_a$2] = true;
    this.name = name14;
    this.cause = cause;
  }
  /**
   * Checks if the given error is an AI SDK Error.
   * @param {unknown} error - The error to check.
   * @returns {boolean} True if the error is an AI SDK Error, false otherwise.
   */
  static isInstance(error) {
    return _AISDKError.hasMarker(error, marker$2);
  }
  static hasMarker(error, marker15) {
    const markerSymbol = Symbol.for(marker15);
    return error != null && typeof error === "object" && markerSymbol in error && typeof error[markerSymbol] === "boolean" && error[markerSymbol] === true;
  }
};
_a$2 = symbol$2;
var AISDKError = _AISDKError;

// src/errors/api-call-error.ts
var name$2 = "AI_APICallError";
var marker2$2 = `vercel.ai.error.${name$2}`;
var symbol2$2 = Symbol.for(marker2$2);
var _a2$2;
var APICallError = class extends AISDKError {
  constructor({
    message,
    url,
    requestBodyValues,
    statusCode,
    responseHeaders,
    responseBody,
    cause,
    isRetryable = statusCode != null && (statusCode === 408 || // request timeout
    statusCode === 409 || // conflict
    statusCode === 429 || // too many requests
    statusCode >= 500),
    // server error
    data
  }) {
    super({ name: name$2, message, cause });
    this[_a2$2] = true;
    this.url = url;
    this.requestBodyValues = requestBodyValues;
    this.statusCode = statusCode;
    this.responseHeaders = responseHeaders;
    this.responseBody = responseBody;
    this.isRetryable = isRetryable;
    this.data = data;
  }
  static isInstance(error) {
    return AISDKError.hasMarker(error, marker2$2);
  }
};
_a2$2 = symbol2$2;

// src/errors/empty-response-body-error.ts
var name2$2 = "AI_EmptyResponseBodyError";
var marker3$1 = `vercel.ai.error.${name2$2}`;
var symbol3$1 = Symbol.for(marker3$1);
var _a3$1;
var EmptyResponseBodyError = class extends AISDKError {
  // used in isInstance
  constructor({ message = "Empty response body" } = {}) {
    super({ name: name2$2, message });
    this[_a3$1] = true;
  }
  static isInstance(error) {
    return AISDKError.hasMarker(error, marker3$1);
  }
};
_a3$1 = symbol3$1;

// src/errors/get-error-message.ts
function getErrorMessage$1(error) {
  if (error == null) {
    return "unknown error";
  }
  if (typeof error === "string") {
    return error;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return JSON.stringify(error);
}

// src/errors/invalid-argument-error.ts
var name3$1 = "AI_InvalidArgumentError";
var marker4$2 = `vercel.ai.error.${name3$1}`;
var symbol4$2 = Symbol.for(marker4$2);
var _a4$2;
var InvalidArgumentError$1 = class InvalidArgumentError extends AISDKError {
  constructor({
    message,
    cause,
    argument
  }) {
    super({ name: name3$1, message, cause });
    this[_a4$2] = true;
    this.argument = argument;
  }
  static isInstance(error) {
    return AISDKError.hasMarker(error, marker4$2);
  }
};
_a4$2 = symbol4$2;

// src/errors/invalid-prompt-error.ts
var name4$2 = "AI_InvalidPromptError";
var marker5$1 = `vercel.ai.error.${name4$2}`;
var symbol5$1 = Symbol.for(marker5$1);
var _a5$1;
var InvalidPromptError = class extends AISDKError {
  constructor({
    prompt,
    message,
    cause
  }) {
    super({ name: name4$2, message: `Invalid prompt: ${message}`, cause });
    this[_a5$1] = true;
    this.prompt = prompt;
  }
  static isInstance(error) {
    return AISDKError.hasMarker(error, marker5$1);
  }
};
_a5$1 = symbol5$1;

// src/errors/json-parse-error.ts
var name6$2 = "AI_JSONParseError";
var marker7$2 = `vercel.ai.error.${name6$2}`;
var symbol7$2 = Symbol.for(marker7$2);
var _a7$2;
var JSONParseError = class extends AISDKError {
  constructor({ text, cause }) {
    super({
      name: name6$2,
      message: `JSON parsing failed: Text: ${text}.
Error message: ${getErrorMessage$1(cause)}`,
      cause
    });
    this[_a7$2] = true;
    this.text = text;
  }
  static isInstance(error) {
    return AISDKError.hasMarker(error, marker7$2);
  }
};
_a7$2 = symbol7$2;

// src/errors/type-validation-error.ts
var name12 = "AI_TypeValidationError";
var marker13$1 = `vercel.ai.error.${name12}`;
var symbol13$1 = Symbol.for(marker13$1);
var _a13$1;
var _TypeValidationError = class _TypeValidationError extends AISDKError {
  constructor({ value, cause }) {
    super({
      name: name12,
      message: `Type validation failed: Value: ${JSON.stringify(value)}.
Error message: ${getErrorMessage$1(cause)}`,
      cause
    });
    this[_a13$1] = true;
    this.value = value;
  }
  static isInstance(error) {
    return AISDKError.hasMarker(error, marker13$1);
  }
  /**
   * Wraps an error into a TypeValidationError.
   * If the cause is already a TypeValidationError with the same value, it returns the cause.
   * Otherwise, it creates a new TypeValidationError.
   *
   * @param {Object} params - The parameters for wrapping the error.
   * @param {unknown} params.value - The value that failed validation.
   * @param {unknown} params.cause - The original error or cause of the validation failure.
   * @returns {TypeValidationError} A TypeValidationError instance.
   */
  static wrap({
    value,
    cause
  }) {
    return _TypeValidationError.isInstance(cause) && cause.value === value ? cause : new _TypeValidationError({ value, cause });
  }
};
_a13$1 = symbol13$1;
var TypeValidationError = _TypeValidationError;

// src/combine-headers.ts
function combineHeaders(...headers) {
  return headers.reduce(
    (combinedHeaders, currentHeaders) => ({
      ...combinedHeaders,
      ...currentHeaders != null ? currentHeaders : {}
    }),
    {}
  );
}

// src/delay.ts
async function delay(delayInMs, options) {
  if (delayInMs == null) {
    return Promise.resolve();
  }
  const signal = options == null ? void 0 : options.abortSignal;
  return new Promise((resolve2, reject) => {
    if (signal == null ? void 0 : signal.aborted) {
      reject(createAbortError());
      return;
    }
    const timeoutId = setTimeout(() => {
      cleanup();
      resolve2();
    }, delayInMs);
    const cleanup = () => {
      clearTimeout(timeoutId);
      signal == null ? void 0 : signal.removeEventListener("abort", onAbort);
    };
    const onAbort = () => {
      cleanup();
      reject(createAbortError());
    };
    signal == null ? void 0 : signal.addEventListener("abort", onAbort);
  });
}
function createAbortError() {
  return new DOMException("Delay was aborted", "AbortError");
}

// src/delayed-promise.ts
var DelayedPromise = class {
  constructor() {
    this.status = { type: "pending" };
    this._resolve = void 0;
    this._reject = void 0;
  }
  get promise() {
    if (this._promise) {
      return this._promise;
    }
    this._promise = new Promise((resolve2, reject) => {
      if (this.status.type === "resolved") {
        resolve2(this.status.value);
      } else if (this.status.type === "rejected") {
        reject(this.status.error);
      }
      this._resolve = resolve2;
      this._reject = reject;
    });
    return this._promise;
  }
  resolve(value) {
    var _a;
    this.status = { type: "resolved", value };
    if (this._promise) {
      (_a = this._resolve) == null ? void 0 : _a.call(this, value);
    }
  }
  reject(error) {
    var _a;
    this.status = { type: "rejected", error };
    if (this._promise) {
      (_a = this._reject) == null ? void 0 : _a.call(this, error);
    }
  }
  isResolved() {
    return this.status.type === "resolved";
  }
  isRejected() {
    return this.status.type === "rejected";
  }
  isPending() {
    return this.status.type === "pending";
  }
};

// src/extract-response-headers.ts
function extractResponseHeaders(response) {
  return Object.fromEntries([...response.headers]);
}
var createIdGenerator = ({
  prefix,
  size = 16,
  alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  separator = "-"
} = {}) => {
  const generator = () => {
    const alphabetLength = alphabet.length;
    const chars = new Array(size);
    for (let i = 0; i < size; i++) {
      chars[i] = alphabet[Math.random() * alphabetLength | 0];
    }
    return chars.join("");
  };
  if (prefix == null) {
    return generator;
  }
  if (alphabet.includes(separator)) {
    throw new InvalidArgumentError$1({
      argument: "separator",
      message: `The separator "${separator}" must not be part of the alphabet "${alphabet}".`
    });
  }
  return () => `${prefix}${separator}${generator()}`;
};
var generateId = createIdGenerator();

// src/get-error-message.ts
function getErrorMessage(error) {
  if (error == null) {
    return "unknown error";
  }
  if (typeof error === "string") {
    return error;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return JSON.stringify(error);
}

// src/is-abort-error.ts
function isAbortError(error) {
  return (error instanceof Error || error instanceof DOMException) && (error.name === "AbortError" || error.name === "ResponseAborted" || // Next.js
  error.name === "TimeoutError");
}

// src/handle-fetch-error.ts
var FETCH_FAILED_ERROR_MESSAGES = ["fetch failed", "failed to fetch"];
function handleFetchError({
  error,
  url,
  requestBodyValues
}) {
  if (isAbortError(error)) {
    return error;
  }
  if (error instanceof TypeError && FETCH_FAILED_ERROR_MESSAGES.includes(error.message.toLowerCase())) {
    const cause = error.cause;
    if (cause != null) {
      return new APICallError({
        message: `Cannot connect to API: ${cause.message}`,
        cause,
        url,
        requestBodyValues,
        isRetryable: true
        // retry when network error
      });
    }
  }
  return error;
}

// src/get-runtime-environment-user-agent.ts
function getRuntimeEnvironmentUserAgent(globalThisAny = globalThis) {
  var _a, _b, _c;
  if (globalThisAny.window) {
    return `runtime/browser`;
  }
  if ((_a = globalThisAny.navigator) == null ? void 0 : _a.userAgent) {
    return `runtime/${globalThisAny.navigator.userAgent.toLowerCase()}`;
  }
  if ((_c = (_b = globalThisAny.process) == null ? void 0 : _b.versions) == null ? void 0 : _c.node) {
    return `runtime/node.js/${globalThisAny.process.version.substring(0)}`;
  }
  if (globalThisAny.EdgeRuntime) {
    return `runtime/vercel-edge`;
  }
  return "runtime/unknown";
}

// src/normalize-headers.ts
function normalizeHeaders(headers) {
  if (headers == null) {
    return {};
  }
  const normalized = {};
  if (headers instanceof Headers) {
    headers.forEach((value, key) => {
      normalized[key.toLowerCase()] = value;
    });
  } else {
    if (!Array.isArray(headers)) {
      headers = Object.entries(headers);
    }
    for (const [key, value] of headers) {
      if (value != null) {
        normalized[key.toLowerCase()] = value;
      }
    }
  }
  return normalized;
}

// src/with-user-agent-suffix.ts
function withUserAgentSuffix(headers, ...userAgentSuffixParts) {
  const normalizedHeaders = new Headers(normalizeHeaders(headers));
  const currentUserAgentHeader = normalizedHeaders.get("user-agent") || "";
  normalizedHeaders.set(
    "user-agent",
    [currentUserAgentHeader, ...userAgentSuffixParts].filter(Boolean).join(" ")
  );
  return Object.fromEntries(normalizedHeaders.entries());
}

// src/version.ts
var VERSION$2 = "3.0.19" ;

// src/get-from-api.ts
var getOriginalFetch = () => globalThis.fetch;
var getFromApi = async ({
  url,
  headers = {},
  successfulResponseHandler,
  failedResponseHandler,
  abortSignal,
  fetch = getOriginalFetch()
}) => {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: withUserAgentSuffix(
        headers,
        `ai-sdk/provider-utils/${VERSION$2}`,
        getRuntimeEnvironmentUserAgent()
      ),
      signal: abortSignal
    });
    const responseHeaders = extractResponseHeaders(response);
    if (!response.ok) {
      let errorInformation;
      try {
        errorInformation = await failedResponseHandler({
          response,
          url,
          requestBodyValues: {}
        });
      } catch (error) {
        if (isAbortError(error) || APICallError.isInstance(error)) {
          throw error;
        }
        throw new APICallError({
          message: "Failed to process error response",
          cause: error,
          statusCode: response.status,
          url,
          responseHeaders,
          requestBodyValues: {}
        });
      }
      throw errorInformation.value;
    }
    try {
      return await successfulResponseHandler({
        response,
        url,
        requestBodyValues: {}
      });
    } catch (error) {
      if (error instanceof Error) {
        if (isAbortError(error) || APICallError.isInstance(error)) {
          throw error;
        }
      }
      throw new APICallError({
        message: "Failed to process successful response",
        cause: error,
        statusCode: response.status,
        url,
        responseHeaders,
        requestBodyValues: {}
      });
    }
  } catch (error) {
    throw handleFetchError({ error, url, requestBodyValues: {} });
  }
};

// src/is-url-supported.ts
function isUrlSupported({
  mediaType,
  url,
  supportedUrls
}) {
  url = url.toLowerCase();
  mediaType = mediaType.toLowerCase();
  return Object.entries(supportedUrls).map(([key, value]) => {
    const mediaType2 = key.toLowerCase();
    return mediaType2 === "*" || mediaType2 === "*/*" ? { mediaTypePrefix: "", regexes: value } : { mediaTypePrefix: mediaType2.replace(/\*/, ""), regexes: value };
  }).filter(({ mediaTypePrefix }) => mediaType.startsWith(mediaTypePrefix)).flatMap(({ regexes }) => regexes).some((pattern) => pattern.test(url));
}

// src/load-optional-setting.ts
function loadOptionalSetting({
  settingValue,
  environmentVariableName
}) {
  if (typeof settingValue === "string") {
    return settingValue;
  }
  if (settingValue != null || typeof process === "undefined") {
    return void 0;
  }
  settingValue = process.env[environmentVariableName];
  if (settingValue == null || typeof settingValue !== "string") {
    return void 0;
  }
  return settingValue;
}

// src/secure-json-parse.ts
var suspectProtoRx = /"__proto__"\s*:/;
var suspectConstructorRx = /"constructor"\s*:/;
function _parse(text) {
  const obj = JSON.parse(text);
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  if (suspectProtoRx.test(text) === false && suspectConstructorRx.test(text) === false) {
    return obj;
  }
  return filter(obj);
}
function filter(obj) {
  let next = [obj];
  while (next.length) {
    const nodes = next;
    next = [];
    for (const node of nodes) {
      if (Object.prototype.hasOwnProperty.call(node, "__proto__")) {
        throw new SyntaxError("Object contains forbidden prototype property");
      }
      if (Object.prototype.hasOwnProperty.call(node, "constructor") && Object.prototype.hasOwnProperty.call(node.constructor, "prototype")) {
        throw new SyntaxError("Object contains forbidden prototype property");
      }
      for (const key in node) {
        const value = node[key];
        if (value && typeof value === "object") {
          next.push(value);
        }
      }
    }
  }
  return obj;
}
function secureJsonParse(text) {
  const { stackTraceLimit } = Error;
  try {
    Error.stackTraceLimit = 0;
  } catch (e) {
    return _parse(text);
  }
  try {
    return _parse(text);
  } finally {
    Error.stackTraceLimit = stackTraceLimit;
  }
}
var validatorSymbol = Symbol.for("vercel.ai.validator");
function validator(validate) {
  return { [validatorSymbol]: true, validate };
}
function isValidator(value) {
  return typeof value === "object" && value !== null && validatorSymbol in value && value[validatorSymbol] === true && "validate" in value;
}
function lazyValidator(createValidator) {
  let validator2;
  return () => {
    if (validator2 == null) {
      validator2 = createValidator();
    }
    return validator2;
  };
}
function asValidator(value) {
  return isValidator(value) ? value : typeof value === "function" ? value() : standardSchemaValidator(value);
}
function standardSchemaValidator(standardSchema) {
  return validator(async (value) => {
    const result = await standardSchema["~standard"].validate(value);
    return result.issues == null ? { success: true, value: result.value } : {
      success: false,
      error: new TypeValidationError({
        value,
        cause: result.issues
      })
    };
  });
}

// src/validate-types.ts
async function validateTypes({
  value,
  schema
}) {
  const result = await safeValidateTypes({ value, schema });
  if (!result.success) {
    throw TypeValidationError.wrap({ value, cause: result.error });
  }
  return result.value;
}
async function safeValidateTypes({
  value,
  schema
}) {
  const validator2 = asValidator(schema);
  try {
    if (validator2.validate == null) {
      return { success: true, value, rawValue: value };
    }
    const result = await validator2.validate(value);
    if (result.success) {
      return { success: true, value: result.value, rawValue: value };
    }
    return {
      success: false,
      error: TypeValidationError.wrap({ value, cause: result.error }),
      rawValue: value
    };
  } catch (error) {
    return {
      success: false,
      error: TypeValidationError.wrap({ value, cause: error }),
      rawValue: value
    };
  }
}

// src/parse-json.ts
async function parseJSON({
  text,
  schema
}) {
  try {
    const value = secureJsonParse(text);
    if (schema == null) {
      return value;
    }
    return validateTypes({ value, schema });
  } catch (error) {
    if (JSONParseError.isInstance(error) || TypeValidationError.isInstance(error)) {
      throw error;
    }
    throw new JSONParseError({ text, cause: error });
  }
}
async function safeParseJSON({
  text,
  schema
}) {
  try {
    const value = secureJsonParse(text);
    if (schema == null) {
      return { success: true, value, rawValue: value };
    }
    return await safeValidateTypes({ value, schema });
  } catch (error) {
    return {
      success: false,
      error: JSONParseError.isInstance(error) ? error : new JSONParseError({ text, cause: error }),
      rawValue: void 0
    };
  }
}
function parseJsonEventStream({
  stream,
  schema
}) {
  return stream.pipeThrough(new TextDecoderStream()).pipeThrough(new EventSourceParserStream()).pipeThrough(
    new TransformStream({
      async transform({ data }, controller) {
        if (data === "[DONE]") {
          return;
        }
        controller.enqueue(await safeParseJSON({ text: data, schema }));
      }
    })
  );
}
var getOriginalFetch2 = () => globalThis.fetch;
var postJsonToApi = async ({
  url,
  headers,
  body,
  failedResponseHandler,
  successfulResponseHandler,
  abortSignal,
  fetch
}) => postToApi({
  url,
  headers: {
    "Content-Type": "application/json",
    ...headers
  },
  body: {
    content: JSON.stringify(body),
    values: body
  },
  failedResponseHandler,
  successfulResponseHandler,
  abortSignal,
  fetch
});
var postToApi = async ({
  url,
  headers = {},
  body,
  successfulResponseHandler,
  failedResponseHandler,
  abortSignal,
  fetch = getOriginalFetch2()
}) => {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: withUserAgentSuffix(
        headers,
        `ai-sdk/provider-utils/${VERSION$2}`,
        getRuntimeEnvironmentUserAgent()
      ),
      body: body.content,
      signal: abortSignal
    });
    const responseHeaders = extractResponseHeaders(response);
    if (!response.ok) {
      let errorInformation;
      try {
        errorInformation = await failedResponseHandler({
          response,
          url,
          requestBodyValues: body.values
        });
      } catch (error) {
        if (isAbortError(error) || APICallError.isInstance(error)) {
          throw error;
        }
        throw new APICallError({
          message: "Failed to process error response",
          cause: error,
          statusCode: response.status,
          url,
          responseHeaders,
          requestBodyValues: body.values
        });
      }
      throw errorInformation.value;
    }
    try {
      return await successfulResponseHandler({
        response,
        url,
        requestBodyValues: body.values
      });
    } catch (error) {
      if (error instanceof Error) {
        if (isAbortError(error) || APICallError.isInstance(error)) {
          throw error;
        }
      }
      throw new APICallError({
        message: "Failed to process successful response",
        cause: error,
        statusCode: response.status,
        url,
        responseHeaders,
        requestBodyValues: body.values
      });
    }
  } catch (error) {
    throw handleFetchError({ error, url, requestBodyValues: body.values });
  }
};

// src/resolve.ts
async function resolve(value) {
  if (typeof value === "function") {
    value = value();
  }
  return Promise.resolve(value);
}
var createJsonErrorResponseHandler = ({
  errorSchema,
  errorToMessage,
  isRetryable
}) => async ({ response, url, requestBodyValues }) => {
  const responseBody = await response.text();
  const responseHeaders = extractResponseHeaders(response);
  if (responseBody.trim() === "") {
    return {
      responseHeaders,
      value: new APICallError({
        message: response.statusText,
        url,
        requestBodyValues,
        statusCode: response.status,
        responseHeaders,
        responseBody,
        isRetryable: isRetryable == null ? void 0 : isRetryable(response)
      })
    };
  }
  try {
    const parsedError = await parseJSON({
      text: responseBody,
      schema: errorSchema
    });
    return {
      responseHeaders,
      value: new APICallError({
        message: errorToMessage(parsedError),
        url,
        requestBodyValues,
        statusCode: response.status,
        responseHeaders,
        responseBody,
        data: parsedError,
        isRetryable: isRetryable == null ? void 0 : isRetryable(response, parsedError)
      })
    };
  } catch (parseError) {
    return {
      responseHeaders,
      value: new APICallError({
        message: response.statusText,
        url,
        requestBodyValues,
        statusCode: response.status,
        responseHeaders,
        responseBody,
        isRetryable: isRetryable == null ? void 0 : isRetryable(response)
      })
    };
  }
};
var createEventSourceResponseHandler = (chunkSchema) => async ({ response }) => {
  const responseHeaders = extractResponseHeaders(response);
  if (response.body == null) {
    throw new EmptyResponseBodyError({});
  }
  return {
    responseHeaders,
    value: parseJsonEventStream({
      stream: response.body,
      schema: chunkSchema
    })
  };
};
var createJsonResponseHandler = (responseSchema) => async ({ response, url, requestBodyValues }) => {
  const responseBody = await response.text();
  const parsedResult = await safeParseJSON({
    text: responseBody,
    schema: responseSchema
  });
  const responseHeaders = extractResponseHeaders(response);
  if (!parsedResult.success) {
    throw new APICallError({
      message: "Invalid JSON response",
      cause: parsedResult.error,
      statusCode: response.status,
      responseHeaders,
      responseBody,
      url,
      requestBodyValues
    });
  }
  return {
    responseHeaders,
    value: parsedResult.value,
    rawValue: parsedResult.rawValue
  };
};

// src/add-additional-properties-to-json-schema.ts
function addAdditionalPropertiesToJsonSchema(jsonSchema2) {
  if (jsonSchema2.type === "object") {
    jsonSchema2.additionalProperties = false;
    const properties = jsonSchema2.properties;
    if (properties != null) {
      for (const property in properties) {
        properties[property] = addAdditionalPropertiesToJsonSchema(
          properties[property]
        );
      }
    }
  }
  if (jsonSchema2.type === "array" && jsonSchema2.items != null) {
    if (Array.isArray(jsonSchema2.items)) {
      jsonSchema2.items = jsonSchema2.items.map(
        (item) => addAdditionalPropertiesToJsonSchema(item)
      );
    } else {
      jsonSchema2.items = addAdditionalPropertiesToJsonSchema(
        jsonSchema2.items
      );
    }
  }
  return jsonSchema2;
}

// src/zod-to-json-schema/get-relative-path.ts
var getRelativePath = (pathA, pathB) => {
  let i = 0;
  for (; i < pathA.length && i < pathB.length; i++) {
    if (pathA[i] !== pathB[i]) break;
  }
  return [(pathA.length - i).toString(), ...pathB.slice(i)].join("/");
};

// src/zod-to-json-schema/options.ts
var ignoreOverride = Symbol(
  "Let zodToJsonSchema decide on which parser to use"
);
var defaultOptions = {
  name: void 0,
  $refStrategy: "root",
  basePath: ["#"],
  effectStrategy: "input",
  pipeStrategy: "all",
  dateStrategy: "format:date-time",
  mapStrategy: "entries",
  removeAdditionalStrategy: "passthrough",
  allowedAdditionalProperties: true,
  rejectedAdditionalProperties: false,
  definitionPath: "definitions",
  strictUnions: false,
  definitions: {},
  errorMessages: false,
  patternStrategy: "escape",
  applyRegexFlags: false,
  emailStrategy: "format:email",
  base64Strategy: "contentEncoding:base64",
  nameStrategy: "ref"
};
var getDefaultOptions = (options) => typeof options === "string" ? {
  ...defaultOptions,
  name: options
} : {
  ...defaultOptions,
  ...options
};

// src/zod-to-json-schema/parsers/any.ts
function parseAnyDef() {
  return {};
}
function parseArrayDef(def, refs) {
  var _a, _b, _c;
  const res = {
    type: "array"
  };
  if (((_a = def.type) == null ? void 0 : _a._def) && ((_c = (_b = def.type) == null ? void 0 : _b._def) == null ? void 0 : _c.typeName) !== ZodFirstPartyTypeKind.ZodAny) {
    res.items = parseDef(def.type._def, {
      ...refs,
      currentPath: [...refs.currentPath, "items"]
    });
  }
  if (def.minLength) {
    res.minItems = def.minLength.value;
  }
  if (def.maxLength) {
    res.maxItems = def.maxLength.value;
  }
  if (def.exactLength) {
    res.minItems = def.exactLength.value;
    res.maxItems = def.exactLength.value;
  }
  return res;
}

// src/zod-to-json-schema/parsers/bigint.ts
function parseBigintDef(def) {
  const res = {
    type: "integer",
    format: "int64"
  };
  if (!def.checks) return res;
  for (const check of def.checks) {
    switch (check.kind) {
      case "min":
        if (check.inclusive) {
          res.minimum = check.value;
        } else {
          res.exclusiveMinimum = check.value;
        }
        break;
      case "max":
        if (check.inclusive) {
          res.maximum = check.value;
        } else {
          res.exclusiveMaximum = check.value;
        }
        break;
      case "multipleOf":
        res.multipleOf = check.value;
        break;
    }
  }
  return res;
}

// src/zod-to-json-schema/parsers/boolean.ts
function parseBooleanDef() {
  return { type: "boolean" };
}

// src/zod-to-json-schema/parsers/branded.ts
function parseBrandedDef(_def, refs) {
  return parseDef(_def.type._def, refs);
}

// src/zod-to-json-schema/parsers/catch.ts
var parseCatchDef = (def, refs) => {
  return parseDef(def.innerType._def, refs);
};

// src/zod-to-json-schema/parsers/date.ts
function parseDateDef(def, refs, overrideDateStrategy) {
  const strategy = overrideDateStrategy != null ? overrideDateStrategy : refs.dateStrategy;
  if (Array.isArray(strategy)) {
    return {
      anyOf: strategy.map((item, i) => parseDateDef(def, refs, item))
    };
  }
  switch (strategy) {
    case "string":
    case "format:date-time":
      return {
        type: "string",
        format: "date-time"
      };
    case "format:date":
      return {
        type: "string",
        format: "date"
      };
    case "integer":
      return integerDateParser(def);
  }
}
var integerDateParser = (def) => {
  const res = {
    type: "integer",
    format: "unix-time"
  };
  for (const check of def.checks) {
    switch (check.kind) {
      case "min":
        res.minimum = check.value;
        break;
      case "max":
        res.maximum = check.value;
        break;
    }
  }
  return res;
};

// src/zod-to-json-schema/parsers/default.ts
function parseDefaultDef(_def, refs) {
  return {
    ...parseDef(_def.innerType._def, refs),
    default: _def.defaultValue()
  };
}

// src/zod-to-json-schema/parsers/effects.ts
function parseEffectsDef(_def, refs) {
  return refs.effectStrategy === "input" ? parseDef(_def.schema._def, refs) : parseAnyDef();
}

// src/zod-to-json-schema/parsers/enum.ts
function parseEnumDef(def) {
  return {
    type: "string",
    enum: Array.from(def.values)
  };
}

// src/zod-to-json-schema/parsers/intersection.ts
var isJsonSchema7AllOfType = (type) => {
  if ("type" in type && type.type === "string") return false;
  return "allOf" in type;
};
function parseIntersectionDef(def, refs) {
  const allOf = [
    parseDef(def.left._def, {
      ...refs,
      currentPath: [...refs.currentPath, "allOf", "0"]
    }),
    parseDef(def.right._def, {
      ...refs,
      currentPath: [...refs.currentPath, "allOf", "1"]
    })
  ].filter((x) => !!x);
  const mergedAllOf = [];
  allOf.forEach((schema) => {
    if (isJsonSchema7AllOfType(schema)) {
      mergedAllOf.push(...schema.allOf);
    } else {
      let nestedSchema = schema;
      if ("additionalProperties" in schema && schema.additionalProperties === false) {
        const { additionalProperties, ...rest } = schema;
        nestedSchema = rest;
      }
      mergedAllOf.push(nestedSchema);
    }
  });
  return mergedAllOf.length ? { allOf: mergedAllOf } : void 0;
}

// src/zod-to-json-schema/parsers/literal.ts
function parseLiteralDef(def) {
  const parsedType = typeof def.value;
  if (parsedType !== "bigint" && parsedType !== "number" && parsedType !== "boolean" && parsedType !== "string") {
    return {
      type: Array.isArray(def.value) ? "array" : "object"
    };
  }
  return {
    type: parsedType === "bigint" ? "integer" : parsedType,
    const: def.value
  };
}

// src/zod-to-json-schema/parsers/string.ts
var emojiRegex = void 0;
var zodPatterns = {
  /**
   * `c` was changed to `[cC]` to replicate /i flag
   */
  cuid: /^[cC][^\s-]{8,}$/,
  cuid2: /^[0-9a-z]+$/,
  ulid: /^[0-9A-HJKMNP-TV-Z]{26}$/,
  /**
   * `a-z` was added to replicate /i flag
   */
  email: /^(?!\.)(?!.*\.\.)([a-zA-Z0-9_'+\-\.]*)[a-zA-Z0-9_+-]@([a-zA-Z0-9][a-zA-Z0-9\-]*\.)+[a-zA-Z]{2,}$/,
  /**
   * Constructed a valid Unicode RegExp
   *
   * Lazily instantiate since this type of regex isn't supported
   * in all envs (e.g. React Native).
   *
   * See:
   * https://github.com/colinhacks/zod/issues/2433
   * Fix in Zod:
   * https://github.com/colinhacks/zod/commit/9340fd51e48576a75adc919bff65dbc4a5d4c99b
   */
  emoji: () => {
    if (emojiRegex === void 0) {
      emojiRegex = RegExp(
        "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$",
        "u"
      );
    }
    return emojiRegex;
  },
  /**
   * Unused
   */
  uuid: /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/,
  /**
   * Unused
   */
  ipv4: /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/,
  ipv4Cidr: /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/,
  /**
   * Unused
   */
  ipv6: /^(([a-f0-9]{1,4}:){7}|::([a-f0-9]{1,4}:){0,6}|([a-f0-9]{1,4}:){1}:([a-f0-9]{1,4}:){0,5}|([a-f0-9]{1,4}:){2}:([a-f0-9]{1,4}:){0,4}|([a-f0-9]{1,4}:){3}:([a-f0-9]{1,4}:){0,3}|([a-f0-9]{1,4}:){4}:([a-f0-9]{1,4}:){0,2}|([a-f0-9]{1,4}:){5}:([a-f0-9]{1,4}:){0,1})([a-f0-9]{1,4}|(((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2}))\.){3}((25[0-5])|(2[0-4][0-9])|(1[0-9]{2})|([0-9]{1,2})))$/,
  ipv6Cidr: /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/,
  base64: /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/,
  base64url: /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/,
  nanoid: /^[a-zA-Z0-9_-]{21}$/,
  jwt: /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/
};
function parseStringDef(def, refs) {
  const res = {
    type: "string"
  };
  if (def.checks) {
    for (const check of def.checks) {
      switch (check.kind) {
        case "min":
          res.minLength = typeof res.minLength === "number" ? Math.max(res.minLength, check.value) : check.value;
          break;
        case "max":
          res.maxLength = typeof res.maxLength === "number" ? Math.min(res.maxLength, check.value) : check.value;
          break;
        case "email":
          switch (refs.emailStrategy) {
            case "format:email":
              addFormat(res, "email", check.message, refs);
              break;
            case "format:idn-email":
              addFormat(res, "idn-email", check.message, refs);
              break;
            case "pattern:zod":
              addPattern(res, zodPatterns.email, check.message, refs);
              break;
          }
          break;
        case "url":
          addFormat(res, "uri", check.message, refs);
          break;
        case "uuid":
          addFormat(res, "uuid", check.message, refs);
          break;
        case "regex":
          addPattern(res, check.regex, check.message, refs);
          break;
        case "cuid":
          addPattern(res, zodPatterns.cuid, check.message, refs);
          break;
        case "cuid2":
          addPattern(res, zodPatterns.cuid2, check.message, refs);
          break;
        case "startsWith":
          addPattern(
            res,
            RegExp(`^${escapeLiteralCheckValue(check.value, refs)}`),
            check.message,
            refs
          );
          break;
        case "endsWith":
          addPattern(
            res,
            RegExp(`${escapeLiteralCheckValue(check.value, refs)}$`),
            check.message,
            refs
          );
          break;
        case "datetime":
          addFormat(res, "date-time", check.message, refs);
          break;
        case "date":
          addFormat(res, "date", check.message, refs);
          break;
        case "time":
          addFormat(res, "time", check.message, refs);
          break;
        case "duration":
          addFormat(res, "duration", check.message, refs);
          break;
        case "length":
          res.minLength = typeof res.minLength === "number" ? Math.max(res.minLength, check.value) : check.value;
          res.maxLength = typeof res.maxLength === "number" ? Math.min(res.maxLength, check.value) : check.value;
          break;
        case "includes": {
          addPattern(
            res,
            RegExp(escapeLiteralCheckValue(check.value, refs)),
            check.message,
            refs
          );
          break;
        }
        case "ip": {
          if (check.version !== "v6") {
            addFormat(res, "ipv4", check.message, refs);
          }
          if (check.version !== "v4") {
            addFormat(res, "ipv6", check.message, refs);
          }
          break;
        }
        case "base64url":
          addPattern(res, zodPatterns.base64url, check.message, refs);
          break;
        case "jwt":
          addPattern(res, zodPatterns.jwt, check.message, refs);
          break;
        case "cidr": {
          if (check.version !== "v6") {
            addPattern(res, zodPatterns.ipv4Cidr, check.message, refs);
          }
          if (check.version !== "v4") {
            addPattern(res, zodPatterns.ipv6Cidr, check.message, refs);
          }
          break;
        }
        case "emoji":
          addPattern(res, zodPatterns.emoji(), check.message, refs);
          break;
        case "ulid": {
          addPattern(res, zodPatterns.ulid, check.message, refs);
          break;
        }
        case "base64": {
          switch (refs.base64Strategy) {
            case "format:binary": {
              addFormat(res, "binary", check.message, refs);
              break;
            }
            case "contentEncoding:base64": {
              res.contentEncoding = "base64";
              break;
            }
            case "pattern:zod": {
              addPattern(res, zodPatterns.base64, check.message, refs);
              break;
            }
          }
          break;
        }
        case "nanoid": {
          addPattern(res, zodPatterns.nanoid, check.message, refs);
        }
      }
    }
  }
  return res;
}
function escapeLiteralCheckValue(literal, refs) {
  return refs.patternStrategy === "escape" ? escapeNonAlphaNumeric(literal) : literal;
}
var ALPHA_NUMERIC = new Set(
  "ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvxyz0123456789"
);
function escapeNonAlphaNumeric(source) {
  let result = "";
  for (let i = 0; i < source.length; i++) {
    if (!ALPHA_NUMERIC.has(source[i])) {
      result += "\\";
    }
    result += source[i];
  }
  return result;
}
function addFormat(schema, value, message, refs) {
  var _a;
  if (schema.format || ((_a = schema.anyOf) == null ? void 0 : _a.some((x) => x.format))) {
    if (!schema.anyOf) {
      schema.anyOf = [];
    }
    if (schema.format) {
      schema.anyOf.push({
        format: schema.format
      });
      delete schema.format;
    }
    schema.anyOf.push({
      format: value,
      ...message && refs.errorMessages && { errorMessage: { format: message } }
    });
  } else {
    schema.format = value;
  }
}
function addPattern(schema, regex, message, refs) {
  var _a;
  if (schema.pattern || ((_a = schema.allOf) == null ? void 0 : _a.some((x) => x.pattern))) {
    if (!schema.allOf) {
      schema.allOf = [];
    }
    if (schema.pattern) {
      schema.allOf.push({
        pattern: schema.pattern
      });
      delete schema.pattern;
    }
    schema.allOf.push({
      pattern: stringifyRegExpWithFlags(regex, refs),
      ...message && refs.errorMessages && { errorMessage: { pattern: message } }
    });
  } else {
    schema.pattern = stringifyRegExpWithFlags(regex, refs);
  }
}
function stringifyRegExpWithFlags(regex, refs) {
  var _a;
  if (!refs.applyRegexFlags || !regex.flags) {
    return regex.source;
  }
  const flags = {
    i: regex.flags.includes("i"),
    // Case-insensitive
    m: regex.flags.includes("m"),
    // `^` and `$` matches adjacent to newline characters
    s: regex.flags.includes("s")
    // `.` matches newlines
  };
  const source = flags.i ? regex.source.toLowerCase() : regex.source;
  let pattern = "";
  let isEscaped = false;
  let inCharGroup = false;
  let inCharRange = false;
  for (let i = 0; i < source.length; i++) {
    if (isEscaped) {
      pattern += source[i];
      isEscaped = false;
      continue;
    }
    if (flags.i) {
      if (inCharGroup) {
        if (source[i].match(/[a-z]/)) {
          if (inCharRange) {
            pattern += source[i];
            pattern += `${source[i - 2]}-${source[i]}`.toUpperCase();
            inCharRange = false;
          } else if (source[i + 1] === "-" && ((_a = source[i + 2]) == null ? void 0 : _a.match(/[a-z]/))) {
            pattern += source[i];
            inCharRange = true;
          } else {
            pattern += `${source[i]}${source[i].toUpperCase()}`;
          }
          continue;
        }
      } else if (source[i].match(/[a-z]/)) {
        pattern += `[${source[i]}${source[i].toUpperCase()}]`;
        continue;
      }
    }
    if (flags.m) {
      if (source[i] === "^") {
        pattern += `(^|(?<=[\r
]))`;
        continue;
      } else if (source[i] === "$") {
        pattern += `($|(?=[\r
]))`;
        continue;
      }
    }
    if (flags.s && source[i] === ".") {
      pattern += inCharGroup ? `${source[i]}\r
` : `[${source[i]}\r
]`;
      continue;
    }
    pattern += source[i];
    if (source[i] === "\\") {
      isEscaped = true;
    } else if (inCharGroup && source[i] === "]") {
      inCharGroup = false;
    } else if (!inCharGroup && source[i] === "[") {
      inCharGroup = true;
    }
  }
  return pattern;
}

// src/zod-to-json-schema/parsers/record.ts
function parseRecordDef(def, refs) {
  var _a, _b, _c, _d, _e, _f;
  const schema = {
    type: "object",
    additionalProperties: (_a = parseDef(def.valueType._def, {
      ...refs,
      currentPath: [...refs.currentPath, "additionalProperties"]
    })) != null ? _a : refs.allowedAdditionalProperties
  };
  if (((_b = def.keyType) == null ? void 0 : _b._def.typeName) === ZodFirstPartyTypeKind.ZodString && ((_c = def.keyType._def.checks) == null ? void 0 : _c.length)) {
    const { type, ...keyType } = parseStringDef(def.keyType._def, refs);
    return {
      ...schema,
      propertyNames: keyType
    };
  } else if (((_d = def.keyType) == null ? void 0 : _d._def.typeName) === ZodFirstPartyTypeKind.ZodEnum) {
    return {
      ...schema,
      propertyNames: {
        enum: def.keyType._def.values
      }
    };
  } else if (((_e = def.keyType) == null ? void 0 : _e._def.typeName) === ZodFirstPartyTypeKind.ZodBranded && def.keyType._def.type._def.typeName === ZodFirstPartyTypeKind.ZodString && ((_f = def.keyType._def.type._def.checks) == null ? void 0 : _f.length)) {
    const { type, ...keyType } = parseBrandedDef(
      def.keyType._def,
      refs
    );
    return {
      ...schema,
      propertyNames: keyType
    };
  }
  return schema;
}

// src/zod-to-json-schema/parsers/map.ts
function parseMapDef(def, refs) {
  if (refs.mapStrategy === "record") {
    return parseRecordDef(def, refs);
  }
  const keys = parseDef(def.keyType._def, {
    ...refs,
    currentPath: [...refs.currentPath, "items", "items", "0"]
  }) || parseAnyDef();
  const values = parseDef(def.valueType._def, {
    ...refs,
    currentPath: [...refs.currentPath, "items", "items", "1"]
  }) || parseAnyDef();
  return {
    type: "array",
    maxItems: 125,
    items: {
      type: "array",
      items: [keys, values],
      minItems: 2,
      maxItems: 2
    }
  };
}

// src/zod-to-json-schema/parsers/native-enum.ts
function parseNativeEnumDef(def) {
  const object = def.values;
  const actualKeys = Object.keys(def.values).filter((key) => {
    return typeof object[object[key]] !== "number";
  });
  const actualValues = actualKeys.map((key) => object[key]);
  const parsedTypes = Array.from(
    new Set(actualValues.map((values) => typeof values))
  );
  return {
    type: parsedTypes.length === 1 ? parsedTypes[0] === "string" ? "string" : "number" : ["string", "number"],
    enum: actualValues
  };
}

// src/zod-to-json-schema/parsers/never.ts
function parseNeverDef() {
  return { not: parseAnyDef() };
}

// src/zod-to-json-schema/parsers/null.ts
function parseNullDef() {
  return {
    type: "null"
  };
}

// src/zod-to-json-schema/parsers/union.ts
var primitiveMappings = {
  ZodString: "string",
  ZodNumber: "number",
  ZodBigInt: "integer",
  ZodBoolean: "boolean",
  ZodNull: "null"
};
function parseUnionDef(def, refs) {
  const options = def.options instanceof Map ? Array.from(def.options.values()) : def.options;
  if (options.every(
    (x) => x._def.typeName in primitiveMappings && (!x._def.checks || !x._def.checks.length)
  )) {
    const types = options.reduce((types2, x) => {
      const type = primitiveMappings[x._def.typeName];
      return type && !types2.includes(type) ? [...types2, type] : types2;
    }, []);
    return {
      type: types.length > 1 ? types : types[0]
    };
  } else if (options.every((x) => x._def.typeName === "ZodLiteral" && !x.description)) {
    const types = options.reduce(
      (acc, x) => {
        const type = typeof x._def.value;
        switch (type) {
          case "string":
          case "number":
          case "boolean":
            return [...acc, type];
          case "bigint":
            return [...acc, "integer"];
          case "object":
            if (x._def.value === null) return [...acc, "null"];
          case "symbol":
          case "undefined":
          case "function":
          default:
            return acc;
        }
      },
      []
    );
    if (types.length === options.length) {
      const uniqueTypes = types.filter((x, i, a) => a.indexOf(x) === i);
      return {
        type: uniqueTypes.length > 1 ? uniqueTypes : uniqueTypes[0],
        enum: options.reduce(
          (acc, x) => {
            return acc.includes(x._def.value) ? acc : [...acc, x._def.value];
          },
          []
        )
      };
    }
  } else if (options.every((x) => x._def.typeName === "ZodEnum")) {
    return {
      type: "string",
      enum: options.reduce(
        (acc, x) => [
          ...acc,
          ...x._def.values.filter((x2) => !acc.includes(x2))
        ],
        []
      )
    };
  }
  return asAnyOf(def, refs);
}
var asAnyOf = (def, refs) => {
  const anyOf = (def.options instanceof Map ? Array.from(def.options.values()) : def.options).map(
    (x, i) => parseDef(x._def, {
      ...refs,
      currentPath: [...refs.currentPath, "anyOf", `${i}`]
    })
  ).filter(
    (x) => !!x && (!refs.strictUnions || typeof x === "object" && Object.keys(x).length > 0)
  );
  return anyOf.length ? { anyOf } : void 0;
};

// src/zod-to-json-schema/parsers/nullable.ts
function parseNullableDef(def, refs) {
  if (["ZodString", "ZodNumber", "ZodBigInt", "ZodBoolean", "ZodNull"].includes(
    def.innerType._def.typeName
  ) && (!def.innerType._def.checks || !def.innerType._def.checks.length)) {
    return {
      type: [
        primitiveMappings[def.innerType._def.typeName],
        "null"
      ]
    };
  }
  const base = parseDef(def.innerType._def, {
    ...refs,
    currentPath: [...refs.currentPath, "anyOf", "0"]
  });
  return base && { anyOf: [base, { type: "null" }] };
}

// src/zod-to-json-schema/parsers/number.ts
function parseNumberDef(def) {
  const res = {
    type: "number"
  };
  if (!def.checks) return res;
  for (const check of def.checks) {
    switch (check.kind) {
      case "int":
        res.type = "integer";
        break;
      case "min":
        if (check.inclusive) {
          res.minimum = check.value;
        } else {
          res.exclusiveMinimum = check.value;
        }
        break;
      case "max":
        if (check.inclusive) {
          res.maximum = check.value;
        } else {
          res.exclusiveMaximum = check.value;
        }
        break;
      case "multipleOf":
        res.multipleOf = check.value;
        break;
    }
  }
  return res;
}

// src/zod-to-json-schema/parsers/object.ts
function parseObjectDef(def, refs) {
  const result = {
    type: "object",
    properties: {}
  };
  const required = [];
  const shape = def.shape();
  for (const propName in shape) {
    let propDef = shape[propName];
    if (propDef === void 0 || propDef._def === void 0) {
      continue;
    }
    const propOptional = safeIsOptional(propDef);
    const parsedDef = parseDef(propDef._def, {
      ...refs,
      currentPath: [...refs.currentPath, "properties", propName],
      propertyPath: [...refs.currentPath, "properties", propName]
    });
    if (parsedDef === void 0) {
      continue;
    }
    result.properties[propName] = parsedDef;
    if (!propOptional) {
      required.push(propName);
    }
  }
  if (required.length) {
    result.required = required;
  }
  const additionalProperties = decideAdditionalProperties(def, refs);
  if (additionalProperties !== void 0) {
    result.additionalProperties = additionalProperties;
  }
  return result;
}
function decideAdditionalProperties(def, refs) {
  if (def.catchall._def.typeName !== "ZodNever") {
    return parseDef(def.catchall._def, {
      ...refs,
      currentPath: [...refs.currentPath, "additionalProperties"]
    });
  }
  switch (def.unknownKeys) {
    case "passthrough":
      return refs.allowedAdditionalProperties;
    case "strict":
      return refs.rejectedAdditionalProperties;
    case "strip":
      return refs.removeAdditionalStrategy === "strict" ? refs.allowedAdditionalProperties : refs.rejectedAdditionalProperties;
  }
}
function safeIsOptional(schema) {
  try {
    return schema.isOptional();
  } catch (e) {
    return true;
  }
}

// src/zod-to-json-schema/parsers/optional.ts
var parseOptionalDef = (def, refs) => {
  var _a;
  if (refs.currentPath.toString() === ((_a = refs.propertyPath) == null ? void 0 : _a.toString())) {
    return parseDef(def.innerType._def, refs);
  }
  const innerSchema = parseDef(def.innerType._def, {
    ...refs,
    currentPath: [...refs.currentPath, "anyOf", "1"]
  });
  return innerSchema ? { anyOf: [{ not: parseAnyDef() }, innerSchema] } : parseAnyDef();
};

// src/zod-to-json-schema/parsers/pipeline.ts
var parsePipelineDef = (def, refs) => {
  if (refs.pipeStrategy === "input") {
    return parseDef(def.in._def, refs);
  } else if (refs.pipeStrategy === "output") {
    return parseDef(def.out._def, refs);
  }
  const a = parseDef(def.in._def, {
    ...refs,
    currentPath: [...refs.currentPath, "allOf", "0"]
  });
  const b = parseDef(def.out._def, {
    ...refs,
    currentPath: [...refs.currentPath, "allOf", a ? "1" : "0"]
  });
  return {
    allOf: [a, b].filter((x) => x !== void 0)
  };
};

// src/zod-to-json-schema/parsers/promise.ts
function parsePromiseDef(def, refs) {
  return parseDef(def.type._def, refs);
}

// src/zod-to-json-schema/parsers/set.ts
function parseSetDef(def, refs) {
  const items = parseDef(def.valueType._def, {
    ...refs,
    currentPath: [...refs.currentPath, "items"]
  });
  const schema = {
    type: "array",
    uniqueItems: true,
    items
  };
  if (def.minSize) {
    schema.minItems = def.minSize.value;
  }
  if (def.maxSize) {
    schema.maxItems = def.maxSize.value;
  }
  return schema;
}

// src/zod-to-json-schema/parsers/tuple.ts
function parseTupleDef(def, refs) {
  if (def.rest) {
    return {
      type: "array",
      minItems: def.items.length,
      items: def.items.map(
        (x, i) => parseDef(x._def, {
          ...refs,
          currentPath: [...refs.currentPath, "items", `${i}`]
        })
      ).reduce(
        (acc, x) => x === void 0 ? acc : [...acc, x],
        []
      ),
      additionalItems: parseDef(def.rest._def, {
        ...refs,
        currentPath: [...refs.currentPath, "additionalItems"]
      })
    };
  } else {
    return {
      type: "array",
      minItems: def.items.length,
      maxItems: def.items.length,
      items: def.items.map(
        (x, i) => parseDef(x._def, {
          ...refs,
          currentPath: [...refs.currentPath, "items", `${i}`]
        })
      ).reduce(
        (acc, x) => x === void 0 ? acc : [...acc, x],
        []
      )
    };
  }
}

// src/zod-to-json-schema/parsers/undefined.ts
function parseUndefinedDef() {
  return {
    not: parseAnyDef()
  };
}

// src/zod-to-json-schema/parsers/unknown.ts
function parseUnknownDef() {
  return parseAnyDef();
}

// src/zod-to-json-schema/parsers/readonly.ts
var parseReadonlyDef = (def, refs) => {
  return parseDef(def.innerType._def, refs);
};

// src/zod-to-json-schema/select-parser.ts
var selectParser = (def, typeName, refs) => {
  switch (typeName) {
    case ZodFirstPartyTypeKind.ZodString:
      return parseStringDef(def, refs);
    case ZodFirstPartyTypeKind.ZodNumber:
      return parseNumberDef(def);
    case ZodFirstPartyTypeKind.ZodObject:
      return parseObjectDef(def, refs);
    case ZodFirstPartyTypeKind.ZodBigInt:
      return parseBigintDef(def);
    case ZodFirstPartyTypeKind.ZodBoolean:
      return parseBooleanDef();
    case ZodFirstPartyTypeKind.ZodDate:
      return parseDateDef(def, refs);
    case ZodFirstPartyTypeKind.ZodUndefined:
      return parseUndefinedDef();
    case ZodFirstPartyTypeKind.ZodNull:
      return parseNullDef();
    case ZodFirstPartyTypeKind.ZodArray:
      return parseArrayDef(def, refs);
    case ZodFirstPartyTypeKind.ZodUnion:
    case ZodFirstPartyTypeKind.ZodDiscriminatedUnion:
      return parseUnionDef(def, refs);
    case ZodFirstPartyTypeKind.ZodIntersection:
      return parseIntersectionDef(def, refs);
    case ZodFirstPartyTypeKind.ZodTuple:
      return parseTupleDef(def, refs);
    case ZodFirstPartyTypeKind.ZodRecord:
      return parseRecordDef(def, refs);
    case ZodFirstPartyTypeKind.ZodLiteral:
      return parseLiteralDef(def);
    case ZodFirstPartyTypeKind.ZodEnum:
      return parseEnumDef(def);
    case ZodFirstPartyTypeKind.ZodNativeEnum:
      return parseNativeEnumDef(def);
    case ZodFirstPartyTypeKind.ZodNullable:
      return parseNullableDef(def, refs);
    case ZodFirstPartyTypeKind.ZodOptional:
      return parseOptionalDef(def, refs);
    case ZodFirstPartyTypeKind.ZodMap:
      return parseMapDef(def, refs);
    case ZodFirstPartyTypeKind.ZodSet:
      return parseSetDef(def, refs);
    case ZodFirstPartyTypeKind.ZodLazy:
      return () => def.getter()._def;
    case ZodFirstPartyTypeKind.ZodPromise:
      return parsePromiseDef(def, refs);
    case ZodFirstPartyTypeKind.ZodNaN:
    case ZodFirstPartyTypeKind.ZodNever:
      return parseNeverDef();
    case ZodFirstPartyTypeKind.ZodEffects:
      return parseEffectsDef(def, refs);
    case ZodFirstPartyTypeKind.ZodAny:
      return parseAnyDef();
    case ZodFirstPartyTypeKind.ZodUnknown:
      return parseUnknownDef();
    case ZodFirstPartyTypeKind.ZodDefault:
      return parseDefaultDef(def, refs);
    case ZodFirstPartyTypeKind.ZodBranded:
      return parseBrandedDef(def, refs);
    case ZodFirstPartyTypeKind.ZodReadonly:
      return parseReadonlyDef(def, refs);
    case ZodFirstPartyTypeKind.ZodCatch:
      return parseCatchDef(def, refs);
    case ZodFirstPartyTypeKind.ZodPipeline:
      return parsePipelineDef(def, refs);
    case ZodFirstPartyTypeKind.ZodFunction:
    case ZodFirstPartyTypeKind.ZodVoid:
    case ZodFirstPartyTypeKind.ZodSymbol:
      return void 0;
    default:
      return /* @__PURE__ */ ((_) => void 0)();
  }
};

// src/zod-to-json-schema/parse-def.ts
function parseDef(def, refs, forceResolution = false) {
  var _a;
  const seenItem = refs.seen.get(def);
  if (refs.override) {
    const overrideResult = (_a = refs.override) == null ? void 0 : _a.call(
      refs,
      def,
      refs,
      seenItem,
      forceResolution
    );
    if (overrideResult !== ignoreOverride) {
      return overrideResult;
    }
  }
  if (seenItem && !forceResolution) {
    const seenSchema = get$ref(seenItem, refs);
    if (seenSchema !== void 0) {
      return seenSchema;
    }
  }
  const newItem = { def, path: refs.currentPath, jsonSchema: void 0 };
  refs.seen.set(def, newItem);
  const jsonSchemaOrGetter = selectParser(def, def.typeName, refs);
  const jsonSchema2 = typeof jsonSchemaOrGetter === "function" ? parseDef(jsonSchemaOrGetter(), refs) : jsonSchemaOrGetter;
  if (jsonSchema2) {
    addMeta(def, refs, jsonSchema2);
  }
  if (refs.postProcess) {
    const postProcessResult = refs.postProcess(jsonSchema2, def, refs);
    newItem.jsonSchema = jsonSchema2;
    return postProcessResult;
  }
  newItem.jsonSchema = jsonSchema2;
  return jsonSchema2;
}
var get$ref = (item, refs) => {
  switch (refs.$refStrategy) {
    case "root":
      return { $ref: item.path.join("/") };
    case "relative":
      return { $ref: getRelativePath(refs.currentPath, item.path) };
    case "none":
    case "seen": {
      if (item.path.length < refs.currentPath.length && item.path.every((value, index) => refs.currentPath[index] === value)) {
        console.warn(
          `Recursive reference detected at ${refs.currentPath.join(
            "/"
          )}! Defaulting to any`
        );
        return parseAnyDef();
      }
      return refs.$refStrategy === "seen" ? parseAnyDef() : void 0;
    }
  }
};
var addMeta = (def, refs, jsonSchema2) => {
  if (def.description) {
    jsonSchema2.description = def.description;
  }
  return jsonSchema2;
};

// src/zod-to-json-schema/refs.ts
var getRefs = (options) => {
  const _options = getDefaultOptions(options);
  const currentPath = _options.name !== void 0 ? [..._options.basePath, _options.definitionPath, _options.name] : _options.basePath;
  return {
    ..._options,
    currentPath,
    propertyPath: void 0,
    seen: new Map(
      Object.entries(_options.definitions).map(([name, def]) => [
        def._def,
        {
          def: def._def,
          path: [..._options.basePath, _options.definitionPath, name],
          // Resolution of references will be forced even though seen, so it's ok that the schema is undefined here for now.
          jsonSchema: void 0
        }
      ])
    )
  };
};

// src/zod-to-json-schema/zod-to-json-schema.ts
var zodToJsonSchema = (schema, options) => {
  var _a;
  const refs = getRefs(options);
  let definitions = typeof options === "object" && options.definitions ? Object.entries(options.definitions).reduce(
    (acc, [name2, schema2]) => {
      var _a2;
      return {
        ...acc,
        [name2]: (_a2 = parseDef(
          schema2._def,
          {
            ...refs,
            currentPath: [...refs.basePath, refs.definitionPath, name2]
          },
          true
        )) != null ? _a2 : parseAnyDef()
      };
    },
    {}
  ) : void 0;
  const name = typeof options === "string" ? options : (options == null ? void 0 : options.nameStrategy) === "title" ? void 0 : options == null ? void 0 : options.name;
  const main = (_a = parseDef(
    schema._def,
    name === void 0 ? refs : {
      ...refs,
      currentPath: [...refs.basePath, refs.definitionPath, name]
    },
    false
  )) != null ? _a : parseAnyDef();
  const title = typeof options === "object" && options.name !== void 0 && options.nameStrategy === "title" ? options.name : void 0;
  if (title !== void 0) {
    main.title = title;
  }
  const combined = name === void 0 ? definitions ? {
    ...main,
    [refs.definitionPath]: definitions
  } : main : {
    $ref: [
      ...refs.$refStrategy === "relative" ? [] : refs.basePath,
      refs.definitionPath,
      name
    ].join("/"),
    [refs.definitionPath]: {
      ...definitions,
      [name]: main
    }
  };
  combined.$schema = "http://json-schema.org/draft-07/schema#";
  return combined;
};

// src/zod-to-json-schema/index.ts
var zod_to_json_schema_default = zodToJsonSchema;

// src/zod-schema.ts
function zod3Schema(zodSchema2, options) {
  var _a;
  const useReferences = (_a = void 0 ) != null ? _a : false;
  return jsonSchema(
    // defer json schema creation to avoid unnecessary computation when only validation is needed
    () => zod_to_json_schema_default(zodSchema2, {
      $refStrategy: useReferences ? "root" : "none"
    }),
    {
      validate: async (value) => {
        const result = await zodSchema2.safeParseAsync(value);
        return result.success ? { success: true, value: result.data } : { success: false, error: result.error };
      }
    }
  );
}
function zod4Schema(zodSchema2, options) {
  var _a;
  const useReferences = (_a = void 0 ) != null ? _a : false;
  return jsonSchema(
    // defer json schema creation to avoid unnecessary computation when only validation is needed
    () => addAdditionalPropertiesToJsonSchema(
      toJSONSchema(zodSchema2, {
        target: "draft-7",
        io: "input",
        reused: useReferences ? "ref" : "inline"
      })
    ),
    {
      validate: async (value) => {
        const result = await safeParseAsync(zodSchema2, value);
        return result.success ? { success: true, value: result.data } : { success: false, error: result.error };
      }
    }
  );
}
function isZod4Schema(zodSchema2) {
  return "_zod" in zodSchema2;
}
function zodSchema(zodSchema2, options) {
  if (isZod4Schema(zodSchema2)) {
    return zod4Schema(zodSchema2);
  } else {
    return zod3Schema(zodSchema2);
  }
}

// src/schema.ts
var schemaSymbol = Symbol.for("vercel.ai.schema");
function jsonSchema(jsonSchema2, {
  validate
} = {}) {
  return {
    [schemaSymbol]: true,
    _type: void 0,
    // should never be used directly
    [validatorSymbol]: true,
    get jsonSchema() {
      if (typeof jsonSchema2 === "function") {
        jsonSchema2 = jsonSchema2();
      }
      return jsonSchema2;
    },
    validate
  };
}
function isSchema(value) {
  return typeof value === "object" && value !== null && schemaSymbol in value && value[schemaSymbol] === true && "jsonSchema" in value && "validate" in value;
}
function asSchema(schema) {
  return schema == null ? jsonSchema({
    properties: {},
    additionalProperties: false
  }) : isSchema(schema) ? schema : typeof schema === "function" ? schema() : zodSchema(schema);
}

// src/uint8-utils.ts
var { btoa, atob } = globalThis;
function convertBase64ToUint8Array(base64String) {
  const base64Url = base64String.replace(/-/g, "+").replace(/_/g, "/");
  const latin1string = atob(base64Url);
  return Uint8Array.from(latin1string, (byte) => byte.codePointAt(0));
}
function convertUint8ArrayToBase64(array) {
  let latin1string = "";
  for (let i = 0; i < array.length; i++) {
    latin1string += String.fromCodePoint(array[i]);
  }
  return btoa(latin1string);
}

// src/without-trailing-slash.ts
function withoutTrailingSlash(url) {
  return url == null ? void 0 : url.replace(/\/$/, "");
}

// src/is-async-iterable.ts
function isAsyncIterable(obj) {
  return obj != null && typeof obj[Symbol.asyncIterator] === "function";
}

// src/types/execute-tool.ts
async function* executeTool({
  execute,
  input,
  options
}) {
  const result = execute(input, options);
  if (isAsyncIterable(result)) {
    let lastOutput;
    for await (const output of result) {
      lastOutput = output;
      yield { type: "preliminary", output };
    }
    yield { type: "final", output: lastOutput };
  } else {
    yield { type: "final", output: await result };
  }
}

var __defProp$4 = Object.defineProperty;
var __getOwnPropDesc$3 = Object.getOwnPropertyDescriptor;
var __getOwnPropNames$3 = Object.getOwnPropertyNames;
var __hasOwnProp$3 = Object.prototype.hasOwnProperty;
var __export$4 = (target, all) => {
  for (var name in all)
    __defProp$4(target, name, { get: all[name], enumerable: true });
};
var __copyProps$3 = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames$3(from))
      if (!__hasOwnProp$3.call(to, key) && key !== except)
        __defProp$4(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc$3(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS$3 = (mod) => __copyProps$3(__defProp$4({}, "__esModule", { value: true }), mod);
var get_context_exports = {};
__export$4(get_context_exports, {
  SYMBOL_FOR_REQ_CONTEXT: () => SYMBOL_FOR_REQ_CONTEXT,
  getContext: () => getContext
});
var getContext_1 = __toCommonJS$3(get_context_exports);
const SYMBOL_FOR_REQ_CONTEXT = Symbol.for("@vercel/request-context");
function getContext() {
  const fromSymbol = globalThis;
  return fromSymbol[SYMBOL_FOR_REQ_CONTEXT]?.get?.() ?? {};
}

var __defProp$3 = Object.defineProperty;
var __getOwnPropDesc$2 = Object.getOwnPropertyDescriptor;
var __getOwnPropNames$2 = Object.getOwnPropertyNames;
var __hasOwnProp$2 = Object.prototype.hasOwnProperty;
var __export$3 = (target, all) => {
  for (var name in all)
    __defProp$3(target, name, { get: all[name], enumerable: true });
};
var __copyProps$2 = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames$2(from))
      if (!__hasOwnProp$2.call(to, key) && key !== except)
        __defProp$3(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc$2(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS$2 = (mod) => __copyProps$2(__defProp$3({}, "__esModule", { value: true }), mod);
var token_error_exports = {};
__export$3(token_error_exports, {
  VercelOidcTokenError: () => VercelOidcTokenError
});
var tokenError = __toCommonJS$2(token_error_exports);
class VercelOidcTokenError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = "VercelOidcTokenError";
    this.cause = cause;
  }
  toString() {
    if (this.cause) {
      return `${this.name}: ${this.message}: ${this.cause}`;
    }
    return `${this.name}: ${this.message}`;
  }
}

var __defProp$2 = Object.defineProperty;
var __getOwnPropDesc$1 = Object.getOwnPropertyDescriptor;
var __getOwnPropNames$1 = Object.getOwnPropertyNames;
var __hasOwnProp$1 = Object.prototype.hasOwnProperty;
var __export$2 = (target, all) => {
  for (var name in all)
    __defProp$2(target, name, { get: all[name], enumerable: true });
};
var __copyProps$1 = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames$1(from))
      if (!__hasOwnProp$1.call(to, key) && key !== except)
        __defProp$2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc$1(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS$1 = (mod) => __copyProps$1(__defProp$2({}, "__esModule", { value: true }), mod);
var get_vercel_oidc_token_exports = {};
__export$2(get_vercel_oidc_token_exports, {
  getVercelOidcToken: () => getVercelOidcToken,
  getVercelOidcTokenSync: () => getVercelOidcTokenSync
});
var getVercelOidcToken_1 = __toCommonJS$1(get_vercel_oidc_token_exports);
var import_get_context$1 = getContext_1;
var import_token_error = tokenError;
async function getVercelOidcToken() {
  let token = "";
  let err;
  try {
    token = getVercelOidcTokenSync();
  } catch (error) {
    err = error;
  }
  try {
    const [{ getTokenPayload, isExpired }, { refreshToken }] = await Promise.all([
      await import('./token-util.mjs').then(function (n) { return n.t; }),
      await import('./token.mjs').then(function (n) { return n.t; })
    ]);
    if (!token || isExpired(getTokenPayload(token))) {
      await refreshToken();
      token = getVercelOidcTokenSync();
    }
  } catch (error) {
    if (err?.message && error instanceof Error) {
      error.message = `${err.message}
${error.message}`;
    }
    throw new import_token_error.VercelOidcTokenError(`Failed to refresh OIDC token`, error);
  }
  return token;
}
function getVercelOidcTokenSync() {
  const token = (0, import_get_context$1.getContext)().headers?.["x-vercel-oidc-token"] ?? process.env.VERCEL_OIDC_TOKEN;
  if (!token) {
    throw new Error(
      `The 'x-vercel-oidc-token' header is missing from the request. Do you have the OIDC option enabled in the Vercel project settings?`
    );
  }
  return token;
}

var __defProp$1 = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export$1 = (target, all) => {
  for (var name in all)
    __defProp$1(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp$1(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp$1({}, "__esModule", { value: true }), mod);
var src_exports = {};
__export$1(src_exports, {
  getContext: () => import_get_context.getContext,
  getVercelOidcToken: () => import_get_vercel_oidc_token.getVercelOidcToken,
  getVercelOidcTokenSync: () => import_get_vercel_oidc_token.getVercelOidcTokenSync
});
var dist = __toCommonJS(src_exports);
var import_get_vercel_oidc_token = getVercelOidcToken_1;
var import_get_context = getContext_1;

// src/gateway-provider.ts

// src/errors/gateway-error.ts
var marker$1 = "vercel.ai.gateway.error";
var symbol$1 = Symbol.for(marker$1);
var _a$1, _b;
var GatewayError = class _GatewayError extends (_b = Error, _a$1 = symbol$1, _b) {
  constructor({
    message,
    statusCode = 500,
    cause
  }) {
    super(message);
    this[_a$1] = true;
    this.statusCode = statusCode;
    this.cause = cause;
  }
  /**
   * Checks if the given error is a Gateway Error.
   * @param {unknown} error - The error to check.
   * @returns {boolean} True if the error is a Gateway Error, false otherwise.
   */
  static isInstance(error) {
    return _GatewayError.hasMarker(error);
  }
  static hasMarker(error) {
    return typeof error === "object" && error !== null && symbol$1 in error && error[symbol$1] === true;
  }
};

// src/errors/gateway-authentication-error.ts
var name$1 = "GatewayAuthenticationError";
var marker2$1 = `vercel.ai.gateway.error.${name$1}`;
var symbol2$1 = Symbol.for(marker2$1);
var _a2$1, _b2;
var GatewayAuthenticationError = class _GatewayAuthenticationError extends (_b2 = GatewayError, _a2$1 = symbol2$1, _b2) {
  constructor({
    message = "Authentication failed",
    statusCode = 401,
    cause
  } = {}) {
    super({ message, statusCode, cause });
    this[_a2$1] = true;
    // used in isInstance
    this.name = name$1;
    this.type = "authentication_error";
  }
  static isInstance(error) {
    return GatewayError.hasMarker(error) && symbol2$1 in error;
  }
  /**
   * Creates a contextual error message when authentication fails
   */
  static createContextualError({
    apiKeyProvided,
    oidcTokenProvided,
    message = "Authentication failed",
    statusCode = 401,
    cause
  }) {
    let contextualMessage;
    if (apiKeyProvided) {
      contextualMessage = `AI Gateway authentication failed: Invalid API key.

Create a new API key: https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai%2Fapi-keys

Provide via 'apiKey' option or 'AI_GATEWAY_API_KEY' environment variable.`;
    } else if (oidcTokenProvided) {
      contextualMessage = `AI Gateway authentication failed: Invalid OIDC token.

Run 'npx vercel link' to link your project, then 'vc env pull' to fetch the token.

Alternatively, use an API key: https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai%2Fapi-keys`;
    } else {
      contextualMessage = `AI Gateway authentication failed: No authentication provided.

Option 1 - API key:
Create an API key: https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai%2Fapi-keys
Provide via 'apiKey' option or 'AI_GATEWAY_API_KEY' environment variable.

Option 2 - OIDC token:
Run 'npx vercel link' to link your project, then 'vc env pull' to fetch the token.`;
    }
    return new _GatewayAuthenticationError({
      message: contextualMessage,
      statusCode,
      cause
    });
  }
};

// src/errors/gateway-invalid-request-error.ts
var name2$1 = "GatewayInvalidRequestError";
var marker3 = `vercel.ai.gateway.error.${name2$1}`;
var symbol3 = Symbol.for(marker3);
var _a3, _b3;
var GatewayInvalidRequestError = class extends (_b3 = GatewayError, _a3 = symbol3, _b3) {
  constructor({
    message = "Invalid request",
    statusCode = 400,
    cause
  } = {}) {
    super({ message, statusCode, cause });
    this[_a3] = true;
    // used in isInstance
    this.name = name2$1;
    this.type = "invalid_request_error";
  }
  static isInstance(error) {
    return GatewayError.hasMarker(error) && symbol3 in error;
  }
};

// src/errors/gateway-rate-limit-error.ts
var name3 = "GatewayRateLimitError";
var marker4$1 = `vercel.ai.gateway.error.${name3}`;
var symbol4$1 = Symbol.for(marker4$1);
var _a4$1, _b4;
var GatewayRateLimitError = class extends (_b4 = GatewayError, _a4$1 = symbol4$1, _b4) {
  constructor({
    message = "Rate limit exceeded",
    statusCode = 429,
    cause
  } = {}) {
    super({ message, statusCode, cause });
    this[_a4$1] = true;
    // used in isInstance
    this.name = name3;
    this.type = "rate_limit_exceeded";
  }
  static isInstance(error) {
    return GatewayError.hasMarker(error) && symbol4$1 in error;
  }
};
var name4$1 = "GatewayModelNotFoundError";
var marker5 = `vercel.ai.gateway.error.${name4$1}`;
var symbol5 = Symbol.for(marker5);
var modelNotFoundParamSchema = lazyValidator(
  () => zodSchema(
    object$1({
      modelId: string()
    })
  )
);
var _a5, _b5;
var GatewayModelNotFoundError = class extends (_b5 = GatewayError, _a5 = symbol5, _b5) {
  constructor({
    message = "Model not found",
    statusCode = 404,
    modelId,
    cause
  } = {}) {
    super({ message, statusCode, cause });
    this[_a5] = true;
    // used in isInstance
    this.name = name4$1;
    this.type = "model_not_found";
    this.modelId = modelId;
  }
  static isInstance(error) {
    return GatewayError.hasMarker(error) && symbol5 in error;
  }
};

// src/errors/gateway-internal-server-error.ts
var name5 = "GatewayInternalServerError";
var marker6$1 = `vercel.ai.gateway.error.${name5}`;
var symbol6$1 = Symbol.for(marker6$1);
var _a6$1, _b6;
var GatewayInternalServerError = class extends (_b6 = GatewayError, _a6$1 = symbol6$1, _b6) {
  constructor({
    message = "Internal server error",
    statusCode = 500,
    cause
  } = {}) {
    super({ message, statusCode, cause });
    this[_a6$1] = true;
    // used in isInstance
    this.name = name5;
    this.type = "internal_server_error";
  }
  static isInstance(error) {
    return GatewayError.hasMarker(error) && symbol6$1 in error;
  }
};

// src/errors/gateway-response-error.ts
var name6$1 = "GatewayResponseError";
var marker7$1 = `vercel.ai.gateway.error.${name6$1}`;
var symbol7$1 = Symbol.for(marker7$1);
var _a7$1, _b7;
var GatewayResponseError = class extends (_b7 = GatewayError, _a7$1 = symbol7$1, _b7) {
  constructor({
    message = "Invalid response from Gateway",
    statusCode = 502,
    response,
    validationError,
    cause
  } = {}) {
    super({ message, statusCode, cause });
    this[_a7$1] = true;
    // used in isInstance
    this.name = name6$1;
    this.type = "response_error";
    this.response = response;
    this.validationError = validationError;
  }
  static isInstance(error) {
    return GatewayError.hasMarker(error) && symbol7$1 in error;
  }
};
async function createGatewayErrorFromResponse({
  response,
  statusCode,
  defaultMessage = "Gateway request failed",
  cause,
  authMethod
}) {
  const parseResult = await safeValidateTypes({
    value: response,
    schema: gatewayErrorResponseSchema
  });
  if (!parseResult.success) {
    return new GatewayResponseError({
      message: `Invalid error response format: ${defaultMessage}`,
      statusCode,
      response,
      validationError: parseResult.error,
      cause
    });
  }
  const validatedResponse = parseResult.value;
  const errorType = validatedResponse.error.type;
  const message = validatedResponse.error.message;
  switch (errorType) {
    case "authentication_error":
      return GatewayAuthenticationError.createContextualError({
        apiKeyProvided: authMethod === "api-key",
        oidcTokenProvided: authMethod === "oidc",
        statusCode,
        cause
      });
    case "invalid_request_error":
      return new GatewayInvalidRequestError({ message, statusCode, cause });
    case "rate_limit_exceeded":
      return new GatewayRateLimitError({ message, statusCode, cause });
    case "model_not_found": {
      const modelResult = await safeValidateTypes({
        value: validatedResponse.error.param,
        schema: modelNotFoundParamSchema
      });
      return new GatewayModelNotFoundError({
        message,
        statusCode,
        modelId: modelResult.success ? modelResult.value.modelId : void 0,
        cause
      });
    }
    case "internal_server_error":
      return new GatewayInternalServerError({ message, statusCode, cause });
    default:
      return new GatewayInternalServerError({ message, statusCode, cause });
  }
}
var gatewayErrorResponseSchema = lazyValidator(
  () => zodSchema(
    object$1({
      error: object$1({
        message: string(),
        type: string().nullish(),
        param: unknown().nullish(),
        code: union([string(), number()]).nullish()
      })
    })
  )
);

// src/errors/as-gateway-error.ts
function asGatewayError(error, authMethod) {
  var _a8;
  if (GatewayError.isInstance(error)) {
    return error;
  }
  if (APICallError.isInstance(error)) {
    return createGatewayErrorFromResponse({
      response: extractApiCallResponse(error),
      statusCode: (_a8 = error.statusCode) != null ? _a8 : 500,
      defaultMessage: "Gateway request failed",
      cause: error,
      authMethod
    });
  }
  return createGatewayErrorFromResponse({
    response: {},
    statusCode: 500,
    defaultMessage: error instanceof Error ? `Gateway request failed: ${error.message}` : "Unknown Gateway error",
    cause: error,
    authMethod
  });
}

// src/errors/extract-api-call-response.ts
function extractApiCallResponse(error) {
  if (error.data !== void 0) {
    return error.data;
  }
  if (error.responseBody != null) {
    try {
      return JSON.parse(error.responseBody);
    } catch (e) {
      return error.responseBody;
    }
  }
  return {};
}
var GATEWAY_AUTH_METHOD_HEADER = "ai-gateway-auth-method";
async function parseAuthMethod(headers) {
  const result = await safeValidateTypes({
    value: headers[GATEWAY_AUTH_METHOD_HEADER],
    schema: gatewayAuthMethodSchema
  });
  return result.success ? result.value : void 0;
}
var gatewayAuthMethodSchema = lazyValidator(
  () => zodSchema(union([literal("api-key"), literal("oidc")]))
);
var GatewayFetchMetadata = class {
  constructor(config) {
    this.config = config;
  }
  async getAvailableModels() {
    try {
      const { value } = await getFromApi({
        url: `${this.config.baseURL}/config`,
        headers: await resolve(this.config.headers()),
        successfulResponseHandler: createJsonResponseHandler(
          gatewayAvailableModelsResponseSchema
        ),
        failedResponseHandler: createJsonErrorResponseHandler({
          errorSchema: any(),
          errorToMessage: (data) => data
        }),
        fetch: this.config.fetch
      });
      return value;
    } catch (error) {
      throw await asGatewayError(error);
    }
  }
  async getCredits() {
    try {
      const baseUrl = new URL(this.config.baseURL);
      const { value } = await getFromApi({
        url: `${baseUrl.origin}/v1/credits`,
        headers: await resolve(this.config.headers()),
        successfulResponseHandler: createJsonResponseHandler(
          gatewayCreditsResponseSchema
        ),
        failedResponseHandler: createJsonErrorResponseHandler({
          errorSchema: any(),
          errorToMessage: (data) => data
        }),
        fetch: this.config.fetch
      });
      return value;
    } catch (error) {
      throw await asGatewayError(error);
    }
  }
};
var gatewayAvailableModelsResponseSchema = lazyValidator(
  () => zodSchema(
    object$1({
      models: array(
        object$1({
          id: string(),
          name: string(),
          description: string().nullish(),
          pricing: object$1({
            input: string(),
            output: string(),
            input_cache_read: string().nullish(),
            input_cache_write: string().nullish()
          }).transform(
            ({ input, output, input_cache_read, input_cache_write }) => ({
              input,
              output,
              ...input_cache_read ? { cachedInputTokens: input_cache_read } : {},
              ...input_cache_write ? { cacheCreationInputTokens: input_cache_write } : {}
            })
          ).nullish(),
          specification: object$1({
            specificationVersion: literal("v2"),
            provider: string(),
            modelId: string()
          }),
          modelType: _enum(["language", "embedding", "image"]).nullish()
        })
      )
    })
  )
);
var gatewayCreditsResponseSchema = lazyValidator(
  () => zodSchema(
    object$1({
      balance: string(),
      total_used: string()
    }).transform(({ balance, total_used }) => ({
      balance,
      totalUsed: total_used
    }))
  )
);
var GatewayLanguageModel = class {
  constructor(modelId, config) {
    this.modelId = modelId;
    this.config = config;
    this.specificationVersion = "v2";
    this.supportedUrls = { "*/*": [/.*/] };
  }
  get provider() {
    return this.config.provider;
  }
  async getArgs(options) {
    const { abortSignal: _abortSignal, ...optionsWithoutSignal } = options;
    return {
      args: this.maybeEncodeFileParts(optionsWithoutSignal),
      warnings: []
    };
  }
  async doGenerate(options) {
    const { args, warnings } = await this.getArgs(options);
    const { abortSignal } = options;
    const resolvedHeaders = await resolve(this.config.headers());
    try {
      const {
        responseHeaders,
        value: responseBody,
        rawValue: rawResponse
      } = await postJsonToApi({
        url: this.getUrl(),
        headers: combineHeaders(
          resolvedHeaders,
          options.headers,
          this.getModelConfigHeaders(this.modelId, false),
          await resolve(this.config.o11yHeaders)
        ),
        body: args,
        successfulResponseHandler: createJsonResponseHandler(any()),
        failedResponseHandler: createJsonErrorResponseHandler({
          errorSchema: any(),
          errorToMessage: (data) => data
        }),
        ...abortSignal && { abortSignal },
        fetch: this.config.fetch
      });
      return {
        ...responseBody,
        request: { body: args },
        response: { headers: responseHeaders, body: rawResponse },
        warnings
      };
    } catch (error) {
      throw await asGatewayError(error, await parseAuthMethod(resolvedHeaders));
    }
  }
  async doStream(options) {
    const { args, warnings } = await this.getArgs(options);
    const { abortSignal } = options;
    const resolvedHeaders = await resolve(this.config.headers());
    try {
      const { value: response, responseHeaders } = await postJsonToApi({
        url: this.getUrl(),
        headers: combineHeaders(
          resolvedHeaders,
          options.headers,
          this.getModelConfigHeaders(this.modelId, true),
          await resolve(this.config.o11yHeaders)
        ),
        body: args,
        successfulResponseHandler: createEventSourceResponseHandler(any()),
        failedResponseHandler: createJsonErrorResponseHandler({
          errorSchema: any(),
          errorToMessage: (data) => data
        }),
        ...abortSignal && { abortSignal },
        fetch: this.config.fetch
      });
      return {
        stream: response.pipeThrough(
          new TransformStream({
            start(controller) {
              if (warnings.length > 0) {
                controller.enqueue({ type: "stream-start", warnings });
              }
            },
            transform(chunk, controller) {
              if (chunk.success) {
                const streamPart = chunk.value;
                if (streamPart.type === "raw" && !options.includeRawChunks) {
                  return;
                }
                if (streamPart.type === "response-metadata" && streamPart.timestamp && typeof streamPart.timestamp === "string") {
                  streamPart.timestamp = new Date(streamPart.timestamp);
                }
                controller.enqueue(streamPart);
              } else {
                controller.error(
                  chunk.error
                );
              }
            }
          })
        ),
        request: { body: args },
        response: { headers: responseHeaders }
      };
    } catch (error) {
      throw await asGatewayError(error, await parseAuthMethod(resolvedHeaders));
    }
  }
  isFilePart(part) {
    return part && typeof part === "object" && "type" in part && part.type === "file";
  }
  /**
   * Encodes file parts in the prompt to base64. Mutates the passed options
   * instance directly to avoid copying the file data.
   * @param options - The options to encode.
   * @returns The options with the file parts encoded.
   */
  maybeEncodeFileParts(options) {
    for (const message of options.prompt) {
      for (const part of message.content) {
        if (this.isFilePart(part)) {
          const filePart = part;
          if (filePart.data instanceof Uint8Array) {
            const buffer = Uint8Array.from(filePart.data);
            const base64Data = Buffer.from(buffer).toString("base64");
            filePart.data = new URL(
              `data:${filePart.mediaType || "application/octet-stream"};base64,${base64Data}`
            );
          }
        }
      }
    }
    return options;
  }
  getUrl() {
    return `${this.config.baseURL}/language-model`;
  }
  getModelConfigHeaders(modelId, streaming) {
    return {
      "ai-language-model-specification-version": "2",
      "ai-language-model-id": modelId,
      "ai-language-model-streaming": String(streaming)
    };
  }
};
var GatewayEmbeddingModel = class {
  constructor(modelId, config) {
    this.modelId = modelId;
    this.config = config;
    this.specificationVersion = "v2";
    this.maxEmbeddingsPerCall = 2048;
    this.supportsParallelCalls = true;
  }
  get provider() {
    return this.config.provider;
  }
  async doEmbed({
    values,
    headers,
    abortSignal,
    providerOptions
  }) {
    var _a8;
    const resolvedHeaders = await resolve(this.config.headers());
    try {
      const {
        responseHeaders,
        value: responseBody,
        rawValue
      } = await postJsonToApi({
        url: this.getUrl(),
        headers: combineHeaders(
          resolvedHeaders,
          headers != null ? headers : {},
          this.getModelConfigHeaders(),
          await resolve(this.config.o11yHeaders)
        ),
        body: {
          input: values.length === 1 ? values[0] : values,
          ...providerOptions ? { providerOptions } : {}
        },
        successfulResponseHandler: createJsonResponseHandler(
          gatewayEmbeddingResponseSchema
        ),
        failedResponseHandler: createJsonErrorResponseHandler({
          errorSchema: any(),
          errorToMessage: (data) => data
        }),
        ...abortSignal && { abortSignal },
        fetch: this.config.fetch
      });
      return {
        embeddings: responseBody.embeddings,
        usage: (_a8 = responseBody.usage) != null ? _a8 : void 0,
        providerMetadata: responseBody.providerMetadata,
        response: { headers: responseHeaders, body: rawValue }
      };
    } catch (error) {
      throw await asGatewayError(error, await parseAuthMethod(resolvedHeaders));
    }
  }
  getUrl() {
    return `${this.config.baseURL}/embedding-model`;
  }
  getModelConfigHeaders() {
    return {
      "ai-embedding-model-specification-version": "2",
      "ai-model-id": this.modelId
    };
  }
};
var gatewayEmbeddingResponseSchema = lazyValidator(
  () => zodSchema(
    object$1({
      embeddings: array(array(number())),
      usage: object$1({ tokens: number() }).nullish(),
      providerMetadata: record(string(), record(string(), unknown())).optional()
    })
  )
);
var GatewayImageModel = class {
  constructor(modelId, config) {
    this.modelId = modelId;
    this.config = config;
    this.specificationVersion = "v2";
    // Set a very large number to prevent client-side splitting of requests
    this.maxImagesPerCall = Number.MAX_SAFE_INTEGER;
  }
  get provider() {
    return this.config.provider;
  }
  async doGenerate({
    prompt,
    n,
    size,
    aspectRatio,
    seed,
    providerOptions,
    headers,
    abortSignal
  }) {
    var _a8;
    const resolvedHeaders = await resolve(this.config.headers());
    try {
      const {
        responseHeaders,
        value: responseBody} = await postJsonToApi({
        url: this.getUrl(),
        headers: combineHeaders(
          resolvedHeaders,
          headers != null ? headers : {},
          this.getModelConfigHeaders(),
          await resolve(this.config.o11yHeaders)
        ),
        body: {
          prompt,
          n,
          ...size && { size },
          ...aspectRatio && { aspectRatio },
          ...seed && { seed },
          ...providerOptions && { providerOptions }
        },
        successfulResponseHandler: createJsonResponseHandler(
          gatewayImageResponseSchema
        ),
        failedResponseHandler: createJsonErrorResponseHandler({
          errorSchema: any(),
          errorToMessage: (data) => data
        }),
        ...abortSignal && { abortSignal },
        fetch: this.config.fetch
      });
      return {
        images: responseBody.images,
        // Always base64 strings from server
        warnings: (_a8 = responseBody.warnings) != null ? _a8 : [],
        providerMetadata: responseBody.providerMetadata,
        response: {
          timestamp: /* @__PURE__ */ new Date(),
          modelId: this.modelId,
          headers: responseHeaders
        }
      };
    } catch (error) {
      throw asGatewayError(error, await parseAuthMethod(resolvedHeaders));
    }
  }
  getUrl() {
    return `${this.config.baseURL}/image-model`;
  }
  getModelConfigHeaders() {
    return {
      "ai-image-model-specification-version": "2",
      "ai-model-id": this.modelId
    };
  }
};
var providerMetadataEntrySchema = object$1({
  images: array(unknown()).optional()
}).catchall(unknown());
var gatewayImageResponseSchema = object$1({
  images: array(string()),
  // Always base64 strings over the wire
  warnings: array(
    object$1({
      type: literal("other"),
      message: string()
    })
  ).optional(),
  providerMetadata: record(string(), providerMetadataEntrySchema).optional()
});
async function getVercelRequestId() {
  var _a8;
  return (_a8 = dist.getContext().headers) == null ? void 0 : _a8["x-vercel-id"];
}

// src/version.ts
var VERSION$1 = "2.0.21" ;

// src/gateway-provider.ts
var AI_GATEWAY_PROTOCOL_VERSION = "0.0.1";
function createGatewayProvider(options = {}) {
  var _a8, _b8;
  let pendingMetadata = null;
  let metadataCache = null;
  const cacheRefreshMillis = (_a8 = options.metadataCacheRefreshMillis) != null ? _a8 : 1e3 * 60 * 5;
  let lastFetchTime = 0;
  const baseURL = (_b8 = withoutTrailingSlash(options.baseURL)) != null ? _b8 : "https://ai-gateway.vercel.sh/v1/ai";
  const getHeaders = async () => {
    const auth = await getGatewayAuthToken(options);
    if (auth) {
      return withUserAgentSuffix(
        {
          Authorization: `Bearer ${auth.token}`,
          "ai-gateway-protocol-version": AI_GATEWAY_PROTOCOL_VERSION,
          [GATEWAY_AUTH_METHOD_HEADER]: auth.authMethod,
          ...options.headers
        },
        `ai-sdk/gateway/${VERSION$1}`
      );
    }
    throw GatewayAuthenticationError.createContextualError({
      apiKeyProvided: false,
      oidcTokenProvided: false,
      statusCode: 401
    });
  };
  const createO11yHeaders = () => {
    const deploymentId = loadOptionalSetting({
      settingValue: void 0,
      environmentVariableName: "VERCEL_DEPLOYMENT_ID"
    });
    const environment = loadOptionalSetting({
      settingValue: void 0,
      environmentVariableName: "VERCEL_ENV"
    });
    const region = loadOptionalSetting({
      settingValue: void 0,
      environmentVariableName: "VERCEL_REGION"
    });
    return async () => {
      const requestId = await getVercelRequestId();
      return {
        ...deploymentId && { "ai-o11y-deployment-id": deploymentId },
        ...environment && { "ai-o11y-environment": environment },
        ...region && { "ai-o11y-region": region },
        ...requestId && { "ai-o11y-request-id": requestId }
      };
    };
  };
  const createLanguageModel = (modelId) => {
    return new GatewayLanguageModel(modelId, {
      provider: "gateway",
      baseURL,
      headers: getHeaders,
      fetch: options.fetch,
      o11yHeaders: createO11yHeaders()
    });
  };
  const getAvailableModels = async () => {
    var _a9, _b9, _c;
    const now = (_c = (_b9 = (_a9 = options._internal) == null ? void 0 : _a9.currentDate) == null ? void 0 : _b9.call(_a9).getTime()) != null ? _c : Date.now();
    if (!pendingMetadata || now - lastFetchTime > cacheRefreshMillis) {
      lastFetchTime = now;
      pendingMetadata = new GatewayFetchMetadata({
        baseURL,
        headers: getHeaders,
        fetch: options.fetch
      }).getAvailableModels().then((metadata) => {
        metadataCache = metadata;
        return metadata;
      }).catch(async (error) => {
        throw await asGatewayError(
          error,
          await parseAuthMethod(await getHeaders())
        );
      });
    }
    return metadataCache ? Promise.resolve(metadataCache) : pendingMetadata;
  };
  const getCredits = async () => {
    return new GatewayFetchMetadata({
      baseURL,
      headers: getHeaders,
      fetch: options.fetch
    }).getCredits().catch(async (error) => {
      throw await asGatewayError(
        error,
        await parseAuthMethod(await getHeaders())
      );
    });
  };
  const provider = function(modelId) {
    if (new.target) {
      throw new Error(
        "The Gateway Provider model function cannot be called with the new keyword."
      );
    }
    return createLanguageModel(modelId);
  };
  provider.getAvailableModels = getAvailableModels;
  provider.getCredits = getCredits;
  provider.imageModel = (modelId) => {
    return new GatewayImageModel(modelId, {
      provider: "gateway",
      baseURL,
      headers: getHeaders,
      fetch: options.fetch,
      o11yHeaders: createO11yHeaders()
    });
  };
  provider.languageModel = createLanguageModel;
  provider.textEmbeddingModel = (modelId) => {
    return new GatewayEmbeddingModel(modelId, {
      provider: "gateway",
      baseURL,
      headers: getHeaders,
      fetch: options.fetch,
      o11yHeaders: createO11yHeaders()
    });
  };
  return provider;
}
var gateway = createGatewayProvider();
async function getGatewayAuthToken(options) {
  const apiKey = loadOptionalSetting({
    settingValue: options.apiKey,
    environmentVariableName: "AI_GATEWAY_API_KEY"
  });
  if (apiKey) {
    return {
      token: apiKey,
      authMethod: "api-key"
    };
  }
  try {
    const oidcToken = await dist.getVercelOidcToken();
    return {
      token: oidcToken,
      authMethod: "oidc"
    };
  } catch (e) {
    return null;
  }
}

var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name16 in all)
    __defProp(target, name16, { get: all[name16], enumerable: true });
};
var name = "AI_NoOutputSpecifiedError";
var marker = `vercel.ai.error.${name}`;
var symbol = Symbol.for(marker);
var _a;
var NoOutputSpecifiedError = class extends AISDKError {
  // used in isInstance
  constructor({ message = "No output specified." } = {}) {
    super({ name, message });
    this[_a] = true;
  }
  static isInstance(error) {
    return AISDKError.hasMarker(error, marker);
  }
};
_a = symbol;

// src/logger/log-warnings.ts
function formatWarning(warning) {
  const prefix = "AI SDK Warning:";
  switch (warning.type) {
    case "unsupported-setting": {
      let message = `${prefix} The "${warning.setting}" setting is not supported by this model`;
      if (warning.details) {
        message += ` - ${warning.details}`;
      }
      return message;
    }
    case "unsupported-tool": {
      const toolName = "name" in warning.tool ? warning.tool.name : "unknown tool";
      let message = `${prefix} The tool "${toolName}" is not supported by this model`;
      if (warning.details) {
        message += ` - ${warning.details}`;
      }
      return message;
    }
    case "other": {
      return `${prefix} ${warning.message}`;
    }
    default: {
      return `${prefix} ${JSON.stringify(warning, null, 2)}`;
    }
  }
}
var FIRST_WARNING_INFO_MESSAGE = "AI SDK Warning System: To turn off warning logging, set the AI_SDK_LOG_WARNINGS global to false.";
var hasLoggedBefore = false;
var logWarnings = (warnings) => {
  if (warnings.length === 0) {
    return;
  }
  const logger = globalThis.AI_SDK_LOG_WARNINGS;
  if (logger === false) {
    return;
  }
  if (typeof logger === "function") {
    logger(warnings);
    return;
  }
  if (!hasLoggedBefore) {
    hasLoggedBefore = true;
    console.info(FIRST_WARNING_INFO_MESSAGE);
  }
  for (const warning of warnings) {
    console.warn(formatWarning(warning));
  }
};
var name2 = "AI_InvalidArgumentError";
var marker2 = `vercel.ai.error.${name2}`;
var symbol2 = Symbol.for(marker2);
var _a2;
var InvalidArgumentError = class extends AISDKError {
  constructor({
    parameter,
    value,
    message
  }) {
    super({
      name: name2,
      message: `Invalid argument for parameter ${parameter}: ${message}`
    });
    this[_a2] = true;
    this.parameter = parameter;
    this.value = value;
  }
  static isInstance(error) {
    return AISDKError.hasMarker(error, marker2);
  }
};
_a2 = symbol2;
var name4 = "AI_InvalidToolInputError";
var marker4 = `vercel.ai.error.${name4}`;
var symbol4 = Symbol.for(marker4);
var _a4;
var InvalidToolInputError = class extends AISDKError {
  constructor({
    toolInput,
    toolName,
    cause,
    message = `Invalid input for tool ${toolName}: ${getErrorMessage$1(cause)}`
  }) {
    super({ name: name4, message, cause });
    this[_a4] = true;
    this.toolInput = toolInput;
    this.toolName = toolName;
  }
  static isInstance(error) {
    return AISDKError.hasMarker(error, marker4);
  }
};
_a4 = symbol4;
var name6 = "AI_NoObjectGeneratedError";
var marker6 = `vercel.ai.error.${name6}`;
var symbol6 = Symbol.for(marker6);
var _a6;
var NoObjectGeneratedError = class extends AISDKError {
  constructor({
    message = "No object generated.",
    cause,
    text: text2,
    response,
    usage,
    finishReason
  }) {
    super({ name: name6, message, cause });
    this[_a6] = true;
    this.text = text2;
    this.response = response;
    this.usage = usage;
    this.finishReason = finishReason;
  }
  static isInstance(error) {
    return AISDKError.hasMarker(error, marker6);
  }
};
_a6 = symbol6;
var name7 = "AI_NoOutputGeneratedError";
var marker7 = `vercel.ai.error.${name7}`;
var symbol7 = Symbol.for(marker7);
var _a7;
var NoOutputGeneratedError = class extends AISDKError {
  // used in isInstance
  constructor({
    message = "No output generated.",
    cause
  } = {}) {
    super({ name: name7, message, cause });
    this[_a7] = true;
  }
  static isInstance(error) {
    return AISDKError.hasMarker(error, marker7);
  }
};
_a7 = symbol7;
var name8 = "AI_NoSuchToolError";
var marker8 = `vercel.ai.error.${name8}`;
var symbol8 = Symbol.for(marker8);
var _a8;
var NoSuchToolError = class extends AISDKError {
  constructor({
    toolName,
    availableTools = void 0,
    message = `Model tried to call unavailable tool '${toolName}'. ${availableTools === void 0 ? "No tools are available." : `Available tools: ${availableTools.join(", ")}.`}`
  }) {
    super({ name: name8, message });
    this[_a8] = true;
    this.toolName = toolName;
    this.availableTools = availableTools;
  }
  static isInstance(error) {
    return AISDKError.hasMarker(error, marker8);
  }
};
_a8 = symbol8;
var name9 = "AI_ToolCallRepairError";
var marker9 = `vercel.ai.error.${name9}`;
var symbol9 = Symbol.for(marker9);
var _a9;
var ToolCallRepairError = class extends AISDKError {
  constructor({
    cause,
    originalError,
    message = `Error repairing tool call: ${getErrorMessage$1(cause)}`
  }) {
    super({ name: name9, message, cause });
    this[_a9] = true;
    this.originalError = originalError;
  }
  static isInstance(error) {
    return AISDKError.hasMarker(error, marker9);
  }
};
_a9 = symbol9;
var UnsupportedModelVersionError = class extends AISDKError {
  constructor(options) {
    super({
      name: "AI_UnsupportedModelVersionError",
      message: `Unsupported model version ${options.version} for provider "${options.provider}" and model "${options.modelId}". AI SDK 5 only supports models that implement specification version "v2".`
    });
    this.version = options.version;
    this.provider = options.provider;
    this.modelId = options.modelId;
  }
};
var name11 = "AI_InvalidMessageRoleError";
var marker11 = `vercel.ai.error.${name11}`;
var symbol11 = Symbol.for(marker11);
var _a11;
var InvalidMessageRoleError = class extends AISDKError {
  constructor({
    role,
    message = `Invalid message role: '${role}'. Must be one of: "system", "user", "assistant", "tool".`
  }) {
    super({ name: name11, message });
    this[_a11] = true;
    this.role = role;
  }
  static isInstance(error) {
    return AISDKError.hasMarker(error, marker11);
  }
};
_a11 = symbol11;
var name13 = "AI_DownloadError";
var marker13 = `vercel.ai.error.${name13}`;
var symbol13 = Symbol.for(marker13);
var _a13;
var DownloadError = class extends AISDKError {
  constructor({
    url,
    statusCode,
    statusText,
    cause,
    message = cause == null ? `Failed to download ${url}: ${statusCode} ${statusText}` : `Failed to download ${url}: ${cause}`
  }) {
    super({ name: name13, message, cause });
    this[_a13] = true;
    this.url = url;
    this.statusCode = statusCode;
    this.statusText = statusText;
  }
  static isInstance(error) {
    return AISDKError.hasMarker(error, marker13);
  }
};
_a13 = symbol13;
var name14 = "AI_RetryError";
var marker14 = `vercel.ai.error.${name14}`;
var symbol14 = Symbol.for(marker14);
var _a14;
var RetryError = class extends AISDKError {
  constructor({
    message,
    reason,
    errors
  }) {
    super({ name: name14, message });
    this[_a14] = true;
    this.reason = reason;
    this.errors = errors;
    this.lastError = errors[errors.length - 1];
  }
  static isInstance(error) {
    return AISDKError.hasMarker(error, marker14);
  }
};
_a14 = symbol14;

// src/model/resolve-model.ts
function resolveLanguageModel(model) {
  if (typeof model !== "string") {
    if (model.specificationVersion !== "v2") {
      throw new UnsupportedModelVersionError({
        version: model.specificationVersion,
        provider: model.provider,
        modelId: model.modelId
      });
    }
    return model;
  }
  return getGlobalProvider().languageModel(model);
}
function getGlobalProvider() {
  var _a16;
  return (_a16 = globalThis.AI_SDK_DEFAULT_PROVIDER) != null ? _a16 : gateway;
}
var imageMediaTypeSignatures = [
  {
    mediaType: "image/gif",
    bytesPrefix: [71, 73, 70]
    // GIF
  },
  {
    mediaType: "image/png",
    bytesPrefix: [137, 80, 78, 71]
    // PNG
  },
  {
    mediaType: "image/jpeg",
    bytesPrefix: [255, 216]
    // JPEG
  },
  {
    mediaType: "image/webp",
    bytesPrefix: [
      82,
      73,
      70,
      70,
      // "RIFF"
      null,
      null,
      null,
      null,
      // file size (variable)
      87,
      69,
      66,
      80
      // "WEBP"
    ]
  },
  {
    mediaType: "image/bmp",
    bytesPrefix: [66, 77]
  },
  {
    mediaType: "image/tiff",
    bytesPrefix: [73, 73, 42, 0]
  },
  {
    mediaType: "image/tiff",
    bytesPrefix: [77, 77, 0, 42]
  },
  {
    mediaType: "image/avif",
    bytesPrefix: [
      0,
      0,
      0,
      32,
      102,
      116,
      121,
      112,
      97,
      118,
      105,
      102
    ]
  },
  {
    mediaType: "image/heic",
    bytesPrefix: [
      0,
      0,
      0,
      32,
      102,
      116,
      121,
      112,
      104,
      101,
      105,
      99
    ]
  }
];
var stripID3 = (data) => {
  const bytes = typeof data === "string" ? convertBase64ToUint8Array(data) : data;
  const id3Size = (bytes[6] & 127) << 21 | (bytes[7] & 127) << 14 | (bytes[8] & 127) << 7 | bytes[9] & 127;
  return bytes.slice(id3Size + 10);
};
function stripID3TagsIfPresent(data) {
  const hasId3 = typeof data === "string" && data.startsWith("SUQz") || typeof data !== "string" && data.length > 10 && data[0] === 73 && // 'I'
  data[1] === 68 && // 'D'
  data[2] === 51;
  return hasId3 ? stripID3(data) : data;
}
function detectMediaType({
  data,
  signatures
}) {
  const processedData = stripID3TagsIfPresent(data);
  const bytes = typeof processedData === "string" ? convertBase64ToUint8Array(
    processedData.substring(0, Math.min(processedData.length, 24))
  ) : processedData;
  for (const signature of signatures) {
    if (bytes.length >= signature.bytesPrefix.length && signature.bytesPrefix.every(
      (byte, index) => byte === null || bytes[index] === byte
    )) {
      return signature.mediaType;
    }
  }
  return void 0;
}

// src/version.ts
var VERSION = "5.0.114" ;

// src/util/download/download.ts
var download = async ({ url }) => {
  var _a16;
  const urlText = url.toString();
  try {
    const response = await fetch(urlText, {
      headers: withUserAgentSuffix(
        {},
        `ai-sdk/${VERSION}`,
        getRuntimeEnvironmentUserAgent()
      )
    });
    if (!response.ok) {
      throw new DownloadError({
        url: urlText,
        statusCode: response.status,
        statusText: response.statusText
      });
    }
    return {
      data: new Uint8Array(await response.arrayBuffer()),
      mediaType: (_a16 = response.headers.get("content-type")) != null ? _a16 : void 0
    };
  } catch (error) {
    if (DownloadError.isInstance(error)) {
      throw error;
    }
    throw new DownloadError({ url: urlText, cause: error });
  }
};

// src/util/download/download-function.ts
var createDefaultDownloadFunction = (download2 = download) => (requestedDownloads) => Promise.all(
  requestedDownloads.map(
    async (requestedDownload) => requestedDownload.isUrlSupportedByModel ? null : download2(requestedDownload)
  )
);

// src/prompt/split-data-url.ts
function splitDataUrl(dataUrl) {
  try {
    const [header, base64Content] = dataUrl.split(",");
    return {
      mediaType: header.split(";")[0].split(":")[1],
      base64Content
    };
  } catch (error) {
    return {
      mediaType: void 0,
      base64Content: void 0
    };
  }
}

// src/prompt/data-content.ts
var dataContentSchema = union([
  string(),
  _instanceof(Uint8Array),
  _instanceof(ArrayBuffer),
  custom(
    // Buffer might not be available in some environments such as CloudFlare:
    (value) => {
      var _a16, _b;
      return (_b = (_a16 = globalThis.Buffer) == null ? void 0 : _a16.isBuffer(value)) != null ? _b : false;
    },
    { message: "Must be a Buffer" }
  )
]);
function convertToLanguageModelV2DataContent(content) {
  if (content instanceof Uint8Array) {
    return { data: content, mediaType: void 0 };
  }
  if (content instanceof ArrayBuffer) {
    return { data: new Uint8Array(content), mediaType: void 0 };
  }
  if (typeof content === "string") {
    try {
      content = new URL(content);
    } catch (error) {
    }
  }
  if (content instanceof URL && content.protocol === "data:") {
    const { mediaType: dataUrlMediaType, base64Content } = splitDataUrl(
      content.toString()
    );
    if (dataUrlMediaType == null || base64Content == null) {
      throw new AISDKError({
        name: "InvalidDataContentError",
        message: `Invalid data URL format in content ${content.toString()}`
      });
    }
    return { data: base64Content, mediaType: dataUrlMediaType };
  }
  return { data: content, mediaType: void 0 };
}
function convertDataContentToBase64String(content) {
  if (typeof content === "string") {
    return content;
  }
  if (content instanceof ArrayBuffer) {
    return convertUint8ArrayToBase64(new Uint8Array(content));
  }
  return convertUint8ArrayToBase64(content);
}

// src/prompt/convert-to-language-model-prompt.ts
async function convertToLanguageModelPrompt({
  prompt,
  supportedUrls,
  download: download2 = createDefaultDownloadFunction()
}) {
  const downloadedAssets = await downloadAssets(
    prompt.messages,
    download2,
    supportedUrls
  );
  return [
    ...prompt.system != null ? [{ role: "system", content: prompt.system }] : [],
    ...prompt.messages.map(
      (message) => convertToLanguageModelMessage({ message, downloadedAssets })
    )
  ];
}
function convertToLanguageModelMessage({
  message,
  downloadedAssets
}) {
  const role = message.role;
  switch (role) {
    case "system": {
      return {
        role: "system",
        content: message.content,
        providerOptions: message.providerOptions
      };
    }
    case "user": {
      if (typeof message.content === "string") {
        return {
          role: "user",
          content: [{ type: "text", text: message.content }],
          providerOptions: message.providerOptions
        };
      }
      return {
        role: "user",
        content: message.content.map((part) => convertPartToLanguageModelPart(part, downloadedAssets)).filter((part) => part.type !== "text" || part.text !== ""),
        providerOptions: message.providerOptions
      };
    }
    case "assistant": {
      if (typeof message.content === "string") {
        return {
          role: "assistant",
          content: [{ type: "text", text: message.content }],
          providerOptions: message.providerOptions
        };
      }
      return {
        role: "assistant",
        content: message.content.filter(
          // remove empty text parts (no text, and no provider options):
          (part) => part.type !== "text" || part.text !== "" || part.providerOptions != null
        ).map((part) => {
          const providerOptions = part.providerOptions;
          switch (part.type) {
            case "file": {
              const { data, mediaType } = convertToLanguageModelV2DataContent(
                part.data
              );
              return {
                type: "file",
                data,
                filename: part.filename,
                mediaType: mediaType != null ? mediaType : part.mediaType,
                providerOptions
              };
            }
            case "reasoning": {
              return {
                type: "reasoning",
                text: part.text,
                providerOptions
              };
            }
            case "text": {
              return {
                type: "text",
                text: part.text,
                providerOptions
              };
            }
            case "tool-call": {
              return {
                type: "tool-call",
                toolCallId: part.toolCallId,
                toolName: part.toolName,
                input: part.input,
                providerExecuted: part.providerExecuted,
                providerOptions
              };
            }
            case "tool-result": {
              return {
                type: "tool-result",
                toolCallId: part.toolCallId,
                toolName: part.toolName,
                output: part.output,
                providerOptions
              };
            }
          }
        }),
        providerOptions: message.providerOptions
      };
    }
    case "tool": {
      return {
        role: "tool",
        content: message.content.map((part) => ({
          type: "tool-result",
          toolCallId: part.toolCallId,
          toolName: part.toolName,
          output: part.output,
          providerOptions: part.providerOptions
        })),
        providerOptions: message.providerOptions
      };
    }
    default: {
      const _exhaustiveCheck = role;
      throw new InvalidMessageRoleError({ role: _exhaustiveCheck });
    }
  }
}
async function downloadAssets(messages, download2, supportedUrls) {
  const plannedDownloads = messages.filter((message) => message.role === "user").map((message) => message.content).filter(
    (content) => Array.isArray(content)
  ).flat().filter(
    (part) => part.type === "image" || part.type === "file"
  ).map((part) => {
    var _a16;
    const mediaType = (_a16 = part.mediaType) != null ? _a16 : part.type === "image" ? "image/*" : void 0;
    let data = part.type === "image" ? part.image : part.data;
    if (typeof data === "string") {
      try {
        data = new URL(data);
      } catch (ignored) {
      }
    }
    return { mediaType, data };
  }).filter(
    (part) => part.data instanceof URL
  ).map((part) => ({
    url: part.data,
    isUrlSupportedByModel: part.mediaType != null && isUrlSupported({
      url: part.data.toString(),
      mediaType: part.mediaType,
      supportedUrls
    })
  }));
  const downloadedFiles = await download2(plannedDownloads);
  return Object.fromEntries(
    downloadedFiles.map(
      (file, index) => file == null ? null : [
        plannedDownloads[index].url.toString(),
        { data: file.data, mediaType: file.mediaType }
      ]
    ).filter((file) => file != null)
  );
}
function convertPartToLanguageModelPart(part, downloadedAssets) {
  var _a16;
  if (part.type === "text") {
    return {
      type: "text",
      text: part.text,
      providerOptions: part.providerOptions
    };
  }
  let originalData;
  const type = part.type;
  switch (type) {
    case "image":
      originalData = part.image;
      break;
    case "file":
      originalData = part.data;
      break;
    default:
      throw new Error(`Unsupported part type: ${type}`);
  }
  const { data: convertedData, mediaType: convertedMediaType } = convertToLanguageModelV2DataContent(originalData);
  let mediaType = convertedMediaType != null ? convertedMediaType : part.mediaType;
  let data = convertedData;
  if (data instanceof URL) {
    const downloadedFile = downloadedAssets[data.toString()];
    if (downloadedFile) {
      data = downloadedFile.data;
      mediaType != null ? mediaType : mediaType = downloadedFile.mediaType;
    }
  }
  switch (type) {
    case "image": {
      if (data instanceof Uint8Array || typeof data === "string") {
        mediaType = (_a16 = detectMediaType({ data, signatures: imageMediaTypeSignatures })) != null ? _a16 : mediaType;
      }
      return {
        type: "file",
        mediaType: mediaType != null ? mediaType : "image/*",
        // any image
        filename: void 0,
        data,
        providerOptions: part.providerOptions
      };
    }
    case "file": {
      if (mediaType == null) {
        throw new Error(`Media type is missing for file part`);
      }
      return {
        type: "file",
        mediaType,
        filename: part.filename,
        data,
        providerOptions: part.providerOptions
      };
    }
  }
}

// src/prompt/prepare-call-settings.ts
function prepareCallSettings({
  maxOutputTokens,
  temperature,
  topP,
  topK,
  presencePenalty,
  frequencyPenalty,
  seed,
  stopSequences
}) {
  if (maxOutputTokens != null) {
    if (!Number.isInteger(maxOutputTokens)) {
      throw new InvalidArgumentError({
        parameter: "maxOutputTokens",
        value: maxOutputTokens,
        message: "maxOutputTokens must be an integer"
      });
    }
    if (maxOutputTokens < 1) {
      throw new InvalidArgumentError({
        parameter: "maxOutputTokens",
        value: maxOutputTokens,
        message: "maxOutputTokens must be >= 1"
      });
    }
  }
  if (temperature != null) {
    if (typeof temperature !== "number") {
      throw new InvalidArgumentError({
        parameter: "temperature",
        value: temperature,
        message: "temperature must be a number"
      });
    }
  }
  if (topP != null) {
    if (typeof topP !== "number") {
      throw new InvalidArgumentError({
        parameter: "topP",
        value: topP,
        message: "topP must be a number"
      });
    }
  }
  if (topK != null) {
    if (typeof topK !== "number") {
      throw new InvalidArgumentError({
        parameter: "topK",
        value: topK,
        message: "topK must be a number"
      });
    }
  }
  if (presencePenalty != null) {
    if (typeof presencePenalty !== "number") {
      throw new InvalidArgumentError({
        parameter: "presencePenalty",
        value: presencePenalty,
        message: "presencePenalty must be a number"
      });
    }
  }
  if (frequencyPenalty != null) {
    if (typeof frequencyPenalty !== "number") {
      throw new InvalidArgumentError({
        parameter: "frequencyPenalty",
        value: frequencyPenalty,
        message: "frequencyPenalty must be a number"
      });
    }
  }
  if (seed != null) {
    if (!Number.isInteger(seed)) {
      throw new InvalidArgumentError({
        parameter: "seed",
        value: seed,
        message: "seed must be an integer"
      });
    }
  }
  return {
    maxOutputTokens,
    temperature,
    topP,
    topK,
    presencePenalty,
    frequencyPenalty,
    stopSequences,
    seed
  };
}

// src/util/is-non-empty-object.ts
function isNonEmptyObject(object2) {
  return object2 != null && Object.keys(object2).length > 0;
}

// src/prompt/prepare-tools-and-tool-choice.ts
function prepareToolsAndToolChoice({
  tools,
  toolChoice,
  activeTools
}) {
  if (!isNonEmptyObject(tools)) {
    return {
      tools: void 0,
      toolChoice: void 0
    };
  }
  const filteredTools = activeTools != null ? Object.entries(tools).filter(
    ([name16]) => activeTools.includes(name16)
  ) : Object.entries(tools);
  return {
    tools: filteredTools.map(([name16, tool2]) => {
      const toolType = tool2.type;
      switch (toolType) {
        case void 0:
        case "dynamic":
        case "function":
          return {
            type: "function",
            name: name16,
            description: tool2.description,
            inputSchema: asSchema(tool2.inputSchema).jsonSchema,
            providerOptions: tool2.providerOptions
          };
        case "provider-defined":
          return {
            type: "provider-defined",
            name: name16,
            id: tool2.id,
            args: tool2.args
          };
        default: {
          const exhaustiveCheck = toolType;
          throw new Error(`Unsupported tool type: ${exhaustiveCheck}`);
        }
      }
    }),
    toolChoice: toolChoice == null ? { type: "auto" } : typeof toolChoice === "string" ? { type: toolChoice } : { type: "tool", toolName: toolChoice.toolName }
  };
}
var jsonValueSchema = lazy(
  () => union([
    _null(),
    string(),
    number(),
    boolean(),
    record(string(), jsonValueSchema),
    array(jsonValueSchema)
  ])
);

// src/types/provider-metadata.ts
var providerMetadataSchema = record(
  string(),
  record(string(), jsonValueSchema)
);
var textPartSchema = object$1({
  type: literal("text"),
  text: string(),
  providerOptions: providerMetadataSchema.optional()
});
var imagePartSchema = object$1({
  type: literal("image"),
  image: union([dataContentSchema, _instanceof(URL)]),
  mediaType: string().optional(),
  providerOptions: providerMetadataSchema.optional()
});
var filePartSchema = object$1({
  type: literal("file"),
  data: union([dataContentSchema, _instanceof(URL)]),
  filename: string().optional(),
  mediaType: string(),
  providerOptions: providerMetadataSchema.optional()
});
var reasoningPartSchema = object$1({
  type: literal("reasoning"),
  text: string(),
  providerOptions: providerMetadataSchema.optional()
});
var toolCallPartSchema = object$1({
  type: literal("tool-call"),
  toolCallId: string(),
  toolName: string(),
  input: unknown(),
  providerOptions: providerMetadataSchema.optional(),
  providerExecuted: boolean().optional()
});
var outputSchema = discriminatedUnion("type", [
  object$1({
    type: literal("text"),
    value: string()
  }),
  object$1({
    type: literal("json"),
    value: jsonValueSchema
  }),
  object$1({
    type: literal("error-text"),
    value: string()
  }),
  object$1({
    type: literal("error-json"),
    value: jsonValueSchema
  }),
  object$1({
    type: literal("content"),
    value: array(
      union([
        object$1({
          type: literal("text"),
          text: string()
        }),
        object$1({
          type: literal("media"),
          data: string(),
          mediaType: string()
        })
      ])
    )
  })
]);
var toolResultPartSchema = object$1({
  type: literal("tool-result"),
  toolCallId: string(),
  toolName: string(),
  output: outputSchema,
  providerOptions: providerMetadataSchema.optional()
});

// src/prompt/message.ts
var systemModelMessageSchema = object$1(
  {
    role: literal("system"),
    content: string(),
    providerOptions: providerMetadataSchema.optional()
  }
);
var userModelMessageSchema = object$1({
  role: literal("user"),
  content: union([
    string(),
    array(union([textPartSchema, imagePartSchema, filePartSchema]))
  ]),
  providerOptions: providerMetadataSchema.optional()
});
var assistantModelMessageSchema = object$1({
  role: literal("assistant"),
  content: union([
    string(),
    array(
      union([
        textPartSchema,
        filePartSchema,
        reasoningPartSchema,
        toolCallPartSchema,
        toolResultPartSchema
      ])
    )
  ]),
  providerOptions: providerMetadataSchema.optional()
});
var toolModelMessageSchema = object$1({
  role: literal("tool"),
  content: array(toolResultPartSchema),
  providerOptions: providerMetadataSchema.optional()
});
var modelMessageSchema = union([
  systemModelMessageSchema,
  userModelMessageSchema,
  assistantModelMessageSchema,
  toolModelMessageSchema
]);

// src/prompt/standardize-prompt.ts
async function standardizePrompt(prompt) {
  if (prompt.prompt == null && prompt.messages == null) {
    throw new InvalidPromptError({
      prompt,
      message: "prompt or messages must be defined"
    });
  }
  if (prompt.prompt != null && prompt.messages != null) {
    throw new InvalidPromptError({
      prompt,
      message: "prompt and messages cannot be defined at the same time"
    });
  }
  if (prompt.system != null && typeof prompt.system !== "string") {
    throw new InvalidPromptError({
      prompt,
      message: "system must be a string"
    });
  }
  let messages;
  if (prompt.prompt != null && typeof prompt.prompt === "string") {
    messages = [{ role: "user", content: prompt.prompt }];
  } else if (prompt.prompt != null && Array.isArray(prompt.prompt)) {
    messages = prompt.prompt;
  } else if (prompt.messages != null) {
    messages = prompt.messages;
  } else {
    throw new InvalidPromptError({
      prompt,
      message: "prompt or messages must be defined"
    });
  }
  if (messages.length === 0) {
    throw new InvalidPromptError({
      prompt,
      message: "messages must not be empty"
    });
  }
  const validationResult = await safeValidateTypes({
    value: messages,
    schema: array(modelMessageSchema)
  });
  if (!validationResult.success) {
    throw new InvalidPromptError({
      prompt,
      message: "The messages must be a ModelMessage[]. If you have passed a UIMessage[], you can use convertToModelMessages to convert them.",
      cause: validationResult.error
    });
  }
  return {
    messages,
    system: prompt.system
  };
}
function wrapGatewayError(error) {
  if (!GatewayAuthenticationError.isInstance(error))
    return error;
  const isProductionEnv = (process == null ? void 0 : process.env.NODE_ENV) === "production";
  const moreInfoURL = "https://ai-sdk.dev/unauthenticated-ai-gateway";
  if (isProductionEnv) {
    return new AISDKError({
      name: "GatewayError",
      message: `Unauthenticated. Configure AI_GATEWAY_API_KEY or use a provider module. Learn more: ${moreInfoURL}`
    });
  }
  return Object.assign(
    new Error(`\x1B[1m\x1B[31mUnauthenticated request to AI Gateway.\x1B[0m

To authenticate, set the \x1B[33mAI_GATEWAY_API_KEY\x1B[0m environment variable with your API key.

Alternatively, you can use a provider module instead of the AI Gateway.

Learn more: \x1B[34m${moreInfoURL}\x1B[0m

`),
    { name: "GatewayAuthenticationError" }
  );
}

// src/telemetry/assemble-operation-name.ts
function assembleOperationName({
  operationId,
  telemetry
}) {
  return {
    // standardized operation and resource name:
    "operation.name": `${operationId}${(telemetry == null ? void 0 : telemetry.functionId) != null ? ` ${telemetry.functionId}` : ""}`,
    "resource.name": telemetry == null ? void 0 : telemetry.functionId,
    // detailed, AI SDK specific data:
    "ai.operationId": operationId,
    "ai.telemetry.functionId": telemetry == null ? void 0 : telemetry.functionId
  };
}

// src/telemetry/get-base-telemetry-attributes.ts
function getBaseTelemetryAttributes({
  model,
  settings,
  telemetry,
  headers
}) {
  var _a16;
  return {
    "ai.model.provider": model.provider,
    "ai.model.id": model.modelId,
    // settings:
    ...Object.entries(settings).reduce((attributes, [key, value]) => {
      attributes[`ai.settings.${key}`] = value;
      return attributes;
    }, {}),
    // add metadata as attributes:
    ...Object.entries((_a16 = telemetry == null ? void 0 : telemetry.metadata) != null ? _a16 : {}).reduce(
      (attributes, [key, value]) => {
        attributes[`ai.telemetry.metadata.${key}`] = value;
        return attributes;
      },
      {}
    ),
    // request headers
    ...Object.entries(headers != null ? headers : {}).reduce((attributes, [key, value]) => {
      if (value !== void 0) {
        attributes[`ai.request.headers.${key}`] = value;
      }
      return attributes;
    }, {})
  };
}

// src/telemetry/noop-tracer.ts
var noopTracer = {
  startSpan() {
    return noopSpan;
  },
  startActiveSpan(name16, arg1, arg2, arg3) {
    if (typeof arg1 === "function") {
      return arg1(noopSpan);
    }
    if (typeof arg2 === "function") {
      return arg2(noopSpan);
    }
    if (typeof arg3 === "function") {
      return arg3(noopSpan);
    }
  }
};
var noopSpan = {
  spanContext() {
    return noopSpanContext;
  },
  setAttribute() {
    return this;
  },
  setAttributes() {
    return this;
  },
  addEvent() {
    return this;
  },
  addLink() {
    return this;
  },
  addLinks() {
    return this;
  },
  setStatus() {
    return this;
  },
  updateName() {
    return this;
  },
  end() {
    return this;
  },
  isRecording() {
    return false;
  },
  recordException() {
    return this;
  }
};
var noopSpanContext = {
  traceId: "",
  spanId: "",
  traceFlags: 0
};

// src/telemetry/get-tracer.ts
function getTracer({
  isEnabled = false,
  tracer
} = {}) {
  if (!isEnabled) {
    return noopTracer;
  }
  if (tracer) {
    return tracer;
  }
  return trace.getTracer("ai");
}
function recordSpan({
  name: name16,
  tracer,
  attributes,
  fn,
  endWhenDone = true
}) {
  return tracer.startActiveSpan(name16, { attributes }, async (span) => {
    try {
      const result = await fn(span);
      if (endWhenDone) {
        span.end();
      }
      return result;
    } catch (error) {
      try {
        recordErrorOnSpan(span, error);
      } finally {
        span.end();
      }
      throw error;
    }
  });
}
function recordErrorOnSpan(span, error) {
  if (error instanceof Error) {
    span.recordException({
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error.message
    });
  } else {
    span.setStatus({ code: SpanStatusCode.ERROR });
  }
}

// src/telemetry/select-telemetry-attributes.ts
function selectTelemetryAttributes({
  telemetry,
  attributes
}) {
  if ((telemetry == null ? void 0 : telemetry.isEnabled) !== true) {
    return {};
  }
  return Object.entries(attributes).reduce((attributes2, [key, value]) => {
    if (value == null) {
      return attributes2;
    }
    if (typeof value === "object" && "input" in value && typeof value.input === "function") {
      if ((telemetry == null ? void 0 : telemetry.recordInputs) === false) {
        return attributes2;
      }
      const result = value.input();
      return result == null ? attributes2 : { ...attributes2, [key]: result };
    }
    if (typeof value === "object" && "output" in value && typeof value.output === "function") {
      if ((telemetry == null ? void 0 : telemetry.recordOutputs) === false) {
        return attributes2;
      }
      const result = value.output();
      return result == null ? attributes2 : { ...attributes2, [key]: result };
    }
    return { ...attributes2, [key]: value };
  }, {});
}

// src/telemetry/stringify-for-telemetry.ts
function stringifyForTelemetry(prompt) {
  return JSON.stringify(
    prompt.map((message) => ({
      ...message,
      content: typeof message.content === "string" ? message.content : message.content.map(
        (part) => part.type === "file" ? {
          ...part,
          data: part.data instanceof Uint8Array ? convertDataContentToBase64String(part.data) : part.data
        } : part
      )
    }))
  );
}

// src/types/usage.ts
function addLanguageModelUsage(usage1, usage2) {
  return {
    inputTokens: addTokenCounts(usage1.inputTokens, usage2.inputTokens),
    outputTokens: addTokenCounts(usage1.outputTokens, usage2.outputTokens),
    totalTokens: addTokenCounts(usage1.totalTokens, usage2.totalTokens),
    reasoningTokens: addTokenCounts(
      usage1.reasoningTokens,
      usage2.reasoningTokens
    ),
    cachedInputTokens: addTokenCounts(
      usage1.cachedInputTokens,
      usage2.cachedInputTokens
    )
  };
}
function addTokenCounts(tokenCount1, tokenCount2) {
  return tokenCount1 == null && tokenCount2 == null ? void 0 : (tokenCount1 != null ? tokenCount1 : 0) + (tokenCount2 != null ? tokenCount2 : 0);
}

// src/util/as-array.ts
function asArray(value) {
  return value === void 0 ? [] : Array.isArray(value) ? value : [value];
}
function getRetryDelayInMs({
  error,
  exponentialBackoffDelay
}) {
  const headers = error.responseHeaders;
  if (!headers)
    return exponentialBackoffDelay;
  let ms;
  const retryAfterMs = headers["retry-after-ms"];
  if (retryAfterMs) {
    const timeoutMs = parseFloat(retryAfterMs);
    if (!Number.isNaN(timeoutMs)) {
      ms = timeoutMs;
    }
  }
  const retryAfter = headers["retry-after"];
  if (retryAfter && ms === void 0) {
    const timeoutSeconds = parseFloat(retryAfter);
    if (!Number.isNaN(timeoutSeconds)) {
      ms = timeoutSeconds * 1e3;
    } else {
      ms = Date.parse(retryAfter) - Date.now();
    }
  }
  if (ms != null && !Number.isNaN(ms) && 0 <= ms && (ms < 60 * 1e3 || ms < exponentialBackoffDelay)) {
    return ms;
  }
  return exponentialBackoffDelay;
}
var retryWithExponentialBackoffRespectingRetryHeaders = ({
  maxRetries = 2,
  initialDelayInMs = 2e3,
  backoffFactor = 2,
  abortSignal
} = {}) => async (f) => _retryWithExponentialBackoff(f, {
  maxRetries,
  delayInMs: initialDelayInMs,
  backoffFactor,
  abortSignal
});
async function _retryWithExponentialBackoff(f, {
  maxRetries,
  delayInMs,
  backoffFactor,
  abortSignal
}, errors = []) {
  try {
    return await f();
  } catch (error) {
    if (isAbortError(error)) {
      throw error;
    }
    if (maxRetries === 0) {
      throw error;
    }
    const errorMessage = getErrorMessage(error);
    const newErrors = [...errors, error];
    const tryNumber = newErrors.length;
    if (tryNumber > maxRetries) {
      throw new RetryError({
        message: `Failed after ${tryNumber} attempts. Last error: ${errorMessage}`,
        reason: "maxRetriesExceeded",
        errors: newErrors
      });
    }
    if (error instanceof Error && APICallError.isInstance(error) && error.isRetryable === true && tryNumber <= maxRetries) {
      await delay(
        getRetryDelayInMs({
          error,
          exponentialBackoffDelay: delayInMs
        }),
        { abortSignal }
      );
      return _retryWithExponentialBackoff(
        f,
        {
          maxRetries,
          delayInMs: backoffFactor * delayInMs,
          backoffFactor,
          abortSignal
        },
        newErrors
      );
    }
    if (tryNumber === 1) {
      throw error;
    }
    throw new RetryError({
      message: `Failed after ${tryNumber} attempts with non-retryable error: '${errorMessage}'`,
      reason: "errorNotRetryable",
      errors: newErrors
    });
  }
}

// src/util/prepare-retries.ts
function prepareRetries({
  maxRetries,
  abortSignal
}) {
  if (maxRetries != null) {
    if (!Number.isInteger(maxRetries)) {
      throw new InvalidArgumentError({
        parameter: "maxRetries",
        value: maxRetries,
        message: "maxRetries must be an integer"
      });
    }
    if (maxRetries < 0) {
      throw new InvalidArgumentError({
        parameter: "maxRetries",
        value: maxRetries,
        message: "maxRetries must be >= 0"
      });
    }
  }
  const maxRetriesResult = maxRetries != null ? maxRetries : 2;
  return {
    maxRetries: maxRetriesResult,
    retry: retryWithExponentialBackoffRespectingRetryHeaders({
      maxRetries: maxRetriesResult,
      abortSignal
    })
  };
}
var DefaultGeneratedFile = class {
  constructor({
    data,
    mediaType
  }) {
    const isUint8Array = data instanceof Uint8Array;
    this.base64Data = isUint8Array ? void 0 : data;
    this.uint8ArrayData = isUint8Array ? data : void 0;
    this.mediaType = mediaType;
  }
  // lazy conversion with caching to avoid unnecessary conversion overhead:
  get base64() {
    if (this.base64Data == null) {
      this.base64Data = convertUint8ArrayToBase64(this.uint8ArrayData);
    }
    return this.base64Data;
  }
  // lazy conversion with caching to avoid unnecessary conversion overhead:
  get uint8Array() {
    if (this.uint8ArrayData == null) {
      this.uint8ArrayData = convertBase64ToUint8Array(this.base64Data);
    }
    return this.uint8ArrayData;
  }
};
var DefaultGeneratedFileWithType = class extends DefaultGeneratedFile {
  constructor(options) {
    super(options);
    this.type = "file";
  }
};
async function parseToolCall({
  toolCall,
  tools,
  repairToolCall,
  system,
  messages
}) {
  try {
    if (tools == null) {
      throw new NoSuchToolError({ toolName: toolCall.toolName });
    }
    try {
      return await doParseToolCall({ toolCall, tools });
    } catch (error) {
      if (repairToolCall == null || !(NoSuchToolError.isInstance(error) || InvalidToolInputError.isInstance(error))) {
        throw error;
      }
      let repairedToolCall = null;
      try {
        repairedToolCall = await repairToolCall({
          toolCall,
          tools,
          inputSchema: ({ toolName }) => {
            const { inputSchema } = tools[toolName];
            return asSchema(inputSchema).jsonSchema;
          },
          system,
          messages,
          error
        });
      } catch (repairError) {
        throw new ToolCallRepairError({
          cause: repairError,
          originalError: error
        });
      }
      if (repairedToolCall == null) {
        throw error;
      }
      return await doParseToolCall({ toolCall: repairedToolCall, tools });
    }
  } catch (error) {
    const parsedInput = await safeParseJSON({ text: toolCall.input });
    const input = parsedInput.success ? parsedInput.value : toolCall.input;
    return {
      type: "tool-call",
      toolCallId: toolCall.toolCallId,
      toolName: toolCall.toolName,
      input,
      dynamic: true,
      invalid: true,
      error,
      providerMetadata: toolCall.providerMetadata
    };
  }
}
async function doParseToolCall({
  toolCall,
  tools
}) {
  const toolName = toolCall.toolName;
  const tool2 = tools[toolName];
  if (tool2 == null) {
    throw new NoSuchToolError({
      toolName: toolCall.toolName,
      availableTools: Object.keys(tools)
    });
  }
  const schema = asSchema(tool2.inputSchema);
  const parseResult = toolCall.input.trim() === "" ? await safeValidateTypes({ value: {}, schema }) : await safeParseJSON({ text: toolCall.input, schema });
  if (parseResult.success === false) {
    throw new InvalidToolInputError({
      toolName,
      toolInput: toolCall.input,
      cause: parseResult.error
    });
  }
  return tool2.type === "dynamic" ? {
    type: "tool-call",
    toolCallId: toolCall.toolCallId,
    toolName: toolCall.toolName,
    input: parseResult.value,
    providerExecuted: toolCall.providerExecuted,
    providerMetadata: toolCall.providerMetadata,
    dynamic: true
  } : {
    type: "tool-call",
    toolCallId: toolCall.toolCallId,
    toolName,
    input: parseResult.value,
    providerExecuted: toolCall.providerExecuted,
    providerMetadata: toolCall.providerMetadata
  };
}

// src/generate-text/step-result.ts
var DefaultStepResult = class {
  constructor({
    content,
    finishReason,
    usage,
    warnings,
    request,
    response,
    providerMetadata
  }) {
    this.content = content;
    this.finishReason = finishReason;
    this.usage = usage;
    this.warnings = warnings;
    this.request = request;
    this.response = response;
    this.providerMetadata = providerMetadata;
  }
  get text() {
    return this.content.filter((part) => part.type === "text").map((part) => part.text).join("");
  }
  get reasoning() {
    return this.content.filter((part) => part.type === "reasoning");
  }
  get reasoningText() {
    return this.reasoning.length === 0 ? void 0 : this.reasoning.map((part) => part.text).join("");
  }
  get files() {
    return this.content.filter((part) => part.type === "file").map((part) => part.file);
  }
  get sources() {
    return this.content.filter((part) => part.type === "source");
  }
  get toolCalls() {
    return this.content.filter((part) => part.type === "tool-call");
  }
  get staticToolCalls() {
    return this.toolCalls.filter(
      (toolCall) => toolCall.dynamic !== true
    );
  }
  get dynamicToolCalls() {
    return this.toolCalls.filter(
      (toolCall) => toolCall.dynamic === true
    );
  }
  get toolResults() {
    return this.content.filter((part) => part.type === "tool-result");
  }
  get staticToolResults() {
    return this.toolResults.filter(
      (toolResult) => toolResult.dynamic !== true
    );
  }
  get dynamicToolResults() {
    return this.toolResults.filter(
      (toolResult) => toolResult.dynamic === true
    );
  }
};

// src/generate-text/stop-condition.ts
function stepCountIs(stepCount) {
  return ({ steps }) => steps.length === stepCount;
}
async function isStopConditionMet({
  stopConditions,
  steps
}) {
  return (await Promise.all(stopConditions.map((condition) => condition({ steps })))).some((result) => result);
}
function createToolModelOutput({
  output,
  tool: tool2,
  errorMode
}) {
  if (errorMode === "text") {
    return { type: "error-text", value: getErrorMessage$1(output) };
  } else if (errorMode === "json") {
    return { type: "error-json", value: toJSONValue(output) };
  }
  if (tool2 == null ? void 0 : tool2.toModelOutput) {
    return tool2.toModelOutput(output);
  }
  return typeof output === "string" ? { type: "text", value: output } : { type: "json", value: toJSONValue(output) };
}
function toJSONValue(value) {
  return value === void 0 ? null : value;
}

// src/generate-text/to-response-messages.ts
function toResponseMessages({
  content: inputContent,
  tools
}) {
  const responseMessages = [];
  const content = inputContent.filter((part) => part.type !== "source").filter(
    (part) => (part.type !== "tool-result" || part.providerExecuted) && (part.type !== "tool-error" || part.providerExecuted)
  ).filter((part) => part.type !== "text" || part.text.length > 0).map((part) => {
    switch (part.type) {
      case "text":
        return {
          type: "text",
          text: part.text,
          providerOptions: part.providerMetadata
        };
      case "reasoning":
        return {
          type: "reasoning",
          text: part.text,
          providerOptions: part.providerMetadata
        };
      case "file":
        return {
          type: "file",
          data: part.file.base64,
          mediaType: part.file.mediaType,
          providerOptions: part.providerMetadata
        };
      case "tool-call":
        return {
          type: "tool-call",
          toolCallId: part.toolCallId,
          toolName: part.toolName,
          input: part.input,
          providerExecuted: part.providerExecuted,
          providerOptions: part.providerMetadata
        };
      case "tool-result":
        return {
          type: "tool-result",
          toolCallId: part.toolCallId,
          toolName: part.toolName,
          output: createToolModelOutput({
            tool: tools == null ? void 0 : tools[part.toolName],
            output: part.output,
            errorMode: "none"
          }),
          providerExecuted: true,
          providerOptions: part.providerMetadata
        };
      case "tool-error":
        return {
          type: "tool-result",
          toolCallId: part.toolCallId,
          toolName: part.toolName,
          output: createToolModelOutput({
            tool: tools == null ? void 0 : tools[part.toolName],
            output: part.error,
            errorMode: "json"
          }),
          providerOptions: part.providerMetadata
        };
    }
  });
  if (content.length > 0) {
    responseMessages.push({
      role: "assistant",
      content
    });
  }
  const toolResultContent = inputContent.filter((part) => part.type === "tool-result" || part.type === "tool-error").filter((part) => !part.providerExecuted).map((toolResult) => ({
    type: "tool-result",
    toolCallId: toolResult.toolCallId,
    toolName: toolResult.toolName,
    output: createToolModelOutput({
      tool: tools == null ? void 0 : tools[toolResult.toolName],
      output: toolResult.type === "tool-result" ? toolResult.output : toolResult.error,
      errorMode: toolResult.type === "tool-error" ? "text" : "none"
    }),
    ...toolResult.providerMetadata != null ? { providerOptions: toolResult.providerMetadata } : {}
  }));
  if (toolResultContent.length > 0) {
    responseMessages.push({
      role: "tool",
      content: toolResultContent
    });
  }
  return responseMessages;
}

// src/generate-text/generate-text.ts
createIdGenerator({
  prefix: "aitxt",
  size: 24
});

// src/util/prepare-headers.ts
function prepareHeaders(headers, defaultHeaders) {
  const responseHeaders = new Headers(headers != null ? headers : {});
  for (const [key, value] of Object.entries(defaultHeaders)) {
    if (!responseHeaders.has(key)) {
      responseHeaders.set(key, value);
    }
  }
  return responseHeaders;
}

// src/text-stream/create-text-stream-response.ts
function createTextStreamResponse({
  status,
  statusText,
  headers,
  textStream
}) {
  return new Response(textStream.pipeThrough(new TextEncoderStream()), {
    status: status != null ? status : 200,
    statusText,
    headers: prepareHeaders(headers, {
      "content-type": "text/plain; charset=utf-8"
    })
  });
}

// src/util/write-to-server-response.ts
function writeToServerResponse({
  response,
  status,
  statusText,
  headers,
  stream
}) {
  const statusCode = status != null ? status : 200;
  if (statusText !== void 0) {
    response.writeHead(statusCode, statusText, headers);
  } else {
    response.writeHead(statusCode, headers);
  }
  const reader = stream.getReader();
  const read = async () => {
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done)
          break;
        const canContinue = response.write(value);
        if (!canContinue) {
          await new Promise((resolve2) => {
            response.once("drain", resolve2);
          });
        }
      }
    } catch (error) {
      throw error;
    } finally {
      response.end();
    }
  };
  read();
}

// src/text-stream/pipe-text-stream-to-response.ts
function pipeTextStreamToResponse({
  response,
  status,
  statusText,
  headers,
  textStream
}) {
  writeToServerResponse({
    response,
    status,
    statusText,
    headers: Object.fromEntries(
      prepareHeaders(headers, {
        "content-type": "text/plain; charset=utf-8"
      }).entries()
    ),
    stream: textStream.pipeThrough(new TextEncoderStream())
  });
}

// src/ui-message-stream/json-to-sse-transform-stream.ts
var JsonToSseTransformStream = class extends TransformStream {
  constructor() {
    super({
      transform(part, controller) {
        controller.enqueue(`data: ${JSON.stringify(part)}

`);
      },
      flush(controller) {
        controller.enqueue("data: [DONE]\n\n");
      }
    });
  }
};

// src/ui-message-stream/ui-message-stream-headers.ts
var UI_MESSAGE_STREAM_HEADERS = {
  "content-type": "text/event-stream",
  "cache-control": "no-cache",
  connection: "keep-alive",
  "x-vercel-ai-ui-message-stream": "v1",
  "x-accel-buffering": "no"
  // disable nginx buffering
};

// src/ui-message-stream/create-ui-message-stream-response.ts
function createUIMessageStreamResponse({
  status,
  statusText,
  headers,
  stream,
  consumeSseStream
}) {
  let sseStream = stream.pipeThrough(new JsonToSseTransformStream());
  if (consumeSseStream) {
    const [stream1, stream2] = sseStream.tee();
    sseStream = stream1;
    consumeSseStream({ stream: stream2 });
  }
  return new Response(sseStream.pipeThrough(new TextEncoderStream()), {
    status,
    statusText,
    headers: prepareHeaders(headers, UI_MESSAGE_STREAM_HEADERS)
  });
}

// src/ui-message-stream/get-response-ui-message-id.ts
function getResponseUIMessageId({
  originalMessages,
  responseMessageId
}) {
  if (originalMessages == null) {
    return void 0;
  }
  const lastMessage = originalMessages[originalMessages.length - 1];
  return (lastMessage == null ? void 0 : lastMessage.role) === "assistant" ? lastMessage.id : typeof responseMessageId === "function" ? responseMessageId() : responseMessageId;
}
function isDataUIMessageChunk(chunk) {
  return chunk.type.startsWith("data-");
}

// src/util/merge-objects.ts
function mergeObjects(base, overrides) {
  if (base === void 0 && overrides === void 0) {
    return void 0;
  }
  if (base === void 0) {
    return overrides;
  }
  if (overrides === void 0) {
    return base;
  }
  const result = { ...base };
  for (const key in overrides) {
    if (Object.prototype.hasOwnProperty.call(overrides, key)) {
      const overridesValue = overrides[key];
      if (overridesValue === void 0)
        continue;
      const baseValue = key in base ? base[key] : void 0;
      const isSourceObject = overridesValue !== null && typeof overridesValue === "object" && !Array.isArray(overridesValue) && !(overridesValue instanceof Date) && !(overridesValue instanceof RegExp);
      const isTargetObject = baseValue !== null && baseValue !== void 0 && typeof baseValue === "object" && !Array.isArray(baseValue) && !(baseValue instanceof Date) && !(baseValue instanceof RegExp);
      if (isSourceObject && isTargetObject) {
        result[key] = mergeObjects(
          baseValue,
          overridesValue
        );
      } else {
        result[key] = overridesValue;
      }
    }
  }
  return result;
}

// src/util/fix-json.ts
function fixJson(input) {
  const stack = ["ROOT"];
  let lastValidIndex = -1;
  let literalStart = null;
  function processValueStart(char, i, swapState) {
    {
      switch (char) {
        case '"': {
          lastValidIndex = i;
          stack.pop();
          stack.push(swapState);
          stack.push("INSIDE_STRING");
          break;
        }
        case "f":
        case "t":
        case "n": {
          lastValidIndex = i;
          literalStart = i;
          stack.pop();
          stack.push(swapState);
          stack.push("INSIDE_LITERAL");
          break;
        }
        case "-": {
          stack.pop();
          stack.push(swapState);
          stack.push("INSIDE_NUMBER");
          break;
        }
        case "0":
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9": {
          lastValidIndex = i;
          stack.pop();
          stack.push(swapState);
          stack.push("INSIDE_NUMBER");
          break;
        }
        case "{": {
          lastValidIndex = i;
          stack.pop();
          stack.push(swapState);
          stack.push("INSIDE_OBJECT_START");
          break;
        }
        case "[": {
          lastValidIndex = i;
          stack.pop();
          stack.push(swapState);
          stack.push("INSIDE_ARRAY_START");
          break;
        }
      }
    }
  }
  function processAfterObjectValue(char, i) {
    switch (char) {
      case ",": {
        stack.pop();
        stack.push("INSIDE_OBJECT_AFTER_COMMA");
        break;
      }
      case "}": {
        lastValidIndex = i;
        stack.pop();
        break;
      }
    }
  }
  function processAfterArrayValue(char, i) {
    switch (char) {
      case ",": {
        stack.pop();
        stack.push("INSIDE_ARRAY_AFTER_COMMA");
        break;
      }
      case "]": {
        lastValidIndex = i;
        stack.pop();
        break;
      }
    }
  }
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    const currentState = stack[stack.length - 1];
    switch (currentState) {
      case "ROOT":
        processValueStart(char, i, "FINISH");
        break;
      case "INSIDE_OBJECT_START": {
        switch (char) {
          case '"': {
            stack.pop();
            stack.push("INSIDE_OBJECT_KEY");
            break;
          }
          case "}": {
            lastValidIndex = i;
            stack.pop();
            break;
          }
        }
        break;
      }
      case "INSIDE_OBJECT_AFTER_COMMA": {
        switch (char) {
          case '"': {
            stack.pop();
            stack.push("INSIDE_OBJECT_KEY");
            break;
          }
        }
        break;
      }
      case "INSIDE_OBJECT_KEY": {
        switch (char) {
          case '"': {
            stack.pop();
            stack.push("INSIDE_OBJECT_AFTER_KEY");
            break;
          }
        }
        break;
      }
      case "INSIDE_OBJECT_AFTER_KEY": {
        switch (char) {
          case ":": {
            stack.pop();
            stack.push("INSIDE_OBJECT_BEFORE_VALUE");
            break;
          }
        }
        break;
      }
      case "INSIDE_OBJECT_BEFORE_VALUE": {
        processValueStart(char, i, "INSIDE_OBJECT_AFTER_VALUE");
        break;
      }
      case "INSIDE_OBJECT_AFTER_VALUE": {
        processAfterObjectValue(char, i);
        break;
      }
      case "INSIDE_STRING": {
        switch (char) {
          case '"': {
            stack.pop();
            lastValidIndex = i;
            break;
          }
          case "\\": {
            stack.push("INSIDE_STRING_ESCAPE");
            break;
          }
          default: {
            lastValidIndex = i;
          }
        }
        break;
      }
      case "INSIDE_ARRAY_START": {
        switch (char) {
          case "]": {
            lastValidIndex = i;
            stack.pop();
            break;
          }
          default: {
            lastValidIndex = i;
            processValueStart(char, i, "INSIDE_ARRAY_AFTER_VALUE");
            break;
          }
        }
        break;
      }
      case "INSIDE_ARRAY_AFTER_VALUE": {
        switch (char) {
          case ",": {
            stack.pop();
            stack.push("INSIDE_ARRAY_AFTER_COMMA");
            break;
          }
          case "]": {
            lastValidIndex = i;
            stack.pop();
            break;
          }
          default: {
            lastValidIndex = i;
            break;
          }
        }
        break;
      }
      case "INSIDE_ARRAY_AFTER_COMMA": {
        processValueStart(char, i, "INSIDE_ARRAY_AFTER_VALUE");
        break;
      }
      case "INSIDE_STRING_ESCAPE": {
        stack.pop();
        lastValidIndex = i;
        break;
      }
      case "INSIDE_NUMBER": {
        switch (char) {
          case "0":
          case "1":
          case "2":
          case "3":
          case "4":
          case "5":
          case "6":
          case "7":
          case "8":
          case "9": {
            lastValidIndex = i;
            break;
          }
          case "e":
          case "E":
          case "-":
          case ".": {
            break;
          }
          case ",": {
            stack.pop();
            if (stack[stack.length - 1] === "INSIDE_ARRAY_AFTER_VALUE") {
              processAfterArrayValue(char, i);
            }
            if (stack[stack.length - 1] === "INSIDE_OBJECT_AFTER_VALUE") {
              processAfterObjectValue(char, i);
            }
            break;
          }
          case "}": {
            stack.pop();
            if (stack[stack.length - 1] === "INSIDE_OBJECT_AFTER_VALUE") {
              processAfterObjectValue(char, i);
            }
            break;
          }
          case "]": {
            stack.pop();
            if (stack[stack.length - 1] === "INSIDE_ARRAY_AFTER_VALUE") {
              processAfterArrayValue(char, i);
            }
            break;
          }
          default: {
            stack.pop();
            break;
          }
        }
        break;
      }
      case "INSIDE_LITERAL": {
        const partialLiteral = input.substring(literalStart, i + 1);
        if (!"false".startsWith(partialLiteral) && !"true".startsWith(partialLiteral) && !"null".startsWith(partialLiteral)) {
          stack.pop();
          if (stack[stack.length - 1] === "INSIDE_OBJECT_AFTER_VALUE") {
            processAfterObjectValue(char, i);
          } else if (stack[stack.length - 1] === "INSIDE_ARRAY_AFTER_VALUE") {
            processAfterArrayValue(char, i);
          }
        } else {
          lastValidIndex = i;
        }
        break;
      }
    }
  }
  let result = input.slice(0, lastValidIndex + 1);
  for (let i = stack.length - 1; i >= 0; i--) {
    const state = stack[i];
    switch (state) {
      case "INSIDE_STRING": {
        result += '"';
        break;
      }
      case "INSIDE_OBJECT_KEY":
      case "INSIDE_OBJECT_AFTER_KEY":
      case "INSIDE_OBJECT_AFTER_COMMA":
      case "INSIDE_OBJECT_START":
      case "INSIDE_OBJECT_BEFORE_VALUE":
      case "INSIDE_OBJECT_AFTER_VALUE": {
        result += "}";
        break;
      }
      case "INSIDE_ARRAY_START":
      case "INSIDE_ARRAY_AFTER_COMMA":
      case "INSIDE_ARRAY_AFTER_VALUE": {
        result += "]";
        break;
      }
      case "INSIDE_LITERAL": {
        const partialLiteral = input.substring(literalStart, input.length);
        if ("true".startsWith(partialLiteral)) {
          result += "true".slice(partialLiteral.length);
        } else if ("false".startsWith(partialLiteral)) {
          result += "false".slice(partialLiteral.length);
        } else if ("null".startsWith(partialLiteral)) {
          result += "null".slice(partialLiteral.length);
        }
      }
    }
  }
  return result;
}

// src/util/parse-partial-json.ts
async function parsePartialJson(jsonText) {
  if (jsonText === void 0) {
    return { value: void 0, state: "undefined-input" };
  }
  let result = await safeParseJSON({ text: jsonText });
  if (result.success) {
    return { value: result.value, state: "successful-parse" };
  }
  result = await safeParseJSON({ text: fixJson(jsonText) });
  if (result.success) {
    return { value: result.value, state: "repaired-parse" };
  }
  return { value: void 0, state: "failed-parse" };
}
function isToolUIPart(part) {
  return part.type.startsWith("tool-");
}
function getToolName(part) {
  return part.type.split("-").slice(1).join("-");
}

// src/ui/process-ui-message-stream.ts
function createStreamingUIMessageState({
  lastMessage,
  messageId
}) {
  return {
    message: (lastMessage == null ? void 0 : lastMessage.role) === "assistant" ? lastMessage : {
      id: messageId,
      metadata: void 0,
      role: "assistant",
      parts: []
    },
    activeTextParts: {},
    activeReasoningParts: {},
    partialToolCalls: {}
  };
}
function processUIMessageStream({
  stream,
  messageMetadataSchema,
  dataPartSchemas,
  runUpdateMessageJob,
  onError,
  onToolCall,
  onData
}) {
  return stream.pipeThrough(
    new TransformStream({
      async transform(chunk, controller) {
        await runUpdateMessageJob(async ({ state, write }) => {
          var _a16, _b, _c, _d;
          function getToolInvocation(toolCallId) {
            const toolInvocations = state.message.parts.filter(isToolUIPart);
            const toolInvocation = toolInvocations.find(
              (invocation) => invocation.toolCallId === toolCallId
            );
            if (toolInvocation == null) {
              throw new Error(
                "tool-output-error must be preceded by a tool-input-available"
              );
            }
            return toolInvocation;
          }
          function getDynamicToolInvocation(toolCallId) {
            const toolInvocations = state.message.parts.filter(
              (part) => part.type === "dynamic-tool"
            );
            const toolInvocation = toolInvocations.find(
              (invocation) => invocation.toolCallId === toolCallId
            );
            if (toolInvocation == null) {
              throw new Error(
                "tool-output-error must be preceded by a tool-input-available"
              );
            }
            return toolInvocation;
          }
          function updateToolPart(options) {
            var _a17;
            const part = state.message.parts.find(
              (part2) => isToolUIPart(part2) && part2.toolCallId === options.toolCallId
            );
            const anyOptions = options;
            const anyPart = part;
            if (part != null) {
              part.state = options.state;
              anyPart.input = anyOptions.input;
              anyPart.output = anyOptions.output;
              anyPart.errorText = anyOptions.errorText;
              anyPart.rawInput = anyOptions.rawInput;
              anyPart.preliminary = anyOptions.preliminary;
              anyPart.providerExecuted = (_a17 = anyOptions.providerExecuted) != null ? _a17 : part.providerExecuted;
              if (anyOptions.providerMetadata != null && part.state === "input-available") {
                part.callProviderMetadata = anyOptions.providerMetadata;
              }
            } else {
              state.message.parts.push({
                type: `tool-${options.toolName}`,
                toolCallId: options.toolCallId,
                state: options.state,
                input: anyOptions.input,
                output: anyOptions.output,
                rawInput: anyOptions.rawInput,
                errorText: anyOptions.errorText,
                providerExecuted: anyOptions.providerExecuted,
                preliminary: anyOptions.preliminary,
                ...anyOptions.providerMetadata != null ? { callProviderMetadata: anyOptions.providerMetadata } : {}
              });
            }
          }
          function updateDynamicToolPart(options) {
            var _a17, _b2;
            const part = state.message.parts.find(
              (part2) => part2.type === "dynamic-tool" && part2.toolCallId === options.toolCallId
            );
            const anyOptions = options;
            const anyPart = part;
            if (part != null) {
              part.state = options.state;
              anyPart.toolName = options.toolName;
              anyPart.input = anyOptions.input;
              anyPart.output = anyOptions.output;
              anyPart.errorText = anyOptions.errorText;
              anyPart.rawInput = (_a17 = anyOptions.rawInput) != null ? _a17 : anyPart.rawInput;
              anyPart.preliminary = anyOptions.preliminary;
              anyPart.providerExecuted = (_b2 = anyOptions.providerExecuted) != null ? _b2 : part.providerExecuted;
              if (anyOptions.providerMetadata != null && part.state === "input-available") {
                part.callProviderMetadata = anyOptions.providerMetadata;
              }
            } else {
              state.message.parts.push({
                type: "dynamic-tool",
                toolName: options.toolName,
                toolCallId: options.toolCallId,
                state: options.state,
                input: anyOptions.input,
                output: anyOptions.output,
                errorText: anyOptions.errorText,
                preliminary: anyOptions.preliminary,
                providerExecuted: anyOptions.providerExecuted,
                ...anyOptions.providerMetadata != null ? { callProviderMetadata: anyOptions.providerMetadata } : {}
              });
            }
          }
          async function updateMessageMetadata(metadata) {
            if (metadata != null) {
              const mergedMetadata = state.message.metadata != null ? mergeObjects(state.message.metadata, metadata) : metadata;
              if (messageMetadataSchema != null) {
                await validateTypes({
                  value: mergedMetadata,
                  schema: messageMetadataSchema
                });
              }
              state.message.metadata = mergedMetadata;
            }
          }
          switch (chunk.type) {
            case "text-start": {
              const textPart = {
                type: "text",
                text: "",
                providerMetadata: chunk.providerMetadata,
                state: "streaming"
              };
              state.activeTextParts[chunk.id] = textPart;
              state.message.parts.push(textPart);
              write();
              break;
            }
            case "text-delta": {
              const textPart = state.activeTextParts[chunk.id];
              textPart.text += chunk.delta;
              textPart.providerMetadata = (_a16 = chunk.providerMetadata) != null ? _a16 : textPart.providerMetadata;
              write();
              break;
            }
            case "text-end": {
              const textPart = state.activeTextParts[chunk.id];
              textPart.state = "done";
              textPart.providerMetadata = (_b = chunk.providerMetadata) != null ? _b : textPart.providerMetadata;
              delete state.activeTextParts[chunk.id];
              write();
              break;
            }
            case "reasoning-start": {
              const reasoningPart = {
                type: "reasoning",
                text: "",
                providerMetadata: chunk.providerMetadata,
                state: "streaming"
              };
              state.activeReasoningParts[chunk.id] = reasoningPart;
              state.message.parts.push(reasoningPart);
              write();
              break;
            }
            case "reasoning-delta": {
              const reasoningPart = state.activeReasoningParts[chunk.id];
              reasoningPart.text += chunk.delta;
              reasoningPart.providerMetadata = (_c = chunk.providerMetadata) != null ? _c : reasoningPart.providerMetadata;
              write();
              break;
            }
            case "reasoning-end": {
              const reasoningPart = state.activeReasoningParts[chunk.id];
              reasoningPart.providerMetadata = (_d = chunk.providerMetadata) != null ? _d : reasoningPart.providerMetadata;
              reasoningPart.state = "done";
              delete state.activeReasoningParts[chunk.id];
              write();
              break;
            }
            case "file": {
              state.message.parts.push({
                type: "file",
                mediaType: chunk.mediaType,
                url: chunk.url
              });
              write();
              break;
            }
            case "source-url": {
              state.message.parts.push({
                type: "source-url",
                sourceId: chunk.sourceId,
                url: chunk.url,
                title: chunk.title,
                providerMetadata: chunk.providerMetadata
              });
              write();
              break;
            }
            case "source-document": {
              state.message.parts.push({
                type: "source-document",
                sourceId: chunk.sourceId,
                mediaType: chunk.mediaType,
                title: chunk.title,
                filename: chunk.filename,
                providerMetadata: chunk.providerMetadata
              });
              write();
              break;
            }
            case "tool-input-start": {
              const toolInvocations = state.message.parts.filter(isToolUIPart);
              state.partialToolCalls[chunk.toolCallId] = {
                text: "",
                toolName: chunk.toolName,
                index: toolInvocations.length,
                dynamic: chunk.dynamic
              };
              if (chunk.dynamic) {
                updateDynamicToolPart({
                  toolCallId: chunk.toolCallId,
                  toolName: chunk.toolName,
                  state: "input-streaming",
                  input: void 0,
                  providerExecuted: chunk.providerExecuted
                });
              } else {
                updateToolPart({
                  toolCallId: chunk.toolCallId,
                  toolName: chunk.toolName,
                  state: "input-streaming",
                  input: void 0,
                  providerExecuted: chunk.providerExecuted
                });
              }
              write();
              break;
            }
            case "tool-input-delta": {
              const partialToolCall = state.partialToolCalls[chunk.toolCallId];
              partialToolCall.text += chunk.inputTextDelta;
              const { value: partialArgs } = await parsePartialJson(
                partialToolCall.text
              );
              if (partialToolCall.dynamic) {
                updateDynamicToolPart({
                  toolCallId: chunk.toolCallId,
                  toolName: partialToolCall.toolName,
                  state: "input-streaming",
                  input: partialArgs
                });
              } else {
                updateToolPart({
                  toolCallId: chunk.toolCallId,
                  toolName: partialToolCall.toolName,
                  state: "input-streaming",
                  input: partialArgs
                });
              }
              write();
              break;
            }
            case "tool-input-available": {
              if (chunk.dynamic) {
                updateDynamicToolPart({
                  toolCallId: chunk.toolCallId,
                  toolName: chunk.toolName,
                  state: "input-available",
                  input: chunk.input,
                  providerExecuted: chunk.providerExecuted,
                  providerMetadata: chunk.providerMetadata
                });
              } else {
                updateToolPart({
                  toolCallId: chunk.toolCallId,
                  toolName: chunk.toolName,
                  state: "input-available",
                  input: chunk.input,
                  providerExecuted: chunk.providerExecuted,
                  providerMetadata: chunk.providerMetadata
                });
              }
              write();
              if (onToolCall && !chunk.providerExecuted) {
                await onToolCall({
                  toolCall: chunk
                });
              }
              break;
            }
            case "tool-input-error": {
              if (chunk.dynamic) {
                updateDynamicToolPart({
                  toolCallId: chunk.toolCallId,
                  toolName: chunk.toolName,
                  state: "output-error",
                  input: chunk.input,
                  errorText: chunk.errorText,
                  providerExecuted: chunk.providerExecuted,
                  providerMetadata: chunk.providerMetadata
                });
              } else {
                updateToolPart({
                  toolCallId: chunk.toolCallId,
                  toolName: chunk.toolName,
                  state: "output-error",
                  input: void 0,
                  rawInput: chunk.input,
                  errorText: chunk.errorText,
                  providerExecuted: chunk.providerExecuted,
                  providerMetadata: chunk.providerMetadata
                });
              }
              write();
              break;
            }
            case "tool-output-available": {
              if (chunk.dynamic) {
                const toolInvocation = getDynamicToolInvocation(
                  chunk.toolCallId
                );
                updateDynamicToolPart({
                  toolCallId: chunk.toolCallId,
                  toolName: toolInvocation.toolName,
                  state: "output-available",
                  input: toolInvocation.input,
                  output: chunk.output,
                  preliminary: chunk.preliminary
                });
              } else {
                const toolInvocation = getToolInvocation(chunk.toolCallId);
                updateToolPart({
                  toolCallId: chunk.toolCallId,
                  toolName: getToolName(toolInvocation),
                  state: "output-available",
                  input: toolInvocation.input,
                  output: chunk.output,
                  providerExecuted: chunk.providerExecuted,
                  preliminary: chunk.preliminary
                });
              }
              write();
              break;
            }
            case "tool-output-error": {
              if (chunk.dynamic) {
                const toolInvocation = getDynamicToolInvocation(
                  chunk.toolCallId
                );
                updateDynamicToolPart({
                  toolCallId: chunk.toolCallId,
                  toolName: toolInvocation.toolName,
                  state: "output-error",
                  input: toolInvocation.input,
                  errorText: chunk.errorText,
                  providerExecuted: chunk.providerExecuted
                });
              } else {
                const toolInvocation = getToolInvocation(chunk.toolCallId);
                updateToolPart({
                  toolCallId: chunk.toolCallId,
                  toolName: getToolName(toolInvocation),
                  state: "output-error",
                  input: toolInvocation.input,
                  rawInput: toolInvocation.rawInput,
                  errorText: chunk.errorText,
                  providerExecuted: chunk.providerExecuted
                });
              }
              write();
              break;
            }
            case "start-step": {
              state.message.parts.push({ type: "step-start" });
              break;
            }
            case "finish-step": {
              state.activeTextParts = {};
              state.activeReasoningParts = {};
              break;
            }
            case "start": {
              if (chunk.messageId != null) {
                state.message.id = chunk.messageId;
              }
              await updateMessageMetadata(chunk.messageMetadata);
              if (chunk.messageId != null || chunk.messageMetadata != null) {
                write();
              }
              break;
            }
            case "finish": {
              if (chunk.finishReason != null) {
                state.finishReason = chunk.finishReason;
              }
              await updateMessageMetadata(chunk.messageMetadata);
              if (chunk.messageMetadata != null) {
                write();
              }
              break;
            }
            case "message-metadata": {
              await updateMessageMetadata(chunk.messageMetadata);
              if (chunk.messageMetadata != null) {
                write();
              }
              break;
            }
            case "error": {
              onError == null ? void 0 : onError(new Error(chunk.errorText));
              break;
            }
            default: {
              if (isDataUIMessageChunk(chunk)) {
                if ((dataPartSchemas == null ? void 0 : dataPartSchemas[chunk.type]) != null) {
                  await validateTypes({
                    value: chunk.data,
                    schema: dataPartSchemas[chunk.type]
                  });
                }
                const dataChunk = chunk;
                if (dataChunk.transient) {
                  onData == null ? void 0 : onData(dataChunk);
                  break;
                }
                const existingUIPart = dataChunk.id != null ? state.message.parts.find(
                  (chunkArg) => dataChunk.type === chunkArg.type && dataChunk.id === chunkArg.id
                ) : void 0;
                if (existingUIPart != null) {
                  existingUIPart.data = dataChunk.data;
                } else {
                  state.message.parts.push(dataChunk);
                }
                onData == null ? void 0 : onData(dataChunk);
                write();
              }
            }
          }
          controller.enqueue(chunk);
        });
      }
    })
  );
}

// src/ui-message-stream/handle-ui-message-stream-finish.ts
function handleUIMessageStreamFinish({
  messageId,
  originalMessages = [],
  onFinish,
  onError,
  stream
}) {
  let lastMessage = originalMessages == null ? void 0 : originalMessages[originalMessages.length - 1];
  if ((lastMessage == null ? void 0 : lastMessage.role) !== "assistant") {
    lastMessage = void 0;
  } else {
    messageId = lastMessage.id;
  }
  let isAborted = false;
  const idInjectedStream = stream.pipeThrough(
    new TransformStream({
      transform(chunk, controller) {
        if (chunk.type === "start") {
          const startChunk = chunk;
          if (startChunk.messageId == null && messageId != null) {
            startChunk.messageId = messageId;
          }
        }
        if (chunk.type === "abort") {
          isAborted = true;
        }
        controller.enqueue(chunk);
      }
    })
  );
  if (onFinish == null) {
    return idInjectedStream;
  }
  const state = createStreamingUIMessageState({
    lastMessage: lastMessage ? structuredClone(lastMessage) : void 0,
    messageId: messageId != null ? messageId : ""
    // will be overridden by the stream
  });
  const runUpdateMessageJob = async (job) => {
    await job({ state, write: () => {
    } });
  };
  let finishCalled = false;
  const callOnFinish = async () => {
    if (finishCalled || !onFinish) {
      return;
    }
    finishCalled = true;
    const isContinuation = state.message.id === (lastMessage == null ? void 0 : lastMessage.id);
    await onFinish({
      isAborted,
      isContinuation,
      responseMessage: state.message,
      messages: [
        ...isContinuation ? originalMessages.slice(0, -1) : originalMessages,
        state.message
      ],
      finishReason: state.finishReason
    });
  };
  return processUIMessageStream({
    stream: idInjectedStream,
    runUpdateMessageJob,
    onError
  }).pipeThrough(
    new TransformStream({
      transform(chunk, controller) {
        controller.enqueue(chunk);
      },
      // @ts-expect-error cancel is still new and missing from types https://developer.mozilla.org/en-US/docs/Web/API/TransformStream#browser_compatibility
      async cancel() {
        await callOnFinish();
      },
      async flush() {
        await callOnFinish();
      }
    })
  );
}

// src/ui-message-stream/pipe-ui-message-stream-to-response.ts
function pipeUIMessageStreamToResponse({
  response,
  status,
  statusText,
  headers,
  stream,
  consumeSseStream
}) {
  let sseStream = stream.pipeThrough(new JsonToSseTransformStream());
  if (consumeSseStream) {
    const [stream1, stream2] = sseStream.tee();
    sseStream = stream1;
    consumeSseStream({ stream: stream2 });
  }
  writeToServerResponse({
    response,
    status,
    statusText,
    headers: Object.fromEntries(
      prepareHeaders(headers, UI_MESSAGE_STREAM_HEADERS).entries()
    ),
    stream: sseStream.pipeThrough(new TextEncoderStream())
  });
}

// src/util/async-iterable-stream.ts
function createAsyncIterableStream(source) {
  const stream = source.pipeThrough(new TransformStream());
  stream[Symbol.asyncIterator] = function() {
    const reader = this.getReader();
    let finished = false;
    async function cleanup(cancelStream) {
      var _a16;
      finished = true;
      try {
        {
          await ((_a16 = reader.cancel) == null ? void 0 : _a16.call(reader));
        }
      } finally {
        try {
          reader.releaseLock();
        } catch (e) {
        }
      }
    }
    return {
      /**
       * Reads the next chunk from the stream.
       * @returns A promise resolving to the next IteratorResult.
       */
      async next() {
        if (finished) {
          return { done: true, value: void 0 };
        }
        const { done, value } = await reader.read();
        if (done) {
          await cleanup();
          return { done: true, value: void 0 };
        }
        return { done: false, value };
      },
      /**
       * Called on early exit (e.g., break from for-await).
       * Ensures the stream is cancelled and resources are released.
       * @returns A promise resolving to a completed IteratorResult.
       */
      async return() {
        await cleanup();
        return { done: true, value: void 0 };
      },
      /**
       * Called on early exit with error.
       * Ensures the stream is cancelled and resources are released, then rethrows the error.
       * @param err The error to throw.
       * @returns A promise that rejects with the provided error.
       */
      async throw(err) {
        await cleanup();
        throw err;
      }
    };
  };
  return stream;
}

// src/util/consume-stream.ts
async function consumeStream({
  stream,
  onError
}) {
  const reader = stream.getReader();
  try {
    while (true) {
      const { done } = await reader.read();
      if (done)
        break;
    }
  } catch (error) {
    onError == null ? void 0 : onError(error);
  } finally {
    reader.releaseLock();
  }
}

// src/util/create-resolvable-promise.ts
function createResolvablePromise() {
  let resolve2;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve2 = res;
    reject = rej;
  });
  return {
    promise,
    resolve: resolve2,
    reject
  };
}

// src/util/create-stitchable-stream.ts
function createStitchableStream() {
  let innerStreamReaders = [];
  let controller = null;
  let isClosed = false;
  let waitForNewStream = createResolvablePromise();
  const terminate = () => {
    isClosed = true;
    waitForNewStream.resolve();
    innerStreamReaders.forEach((reader) => reader.cancel());
    innerStreamReaders = [];
    controller == null ? void 0 : controller.close();
  };
  const processPull = async () => {
    if (isClosed && innerStreamReaders.length === 0) {
      controller == null ? void 0 : controller.close();
      return;
    }
    if (innerStreamReaders.length === 0) {
      waitForNewStream = createResolvablePromise();
      await waitForNewStream.promise;
      return processPull();
    }
    try {
      const { value, done } = await innerStreamReaders[0].read();
      if (done) {
        innerStreamReaders.shift();
        if (innerStreamReaders.length > 0) {
          await processPull();
        } else if (isClosed) {
          controller == null ? void 0 : controller.close();
        }
      } else {
        controller == null ? void 0 : controller.enqueue(value);
      }
    } catch (error) {
      controller == null ? void 0 : controller.error(error);
      innerStreamReaders.shift();
      terminate();
    }
  };
  return {
    stream: new ReadableStream({
      start(controllerParam) {
        controller = controllerParam;
      },
      pull: processPull,
      async cancel() {
        for (const reader of innerStreamReaders) {
          await reader.cancel();
        }
        innerStreamReaders = [];
        isClosed = true;
      }
    }),
    addStream: (innerStream) => {
      if (isClosed) {
        throw new Error("Cannot add inner stream: outer stream is closed");
      }
      innerStreamReaders.push(innerStream.getReader());
      waitForNewStream.resolve();
    },
    /**
     * Gracefully close the outer stream. This will let the inner streams
     * finish processing and then close the outer stream.
     */
    close: () => {
      isClosed = true;
      waitForNewStream.resolve();
      if (innerStreamReaders.length === 0) {
        controller == null ? void 0 : controller.close();
      }
    },
    /**
     * Immediately close the outer stream. This will cancel all inner streams
     * and close the outer stream.
     */
    terminate
  };
}

// src/util/now.ts
function now() {
  var _a16, _b;
  return (_b = (_a16 = globalThis == null ? void 0 : globalThis.performance) == null ? void 0 : _a16.now()) != null ? _b : Date.now();
}
function runToolsTransformation({
  tools,
  generatorStream,
  tracer,
  telemetry,
  system,
  messages,
  abortSignal,
  repairToolCall,
  experimental_context
}) {
  let toolResultsStreamController = null;
  const toolResultsStream = new ReadableStream({
    start(controller) {
      toolResultsStreamController = controller;
    }
  });
  const outstandingToolResults = /* @__PURE__ */ new Set();
  const toolInputs = /* @__PURE__ */ new Map();
  let canClose = false;
  let finishChunk = void 0;
  function attemptClose() {
    if (canClose && outstandingToolResults.size === 0) {
      if (finishChunk != null) {
        toolResultsStreamController.enqueue(finishChunk);
      }
      toolResultsStreamController.close();
    }
  }
  const forwardStream = new TransformStream({
    async transform(chunk, controller) {
      const chunkType = chunk.type;
      switch (chunkType) {
        case "stream-start":
        case "text-start":
        case "text-delta":
        case "text-end":
        case "reasoning-start":
        case "reasoning-delta":
        case "reasoning-end":
        case "tool-input-start":
        case "tool-input-delta":
        case "tool-input-end":
        case "source":
        case "response-metadata":
        case "error":
        case "raw": {
          controller.enqueue(chunk);
          break;
        }
        case "file": {
          controller.enqueue({
            type: "file",
            file: new DefaultGeneratedFileWithType({
              data: chunk.data,
              mediaType: chunk.mediaType
            })
          });
          break;
        }
        case "finish": {
          finishChunk = {
            type: "finish",
            finishReason: chunk.finishReason,
            usage: chunk.usage,
            providerMetadata: chunk.providerMetadata
          };
          break;
        }
        case "tool-call": {
          try {
            const toolCall = await parseToolCall({
              toolCall: chunk,
              tools,
              repairToolCall,
              system,
              messages
            });
            controller.enqueue(toolCall);
            if (toolCall.invalid) {
              toolResultsStreamController.enqueue({
                type: "tool-error",
                toolCallId: toolCall.toolCallId,
                toolName: toolCall.toolName,
                input: toolCall.input,
                error: getErrorMessage(toolCall.error),
                dynamic: true
              });
              break;
            }
            const tool2 = tools[toolCall.toolName];
            toolInputs.set(toolCall.toolCallId, toolCall.input);
            if (tool2.onInputAvailable != null) {
              await tool2.onInputAvailable({
                input: toolCall.input,
                toolCallId: toolCall.toolCallId,
                messages,
                abortSignal,
                experimental_context
              });
            }
            if (tool2.execute != null && toolCall.providerExecuted !== true) {
              const toolExecutionId = generateId();
              outstandingToolResults.add(toolExecutionId);
              recordSpan({
                name: "ai.toolCall",
                attributes: selectTelemetryAttributes({
                  telemetry,
                  attributes: {
                    ...assembleOperationName({
                      operationId: "ai.toolCall",
                      telemetry
                    }),
                    "ai.toolCall.name": toolCall.toolName,
                    "ai.toolCall.id": toolCall.toolCallId,
                    "ai.toolCall.args": {
                      output: () => JSON.stringify(toolCall.input)
                    }
                  }
                }),
                tracer,
                fn: async (span) => {
                  let output;
                  try {
                    const stream = executeTool({
                      execute: tool2.execute.bind(tool2),
                      input: toolCall.input,
                      options: {
                        toolCallId: toolCall.toolCallId,
                        messages,
                        abortSignal,
                        experimental_context
                      }
                    });
                    for await (const part of stream) {
                      toolResultsStreamController.enqueue({
                        ...toolCall,
                        type: "tool-result",
                        output: part.output,
                        ...part.type === "preliminary" && {
                          preliminary: true
                        }
                      });
                      if (part.type === "final") {
                        output = part.output;
                      }
                    }
                  } catch (error) {
                    recordErrorOnSpan(span, error);
                    toolResultsStreamController.enqueue({
                      ...toolCall,
                      type: "tool-error",
                      error
                    });
                    outstandingToolResults.delete(toolExecutionId);
                    attemptClose();
                    return;
                  }
                  outstandingToolResults.delete(toolExecutionId);
                  attemptClose();
                  try {
                    span.setAttributes(
                      selectTelemetryAttributes({
                        telemetry,
                        attributes: {
                          "ai.toolCall.result": {
                            output: () => JSON.stringify(output)
                          }
                        }
                      })
                    );
                  } catch (ignored) {
                  }
                }
              });
            }
          } catch (error) {
            toolResultsStreamController.enqueue({ type: "error", error });
          }
          break;
        }
        case "tool-result": {
          const toolName = chunk.toolName;
          if (chunk.isError) {
            toolResultsStreamController.enqueue({
              type: "tool-error",
              toolCallId: chunk.toolCallId,
              toolName,
              input: toolInputs.get(chunk.toolCallId),
              providerExecuted: chunk.providerExecuted,
              error: chunk.result
            });
          } else {
            controller.enqueue({
              type: "tool-result",
              toolCallId: chunk.toolCallId,
              toolName,
              input: toolInputs.get(chunk.toolCallId),
              output: chunk.result,
              providerExecuted: chunk.providerExecuted
            });
          }
          break;
        }
        default: {
          const _exhaustiveCheck = chunkType;
          throw new Error(`Unhandled chunk type: ${_exhaustiveCheck}`);
        }
      }
    },
    flush() {
      canClose = true;
      attemptClose();
    }
  });
  return new ReadableStream({
    async start(controller) {
      return Promise.all([
        generatorStream.pipeThrough(forwardStream).pipeTo(
          new WritableStream({
            write(chunk) {
              controller.enqueue(chunk);
            },
            close() {
            }
          })
        ),
        toolResultsStream.pipeTo(
          new WritableStream({
            write(chunk) {
              controller.enqueue(chunk);
            },
            close() {
              controller.close();
            }
          })
        )
      ]);
    }
  });
}

// src/generate-text/stream-text.ts
var originalGenerateId2 = createIdGenerator({
  prefix: "aitxt",
  size: 24
});
function streamText({
  model,
  tools,
  toolChoice,
  system,
  prompt,
  messages,
  maxRetries,
  abortSignal,
  headers,
  stopWhen = stepCountIs(1),
  experimental_output: output,
  experimental_telemetry: telemetry,
  prepareStep,
  providerOptions,
  experimental_activeTools,
  activeTools = experimental_activeTools,
  experimental_repairToolCall: repairToolCall,
  experimental_transform: transform,
  experimental_download: download2,
  includeRawChunks = false,
  onChunk,
  onError = ({ error }) => {
    console.error(error);
  },
  onFinish,
  onAbort,
  onStepFinish,
  experimental_context,
  _internal: {
    now: now2 = now,
    generateId: generateId3 = originalGenerateId2,
    currentDate = () => /* @__PURE__ */ new Date()
  } = {},
  ...settings
}) {
  return new DefaultStreamTextResult({
    model: resolveLanguageModel(model),
    telemetry,
    headers,
    settings,
    maxRetries,
    abortSignal,
    system,
    prompt,
    messages,
    tools,
    toolChoice,
    transforms: asArray(transform),
    activeTools,
    repairToolCall,
    stopConditions: asArray(stopWhen),
    output,
    providerOptions,
    prepareStep,
    includeRawChunks,
    onChunk,
    onError,
    onFinish,
    onAbort,
    onStepFinish,
    now: now2,
    currentDate,
    generateId: generateId3,
    experimental_context,
    download: download2
  });
}
function createOutputTransformStream(output) {
  if (!output) {
    return new TransformStream({
      transform(chunk, controller) {
        controller.enqueue({ part: chunk, partialOutput: void 0 });
      }
    });
  }
  let firstTextChunkId = void 0;
  let text2 = "";
  let textChunk = "";
  let lastPublishedJson = "";
  function publishTextChunk({
    controller,
    partialOutput = void 0
  }) {
    controller.enqueue({
      part: {
        type: "text-delta",
        id: firstTextChunkId,
        text: textChunk
      },
      partialOutput
    });
    textChunk = "";
  }
  return new TransformStream({
    async transform(chunk, controller) {
      if (chunk.type === "finish-step" && textChunk.length > 0) {
        publishTextChunk({ controller });
      }
      if (chunk.type !== "text-delta" && chunk.type !== "text-start" && chunk.type !== "text-end") {
        controller.enqueue({ part: chunk, partialOutput: void 0 });
        return;
      }
      if (firstTextChunkId == null) {
        firstTextChunkId = chunk.id;
      } else if (chunk.id !== firstTextChunkId) {
        controller.enqueue({ part: chunk, partialOutput: void 0 });
        return;
      }
      if (chunk.type === "text-start") {
        controller.enqueue({ part: chunk, partialOutput: void 0 });
        return;
      }
      if (chunk.type === "text-end") {
        if (textChunk.length > 0) {
          publishTextChunk({ controller });
        }
        controller.enqueue({ part: chunk, partialOutput: void 0 });
        return;
      }
      text2 += chunk.text;
      textChunk += chunk.text;
      const result = await output.parsePartial({ text: text2 });
      if (result != null) {
        const currentJson = JSON.stringify(result.partial);
        if (currentJson !== lastPublishedJson) {
          publishTextChunk({ controller, partialOutput: result.partial });
          lastPublishedJson = currentJson;
        }
      }
    }
  });
}
var DefaultStreamTextResult = class {
  constructor({
    model,
    telemetry,
    headers,
    settings,
    maxRetries: maxRetriesArg,
    abortSignal,
    system,
    prompt,
    messages,
    tools,
    toolChoice,
    transforms,
    activeTools,
    repairToolCall,
    stopConditions,
    output,
    providerOptions,
    prepareStep,
    includeRawChunks,
    now: now2,
    currentDate,
    generateId: generateId3,
    onChunk,
    onError,
    onFinish,
    onAbort,
    onStepFinish,
    experimental_context,
    download: download2
  }) {
    this._totalUsage = new DelayedPromise();
    this._finishReason = new DelayedPromise();
    this._steps = new DelayedPromise();
    this.output = output;
    this.includeRawChunks = includeRawChunks;
    this.tools = tools;
    let stepFinish;
    let recordedContent = [];
    const recordedResponseMessages = [];
    let recordedFinishReason = void 0;
    let recordedTotalUsage = void 0;
    let recordedRequest = {};
    let recordedWarnings = [];
    const recordedSteps = [];
    let rootSpan;
    let activeTextContent = {};
    let activeReasoningContent = {};
    const eventProcessor = new TransformStream({
      async transform(chunk, controller) {
        var _a16, _b, _c, _d;
        controller.enqueue(chunk);
        const { part } = chunk;
        if (part.type === "text-delta" || part.type === "reasoning-delta" || part.type === "source" || part.type === "tool-call" || part.type === "tool-result" || part.type === "tool-input-start" || part.type === "tool-input-delta" || part.type === "raw") {
          await (onChunk == null ? void 0 : onChunk({ chunk: part }));
        }
        if (part.type === "error") {
          await onError({ error: wrapGatewayError(part.error) });
        }
        if (part.type === "text-start") {
          activeTextContent[part.id] = {
            type: "text",
            text: "",
            providerMetadata: part.providerMetadata
          };
          recordedContent.push(activeTextContent[part.id]);
        }
        if (part.type === "text-delta") {
          const activeText = activeTextContent[part.id];
          if (activeText == null) {
            controller.enqueue({
              part: {
                type: "error",
                error: `text part ${part.id} not found`
              },
              partialOutput: void 0
            });
            return;
          }
          activeText.text += part.text;
          activeText.providerMetadata = (_a16 = part.providerMetadata) != null ? _a16 : activeText.providerMetadata;
        }
        if (part.type === "text-end") {
          const activeText = activeTextContent[part.id];
          if (activeText == null) {
            controller.enqueue({
              part: {
                type: "error",
                error: `text part ${part.id} not found`
              },
              partialOutput: void 0
            });
            return;
          }
          activeText.providerMetadata = (_b = part.providerMetadata) != null ? _b : activeText.providerMetadata;
          delete activeTextContent[part.id];
        }
        if (part.type === "reasoning-start") {
          activeReasoningContent[part.id] = {
            type: "reasoning",
            text: "",
            providerMetadata: part.providerMetadata
          };
          recordedContent.push(activeReasoningContent[part.id]);
        }
        if (part.type === "reasoning-delta") {
          const activeReasoning = activeReasoningContent[part.id];
          if (activeReasoning == null) {
            controller.enqueue({
              part: {
                type: "error",
                error: `reasoning part ${part.id} not found`
              },
              partialOutput: void 0
            });
            return;
          }
          activeReasoning.text += part.text;
          activeReasoning.providerMetadata = (_c = part.providerMetadata) != null ? _c : activeReasoning.providerMetadata;
        }
        if (part.type === "reasoning-end") {
          const activeReasoning = activeReasoningContent[part.id];
          if (activeReasoning == null) {
            controller.enqueue({
              part: {
                type: "error",
                error: `reasoning part ${part.id} not found`
              },
              partialOutput: void 0
            });
            return;
          }
          activeReasoning.providerMetadata = (_d = part.providerMetadata) != null ? _d : activeReasoning.providerMetadata;
          delete activeReasoningContent[part.id];
        }
        if (part.type === "file") {
          recordedContent.push({ type: "file", file: part.file });
        }
        if (part.type === "source") {
          recordedContent.push(part);
        }
        if (part.type === "tool-call") {
          recordedContent.push(part);
        }
        if (part.type === "tool-result" && !part.preliminary) {
          recordedContent.push(part);
        }
        if (part.type === "tool-error") {
          recordedContent.push(part);
        }
        if (part.type === "start-step") {
          recordedRequest = part.request;
          recordedWarnings = part.warnings;
        }
        if (part.type === "finish-step") {
          const stepMessages = toResponseMessages({
            content: recordedContent,
            tools
          });
          const currentStepResult = new DefaultStepResult({
            content: recordedContent,
            finishReason: part.finishReason,
            usage: part.usage,
            warnings: recordedWarnings,
            request: recordedRequest,
            response: {
              ...part.response,
              messages: [...recordedResponseMessages, ...stepMessages]
            },
            providerMetadata: part.providerMetadata
          });
          await (onStepFinish == null ? void 0 : onStepFinish(currentStepResult));
          logWarnings(recordedWarnings);
          recordedSteps.push(currentStepResult);
          recordedContent = [];
          activeReasoningContent = {};
          activeTextContent = {};
          recordedResponseMessages.push(...stepMessages);
          stepFinish.resolve();
        }
        if (part.type === "finish") {
          recordedTotalUsage = part.totalUsage;
          recordedFinishReason = part.finishReason;
        }
      },
      async flush(controller) {
        try {
          if (recordedSteps.length === 0) {
            const error = new NoOutputGeneratedError({
              message: "No output generated. Check the stream for errors."
            });
            self._finishReason.reject(error);
            self._totalUsage.reject(error);
            self._steps.reject(error);
            return;
          }
          const finishReason = recordedFinishReason != null ? recordedFinishReason : "unknown";
          const totalUsage = recordedTotalUsage != null ? recordedTotalUsage : {
            inputTokens: void 0,
            outputTokens: void 0,
            totalTokens: void 0
          };
          self._finishReason.resolve(finishReason);
          self._totalUsage.resolve(totalUsage);
          self._steps.resolve(recordedSteps);
          const finalStep = recordedSteps[recordedSteps.length - 1];
          await (onFinish == null ? void 0 : onFinish({
            finishReason,
            totalUsage,
            usage: finalStep.usage,
            content: finalStep.content,
            text: finalStep.text,
            reasoningText: finalStep.reasoningText,
            reasoning: finalStep.reasoning,
            files: finalStep.files,
            sources: finalStep.sources,
            toolCalls: finalStep.toolCalls,
            staticToolCalls: finalStep.staticToolCalls,
            dynamicToolCalls: finalStep.dynamicToolCalls,
            toolResults: finalStep.toolResults,
            staticToolResults: finalStep.staticToolResults,
            dynamicToolResults: finalStep.dynamicToolResults,
            request: finalStep.request,
            response: finalStep.response,
            warnings: finalStep.warnings,
            providerMetadata: finalStep.providerMetadata,
            steps: recordedSteps
          }));
          rootSpan.setAttributes(
            selectTelemetryAttributes({
              telemetry,
              attributes: {
                "ai.response.finishReason": finishReason,
                "ai.response.text": { output: () => finalStep.text },
                "ai.response.toolCalls": {
                  output: () => {
                    var _a16;
                    return ((_a16 = finalStep.toolCalls) == null ? void 0 : _a16.length) ? JSON.stringify(finalStep.toolCalls) : void 0;
                  }
                },
                "ai.response.providerMetadata": JSON.stringify(
                  finalStep.providerMetadata
                ),
                "ai.usage.inputTokens": totalUsage.inputTokens,
                "ai.usage.outputTokens": totalUsage.outputTokens,
                "ai.usage.totalTokens": totalUsage.totalTokens,
                "ai.usage.reasoningTokens": totalUsage.reasoningTokens,
                "ai.usage.cachedInputTokens": totalUsage.cachedInputTokens
              }
            })
          );
        } catch (error) {
          controller.error(error);
        } finally {
          rootSpan.end();
        }
      }
    });
    const stitchableStream = createStitchableStream();
    this.addStream = stitchableStream.addStream;
    this.closeStream = stitchableStream.close;
    const reader = stitchableStream.stream.getReader();
    let stream = new ReadableStream({
      async start(controller) {
        controller.enqueue({ type: "start" });
      },
      async pull(controller) {
        function abort() {
          onAbort == null ? void 0 : onAbort({ steps: recordedSteps });
          controller.enqueue({ type: "abort" });
          controller.close();
        }
        try {
          const { done, value } = await reader.read();
          if (done) {
            controller.close();
            return;
          }
          if (abortSignal == null ? void 0 : abortSignal.aborted) {
            abort();
            return;
          }
          controller.enqueue(value);
        } catch (error) {
          if (isAbortError(error) && (abortSignal == null ? void 0 : abortSignal.aborted)) {
            abort();
          } else {
            controller.error(error);
          }
        }
      },
      cancel(reason) {
        return stitchableStream.stream.cancel(reason);
      }
    });
    for (const transform of transforms) {
      stream = stream.pipeThrough(
        transform({
          tools,
          stopStream() {
            stitchableStream.terminate();
          }
        })
      );
    }
    this.baseStream = stream.pipeThrough(createOutputTransformStream(output)).pipeThrough(eventProcessor);
    const { maxRetries, retry } = prepareRetries({
      maxRetries: maxRetriesArg,
      abortSignal
    });
    const tracer = getTracer(telemetry);
    const callSettings = prepareCallSettings(settings);
    const baseTelemetryAttributes = getBaseTelemetryAttributes({
      model,
      telemetry,
      headers,
      settings: { ...callSettings, maxRetries }
    });
    const self = this;
    recordSpan({
      name: "ai.streamText",
      attributes: selectTelemetryAttributes({
        telemetry,
        attributes: {
          ...assembleOperationName({ operationId: "ai.streamText", telemetry }),
          ...baseTelemetryAttributes,
          // specific settings that only make sense on the outer level:
          "ai.prompt": {
            input: () => JSON.stringify({ system, prompt, messages })
          }
        }
      }),
      tracer,
      endWhenDone: false,
      fn: async (rootSpanArg) => {
        rootSpan = rootSpanArg;
        async function streamStep({
          currentStep,
          responseMessages,
          usage
        }) {
          var _a16, _b, _c, _d, _e;
          const includeRawChunks2 = self.includeRawChunks;
          stepFinish = new DelayedPromise();
          const initialPrompt = await standardizePrompt({
            system,
            prompt,
            messages
          });
          const stepInputMessages = [
            ...initialPrompt.messages,
            ...responseMessages
          ];
          const prepareStepResult = await (prepareStep == null ? void 0 : prepareStep({
            model,
            steps: recordedSteps,
            stepNumber: recordedSteps.length,
            messages: stepInputMessages
          }));
          const stepModel = resolveLanguageModel(
            (_a16 = prepareStepResult == null ? void 0 : prepareStepResult.model) != null ? _a16 : model
          );
          const promptMessages = await convertToLanguageModelPrompt({
            prompt: {
              system: (_b = prepareStepResult == null ? void 0 : prepareStepResult.system) != null ? _b : initialPrompt.system,
              messages: (_c = prepareStepResult == null ? void 0 : prepareStepResult.messages) != null ? _c : stepInputMessages
            },
            supportedUrls: await stepModel.supportedUrls,
            download: download2
          });
          const { toolChoice: stepToolChoice, tools: stepTools } = prepareToolsAndToolChoice({
            tools,
            toolChoice: (_d = prepareStepResult == null ? void 0 : prepareStepResult.toolChoice) != null ? _d : toolChoice,
            activeTools: (_e = prepareStepResult == null ? void 0 : prepareStepResult.activeTools) != null ? _e : activeTools
          });
          const {
            result: { stream: stream2, response, request },
            doStreamSpan,
            startTimestampMs
          } = await retry(
            () => recordSpan({
              name: "ai.streamText.doStream",
              attributes: selectTelemetryAttributes({
                telemetry,
                attributes: {
                  ...assembleOperationName({
                    operationId: "ai.streamText.doStream",
                    telemetry
                  }),
                  ...baseTelemetryAttributes,
                  // model:
                  "ai.model.provider": stepModel.provider,
                  "ai.model.id": stepModel.modelId,
                  // prompt:
                  "ai.prompt.messages": {
                    input: () => stringifyForTelemetry(promptMessages)
                  },
                  "ai.prompt.tools": {
                    // convert the language model level tools:
                    input: () => stepTools == null ? void 0 : stepTools.map((tool2) => JSON.stringify(tool2))
                  },
                  "ai.prompt.toolChoice": {
                    input: () => stepToolChoice != null ? JSON.stringify(stepToolChoice) : void 0
                  },
                  // standardized gen-ai llm span attributes:
                  "gen_ai.system": stepModel.provider,
                  "gen_ai.request.model": stepModel.modelId,
                  "gen_ai.request.frequency_penalty": callSettings.frequencyPenalty,
                  "gen_ai.request.max_tokens": callSettings.maxOutputTokens,
                  "gen_ai.request.presence_penalty": callSettings.presencePenalty,
                  "gen_ai.request.stop_sequences": callSettings.stopSequences,
                  "gen_ai.request.temperature": callSettings.temperature,
                  "gen_ai.request.top_k": callSettings.topK,
                  "gen_ai.request.top_p": callSettings.topP
                }
              }),
              tracer,
              endWhenDone: false,
              fn: async (doStreamSpan2) => {
                return {
                  startTimestampMs: now2(),
                  // get before the call
                  doStreamSpan: doStreamSpan2,
                  result: await stepModel.doStream({
                    ...callSettings,
                    tools: stepTools,
                    toolChoice: stepToolChoice,
                    responseFormat: output == null ? void 0 : output.responseFormat,
                    prompt: promptMessages,
                    providerOptions,
                    abortSignal,
                    headers,
                    includeRawChunks: includeRawChunks2
                  })
                };
              }
            })
          );
          const streamWithToolResults = runToolsTransformation({
            tools,
            generatorStream: stream2,
            tracer,
            telemetry,
            system,
            messages: stepInputMessages,
            repairToolCall,
            abortSignal,
            experimental_context
          });
          const stepRequest = request != null ? request : {};
          const stepToolCalls = [];
          const stepToolOutputs = [];
          let warnings;
          const activeToolCallToolNames = {};
          let stepFinishReason = "unknown";
          let stepUsage = {
            inputTokens: void 0,
            outputTokens: void 0,
            totalTokens: void 0
          };
          let stepProviderMetadata;
          let stepFirstChunk = true;
          let stepResponse = {
            id: generateId3(),
            timestamp: currentDate(),
            modelId: model.modelId
          };
          let activeText = "";
          self.addStream(
            streamWithToolResults.pipeThrough(
              new TransformStream({
                async transform(chunk, controller) {
                  var _a17, _b2, _c2, _d2;
                  if (chunk.type === "stream-start") {
                    warnings = chunk.warnings;
                    return;
                  }
                  if (stepFirstChunk) {
                    const msToFirstChunk = now2() - startTimestampMs;
                    stepFirstChunk = false;
                    doStreamSpan.addEvent("ai.stream.firstChunk", {
                      "ai.response.msToFirstChunk": msToFirstChunk
                    });
                    doStreamSpan.setAttributes({
                      "ai.response.msToFirstChunk": msToFirstChunk
                    });
                    controller.enqueue({
                      type: "start-step",
                      request: stepRequest,
                      warnings: warnings != null ? warnings : []
                    });
                  }
                  const chunkType = chunk.type;
                  switch (chunkType) {
                    case "text-start":
                    case "text-end": {
                      controller.enqueue(chunk);
                      break;
                    }
                    case "text-delta": {
                      if (chunk.delta.length > 0) {
                        controller.enqueue({
                          type: "text-delta",
                          id: chunk.id,
                          text: chunk.delta,
                          providerMetadata: chunk.providerMetadata
                        });
                        activeText += chunk.delta;
                      }
                      break;
                    }
                    case "reasoning-start":
                    case "reasoning-end": {
                      controller.enqueue(chunk);
                      break;
                    }
                    case "reasoning-delta": {
                      controller.enqueue({
                        type: "reasoning-delta",
                        id: chunk.id,
                        text: chunk.delta,
                        providerMetadata: chunk.providerMetadata
                      });
                      break;
                    }
                    case "tool-call": {
                      controller.enqueue(chunk);
                      stepToolCalls.push(chunk);
                      break;
                    }
                    case "tool-result": {
                      controller.enqueue(chunk);
                      if (!chunk.preliminary) {
                        stepToolOutputs.push(chunk);
                      }
                      break;
                    }
                    case "tool-error": {
                      controller.enqueue(chunk);
                      stepToolOutputs.push(chunk);
                      break;
                    }
                    case "response-metadata": {
                      stepResponse = {
                        id: (_a17 = chunk.id) != null ? _a17 : stepResponse.id,
                        timestamp: (_b2 = chunk.timestamp) != null ? _b2 : stepResponse.timestamp,
                        modelId: (_c2 = chunk.modelId) != null ? _c2 : stepResponse.modelId
                      };
                      break;
                    }
                    case "finish": {
                      stepUsage = chunk.usage;
                      stepFinishReason = chunk.finishReason;
                      stepProviderMetadata = chunk.providerMetadata;
                      const msToFinish = now2() - startTimestampMs;
                      doStreamSpan.addEvent("ai.stream.finish");
                      doStreamSpan.setAttributes({
                        "ai.response.msToFinish": msToFinish,
                        "ai.response.avgOutputTokensPerSecond": 1e3 * ((_d2 = stepUsage.outputTokens) != null ? _d2 : 0) / msToFinish
                      });
                      break;
                    }
                    case "file": {
                      controller.enqueue(chunk);
                      break;
                    }
                    case "source": {
                      controller.enqueue(chunk);
                      break;
                    }
                    case "tool-input-start": {
                      activeToolCallToolNames[chunk.id] = chunk.toolName;
                      const tool2 = tools == null ? void 0 : tools[chunk.toolName];
                      if ((tool2 == null ? void 0 : tool2.onInputStart) != null) {
                        await tool2.onInputStart({
                          toolCallId: chunk.id,
                          messages: stepInputMessages,
                          abortSignal,
                          experimental_context
                        });
                      }
                      controller.enqueue({
                        ...chunk,
                        dynamic: (tool2 == null ? void 0 : tool2.type) === "dynamic"
                      });
                      break;
                    }
                    case "tool-input-end": {
                      delete activeToolCallToolNames[chunk.id];
                      controller.enqueue(chunk);
                      break;
                    }
                    case "tool-input-delta": {
                      const toolName = activeToolCallToolNames[chunk.id];
                      const tool2 = tools == null ? void 0 : tools[toolName];
                      if ((tool2 == null ? void 0 : tool2.onInputDelta) != null) {
                        await tool2.onInputDelta({
                          inputTextDelta: chunk.delta,
                          toolCallId: chunk.id,
                          messages: stepInputMessages,
                          abortSignal,
                          experimental_context
                        });
                      }
                      controller.enqueue(chunk);
                      break;
                    }
                    case "error": {
                      controller.enqueue(chunk);
                      stepFinishReason = "error";
                      break;
                    }
                    case "raw": {
                      if (includeRawChunks2) {
                        controller.enqueue(chunk);
                      }
                      break;
                    }
                    default: {
                      const exhaustiveCheck = chunkType;
                      throw new Error(`Unknown chunk type: ${exhaustiveCheck}`);
                    }
                  }
                },
                // invoke onFinish callback and resolve toolResults promise when the stream is about to close:
                async flush(controller) {
                  const stepToolCallsJson = stepToolCalls.length > 0 ? JSON.stringify(stepToolCalls) : void 0;
                  try {
                    doStreamSpan.setAttributes(
                      selectTelemetryAttributes({
                        telemetry,
                        attributes: {
                          "ai.response.finishReason": stepFinishReason,
                          "ai.response.text": {
                            output: () => activeText
                          },
                          "ai.response.toolCalls": {
                            output: () => stepToolCallsJson
                          },
                          "ai.response.id": stepResponse.id,
                          "ai.response.model": stepResponse.modelId,
                          "ai.response.timestamp": stepResponse.timestamp.toISOString(),
                          "ai.response.providerMetadata": JSON.stringify(stepProviderMetadata),
                          "ai.usage.inputTokens": stepUsage.inputTokens,
                          "ai.usage.outputTokens": stepUsage.outputTokens,
                          "ai.usage.totalTokens": stepUsage.totalTokens,
                          "ai.usage.reasoningTokens": stepUsage.reasoningTokens,
                          "ai.usage.cachedInputTokens": stepUsage.cachedInputTokens,
                          // standardized gen-ai llm span attributes:
                          "gen_ai.response.finish_reasons": [stepFinishReason],
                          "gen_ai.response.id": stepResponse.id,
                          "gen_ai.response.model": stepResponse.modelId,
                          "gen_ai.usage.input_tokens": stepUsage.inputTokens,
                          "gen_ai.usage.output_tokens": stepUsage.outputTokens
                        }
                      })
                    );
                  } catch (error) {
                  } finally {
                    doStreamSpan.end();
                  }
                  controller.enqueue({
                    type: "finish-step",
                    finishReason: stepFinishReason,
                    usage: stepUsage,
                    providerMetadata: stepProviderMetadata,
                    response: {
                      ...stepResponse,
                      headers: response == null ? void 0 : response.headers
                    }
                  });
                  const combinedUsage = addLanguageModelUsage(usage, stepUsage);
                  await stepFinish.promise;
                  const clientToolCalls = stepToolCalls.filter(
                    (toolCall) => toolCall.providerExecuted !== true
                  );
                  const clientToolOutputs = stepToolOutputs.filter(
                    (toolOutput) => toolOutput.providerExecuted !== true
                  );
                  if (clientToolCalls.length > 0 && // all current tool calls have outputs (incl. execution errors):
                  clientToolOutputs.length === clientToolCalls.length && // continue until a stop condition is met:
                  !await isStopConditionMet({
                    stopConditions,
                    steps: recordedSteps
                  })) {
                    responseMessages.push(
                      ...toResponseMessages({
                        content: (
                          // use transformed content to create the messages for the next step:
                          recordedSteps[recordedSteps.length - 1].content
                        ),
                        tools
                      })
                    );
                    try {
                      await streamStep({
                        currentStep: currentStep + 1,
                        responseMessages,
                        usage: combinedUsage
                      });
                    } catch (error) {
                      controller.enqueue({
                        type: "error",
                        error
                      });
                      self.closeStream();
                    }
                  } else {
                    controller.enqueue({
                      type: "finish",
                      finishReason: stepFinishReason,
                      totalUsage: combinedUsage
                    });
                    self.closeStream();
                  }
                }
              })
            )
          );
        }
        await streamStep({
          currentStep: 0,
          responseMessages: [],
          usage: {
            inputTokens: void 0,
            outputTokens: void 0,
            totalTokens: void 0
          }
        });
      }
    }).catch((error) => {
      self.addStream(
        new ReadableStream({
          start(controller) {
            controller.enqueue({ type: "error", error });
            controller.close();
          }
        })
      );
      self.closeStream();
    });
  }
  get steps() {
    this.consumeStream();
    return this._steps.promise;
  }
  get finalStep() {
    return this.steps.then((steps) => steps[steps.length - 1]);
  }
  get content() {
    return this.finalStep.then((step) => step.content);
  }
  get warnings() {
    return this.finalStep.then((step) => step.warnings);
  }
  get providerMetadata() {
    return this.finalStep.then((step) => step.providerMetadata);
  }
  get text() {
    return this.finalStep.then((step) => step.text);
  }
  get reasoningText() {
    return this.finalStep.then((step) => step.reasoningText);
  }
  get reasoning() {
    return this.finalStep.then((step) => step.reasoning);
  }
  get sources() {
    return this.finalStep.then((step) => step.sources);
  }
  get files() {
    return this.finalStep.then((step) => step.files);
  }
  get toolCalls() {
    return this.finalStep.then((step) => step.toolCalls);
  }
  get staticToolCalls() {
    return this.finalStep.then((step) => step.staticToolCalls);
  }
  get dynamicToolCalls() {
    return this.finalStep.then((step) => step.dynamicToolCalls);
  }
  get toolResults() {
    return this.finalStep.then((step) => step.toolResults);
  }
  get staticToolResults() {
    return this.finalStep.then((step) => step.staticToolResults);
  }
  get dynamicToolResults() {
    return this.finalStep.then((step) => step.dynamicToolResults);
  }
  get usage() {
    return this.finalStep.then((step) => step.usage);
  }
  get request() {
    return this.finalStep.then((step) => step.request);
  }
  get response() {
    return this.finalStep.then((step) => step.response);
  }
  get totalUsage() {
    this.consumeStream();
    return this._totalUsage.promise;
  }
  get finishReason() {
    this.consumeStream();
    return this._finishReason.promise;
  }
  /**
  Split out a new stream from the original stream.
  The original stream is replaced to allow for further splitting,
  since we do not know how many times the stream will be split.
  
  Note: this leads to buffering the stream content on the server.
  However, the LLM results are expected to be small enough to not cause issues.
     */
  teeStream() {
    const [stream1, stream2] = this.baseStream.tee();
    this.baseStream = stream2;
    return stream1;
  }
  get textStream() {
    return createAsyncIterableStream(
      this.teeStream().pipeThrough(
        new TransformStream({
          transform({ part }, controller) {
            if (part.type === "text-delta") {
              controller.enqueue(part.text);
            }
          }
        })
      )
    );
  }
  get fullStream() {
    return createAsyncIterableStream(
      this.teeStream().pipeThrough(
        new TransformStream({
          transform({ part }, controller) {
            controller.enqueue(part);
          }
        })
      )
    );
  }
  async consumeStream(options) {
    var _a16;
    try {
      await consumeStream({
        stream: this.fullStream,
        onError: options == null ? void 0 : options.onError
      });
    } catch (error) {
      (_a16 = options == null ? void 0 : options.onError) == null ? void 0 : _a16.call(options, error);
    }
  }
  get experimental_partialOutputStream() {
    if (this.output == null) {
      throw new NoOutputSpecifiedError();
    }
    return createAsyncIterableStream(
      this.teeStream().pipeThrough(
        new TransformStream({
          transform({ partialOutput }, controller) {
            if (partialOutput != null) {
              controller.enqueue(partialOutput);
            }
          }
        })
      )
    );
  }
  toUIMessageStream({
    originalMessages,
    generateMessageId,
    onFinish,
    messageMetadata,
    sendReasoning = true,
    sendSources = false,
    sendStart = true,
    sendFinish = true,
    onError = getErrorMessage$1
  } = {}) {
    const responseMessageId = generateMessageId != null ? getResponseUIMessageId({
      originalMessages,
      responseMessageId: generateMessageId
    }) : void 0;
    const toolNamesByCallId = {};
    const isDynamic = (toolCallId) => {
      var _a16, _b;
      const toolName = toolNamesByCallId[toolCallId];
      const dynamic = ((_b = (_a16 = this.tools) == null ? void 0 : _a16[toolName]) == null ? void 0 : _b.type) === "dynamic";
      return dynamic ? true : void 0;
    };
    const baseStream = this.fullStream.pipeThrough(
      new TransformStream({
        transform: async (part, controller) => {
          const messageMetadataValue = messageMetadata == null ? void 0 : messageMetadata({ part });
          const partType = part.type;
          switch (partType) {
            case "text-start": {
              controller.enqueue({
                type: "text-start",
                id: part.id,
                ...part.providerMetadata != null ? { providerMetadata: part.providerMetadata } : {}
              });
              break;
            }
            case "text-delta": {
              controller.enqueue({
                type: "text-delta",
                id: part.id,
                delta: part.text,
                ...part.providerMetadata != null ? { providerMetadata: part.providerMetadata } : {}
              });
              break;
            }
            case "text-end": {
              controller.enqueue({
                type: "text-end",
                id: part.id,
                ...part.providerMetadata != null ? { providerMetadata: part.providerMetadata } : {}
              });
              break;
            }
            case "reasoning-start": {
              controller.enqueue({
                type: "reasoning-start",
                id: part.id,
                ...part.providerMetadata != null ? { providerMetadata: part.providerMetadata } : {}
              });
              break;
            }
            case "reasoning-delta": {
              if (sendReasoning) {
                controller.enqueue({
                  type: "reasoning-delta",
                  id: part.id,
                  delta: part.text,
                  ...part.providerMetadata != null ? { providerMetadata: part.providerMetadata } : {}
                });
              }
              break;
            }
            case "reasoning-end": {
              controller.enqueue({
                type: "reasoning-end",
                id: part.id,
                ...part.providerMetadata != null ? { providerMetadata: part.providerMetadata } : {}
              });
              break;
            }
            case "file": {
              controller.enqueue({
                type: "file",
                mediaType: part.file.mediaType,
                url: `data:${part.file.mediaType};base64,${part.file.base64}`
              });
              break;
            }
            case "source": {
              if (sendSources && part.sourceType === "url") {
                controller.enqueue({
                  type: "source-url",
                  sourceId: part.id,
                  url: part.url,
                  title: part.title,
                  ...part.providerMetadata != null ? { providerMetadata: part.providerMetadata } : {}
                });
              }
              if (sendSources && part.sourceType === "document") {
                controller.enqueue({
                  type: "source-document",
                  sourceId: part.id,
                  mediaType: part.mediaType,
                  title: part.title,
                  filename: part.filename,
                  ...part.providerMetadata != null ? { providerMetadata: part.providerMetadata } : {}
                });
              }
              break;
            }
            case "tool-input-start": {
              toolNamesByCallId[part.id] = part.toolName;
              const dynamic = isDynamic(part.id);
              controller.enqueue({
                type: "tool-input-start",
                toolCallId: part.id,
                toolName: part.toolName,
                ...part.providerExecuted != null ? { providerExecuted: part.providerExecuted } : {},
                ...dynamic != null ? { dynamic } : {}
              });
              break;
            }
            case "tool-input-delta": {
              controller.enqueue({
                type: "tool-input-delta",
                toolCallId: part.id,
                inputTextDelta: part.delta
              });
              break;
            }
            case "tool-call": {
              toolNamesByCallId[part.toolCallId] = part.toolName;
              const dynamic = isDynamic(part.toolCallId);
              if (part.invalid) {
                controller.enqueue({
                  type: "tool-input-error",
                  toolCallId: part.toolCallId,
                  toolName: part.toolName,
                  input: part.input,
                  ...part.providerExecuted != null ? { providerExecuted: part.providerExecuted } : {},
                  ...part.providerMetadata != null ? { providerMetadata: part.providerMetadata } : {},
                  ...dynamic != null ? { dynamic } : {},
                  errorText: onError(part.error)
                });
              } else {
                controller.enqueue({
                  type: "tool-input-available",
                  toolCallId: part.toolCallId,
                  toolName: part.toolName,
                  input: part.input,
                  ...part.providerExecuted != null ? { providerExecuted: part.providerExecuted } : {},
                  ...part.providerMetadata != null ? { providerMetadata: part.providerMetadata } : {},
                  ...dynamic != null ? { dynamic } : {}
                });
              }
              break;
            }
            case "tool-result": {
              const dynamic = isDynamic(part.toolCallId);
              controller.enqueue({
                type: "tool-output-available",
                toolCallId: part.toolCallId,
                output: part.output,
                ...part.providerExecuted != null ? { providerExecuted: part.providerExecuted } : {},
                ...part.preliminary != null ? { preliminary: part.preliminary } : {},
                ...dynamic != null ? { dynamic } : {}
              });
              break;
            }
            case "tool-error": {
              const dynamic = isDynamic(part.toolCallId);
              controller.enqueue({
                type: "tool-output-error",
                toolCallId: part.toolCallId,
                errorText: onError(part.error),
                ...part.providerExecuted != null ? { providerExecuted: part.providerExecuted } : {},
                ...dynamic != null ? { dynamic } : {}
              });
              break;
            }
            case "error": {
              controller.enqueue({
                type: "error",
                errorText: onError(part.error)
              });
              break;
            }
            case "start-step": {
              controller.enqueue({ type: "start-step" });
              break;
            }
            case "finish-step": {
              controller.enqueue({ type: "finish-step" });
              break;
            }
            case "start": {
              if (sendStart) {
                controller.enqueue({
                  type: "start",
                  ...messageMetadataValue != null ? { messageMetadata: messageMetadataValue } : {},
                  ...responseMessageId != null ? { messageId: responseMessageId } : {}
                });
              }
              break;
            }
            case "finish": {
              if (sendFinish) {
                controller.enqueue({
                  type: "finish",
                  finishReason: part.finishReason,
                  ...messageMetadataValue != null ? { messageMetadata: messageMetadataValue } : {}
                });
              }
              break;
            }
            case "abort": {
              controller.enqueue(part);
              break;
            }
            case "tool-input-end": {
              break;
            }
            case "raw": {
              break;
            }
            default: {
              const exhaustiveCheck = partType;
              throw new Error(`Unknown chunk type: ${exhaustiveCheck}`);
            }
          }
          if (messageMetadataValue != null && partType !== "start" && partType !== "finish") {
            controller.enqueue({
              type: "message-metadata",
              messageMetadata: messageMetadataValue
            });
          }
        }
      })
    );
    return createAsyncIterableStream(
      handleUIMessageStreamFinish({
        stream: baseStream,
        messageId: responseMessageId != null ? responseMessageId : generateMessageId == null ? void 0 : generateMessageId(),
        originalMessages,
        onFinish,
        onError
      })
    );
  }
  pipeUIMessageStreamToResponse(response, {
    originalMessages,
    generateMessageId,
    onFinish,
    messageMetadata,
    sendReasoning,
    sendSources,
    sendFinish,
    sendStart,
    onError,
    ...init
  } = {}) {
    pipeUIMessageStreamToResponse({
      response,
      stream: this.toUIMessageStream({
        originalMessages,
        generateMessageId,
        onFinish,
        messageMetadata,
        sendReasoning,
        sendSources,
        sendFinish,
        sendStart,
        onError
      }),
      ...init
    });
  }
  pipeTextStreamToResponse(response, init) {
    pipeTextStreamToResponse({
      response,
      textStream: this.textStream,
      ...init
    });
  }
  toUIMessageStreamResponse({
    originalMessages,
    generateMessageId,
    onFinish,
    messageMetadata,
    sendReasoning,
    sendSources,
    sendFinish,
    sendStart,
    onError,
    ...init
  } = {}) {
    return createUIMessageStreamResponse({
      stream: this.toUIMessageStream({
        originalMessages,
        generateMessageId,
        onFinish,
        messageMetadata,
        sendReasoning,
        sendSources,
        sendFinish,
        sendStart,
        onError
      }),
      ...init
    });
  }
  toTextStreamResponse(init) {
    return createTextStreamResponse({
      textStream: this.textStream,
      ...init
    });
  }
};

// src/generate-object/generate-object.ts
createIdGenerator({ prefix: "aiobj", size: 24 });

// src/generate-object/stream-object.ts
createIdGenerator({ prefix: "aiobj", size: 24 });

// src/generate-text/output.ts
var output_exports = {};
__export(output_exports, {
  object: () => object,
  text: () => text
});
var text = () => ({
  type: "text",
  responseFormat: { type: "text" },
  async parsePartial({ text: text2 }) {
    return { partial: text2 };
  },
  async parseOutput({ text: text2 }) {
    return text2;
  }
});
var object = ({
  schema: inputSchema
}) => {
  const schema = asSchema(inputSchema);
  return {
    type: "object",
    responseFormat: {
      type: "json",
      schema: schema.jsonSchema
    },
    async parsePartial({ text: text2 }) {
      const result = await parsePartialJson(text2);
      switch (result.state) {
        case "failed-parse":
        case "undefined-input":
          return void 0;
        case "repaired-parse":
        case "successful-parse":
          return {
            // Note: currently no validation of partial results:
            partial: result.value
          };
        default: {
          const _exhaustiveCheck = result.state;
          throw new Error(`Unsupported parse state: ${_exhaustiveCheck}`);
        }
      }
    },
    async parseOutput({ text: text2 }, context) {
      const parseResult = await safeParseJSON({ text: text2 });
      if (!parseResult.success) {
        throw new NoObjectGeneratedError({
          message: "No object generated: could not parse the response.",
          cause: parseResult.error,
          text: text2,
          response: context.response,
          usage: context.usage,
          finishReason: context.finishReason
        });
      }
      const validationResult = await safeValidateTypes({
        value: parseResult.value,
        schema
      });
      if (!validationResult.success) {
        throw new NoObjectGeneratedError({
          message: "No object generated: response did not match schema.",
          cause: validationResult.error,
          text: text2,
          response: context.response,
          usage: context.usage,
          finishReason: context.finishReason
        });
      }
      return validationResult.value;
    }
  };
};

const openai = createOpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY
});
const anthropic = createAnthropic({
  baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY
});
async function* streamAnalysis(options) {
  const { ticker, analysisType, provider = "openai", personality } = options;
  const systemPrompt = `You are an expert trading analyst providing real-time analysis for ${ticker}.
${personality ? `Personality: ${personality}` : ""}

Provide ${analysisType} analysis in a streaming format, delivering insights as they're computed.
Use markdown formatting with bold headers and bullet points.
Include specific numbers, percentages, and actionable recommendations.`;
  const userPrompt = `Analyze ${ticker} with ${analysisType} analysis. Stream your insights in real-time.`;
  try {
    const model = provider === "claude" ? anthropic("claude-sonnet-4-5") : openai("gpt-4o");
    const result = streamText({
      model,
      system: systemPrompt,
      prompt: userPrompt
    });
    for await (const chunk of result.textStream) {
      yield chunk;
    }
  } catch (error) {
    if (provider === "claude") {
      try {
        const fallbackResult = streamText({
          model: openai("gpt-4o"),
          system: systemPrompt,
          prompt: userPrompt
        });
        yield "[Fallback to OpenAI] ";
        for await (const chunk of fallbackResult.textStream) {
          yield chunk;
        }
      } catch (fallbackError) {
        yield `Error: Both providers failed - ${error.message}`;
      }
    } else {
      yield `Error streaming analysis: ${error.message}`;
    }
  }
}
async function streamMultiModelAnalysis(ticker, onChunk) {
  const results = {
    openai: "",
    claude: "",
    consensus: ""
  };
  const systemPrompt = `You are an expert trading analyst. Provide concise technical analysis for ${ticker}.
Include: Current trend, key levels, RSI assessment, MACD signal, and recommendation (BUY/SELL/HOLD).
Keep response under 200 words.`;
  const openaiPromise = (async () => {
    try {
      const result = streamText({
        model: openai("gpt-4o"),
        system: systemPrompt,
        prompt: `Analyze ${ticker}`
      });
      for await (const chunk of result.textStream) {
        results.openai += chunk;
        onChunk(chunk, "openai");
      }
    } catch (error) {
      results.openai = `[OpenAI Error: ${error.message}]`;
      onChunk(results.openai, "openai");
    }
  })();
  const claudePromise = (async () => {
    try {
      const result = streamText({
        model: anthropic("claude-sonnet-4-5"),
        system: systemPrompt,
        prompt: `Analyze ${ticker}`
      });
      for await (const chunk of result.textStream) {
        results.claude += chunk;
        onChunk(chunk, "claude");
      }
    } catch (error) {
      results.claude = `[Claude Error: ${error.message}]`;
      onChunk(results.claude, "claude");
    }
  })();
  await Promise.all([openaiPromise, claudePromise]);
  if (results.openai && results.claude && !results.openai.startsWith("[") && !results.claude.startsWith("[")) {
    try {
      const consensusResult = streamText({
        model: anthropic("claude-sonnet-4-5"),
        system: "You are a meta-analyst. Given two AI analyses, synthesize a consensus view.",
        prompt: `OpenAI Analysis:
${results.openai}

Claude Analysis:
${results.claude}

Provide a brief consensus analysis combining both perspectives.`
      });
      for await (const chunk of consensusResult.textStream) {
        results.consensus += chunk;
        onChunk(chunk, "consensus");
      }
    } catch (error) {
      results.consensus = results.openai || results.claude;
      onChunk("[Using single model result as consensus]", "consensus");
    }
  } else {
    results.consensus = results.openai || results.claude || "Unable to generate analysis";
    onChunk("[Using available result as consensus]", "consensus");
  }
  return results;
}

var streamingAnalysis = /*#__PURE__*/Object.freeze({
  __proto__: null,
  streamAnalysis: streamAnalysis,
  streamMultiModelAnalysis: streamMultiModelAnalysis
});

export { streamingAnalysis as s, tokenError as t };
//# sourceMappingURL=streamingAnalysis.mjs.map
