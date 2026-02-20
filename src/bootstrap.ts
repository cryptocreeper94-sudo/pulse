import http from 'http';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { spawn } from 'child_process';

const PORT = Number(process.env.PORT || 5000);
const PUBLIC_DIR = path.join(process.cwd(), 'public');

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

  // Ecosystem Widget routes - handled directly (no Mastra dependency)
  if (urlPath === '/api/ecosystem/widget-data' || urlPath === '/api/ecosystem/widget.js') {
    handleEcosystemWidgetRequest(req, res, urlPath);
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
    const mastraPath = path.join(process.cwd(), '.mastra', 'output', 'index.mjs');
    if (fs.existsSync(mastraPath)) {
      spawn('node', [mastraPath], {
        env: { ...process.env, PORT: '4111' },
        stdio: 'inherit'
      });
      console.log('Mastra starting on 127.0.0.1:4111');
    }
  } catch (e) {
    console.error('Mastra init error:', e);
  }

  // Only start Inngest dev server in development
  const isActualDeploy = process.env.REPLIT_CONTEXT === 'deployment' && !process.env.REPLIT_DEV_DOMAIN;
  
  if (!isActualDeploy) {
    setTimeout(() => {
      startInngestDevServer();
    }, 1000);
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
  const { Pool } = await import('pg');
  return new Pool({ connectionString: dbUrl });
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
