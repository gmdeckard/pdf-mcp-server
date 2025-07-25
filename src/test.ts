#!/usr/bin/env node

/**
 * Test script for the Enhanced PDF MCP Server
 * This demonstrates all the available tools
 */

import { spawn } from 'child_process';
import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

const SERVER_PATH = join(__dirname, 'enhanced-index.js');
const TEST_PDF = join(__dirname, '../node_modules/pdf-parse/test/data/01-valid.pdf');

async function testMCPServer() {
  console.log('🧪 Testing Enhanced PDF MCP Server...\n');
  
  // Start the MCP server
  const server = spawn('node', [SERVER_PATH], {
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  let responseBuffer = '';
  
  server.stdout.on('data', (data) => {
    responseBuffer += data.toString();
  });
  
  server.stderr.on('data', (data) => {
    console.log('Server log:', data.toString());
  });
  
  // Helper function to send MCP request
  function sendRequest(method: string, params: any = {}) {
    const request = {
      jsonrpc: '2.0',
      id: Date.now(),
      method,
      params
    };
    
    server.stdin.write(JSON.stringify(request) + '\n');
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const responses = responseBuffer.split('\n').filter(line => line.trim());
        const lastResponse = responses[responses.length - 1];
        if (lastResponse) {
          try {
            resolve(JSON.parse(lastResponse));
          } catch (e) {
            resolve({ error: 'Failed to parse response', raw: lastResponse });
          }
        } else {
          resolve({ error: 'No response received' });
        }
        responseBuffer = '';
      }, 1000);
    });
  }
  
  try {
    // Test 1: List available tools
    console.log('1️⃣ Testing list_tools...');
    const toolsResponse = await sendRequest('tools/list');
    console.log('Available tools:', JSON.stringify(toolsResponse, null, 2));
    console.log('');
    
    // Test 2: Read PDF text
    console.log('2️⃣ Testing read_pdf...');
    const readResponse = await sendRequest('tools/call', {
      name: 'read_pdf',
      arguments: {
        file_path: TEST_PDF,
        max_pages: 1
      }
    });
    console.log('Read PDF response:', JSON.stringify(readResponse, null, 2).substring(0, 500) + '...');
    console.log('');
    
    // Test 3: Analyze PDF structure
    console.log('3️⃣ Testing analyze_pdf_structure...');
    const analyzeResponse = await sendRequest('tools/call', {
      name: 'analyze_pdf_structure',
      arguments: {
        file_path: TEST_PDF,
        include_text: true,
        include_images: true,
        include_tables: true
      }
    });
    console.log('Analyze PDF response:', JSON.stringify(analyzeResponse, null, 2).substring(0, 500) + '...');
    console.log('');
    
    // Test 4: Extract tables
    console.log('4️⃣ Testing extract_pdf_tables...');
    const tablesResponse = await sendRequest('tools/call', {
      name: 'extract_pdf_tables',
      arguments: {
        file_path: TEST_PDF
      }
    });
    console.log('Extract tables response:', JSON.stringify(tablesResponse, null, 2).substring(0, 500) + '...');
    console.log('');
    
    // Test 5: Extract images
    console.log('5️⃣ Testing extract_pdf_images...');
    const imagesResponse = await sendRequest('tools/call', {
      name: 'extract_pdf_images',
      arguments: {
        file_path: TEST_PDF,
        ocr_enabled: false
      }
    });
    console.log('Extract images response:', JSON.stringify(imagesResponse, null, 2).substring(0, 500) + '...');
    console.log('');
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    server.kill();
    console.log('✅ Test completed!');
  }
}

// Run the test
testMCPServer().catch(console.error);
