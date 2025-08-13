#!/usr/bin/env node

const fs = require('fs');

function parseLogFile(logPath) {
  const content = fs.readFileSync(logPath, 'utf8');
  const lines = content.split('\n');
  
  const events = [];
  const sessionMarkers = {};
  
  lines.forEach(line => {
    // Parse performance events
    if (line.includes('PERFORMANCE EVENT STARTED:') || line.includes('PERFORMANCE EVENT ENDED:')) {
      const match = line.match(/PERFORMANCE EVENT (STARTED|ENDED): ([^A]+) AT ([0-9T:-]+Z)/);
      if (match) {
        events.push({
          type: match[1],
          event: match[2].trim(),
          timestamp: new Date(match[3]),
          line: line
        });
      }
    }
    
    // Parse session markers
    if (line.includes('SDK SESSION STARTED AT')) {
      const match = line.match(/SDK SESSION STARTED AT ([0-9T:-]+Z)/);
      if (match) sessionMarkers.sessionStart = new Date(match[1]);
    }
    
    if (line.includes('SDK SESSION ENDED AT')) {
      const match = line.match(/SDK SESSION ENDED AT ([0-9T:-]+Z)/);
      if (match) sessionMarkers.sessionEnd = new Date(match[1]);
    }
    
    if (line.includes('SDK TEST EXECUTION COMPLETED AT')) {
      const match = line.match(/SDK TEST EXECUTION COMPLETED AT ([0-9T:-]+Z)/);
      if (match) sessionMarkers.testCompleted = new Date(match[1]);
    }
  });
  
  return { events, sessionMarkers };
}

function calculateDurations(events) {
  const durations = new Map();
  const stack = [];
  
  events.forEach(event => {
    if (event.type === 'STARTED') {
      stack.push(event);
    } else if (event.type === 'ENDED') {
      // Find matching start event
      for (let i = stack.length - 1; i >= 0; i--) {
        if (stack[i].event === event.event) {
          const startEvent = stack.splice(i, 1)[0];
          const duration = event.timestamp - startEvent.timestamp;
          
          if (!durations.has(event.event)) {
            durations.set(event.event, []);
          }
          durations.get(event.event).push({
            duration,
            start: startEvent.timestamp,
            end: event.timestamp
          });
          break;
        }
      }
    }
  });
  
  return durations;
}

function analyzePerformance(logPath) {
  console.log('🔍 BROWSERSTACK SDK PERFORMANCE ANALYSIS');
  console.log('=========================================\n');
  
  const { events, sessionMarkers } = parseLogFile(logPath);
  const durations = calculateDurations(events);
  
  // Session overview
  const totalSessionTime = sessionMarkers.sessionEnd - sessionMarkers.sessionStart;
  console.log(`📊 SESSION OVERVIEW:`);
  console.log(`   Total Session Time: ${totalSessionTime}ms (${(totalSessionTime/1000).toFixed(2)}s)`);
  
  if (sessionMarkers.testCompleted) {
    const testTime = sessionMarkers.testCompleted - sessionMarkers.sessionStart;
    console.log(`   Test Execution Time: ${testTime}ms (${(testTime/1000).toFixed(2)}s)`);
    console.log(`   Post-test Cleanup: ${sessionMarkers.sessionEnd - sessionMarkers.testCompleted}ms\n`);
  }
  
  // Top 10 longest events
  const eventStats = [];
  durations.forEach((instances, eventName) => {
    const totalDuration = instances.reduce((sum, inst) => sum + inst.duration, 0);
    const avgDuration = totalDuration / instances.length;
    const maxDuration = Math.max(...instances.map(inst => inst.duration));
    
    eventStats.push({
      event: eventName,
      totalDuration,
      avgDuration,
      maxDuration,
      count: instances.length,
      instances
    });
  });
  
  eventStats.sort((a, b) => b.totalDuration - a.totalDuration);
  
  console.log(`🚀 TOP 10 PERFORMANCE BOTTLENECKS (by total time):`);
  eventStats.slice(0, 10).forEach((stat, i) => {
    console.log(`${i + 1}.  ${stat.event}`);
    console.log(`     Total: ${stat.totalDuration}ms | Avg: ${stat.avgDuration.toFixed(1)}ms | Max: ${stat.maxDuration}ms | Count: ${stat.count}`);
  });
  
  console.log(`\n⚡ QUICK PERFORMANCE INSIGHTS:`);
  
  // Find key phases
  const setupPhase = durations.get('SDK:SETUP');
  const mochaInit = durations.get('SDK:MOCHA:INIT');
  const testExecution = durations.get('SDK:MOCHA:TEST-EXECUTION');
  const cleanup = durations.get('SDK:CLEANUP');
  const mutex = durations.get('SDK:MUTEX:START');
  const runTestStart = durations.get('SDK:RUNTESTSTART');
  const actualTestStart = durations.get('SDK:ACTUALTESTSTART');
  
  if (setupPhase && setupPhase.length > 0) {
    console.log(`   SDK Setup Time: ${setupPhase[0].duration}ms`);
  }
  
  if (mochaInit && mochaInit.length > 0) {
    console.log(`   Mocha Initialization: ${mochaInit[0].duration}ms`);
  }
  
  if (testExecution && testExecution.length > 0) {
    console.log(`   Total Test Execution: ${testExecution[0].duration}ms`);
  }
  
  if (runTestStart && runTestStart.length > 0) {
    console.log(`   Test Runner Duration: ${runTestStart[0].duration}ms`);
  }
  
  if (actualTestStart && actualTestStart.length > 0) {
    console.log(`   Actual Test Logic: ${actualTestStart[0].duration}ms`);
  }
  
  if (mutex && mutex.length > 0) {
    console.log(`   Mutex/Locking Time: ${mutex[0].duration}ms`);
  }
  
  // Calculate framework overhead
  if (runTestStart && actualTestStart && runTestStart.length > 0 && actualTestStart.length > 0) {
    const frameworkOverhead = runTestStart[0].duration - actualTestStart[0].duration;
    console.log(`   Framework Overhead: ${frameworkOverhead}ms`);
  }
  
  // Analyze network requests
  const requestEvents = eventStats.filter(stat => stat.event.startsWith('REQUEST:'));
  if (requestEvents.length > 0) {
    const totalNetworkTime = requestEvents.reduce((sum, stat) => sum + stat.totalDuration, 0);
    const networkCount = requestEvents.reduce((sum, stat) => sum + stat.count, 0);
    console.log(`   Total Network Time: ${totalNetworkTime}ms (${networkCount} requests)`);
    console.log(`   Avg Request Time: ${(totalNetworkTime/networkCount).toFixed(1)}ms`);
  }
  
  // Analyze driver operations
  const driverEvents = eventStats.filter(stat => stat.event.startsWith('SDK:DRIVER:'));
  if (driverEvents.length > 0) {
    const totalDriverTime = driverEvents.reduce((sum, stat) => sum + stat.totalDuration, 0);
    const driverCount = driverEvents.reduce((sum, stat) => sum + stat.count, 0);
    console.log(`   Total WebDriver Time: ${totalDriverTime}ms (${driverCount} operations)`);
  }
  
  console.log(`\n🎯 OPTIMIZATION RECOMMENDATIONS:`);
  
  // Network optimization suggestions
  const slowRequests = requestEvents.filter(stat => stat.avgDuration > 500);
  if (slowRequests.length > 0) {
    console.log(`   🌐 Network Optimizations:`);
    slowRequests.forEach(req => {
      console.log(`      • ${req.event}: ${req.avgDuration.toFixed(0)}ms avg (consider caching/batching)`);
    });
  }
  
  // Hub management analysis
  const hubEvents = eventStats.filter(stat => stat.event.includes('HUB'));
  if (hubEvents.length > 0) {
    console.log(`   🌍 Hub Management:`);
    hubEvents.forEach(hub => {
      console.log(`      • ${hub.event}: ${hub.totalDuration}ms (${hub.count}x)`);
    });
  }
  
  // Driver overhead analysis
  if (driverEvents.length > 0) {
    const preExecute = driverEvents.find(e => e.event === 'SDK:DRIVER:PRE-EXECUTE');
    const postExecute = driverEvents.find(e => e.event === 'SDK:DRIVER:POST-EXECUTE');
    
    if (preExecute && postExecute) {
      console.log(`   🚗 WebDriver Optimizations:`);
      console.log(`      • PRE-EXECUTE overhead: ${preExecute.avgDuration.toFixed(1)}ms × ${preExecute.count}`);
      console.log(`      • POST-EXECUTE overhead: ${postExecute.avgDuration.toFixed(1)}ms × ${postExecute.count}`);
      
      if (preExecute.avgDuration > 5 || postExecute.avgDuration > 5) {
        console.log(`      • Consider reducing WebDriver hook overhead`);
      }
    }
  }
  
  // Configuration analysis
  const configEvents = eventStats.filter(stat => stat.event.startsWith('SDK:CONFIG:'));
  if (configEvents.length > 0) {
    const totalConfigTime = configEvents.reduce((sum, stat) => sum + stat.totalDuration, 0);
    if (totalConfigTime > 100) {
      console.log(`   ⚙️  Configuration Processing: ${totalConfigTime}ms (consider optimization)`);
    }
  }
  
  console.log(`\n📈 PERFORMANCE SCORE:`);
  const efficiency = ((actualTestStart?.[0]?.duration || 0) / totalSessionTime * 100);
  console.log(`   Test Efficiency: ${efficiency.toFixed(1)}% (actual test time vs total session)`);
  
  if (efficiency < 50) {
    console.log(`   ⚠️  Low efficiency - significant framework overhead detected`);
  } else if (efficiency > 80) {
    console.log(`   ✅ High efficiency - minimal framework overhead`);
  } else {
    console.log(`   🔄 Moderate efficiency - room for optimization`);
  }
}

// Run analysis
const logFile = process.argv[2] || 'run-with-enhanced-multi-platform-ppp-logging-no-a11y-v2.log';
analyzePerformance(logFile);