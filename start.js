#!/usr/bin/env node

/**
 * Full OpenClaw Railway Deployment - ES MODULE VERSION
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Railway environment
const PORT = process.env.PORT || 18789;
const NODE_ENV = process.env.NODE_ENV || 'production';

// Memory optimization
process.env.NODE_OPTIONS = '--max-old-space-size=512';

console.log('🚄 Starting FULL OpenClaw on Railway.app (ES MODULE)...');
console.log(`📊 Memory limit: 512MB, Port: ${PORT}`);
console.log(`🔧 Node.js version: ${process.version}`);

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
- **Emoji:** 🌳`;

fs.writeFileSync(path.join(workspaceDir, 'IDENTITY.md'), identityContent);

console.log('✅ OpenClaw configuration created');
console.log('🔑 Auth profiles configured');
console.log('📁 Workspace initialized');

// Check Node.js version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
const minorVersion = parseInt(nodeVersion.slice(1).split('.')[1]);

console.log(`🔧 Node.js version check: ${nodeVersion}`);

if (majorVersion < 22 || (majorVersion === 22 && minorVersion < 12)) {
  console.log('❌ Node.js version too old for OpenClaw');
  console.log(`Required: v22.12+, Current: ${nodeVersion}`);
  startFallbackServer('Node.js version too old');
  return;
}

// Try to find and start OpenClaw
function startOpenClaw() {
  console.log('🚀 Attempting to start OpenClaw Gateway...');
  
  // Try direct node_modules path
  const nodeModulesPath = path.join(process.cwd(), 'node_modules', '.bin', 'openclaw');
  
  if (fs.existsSync(nodeModulesPath)) {
    console.log('📁 Found OpenClaw in node_modules/.bin');
    
    const openclaw = spawn(nodeModulesPath, ['gateway', 'run', '--port', PORT, '--bind', 'lan', '--verbose'], {
      stdio: 'inherit',
      env: { 
        ...process.env,
        HOME: homeDir
      },
      cwd: homeDir
    });

    openclaw.on('error', (err) => {
      console.error('❌ OpenClaw startup error:', err.message);
      startFallbackServer(`OpenClaw startup error: ${err.message}`);
    });

    openclaw.on('exit', (code) => {
      console.log(`🔄 OpenClaw exited with code ${code}`);
      if (code !== 0) {
        startFallbackServer(`OpenClaw exited with code ${code}`);
      }
    });
    
    return;
  }
  
  // If not found, try global
  console.log('🔄 node_modules/.bin/openclaw not found, trying global...');
  
  const openclaw = spawn('openclaw', ['gateway', 'run', '--port', PORT, '--bind', 'lan', '--verbose'], {
    stdio: 'inherit',
    env: { 
      ...process.env,
      HOME: homeDir
    },
    cwd: homeDir
  });

  openclaw.on('error', (err) => {
    console.error('❌ Global OpenClaw error:', err.message);
    startFallbackServer(`Global OpenClaw error: ${err.message}`);
  });

  openclaw.on('exit', (code) => {
    console.log(`🔄 Global OpenClaw exited with code ${code}`);
    if (code !== 0) {
      startFallbackServer(`Global OpenClaw exited with code ${code}`);
    }
  });
}

// Enhanced fallback server
function startFallbackServer(reason = 'unknown') {
  console.log(`🆘 Starting fallback HTTP server - Reason: ${reason}`);
  
  const server = createServer((req, res) => {
    if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        status: 'fallback', 
        service: 'openclaw-railway',
        reason: reason,
        nodeVersion: process.version,
        message: 'OpenClaw not running - using fallback'
      }));
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <h1>🌳 Дарахт OpenClaw Railway</h1>
        <p>Status: ⚠️ Fallback Mode</p>
        <p>Reason: ${reason}</p>
        <p>Node.js: ${process.version}</p>
        <p>Port: ${PORT}</p>
        <p>Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB</p>
        <hr>
        <h3>🔧 Debug Info:</h3>
        <p>• Config created: ✅</p>
        <p>• Auth configured: ✅</p> 
        <p>• Workspace ready: ✅</p>
        <p>• Node.js version: ${process.version}</p>
        <p>• OpenClaw status: ❌ ${reason}</p>
        <hr>
        <p>⚠️ OpenClaw требует Node.js v22.12+ и может быть слишком тяжёлым для Railway</p>
      `);
    }
  });

  server.listen(PORT, () => {
    console.log(`🆘 Fallback server running on port ${PORT}`);
    console.log(`📝 Reason: ${reason}`);
  });
}

// Start the process
startOpenClaw();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 Shutting down...');
  process.exit(0);
});

console.log('🌳 Дарахт запускается на Railway (ES Module версия)!');