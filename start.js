#!/usr/bin/env node

/**
 * Full OpenClaw Railway Deployment - FIXED
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Railway environment
const PORT = process.env.PORT || 18789;
const NODE_ENV = process.env.NODE_ENV || 'production';

// Memory optimization
process.env.NODE_OPTIONS = '--max-old-space-size=512';

console.log('🚄 Starting FULL OpenClaw on Railway.app (FIXED)...');
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
- **Emoji:** 🌳`;

fs.writeFileSync(path.join(workspaceDir, 'IDENTITY.md'), identityContent);

console.log('✅ OpenClaw configuration created');
console.log('🔑 Auth profiles configured');
console.log('📁 Workspace initialized');

// Try multiple ways to start OpenClaw
function startOpenClaw() {
  console.log('🚀 Attempting to start OpenClaw Gateway...');
  
  // Method 1: Try direct node_modules path
  const nodeModulesPath = path.join(process.cwd(), 'node_modules', '.bin', 'openclaw');
  
  if (fs.existsSync(nodeModulesPath)) {
    console.log('📁 Found OpenClaw in node_modules/.bin');
    
    const openclaw = spawn(nodeModulesPath, ['gateway', 'run', '--port', PORT, '--bind', 'lan'], {
      stdio: 'inherit',
      env: { 
        ...process.env,
        HOME: homeDir
      },
      cwd: homeDir
    });

    openclaw.on('error', (err) => {
      console.error('❌ OpenClaw error (method 1):', err.message);
      tryMethod2();
    });

    openclaw.on('exit', (code) => {
      console.log(`🔄 OpenClaw exited with code ${code}`);
      if (code !== 0) {
        tryMethod2();
      }
    });
    
    return;
  }
  
  tryMethod2();
}

function tryMethod2() {
  console.log('🔄 Trying method 2: require openclaw directly...');
  
  try {
    // Try to require and run OpenClaw programmatically
    const openclawPackage = require('openclaw');
    console.log('✅ OpenClaw package loaded');
    
    // This might not work, but worth a try
    startFallbackServer('openclaw loaded but gateway start failed');
    
  } catch (err) {
    console.error('❌ OpenClaw require failed:', err.message);
    tryMethod3();
  }
}

function tryMethod3() {
  console.log('🔄 Trying method 3: global install check...');
  
  // Check if openclaw is globally available
  const { exec } = require('child_process');
  
  exec('which openclaw', (error, stdout, stderr) => {
    if (error) {
      console.error('❌ OpenClaw not found globally');
      console.log('🆘 Starting fallback server - OpenClaw installation issue');
      startFallbackServer('OpenClaw executable not found');
      return;
    }
    
    console.log('✅ Found OpenClaw at:', stdout.trim());
    
    const openclaw = spawn('openclaw', ['gateway', 'run', '--port', PORT, '--bind', 'lan'], {
      stdio: 'inherit',
      env: { 
        ...process.env,
        HOME: homeDir
      },
      cwd: homeDir
    });

    openclaw.on('error', (err) => {
      console.error('❌ OpenClaw error (method 3):', err.message);
      startFallbackServer('OpenClaw startup failed');
    });

    openclaw.on('exit', (code) => {
      console.log(`🔄 OpenClaw exited with code ${code}`);
      if (code !== 0) {
        startFallbackServer(`OpenClaw exited with code ${code}`);
      }
    });
  });
}

// Enhanced fallback server
function startFallbackServer(reason = 'unknown') {
  console.log(`🆘 Starting fallback HTTP server - Reason: ${reason}`);
  const http = require('http');
  
  const server = http.createServer((req, res) => {
    if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        status: 'fallback', 
        service: 'openclaw-railway',
        reason: reason,
        message: 'OpenClaw installation/startup issue'
      }));
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <h1>🌳 Дарахт OpenClaw Railway</h1>
        <p>Status: ⚠️ Fallback Mode</p>
        <p>Issue: ${reason}</p>
        <p>Port: ${PORT}</p>
        <p>Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB</p>
        <hr>
        <h3>🔧 Debug Info:</h3>
        <p>• Config created: ✅</p>
        <p>• Auth configured: ✅</p> 
        <p>• Workspace ready: ✅</p>
        <p>• OpenClaw executable: ❌</p>
        <hr>
        <p>⚠️ OpenClaw package installed but CLI not working</p>
        <p>Reason: ${reason}</p>
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

console.log('🌳 Дарахт запускается на Railway (исправленная версия)!');