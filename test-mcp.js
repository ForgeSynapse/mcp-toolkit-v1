// Test MCP Streamable HTTP endpoint
async function testMcpEndpoint() {
  const serverUrl = 'http://localhost:3000/mcp';
  
  console.log('Testing MCP initialization...');
  
  try {
    // Test initialization
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
            name: 'test-client',
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
    
    // Test tools/list
    console.log('\nTesting tools/list...');
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
    
    // Test tool call
    console.log('\nTesting tool call...');
    const callResponse = await fetch(serverUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Mcp-Session-Id': sessionId,
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
    console.log('Call response data:', JSON.stringify(callData, null, 2));
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testMcpEndpoint();