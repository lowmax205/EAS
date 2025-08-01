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

console.log('\n🎉 Environment files setup complete!');
console.log('\n📋 Next steps:');
console.log('  1. Edit frontend/.env.development with your Django backend URL');
console.log('  2. Follow INTEGRATION_CHECKLIST.md for implementation');
console.log('  3. Set up Django backend authentication endpoints');
console.log('\n🚀 Ready to integrate your thesis project!');
