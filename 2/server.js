const http = require('http');
const fs = require('fs');
const path = require('path');
const { resolveUrl } = require('./js/resolve-url.js');

const ROOT = __dirname;
const PORT = process.env.PORT || 8000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2'
};

function sendFile(res, filePath, status) {
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(status, {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Cache-Control': 'no-cache'
  });
  fs.createReadStream(filePath).pipe(res);
}

http.createServer((req, res) => {
  const mapped = resolveUrl(req.url);
  if (mapped.status === 403) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  let filePath = path.join(ROOT, mapped.relative);
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      const notFound = path.join(ROOT, '404.html');
      return fs.stat(notFound, (err2, st2) => {
        if (err2 || !st2.isFile()) {
          res.writeHead(404);
          return res.end('404 Not Found');
        }
        sendFile(res, notFound, 404);
      });
    }
    sendFile(res, filePath, 200);
  });
}).listen(PORT, () => {
  console.log('Server attivo su http://localhost:' + PORT);
});
