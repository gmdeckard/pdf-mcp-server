# PDF MCP Server

A Model Context Protocol (MCP) server that enables AI assistants like GitHub Copilot and Claude Desktop to read and analyze PDF files with advanced features including password support, OCR, and enhanced table extraction.

## Features

- Extract text from PDF files
- Support for password-protected PDFs
- Extract tables with enhanced detection using pdfplumber
- Extract images and perform OCR on scanned documents using tesseract
- Analyze PDF structure and metadata
- Memory optimization for large files
- Automatic Python virtual environment setup
- Cross-platform support (Linux, macOS, Windows including VS Code on Windows)
- Graceful degradation when optional dependencies are unavailable

## Quick Start

### Installation

Works on all platforms including VS Code on Windows:

```bash
# Clone the repository
git clone https://github.com/gmdeckard/pdf-mcp-server.git
cd pdf-mcp-server

# Install all dependencies (creates Python venv automatically)
npm install

# Build the server
npm run build
```

The installation automatically:
- Creates a Python virtual environment in ./venv/ (Windows: venv\Scripts\, Unix: venv/bin/)
- Installs pdfplumber for enhanced table extraction
- Attempts to install system dependencies (poppler-utils, tesseract-ocr)
- Falls back gracefully if optional dependencies cannot be installed

### Manual System Dependencies (if needed)

If the automatic installation fails for system dependencies:

```bash
# Ubuntu/Debian:
sudo apt-get install poppler-utils tesseract-ocr

# macOS:
brew install poppler tesseract

# Windows (including VS Code on Windows):
# Install poppler: https://github.com/oschwartz10612/poppler-windows
# Install tesseract: https://github.com/UB-Mannheim/tesseract/wiki
# Note: Basic PDF reading works without these
```
npm run build
```

### 3. Configure Your AI Assistant

**For GitHub Copilot (VS Code):**

Add to your VS Code `settings.json`:
```json
{
  "mcp.servers": {
    "pdf-reader": {
      "command": "node",
      "args": ["/path/to/pdf-mcp-server/dist/enhanced-index.js"],
      "cwd": "/path/to/your/pdfs"
    }
  }
}
```

**For Claude Desktop:**

Add to `~/.config/claude-desktop/config.json`:
```json
{
  "mcpServers": {
    "pdf-reader": {
      "command": "node",
      "args": ["/path/to/pdf-mcp-server/dist/enhanced-index.js"],
      "cwd": "/path/to/your/pdfs"
    }
  }
}
```

## Usage

Once configured, you can ask your AI assistant:

- "Read this PDF and summarize it"
- "Extract all tables from this document"
- "What images are in this PDF?"
- "Analyze the structure of this document"

## Available Tools

### read_pdf
Extract text content from PDF files.

```json
{
  "name": "read_pdf",
  "arguments": {
    "file_path": "./document.pdf",
    "max_pages": 10,
    "password": "optional_password"
  }
}
```

### extract_pdf_tables
Extract tables from PDF files.

```json
{
  "name": "extract_pdf_tables",
  "arguments": {
    "file_path": "./report.pdf",
    "page_numbers": [1, 2, 3],
    "password": "optional_password"
  }
}
```

### extract_pdf_images
Extract images and perform OCR.

```json
{
  "name": "extract_pdf_images",
  "arguments": {
    "file_path": "./document.pdf",
    "ocr_enabled": true,
    "password": "optional_password"
  }
}
```

### analyze_pdf_structure
Analyze PDF structure and metadata.

```json
{
  "name": "analyze_pdf_structure",
  "arguments": {
    "file_path": "./document.pdf",
    "include_text": true,
    "include_images": true,
    "include_tables": true,
    "password": "optional_password"
  }
}
```

## Requirements

- Node.js 16.0.0 or higher
- Optional: Python 3 with pdfplumber for advanced table extraction
- Optional: poppler-utils and tesseract-ocr for image processing and OCR

## License

MIT

## Installation

### Quick Start (npm)
```bash
npm install -g pdf-mcp-server
```

### From Source
```bash
git clone https://github.com/your-username/pdf-mcp-server.git
cd pdf-mcp-server
npm install
npm run build
```

### Enhanced Features Setup
For advanced table extraction and image processing:

```bash
# Install Python dependencies for table extraction
pip install pdfplumber

# Install system tools for image extraction and OCR
# Ubuntu/Debian:
sudo apt-get install -y poppler-utils tesseract-ocr

# macOS:
brew install poppler tesseract

# Or use our convenience script:
npm run install-extras
```

## Usage

### With GitHub Copilot (VS Code)

Add to your VS Code `settings.json`:
```json
{
  "mcp.servers": {
    "pdf-reader": {
      "command": "pdf-mcp-server",
      "cwd": "/path/to/your/pdfs"
    }
  }
}
```

### With Claude Desktop

Add to your Claude Desktop config (`~/.config/claude-desktop/config.json`):
```json
{
  "mcpServers": {
    "pdf-reader": {
      "command": "pdf-mcp-server",
      "cwd": "/path/to/your/pdfs"
    }
  }
}
```

### Direct Usage
```bash
# Start the MCP server
pdf-mcp-server

# Or run locally
node dist/enhanced-index.js
```

## Available Tools

### 1. `read_pdf`
Extract text content from PDF files with password support and automatic OCR.

```json
{
  "name": "read_pdf",
  "arguments": {
    "file_path": "./document.pdf",
    "max_pages": 5,
    "password": "optional_password"
  }
}
```

### 2. `extract_pdf_tables`  
Extract structured table data from PDF files with enhanced detection.

```json
{
  "name": "extract_pdf_tables",
  "arguments": {
    "file_path": "./report.pdf",
    "page_numbers": [1, 2, 3],
    "password": "optional_password"
  }
}
```

### 3. `extract_pdf_images`
Extract images and optionally perform OCR on them.

```json
{
  "name": "extract_pdf_images", 
  "arguments": {
    "file_path": "./diagram.pdf",
    "ocr_enabled": true,
    "password": "optional_password"
  }
}
```

### 4. `analyze_pdf_structure`
Comprehensive document structure analysis with configurable options.

```json
{
  "name": "analyze_pdf_structure",
  "arguments": {
    "file_path": "./document.pdf",
    "include_text": true,
    "include_images": true,
    "include_tables": true,
    "password": "optional_password"
  }
}
```

## Example Prompts

Once configured, ask your AI assistant:

- *"Read this PDF and summarize the main points"*
- *"Extract all tables from this financial report"*  
- *"What images are in this PDF and what do they contain?"*
- *"Analyze the structure of this research paper"*
- *"Find all references to 'machine learning' in these PDFs"*
- *"Read this password-protected PDF using password: mypassword"*

## What's New in v2.0

**Enhanced Password Support**: All tools now support password-protected PDFs through an optional `password` parameter.

**Automatic OCR Fallback**: When no text is found in a PDF (common with scanned documents), the server automatically attempts OCR extraction using tesseract.

**Advanced Table Detection**: Improved text-based table detection algorithms with better pattern recognition for currency, percentages, and structured data.

**Memory Optimization**: Large PDF files (>50MB) are now processed with memory optimization techniques to prevent crashes.

**Enhanced Error Handling**: Better error messages and graceful degradation when optional dependencies are missing.

**Dual Processing Methods**: Tables can be extracted using both enhanced text analysis and pdfplumber (when available) for maximum compatibility.
## Architecture

```
PDF MCP Server v2.0
├── Text Extraction (pdf-parse + password support)
├── Table Detection (enhanced patterns + pdfplumber)  
├── Image Processing (poppler-utils + tesseract OCR)
├── Document Analysis (metadata + structure + optimization)
└── MCP Protocol Interface (@modelcontextprotocol/sdk)
```

## Development

### Project Structure
```
src/
├── index.ts              # Basic PDF reader (legacy)
├── enhanced-index.ts     # Full-featured server v2.0
└── test.ts              # Test utilities

dist/                     # Compiled JavaScript
test-enhanced.js          # Enhanced server test
ENHANCEMENT_COMPLETE.md   # v2.0 upgrade documentation
README.md
package.json
tsconfig.json
```

### Building
```bash
npm run build
```

### Development Mode
```bash
npm run dev  # Watch mode with auto-rebuild
```

### Testing
```bash
npm test

# Test enhanced server
node test-enhanced.js
```

## Requirements

- **Node.js**: 16.0.0 or higher
- **Operating System**: Linux, macOS, or Windows with WSL

### Optional Dependencies
- **Python 3** with pdfplumber (for advanced table extraction)
- **poppler-utils** (for image extraction)
- **tesseract-ocr** (for OCR capabilities)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/sdk)
- PDF parsing powered by [pdf-parse](https://github.com/modesty/pdf-parse)
- Enhanced table extraction via [pdfplumber](https://github.com/jsvine/pdfplumber)
- OCR capabilities through [Tesseract](https://github.com/tesseract-ocr/tesseract)

## Issues & Support

- **Bug Reports**: [GitHub Issues](https://github.com/your-username/pdf-mcp-server/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/your-username/pdf-mcp-server/discussions)
- **Documentation**: [Setup Guide](SETUP.md)

---

**Made for the MCP and AI assistant community**
