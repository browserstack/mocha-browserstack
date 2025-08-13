#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class TimelineGapAnalyzer {
  constructor() {
    this.events = [];
    this.sessionStart = null;
    this.sessionEnd = null;
    this.gaps = [];
  }

  parseLogFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const eventMap = new Map();

    // Extract session start/end times
    lines.forEach(line => {
      const sessionStartMatch = line.match(/SDK SESSION STARTED AT (\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/);
      const sessionEndMatch = line.match(/SDK SESSION ENDED AT (\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/);
      const testCompletionMatch = line.match(/SDK TEST EXECUTION COMPLETED AT (\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/);

      if (sessionStartMatch) {
        this.sessionStart = new Date(sessionStartMatch[1]);
      }
      if (sessionEndMatch) {
        this.sessionEnd = new Date(sessionEndMatch[1]);
      }
      if (testCompletionMatch) {
        this.testExecutionEnd = new Date(testCompletionMatch[1]);
      }

      // Parse performance events
      const perfMatch = line.match(/PERFORMANCE EVENT (STARTED|ENDED): (.+?) AT (\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/);
      if (perfMatch) {
        const [, type, eventName, timestamp] = perfMatch;
        const time = new Date(timestamp);

        if (type === 'STARTED') {
          eventMap.set(eventName, { 
            name: eventName, 
            start: time
          });
        } else if (type === 'ENDED') {
          const startEvent = eventMap.get(eventName);
          if (startEvent) {
            this.events.push({
              ...startEvent,
              end: time,
              duration: time - startEvent.start
            });
            eventMap.delete(eventName);
          }
        }
      }
    });

    // Add remaining started events as instant events
    eventMap.forEach(event => {
      this.events.push({
        ...event,
        end: event.start,
        duration: 0,
        isInstant: true
      });
    });

    this.events.sort((a, b) => a.start - b.start);
  }

  calculateGaps() {
    if (!this.sessionStart || !this.sessionEnd || this.events.length === 0) {
      return [];
    }

    const gaps = [];
    let currentTime = this.sessionStart;

    // Create a timeline of all event points
    const timePoints = [];
    
    this.events.forEach(event => {
      timePoints.push({ time: event.start, type: 'start', event });
      timePoints.push({ time: event.end, type: 'end', event });
    });

    timePoints.sort((a, b) => a.time - b.time);

    let activeEvents = 0;
    let lastCoveredTime = this.sessionStart;

    timePoints.forEach(point => {
      if (activeEvents === 0 && point.time > lastCoveredTime) {
        // Found a gap
        const gapDuration = point.time - lastCoveredTime;
        if (gapDuration > 1) { // Only report gaps > 1ms
          gaps.push({
            start: lastCoveredTime,
            end: point.time,
            duration: gapDuration,
            type: 'gap'
          });
        }
      }

      if (point.type === 'start') {
        activeEvents++;
      } else {
        activeEvents--;
        if (activeEvents === 0) {
          lastCoveredTime = point.time;
        }
      }
    });

    // Check for final gap to session end
    if (activeEvents === 0 && this.sessionEnd > lastCoveredTime) {
      const finalGap = this.sessionEnd - lastCoveredTime;
      if (finalGap > 1) {
        gaps.push({
          start: lastCoveredTime,
          end: this.sessionEnd,
          duration: finalGap,
          type: 'final-gap'
        });
      }
    }

    this.gaps = gaps;
    return gaps;
  }

  generateReport() {
    const totalSessionTime = this.sessionEnd - this.sessionStart;
    const totalPerformanceEventTime = this.events
      .filter(e => !e.isInstant)
      .reduce((sum, e) => sum + e.duration, 0);
    
    const totalGapTime = this.gaps.reduce((sum, gap) => sum + gap.duration, 0);
    const coveragePercentage = ((totalPerformanceEventTime / totalSessionTime) * 100).toFixed(2);

    console.log('='.repeat(60));
    console.log('         BROWSERSTACK SDK TIMELINE GAP ANALYSIS');
    console.log('='.repeat(60));
    console.log();
    
    console.log('📊 SESSION SUMMARY:');
    console.log(`   Session Start:     ${this.sessionStart.toISOString()}`);
    console.log(`   Session End:       ${this.sessionEnd.toISOString()}`);
    console.log(`   Total Duration:    ${totalSessionTime}ms (${(totalSessionTime/1000).toFixed(2)}s)`);
    console.log();

    console.log('⚡ PERFORMANCE EVENT COVERAGE:');
    console.log(`   Events Tracked:    ${this.events.length} events`);
    console.log(`   Time Covered:      ${totalPerformanceEventTime}ms (${(totalPerformanceEventTime/1000).toFixed(2)}s)`);
    console.log(`   Coverage:          ${coveragePercentage}%`);
    console.log();

    console.log('🕳️  IDENTIFIED GAPS:');
    console.log(`   Number of Gaps:    ${this.gaps.length}`);
    console.log(`   Total Gap Time:    ${totalGapTime}ms (${(totalGapTime/1000).toFixed(2)}s)`);
    console.log(`   Gap Percentage:    ${((totalGapTime / totalSessionTime) * 100).toFixed(2)}%`);
    console.log();

    if (this.gaps.length > 0) {
      console.log('📋 DETAILED GAP BREAKDOWN:');
      this.gaps.forEach((gap, index) => {
        const startTime = gap.start.toLocaleTimeString('en-US', {hour12: false, timeZone: 'UTC'});
        const endTime = gap.end.toLocaleTimeString('en-US', {hour12: false, timeZone: 'UTC'});
        console.log(`   ${index + 1}. ${startTime} → ${endTime}`);
        console.log(`      Duration: ${gap.duration}ms (${(gap.duration/1000).toFixed(2)}s)`);
        console.log(`      Type: ${gap.type}`);
        console.log();
      });
    }

    console.log('🔍 LARGEST GAPS (>100ms):');
    const significantGaps = this.gaps
      .filter(gap => gap.duration > 100)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5);

    if (significantGaps.length > 0) {
      significantGaps.forEach((gap, index) => {
        console.log(`   ${index + 1}. ${(gap.duration/1000).toFixed(2)}s gap`);
        console.log(`      ${gap.start.toLocaleTimeString('en-US', {hour12: false, timeZone: 'UTC'})} → ${gap.end.toLocaleTimeString('en-US', {hour12: false, timeZone: 'UTC'})}`);
      });
    } else {
      console.log('   No significant gaps found (all gaps < 100ms)');
    }

    console.log();
    console.log('💡 RECOMMENDATIONS:');
    if (coveragePercentage < 80) {
      console.log('   - Low coverage detected. Consider adding performance events for uncovered areas.');
    }
    if (this.gaps.some(gap => gap.duration > 1000)) {
      console.log('   - Large gaps detected. These may indicate areas where tests are running.');
      console.log('   - Consider adding framework-specific performance tracking.');
    }
    if (totalGapTime > totalPerformanceEventTime) {
      console.log('   - More time spent in gaps than tracked events.');
      console.log('   - Review if additional instrumentation is needed.');
    }

    console.log('='.repeat(60));
  }

  exportGapsForVisualization(outputPath) {
    const data = {
      sessionStart: this.sessionStart,
      sessionEnd: this.sessionEnd,
      events: this.events,
      gaps: this.gaps,
      metadata: {
        totalSessionTime: this.sessionEnd - this.sessionStart,
        totalEventTime: this.events.filter(e => !e.isInstant).reduce((sum, e) => sum + e.duration, 0),
        totalGapTime: this.gaps.reduce((sum, gap) => sum + gap.duration, 0),
        coveragePercentage: ((this.events.filter(e => !e.isInstant).reduce((sum, e) => sum + e.duration, 0) / (this.sessionEnd - this.sessionStart)) * 100)
      }
    };

    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    console.log(`\n📁 Gap analysis data exported to: ${outputPath}`);
  }
}

// Main execution
function main() {
  const logFile = process.argv[2] || 'run-with-session-timing.log';
  const outputFile = process.argv[3] || 'timeline-gaps.json';

  if (!fs.existsSync(logFile)) {
    console.error(`❌ Log file not found: ${logFile}`);
    console.log('Usage: node gap-analyzer.js [log-file] [output-file]');
    process.exit(1);
  }

  const analyzer = new TimelineGapAnalyzer();
  
  try {
    console.log(`📖 Analyzing log file: ${logFile}`);
    analyzer.parseLogFile(logFile);
    analyzer.calculateGaps();
    analyzer.generateReport();
    analyzer.exportGapsForVisualization(outputFile);
  } catch (error) {
    console.error(`❌ Error analyzing log file: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = TimelineGapAnalyzer;