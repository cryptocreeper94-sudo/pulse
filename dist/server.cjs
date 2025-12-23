const http = require('http');
const fs = require('fs');
const { spawn } = require('child_process');

const PORT = process.env.PORT || 3000;
let html = '<!DOCTYPE html><html><head><title>Pulse</title><meta http-equiv="refresh" content="2"></head><body style="background:#0f0f0f;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0"><h1 style="color:#00D4FF">Loading Pulse...</h1></body></html>';

http.createServer((req, res) => {
  if (req.url === '/healthz' || req.url === '/health' || req.url === '/') {
    res.writeHead(200, {'Content-Type': req.url === '/' ? 'text/html' : 'application/json'});
    res.end(req.url === '/' ? html : '{"status":"ok"}');
    return;
  }
  if (req.url.startsWith('/api/')) {
    const proxy = http.request({hostname:'127.0.0.1',port:4111,path:req.url,method:req.method,headers:req.headers}, r => {
      res.writeHead(r.statusCode, r.headers);
      r.pipe(res);
    });
    proxy.on('error', () => { res.writeHead(503); res.end('{"error":"starting"}'); });
    req.pipe(proxy);
    return;
  }
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(html);
}).listen(PORT, '0.0.0.0', () => {
  console.log('Server ready on port ' + PORT);
  
  try { html = fs.readFileSync('public/index.html', 'utf8'); } catch(e) {}
  
  try {
    if (fs.existsSync('.mastra/output/index.mjs')) {
      spawn('node', ['.mastra/output/index.mjs'], { env: {...process.env, PORT: '4111'}, stdio: 'inherit' });
    }
  } catch(e) {}
});
