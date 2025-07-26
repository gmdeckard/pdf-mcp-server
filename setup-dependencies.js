#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔧 Setting up PDF MCP Server dependencies...\n');

// Check if Python is available
function checkPython() {
    try {
        execSync('python3 --version', { stdio: 'pipe' });
        return 'python3';
    } catch {
        try {
            execSync('python --version', { stdio: 'pipe' });
            return 'python';
        } catch {
            return null;
        }
    }
}

// Install Python dependencies
function installPythonDeps() {
    const python = checkPython();
    if (!python) {
        console.log('⚠️  Python not found. Please install Python 3.x to enable enhanced table extraction.');
        return false;
    }

    try {
        // Check if virtual environment exists, create if not
        if (!fs.existsSync('./venv')) {
            console.log('📦 Creating Python virtual environment...');
            execSync(`${python} -m venv venv`, { stdio: 'inherit' });
        }

        console.log('📦 Installing pdfplumber for enhanced table extraction...');
        execSync(`./venv/bin/pip install pdfplumber`, { stdio: 'inherit' });
        console.log('✅ pdfplumber installed successfully\n');
        return true;
    } catch (error) {
        console.log('⚠️  Failed to install pdfplumber. Enhanced table extraction may not work.');
        console.log('   Error details:', error.message);
        console.log('   You can install it manually with: ./venv/bin/pip install pdfplumber\n');
        return false;
    }
}

// Install system dependencies
function installSystemDeps() {
    console.log('🔧 Installing system dependencies for OCR and image extraction...');

    try {
        // Try different package managers
        if (process.platform === 'linux') {
            // Check if running as root or with sudo
            try {
                execSync('apt-get update && apt-get install -y poppler-utils tesseract-ocr', { stdio: 'inherit' });
                console.log('✅ System dependencies installed successfully\n');
                return true;
            } catch {
                console.log('⚠️  Could not install system dependencies automatically.');
                console.log('   Please run: sudo apt-get install poppler-utils tesseract-ocr\n');
                return false;
            }
        } else if (process.platform === 'darwin') {
            try {
                execSync('brew install poppler tesseract', { stdio: 'inherit' });
                console.log('✅ System dependencies installed successfully\n');
                return true;
            } catch {
                console.log('⚠️  Could not install system dependencies automatically.');
                console.log('   Please run: brew install poppler tesseract\n');
                return false;
            }
        } else {
            console.log('⚠️  Automatic installation not supported on your platform.');
            console.log('   Please install poppler-utils and tesseract-ocr manually\n');
            return false;
        }
    } catch (error) {
        console.log('⚠️  Failed to install system dependencies automatically.');
        return false;
    }
}

// Main setup function
function main() {
    let pythonSuccess = installPythonDeps();
    let systemSuccess = installSystemDeps();

    console.log('📋 Setup Summary:');
    console.log(`   Enhanced table extraction: ${pythonSuccess ? '✅ Ready' : '❌ Not available'}`);
    console.log(`   OCR and image extraction: ${systemSuccess ? '✅ Ready' : '❌ Not available'}`);
    console.log(`   Basic PDF reading: ✅ Ready\n`);

    console.log('🚀 PDF MCP Server setup complete!');
    console.log('   Run "npm run build" to compile the server');
    console.log('   Run "npm start" to start the server\n');

    if (!pythonSuccess || !systemSuccess) {
        console.log('💡 Note: The server will work with basic PDF reading even without');
        console.log('   the optional dependencies. Enhanced features will be disabled gracefully.\n');
    }
}

if (require.main === module) {
    main();
}
