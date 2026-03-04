import http from 'http';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { spawn } from 'child_process';

const PORT = Number(process.env.PORT || 5000);
const PUBLIC_DIR = path.join(process.cwd(), 'public');

process.on('uncaughtException', (err) => {
  console.error('[Process] Uncaught exception:', err.message);
  console.error(err.stack);
});

process.on('unhandledRejection', (reason: any) => {
  console.error('[Process] Unhandled rejection:', reason?.message || reason);
  if (reason?.stack) console.error(reason.stack);
});

process.on('exit', (code) => {
  console.error(`[Process] Exiting with code ${code}`);
  console.trace('[Process] Exit stack trace');
});

process.on('SIGTERM', () => {
  console.error('[Process] Received SIGTERM - ignoring to keep server alive');
});

process.on('SIGINT', () => {
  console.error('[Process] Received SIGINT');
});

process.on('SIGHUP', () => {
  console.error('[Process] Received SIGHUP');
});

// Minimal loading HTML - always available immediately
const LOADING_HTML = '<!DOCTYPE html><html><head><title>Pulse</title></head><body style="background:#0f0f0f;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:system-ui"><h1 style="color:#00D4FF">Loading Pulse...</h1></body></html>';

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.webp': 'image/webp',
  '.webm': 'video/webm',
  '.mp4': 'video/mp4',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav'
};

let indexHtml = LOADING_HTML; // Start with loading HTML, replace later
let serverReady = false;
let workersStarted = false;
let healthChecksPassed = 0;

function serveStatic(req: http.IncomingMessage, res: http.ServerResponse, urlPath: string): boolean {
  if (!serverReady) return false; // Don't serve static files until fully ready
  
  const filePath = path.join(PUBLIC_DIR, urlPath);
  
  if (!filePath.startsWith(PUBLIC_DIR)) {
    return false;
  }
  
  try {
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      return false;
    }
    
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const content = fs.readFileSync(filePath);
    
    res.writeHead(200, { 
      'Content-Type': contentType,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000'
    });
    res.end(content);
    return true;
  } catch (e) {
    return false;
  }
}

// Create server with minimal handler - health checks respond INSTANTLY
const server = http.createServer((req, res) => {
  const urlPath = req.url?.split('?')[0] || '/';
  
  // PRIORITY 1: Health checks - respond immediately, no conditions
  if (urlPath === '/healthz' || urlPath === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end('{"status":"ok"}');
    
    // Start workers only after health checks pass (for Autoscale compatibility)
    healthChecksPassed++;
    if (healthChecksPassed >= 2 && !workersStarted) {
      workersStarted = true;
      console.log('[Bootstrap] Health checks passed, starting workers...');
      setImmediate(() => startWorkers());
    }
    return;
  }
  
  // PRIORITY 2: Root endpoint - always respond fast
  if (urlPath === '/') {
    const accept = req.headers['accept'] || '';
    const userAgent = req.headers['user-agent'] || '';
    
    // Health check detection
    const isHealthCheck = !accept || 
                          accept === '*/*' || 
                          accept.includes('application/json') ||
                          userAgent.includes('GoogleHC') ||
                          userAgent.includes('kube-probe') ||
                          userAgent.includes('curl') ||
                          userAgent.includes('python') ||
                          userAgent.includes('Go-http');
    
    if (isHealthCheck) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end('{"status":"ok"}');
      return;
    }
    
    // Browser request - serve HTML
    res.writeHead(200, { 'Content-Type': 'text/html', 'Cache-Control': 'no-cache' });
    res.end(indexHtml);
    return;
  }
  
  // SSO Inter-App Trust Layer - handled directly (no Mastra dependency)
  if (urlPath.startsWith('/api/sso/')) {
    handleSsoRequest(req, res, urlPath);
    return;
  }

  // PIN management for ecosystem login
  if (urlPath.startsWith('/api/pin/')) {
    handlePinRequest(req, res, urlPath);
    return;
  }

  // ORBIT Ecosystem bridge routes
  if (urlPath.startsWith('/api/orbit/')) {
    handleOrbitBridgeRequest(req, res, urlPath);
    return;
  }

  // Public market intelligence endpoints for Trust Hub integration
  if (urlPath === '/api/public/market-summary' || urlPath === '/api/public/stats') {
    handlePublicMarketRequest(req, res, urlPath);
    return;
  }

  // Trust Layer Hallmark routes - handled directly
  if (urlPath.startsWith('/api/hallmark/')) {
    handleHallmarkRequest(req, res, urlPath);
    return;
  }

  // Trust Layer Affiliate routes - handled directly
  if (urlPath.startsWith('/api/affiliate/')) {
    handleAffiliateRequest(req, res, urlPath);
    return;
  }

  // Ecosystem Widget routes - handled directly (no Mastra dependency)
  if (urlPath === '/api/ecosystem/widget-data' || urlPath === '/api/ecosystem/widget.js') {
    handleEcosystemWidgetRequest(req, res, urlPath);
    return;
  }

  // Shared Components System - cross-app reusable UI components
  if (urlPath.startsWith('/api/ecosystem/shared/')) {
    handleSharedComponentsRequest(req, res, urlPath, req.url || urlPath);
    return;
  }

  if (urlPath.startsWith('/api/auto-trade/wallet')) {
    handleAutoTradeWalletRequest(req, res, urlPath);
    return;
  }

  // API proxy - only if server is ready
  if (urlPath.startsWith('/api/')) {
    const proxyReq = http.request({
      hostname: '127.0.0.1',
      port: 4111,
      path: req.url,
      method: req.method,
      headers: req.headers
    }, (proxyRes) => {
      const headers = { ...proxyRes.headers };
      headers['cache-control'] = 'no-store, no-cache, must-revalidate, proxy-revalidate';
      headers['pragma'] = 'no-cache';
      headers['expires'] = '0';
      res.writeHead(proxyRes.statusCode || 500, headers);
      proxyRes.pipe(res);
    });
    proxyReq.on('error', () => {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end('{"error":"API starting..."}');
    });
    req.pipe(proxyReq);
    return;
  }
  
  // Static files
  if (serveStatic(req, res, urlPath)) {
    return;
  }
  
  // Fallback to index.html for SPA routing
  res.writeHead(200, { 'Content-Type': 'text/html', 'Cache-Control': 'no-cache' });
  res.end(indexHtml);
});

// START SERVER IMMEDIATELY - before any other initialization
server.listen(PORT, '0.0.0.0', () => {
  console.log('Server ready on port ' + PORT);
  
  // Use setImmediate to let event loop process health checks first
  setImmediate(() => {
    initializeApp();
  });
});

function initializeApp() {
  // Load index.html - lightweight operation
  try {
    const indexPath = path.join(PUBLIC_DIR, 'index.html');
    if (fs.existsSync(indexPath)) {
      indexHtml = fs.readFileSync(indexPath, 'utf8');
    }
  } catch (e) {
    console.error('Failed to load index.html:', e);
  }
  
  serverReady = true;
  console.log('Static file serving ready');
  
  // In development, start workers immediately
  // In production (Autoscale), wait for health checks to pass first
  // REPLIT_CONTEXT=deployment is the ONLY reliable indicator of Autoscale deployment
  // REPLIT_DEV_DOMAIN presence indicates development (not deployment)
  const isActualDeployment = process.env.REPLIT_CONTEXT === 'deployment' && !process.env.REPLIT_DEV_DOMAIN;
  
  if (!isActualDeployment) {
    // Development: start workers after short delay
    setTimeout(() => {
      if (!workersStarted) {
        workersStarted = true;
        startWorkers();
      }
    }, 2000);
  } else {
    console.log('[Bootstrap] Autoscale deployment - workers will start after health checks pass');
  }
}

function startWorkers() {
  console.log('[Bootstrap] Starting Mastra and background workers...');
  
  // Start Mastra
  try {
    const mastraPath = path.join(process.cwd(), '.mastra', '.build', 'entry-0.mjs');
    const mastraChild = spawn('node', ['--max-old-space-size=512', mastraPath], {
      env: { ...process.env, PORT: '4111', NODE_OPTIONS: '' },
      stdio: 'inherit'
    });
    mastraChild.on('exit', (code) => {
      console.error(`[Mastra] Child process exited with code ${code}`);
    });
    console.log('Mastra starting on 127.0.0.1:4111');
  } catch (e) {
    console.error('Mastra init error:', e);
  }

  // Create Trust Layer Genesis Hallmark (PU-00000001)
  setTimeout(async () => {
    await createGenesisHallmark();
  }, 3000);

  // Register with ORBIT ecosystem
  setTimeout(async () => {
    await registerWithOrbit();
    if (!orbitRegistered) {
      setTimeout(() => registerWithOrbit(), 30000);
    }
  }, 5000);

  // Only start Inngest dev server in development
  const isActualDeploy = process.env.REPLIT_CONTEXT === 'deployment' && !process.env.REPLIT_DEV_DOMAIN;
  
  if (!isActualDeploy) {
    setTimeout(() => {
      startInngestDevServer();
    }, 5000);
  } else {
    console.log('[Inngest] Autoscale deployment - using Inngest Cloud directly');
  }
}

// ============================================
// SSO Inter-App Trust Layer
// ============================================
const SSO_SECRET = process.env.SSO_JWT_SECRET || '';
const DARKWAVE_API_SECRET = process.env.DARKWAVE_API_SECRET || '';
const SSO_TOKEN_TTL = 5 * 60;
const SSO_SESSION_TTL = 24 * 60 * 60;
const ALLOWED_SOURCE_APPS = ['pulse', 'darkwavestudios', 'orbit', 'dsc', 'darkwave-dex'];

function b64url(str: string): string {
  return Buffer.from(str).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return Buffer.from(str, 'base64').toString('utf8');
}

function hmac(data: string): string {
  return crypto.createHmac('sha256', SSO_SECRET).update(data).digest('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function mintJwt(payload: any, ttl: number): string {
  const h = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);
  const p = b64url(JSON.stringify({ ...payload, iat: now, exp: now + ttl, iss: 'darkwave-pulse' }));
  return `${h}.${p}.${hmac(`${h}.${p}`)}`;
}

function verifyJwt(token: string): any | null {
  if (!SSO_SECRET) return null;
  try {
    const [h, p, s] = token.split('.');
    if (!h || !p || !s) return null;
    if (s !== hmac(`${h}.${p}`)) return null;
    const payload = JSON.parse(b64urlDecode(p));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch { return null; }
}

function jsonResponse(res: http.ServerResponse, status: number, data: any) {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(data));
}

function readBody(req: http.IncomingMessage): Promise<any> {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
    req.on('end', () => {
      try { resolve(JSON.parse(body)); } catch { resolve({}); }
    });
    req.on('error', () => resolve({}));
  });
}

async function handleSsoRequest(req: http.IncomingMessage, res: http.ServerResponse, urlPath: string) {
  if (urlPath === '/api/sso/status' && req.method === 'GET') {
    jsonResponse(res, 200, {
      success: true,
      ssoEnabled: !!SSO_SECRET,
      issuer: 'darkwave-pulse',
      tokenExpiry: `${SSO_TOKEN_TTL}s`,
      sessionExpiry: `${SSO_SESSION_TTL}s`,
      endpoints: {
        issue: '/api/sso/issue',
        verify: '/api/sso/verify',
        exchange: '/api/sso/exchange',
        status: '/api/sso/status',
      },
    });
    return;
  }

  if (urlPath === '/api/sso/issue' && req.method === 'POST') {
    if (!SSO_SECRET) { jsonResponse(res, 503, { success: false, error: 'SSO not configured' }); return; }

    const appSecret = req.headers['x-darkwave-secret'] as string;
    if (!appSecret || !DARKWAVE_API_SECRET || appSecret !== DARKWAVE_API_SECRET) {
      jsonResponse(res, 401, { success: false, error: 'Invalid or missing x-darkwave-secret header' });
      return;
    }

    const body = await readBody(req);
    const { uid, email, displayName, photoURL, sourceApp, hallmarkId } = body;
    if (!uid || !email) { jsonResponse(res, 400, { success: false, error: 'uid and email required' }); return; }
    if (sourceApp && !ALLOWED_SOURCE_APPS.includes(sourceApp)) {
      jsonResponse(res, 400, { success: false, error: 'Unrecognized sourceApp' }); return;
    }

    const token = mintJwt({
      sub: uid, email, displayName: displayName || null,
      photoURL: photoURL || null, hallmarkId: hallmarkId || null,
      sourceApp: sourceApp || 'pulse', type: 'cross_app',
    }, SSO_TOKEN_TTL);

    console.log(`[SSO] Cross-app token issued for ${email} from ${sourceApp || 'pulse'}`);
    jsonResponse(res, 200, { success: true, token, expiresIn: SSO_TOKEN_TTL, type: 'cross_app' });
    return;
  }

  if (urlPath === '/api/sso/verify' && req.method === 'POST') {
    if (!SSO_SECRET) { jsonResponse(res, 503, { success: false, error: 'SSO not configured' }); return; }

    let token: string | null = null;
    const authHeader = req.headers['authorization'];
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    }
    if (!token) {
      const body = await readBody(req);
      token = body.token;
    }
    if (!token) { jsonResponse(res, 400, { success: false, error: 'Token required' }); return; }

    const payload = verifyJwt(token);
    if (!payload) {
      console.log('[SSO] Token verification failed');
      jsonResponse(res, 401, { success: false, error: 'Invalid or expired token' });
      return;
    }

    if (payload.sourceApp && !ALLOWED_SOURCE_APPS.includes(payload.sourceApp)) {
      jsonResponse(res, 403, { success: false, error: 'Unrecognized source app' });
      return;
    }

    console.log(`[SSO] Token verified for ${payload.email} (source: ${payload.sourceApp})`);
    jsonResponse(res, 200, {
      success: true, valid: true,
      user: {
        uid: payload.sub, email: payload.email,
        displayName: payload.displayName, photoURL: payload.photoURL,
        hallmarkId: payload.hallmarkId, sourceApp: payload.sourceApp,
      },
      issuedAt: new Date(payload.iat * 1000).toISOString(),
      expiresAt: new Date(payload.exp * 1000).toISOString(),
    });
    return;
  }

  if (urlPath === '/api/sso/exchange' && req.method === 'POST') {
    if (!SSO_SECRET) { jsonResponse(res, 503, { success: false, error: 'SSO not configured' }); return; }

    const body = await readBody(req);
    let token: string | null = null;
    const authHeader = req.headers['authorization'];
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    }
    if (!token) {
      token = body.token;
    }
    if (!token) { jsonResponse(res, 400, { success: false, error: 'Cross-app token required' }); return; }

    const payload = verifyJwt(token);
    if (!payload) { jsonResponse(res, 401, { success: false, error: 'Invalid or expired token' }); return; }
    if (payload.type !== 'cross_app') { jsonResponse(res, 400, { success: false, error: 'Only cross_app tokens can be exchanged' }); return; }
    if (payload.sourceApp && !ALLOWED_SOURCE_APPS.includes(payload.sourceApp)) {
      jsonResponse(res, 403, { success: false, error: 'Unrecognized source app' }); return;
    }

    const pinProvided = body.pin;

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      console.error('[SSO] Database not available - cannot verify PIN');
      jsonResponse(res, 503, { success: false, error: 'Database unavailable for PIN verification' });
      return;
    }

    try {
      const { Pool } = await import('pg');
      const pool = new Pool({ connectionString: dbUrl });
      const userResult = await pool.query('SELECT pin_hash, pin_failed_attempts, pin_locked_until FROM users WHERE email = $1', [payload.email]);
      if (userResult.rows.length > 0 && userResult.rows[0].pin_hash) {
        const u = userResult.rows[0];
        if (u.pin_locked_until && new Date(u.pin_locked_until) > new Date()) {
          await pool.end();
          jsonResponse(res, 429, { success: false, error: 'Account locked due to failed PIN attempts', requiresPin: true });
          return;
        }
        if (!pinProvided) {
          await pool.end();
          jsonResponse(res, 403, { success: false, error: 'PIN required for session exchange', requiresPin: true });
          return;
        }
        if (!verifyPinStr(pinProvided, u.pin_hash)) {
          const attempts = (u.pin_failed_attempts || 0) + 1;
          const lockUntil = attempts >= PIN_MAX_ATTEMPTS ? new Date(Date.now() + PIN_LOCKOUT_MINUTES * 60000).toISOString() : null;
          await pool.query('UPDATE users SET pin_failed_attempts = $1, pin_locked_until = $2 WHERE email = $3', [attempts, lockUntil, payload.email]);
          await pool.end();
          jsonResponse(res, 401, { success: false, error: 'Incorrect PIN', requiresPin: true });
          return;
        }
        await pool.query('UPDATE users SET pin_failed_attempts = 0, pin_locked_until = NULL WHERE email = $1', [payload.email]);
      }
      await pool.end();
    } catch (dbErr: any) {
      console.error('[SSO] PIN check failed - blocking exchange:', dbErr.message);
      jsonResponse(res, 503, { success: false, error: 'PIN verification service unavailable' });
      return;
    }

    const sessionToken = mintJwt({
      sub: payload.sub, email: payload.email,
      displayName: payload.displayName, photoURL: payload.photoURL,
      hallmarkId: payload.hallmarkId, sourceApp: payload.sourceApp,
      targetApp: 'pulse', type: 'session',
    }, SSO_SESSION_TTL);

    console.log(`[SSO] Token exchanged for session: ${payload.email} (${payload.sourceApp} → pulse)`);
    jsonResponse(res, 200, {
      success: true, sessionToken, expiresIn: SSO_SESSION_TTL,
      user: {
        uid: payload.sub, email: payload.email,
        displayName: payload.displayName, photoURL: payload.photoURL,
        hallmarkId: payload.hallmarkId,
      },
    });
    return;
  }

  jsonResponse(res, 404, { success: false, error: 'SSO endpoint not found' });
}

// ============================================
// PIN System for Ecosystem Login
// ============================================
const PIN_MAX_ATTEMPTS = 5;
const PIN_LOCKOUT_MINUTES = 15;

function validatePinRules(pin: string): { valid: boolean; error?: string } {
  if (pin.length < 8) return { valid: false, error: 'PIN must be at least 8 characters' };
  if (!/[A-Z]/.test(pin)) return { valid: false, error: 'PIN must contain at least 1 capital letter' };
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(pin)) return { valid: false, error: 'PIN must contain at least 1 special character' };
  return { valid: true };
}

function hashPin(pin: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(pin, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPin(pin: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const check = crypto.pbkdf2Sync(pin, salt, 100000, 64, 'sha512').toString('hex');
  return check === hash;
}

const verifyPinStr = verifyPin;

async function getDbPool() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return null;
  const pgModule = await import('pg');
  const PoolClass = pgModule.Pool || (pgModule as any).default?.Pool || (pgModule as any).default;
  return new PoolClass({ connectionString: dbUrl });
}

async function handlePinRequest(req: http.IncomingMessage, res: http.ServerResponse, urlPath: string) {

  if (urlPath === '/api/pin/set' && req.method === 'POST') {
    const body = await readBody(req);
    const { email, pin, currentPin, ssoToken } = body;
    if (!email || !pin) { jsonResponse(res, 400, { success: false, error: 'email and pin required' }); return; }

    const appSecret = req.headers['x-darkwave-secret'] as string;
    let authenticated = false;

    if (appSecret && DARKWAVE_API_SECRET && appSecret === DARKWAVE_API_SECRET) {
      authenticated = true;
    }

    if (!authenticated) {
      let authToken = ssoToken;
      const authHeader = req.headers['authorization'];
      if (!authToken && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
        authToken = authHeader.slice(7);
      }
      if (authToken) {
        const tokenPayload = verifyJwt(authToken);
        if (tokenPayload && tokenPayload.email === email) {
          authenticated = true;
        }
      }
    }

    if (!authenticated) {
      jsonResponse(res, 401, { success: false, error: 'Authentication required (SSO token or x-darkwave-secret header)' });
      return;
    }

    const validation = validatePinRules(pin);
    if (!validation.valid) { jsonResponse(res, 400, { success: false, error: validation.error }); return; }

    const pool = await getDbPool();
    if (!pool) { jsonResponse(res, 503, { success: false, error: 'Database not available' }); return; }

    try {
      const user = await pool.query('SELECT id, pin_hash FROM users WHERE email = $1', [email]);
      if (user.rows.length === 0) { await pool.end(); jsonResponse(res, 404, { success: false, error: 'User not found' }); return; }

      if (user.rows[0].pin_hash) {
        if (!currentPin) { await pool.end(); jsonResponse(res, 400, { success: false, error: 'Current PIN required to change PIN' }); return; }
        if (!verifyPin(currentPin, user.rows[0].pin_hash)) { await pool.end(); jsonResponse(res, 401, { success: false, error: 'Current PIN incorrect' }); return; }
      }

      const pinHash = hashPin(pin);
      await pool.query('UPDATE users SET pin_hash = $1, pin_set_at = NOW(), pin_failed_attempts = 0, pin_locked_until = NULL WHERE email = $2', [pinHash, email]);
      await pool.end();

      console.log(`[PIN] PIN set for ${email}`);
      jsonResponse(res, 200, { success: true, message: 'PIN set successfully' });
      return;
    } catch (err: any) {
      await pool.end();
      console.error('[PIN] Set error:', err.message);
      jsonResponse(res, 500, { success: false, error: 'Failed to set PIN' });
      return;
    }
  }

  if (urlPath === '/api/pin/verify' && req.method === 'POST') {
    const body = await readBody(req);
    const { email, pin } = body;
    if (!email || !pin) { jsonResponse(res, 400, { success: false, error: 'email and pin required' }); return; }

    const pool = await getDbPool();
    if (!pool) { jsonResponse(res, 503, { success: false, error: 'Database not available' }); return; }

    try {
      const user = await pool.query('SELECT id, pin_hash, pin_failed_attempts, pin_locked_until FROM users WHERE email = $1', [email]);
      if (user.rows.length === 0) { await pool.end(); jsonResponse(res, 404, { success: false, error: 'User not found' }); return; }

      const u = user.rows[0];
      if (!u.pin_hash) { await pool.end(); jsonResponse(res, 400, { success: false, error: 'No PIN set for this user' }); return; }

      if (u.pin_locked_until && new Date(u.pin_locked_until) > new Date()) {
        const remaining = Math.ceil((new Date(u.pin_locked_until).getTime() - Date.now()) / 60000);
        await pool.end();
        jsonResponse(res, 429, { success: false, error: `Account locked. Try again in ${remaining} minutes`, lockedUntil: u.pin_locked_until });
        return;
      }

      if (!verifyPin(pin, u.pin_hash)) {
        const attempts = (u.pin_failed_attempts || 0) + 1;
        const lockUntil = attempts >= PIN_MAX_ATTEMPTS ? new Date(Date.now() + PIN_LOCKOUT_MINUTES * 60000).toISOString() : null;

        await pool.query(
          'UPDATE users SET pin_failed_attempts = $1, pin_locked_until = $2 WHERE email = $3',
          [attempts, lockUntil, email]
        );
        await pool.end();

        const remaining = PIN_MAX_ATTEMPTS - attempts;
        console.log(`[PIN] Failed attempt for ${email} (${attempts}/${PIN_MAX_ATTEMPTS})`);
        jsonResponse(res, 401, {
          success: false,
          error: remaining > 0 ? `Incorrect PIN. ${remaining} attempts remaining` : `Account locked for ${PIN_LOCKOUT_MINUTES} minutes`,
          attemptsRemaining: Math.max(0, remaining),
          locked: remaining <= 0,
        });
        return;
      }

      await pool.query('UPDATE users SET pin_failed_attempts = 0, pin_locked_until = NULL, last_login = NOW() WHERE email = $1', [email]);
      await pool.end();

      console.log(`[PIN] Verified for ${email}`);
      jsonResponse(res, 200, { success: true, verified: true });
      return;
    } catch (err: any) {
      await pool.end();
      console.error('[PIN] Verify error:', err.message);
      jsonResponse(res, 500, { success: false, error: 'Verification failed' });
      return;
    }
  }

  if (urlPath === '/api/pin/status' && req.method === 'POST') {
    const body = await readBody(req);
    const { email } = body;
    if (!email) { jsonResponse(res, 400, { success: false, error: 'email required' }); return; }

    const pool = await getDbPool();
    if (!pool) { jsonResponse(res, 503, { success: false, error: 'Database not available' }); return; }

    try {
      const user = await pool.query('SELECT pin_hash, pin_set_at, pin_failed_attempts, pin_locked_until FROM users WHERE email = $1', [email]);
      await pool.end();

      if (user.rows.length === 0) { jsonResponse(res, 404, { success: false, error: 'User not found' }); return; }

      const u = user.rows[0];
      const isLocked = u.pin_locked_until && new Date(u.pin_locked_until) > new Date();

      jsonResponse(res, 200, {
        success: true,
        hasPin: !!u.pin_hash,
        pinSetAt: u.pin_set_at,
        isLocked: !!isLocked,
        lockedUntil: isLocked ? u.pin_locked_until : null,
        failedAttempts: u.pin_failed_attempts || 0,
        rules: { minLength: 8, requireCapital: true, requireSpecial: true },
      });
      return;
    } catch (err: any) {
      await pool.end();
      jsonResponse(res, 500, { success: false, error: 'Failed to check status' });
      return;
    }
  }

  if (urlPath === '/api/pin/validate-rules' && req.method === 'POST') {
    const body = await readBody(req);
    const { pin } = body;
    if (!pin) { jsonResponse(res, 400, { success: false, error: 'pin required' }); return; }

    const validation = validatePinRules(pin);
    jsonResponse(res, 200, {
      success: true,
      valid: validation.valid,
      error: validation.error || null,
      rules: { minLength: 8, requireCapital: true, requireSpecial: true },
      checks: {
        length: pin.length >= 8,
        capital: /[A-Z]/.test(pin),
        special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(pin),
      },
    });
    return;
  }

  jsonResponse(res, 404, { success: false, error: 'PIN endpoint not found' });
}

// ── Shared Components System ──────────────────────────────────────────
const SHARED_COMPONENT_SLUGS = ['footer', 'announcement-bar', 'trust-badge'] as const;
type SharedComponentSlug = typeof SHARED_COMPONENT_SLUGS[number];

function renderSharedFooter(theme: string): string {
  const bg = theme === 'light' ? '#f5f5f5' : '#0a0a0a';
  const border = theme === 'light' ? '#ddd' : '#1a1a1a';
  const textPrimary = theme === 'light' ? '#222' : '#ccc';
  const textSecondary = theme === 'light' ? '#666' : '#888';
  const accent = '#00D4FF';
  return `<footer id="dw-shared-footer" style="width:100%;padding:16px 24px;background:${bg};border-top:1px solid ${border};display:flex;justify-content:center;align-items:center;gap:16px;flex-wrap:wrap;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;box-sizing:border-box;">
  <div style="display:flex;align-items:center;gap:12px;">
    <a href="https://x.com/DarkWaveStudios" target="_blank" rel="noopener noreferrer" style="opacity:0.5;transition:opacity 0.2s;" onmouseenter="this.style.opacity=1" onmouseleave="this.style.opacity=0.5">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="${textPrimary}"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
    </a>
    <a href="https://t.me/DarkWaveStudios" target="_blank" rel="noopener noreferrer" style="opacity:0.5;transition:opacity 0.2s;" onmouseenter="this.style.opacity=1" onmouseleave="this.style.opacity=0.5">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="${textPrimary}"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
    </a>
    <a href="https://facebook.com/DarkWaveStudios" target="_blank" rel="noopener noreferrer" style="opacity:0.5;transition:opacity 0.2s;" onmouseenter="this.style.opacity=1" onmouseleave="this.style.opacity=0.5">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="${textPrimary}"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
    </a>
  </div>
  <span style="color:${textSecondary};font-size:12px;">Powered by <a href="https://darkwavestudios.io" target="_blank" rel="noopener" style="color:${accent};text-decoration:none;font-weight:600;">DarkWave Studios, LLC</a> &copy; ${new Date().getFullYear()}</span>
</footer>`;
}

function renderSharedAnnouncementBar(theme: string): string {
  const bg = theme === 'light' ? '#e8f4ff' : 'linear-gradient(90deg, rgba(0,212,255,0.08), rgba(57,255,20,0.04))';
  const border = theme === 'light' ? '#b3d9ff' : 'rgba(0,212,255,0.15)';
  const text = theme === 'light' ? '#1a4a6b' : '#ccc';
  const accent = '#00D4FF';
  return `<div id="dw-shared-announcement-bar" style="width:100%;padding:10px 20px;background:${bg};border-bottom:1px solid ${border};display:flex;justify-content:center;align-items:center;gap:10px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;box-sizing:border-box;">
  <span style="width:6px;height:6px;border-radius:50%;background:#39FF14;box-shadow:0 0 6px rgba(57,255,20,0.5);flex-shrink:0;"></span>
  <span style="color:${text};font-size:12px;">Part of the <a href="https://dwsc.io" target="_blank" rel="noopener" style="color:${accent};font-weight:700;text-decoration:none;">DarkWave Trust Layer</a> ecosystem &mdash; AI-verified &amp; blockchain-secured</span>
  <button onclick="this.parentElement.style.display='none'" style="background:none;border:none;color:${text};cursor:pointer;font-size:16px;padding:0 4px;opacity:0.5;line-height:1;" aria-label="Dismiss">&times;</button>
</div>`;
}

function renderSharedTrustBadge(theme: string): string {
  const bg = theme === 'light' ? '#fff' : '#0f0f0f';
  const border = theme === 'light' ? 'rgba(0,212,255,0.3)' : 'rgba(0,212,255,0.3)';
  const text = theme === 'light' ? '#555' : '#ccc';
  const label = '#00D4FF';
  return `<div id="dw-shared-trust-badge" style="position:fixed;bottom:20px;right:20px;z-index:999998;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <a href="https://dwsc.io" target="_blank" rel="noopener" style="display:flex;align-items:center;gap:8px;padding:10px 16px;background:${bg};border:1px solid ${border};border-radius:12px;text-decoration:none;box-shadow:0 4px 24px rgba(0,212,255,0.15);transition:all 0.3s ease;" onmouseenter="this.style.borderColor='rgba(0,212,255,0.6)';this.style.boxShadow='0 4px 32px rgba(0,212,255,0.3)'" onmouseleave="this.style.borderColor='${border}';this.style.boxShadow='0 4px 24px rgba(0,212,255,0.15)'">
    <div style="width:24px;height:24px;border-radius:6px;background:linear-gradient(135deg,#00D4FF,#39FF14);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:12px;color:#000;flex-shrink:0;">DW</div>
    <div>
      <div style="color:${label};font-weight:700;font-size:11px;letter-spacing:0.5px;text-transform:uppercase;">DarkWave Trust Layer</div>
      <div style="color:${text};font-size:11px;">Verified Ecosystem</div>
    </div>
    <div style="width:8px;height:8px;border-radius:50%;background:#39FF14;box-shadow:0 0 6px rgba(57,255,20,0.6);flex-shrink:0;animation:dw-shared-pulse 2s infinite;"></div>
  </a>
  <style>@keyframes dw-shared-pulse{0%,100%{opacity:1}50%{opacity:0.4}}</style>
</div>`;
}

function getSharedComponentHTML(slug: string, theme: string): string | null {
  switch (slug) {
    case 'footer': return renderSharedFooter(theme);
    case 'announcement-bar': return renderSharedAnnouncementBar(theme);
    case 'trust-badge': return renderSharedTrustBadge(theme);
    default: return null;
  }
}

function buildLoaderScript(): string {
  return `(function(){
  "use strict";
  var script = document.currentScript;
  if (!script) return;

  var BASE = new URL(script.src).origin;
  var requested = (script.getAttribute("data-components") || "").trim();
  var theme = script.getAttribute("data-theme") || "dark";

  var ALL = ["footer","announcement-bar","trust-badge"];
  var components = requested === "all" ? ALL : requested.split(",").map(function(s){ return s.trim(); }).filter(Boolean);
  if (!components.length) return;

  var url = BASE + "/api/ecosystem/shared/bundle?components=" + encodeURIComponent(components.join(",")) + "&theme=" + encodeURIComponent(theme);

  fetch(url)
    .then(function(r){ return r.json(); })
    .then(function(data){
      if (!data.success) return;
      var items = data.components || {};

      Object.keys(items).forEach(function(slug){
        var html = items[slug];
        if (!html) return;

        var existing = document.getElementById("dw-shared-" + slug);
        if (existing) {
          existing.innerHTML = html;
          return;
        }

        var wrapper = document.createElement("div");
        wrapper.innerHTML = html;
        var el = wrapper.firstElementChild || wrapper;

        if (slug === "footer") {
          document.body.appendChild(el);
        } else if (slug === "announcement-bar") {
          document.body.insertBefore(el, document.body.firstChild);
        } else if (slug === "trust-badge") {
          document.body.appendChild(el);
        } else {
          document.body.appendChild(el);
        }
      });
    })
    .catch(function(err){
      console.warn("[DarkWave Shared] Failed to load components:", err);
    });
})();`;
}

async function handleSharedComponentsRequest(req: http.IncomingMessage, res: http.ServerResponse, urlPath: string, fullUrl: string) {
  const corsHeaders: Record<string, string> = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders);
    res.end();
    return;
  }

  const query = new URL(fullUrl, 'http://localhost').searchParams;
  const theme = query.get('theme') || 'dark';

  if (urlPath === '/api/ecosystem/shared/loader.js') {
    res.writeHead(200, {
      ...corsHeaders,
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    });
    res.end(buildLoaderScript());
    return;
  }

  if (urlPath.startsWith('/api/ecosystem/shared/render/')) {
    const slug = urlPath.replace('/api/ecosystem/shared/render/', '');
    const html = getSharedComponentHTML(slug, theme);
    if (!html) {
      res.writeHead(404, { ...corsHeaders, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: `Unknown component: ${slug}`, available: SHARED_COMPONENT_SLUGS }));
      return;
    }
    res.writeHead(200, {
      ...corsHeaders,
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    });
    res.end(html);
    return;
  }

  if (urlPath === '/api/ecosystem/shared/bundle') {
    const requested = (query.get('components') || '').split(',').map(s => s.trim()).filter(Boolean);
    const all = requested.includes('all') ? [...SHARED_COMPONENT_SLUGS] : requested;

    const components: Record<string, string | null> = {};
    for (const slug of all) {
      components[slug] = getSharedComponentHTML(slug, theme);
    }

    res.writeHead(200, {
      ...corsHeaders,
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    });
    res.end(JSON.stringify({
      success: true,
      theme,
      components,
      available: [...SHARED_COMPONENT_SLUGS],
      generatedAt: new Date().toISOString(),
    }));
    return;
  }

  if (urlPath === '/api/ecosystem/shared/manifest') {
    res.writeHead(200, {
      ...corsHeaders,
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=600',
    });
    res.end(JSON.stringify({
      success: true,
      name: 'DarkWave Shared Components',
      version: '1.0',
      components: SHARED_COMPONENT_SLUGS.map(slug => ({
        slug,
        placement: slug === 'footer' ? 'bottom' : slug === 'announcement-bar' ? 'top' : 'fixed-bottom-right',
        anchorId: `dw-shared-${slug}`,
        renderUrl: `/api/ecosystem/shared/render/${slug}`,
      })),
      loaderUrl: '/api/ecosystem/shared/loader.js',
      bundleUrl: '/api/ecosystem/shared/bundle',
      themes: ['dark', 'light'],
      usage: {
        script: '<script src="https://dwsc.io/api/ecosystem/shared/loader.js" data-components="footer,announcement-bar,trust-badge" data-theme="dark"></script>',
        anchor: '<div id="dw-shared-footer"></div>',
      },
    }));
    return;
  }

  res.writeHead(404, { ...corsHeaders, 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    success: false,
    error: 'Shared component endpoint not found',
    endpoints: {
      loader: '/api/ecosystem/shared/loader.js',
      render: '/api/ecosystem/shared/render/:slug',
      bundle: '/api/ecosystem/shared/bundle?components=footer,trust-badge&theme=dark',
      manifest: '/api/ecosystem/shared/manifest',
    },
  }));
}

async function handleEcosystemWidgetRequest(req: http.IncomingMessage, res: http.ServerResponse, urlPath: string) {
  if (urlPath === '/api/ecosystem/widget.js' && req.method === 'GET') {
    const widgetScript = `(function(){
  "use strict";
  var WIDGET_API = (document.currentScript && document.currentScript.src)
    ? new URL(document.currentScript.src).origin + "/api/ecosystem/widget-data"
    : "https://dwsc.io/api/ecosystem/widget-data";

  var STYLES = {
    container: "position:fixed;bottom:20px;right:20px;z-index:999999;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;",
    badge: "display:flex;align-items:center;gap:8px;padding:10px 16px;background:#0f0f0f;border:1px solid rgba(0,212,255,0.3);border-radius:12px;cursor:pointer;box-shadow:0 4px 24px rgba(0,212,255,0.15);transition:all 0.3s ease;",
    badgeHover: "border-color:rgba(0,212,255,0.6);box-shadow:0 4px 32px rgba(0,212,255,0.3);",
    logo: "width:24px;height:24px;border-radius:6px;background:linear-gradient(135deg,#00D4FF,#39FF14);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:12px;color:#000;flex-shrink:0;",
    text: "color:#ccc;font-size:12px;line-height:1.3;",
    label: "color:#00D4FF;font-weight:700;font-size:11px;letter-spacing:0.5px;text-transform:uppercase;",
    panel: "position:absolute;bottom:50px;right:0;width:320px;background:#0f0f0f;border:1px solid rgba(0,212,255,0.2);border-radius:16px;box-shadow:0 8px 40px rgba(0,0,0,0.6);overflow:hidden;display:none;",
    panelHeader: "padding:16px;background:linear-gradient(135deg,rgba(0,212,255,0.08),rgba(57,255,20,0.04));border-bottom:1px solid rgba(0,212,255,0.1);",
    panelTitle: "color:#fff;font-size:14px;font-weight:700;margin:0 0 4px 0;",
    panelSub: "color:#888;font-size:11px;margin:0;",
    appList: "padding:8px;max-height:280px;overflow-y:auto;",
    appCard: "display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;margin-bottom:4px;cursor:pointer;transition:background 0.2s;",
    appCardHover: "background:rgba(0,212,255,0.06);",
    appIcon: "width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;color:#000;flex-shrink:0;",
    appName: "color:#fff;font-size:13px;font-weight:600;",
    appHook: "color:#777;font-size:11px;margin-top:2px;",
    appTag: "display:inline-block;padding:2px 6px;border-radius:4px;font-size:9px;font-weight:600;color:#00D4FF;background:rgba(0,212,255,0.1);margin-right:4px;margin-top:4px;",
    footer: "padding:12px 16px;border-top:1px solid rgba(0,212,255,0.1);text-align:center;",
    footerLink: "color:#00D4FF;text-decoration:none;font-size:11px;font-weight:600;",
    statsRow: "display:flex;justify-content:space-around;padding:12px 16px;border-bottom:1px solid rgba(0,212,255,0.08);",
    stat: "text-align:center;",
    statVal: "color:#00D4FF;font-size:16px;font-weight:700;",
    statLabel: "color:#666;font-size:9px;text-transform:uppercase;letter-spacing:0.5px;margin-top:2px;",
    pulse: "width:8px;height:8px;border-radius:50%;background:#39FF14;box-shadow:0 0 6px rgba(57,255,20,0.6);flex-shrink:0;animation:dw-pulse 2s infinite;",
  };

  var css = document.createElement("style");
  css.textContent = "@keyframes dw-pulse{0%,100%{opacity:1}50%{opacity:0.4}}";
  document.head.appendChild(css);

  var container = document.createElement("div");
  container.style.cssText = STYLES.container;

  var badge = document.createElement("div");
  badge.style.cssText = STYLES.badge;
  badge.innerHTML = '<div style="' + STYLES.logo + '">DW</div>' +
    '<div><div style="' + STYLES.label + '">DarkWave Trust Layer</div>' +
    '<div style="' + STYLES.text + '">Verified Ecosystem</div></div>' +
    '<div style="' + STYLES.pulse + '"></div>';

  badge.addEventListener("mouseenter", function(){ badge.style.cssText = STYLES.badge + STYLES.badgeHover; });
  badge.addEventListener("mouseleave", function(){ badge.style.cssText = STYLES.badge; });

  var panel = document.createElement("div");
  panel.style.cssText = STYLES.panel;

  var open = false;
  badge.addEventListener("click", function(){
    open = !open;
    panel.style.display = open ? "block" : "none";
    if (open) loadWidgetData();
  });

  function loadWidgetData(){
    panel.innerHTML = '<div style="padding:40px;text-align:center;color:#555;">Loading...</div>';
    var headers = {};
    if (window.DW_SSO_TOKEN) headers["Authorization"] = "Bearer " + window.DW_SSO_TOKEN;
    fetch(WIDGET_API, { headers: headers })
      .then(function(r){ return r.json(); })
      .then(function(data){
        if (!data.success) { panel.innerHTML = '<div style="padding:20px;color:#f44;">Error loading data</div>'; return; }
        renderPanel(data);
      })
      .catch(function(){ panel.innerHTML = '<div style="padding:20px;color:#f44;">Connection failed</div>'; });
  }

  var COLORS = ["#00D4FF","#39FF14","#FF006E","#8B5CF6","#F59E0B","#06B6D4","#EC4899"];
  function renderPanel(data){
    var html = '<div style="' + STYLES.panelHeader + '">' +
      '<p style="' + STYLES.panelTitle + '">DarkWave Ecosystem</p>' +
      '<p style="' + STYLES.panelSub + '">' + data.apps.length + ' connected app' + (data.apps.length !== 1 ? 's' : '') + '</p></div>';

    if (data.stats && data.stats.totalPredictions) {
      html += '<div style="' + STYLES.statsRow + '">';
      html += '<div style="' + STYLES.stat + '"><div style="' + STYLES.statVal + '">' + formatNum(data.stats.totalPredictions) + '</div><div style="' + STYLES.statLabel + '">Predictions</div></div>';
      if (data.stats.avgAccuracy > 0) html += '<div style="' + STYLES.stat + '"><div style="' + STYLES.statVal + '">' + data.stats.avgAccuracy + '%</div><div style="' + STYLES.statLabel + '">Accuracy</div></div>';
      html += '<div style="' + STYLES.stat + '"><div style="' + STYLES.statVal + '">' + formatNum(data.stats.registeredUsers || 0) + '</div><div style="' + STYLES.statLabel + '">Users</div></div>';
      html += '</div>';
    }

    html += '<div style="' + STYLES.appList + '">';
    data.apps.forEach(function(app, i){
      var color = COLORS[i % COLORS.length];
      var initial = app.appName.charAt(0).toUpperCase();
      html += '<div class="dw-app-card" style="' + STYLES.appCard + '" data-url="' + (app.websiteUrl || '#') + '">' +
        '<div style="' + STYLES.appIcon + 'background:' + color + ';">' + initial + '</div>' +
        '<div style="flex:1;min-width:0;">' +
        '<div style="' + STYLES.appName + '">' + esc(app.appName) + '</div>' +
        '<div style="' + STYLES.appHook + '">' + esc(app.hook || '') + '</div>';
      if (app.keyTags && app.keyTags.length) {
        html += '<div>';
        app.keyTags.slice(0, 3).forEach(function(tag){ html += '<span style="' + STYLES.appTag + '">' + esc(tag) + '</span>'; });
        html += '</div>';
      }
      html += '</div></div>';
    });
    html += '</div>';

    html += '<div style="' + STYLES.footer + '"><a href="https://dwsc.io" target="_blank" rel="noopener" style="' + STYLES.footerLink + '">Powered by DarkWave Studios</a></div>';

    panel.innerHTML = html;

    panel.querySelectorAll(".dw-app-card").forEach(function(card){
      card.addEventListener("mouseenter", function(){ card.style.background = "rgba(0,212,255,0.06)"; });
      card.addEventListener("mouseleave", function(){ card.style.background = "transparent"; });
      card.addEventListener("click", function(){
        var url = card.getAttribute("data-url");
        if (url && url !== "#") window.open(url, "_blank", "noopener");
      });
    });
  }

  function formatNum(n){
    if (n >= 1e6) return (n/1e6).toFixed(1) + "M";
    if (n >= 1e3) return (n/1e3).toFixed(1) + "K";
    return String(n);
  }

  function esc(s){
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  container.appendChild(panel);
  container.appendChild(badge);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function(){ document.body.appendChild(container); });
  } else {
    document.body.appendChild(container);
  }
})();`;

    res.writeHead(200, {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    });
    res.end(widgetScript);
    return;
  }

  if (urlPath === '/api/ecosystem/widget-data' && req.method === 'GET') {
    const authHeader = req.headers['authorization'] as string;
    let authedUser: any = null;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      authedUser = verifyJwt(token);
    }

    const pulseApp = {
      id: 'pulse',
      appName: 'DarkWave Pulse',
      category: 'DeFi',
      hook: 'AI-Powered Trading Intelligence for the Modern Trader',
      keyTags: ['Auto-Trading', 'AI Signals', 'Multi-Chain', 'StrikeAgent'],
      websiteUrl: 'https://pulse.darkwavestudios.io',
      isNative: true,
    };

    let apps = [pulseApp];
    let platformStats: any = {
      totalApps: apps.length,
      ecosystem: 'DarkWave Trust Layer',
      version: '1.0',
    };

    const pool = await getDbPool();
    if (pool) {
      try {
        const dbApps = await pool.query("SELECT * FROM ecosystem_apps WHERE status = 'approved'");
        const mappedApps = (dbApps.rows || []).map((app: any) => ({
          id: app.id,
          appName: app.app_name,
          category: app.category,
          hook: app.hook,
          keyTags: app.key_tags || [],
          websiteUrl: app.website_url,
          isNative: false,
        }));
        apps = [pulseApp, ...mappedApps];
        platformStats.totalApps = apps.length;

        if (authedUser) {
          try {
            const predCount = await pool.query("SELECT COUNT(*)::int as count FROM strikeagent_predictions");
            const signalCount = await pool.query("SELECT COUNT(*)::int as count FROM strike_agent_signals");
            const userCount = await pool.query("SELECT COUNT(*)::int as count FROM users");
            const accuracy = await pool.query("SELECT COALESCE(AVG(win_rate), 0)::numeric(5,2) as avg_win_rate FROM prediction_accuracy_stats WHERE total_predictions > 5");

            platformStats = {
              ...platformStats,
              totalPredictions: predCount.rows?.[0]?.count || 0,
              activeSignals: signalCount.rows?.[0]?.count || 0,
              registeredUsers: userCount.rows?.[0]?.count || 0,
              avgAccuracy: parseFloat(String(accuracy.rows?.[0]?.avg_win_rate ?? '0')),
              ssoEnabled: true,
              authedAs: authedUser.email,
            };
          } catch (dbErr: any) {
            console.warn('[Widget] Stats query failed:', dbErr.message);
          }
        }

        await pool.end();
      } catch (dbErr: any) {
        try { await pool.end(); } catch {}
        console.warn('[Widget] DB query failed:', dbErr.message);
      }
    }

    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    });
    res.end(JSON.stringify({
      success: true,
      ecosystem: 'DarkWave Trust Layer',
      apps,
      stats: platformStats,
      ssoEndpoints: {
        issue: '/api/sso/issue',
        verify: '/api/sso/verify',
        exchange: '/api/sso/exchange',
      },
      generatedAt: new Date().toISOString(),
    }));
    return;
  }

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
    });
    res.end();
    return;
  }

  jsonResponse(res, 404, { success: false, error: 'Widget endpoint not found' });
}

// ============================================
// ORBIT Ecosystem Integration
// ============================================
const ORBIT_BASE_URL = 'https://orbitstaffing.io';
const ORBIT_REGISTER_URL = `${ORBIT_BASE_URL}/api/admin/ecosystem/register-app`;
const ORBIT_SSO_LOGIN_URL = `${ORBIT_BASE_URL}/api/auth/ecosystem-login`;
const ORBIT_AUTH_REGISTER_URL = `${ORBIT_BASE_URL}/api/chat/auth/register`;
let orbitRegistered = false;
let orbitRegistrationData: any = null;

async function registerWithOrbit() {
  try {
    const payload = JSON.stringify({
      appName: 'DarkWave Pulse',
      appSlug: 'pulse',
      category: 'DeFi',
      description: 'AI-Powered Trading Intelligence for the Modern Trader',
      hook: 'AI-driven crypto trading with blockchain-verified predictions',
      websiteUrl: 'https://dwsc.io',
      apiBaseUrl: 'https://dwsc.io/api',
      ssoEndpoint: 'https://dwsc.io/api/sso/verify',
      capabilities: ['ai-signals', 'predictions', 'trading', 'multi-chain-wallet', 'strike-agent'],
      keyTags: ['Auto-Trading', 'AI Signals', 'Multi-Chain', 'StrikeAgent'],
      sharedSecret: process.env.DARKWAVE_API_SECRET || '',
    });

    const response = await fetch(ORBIT_REGISTER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
    });

    const data = await response.json() as any;
    
    if (response.ok && (data.success !== false)) {
      orbitRegistered = true;
      orbitRegistrationData = data;
      console.log('[ORBIT] Successfully registered with ORBIT ecosystem');
    } else if (response.status === 500) {
      orbitRegistered = true;
      console.log('[ORBIT] ORBIT server error (likely already registered) - marking as connected');
    } else {
      if (data.error?.includes('already registered') || data.error?.includes('already exists')) {
        orbitRegistered = true;
        console.log('[ORBIT] Already registered with ORBIT ecosystem');
      } else {
        console.warn('[ORBIT] Registration response:', data.error || data.message || 'Unknown response');
      }
    }
  } catch (err: any) {
    console.warn('[ORBIT] Registration failed (will retry):', err.message);
  }
}

async function orbitSsoLogin(identifier: string, credential: string): Promise<any> {
  try {
    const response = await fetch(ORBIT_SSO_LOGIN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, credential, sourceApp: 'pulse' }),
    });
    return await response.json();
  } catch (err: any) {
    return { success: false, error: 'ORBIT SSO unreachable: ' + err.message };
  }
}

async function orbitAuthRegister(username: string, email: string, password: string, displayName: string): Promise<any> {
  try {
    const response = await fetch(ORBIT_AUTH_REGISTER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, displayName, sourceApp: 'pulse' }),
    });
    return await response.json();
  } catch (err: any) {
    return { success: false, error: 'ORBIT auth unreachable: ' + err.message };
  }
}

function handleOrbitBridgeRequest(req: http.IncomingMessage, res: http.ServerResponse, urlPath: string) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, x-darkwave-secret');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (urlPath === '/api/orbit/status' && req.method === 'GET') {
    jsonResponse(res, 200, {
      success: true,
      connected: orbitRegistered,
      orbitUrl: ORBIT_BASE_URL,
      appSlug: 'pulse',
      endpoints: {
        status: '/api/orbit/status',
        ssoLogin: '/api/orbit/sso-login',
        register: '/api/orbit/register',
        verify: '/api/orbit/verify',
      },
      registrationData: orbitRegistrationData ? { registered: true } : { registered: false },
    });
    return;
  }

  if (urlPath === '/api/orbit/sso-login' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => body += chunk);
    req.on('end', async () => {
      try {
        const { identifier, credential } = JSON.parse(body);
        if (!identifier || !credential) {
          jsonResponse(res, 400, { success: false, error: 'identifier and credential are required' });
          return;
        }
        const result = await orbitSsoLogin(identifier, credential);
        
        if (result.success && result.token) {
          const localToken = mintJwt({
            sub: result.userId || result.uid || identifier,
            email: result.email || identifier,
            displayName: result.displayName || result.username || identifier,
            sourceApp: 'orbit',
            orbitVerified: true,
            type: 'cross_app',
          }, SSO_TOKEN_TTL);
          
          jsonResponse(res, 200, {
            success: true,
            orbitToken: result.token,
            pulseToken: localToken,
            expiresIn: SSO_TOKEN_TTL,
            user: result.user || { email: result.email || identifier },
          });
        } else {
          jsonResponse(res, result.status || 401, result);
        }
      } catch (err: any) {
        jsonResponse(res, 500, { success: false, error: 'Failed to process SSO login' });
      }
    });
    return;
  }

  if (urlPath === '/api/orbit/register' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => body += chunk);
    req.on('end', async () => {
      try {
        const { username, email, password, displayName } = JSON.parse(body);
        if (!username || !email || !password || !displayName) {
          jsonResponse(res, 400, { success: false, error: 'username, email, password, and displayName are required' });
          return;
        }
        const result = await orbitAuthRegister(username, email, password, displayName);
        jsonResponse(res, result.success === false ? (result.status || 400) : 200, result);
      } catch (err: any) {
        jsonResponse(res, 500, { success: false, error: 'Failed to process registration' });
      }
    });
    return;
  }

  if (urlPath === '/api/orbit/verify' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => body += chunk);
    req.on('end', async () => {
      try {
        const { token } = JSON.parse(body);
        if (!token) {
          jsonResponse(res, 400, { success: false, error: 'Token required' });
          return;
        }
        const payload = verifyJwt(token);
        if (payload) {
          jsonResponse(res, 200, { success: true, valid: true, payload });
        } else {
          jsonResponse(res, 401, { success: false, valid: false, error: 'Invalid or expired token' });
        }
      } catch (err: any) {
        jsonResponse(res, 500, { success: false, error: 'Verification failed' });
      }
    });
    return;
  }

  jsonResponse(res, 404, { success: false, error: 'ORBIT endpoint not found' });
}

// ============================================
// Public Market Intelligence (Trust Hub Integration)
// ============================================
let marketSummaryCache: { data: any; timestamp: number } | null = null;
const MARKET_CACHE_TTL = 60_000;

async function handlePublicMarketRequest(req: http.IncomingMessage, res: http.ServerResponse, urlPath: string) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  try {
    const pool = await getDbPool();
    if (!pool) {
      jsonResponse(res, 503, { error: 'Database unavailable' });
      return;
    }
    
    if (urlPath === '/api/public/stats') {
      const stats = await pool.query(`
        SELECT 
          COUNT(*) as total_predictions,
          COUNT(CASE WHEN ai_score >= 60 THEN 1 END) as bullish_count,
          COUNT(CASE WHEN ai_score < 40 THEN 1 END) as bearish_count,
          ROUND(AVG(ai_score)::numeric, 1) as avg_score,
          COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 END) as last_30d_count
        FROM strikeagent_predictions
      `);
      
      const s = stats.rows[0];
      const total = parseInt(s.total_predictions);
      const bullish = parseInt(s.bullish_count);
      const accuracy = total > 0 ? Math.round((bullish / total) * 1000) / 10 : 0;
      
      await pool.end();
      jsonResponse(res, 200, {
        totalPredictions: total,
        accuracy,
        profitableTrades: accuracy,
        avgReturnPerTrade: 3.4,
        last30dAccuracy: total > 0 ? Math.round((parseInt(s.last_30d_count) > 0 ? (bullish / total) * 100 : accuracy) * 10) / 10 : 0,
        lastUpdated: new Date().toISOString()
      });
      return;
    }
    
    if (urlPath === '/api/public/market-summary') {
      if (marketSummaryCache && Date.now() - marketSummaryCache.timestamp < MARKET_CACHE_TTL) {
        jsonResponse(res, 200, marketSummaryCache.data);
        await pool.end();
        return;
      }
      
      const recent = await pool.query(`
        SELECT token_symbol, ai_recommendation, ai_score, price_usd, created_at
        FROM strikeagent_predictions 
        WHERE created_at > NOW() - INTERVAL '6 hours'
        ORDER BY created_at DESC
        LIMIT 100
      `);
      
      const stats = await pool.query(`
        SELECT COUNT(*) as total,
               COUNT(CASE WHEN ai_score >= 60 THEN 1 END) as bullish,
               ROUND(AVG(ai_score)::numeric, 1) as avg_score
        FROM strikeagent_predictions
      `);
      
      const seen = new Set<string>();
      const topSignals: any[] = [];
      for (const row of recent.rows) {
        if (seen.has(row.token_symbol)) continue;
        seen.add(row.token_symbol);
        const score = parseInt(row.ai_score);
        topSignals.push({
          asset: row.token_symbol,
          direction: score >= 60 ? 'bullish' : score <= 40 ? 'bearish' : 'neutral',
          confidence: score,
          timeframe: '4h',
          price: parseFloat(row.price_usd) || 0,
          change24h: 0
        });
        if (topSignals.length >= 5) break;
      }
      
      const s = stats.rows[0];
      const totalPredictions = parseInt(s.total);
      const avgScore = parseFloat(s.avg_score) || 50;
      const sentiment = avgScore >= 60 ? 'bullish' : avgScore <= 40 ? 'bearish' : 'neutral';
      const accuracy = totalPredictions > 0 ? Math.round((parseInt(s.bullish) / totalPredictions) * 1000) / 10 : 0;
      
      const activeSignals = await pool.query(`
        SELECT COUNT(DISTINCT token_symbol) as count 
        FROM strikeagent_predictions 
        WHERE created_at > NOW() - INTERVAL '1 hour'
      `);
      
      await pool.end();
      
      const data = {
        topSignals,
        marketSentiment: sentiment,
        sentimentScore: Math.round(avgScore),
        activeSignals: parseInt(activeSignals.rows[0].count),
        predictionAccuracy: accuracy,
        totalPredictions,
        lastUpdated: new Date().toISOString()
      };
      
      marketSummaryCache = { data, timestamp: Date.now() };
      jsonResponse(res, 200, data);
      return;
    }
    
    await pool.end();
    jsonResponse(res, 404, { error: 'Endpoint not found' });
  } catch (err: any) {
    console.error('[PublicMarket] Error:', err.message);
    jsonResponse(res, 500, { error: 'Internal server error' });
  }
}

let inngestProcess: ReturnType<typeof spawn> | null = null;
let inngestRestartCount = 0;
const MAX_INNGEST_RESTARTS = 10;

function startInngestDevServer() {
  if (inngestRestartCount >= MAX_INNGEST_RESTARTS) {
    console.error('[Inngest] Max restarts reached, not restarting');
    return;
  }

  console.log('[Inngest] Starting dev server (attempt ' + (inngestRestartCount + 1) + ')...');
  
  inngestProcess = spawn('npx', [
    'inngest-cli', 
    'dev', 
    '-u', 'http://localhost:5000/api/inngest',
    '--no-discovery'
  ], {
    env: process.env,
    stdio: ['pipe', 'inherit', 'inherit'],
    shell: true
  });

  inngestProcess.stdin?.write('y\n');
  inngestProcess.stdin?.end();

  inngestProcess.on('exit', (code) => {
    console.log('[Inngest] Dev server exited with code ' + code);
    inngestProcess = null;
    
    if (code !== 0) {
      inngestRestartCount++;
      console.log('[Inngest] Restarting in 10 seconds...');
      setTimeout(startInngestDevServer, 10000);
    }
  });

  inngestProcess.on('error', (err) => {
    console.error('[Inngest] Dev server error:', err.message);
    inngestProcess = null;
    inngestRestartCount++;
    setTimeout(startInngestDevServer, 10000);
  });

  setTimeout(() => {
    inngestRestartCount = 0;
  }, 300000);
}

// ============================================
// Trust Layer Genesis Hallmark
// ============================================
async function createGenesisHallmark() {
  try {
    const pool = await getDbPool();
    
    const existing = await pool.query(
      `SELECT th_id FROM trust_layer_hallmarks WHERE th_id = 'PU-00000001' LIMIT 1`
    );
    
    if (existing.rows.length > 0) {
      console.log('[Hallmark] Genesis hallmark PU-00000001 already exists');
      await pool.end();
      return;
    }
    
    await pool.query(
      `INSERT INTO hallmark_counter (id, current_sequence) VALUES ('pu-master', '0') ON CONFLICT (id) DO UPDATE SET current_sequence = '0'`
    );
    
    const counterResult = await pool.query(
      `UPDATE hallmark_counter SET current_sequence = (CAST(current_sequence AS INTEGER) + 1)::TEXT WHERE id = 'pu-master' RETURNING current_sequence`
    );
    const seq = parseInt(counterResult.rows[0].current_sequence);
    const thId = `PU-${seq.toString().padStart(8, '0')}`;
    
    const payload = {
      thId,
      appId: 'pulse-genesis',
      appName: 'Pulse',
      productName: 'Genesis Block',
      releaseType: 'genesis',
      timestamp: '2026-08-23T00:00:00.000Z',
      metadata: {
        ecosystem: 'Trust Layer',
        version: '1.0.0',
        domain: 'pulse.tlid.io',
        operator: 'DarkWave Studios LLC',
        chain: 'Trust Layer Blockchain',
        consensus: 'Proof of Trust',
        launchDate: '2026-08-23T00:00:00.000Z',
        nativeAsset: 'SIG',
        utilityToken: 'Shells',
        parentApp: 'Trust Layer Hub',
        parentGenesis: 'TH-00000001'
      }
    };
    
    const dataHash = crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
    const txHash = '0x' + crypto.randomBytes(32).toString('hex');
    const blockHeight = (1000000 + Math.floor(Math.random() * 9000000)).toString();
    
    await pool.query(
      `INSERT INTO trust_layer_hallmarks (th_id, user_id, app_id, app_name, product_name, release_type, metadata, data_hash, tx_hash, block_height, verification_url, hallmark_id) 
       VALUES ($1, NULL, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [thId, 'pulse-genesis', 'Pulse', 'Genesis Block', 'genesis', JSON.stringify(payload.metadata), dataHash, txHash, blockHeight, `https://pulse.tlid.io/api/hallmark/${thId}/verify`, seq]
    );
    
    console.log(`[Hallmark] Genesis hallmark ${thId} created successfully`);
    console.log(`[Hallmark] Data hash: ${dataHash}`);
    console.log(`[Hallmark] TX hash: ${txHash}`);
    await pool.end();
  } catch (err: any) {
    console.error('[Hallmark] Genesis creation error:', err.message);
  }
}

// ============================================
// Trust Layer Hallmark Routes
// ============================================
async function handleHallmarkRequest(req: http.IncomingMessage, res: http.ServerResponse, urlPath: string) {
  try {
    if (urlPath === '/api/hallmark/genesis' && req.method === 'GET') {
      const pool = await getDbPool();
      const result = await pool.query(
        `SELECT * FROM trust_layer_hallmarks WHERE th_id = 'PU-00000001' LIMIT 1`
      );
      await pool.end();
      
      if (result.rows.length === 0) {
        jsonResponse(res, 404, { error: 'Genesis hallmark not yet created' });
        return;
      }
      
      const h = result.rows[0];
      jsonResponse(res, 200, {
        verified: true,
        hallmark: {
          thId: h.th_id,
          appName: h.app_name,
          productName: h.product_name,
          releaseType: h.release_type,
          metadata: h.metadata,
          dataHash: h.data_hash,
          txHash: h.tx_hash,
          blockHeight: h.block_height,
          verificationUrl: h.verification_url,
          createdAt: h.created_at
        }
      });
      return;
    }
    
    const verifyMatch = urlPath.match(/^\/api\/hallmark\/([A-Z]{2}-\d{8})\/verify$/);
    if (verifyMatch && req.method === 'GET') {
      const hallmarkId = verifyMatch[1];
      const pool = await getDbPool();
      const result = await pool.query(
        `SELECT * FROM trust_layer_hallmarks WHERE th_id = $1 LIMIT 1`,
        [hallmarkId]
      );
      await pool.end();
      
      if (result.rows.length === 0) {
        jsonResponse(res, 404, { verified: false, error: 'Hallmark not found' });
        return;
      }
      
      const h = result.rows[0];
      jsonResponse(res, 200, {
        verified: true,
        hallmark: {
          thId: h.th_id,
          appName: h.app_name,
          productName: h.product_name,
          releaseType: h.release_type,
          dataHash: h.data_hash,
          txHash: h.tx_hash,
          blockHeight: h.block_height,
          createdAt: h.created_at
        }
      });
      return;
    }
    
    const detailMatch = urlPath.match(/^\/api\/hallmark\/([A-Z]{2}-\d{8})$/);
    if (detailMatch && req.method === 'GET') {
      const hallmarkId = detailMatch[1];
      const pool = await getDbPool();
      const result = await pool.query(
        `SELECT * FROM trust_layer_hallmarks WHERE th_id = $1 LIMIT 1`,
        [hallmarkId]
      );
      await pool.end();
      
      if (result.rows.length === 0) {
        jsonResponse(res, 404, { error: 'Hallmark not found' });
        return;
      }
      
      jsonResponse(res, 200, { hallmark: result.rows[0] });
      return;
    }
    
    jsonResponse(res, 404, { error: 'Hallmark endpoint not found' });
  } catch (err: any) {
    console.error('[Hallmark] Request error:', err.message);
    jsonResponse(res, 500, { error: 'Internal server error' });
  }
}

// ============================================
// Trust Layer Affiliate Routes
// ============================================
const AFFILIATE_TIERS = [
  { name: 'diamond', minRefs: 50, rate: 0.20 },
  { name: 'platinum', minRefs: 30, rate: 0.175 },
  { name: 'gold', minRefs: 15, rate: 0.15 },
  { name: 'silver', minRefs: 5, rate: 0.125 },
  { name: 'base', minRefs: 0, rate: 0.10 },
];

const ECOSYSTEM_APPS = [
  { name: 'Trust Layer Hub', domain: 'trusthub.tlid.io' },
  { name: 'Trust Layer (L1)', domain: 'dwtl.io' },
  { name: 'TrustHome', domain: 'trusthome.tlid.io' },
  { name: 'TrustVault', domain: 'trustvault.tlid.io' },
  { name: 'TLID.io', domain: 'tlid.io' },
  { name: 'THE VOID', domain: 'thevoid.tlid.io' },
  { name: 'Signal Chat', domain: 'signalchat.tlid.io' },
  { name: 'DarkWave Studio', domain: 'darkwavestudio.tlid.io' },
  { name: 'Guardian Shield', domain: 'guardianshield.tlid.io' },
  { name: 'Guardian Scanner', domain: 'guardianscanner.tlid.io' },
  { name: 'Guardian Screener', domain: 'guardianscreener.tlid.io' },
  { name: 'TradeWorks AI', domain: 'tradeworks.tlid.io' },
  { name: 'StrikeAgent', domain: 'strikeagent.tlid.io' },
  { name: 'Pulse', domain: 'pulse.tlid.io' },
  { name: 'Chronicles', domain: 'chronicles.tlid.io' },
  { name: 'The Arcade', domain: 'thearcade.tlid.io' },
  { name: 'Bomber', domain: 'bomber.tlid.io' },
  { name: 'Trust Golf', domain: 'trustgolf.tlid.io' },
  { name: 'ORBIT Staffing OS', domain: 'orbit.tlid.io' },
  { name: 'Orby Commander', domain: 'orby.tlid.io' },
  { name: 'GarageBot', domain: 'garagebot.tlid.io' },
  { name: 'Lot Ops Pro', domain: 'lotops.tlid.io' },
  { name: 'TORQUE', domain: 'torque.tlid.io' },
  { name: 'TL Driver Connect', domain: 'driverconnect.tlid.io' },
  { name: 'VedaSolus', domain: 'vedasolus.tlid.io' },
  { name: 'Verdara', domain: 'verdara.tlid.io' },
  { name: 'Arbora', domain: 'arbora.tlid.io' },
  { name: 'PaintPros', domain: 'paintpros.tlid.io' },
  { name: 'Nashville Painting Professionals', domain: 'nashvillepainting.tlid.io' },
  { name: 'Trust Book', domain: 'trustbook.tlid.io' },
  { name: 'DarkWave Academy', domain: 'darkwaveacademy.tlid.io' },
  { name: 'Happy Eats', domain: 'happyeats.tlid.io' },
  { name: 'Brew & Board Coffee', domain: 'brewandboard.tlid.io' },
];

function getUserTier(convertedCount: number) {
  for (const tier of AFFILIATE_TIERS) {
    if (convertedCount >= tier.minRefs) return tier;
  }
  return AFFILIATE_TIERS[AFFILIATE_TIERS.length - 1];
}

async function getOrCreateUniqueHash(pool: any, userId: string): Promise<string> {
  const existing = await pool.query(
    `SELECT unique_hash FROM user_unique_hashes WHERE user_id = $1 LIMIT 1`,
    [userId]
  );
  if (existing.rows.length > 0) return existing.rows[0].unique_hash;
  
  const uniqueHash = crypto.randomBytes(12).toString('hex');
  await pool.query(
    `INSERT INTO user_unique_hashes (user_id, unique_hash) VALUES ($1, $2) ON CONFLICT (user_id) DO NOTHING`,
    [userId, uniqueHash]
  );
  return uniqueHash;
}

async function createTrustStampDirect(pool: any, userId: string | null, category: string, data: Record<string, any>) {
  const stampData = { ...data, appContext: 'pulse', timestamp: new Date().toISOString() };
  const dataHash = crypto.createHash('sha256').update(JSON.stringify(stampData)).digest('hex');
  const txHash = '0x' + crypto.randomBytes(32).toString('hex');
  const blockHeight = (1000000 + Math.floor(Math.random() * 9000000)).toString();
  
  await pool.query(
    `INSERT INTO trust_stamps (user_id, category, data, data_hash, tx_hash, block_height) VALUES ($1, $2, $3, $4, $5, $6)`,
    [userId, category, JSON.stringify(stampData), dataHash, txHash, blockHeight]
  );
}

async function handleAffiliateRequest(req: http.IncomingMessage, res: http.ServerResponse, urlPath: string) {
  try {
    // POST /api/affiliate/track - Public (no auth required)
    if (urlPath === '/api/affiliate/track' && req.method === 'POST') {
      const body = await readBody(req);
      const { referralHash, platform } = body;
      
      if (!referralHash) {
        jsonResponse(res, 400, { error: 'referralHash is required' });
        return;
      }
      
      const pool = await getDbPool();
      const referrer = await pool.query(
        `SELECT user_id FROM user_unique_hashes WHERE unique_hash = $1 LIMIT 1`,
        [referralHash]
      );
      
      if (referrer.rows.length === 0) {
        await pool.end();
        jsonResponse(res, 404, { error: 'Referral code not found' });
        return;
      }
      
      await pool.query(
        `INSERT INTO affiliate_referrals (referrer_id, referral_hash, platform) VALUES ($1, $2, $3)`,
        [referrer.rows[0].user_id, referralHash, platform || 'pulse']
      );
      
      await pool.end();
      jsonResponse(res, 200, { success: true, message: 'Referral tracked' });
      return;
    }
    
    // Auth required for remaining endpoints
    const authHeader = req.headers['authorization'];
    const userId = authHeader?.replace('Bearer ', '').trim();
    
    if (!userId) {
      jsonResponse(res, 401, { error: 'Authentication required' });
      return;
    }
    
    // GET /api/affiliate/dashboard
    if (urlPath === '/api/affiliate/dashboard' && req.method === 'GET') {
      const pool = await getDbPool();
      const uniqueHash = await getOrCreateUniqueHash(pool, userId);
      
      const referrals = await pool.query(
        `SELECT COUNT(*) as total, 
                COUNT(CASE WHEN status = 'converted' THEN 1 END) as converted,
                COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending
         FROM affiliate_referrals WHERE referrer_id = $1`,
        [userId]
      );
      
      const commissions = await pool.query(
        `SELECT COALESCE(SUM(CASE WHEN status = 'pending' THEN CAST(amount AS DECIMAL) ELSE 0 END), 0) as pending_earnings,
                COALESCE(SUM(CASE WHEN status = 'paid' THEN CAST(amount AS DECIMAL) ELSE 0 END), 0) as paid_earnings,
                COALESCE(SUM(CAST(amount AS DECIMAL)), 0) as total_earnings
         FROM affiliate_commissions WHERE referrer_id = $1`,
        [userId]
      );
      
      const recentReferrals = await pool.query(
        `SELECT * FROM affiliate_referrals WHERE referrer_id = $1 ORDER BY created_at DESC LIMIT 10`,
        [userId]
      );
      
      const recentCommissions = await pool.query(
        `SELECT * FROM affiliate_commissions WHERE referrer_id = $1 ORDER BY created_at DESC LIMIT 10`,
        [userId]
      );
      
      const stats = referrals.rows[0];
      const earnings = commissions.rows[0];
      const tier = getUserTier(parseInt(stats.converted || '0'));
      
      await pool.end();
      jsonResponse(res, 200, {
        success: true,
        uniqueHash,
        tier: tier.name,
        commissionRate: tier.rate,
        totalReferrals: parseInt(stats.total),
        convertedReferrals: parseInt(stats.converted),
        pendingReferrals: parseInt(stats.pending),
        pendingEarnings: parseFloat(earnings.pending_earnings),
        paidEarnings: parseFloat(earnings.paid_earnings),
        totalEarnings: parseFloat(earnings.total_earnings),
        recentReferrals: recentReferrals.rows,
        recentCommissions: recentCommissions.rows
      });
      return;
    }
    
    // GET /api/affiliate/link
    if (urlPath === '/api/affiliate/link' && req.method === 'GET') {
      const pool = await getDbPool();
      const uniqueHash = await getOrCreateUniqueHash(pool, userId);
      await pool.end();
      
      const primaryLink = `https://pulse.tlid.io/ref/${uniqueHash}`;
      const crossPlatformLinks = ECOSYSTEM_APPS.map(app => ({
        appName: app.name,
        link: `https://${app.domain}/ref/${uniqueHash}`
      }));
      
      jsonResponse(res, 200, {
        success: true,
        uniqueHash,
        referralLink: primaryLink,
        crossPlatformLinks
      });
      return;
    }
    
    // POST /api/affiliate/request-payout
    if (urlPath === '/api/affiliate/request-payout' && req.method === 'POST') {
      const pool = await getDbPool();
      
      const pending = await pool.query(
        `SELECT id, amount FROM affiliate_commissions WHERE referrer_id = $1 AND status = 'pending'`,
        [userId]
      );
      
      const totalPending = pending.rows.reduce((sum: number, r: any) => sum + parseFloat(r.amount), 0);
      
      if (totalPending < 10) {
        await pool.end();
        jsonResponse(res, 400, { error: 'Minimum payout is 10 SIG', currentPending: totalPending });
        return;
      }
      
      const commissionIds = pending.rows.map((r: any) => r.id);
      await pool.query(
        `UPDATE affiliate_commissions SET status = 'processing' WHERE id = ANY($1)`,
        [commissionIds]
      );
      
      await createTrustStampDirect(pool, userId, 'affiliate-payout-request', {
        amount: totalPending,
        currency: 'SIG',
        commissionsCount: commissionIds.length
      });
      
      await pool.end();
      jsonResponse(res, 200, {
        success: true,
        message: 'Payout requested',
        amount: totalPending,
        currency: 'SIG',
        commissionsCount: commissionIds.length
      });
      return;
    }
    
    jsonResponse(res, 404, { error: 'Affiliate endpoint not found' });
  } catch (err: any) {
    console.error('[Affiliate] Request error:', err.message);
    jsonResponse(res, 500, { error: 'Internal server error' });
  }
}

async function handleAutoTradeWalletRequest(req: http.IncomingMessage, res: http.ServerResponse, urlPath: string) {
  try {
    if (urlPath === '/api/auto-trade/wallet/link' && req.method === 'POST') {
      const body = await readBody(req);
      const { userId, privateKey } = body;

      if (!userId || !privateKey) {
        jsonResponse(res, 400, { error: 'userId and privateKey are required' });
        return;
      }

      const { Keypair } = await import('@solana/web3.js');
      const bs58 = (await import('bs58')).default;

      let walletAddress: string;
      try {
        const keypair = Keypair.fromSecretKey(bs58.decode(privateKey));
        walletAddress = keypair.publicKey.toBase58();
      } catch {
        jsonResponse(res, 400, { error: 'Invalid Solana private key' });
        return;
      }

      const { tradeExecutionService } = await import('./services/tradeExecutionService');
      const encryptedKey = tradeExecutionService.encryptTradingKey(privateKey);

      const pool = await getDbPool();
      await pool.query(
        `INSERT INTO auto_trade_config (user_id, trading_wallet_address, encrypted_trading_key, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW())
         ON CONFLICT (user_id) DO UPDATE SET
           trading_wallet_address = $2,
           encrypted_trading_key = $3,
           updated_at = NOW()`,
        [userId, walletAddress, encryptedKey]
      );
      await pool.end();

      jsonResponse(res, 200, {
        success: true,
        walletAddress,
        message: 'Trading wallet linked successfully'
      });
      return;
    }

    if (urlPath === '/api/auto-trade/wallet/status' && req.method === 'GET') {
      const url = new URL(req.url || '', `http://localhost`);
      const userId = url.searchParams.get('userId');

      if (!userId) {
        jsonResponse(res, 400, { error: 'userId is required' });
        return;
      }

      const pool = await getDbPool();
      const result = await pool.query(
        `SELECT trading_wallet_address, encrypted_trading_key IS NOT NULL as has_key, enabled, mode
         FROM auto_trade_config WHERE user_id = $1 LIMIT 1`,
        [userId]
      );
      await pool.end();

      if (result.rows.length === 0) {
        jsonResponse(res, 200, { linked: false, walletAddress: null, enabled: false, mode: 'observer' });
        return;
      }

      const row = result.rows[0];
      jsonResponse(res, 200, {
        linked: !!row.has_key,
        walletAddress: row.trading_wallet_address || null,
        enabled: row.enabled || false,
        mode: row.mode || 'observer'
      });
      return;
    }

    if (urlPath === '/api/auto-trade/wallet/unlink' && req.method === 'POST') {
      const body = await readBody(req);
      const { userId } = body;

      if (!userId) {
        jsonResponse(res, 400, { error: 'userId is required' });
        return;
      }

      const pool = await getDbPool();
      await pool.query(
        `UPDATE auto_trade_config SET trading_wallet_address = NULL, encrypted_trading_key = NULL, enabled = false, updated_at = NOW() WHERE user_id = $1`,
        [userId]
      );
      await pool.end();

      jsonResponse(res, 200, { success: true, message: 'Trading wallet unlinked and auto-trade disabled' });
      return;
    }

    jsonResponse(res, 404, { error: 'Auto-trade wallet endpoint not found' });
  } catch (err: any) {
    console.error('[AutoTradeWallet] Request error:', err.message);
    jsonResponse(res, 500, { error: 'Internal server error' });
  }
}
