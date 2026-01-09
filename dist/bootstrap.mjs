import http from 'http';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
const PORT = Number(process.env.PORT || 5000);
const PUBLIC_DIR = path.join(process.cwd(), 'public');
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
let indexHtml = '';
function serveStatic(req, res, urlPath) {
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
const server = http.createServer((req, res) => {
    const urlPath = req.url?.split('?')[0] || '/';
    if (urlPath === '/healthz' || urlPath === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end('{"status":"ok"}');
        return;
    }
    if (urlPath === '/') {
        const accept = req.headers['accept'] || '';
        if (!accept.includes('text/html')) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end('{"status":"ok"}');
            return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html', 'Cache-Control': 'no-cache' });
        res.end(indexHtml);
        return;
    }
    if (urlPath.startsWith('/api/')) {
        const proxyReq = http.request({
            hostname: '127.0.0.1',
            port: 4111,
            path: req.url,
            method: req.method,
            headers: req.headers
        }, (proxyRes) => {
            // Add no-cache headers to prevent CDN/edge caching of API responses
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
    if (serveStatic(req, res, urlPath)) {
        return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html', 'Cache-Control': 'no-cache' });
    res.end(indexHtml);
});
server.listen(PORT, '0.0.0.0', () => {
    console.log('Server ready on port ' + PORT);
    try {
        const indexPath = path.join(PUBLIC_DIR, 'index.html');
        if (fs.existsSync(indexPath)) {
            indexHtml = fs.readFileSync(indexPath, 'utf8');
        }
        else {
            indexHtml = '<!DOCTYPE html><html><head><title>Pulse</title></head><body style="background:#0f0f0f;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:system-ui"><h1 style="color:#00D4FF">Loading Pulse...</h1></body></html>';
        }
    }
    catch (e) {
        indexHtml = '<!DOCTYPE html><html><head><title>Pulse</title></head><body>Loading...</body></html>';
    }
    setTimeout(() => {
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
    }, 2000);
    // Only start Inngest dev server in development, not in production
    // In production, Inngest Cloud handles events directly
    const isProduction = process.env.NODE_ENV === 'production' ||
        process.env.REPLIT_DEPLOYMENT === '1' ||
        process.env.REPLIT_DEV_DOMAIN === undefined;
    if (!isProduction) {
        setTimeout(() => {
            startInngestDevServer();
        }, 5000);
    }
    else {
        console.log('[Inngest] Production mode - using Inngest Cloud directly');
    }
});
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
