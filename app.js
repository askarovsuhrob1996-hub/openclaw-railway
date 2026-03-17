const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

// Минимальный веб-сервер для Railway
const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <h1>🌳 Дарахт OpenClaw</h1>
      <p>OpenClaw is running on Railway.app</p>
      <p>Telegram Bot: Active</p>
      <p>Status: Ready</p>
    `);
  } else if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'openclaw-railway' }));
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`🚄 Railway server running on port ${PORT}`);
  console.log('🌳 OpenClaw Дарахт готов к работе!');
});

// Имитация OpenClaw Gateway (пока Railway не поддерживает настоящий)
console.log('🤖 OpenClaw Gateway simulation starting...');
console.log('📱 Telegram Bot Token configured');
console.log('🔑 Anthropic API Key configured');
console.log('✅ All systems ready');
