import http from 'http';
import path from 'path';
import fs from 'fs';
import { Worker } from 'worker_threads';

const PORT = Number(process.env.PORT ?? 5000);
const MASTRA_PORT = 4111;

// Don't mark ready until worker confirms
let mastraReady = false;

const publicDir = path.join(process.cwd(), 'public');
const indexPath = path.join(publicDir, 'index.html');

// Minimal fallback for instant response
const fallbackHtml = Buffer.from('<!DOCTYPE html><html><head><meta charset="utf-8"><title>Pulse</title><meta http-equiv="refresh" content="2"></head><body style="background:#0f0f0f;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:system-ui"><div>Loading Pulse...</div></body></html>');

// Pre-load HTML - this happens before server starts
let cachedIndexHtml: Buffer = fallbackHtml;
try {
  cachedIndexHtml = fs.readFileSync(indexPath);
} catch {
  // Use fallback
}

const server = http.createServer((req, res) => {
  const url = req.url || '/';
  
  // Health checks - ALWAYS respond instantly
  if (url === '/healthz' || url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
    return;
  }
  
  // Root - serve cached HTML instantly
  if (url === '/' || url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(cachedIndexHtml);
    return;
  }
  
  // API proxy - only if Mastra is ready
  if (url.startsWith('/api/')) {
    if (!mastraReady) {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Starting up...', ready: false }));
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

// Start server FIRST, then initialize worker in background
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server ready on port ${PORT} - accepting health checks`);
  
  // Defer ALL heavy initialization
  setTimeout(() => {
    const workerPath = path.join(process.cwd(), 'dist', 'mastra-worker.js');
    
    try {
      if (fs.existsSync(workerPath)) {
        console.log('Starting Mastra worker...');
        const worker = new Worker(workerPath);
        
        // Wait for worker to signal ready
        worker.on('message', (msg) => {
          if (msg && msg.type === 'ready') {
            mastraReady = true;
            console.log('Mastra worker ready');
          }
        });
        
        worker.on('error', (e) => {
          console.error('Worker error:', e);
          // Still mark ready so API shows proper errors
          mastraReady = true;
        });
        
        worker.on('exit', (code) => {
          console.log('Worker exited:', code);
          mastraReady = true;
        });
        
        // Fallback: mark ready after 60s regardless
        setTimeout(() => {
          if (!mastraReady) {
            mastraReady = true;
            console.log('Mastra ready (timeout fallback)');
          }
        }, 60000);
      } else {
        console.log('No worker found, using direct import...');
        import('../.mastra/output/index.mjs')
          .then(() => {
            mastraReady = true;
            console.log('Mastra ready (direct import)');
          })
          .catch((e) => {
            console.error('Mastra import error:', e);
            mastraReady = true;
          });
      }
    } catch (e) {
      console.error('Worker init error:', e);
      mastraReady = true;
    }
  }, 100); // Small delay to ensure server is fully listening
});
