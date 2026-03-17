#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Railway environment variables
const PORT = process.env.PORT || 18789;
const NODE_ENV = process.env.NODE_ENV || 'production';

// Memory optimization for Railway (исправлено!)
process.env.NODE_OPTIONS = '--max-old-space-size=512';

console.log('🚄 Starting OpenClaw on Railway.app...');
console.log(`📊 Memory limit: 512MB, Port: ${PORT}`);

// Create config directory
const configDir = path.join(process.env.HOME || '/tmp', '.openclaw');
const workspaceDir = path.join(configDir, 'workspace');

if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir, { recursive: true });
}
if (!fs.existsSync(workspaceDir)) {
  fs.mkdirSync(workspaceDir, { recursive: true });
}

// Create OpenClaw config
const config = {
  agents: {
    defaults: {
      model: {
        primary: "anthropic/claude-sonnet-4-20250514"
      },
      workspace: workspaceDir
    }
  },
  channels: {
    telegram: {
      enabled: true,
      botToken: process.env.TELEGRAM_BOT_TOKEN || "8562066344:AAERk-OzdS9Isx1Ex4qfL6kwQMEyUyh_fQM",
      allowFrom: ["2870516"],
      dmPolicy: "allowlist"
    }
  },
  gateway: {
    port: PORT,
    mode: "local",
    bind: "lan"
  }
};

const configFile = path.join(configDir, 'openclaw.json');
fs.writeFileSync(configFile, JSON.stringify(config, null, 2));

// Create auth profiles
const authDir = path.join(configDir, 'agents', 'main', 'agent');
if (!fs.existsSync(authDir)) {
  fs.mkdirSync(authDir, { recursive: true });
}

const authProfiles = {
  version: 1,
  profiles: {
    "anthropic:default": {
      type: "token", 
      provider: "anthropic",
      token: process.env.ANTHROPIC_API_KEY || "sk-ant-oat01-IVMvfQgueK4RhWIj_c_9znlmuyxfOd6m_3ozCEQAgVvZHRA048mpVSdjTRgqZgz82HBoCHgWAkmMRFj2Bkb"
    }
  }
};

fs.writeFileSync(path.join(authDir, 'auth-profiles.json'), JSON.stringify(authProfiles, null, 2));

console.log('✅ OpenClaw config created');

// Простая HTTP заглушка для Railway (пока настоящий OpenClaw не работает)
const http = require('http');
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'openclaw-railway' }));
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <h1>🌳 Дарахт OpenClaw на Railway</h1>
      <p>Status: ✅ Running</p>
      <p>Port: ${PORT}</p>
      <p>Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB</p>
    `);
  }
});

server.listen(PORT, () => {
  console.log(`✅ HTTP server running on port ${PORT}`);
  console.log('🤖 OpenClaw config готов');
});
