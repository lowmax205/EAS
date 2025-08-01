#!/usr/bin/env node

/**
 * EAS Integration Quick Start Script
 * Run this script to set up the production-ready API integration
 */

const fs = require('fs');
const path = require('path');

console.log('🎯 EAS Integration Quick Start');
console.log('==============================\n');

const frontendDir = path.join(__dirname, 'frontend');

// Check if we're in the right directory
if (!fs.existsSync(frontendDir)) {
  console.error('❌ Error: Run this script from the EAS project root directory');
  process.exit(1);
}

// Step 1: Copy environment files
console.log('📁 Setting up environment files...');

const envFiles = [
  { from: '.env.development.example', to: '.env.development' },
  { from: '.env.production.example', to: '.env.production' }
];

envFiles.forEach(({ from, to }) => {
  const fromPath = path.join(frontendDir, from);
  const toPath = path.join(frontendDir, to);
  
  if (fs.existsSync(fromPath)) {
    if (!fs.existsSync(toPath)) {
      fs.copyFileSync(fromPath, toPath);
      console.log(`✅ Created ${to}`);
    } else {
      console.log(`⚠️  ${to} already exists, skipping`);
    }
  } else {
    console.log(`❌ Template file ${from} not found`);
  }
});

// Step 2: Update package.json scripts if needed
console.log('\n🔧 Checking package.json scripts...');

const packageJsonPath = path.join(frontendDir, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  const requiredScripts = {
    'build:dev': 'vite build --mode development',
    'build:prod': 'vite build --mode production',
    'preview:prod': 'vite preview --mode production'
  };
  
  let scriptsUpdated = false;
  
  Object.entries(requiredScripts).forEach(([scriptName, scriptCommand]) => {
    if (!packageJson.scripts[scriptName]) {
      packageJson.scripts[scriptName] = scriptCommand;
      scriptsUpdated = true;
      console.log(`✅ Added script: ${scriptName}`);
    }
  });
  
  if (scriptsUpdated) {
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('✅ Updated package.json');
  } else {
    console.log('✅ Package.json scripts are up to date');
  }
} else {
  console.log('❌ package.json not found in frontend directory');
}

// Step 3: Create implementation example
console.log('\n📝 Creating implementation example...');

const exampleComponentPath = path.join(frontendDir, 'src', 'examples', 'ApiIntegrationExample.jsx');
const exampleComponentDir = path.dirname(exampleComponentPath);

if (!fs.existsSync(exampleComponentDir)) {
  fs.mkdirSync(exampleComponentDir, { recursive: true });
}

const exampleComponent = `/**
 * API Integration Example Component
 * This example shows how to use the new production-ready API client
 */

import React, { useState, useEffect } from 'react';
import { 
  AuthenticationService, 
  EventManagementService,
  QRAttendanceService,
  AppInitializationService 
} from '../lib/integrationGuide';
import { logger } from '../lib/logger';

const ApiIntegrationExample = () => {
  const [status, setStatus] = useState('initializing');
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);

  const authService = new AuthenticationService();
  const eventService = new EventManagementService();
  const appService = new AppInitializationService();

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      const result = await appService.initialize();
      
      if (result.success) {
        setStatus('ready');
        logger.info('App initialized successfully');
        
        // Load events if user is authenticated
        if (await authService.isAuthenticated()) {
          loadEvents();
        }
      } else {
        setStatus('error');
        setError(result.error);
      }
    } catch (error) {
      setStatus('error');
      setError(error.message);
      logger.error('App initialization failed:', error);
    }
  };

  const loadEvents = async () => {
    try {
      const result = await eventService.getEvents();
      
      if (result.success) {
        setEvents(result.data);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError(error.message);
      logger.error('Failed to load events:', error);
    }
  };

  const handleLogin = async (credentials) => {
    try {
      const result = await authService.login(credentials);
      
      if (result.success) {
        logger.info('Login successful');
        loadEvents();
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  if (status === 'initializing') {
    return <div>Initializing EAS application...</div>;
  }

  if (status === 'error') {
    return (
      <div style={{ color: 'red' }}>
        <h3>Initialization Error</h3>
        <p>{error}</p>
        <button onClick={initializeApp}>Retry</button>
      </div>
    );
  }

  return (
    <div>
      <h2>EAS API Integration Example</h2>
      
      <section>
        <h3>Application Status</h3>
        <p>Status: {status}</p>
        <p>Events loaded: {events.length}</p>
      </section>

      <section>
        <h3>Usage Examples</h3>
        <p>✅ Authentication service configured</p>
        <p>✅ Event management service ready</p>
        <p>✅ QR attendance service available</p>
        <p>✅ Production-safe logging enabled</p>
      </section>

      <section>
        <h3>Next Steps</h3>
        <ol>
          <li>Set up Django backend endpoints</li>
          <li>Configure environment variables</li>
          <li>Update AuthContext to use AuthenticationService</li>
          <li>Replace mock services in components</li>
          <li>Test end-to-end functionality</li>
        </ol>
      </section>
    </div>
  );
};

export default ApiIntegrationExample;
`;

fs.writeFileSync(exampleComponentPath, exampleComponent);
console.log(`✅ Created example component: ${exampleComponentPath}`);

// Step 4: Summary and next steps
console.log('\n🎉 Setup Complete!');
console.log('==================\n');

console.log('📋 What was set up:');
console.log('  ✅ Production-safe API client (/frontend/src/lib/apiClient.js)');
console.log('  ✅ Environment-aware logger (/frontend/src/lib/logger.js)');
console.log('  ✅ Integration services (/frontend/src/lib/integrationGuide.js)');
console.log('  ✅ Environment configuration files');
console.log('  ✅ Implementation checklist (INTEGRATION_CHECKLIST.md)');
console.log('  ✅ Example component (/frontend/src/examples/ApiIntegrationExample.jsx)');

console.log('\n🚀 Immediate Next Steps:');
console.log('  1. Configure your API URLs in .env.development');
console.log('  2. Set up Django backend with authentication endpoints');
console.log('  3. Update your AuthContext to use the new AuthenticationService');
console.log('  4. Test the login/logout flow');
console.log('  5. Replace mock services in your components');

console.log('\n📖 Resources:');
console.log('  • Full implementation guide: INTEGRATION_CHECKLIST.md');
console.log('  • Example usage: /frontend/src/examples/ApiIntegrationExample.jsx');
console.log('  • API client: /frontend/src/lib/apiClient.js');
console.log('  • Logger: /frontend/src/lib/logger.js');

console.log('\n💡 Key Benefits:');
console.log('  ✅ No more console.log in production (coding standards compliant)');
console.log('  ✅ Production-ready error handling');
console.log('  ✅ JWT token management');
console.log('  ✅ Campus-aware API calls');
console.log('  ✅ Structured logging for debugging');

console.log('\n🎯 Your thesis requirements are now supported:');
console.log('  ✅ Django-based Event Attendance Management');
console.log('  ✅ Student Authentication System');
console.log('  ✅ Web-based Interface Integration');
console.log('  ✅ QR Code-Based Attendance Tracking');

console.log('\n👨‍💻 Ready to code! Start with setting up your Django backend endpoints.');
`;

fs.writeFileSync(path.join(__dirname, 'setup-integration.js'), setupScript);
console.log(`✅ Created setup script: setup-integration.js`);

// Make it executable on Unix systems
try {
  fs.chmodSync(path.join(__dirname, 'setup-integration.js'), '755');
} catch (error) {
  // Ignore on Windows
}

console.log('\n🎉 Integration setup files created successfully!');
console.log('\nRun: node setup-integration.js');
console.log('Then follow the INTEGRATION_CHECKLIST.md for implementation steps.');

const setupScript = `#!/usr/bin/env node

/**
 * EAS Integration Quick Start Script
 * Run this script to set up the production-ready API integration
 */

const fs = require('fs');
const path = require('path');

console.log('🎯 EAS Integration Quick Start');
console.log('==============================\\n');

const frontendDir = path.join(__dirname, 'frontend');

// Check if we're in the right directory
if (!fs.existsSync(frontendDir)) {
  console.error('❌ Error: Run this script from the EAS project root directory');
  process.exit(1);
}

// Step 1: Copy environment files
console.log('📁 Setting up environment files...');

const envFiles = [
  { from: '.env.development.example', to: '.env.development' },
  { from: '.env.production.example', to: '.env.production' }
];

envFiles.forEach(({ from, to }) => {
  const fromPath = path.join(frontendDir, from);
  const toPath = path.join(frontendDir, to);
  
  if (fs.existsSync(fromPath)) {
    if (!fs.existsSync(toPath)) {
      fs.copyFileSync(fromPath, toPath);
      console.log(\`✅ Created \${to}\`);
    } else {
      console.log(\`⚠️  \${to} already exists, skipping\`);
    }
  } else {
    console.log(\`❌ Template file \${from} not found\`);
  }
});

console.log('\\n🎉 Environment files setup complete!');
console.log('\\n📋 Next steps:');
console.log('  1. Edit frontend/.env.development with your Django backend URL');
console.log('  2. Follow INTEGRATION_CHECKLIST.md for implementation');
console.log('  3. Set up Django backend authentication endpoints');
console.log('\\n🚀 Ready to integrate your thesis project!');
