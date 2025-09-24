// Test MCP Streamable HTTP endpoint without authentication
async function testMcpEndpointNoAuth() {
  const serverUrl = 'http://localhost:3001/mcp';
  
  console.log('Testing MCP without authentication...');
  
  try {
    // Test initialization without API key
    const initResponse = await fetch(serverUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: {
            name: 'inkeep-test-client',
            version: '1.0.0'
          }
        }
      })
    });
    
    console.log('Init response status:', initResponse.status);
    console.log('Init response headers:', Object.fromEntries(initResponse.headers.entries()));
    
    const initData = await initResponse.json();
    console.log('Init response data:', JSON.stringify(initData, null, 2));
    
    const sessionId = initResponse.headers.get('mcp-session-id');
    if (!sessionId) {
      console.error('No session ID returned!');
      return;
    }
    
    console.log('Session ID:', sessionId);
    
    // Test tools/list without authentication
    console.log('\nTesting tools/list without auth...');
    const toolsResponse = await fetch(serverUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Mcp-Session-Id': sessionId
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list'
      })
    });
    
    console.log('Tools response status:', toolsResponse.status);
    const toolsData = await toolsResponse.json();
    console.log('Tools response data:', JSON.stringify(toolsData, null, 2));
    
    // Test GET endpoint for SSE
    console.log('\nTesting GET endpoint for SSE...');
    const getResponse = await fetch(serverUrl, {
      method: 'GET',
      headers: {
        'Mcp-Session-Id': sessionId
      }
    });
    
    console.log('GET response status:', getResponse.status);
    console.log('GET response headers:', Object.fromEntries(getResponse.headers.entries()));
    
    if (getResponse.headers.get('content-type')?.includes('text/event-stream')) {
      console.log('SSE endpoint working correctly');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testMcpEndpointNoAuth();