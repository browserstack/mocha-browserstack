#!/usr/bin/env node

console.log('Running focused gap analysis...\n');

const { execSync } = require('child_process');

try {
  execSync('chmod +x gap-detective.js');
  const output = execSync('node gap-detective.js run-with-enhanced-multi-platform-ppp-logging-no-a11y-v2.log', { 
    cwd: '/Users/yashsaraf/Workspace/mocha-browserstack',
    encoding: 'utf8'
  });
  
  console.log(output);
  
} catch (error) {
  console.log('Gap analysis output:', error.stdout || error.message);
}