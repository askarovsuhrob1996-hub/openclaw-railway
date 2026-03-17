#!/usr/bin/env node

/**
 * Full OpenClaw Railway Deployment
 * Запускает настоящий OpenClaw Gateway на Railway.app
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Railway environment
const PORT = process.env.PORT || 18789;
const NODE_ENV = process.env.NODE_ENV || 'production';

// Memory optimization
process.env.NODE_OPTIONS = '--max-old-space-size=512';

console.log('🚄 Starting FULL OpenClaw on Railway.app...');
console.log(`📊 Memory limit: 512MB, Port: ${PORT}`);

// Create OpenClaw directories
const homeDir = process.env.HOME || '/tmp';
const configDir = path.join(homeDir, '.openclaw');
const workspaceDir = path.join(configDir, 'workspace');
const agentDir = path.join(configDir, 'agents', 'main', 'agent');

[configDir, workspaceDir, agentDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// OpenClaw configuration
const config = {
  agents: {
    defaults: {
      model: {
        primary: "anthropic/claude-sonnet-4-20250514"
      },
      models: {
        "anthropic/claude-sonnet-4-20250514": {}
      },
      workspace: workspaceDir
    }
  },
  channels: {
    telegram: {
      enabled: true,
      botToken: process.env.TELEGRAM_BOT_TOKEN,
      allowFrom: ["2870516"],
      dmPolicy: "allowlist",
      streaming: "partial"
    }
  },
  gateway: {
    port: PORT,
    mode: "local",
    bind: "lan"
  },
  auth: {
    profiles: {
      "anthropic:default": {
        provider: "anthropic",
        mode: "token"
      }
    }
  }
};

// Write config
fs.writeFileSync(path.join(configDir, 'openclaw.json'), JSON.stringify(config, null, 2));

// Auth profiles
const authProfiles = {
  version: 1,
  profiles: {
    "anthropic:default": {
      type: "token", 
      provider: "anthropic",
      token: process.env.ANTHROPIC_API_KEY
    }
  }
};

fs.writeFileSync(path.join(agentDir, 'auth-profiles.json'), JSON.stringify(authProfiles, null, 2));

// Create basic workspace files
const identityContent = `# IDENTITY.md

- **Name:** Дарахт (Daraxt)
- **Creature:** AI-помощник на Railway.app
- **Vibe:** Дружеский, полезный
- **Emoji:** 🌳

Дарахт — дерево в облаке.`;

const userContent = `# USER.md

- **Name:** Сухроб (Suhrob)
- **Timezone:** Asia/Tashkent (UTC+5)
- **Notes:** Основной пользователь системы`;

fs.writeFileSync(path.join(workspaceDir, 'IDENTITY.md'), identityContent);
fs.writeFileSync(path.join(workspaceDir, 'USER.md'), userContent);

console.log('✅ OpenClaw configuration created');
console.log('🔑 Auth profiles configured');
console.log('📁 Workspace initialized');

// Launch real OpenClaw Gateway
console.log('🚀 Starting OpenClaw Gateway...');

const openclaw = spawn('npx', ['openclaw', 'gateway', 'run', '--port', PORT, '--bind', 'lan', '--verbose'], {
  stdio: 'inherit',
  env: { 
    ...process.env,
    HOME: homeDir
  },
  cwd: homeDir
});

openclaw.on('error', (err) => {
  console.error('❌ OpenClaw startup error:', err);
  // Fallback HTTP server if OpenClaw fails
  startFallbackServer();
});

openclaw.on('exit', (code) => {
  console.log(`🔄 OpenClaw exited with code ${code}`);
  if (code !== 0) {
    console.log('🔄 Restarting in 10 seconds...');
    setTimeout(() => {
      process.exit(code); // Railway will restart
    }, 10000);
  }
});

// Fallback HTTP server
function startFallbackServer() {
  console.log('🆘 Starting fallback HTTP server...');
  const http = require('http');
  
  const server = http.createServer((req, res) => {
    if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        status: 'fallback', 
        service: 'openclaw-railway',
        note: 'OpenClaw failed, running HTTP fallback'
      }));
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <h1>🌳 Дарахт OpenClaw</h1>
        <p>Status: ⚠️ Fallback Mode</p>
        <p>OpenClaw Gateway failed to start</p>
        <p>Port: ${PORT}</p>
        <p>Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB</p>
        <hr>
        <p>Check Railway logs for OpenClaw errors</p>
      `);
    }
  });

  server.listen(PORT, () => {
    console.log(`🆘 Fallback server running on port ${PORT}`);
  });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 Shutting down OpenClaw...');
  if (openclaw) {
    openclaw.kill('SIGTERM');
  }
  process.exit(0);
});

console.log('🌳 Дарахт полностью готов на Railway!');