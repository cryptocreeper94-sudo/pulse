import http from 'http';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs';

const PORT = 5000;
const MASTRA_PORT = 5001;

let mastraReady = false;
let mastraProcess: ChildProcess | null = null;

const server = http.createServer((req, res) => {
  const url = req.url || '/';
  
  if (url === '/healthz' || url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', mastraReady }));
    return;
  }
  
  if (url.startsWith('/api/')) {
    if (!mastraReady) {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Server starting up, please wait...' }));
      return;
    }
    
    const options = {
      hostname: 'localhost',
      port: MASTRA_PORT,
      path: url,
      method: req.method,
      headers: req.headers
    };
    
    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
      proxyRes.pipe(res);
    });
    
    proxyReq.on('error', (err) => {
      console.error('Proxy error:', err.message);
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Backend unavailable' }));
    });
    
    req.pipe(proxyReq);
    return;
  }
  
  const publicDir = path.join(process.cwd(), 'darkwave-web', 'dist');
  let filePath = path.join(publicDir, url === '/' ? 'index.html' : url);
  
  if (!filePath.includes('.')) {
    filePath = path.join(publicDir, 'index.html');
  }
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      fs.readFile(path.join(publicDir, 'index.html'), (err2, indexData) => {
        if (err2) {
          res.writeHead(404);
          res.end('Not found');
          return;
        }
        res.writeHead(200, { 
          'Content-Type': 'text/html',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        });
        res.end(indexData);
      });
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
      '.woff2': 'font/woff2',
      '.ttf': 'font/ttf'
    };
    
    res.writeHead(200, { 
      'Content-Type': mimeTypes[ext] || 'application/octet-stream',
      'Cache-Control': ext === '.html' ? 'no-cache' : 'max-age=31536000'
    });
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Bootstrap server running on port ${PORT}`);
  console.log('Starting Mastra backend...');
  
  mastraProcess = spawn('npx', ['mastra', 'start', '--port', String(MASTRA_PORT)], {
    cwd: process.cwd(),
    env: { ...process.env },
    stdio: ['inherit', 'pipe', 'pipe']
  });
  
  mastraProcess.stdout?.on('data', (data) => {
    const output = data.toString();
    console.log('[Mastra]', output);
    if (output.includes('Server started') || output.includes('listening')) {
      mastraReady = true;
      console.log('Mastra backend is ready!');
    }
  });
  
  mastraProcess.stderr?.on('data', (data) => {
    console.error('[Mastra Error]', data.toString());
  });
  
  mastraProcess.on('error', (err) => {
    console.error('Failed to start Mastra:', err);
  });
  
  setTimeout(() => {
    if (!mastraReady) {
      console.log('Assuming Mastra is ready after timeout');
      mastraReady = true;
    }
  }, 30000);
});

process.on('SIGTERM', () => {
  console.log('Shutting down...');
  mastraProcess?.kill();
  server.close();
  process.exit(0);
});
