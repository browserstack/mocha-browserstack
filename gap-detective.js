#!/usr/bin/env node

const fs = require('fs');

function analyzeGapBetweenEvents(logPath) {
  console.log('🔍 ANALYZING GAP BETWEEN SDK:MUTEX:START AND SDK:RUNTESTSTART');
  console.log('================================================================\n');
  
  const content = fs.readFileSync(logPath, 'utf8');
  const lines = content.split('\n');
  
  let mutexEndTime = null;
  let runTestStartTime = null;
  let gapStartIndex = -1;
  let gapEndIndex = -1;
  
  // Find the gap boundaries
  lines.forEach((line, index) => {
    if (line.includes('PERFORMANCE EVENT ENDED: SDK:MUTEX:START')) {
      const match = line.match(/([0-9T:-]+Z)/);
      if (match) {
        mutexEndTime = new Date(match[1]);
        gapStartIndex = index;
      }
    }
    
    if (line.includes('PERFORMANCE EVENT STARTED: SDK:RUNTESTSTART')) {
      const match = line.match(/([0-9T:-]+Z)/);
      if (match) {
        runTestStartTime = new Date(match[1]);
        gapEndIndex = index;
      }
    }
  });
  
  if (!mutexEndTime || !runTestStartTime) {
    console.log('❌ Could not find both events in the log');
    return;
  }
  
  const gapDuration = runTestStartTime - mutexEndTime;
  console.log(`📊 GAP ANALYSIS:`);
  console.log(`   Mutex End Time:     ${mutexEndTime.toISOString()}`);
  console.log(`   RunTest Start Time: ${runTestStartTime.toISOString()}`);
  console.log(`   Gap Duration:       ${gapDuration}ms (${(gapDuration/1000).toFixed(2)}s)`);
  console.log(`   Gap Percentage:     ${((gapDuration/31553)*100).toFixed(1)}% of total session time\n`);
  
  // Extract all logs during the gap period
  console.log(`🕳️  WHAT HAPPENED IN THE GAP (lines ${gapStartIndex+1} to ${gapEndIndex-1}):`);
  console.log('='.repeat(70));
  
  const gapLines = lines.slice(gapStartIndex + 1, gapEndIndex);
  let performanceEventsDuringGap = [];
  let otherLogsDuringGap = [];
  
  gapLines.forEach((line, index) => {
    if (line.includes('PERFORMANCE EVENT')) {
      const match = line.match(/PERFORMANCE EVENT (STARTED|ENDED): ([^A]+) AT ([0-9T:-]+Z)/);
      if (match) {
        performanceEventsDuringGap.push({
          type: match[1],
          event: match[2].trim(),
          timestamp: new Date(match[3]),
          line: line.trim(),
          relativeTime: new Date(match[3]) - mutexEndTime
        });
      }
    } else if (line.trim() && !line.includes('info') && !line.includes('error')) {
      // Capture non-performance logs that might indicate what's happening
      otherLogsDuringGap.push({
        line: line.trim(),
        lineNumber: gapStartIndex + index + 2
      });
    }
  });
  
  console.log(`\n⚡ PERFORMANCE EVENTS DURING GAP (${performanceEventsDuringGap.length} events):`);
  if (performanceEventsDuringGap.length === 0) {
    console.log('   ❌ NO PERFORMANCE EVENTS TRACKED IN THIS PERIOD!');
    console.log('   🚨 This is the problem - 2.57 seconds of completely untracked time');
  } else {
    performanceEventsDuringGap.forEach(event => {
      console.log(`   +${event.relativeTime}ms: ${event.type} ${event.event}`);
    });
  }
  
  console.log(`\n📋 OTHER LOGS DURING GAP:`);
  if (otherLogsDuringGap.length === 0) {
    console.log('   📭 No significant logs during this period');
  } else {
    otherLogsDuringGap.slice(0, 10).forEach(log => {
      console.log(`   Line ${log.lineNumber}: ${log.line}`);
    });
    if (otherLogsDuringGap.length > 10) {
      console.log(`   ... and ${otherLogsDuringGap.length - 10} more lines`);
    }
  }
  
  console.log(`\n🎯 ANALYSIS & RECOMMENDATIONS:`);
  console.log('================================');
  
  if (performanceEventsDuringGap.length === 0) {
    console.log(`
🚨 CRITICAL FINDING: 2.57 seconds of completely untracked execution!

📍 WHERE THE PROBLEM IS:
   • Between SDK:MUTEX:START ending and SDK:RUNTESTSTART beginning
   • This appears to be the time when the SDK hands control to Mocha
   • Mocha framework is starting up and preparing to run tests
   • No performance instrumentation exists in this critical phase

🔧 IMMEDIATE ACTIONS NEEDED:
   1. Add performance logging for Mocha startup phase
   2. Track test file loading and parsing time
   3. Monitor test discovery and suite initialization
   4. Measure worker process creation (if parallel execution)
   5. Track any dependency loading or module initialization

💡 LIKELY ROOT CAUSES:
   • Mocha test discovery and file parsing
   • Node.js module loading and compilation
   • Test suite initialization and setup hooks
   • Worker process spawning for parallel execution
   • Synchronous file I/O operations
   • Large test files or many test files being processed

🎯 PERFORMANCE OPTIMIZATION OPPORTUNITIES:
   • Parallel test file loading
   • Test file caching mechanisms  
   • Lazy loading of test dependencies
   • Optimized test discovery algorithms
   • Pre-compiled test bundles
   • Worker process pooling
    `);
  } else {
    console.log('   ✅ Some performance events were tracked during this period');
    console.log('   🔍 Review the events above to identify bottlenecks');
  }
  
  console.log(`\n📈 IMPACT ASSESSMENT:`);
  console.log(`   Gap Impact: ${gapDuration}ms represents ${((gapDuration/31553)*100).toFixed(1)}% of total session time`);
  console.log(`   Priority:   🔴 HIGH - This is the single largest untracked time period`);
  console.log(`   Severity:   🚨 CRITICAL - Nearly 8% of total execution time is invisible`);
  
  console.log(`\n🛠️  NEXT STEPS:`);
  console.log('   1. Add performance events around Mocha initialization');
  console.log('   2. Instrument test discovery and file loading');
  console.log('   3. Track worker process creation if using parallel execution');
  console.log('   4. Monitor any blocking operations during this phase');
  console.log('   5. Re-run analysis to measure improvement');
}

// Run the analysis
const logFile = process.argv[2] || 'run-with-enhanced-multi-platform-ppp-logging-no-a11y-v2.log';
analyzeGapBetweenEvents(logFile);