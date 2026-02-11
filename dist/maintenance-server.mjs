import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.join(__dirname, 'maintenance.html'), 'utf-8');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html', 'Cache-Control': 'no-cache' });
  res.end(html);
});

server.listen(5000, '0.0.0.0', () => {
  console.log('Maintenance page running on port 5000');
});
