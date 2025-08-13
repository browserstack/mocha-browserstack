#!/usr/bin/env node

console.log('Running performance analysis...\n');

const { execSync } = require('child_process');

try {
  execSync('chmod +x performance-analyzer.js');
  const output = execSync('node performance-analyzer.js run-with-enhanced-multi-platform-ppp-logging-no-a11y-v2.log', { 
    cwd: '/Users/yashsaraf/Workspace/mocha-browserstack',
    encoding: 'utf8'
  });
  
  console.log(output);
  
} catch (error) {
  console.log('Analysis output:', error.stdout || error.message);
}