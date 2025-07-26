# PDF MCP Server Setup Guide

## Overview

This guide provides step-by-step instructions for setting up the PDF MCP Server with all advanced features. The server uses a Python virtual environment to avoid system package conflicts and provides graceful fallbacks for optional features.

## Prerequisites

- Node.js 16.0.0 or higher
- Python 3.x (for enhanced table extraction)
- Package manager access for system dependencies (optional)

## Installation

### Quick Setup

```bash
# Clone the repository
git clone https://github.com/gmdeckard/pdf-mcp-server.git
cd pdf-mcp-server

# Install and build (creates Python venv automatically)
npm install
npm run build
```

The installation process will:
1. Install all Node.js dependencies
2. Create a Python virtual environment in ./venv/
3. Install pdfplumber in the virtual environment for enhanced table extraction
4. Attempt to install system dependencies (poppler-utils, tesseract-ocr)
5. Build the TypeScript server

### Manual System Dependencies (if automatic installation fails)

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install poppler-utils tesseract-ocr
```

**macOS:**
```bash
brew install poppler tesseract
```

**Windows:**
- Install poppler: Download from https://poppler.freedesktop.org/
- Install tesseract: Download from https://github.com/UB-Mannheim/tesseract/wiki

## Verification

Test your installation:
```bash
# Start the server
npm start

# Test with a sample PDF (if you have one)
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "read_pdf", "arguments": {"file_path": "your-file.pdf", "max_pages": 1}}}' | node dist/enhanced-index.js
```

## Feature Availability

The server works with graceful degradation:

**Always Available:**
- Basic PDF text extraction using pdf-parse
- Password-protected PDF support
- File validation and error handling

**Enhanced Features (with dependencies):**

✅ **Basic PDF reading** - Extract text from standard PDFs  
✅ **Password-protected PDFs** - Handle encrypted documents  
✅ **Enhanced table extraction** - Advanced table detection with pdfplumber  
✅ **OCR capabilities** - Extract text from scanned documents and images  
✅ **Image extraction** - Extract embedded images from PDFs  
✅ **Memory optimization** - Handle large files efficiently  

## Troubleshooting

### Python Dependencies
If pdfplumber installation fails:
```bash
pip3 install pdfplumber
# or
python -m pip install pdfplumber
```

### System Dependencies
If system packages fail to install, the server will still work with basic PDF reading capabilities. Enhanced features will be gracefully disabled.

### Permission Issues
On Linux, you may need to run system dependency installation with sudo:
```bash
sudo apt-get install poppler-utils tesseract-ocr
```

## Next Steps

After installation, configure your AI assistant (VS Code, Claude Desktop) to use the PDF MCP Server as described in the main README.md file.
