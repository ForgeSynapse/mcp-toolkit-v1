// Test all health check endpoints
async function testHealthEndpoints() {
  const baseUrl = 'http://localhost:3000';
  const endpoints = [
    '/health',
    '/health/live',
    '/health/ready', 
    '/health/detailed',
    '/mcp/health',
    '/info'
  ];
  
  console.log('Testing all health check endpoints...\n');
  
  for (const endpoint of endpoints) {
    try {
      console.log(`=== Testing ${endpoint} ===`);
      const response = await fetch(`${baseUrl}${endpoint}`);
      console.log(`Status: ${response.status}`);
      console.log(`Content-Type: ${response.headers.get('content-type')}`);
      
      const data = await response.json();
      console.log('Response:', JSON.stringify(data, null, 2));
      console.log('');
      
    } catch (error) {
      console.error(`Failed to test ${endpoint}:`, error.message);
      console.log('');
    }
  }
}

testHealthEndpoints();