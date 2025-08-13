#!/usr/bin/env node

console.log('Building SDK with enhanced-multi-platform-ppp performance logging...');

const { execSync } = require('child_process');
const path = require('path');

try {
// Build the SDK
  // console.log('Running npm run build...');
  // execSync('npm run build', { 
  //   cwd: '/Users/yashsaraf/Workspace/browserstack-node-agent',
  //   stdio: 'pipe'
  // });
  
  // console.log('✅ SDK build completed successfully!');
  
  // Run the sample test
  console.log('\nRunning sample test with detailed worker instrumentation...');
  execSync('npm run sample-test > run-with-worker-instrumentation.log 2>&1', {
    cwd: '/Users/yashsaraf/Workspace/mocha-browserstack'
  });
  
  console.log('✅ Sample test completed! Check run-with-worker-instrumentation.log');
  
  // Run gap analysis
  console.log('\nRunning gap analysis on worker instrumentation logs...');
  execSync('node gap-analyzer.js run-with-worker-instrumentation.log timeline-gaps-worker-instrumentation.json', {
    cwd: '/Users/yashsaraf/Workspace/mocha-browserstack',
    stdio: 'inherit'
  });
  
  console.log('✅ Gap analysis completed! Check timeline-gaps-worker-instrumentation.json');
  console.log('\n🎉 All steps completed successfully!');
  console.log('📊 Open timeline-visualizer.html and load timeline-gaps-worker-instrumentation.json to see the improved worker instrumentation');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}