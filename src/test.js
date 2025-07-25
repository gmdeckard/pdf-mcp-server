#!/usr/bin/env node
"use strict";
/**
 * Test script for the Enhanced PDF MCP Server
 * This demonstrates all the available tools
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const path_1 = require("path");
const SERVER_PATH = (0, path_1.join)(__dirname, 'enhanced-index.js');
const TEST_PDF = (0, path_1.join)(__dirname, '../node_modules/pdf-parse/test/data/01-valid.pdf');
function testMCPServer() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('🧪 Testing Enhanced PDF MCP Server...\n');
        // Start the MCP server
        const server = (0, child_process_1.spawn)('node', [SERVER_PATH], {
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
        function sendRequest(method, params = {}) {
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
                        }
                        catch (e) {
                            resolve({ error: 'Failed to parse response', raw: lastResponse });
                        }
                    }
                    else {
                        resolve({ error: 'No response received' });
                    }
                    responseBuffer = '';
                }, 1000);
            });
        }
        try {
            // Test 1: List available tools
            console.log('1️⃣ Testing list_tools...');
            const toolsResponse = yield sendRequest('tools/list');
            console.log('Available tools:', JSON.stringify(toolsResponse, null, 2));
            console.log('');
            // Test 2: Read PDF text
            console.log('2️⃣ Testing read_pdf...');
            const readResponse = yield sendRequest('tools/call', {
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
            const analyzeResponse = yield sendRequest('tools/call', {
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
            const tablesResponse = yield sendRequest('tools/call', {
                name: 'extract_pdf_tables',
                arguments: {
                    file_path: TEST_PDF
                }
            });
            console.log('Extract tables response:', JSON.stringify(tablesResponse, null, 2).substring(0, 500) + '...');
            console.log('');
            // Test 5: Extract images
            console.log('5️⃣ Testing extract_pdf_images...');
            const imagesResponse = yield sendRequest('tools/call', {
                name: 'extract_pdf_images',
                arguments: {
                    file_path: TEST_PDF,
                    ocr_enabled: false
                }
            });
            console.log('Extract images response:', JSON.stringify(imagesResponse, null, 2).substring(0, 500) + '...');
            console.log('');
        }
        catch (error) {
            console.error('Test failed:', error);
        }
        finally {
            server.kill();
            console.log('✅ Test completed!');
        }
    });
}
// Run the test
testMCPServer().catch(console.error);
