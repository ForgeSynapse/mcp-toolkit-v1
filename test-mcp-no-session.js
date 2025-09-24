// Test MCP Streamable HTTP endpoint without session management
async function testMcpEndpointNoSession() {
  const serverUrl = 'http://localhost:3000/mcp';
  
  console.log('Testing MCP without session management...');
  
  try {
    // Test initialization without expecting session ID
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
    
    // Test tools/list without session ID
    console.log('\nTesting tools/list without session...');
    const toolsResponse = await fetch(serverUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list'
      })
    });
    
    console.log('Tools response status:', toolsResponse.status);
    const toolsData = await toolsResponse.json();
    console.log('Tools available:', toolsData.result?.tools?.length || 0);
    
    // Test tool call without session ID
    console.log('\nTesting tool call without session...');
    const callResponse = await fetch(serverUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': 'c178a02b7c2eb205c59938d86dcbc0c368bb26a7411266821988d0209a84711f'
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: {
          name: 'generate-password',
          arguments: {
            length: 12
          }
        }
      })
    });
    
    console.log('Call response status:', callResponse.status);
    const callData = await callResponse.json();
    console.log('Call response:', JSON.stringify(callData, null, 2));
    
    // Test GET endpoint for SSE without session
    console.log('\nTesting GET endpoint for SSE without session...');
    const getResponse = await fetch(serverUrl, {
      method: 'GET'
    });
    
    console.log('GET response status:', getResponse.status);
    console.log('GET response headers:', Object.fromEntries(getResponse.headers.entries()));
    
    if (getResponse.headers.get('content-type')?.includes('text/event-stream')) {
      console.log('SSE endpoint working correctly without session');
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testMcpEndpointNoSession();