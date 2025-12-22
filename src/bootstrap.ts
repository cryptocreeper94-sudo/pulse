import http from 'http';
import path from 'path';
import fs from 'fs';
import { Worker } from 'worker_threads';

const PORT = Number(process.env.PORT ?? 5000);
const MASTRA_PORT = 4111;

let mastraReady = false;

const publicDir = path.join(process.cwd(), 'public');
const indexPath = path.join(publicDir, 'index.html');

// Minimal fallback for instant response if file not found
const fallbackHtml = Buffer.from('<!DOCTYPE html><html><head><meta charset="utf-8"><title>Pulse</title><meta http-equiv="refresh" content="2"></head><body style="background:#0f0f0f;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:system-ui"><div>Loading Pulse...</div></body></html>');

// Try to load index.html synchronously, fall back if not available
let cachedIndexHtml: Buffer;
try {
  cachedIndexHtml = fs.readFileSync(indexPath);
} catch {
  cachedIndexHtml = fallbackHtml;
}

const server = http.createServer((req, res) => {
  const url = req.url || '/';
  
  // Health checks - respond immediately
  if (url === '/healthz' || url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
    return;
  }
  
  // Root and index - serve cached HTML instantly
  if (url === '/' || url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(cachedIndexHtml);
    return;
  }
  
  // API proxy
  if (url.startsWith('/api/')) {
    if (!mastraReady) {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Starting up...' }));
      return;
    }
    
    const options = {
      hostname: '127.0.0.1',
      port: MASTRA_PORT,
      path: url,
      method: req.method,
      headers: req.headers
    };
    
    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
      proxyRes.pipe(res);
    });
    
    proxyReq.on('error', () => {
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Backend unavailable' }));
    });
    
    req.pipe(proxyReq);
    return;
  }
  
  // Static files
  const filePath = path.join(publicDir, url);
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(cachedIndexHtml);
      return;
    }
    
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon',
      '.woff': 'font/woff',
      '.woff2': 'font/woff2'
    };
    
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

// Start server immediately
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server ready on port ${PORT}`);
  
  // Defer Mastra worker initialization to not block event loop
  setImmediate(() => {
    mastraReady = true;
    
    const workerPath = path.join(process.cwd(), 'dist', 'mastra-worker.js');
    
    try {
      if (fs.existsSync(workerPath)) {
        const worker = new Worker(workerPath);
        worker.on('error', (e) => console.error('Worker error:', e));
        worker.on('exit', (code) => console.log('Worker exited:', code));
      } else {
        import('../.mastra/output/index.mjs').catch((e) => console.error('Mastra import error:', e));
      }
    } catch (e) {
      console.error('Worker init error:', e);
    }
  });
});
