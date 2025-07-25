# Universal VS Code Installation Guide

This guide shows how to install and configure the PDF MCP Server for use with GitHub Copilot across any VS Code installation.

## 🚀 Global Installation

### Method 1: NPM (Recommended)
```bash
# Install globally via npm
npm install -g pdf-mcp-server

# Verify installation
pdf-mcp-server --version
```

### Method 2: Manual Installation
```bash
# Clone the repository
git clone https://github.com/your-username/pdf-mcp-server.git
cd pdf-mcp-server

# Install dependencies and build
npm install
npm run build

# Create global symlink (optional)
npm link
```

## ⚙️ VS Code Configuration

### Global Configuration
Add to your **global** VS Code settings (`Ctrl+Shift+P` → "Preferences: Open Settings (JSON)"):

```json
{
  "mcp.servers": {
    "pdf-reader": {
      "command": "pdf-mcp-server"
    }
  }
}
```

### Workspace-Specific Configuration
For project-specific setups, add to `.vscode/settings.json` in your workspace:

```json
{
  "mcp.servers": {
    "pdf-reader": {
      "command": "pdf-mcp-server",
      "cwd": "${workspaceFolder}",
      "description": "PDF reader for this workspace"
    }
  }
}
```

### Advanced Configuration Options

```json
{
  "mcp.servers": {
    "pdf-reader": {
      "command": "pdf-mcp-server",
      "cwd": "/path/to/your/pdfs",
      "env": {
        "PDF_MAX_PAGES": "50",
        "PDF_ENABLE_OCR": "true"
      },
      "description": "Enhanced PDF reader with OCR"
    }
  }
}
```

## 🔧 Enhanced Capabilities Setup

### System Dependencies
Install optional dependencies for advanced features:

#### Ubuntu/Debian
```bash
sudo apt-get update
sudo apt-get install -y poppler-utils tesseract-ocr python3-pip
pip3 install pdfplumber
```

#### macOS
```bash
brew install poppler tesseract python
pip install pdfplumber
```

#### Windows (WSL recommended)
```bash
# In WSL Ubuntu
sudo apt-get install -y poppler-utils tesseract-ocr python3-pip
pip3 install pdfplumber
```

### Verify Enhanced Setup
```bash
# Test enhanced capabilities
pdf-mcp-server --test-enhanced
```

## 📋 Usage Examples

Once configured, you can ask GitHub Copilot:

### Basic Text Extraction
- *"Read the PDF in my current folder and summarize it"*
- *"Extract the first 3 pages from document.pdf"*
- *"What does the executive summary say in the business plan PDF?"*

### Advanced Features
- *"Find all tables in the financial report and extract the data"*
- *"What images are in this PDF and what do they contain?"*
- *"Analyze the structure of this research paper"*

### Workspace Integration
- *"Read all PDFs in this project and create a summary"*
- *"Extract quotes from the research papers in the /docs folder"*
- *"Compare the data in these two PDF reports"*

## 🛠️ Troubleshooting

### Common Issues

#### 1. Command Not Found
```bash
# Check if globally installed
npm list -g pdf-mcp-server

# Or use full path
"command": "/usr/local/bin/pdf-mcp-server"
```

#### 2. Permission Issues
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

#### 3. Enhanced Features Not Working
```bash
# Verify Python dependencies
python3 -c "import pdfplumber; print('OK')"

# Verify system tools
which pdfimages tesseract
```

#### 4. PDF Files Not Found
Make sure your `cwd` setting points to the directory containing your PDFs:
```json
{
  "mcp.servers": {
    "pdf-reader": {
      "command": "pdf-mcp-server",
      "cwd": "/absolute/path/to/pdf/folder"
    }
  }
}
```

### Debug Mode
Enable debug logging in VS Code settings:
```json
{
  "mcp.debug": true,
  "mcp.servers": {
    "pdf-reader": {
      "command": "pdf-mcp-server",
      "args": ["--debug"]
    }
  }
}
```

## 🔄 Updates

### Update Global Installation
```bash
npm update -g pdf-mcp-server
```

### Update Local Installation
```bash
cd pdf-mcp-server
git pull
npm install
npm run build
```

## 📁 Project Structure for Distribution

```
your-project/
├── pdfs/                    # Your PDF files
│   ├── document1.pdf
│   └── document2.pdf
├── .vscode/
│   └── settings.json        # MCP server configuration
└── README.md
```

## 🌍 Environment Variables

You can customize behavior using environment variables:

```bash
export PDF_MAX_PAGES=20        # Default max pages to process
export PDF_ENABLE_OCR=true     # Enable OCR by default
export PDF_CACHE_DIR=/tmp/pdf  # Cache directory for processing
```

Or in VS Code settings:
```json
{
  "mcp.servers": {
    "pdf-reader": {
      "command": "pdf-mcp-server",
      "env": {
        "PDF_MAX_PAGES": "20",
        "PDF_ENABLE_OCR": "true"
      }
    }
  }
}
```

## 🚀 Next Steps

1. **Test the installation** with a simple PDF
2. **Configure workspace** settings for your projects
3. **Install enhanced dependencies** for full functionality
4. **Explore advanced features** with complex PDFs

Your PDF MCP Server is now ready for universal use across all your VS Code projects! 🎉
