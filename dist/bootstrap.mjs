import http from 'http';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
const PORT = Number(process.env.PORT || 5000);
let html = '<!DOCTYPE html><html><head><title>Pulse</title><meta http-equiv="refresh" content="2"></head><body style="background:#0f0f0f;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:system-ui"><h1 style="color:#00D4FF">Loading Pulse...</h1></body></html>';
const server = http.createServer((req, res) => {
    if (req.url === '/healthz' || req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end('{"status":"ok"}');
        return;
    }
    if (req.url?.startsWith('/api/')) {
        const proxyReq = http.request({
            hostname: '127.0.0.1',
            port: 4111,
            path: req.url,
            method: req.method,
            headers: req.headers
        }, (proxyRes) => {
            res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
            proxyRes.pipe(res);
        });
        proxyReq.on('error', () => {
            res.writeHead(503);
            res.end('{"error":"starting"}');
        });
        req.pipe(proxyReq);
        return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
});
server.listen(PORT, '0.0.0.0', () => {
    console.log('Server ready on port ' + PORT);
    setImmediate(() => {
        try {
            const publicDir = path.join(process.cwd(), 'public');
            const indexPath = path.join(publicDir, 'index.html');
            if (fs.existsSync(indexPath)) {
                html = fs.readFileSync(indexPath, 'utf8');
            }
        }
        catch (e) { }
    });
    setTimeout(() => {
        try {
            const mastraPath = path.join(process.cwd(), '.mastra', 'output', 'index.mjs');
            if (fs.existsSync(mastraPath)) {
                spawn('node', [mastraPath], {
                    env: { ...process.env, PORT: '4111', HOST: '127.0.0.1' },
                    stdio: 'inherit'
                });
            }
        }
        catch (e) {
            console.error('Mastra init error:', e);
        }
    }, 30000);
});
