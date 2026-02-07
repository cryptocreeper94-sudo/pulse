import http from 'http';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { spawn } from 'child_process';
const PORT = Number(process.env.PORT || 5000);
const PUBLIC_DIR = path.join(process.cwd(), 'public');
// Minimal loading HTML - always available immediately
const LOADING_HTML = '<!DOCTYPE html><html><head><title>Pulse</title></head><body style="background:#0f0f0f;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:system-ui"><h1 style="color:#00D4FF">Loading Pulse...</h1></body></html>';
const MIME_TYPES = {
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
function serveStatic(req, res, urlPath) {
    if (!serverReady)
        return false; // Don't serve static files until fully ready
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
    }
    catch (e) {
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
    }
    catch (e) {
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
    }
    else {
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
    }
    catch (e) {
        console.error('Mastra init error:', e);
    }
    // Only start Inngest dev server in development
    const isActualDeploy = process.env.REPLIT_CONTEXT === 'deployment' && !process.env.REPLIT_DEV_DOMAIN;
    if (!isActualDeploy) {
        setTimeout(() => {
            startInngestDevServer();
        }, 1000);
    }
    else {
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
function b64url(str) {
    return Buffer.from(str).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function b64urlDecode(str) {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4)
        str += '=';
    return Buffer.from(str, 'base64').toString('utf8');
}
function hmac(data) {
    return crypto.createHmac('sha256', SSO_SECRET).update(data).digest('base64')
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function mintJwt(payload, ttl) {
    const h = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const now = Math.floor(Date.now() / 1000);
    const p = b64url(JSON.stringify({ ...payload, iat: now, exp: now + ttl, iss: 'darkwave-pulse' }));
    return `${h}.${p}.${hmac(`${h}.${p}`)}`;
}
function verifyJwt(token) {
    if (!SSO_SECRET)
        return null;
    try {
        const [h, p, s] = token.split('.');
        if (!h || !p || !s)
            return null;
        if (s !== hmac(`${h}.${p}`))
            return null;
        const payload = JSON.parse(b64urlDecode(p));
        if (payload.exp && payload.exp < Math.floor(Date.now() / 1000))
            return null;
        return payload;
    }
    catch {
        return null;
    }
}
function jsonResponse(res, status, data) {
    res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify(data));
}
function readBody(req) {
    return new Promise((resolve) => {
        let body = '';
        req.on('data', (chunk) => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                resolve(JSON.parse(body));
            }
            catch {
                resolve({});
            }
        });
        req.on('error', () => resolve({}));
    });
}
async function handleSsoRequest(req, res, urlPath) {
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
        if (!SSO_SECRET) {
            jsonResponse(res, 503, { success: false, error: 'SSO not configured' });
            return;
        }
        const appSecret = req.headers['x-darkwave-secret'];
        if (!appSecret || !DARKWAVE_API_SECRET || appSecret !== DARKWAVE_API_SECRET) {
            jsonResponse(res, 401, { success: false, error: 'Invalid or missing x-darkwave-secret header' });
            return;
        }
        const body = await readBody(req);
        const { uid, email, displayName, photoURL, sourceApp, hallmarkId } = body;
        if (!uid || !email) {
            jsonResponse(res, 400, { success: false, error: 'uid and email required' });
            return;
        }
        if (sourceApp && !ALLOWED_SOURCE_APPS.includes(sourceApp)) {
            jsonResponse(res, 400, { success: false, error: 'Unrecognized sourceApp' });
            return;
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
        if (!SSO_SECRET) {
            jsonResponse(res, 503, { success: false, error: 'SSO not configured' });
            return;
        }
        let token = null;
        const authHeader = req.headers['authorization'];
        if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
            token = authHeader.slice(7);
        }
        if (!token) {
            const body = await readBody(req);
            token = body.token;
        }
        if (!token) {
            jsonResponse(res, 400, { success: false, error: 'Token required' });
            return;
        }
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
        if (!SSO_SECRET) {
            jsonResponse(res, 503, { success: false, error: 'SSO not configured' });
            return;
        }
        let token = null;
        const authHeader = req.headers['authorization'];
        if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
            token = authHeader.slice(7);
        }
        if (!token) {
            const body = await readBody(req);
            token = body.token;
        }
        if (!token) {
            jsonResponse(res, 400, { success: false, error: 'Cross-app token required' });
            return;
        }
        const payload = verifyJwt(token);
        if (!payload) {
            jsonResponse(res, 401, { success: false, error: 'Invalid or expired token' });
            return;
        }
        if (payload.type !== 'cross_app') {
            jsonResponse(res, 400, { success: false, error: 'Only cross_app tokens can be exchanged' });
            return;
        }
        if (payload.sourceApp && !ALLOWED_SOURCE_APPS.includes(payload.sourceApp)) {
            jsonResponse(res, 403, { success: false, error: 'Unrecognized source app' });
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
let inngestProcess = null;
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
