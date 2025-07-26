# PDF MCP Server Setup Guide

## Overview

This guide provides step-by-step instructions for setting up the PDF MCP Server with all advanced features enabled by default.

## Prerequisites

- Node.js 16.0.0 or higher
- Python 3.x (for enhanced table extraction)
- Package manager access (for system dependencies)

## Installation Options

### Option 1: Automated Setup (Recommended)

```bash
# Clone the repository
git clone https://github.com/gmdeckard/pdf-mcp-server.git
cd pdf-mcp-server

# Run complete setup
npm run setup
```

This single command will:
1. Install all Node.js dependencies
2. Install Python pdfplumber for enhanced table extraction
3. Install system tools (poppler-utils, tesseract-ocr) for OCR
4. Build the TypeScript server

### Option 2: Manual Step-by-Step Setup

#### Step 1: Node.js Dependencies
```bash
npm install
```

#### Step 2: Python Dependencies
```bash
# Install pdfplumber for enhanced table extraction
pip install pdfplumber
```

#### Step 3: System Dependencies

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
- Install tesseract: Download from https://github.com/tesseract-ocr/tesseract

#### Step 4: Build Server
```bash
npm run build
```

## Verification

Test your installation:
```bash
# Start the server
npm start

# The server should start without errors and display:
# "PDF MCP Server v2.0 running with enhanced features"
```

## Features Enabled

With complete installation, you get:

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
