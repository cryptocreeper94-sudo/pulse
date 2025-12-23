import http from 'http';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const PORT = parseInt(process.env.PORT || '5000', 10);
const MASTRA_PORT = 4111;

const FALLBACK_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Pulse</title><meta http-equiv="refresh" content="3"><style>body{background:#0f0f0f;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:system-ui}div{text-align:center}h1{color:#00D4FF;margin-bottom:10px}.loader{width:40px;height:40px;border:3px solid #333;border-top:3px solid #00D4FF;border-radius:50%;animation:spin 1s linear infinite;margin:20px auto}@keyframes spin{to{transform:rotate(360deg)}}</style></head><body><div><h1>PULSE</h1><div class="loader"></div><p>Loading AI Trading Platform...</p></div></body></html>`;

const MIME_TYPES: Record<string, string> = {
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.html': 'text/html',
  '.webp': 'image/webp'
};

let mastraReady = false;
let realHtml = FALLBACK_HTML;
let publicDir = '';

function loadHtml() {
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
}

function serveStatic(urlPath: string, res: http.ServerResponse): boolean {
  if (!publicDir) return false;
  
  try {
    let filePath = path.join(publicDir, urlPath);
    if (!filePath.startsWith(publicDir)) return false;
    
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      const data = fs.readFileSync(filePath);
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
      return true;
    }
  } catch (e) {}
  
  return false;
}

const server = http.createServer((req, res) => {
  const url = req.url || '/';
  
  if (url === '/healthz' || url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end('{"status":"ok"}');
    return;
  }
  
  if (url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html', 'Cache-Control': 'no-cache' });
    res.end(realHtml);
    return;
  }
  
  if (url.startsWith('/api/')) {
    if (!mastraReady) {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end('{"error":"Starting...","message":"Backend is initializing"}');
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
  
  if (serveStatic(url, res)) return;
  
  res.writeHead(200, { 'Content-Type': 'text/html', 'Cache-Control': 'no-cache' });
  res.end(realHtml);
});

server.on('error', (err: NodeJS.ErrnoException) => {
  console.error('Server error:', err.message);
  process.exit(1);
});

console.log(`Starting server on port ${PORT}...`);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
  
  loadHtml();
  
  const mastraPath = path.join(process.cwd(), '.mastra', 'output', 'index.mjs');
  
  if (fs.existsSync(mastraPath)) {
    console.log('Starting Mastra backend...');
    
    const child = spawn('node', [mastraPath], {
      env: { ...process.env, PORT: String(MASTRA_PORT) },
      stdio: 'inherit'
    });
    
    child.on('error', (err) => {
      console.error('Mastra spawn error:', err);
      mastraReady = true;
    });
    
    child.on('exit', (code) => {
      console.log('Mastra exited with code:', code);
    });
    
    setTimeout(() => {
      mastraReady = true;
      console.log('Mastra marked ready');
    }, 10000);
  } else {
    console.log('No Mastra output found');
    mastraReady = true;
  }
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});
