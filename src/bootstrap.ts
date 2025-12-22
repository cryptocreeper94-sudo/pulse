import http from 'http';
import fs from 'fs';
import path from 'path';
import { Worker } from 'worker_threads';

const PORT = 5000;
const MASTRA_PORT = 4111;

const FALLBACK_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Pulse</title><meta http-equiv="refresh" content="3"><style>body{background:#0f0f0f;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:system-ui}div{text-align:center}h1{color:#00D4FF;margin-bottom:10px}.loader{width:40px;height:40px;border:3px solid #333;border-top:3px solid #00D4FF;border-radius:50%;animation:spin 1s linear infinite;margin:20px auto}@keyframes spin{to{transform:rotate(360deg)}}</style></head><body><div><h1>PULSE</h1><div class="loader"></div><p>Loading AI Trading Platform...</p></div></body></html>`;

const MIME_TYPES: Record<string, string> = {
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.html': 'text/html'
};

let mastraReady = false;
let realHtml = FALLBACK_HTML;
let publicDir = '';
const staticCache = new Map<string, { data: Buffer; type: string }>();

function getStaticFile(urlPath: string): { data: Buffer; type: string } | null {
  if (!publicDir) return null;
  if (staticCache.has(urlPath)) {
    return staticCache.get(urlPath)!;
  }
  
  try {
    const filePath = path.join(publicDir, urlPath);
    if (!filePath.startsWith(publicDir)) {
      return null;
    }
    
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const data = fs.readFileSync(filePath);
      const ext = path.extname(filePath).toLowerCase();
      const type = MIME_TYPES[ext] || 'application/octet-stream';
      const cached = { data, type };
      staticCache.set(urlPath, cached);
      return cached;
    }
  } catch (e) {}
  
  return null;
}

const server = http.createServer((req, res) => {
  const url = req.url || '/';
  const acceptHeader = req.headers['accept'] || '';
  
  if (url === '/healthz' || url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end('{"status":"ok"}');
    return;
  }
  
  if (url === '/' || url === '/index.html') {
    const isBrowser = acceptHeader.includes('text/html');
    if (!isBrowser) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end('{"status":"ok"}');
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html', 'Cache-Control': 'no-cache' });
    res.end(realHtml);
    return;
  }
  
  if (url.startsWith('/api/')) {
    if (!mastraReady) {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end('{"error":"Starting..."}');
      return;
    }
    
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
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end('{"error":"Backend unavailable"}');
    });
    
    req.pipe(proxyReq);
    return;
  }
  
  const staticFile = getStaticFile(url);
  if (staticFile) {
    res.writeHead(200, { 'Content-Type': staticFile.type });
    res.end(staticFile.data);
    return;
  }
  
  res.writeHead(200, { 'Content-Type': 'text/html', 'Cache-Control': 'no-cache' });
  res.end(realHtml);
});

server.on('error', (err: NodeJS.ErrnoException) => {
  console.error('Server error:', err.message);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
  }
  process.exit(1);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server ready on port ${PORT}`);
  
  setImmediate(() => {
    publicDir = path.join(process.cwd(), 'public');
    const indexPath = path.join(publicDir, 'index.html');
    
    try {
      if (fs.existsSync(indexPath)) {
        realHtml = fs.readFileSync(indexPath, 'utf8');
        console.log('Loaded index.html');
      }
    } catch (e) {
      console.log('Using fallback HTML');
    }
    
    const workerPath = path.join(process.cwd(), 'dist', 'mastra-worker.js');
    
    if (fs.existsSync(workerPath)) {
      console.log('Starting Mastra worker...');
      const worker = new Worker(workerPath);
      
      worker.on('message', (msg) => {
        if (msg?.type === 'ready') {
          mastraReady = true;
          console.log('Mastra ready');
        }
      });
      
      worker.on('error', (err) => {
        console.error('Worker error:', err);
        mastraReady = true;
      });
      
      worker.on('exit', (code) => {
        console.log('Worker exited with code:', code);
        mastraReady = true;
      });
    } else {
      import('../.mastra/output/index.mjs')
        .then(() => {
          mastraReady = true;
          console.log('Mastra ready (direct import)');
        })
        .catch((err) => {
          console.error('Mastra import error:', err);
          mastraReady = true;
        });
    }
  });
});
