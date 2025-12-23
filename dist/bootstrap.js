import http from 'http';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
const PORT = Number(process.env.PORT ?? 5000);
const MASTRA_PORT = 4111;
const FALLBACK_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Pulse</title><meta http-equiv="refresh" content="3"><style>body{background:#0f0f0f;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:system-ui}div{text-align:center}h1{color:#00D4FF;margin-bottom:10px}.loader{width:40px;height:40px;border:3px solid #333;border-top:3px solid #00D4FF;border-radius:50%;animation:spin 1s linear infinite;margin:20px auto}@keyframes spin{to{transform:rotate(360deg)}}</style></head><body><div><h1>PULSE</h1><div class="loader"></div><p>Loading...</p></div></body></html>`;
let html = FALLBACK_HTML;
let publicDir = '';
const server = http.createServer((req, res) => {
    const url = req.url || '/';
    if (url === '/healthz' || url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end('{"status":"ok"}');
        return;
    }
    if (url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
        return;
    }
    if (url.startsWith('/api/')) {
        const proxyReq = http.request({
            hostname: '127.0.0.1',
            port: MASTRA_PORT,
            path: url,
            method: req.method,
            headers: req.headers
        }, (proxyRes) => {
            res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
            proxyRes.pipe(res);
        });
        proxyReq.on('error', () => {
            res.writeHead(503, { 'Content-Type': 'application/json' });
            res.end('{"error":"Backend starting"}');
        });
        req.pipe(proxyReq);
        return;
    }
    if (publicDir) {
        const filePath = path.join(publicDir, url);
        if (filePath.startsWith(publicDir) && fs.existsSync(filePath)) {
            try {
                const stat = fs.statSync(filePath);
                if (stat.isFile()) {
                    res.writeHead(200);
                    fs.createReadStream(filePath).pipe(res);
                    return;
                }
            }
            catch { }
        }
    }
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
});
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Ready on port ${PORT}`);
    setImmediate(() => {
        publicDir = path.join(process.cwd(), 'public');
        const indexPath = path.join(publicDir, 'index.html');
        if (fs.existsSync(indexPath)) {
            html = fs.readFileSync(indexPath, 'utf8');
        }
        const mastraPath = path.join(process.cwd(), '.mastra', 'output', 'index.mjs');
        if (fs.existsSync(mastraPath)) {
            spawn('node', [mastraPath], {
                env: { ...process.env, PORT: String(MASTRA_PORT) },
                stdio: 'inherit'
            });
        }
    });
});
