#!/usr/bin/env bun
/**
 * Voice Diagnostics Test Runner
 * Standalone script to test voice command connectivity
 *
 * Usage:
 *   bun run test-voice-diagnostics.ts
 *   bun run test-voice-diagnostics.ts --url=http://localhost:3002
 */

import { testBackendConnection, formatDiagnosticReport } from './testVoiceCommand';

// Parse command line arguments
const args = process.argv.slice(2);
const urlArg = args.find(arg => arg.startsWith('--url='));
const apiUrl = urlArg ? urlArg.split('=')[1] : (process.env.API_URL || 'http://localhost:3002');

async function main() {
  console.log('\n' + '='.repeat(70));
  console.log('  VOICE COMMAND DIAGNOSTICS');
  console.log('='.repeat(70) + '\n');
  console.log(`Testing API: ${apiUrl}\n`);

  try {
    // Run diagnostics
    const report = await testBackendConnection(apiUrl);

    // Display formatted report
    console.log(formatDiagnosticReport(report));

    // Exit with appropriate code
    const allPassed = report.tests.every(t => t.passed);
    process.exit(allPassed ? 0 : 1);
  } catch (error: any) {
    console.error('\n❌ Fatal error running diagnostics:');
    console.error(error.message);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  }
}

main();
