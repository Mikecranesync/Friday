
import fetch from 'node-fetch';

const BACKEND_URL = 'http://localhost:3002';

async function testAgent(message: string) {
    console.log(`\nTesting message: "${message}"`);
    try {
        const response = await fetch(`${BACKEND_URL}/api/agent/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message,
                userId: 'test-user',
            }),
        });

        if (!response.ok) {
            console.error(`Error: ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.error(text);
            return;
        }

        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Failed to connect:', error);
    }
}

async function runTests() {
    // Test 1: General Chat
    await testAgent('Hello Friday, how are you?');

    // Test 2: Personal Assistant (Calendar)
    await testAgent('What is on my calendar today?');

    // Test 3: Communication (Email)
    await testAgent('Draft an email to John about the meeting.');

    // Test 4: Knowledge (Question)
    await testAgent('What is the capital of France?');
}

runTests();
