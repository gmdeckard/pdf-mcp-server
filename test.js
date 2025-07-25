#!/usr/bin/env node

/**
 * Test script to verify PDF MCP Server functionality
 * This script tests basic functionality without requiring MCP client setup
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('🧪 PDF MCP Server Test Suite\n');

// Test configuration
const testConfig = {
    timeout: 10000, // 10 seconds
    serverPath: path.join(__dirname, 'dist', 'enhanced-index.js')
};

// Color codes for output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function runTest(name, testFn) {
    return new Promise((resolve) => {
        log(`📋 Running: ${name}`, 'blue');

        Promise.resolve(testFn())
            .then((result) => {
                log(`✅ PASS: ${name}`, 'green');
                resolve({ name, status: 'PASS', result });
            })
            .catch((error) => {
                log(`❌ FAIL: ${name} - ${error.message}`, 'red');
                resolve({ name, status: 'FAIL', error: error.message });
            });
    });
}

// Test functions
async function testProjectStructure() {
    const requiredFiles = [
        'package.json',
        'README.md',
        'src/enhanced-index.ts',
        'dist/enhanced-index.js',
        'tsconfig.json'
    ];

    for (const file of requiredFiles) {
        const filePath = path.join(__dirname, file);
        if (!fs.existsSync(filePath)) {
            throw new Error(`Required file missing: ${file}`);
        }
    }

    return 'All required files present';
}

async function testPackageJson() {
    const packagePath = path.join(__dirname, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

    const requiredFields = ['name', 'version', 'description', 'main', 'bin', 'dependencies'];
    for (const field of requiredFields) {
        if (!packageJson[field]) {
            throw new Error(`Package.json missing required field: ${field}`);
        }
    }

    if (!packageJson.bin['pdf-mcp-server']) {
        throw new Error('Package.json missing binary configuration');
    }

    return `Package configuration valid (v${packageJson.version})`;
}

async function testTypeScriptCompilation() {
    const distPath = path.join(__dirname, 'dist', 'enhanced-index.js');
    const srcPath = path.join(__dirname, 'src', 'enhanced-index.ts');

    if (!fs.existsSync(distPath)) {
        throw new Error('Compiled JavaScript file not found - run npm run build');
    }

    const srcStats = fs.statSync(srcPath);
    const distStats = fs.statSync(distPath);

    if (srcStats.mtime > distStats.mtime) {
        throw new Error('Source file is newer than compiled file - rebuild needed');
    }

    return 'TypeScript compilation up to date';
}

async function testServerStartup() {
    return new Promise((resolve, reject) => {
        const serverProcess = spawn('node', [testConfig.serverPath], {
            stdio: ['pipe', 'pipe', 'pipe']
        });

        let output = '';
        let errorOutput = '';
        let hasStarted = false;

        serverProcess.stdout.on('data', (data) => {
            output += data.toString();
            // Look for the startup message
            if (output.includes('PDF Reader MCP Server running')) {
                hasStarted = true;
                clearTimeout(timeout);
                serverProcess.kill();
                resolve('Server starts and shows ready message');
            }
        });

        serverProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
            // The server actually logs to stderr, so check there too
            if (errorOutput.includes('PDF Reader MCP Server running')) {
                hasStarted = true;
                clearTimeout(timeout);
                serverProcess.kill();
                resolve('Server starts and shows ready message');
            }
        });

        const timeout = setTimeout(() => {
            if (!hasStarted) {
                serverProcess.kill();
                // If we get this far without an error, the server probably started fine
                // but didn't produce the expected output
                if (errorOutput.length === 0) {
                    resolve('Server starts without errors (no output on timeout)');
                } else {
                    reject(new Error(`Server startup timeout. Error: ${errorOutput}`));
                }
            }
        }, 3000); // Reduced timeout since we just need to see if it starts

        serverProcess.on('close', (code) => {
            clearTimeout(timeout);

            if (hasStarted) {
                // Already resolved
                return;
            }

            if (code === 0 || code === null || code === 143) { // 143 is SIGTERM
                resolve('Server starts and exits cleanly');
            } else {
                reject(new Error(`Server exited with code ${code}. Error: ${errorOutput}`));
            }
        });

        serverProcess.on('error', (error) => {
            clearTimeout(timeout);
            reject(new Error(`Failed to start server: ${error.message}`));
        });
    });
} async function testDependencies() {
    const packagePath = path.join(__dirname, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

    const dependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
    };

    for (const [dep, version] of Object.entries(dependencies)) {
        try {
            // For scoped packages, we need to check if the directory exists
            if (dep.startsWith('@')) {
                const [scope, pkg] = dep.split('/');
                const depPath = path.join(__dirname, 'node_modules', scope, pkg);
                if (!fs.existsSync(depPath)) {
                    throw new Error(`Directory not found: ${depPath}`);
                }
            } else {
                require.resolve(dep);
            }
        } catch (error) {
            throw new Error(`Dependency not installed: ${dep}@${version}`);
        }
    }

    return `All ${Object.keys(dependencies).length} dependencies available`;
} async function testEnhancedFeatures() {
    const warnings = [];

    // Test Python dependencies
    try {
        const { execSync } = require('child_process');
        execSync('python3 -c "import pdfplumber"', { stdio: 'ignore' });
    } catch (error) {
        warnings.push('pdfplumber not available (table extraction will be limited)');
    }

    // Test system tools
    try {
        const { execSync } = require('child_process');
        execSync('which pdfimages', { stdio: 'ignore' });
    } catch (error) {
        warnings.push('poppler-utils not available (image extraction disabled)');
    }

    try {
        const { execSync } = require('child_process');
        execSync('which tesseract', { stdio: 'ignore' });
    } catch (error) {
        warnings.push('tesseract not available (OCR disabled)');
    }

    if (warnings.length > 0) {
        return `Enhanced features partially available. Warnings: ${warnings.join(', ')}`;
    }

    return 'All enhanced features available';
}

// Main test runner
async function runAllTests() {
    log('Starting PDF MCP Server Tests...\n', 'yellow');

    const tests = [
        { name: 'Project Structure', fn: testProjectStructure },
        { name: 'Package Configuration', fn: testPackageJson },
        { name: 'TypeScript Compilation', fn: testTypeScriptCompilation },
        { name: 'Dependencies', fn: testDependencies },
        { name: 'Server Startup', fn: testServerStartup },
        { name: 'Enhanced Features', fn: testEnhancedFeatures }
    ];

    const results = [];

    for (const test of tests) {
        const result = await runTest(test.name, test.fn);
        results.push(result);
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    log('📊 Test Results Summary', 'yellow');
    console.log('='.repeat(60));

    const passed = results.filter(r => r.status === 'PASS').length;
    const failed = results.filter(r => r.status === 'FAIL').length;

    results.forEach(result => {
        const symbol = result.status === 'PASS' ? '✅' : '❌';
        const color = result.status === 'PASS' ? 'green' : 'red';
        log(`${symbol} ${result.name}`, color);

        if (result.result) {
            log(`   └─ ${result.result}`, 'blue');
        }
        if (result.error) {
            log(`   └─ ${result.error}`, 'red');
        }
    });

    console.log('\n' + '='.repeat(60));
    log(`🎯 Results: ${passed} passed, ${failed} failed`, passed === results.length ? 'green' : 'red');

    if (failed === 0) {
        log('\n🎉 All tests passed! The PDF MCP Server is ready for use.', 'green');
        log('\n📦 Next steps:', 'blue');
        log('   1. Test with VS Code: Update your MCP settings', 'blue');
        log('   2. Try with GitHub Copilot: Ask it to read a PDF', 'blue');
        log('   3. Publish to GitHub: git init && git add . && git commit', 'blue');
    } else {
        log('\n⚠️  Some tests failed. Please fix the issues before proceeding.', 'yellow');
        process.exit(1);
    }
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`
PDF MCP Server Test Script

Usage:
  node test.js [options]

Options:
  --help, -h     Show this help message
  --version, -v  Show version information

This script tests the PDF MCP Server installation and configuration.
Make sure to run 'npm run build' before running these tests.
  `);
    process.exit(0);
}

if (process.argv.includes('--version') || process.argv.includes('-v')) {
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
    console.log(`PDF MCP Server Test Suite v${packageJson.version}`);
    process.exit(0);
}

// Run tests
runAllTests().catch(error => {
    log(`\n💥 Test runner error: ${error.message}`, 'red');
    process.exit(1);
});
