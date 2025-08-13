#!/usr/bin/env node

console.log('Running worker instrumentation analysis...\n');

const { execSync } = require('child_process');

try {
  execSync('chmod +x worker-analysis.js');
  const output = execSync('node worker-analysis.js timeline-gaps-worker-instrumentation.json', { 
    cwd: '/Users/yashsaraf/Workspace/mocha-browserstack',
    encoding: 'utf8'
  });
  
  console.log(output);
  
} catch (error) {
  console.log('Analysis output:', error.stdout || error.message);
}