/**
 * Voice Command Network Connectivity Tester
 * Tests backend connection and diagnoses common issues
 */

export interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  details?: any;
  duration?: number;
}

export interface DiagnosticReport {
  timestamp: string;
  apiUrl: string;
  overallStatus: 'healthy' | 'degraded' | 'unhealthy';
  tests: TestResult[];
  recommendations: string[];
}

/**
 * Test backend connectivity and voice endpoint health
 */
export async function testBackendConnection(apiUrl: string): Promise<DiagnosticReport> {
  console.log('🔍 Starting backend diagnostics...');
  console.log('📡 Target URL:', apiUrl);

  const tests: TestResult[] = [];
  const recommendations: string[] = [];

  // Test 1: Basic network connectivity
  const networkTest = await testNetworkConnectivity(apiUrl);
  tests.push(networkTest);

  // Test 2: Health check endpoint
  const healthTest = await testHealthEndpoint(apiUrl);
  tests.push(healthTest);

  // Test 3: Voice endpoint exists
  const voiceEndpointTest = await testVoiceEndpointExists(apiUrl);
  tests.push(voiceEndpointTest);

  // Test 4: Email API endpoint
  const emailApiTest = await testEmailApiEndpoint(apiUrl);
  tests.push(emailApiTest);

  // Generate recommendations based on test results
  if (!networkTest.passed) {
    recommendations.push('Check if backend server is running (bun run server)');
    recommendations.push('Verify API_URL in .env matches server address');
    recommendations.push('Check network connection and firewall settings');
  }

  if (!healthTest.passed) {
    recommendations.push('Backend server may be starting up - wait 10 seconds and retry');
    recommendations.push('Check backend logs for errors');
  }

  if (!voiceEndpointTest.passed) {
    recommendations.push('Voice endpoint not responding - check server.ts has voice-command route');
    recommendations.push('Verify VoiceCommandProcessor is initialized in server');
  }

  if (!emailApiTest.passed) {
    recommendations.push('Email API not responding - database may not be initialized');
    recommendations.push('Run "bun run fetch:emails" to populate database');
  }

  // Determine overall status
  const passedCount = tests.filter(t => t.passed).length;
  const totalCount = tests.length;

  let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
  if (passedCount === totalCount) {
    overallStatus = 'healthy';
  } else if (passedCount >= totalCount / 2) {
    overallStatus = 'degraded';
  } else {
    overallStatus = 'unhealthy';
  }

  const report: DiagnosticReport = {
    timestamp: new Date().toISOString(),
    apiUrl,
    overallStatus,
    tests,
    recommendations: recommendations.length > 0 ? recommendations : ['All systems operational!'],
  };

  console.log('📊 Diagnostic report:', JSON.stringify(report, null, 2));

  return report;
}

/**
 * Test basic network connectivity
 */
async function testNetworkConnectivity(apiUrl: string): Promise<TestResult> {
  const startTime = Date.now();

  try {
    console.log('🌐 Testing network connectivity...');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(apiUrl, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const duration = Date.now() - startTime;

    return {
      name: 'Network Connectivity',
      passed: true,
      message: `Connected to ${apiUrl}`,
      details: {
        status: response.status,
        statusText: response.statusText,
      },
      duration,
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;

    let message = 'Cannot reach backend server';
    if (error.name === 'AbortError') {
      message = 'Connection timeout (5s) - server may be down';
    } else if (error.message.includes('Network request failed')) {
      message = 'Network request failed - check server is running';
    }

    return {
      name: 'Network Connectivity',
      passed: false,
      message,
      details: {
        error: error.message,
        type: error.name,
      },
      duration,
    };
  }
}

/**
 * Test health check endpoint
 */
async function testHealthEndpoint(apiUrl: string): Promise<TestResult> {
  const startTime = Date.now();

  try {
    console.log('❤️ Testing health endpoint...');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(`${apiUrl}/health`, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const duration = Date.now() - startTime;

    if (!response.ok) {
      return {
        name: 'Health Check',
        passed: false,
        message: `Health endpoint returned ${response.status}`,
        details: {
          status: response.status,
          statusText: response.statusText,
        },
        duration,
      };
    }

    const data = await response.json();

    return {
      name: 'Health Check',
      passed: data.status === 'healthy',
      message: data.status === 'healthy'
        ? 'Server is healthy'
        : `Server status: ${data.status}`,
      details: data,
      duration,
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;

    return {
      name: 'Health Check',
      passed: false,
      message: 'Health endpoint not responding',
      details: {
        error: error.message,
      },
      duration,
    };
  }
}

/**
 * Test voice command endpoint exists
 */
async function testVoiceEndpointExists(apiUrl: string): Promise<TestResult> {
  const startTime = Date.now();

  try {
    console.log('🎙️ Testing voice endpoint...');

    // Send a simple text command to test endpoint
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const response = await fetch(`${apiUrl}/api/voice-command`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: 'test connection',
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const duration = Date.now() - startTime;

    if (!response.ok) {
      const errorData = await response.text();
      return {
        name: 'Voice Endpoint',
        passed: false,
        message: `Voice endpoint returned ${response.status}`,
        details: {
          status: response.status,
          error: errorData,
        },
        duration,
      };
    }

    const data = await response.json();

    return {
      name: 'Voice Endpoint',
      passed: true,
      message: 'Voice endpoint is responding',
      details: {
        transcript: data.transcript,
        confirmation: data.confirmation,
      },
      duration,
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;

    let message = 'Voice endpoint not responding';
    if (error.name === 'AbortError') {
      message = 'Voice endpoint timeout (15s) - API keys may be invalid';
    }

    return {
      name: 'Voice Endpoint',
      passed: false,
      message,
      details: {
        error: error.message,
      },
      duration,
    };
  }
}

/**
 * Test email API endpoint
 */
async function testEmailApiEndpoint(apiUrl: string): Promise<TestResult> {
  const startTime = Date.now();

  try {
    console.log('📧 Testing email API...');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(`${apiUrl}/api/emails?count=1`, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const duration = Date.now() - startTime;

    if (!response.ok) {
      return {
        name: 'Email API',
        passed: false,
        message: `Email API returned ${response.status}`,
        details: {
          status: response.status,
        },
        duration,
      };
    }

    const data = await response.json();

    return {
      name: 'Email API',
      passed: data.success === true,
      message: data.success
        ? `Email API working (${data.count} emails)`
        : 'Email API returned error',
      details: {
        emailCount: data.count,
        success: data.success,
      },
      duration,
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;

    return {
      name: 'Email API',
      passed: false,
      message: 'Email API not responding',
      details: {
        error: error.message,
      },
      duration,
    };
  }
}

/**
 * Format diagnostic report for console output
 */
export function formatDiagnosticReport(report: DiagnosticReport): string {
  const lines: string[] = [];

  lines.push('');
  lines.push('='.repeat(60));
  lines.push('  VOICE COMMAND SYSTEM DIAGNOSTICS');
  lines.push('='.repeat(60));
  lines.push('');
  lines.push(`Timestamp: ${report.timestamp}`);
  lines.push(`API URL: ${report.apiUrl}`);
  lines.push(`Overall Status: ${report.overallStatus.toUpperCase()}`);
  lines.push('');
  lines.push('TEST RESULTS:');
  lines.push('-'.repeat(60));

  report.tests.forEach(test => {
    const icon = test.passed ? '✅' : '❌';
    lines.push(`${icon} ${test.name}: ${test.message}`);
    if (test.duration !== undefined) {
      lines.push(`   Duration: ${test.duration}ms`);
    }
    if (test.details) {
      lines.push(`   Details: ${JSON.stringify(test.details, null, 2).replace(/\n/g, '\n   ')}`);
    }
    lines.push('');
  });

  lines.push('RECOMMENDATIONS:');
  lines.push('-'.repeat(60));
  report.recommendations.forEach((rec, index) => {
    lines.push(`${index + 1}. ${rec}`);
  });
  lines.push('');
  lines.push('='.repeat(60));

  return lines.join('\n');
}

/**
 * Quick connectivity check (simplified version)
 */
export async function quickConnectivityCheck(apiUrl: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(`${apiUrl}/health`, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const data = await response.json();

    return data.status === 'healthy';
  } catch (error) {
    return false;
  }
}
