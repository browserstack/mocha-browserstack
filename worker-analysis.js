#!/usr/bin/env node

const fs = require('fs');

function analyzeWorkerInstrumentation(jsonPath) {
  console.log('🔍 WORKER INSTRUMENTATION ANALYSIS');
  console.log('=====================================\n');
  
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const { events, metadata } = data;
  
  // Session overview
  console.log(`📊 SESSION OVERVIEW:`);
  console.log(`   Total Session Time: ${metadata.totalSessionTime}ms (${(metadata.totalSessionTime/1000).toFixed(2)}s)`);
  console.log(`   Coverage: ${metadata.coveragePercentage.toFixed(1)}% (overlapping events)`);
  console.log(`   Gap Time: ${metadata.totalGapTime}ms\n`);
  
  // Find key events for analysis
  const keyEvents = {
    setup: events.find(e => e.name === 'SDK:SETUP'),
    mochaInit: events.find(e => e.name === 'SDK:MOCHA:INIT'),
    testExecution: events.find(e => e.name === 'SDK:MOCHA:TEST-EXECUTION'),
    workerPoolCreation: events.find(e => e.name === 'SDK:WORKER-POOL:CREATION'),
    workerExecution: events.find(e => e.name === 'SDK:WORKER:EXECUTION'),
    workerTestStart: events.find(e => e.name === 'SDK:WORKER:TEST-START'),
    runTestStart: events.find(e => e.name === 'SDK:RUNTESTSTART'),
    actualTestStart: events.find(e => e.name === 'SDK:ACTUALTESTSTART'),
    cleanup: events.find(e => e.name === 'SDK:CLEANUP')
  };
  
  console.log(`🚀 KEY PHASE BREAKDOWN:`);
  if (keyEvents.setup) console.log(`   SDK Setup: ${keyEvents.setup.duration}ms`);
  if (keyEvents.mochaInit) console.log(`   Mocha Init: ${keyEvents.mochaInit.duration}ms`);
  if (keyEvents.testExecution) console.log(`   Test Execution: ${keyEvents.testExecution.duration}ms`);
  if (keyEvents.actualTestStart) console.log(`   Actual Test Logic: ${keyEvents.actualTestStart.duration}ms`);
  if (keyEvents.cleanup) console.log(`   Cleanup: ${keyEvents.cleanup.duration}ms\n`);
  
  // Analyze the mysterious gap that was identified
  if (keyEvents.workerExecution && keyEvents.workerTestStart) {
    const workerHandoffGap = new Date(keyEvents.workerTestStart.start) - new Date(keyEvents.workerExecution.start);
    console.log(`🕳️  CRITICAL GAP ANALYSIS:`);
    console.log(`   Worker Execution Start: ${keyEvents.workerExecution.start}`);
    console.log(`   Worker Test Start: ${keyEvents.workerTestStart.start}`);
    console.log(`   Gap Duration: ${workerHandoffGap}ms`);
    console.log(`   This represents the worker startup overhead!\n`);
  }
  
  // Worker efficiency analysis
  if (keyEvents.workerPoolCreation) {
    console.log(`⚡ WORKER ANALYSIS:`);
    console.log(`   Worker Pool Creation: ${keyEvents.workerPoolCreation.duration}ms (very fast!)`);
    
    if (keyEvents.workerExecution && keyEvents.actualTestStart) {
      const workerOverhead = keyEvents.workerExecution.duration - keyEvents.actualTestStart.duration;
      const efficiency = (keyEvents.actualTestStart.duration / keyEvents.workerExecution.duration * 100);
      console.log(`   Worker Execution Total: ${keyEvents.workerExecution.duration}ms`);
      console.log(`   Actual Test Logic: ${keyEvents.actualTestStart.duration}ms`);
      console.log(`   Worker Overhead: ${workerOverhead}ms`);
      console.log(`   Worker Efficiency: ${efficiency.toFixed(1)}%\n`);
    }
  }
  
  // Network analysis
  const networkEvents = events.filter(e => e.name.startsWith('REQUEST:'));
  const totalNetworkTime = networkEvents.reduce((sum, e) => sum + e.duration, 0);
  console.log(`🌐 NETWORK ANALYSIS:`);
  console.log(`   Total Network Time: ${totalNetworkTime}ms`);
  console.log(`   Network Requests: ${networkEvents.length}`);
  console.log(`   Average Request Time: ${(totalNetworkTime/networkEvents.length).toFixed(1)}ms\n`);
  
  // Top bottlenecks
  const sortedEvents = events.filter(e => e.duration > 50).sort((a, b) => b.duration - a.duration);
  console.log(`🐌 TOP PERFORMANCE BOTTLENECKS (>50ms):`);
  sortedEvents.slice(0, 10).forEach((event, i) => {
    console.log(`   ${i + 1}. ${event.name}: ${event.duration}ms`);
  });
  
  console.log(`\n🎯 OPTIMIZATION RECOMMENDATIONS:`);
  
  // Hub management optimization
  const hubEvents = events.filter(e => e.name.includes('HUB'));
  if (hubEvents.length > 0) {
    const totalHubTime = hubEvents.reduce((sum, e) => sum + e.duration, 0);
    console.log(`\n   🌍 Hub Management Optimization:`);
    console.log(`      Total Hub Time: ${totalHubTime}ms`);
    hubEvents.forEach(hub => {
      console.log(`      • ${hub.name}: ${hub.duration}ms`);
    });
    if (totalHubTime > 500) {
      console.log(`      💡 RECOMMENDATION: Implement hub caching and parallel checks`);
    }
  }
  
  // TestHub optimization
  const testHubEvents = events.filter(e => e.name.includes('TESTHUB'));
  if (testHubEvents.length > 0) {
    console.log(`\n   🧪 TestHub Optimization:`);
    testHubEvents.forEach(hub => {
      console.log(`      • ${hub.name}: ${hub.duration}ms`);
    });
    const startEvent = testHubEvents.find(e => e.name === 'SDK:TESTHUB:START');
    if (startEvent && startEvent.duration > 500) {
      console.log(`      💡 RECOMMENDATION: Make TestHub initialization async/non-blocking`);
    }
  }
  
  // Auto-capture analysis
  const autoCaptureEvent = events.find(e => e.name === 'SDK:AUTO-CAPTURE');
  if (autoCaptureEvent && autoCaptureEvent.duration > 1000) {
    console.log(`\n   📸 Auto-Capture Optimization:`);
    console.log(`      • Auto-capture time: ${autoCaptureEvent.duration}ms`);
    console.log(`      💡 RECOMMENDATION: Run auto-capture async during cleanup`);
  }
  
  // Worker efficiency recommendations
  if (keyEvents.actualTestStart && keyEvents.workerExecution) {
    const efficiency = (keyEvents.actualTestStart.duration / keyEvents.workerExecution.duration * 100);
    console.log(`\n   🚗 Worker Efficiency:`);
    console.log(`      Current efficiency: ${efficiency.toFixed(1)}%`);
    if (efficiency < 5) {
      console.log(`      💡 CRITICAL: Only ${efficiency.toFixed(1)}% of worker time is actual test execution!`);
      console.log(`      💡 RECOMMENDATION: Investigate worker startup and test framework overhead`);
    }
  }
  
  // Network batching recommendations
  const observabilityRequests = networkEvents.filter(e => e.name.includes('COLLECTOR-OBSERVABILITY'));
  if (observabilityRequests.length > 3) {
    console.log(`\n   📊 Observability Optimization:`);
    console.log(`      • ${observabilityRequests.length} observability requests`);
    const totalObsTime = observabilityRequests.reduce((sum, e) => sum + e.duration, 0);
    console.log(`      • Total time: ${totalObsTime}ms`);
    console.log(`      💡 RECOMMENDATION: Batch observability data into fewer requests`);
  }
  
  console.log(`\n📈 PERFORMANCE SCORE:`);
  const testEfficiency = keyEvents.actualTestStart ? 
    (keyEvents.actualTestStart.duration / metadata.totalSessionTime * 100) : 0;
  console.log(`   Test Efficiency: ${testEfficiency.toFixed(2)}% (actual test vs total session)`);
  
  if (testEfficiency < 1) {
    console.log(`   🚨 CRITICAL: Less than 1% of session time is actual test execution!`);
  } else if (testEfficiency < 5) {
    console.log(`   ⚠️  LOW: Very high framework overhead detected`);
  } else if (testEfficiency > 20) {
    console.log(`   ✅ GOOD: Reasonable test efficiency`);
  }
  
  console.log(`\n🏆 IMMEDIATE ACTION ITEMS:`);
  console.log(`   1. Hub management caching (save ~400-800ms)`);
  console.log(`   2. Async TestHub initialization (save ~500-1000ms)`);
  console.log(`   3. Batch observability requests (save ~500ms)`);
  console.log(`   4. Async auto-capture during cleanup (save ~1900ms)`);
  console.log(`   5. Investigate worker startup overhead`);
  
  // Calculate potential savings
  const hubTime = events.find(e => e.name === 'SDK:AUTOMATE:HUB-MANAGEMENT')?.duration || 0;
  const testHubTime = events.find(e => e.name === 'SDK:TESTHUB:START')?.duration || 0;
  const autoCaptureTime = autoCaptureEvent?.duration || 0;
  const obsTime = observabilityRequests.reduce((sum, e) => sum + e.duration, 0);
  
  const potentialSavings = (hubTime * 0.5) + (testHubTime * 0.7) + (autoCaptureTime * 0.8) + (obsTime * 0.6);
  const newSessionTime = metadata.totalSessionTime - potentialSavings;
  const improvement = (potentialSavings / metadata.totalSessionTime * 100);
  
  console.log(`\n💰 POTENTIAL SAVINGS:`);
  console.log(`   Current session time: ${metadata.totalSessionTime}ms`);
  console.log(`   Potential savings: ${potentialSavings.toFixed(0)}ms`);
  console.log(`   Optimized session time: ${newSessionTime.toFixed(0)}ms`);
  console.log(`   Performance improvement: ${improvement.toFixed(1)}%`);
}

// Run analysis
const jsonFile = process.argv[2] || 'timeline-gaps-worker-instrumentation.json';
analyzeWorkerInstrumentation(jsonFile);