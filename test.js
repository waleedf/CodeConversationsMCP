#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');
const readline = require('readline');

// Path to the compiled server script
const serverPath = path.join(__dirname, 'dist', 'index.js');

// Start the MCP server process
const server = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', process.stderr]
});

// Set up readline interface to read from server stdout
const rl = readline.createInterface({
  input: server.stdout,
  crlfDelay: Infinity
});

// Handle JSON-RPC message sending
function sendRequest(id, method, params = {}) {
  const request = {
    jsonrpc: '2.0',
    id,
    method,
    params
  };
  
  console.log(`\nSending ${method} request:`);
  console.log(JSON.stringify(request, null, 2));
  
  server.stdin.write(JSON.stringify(request) + '\n');
}

// Process response messages
let toolsList = null;

rl.on('line', (line) => {
  try {
    const message = JSON.parse(line);
    
    console.log('\nReceived response:');
    console.log(JSON.stringify(message, null, 2));
    
    // Handle list_tools response
    if (message.id === 1 && message.result) {
      toolsList = message.result.tools;
      console.log('\nTools available:');
      toolsList.forEach(tool => {
        console.log(`- ${tool.name}: ${tool.description}`);
      });
      
      // Now send a call_tool request
      sendRequest(2, 'call_tool', {
        name: 'call_external_model',
        arguments: {
          model: 'o3-mini',
          message: 'What would be a memory-efficient way to implement a large tree structure in JavaScript?',
          context: 'Working on a web application that needs to handle large hierarchical data'
        }
      });
    }
    
    // Handle call_tool response
    if (message.id === 2 && message.result) {
      console.log('\nTest successful! Received response from external model:');
      
      try {
        const responseContent = JSON.parse(message.result.content[0].text);
        console.log(`\nModel Used: ${responseContent.modelUsed}`);
        console.log(`\nResponse: ${responseContent.response}`);
        
        if (responseContent.usage) {
          console.log(`\nTokens Used: ${JSON.stringify(responseContent.usage, null, 2)}`);
        }
      } catch (e) {
        console.log(message.result.content[0].text);
      }
      
      // Exit after a successful test
      console.log('\nTest complete. Shutting down...');
      setTimeout(() => {
        server.kill();
        process.exit(0);
      }, 1000);
    }
    
    // Handle errors
    if (message.error) {
      console.error(`\nError: ${message.error.message} (Code: ${message.error.code})`);
      
      // If the list_tools request failed, try using rpc.list_tools (standard MCP schema)
      if (message.id === 1 && message.error.code === -32601) {
        console.log('\nTrying rpc.list_tools instead...');
        sendRequest(1, 'rpc.list_tools');
      }
    }
  } catch (e) {
    console.error('Error processing server output:', e.message);
  }
});

// Handle server exit
server.on('exit', (code) => {
  console.log(`Server exited with code ${code}`);
  process.exit(code);
});

// Start the test
console.log('Starting CodingConversationsMCP test...');
sendRequest(1, 'list_tools');

// Handle SIGINT to gracefully exit
process.on('SIGINT', () => {
  console.log('\nTest interrupted. Shutting down...');
  server.kill();
  process.exit(0);
});
