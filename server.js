const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;
const BASE_PATH = '/vocapath';

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.pdf': 'application/pdf'
};

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  
  // Remove base path from URL
  let filePath = req.url;
  if (filePath.startsWith(BASE_PATH)) {
    filePath = filePath.substring(BASE_PATH.length);
  }
  
  // Default to index.html for root and directory requests
  if (filePath === '/' || filePath === '') {
    filePath = '/index.html';
  }
  
  // Remove query strings
  filePath = filePath.split('?')[0];
  
  // Security: prevent directory traversal
  filePath = path.normalize(filePath).replace(/^(\.\.[\/\\])+/, '');
  
  // Build full file path
  const fullPath = path.join(__dirname, filePath);
  
  // Get file extension
  const ext = path.extname(fullPath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  
  // Check if file exists
  fs.access(fullPath, fs.constants.F_OK, (err) => {
    if (err) {
      // File not found - serve index.html for SPA routing
      const indexPath = path.join(__dirname, 'index.html');
      fs.readFile(indexPath, (error, content) => {
        if (error) {
          res.writeHead(500);
          res.end('Error loading index.html');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(content, 'utf-8');
        }
      });
    } else {
      // File exists - serve it
      fs.readFile(fullPath, (error, content) => {
        if (error) {
          if (error.code === 'ENOENT') {
            res.writeHead(404);
            res.end('File not found');
          } else {
            res.writeHead(500);
            res.end(`Server Error: ${error.code}`);
          }
        } else {
          res.writeHead(200, { 
            'Content-Type': contentType,
            'Cache-Control': 'no-cache'
          });
          res.end(content, 'utf-8');
        }
      });
    }
  });
});

server.listen(PORT, () => {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║                    VocaPath Server                     ║');
  console.log('╠════════════════════════════════════════════════════════╣');
  console.log(`║  Server running at: http://localhost:${PORT}${BASE_PATH}       ║`);
  console.log('║  Press Ctrl+C to stop the server                       ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('');
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('\nShutting down server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
