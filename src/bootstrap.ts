import http from 'http';

const PORT = 5000;
const MASTRA_PORT = 4111;

// Minimal HTML embedded directly - NO filesystem reads at startup
const HTML = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Pulse</title><meta http-equiv="refresh" content="3"><style>body{background:#0f0f0f;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:system-ui}div{text-align:center}h1{color:#00D4FF;margin-bottom:10px}.loader{width:40px;height:40px;border:3px solid #333;border-top:3px solid #00D4FF;border-radius:50%;animation:spin 1s linear infinite;margin:20px auto}@keyframes spin{to{transform:rotate(360deg)}}</style></head><body><div><h1>PULSE</h1><div class="loader"></div><p>Loading AI Trading Platform...</p></div></body></html>`;

let mastraReady = false;
let realHtml = HTML;

// Create server immediately - responds to ALL requests instantly
const server = http.createServer((req, res) => {
  const url = req.url || '/';
  
  // Root and health - instant response
  if (url === '/' || url === '/healthz' || url === '/health' || url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(realHtml);
    return;
  }
  
  // API proxy
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
      res.writeHead(502);
      res.end('{"error":"Backend unavailable"}');
    });
    
    req.pipe(proxyReq);
    return;
  }
  
  // Static files - async load, fallback to HTML
  import('fs').then(fs => {
    import('path').then(path => {
      const filePath = path.join(process.cwd(), 'public', url);
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(realHtml);
          return;
        }
        const ext = path.extname(filePath).toLowerCase();
        const types: Record<string, string> = {
          '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json',
          '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
          '.woff': 'font/woff', '.woff2': 'font/woff2'
        };
        res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
        res.end(data);
      });
    });
  });
});

// Start listening IMMEDIATELY
server.listen(PORT, '0.0.0.0', () => {
  console.log('Server ready on port ' + PORT);
  
  // Load real HTML and start Mastra AFTER server is listening
  setTimeout(() => {
    import('fs').then(fs => {
      import('path').then(path => {
        try {
          realHtml = fs.readFileSync(path.join(process.cwd(), 'public', 'index.html'), 'utf8');
          console.log('Loaded real HTML');
        } catch (e) {
          console.log('Using embedded HTML');
        }
      });
    });
    
    import('worker_threads').then(({ Worker }) => {
      import('path').then(path => {
        import('fs').then(fs => {
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
            worker.on('error', () => { mastraReady = true; });
            worker.on('exit', () => { mastraReady = true; });
          } else {
            import('../.mastra/output/index.mjs')
              .then(() => { mastraReady = true; console.log('Mastra ready'); })
              .catch(() => { mastraReady = true; });
          }
        });
      });
    });
  }, 50);
});
