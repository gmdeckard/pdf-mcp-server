# PDF MCP Server

A comprehensive Model Context Protocol (MCP) server that enables AI assistants like GitHub Copilot and Claude Desktop to read, analyze, and extract content from PDF files including text, tables, images, and document structure.

## 🚀 Features

### Core Capabilities (Zero Setup Required)
- ✅ **Text Extraction**: Extract and read text content from PDF files
- ✅ **Table Detection**: Identify table-like structures using text pattern analysis
- ✅ **Document Structure Analysis**: Analyze PDF metadata, page count, and content organization
- ✅ **Page-Specific Processing**: Extract content from specific pages or page ranges

### Enhanced Capabilities (With Optional Dependencies)
- 🔥 **Advanced Table Extraction**: Extract structured tables using pdfplumber
- 🖼️ **Image Extraction**: Extract images using poppler-utils  
- 👁️ **OCR Processing**: Extract text from images using Tesseract OCR
- 📊 **Comprehensive Analysis**: Full document structure analysis with all capabilities

## 📦 Installation

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

## 🛠️ Usage

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

## 🔧 Available Tools

### 1. `read_pdf`
Extract text content from PDF files with optional page limits.

```json
{
  "name": "read_pdf",
  "arguments": {
    "file_path": "./document.pdf",
    "max_pages": 5
  }
}
```

### 2. `extract_pdf_tables`  
Extract structured table data from PDF files.

```json
{
  "name": "extract_pdf_tables",
  "arguments": {
    "file_path": "./report.pdf",
    "page_numbers": [1, 2, 3]
  }
}
```

### 3. `extract_pdf_images`
Extract images and optionally perform OCR.

```json
{
  "name": "extract_pdf_images", 
  "arguments": {
    "file_path": "./diagram.pdf",
    "ocr_enabled": true
  }
}
```

### 4. `analyze_pdf_structure`
Comprehensive document structure analysis.

```json
{
  "name": "analyze_pdf_structure",
  "arguments": {
    "file_path": "./document.pdf"
  }
}
```

## 💡 Example Prompts

Once configured, ask your AI assistant:

- *"Read this PDF and summarize the main points"*
- *"Extract all tables from this financial report"*  
- *"What images are in this PDF and what do they contain?"*
- *"Analyze the structure of this research paper"*
- *"Find all references to 'machine learning' in these PDFs"*

## 🏗️ Architecture

```
PDF MCP Server
├── Text Extraction (pdf-parse)
├── Table Detection (text patterns + pdfplumber)  
├── Image Processing (poppler-utils + tesseract)
├── Document Analysis (metadata + structure)
└── MCP Protocol Interface (@modelcontextprotocol/sdk)
```

## 🔧 Development

### Project Structure
```
src/
├── index.ts              # Basic PDF reader
├── enhanced-index.ts     # Full-featured server
└── test.ts              # Test utilities

dist/                     # Compiled JavaScript
.vscode/                  # VS Code configuration
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
```

## 📋 Requirements

- **Node.js**: 16.0.0 or higher
- **Operating System**: Linux, macOS, or Windows with WSL

### Optional Dependencies
- **Python 3** with pdfplumber (for advanced table extraction)
- **poppler-utils** (for image extraction)
- **tesseract-ocr** (for OCR capabilities)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/sdk)
- PDF parsing powered by [pdf-parse](https://github.com/modesty/pdf-parse)
- Enhanced table extraction via [pdfplumber](https://github.com/jsvine/pdfplumber)
- OCR capabilities through [Tesseract](https://github.com/tesseract-ocr/tesseract)

## 🐛 Issues & Support

- **Bug Reports**: [GitHub Issues](https://github.com/your-username/pdf-mcp-server/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/your-username/pdf-mcp-server/discussions)
- **Documentation**: [Setup Guide](SETUP.md)

---

**Made with ❤️ for the MCP and AI assistant community**

## Tools Available

### 1. `read_pdf`
Extract and read text content from a PDF file.

**Parameters:**
- `file_path` (required): Path to the PDF file
- `max_pages` (optional): Limit extraction to specific number of pages

**Example:**
```json
{
  "name": "read_pdf",
  "arguments": {
    "file_path": "./document.pdf",
    "max_pages": 5
  }
}
```

### 2. `extract_pdf_tables`
Extract structured table data from a PDF file.

**Parameters:**
- `file_path` (required): Path to the PDF file
- `page_numbers` (optional): Array of specific page numbers to process

**Example:**
```json
{
  "name": "extract_pdf_tables", 
  "arguments": {
    "file_path": "./report.pdf",
    "page_numbers": [1, 2, 3]
  }
}
```

### 3. `extract_pdf_images`
Extract images from a PDF and optionally perform OCR.

**Parameters:**
- `file_path` (required): Path to the PDF file
- `page_numbers` (optional): Array of specific page numbers to process
- `ocr_enabled` (optional): Whether to perform OCR on images (default: false)

**Example:**
```json
{
  "name": "extract_pdf_images",
  "arguments": {
    "file_path": "./diagram.pdf",
    "ocr_enabled": true
  }
}
```

### 4. `analyze_pdf_structure`
Perform comprehensive analysis of PDF structure.

**Parameters:**
- `file_path` (required): Path to the PDF file
- `include_text` (optional): Include text analysis (default: true)
- `include_images` (optional): Include image analysis (default: true)
- `include_tables` (optional): Include table analysis (default: true)

**Example:**
```json
{
  "name": "analyze_pdf_structure",
  "arguments": {
    "file_path": "./document.pdf",
    "include_text": true,
    "include_images": true,
    "include_tables": true
  }
}
```

## Usage

### Running the Server

#### Basic Version
```bash
npm run start
```

#### Enhanced Version (with all features)
```bash
npm run start-enhanced
```

### MCP Client Configuration

Add to your MCP client configuration (e.g., for Claude Desktop):

```json
{
  "mcpServers": {
    "pdf-reader": {
      "command": "node",
      "args": ["/path/to/pdf_mcp/dist/enhanced-index.js"],
      "cwd": "/path/to/pdf_mcp"
    }
  }
}
```

## External Tool Dependencies

### Table Extraction
- **pdfplumber** (Python): `pip install pdfplumber`
  - Provides advanced table detection and extraction
  - Fallback: Basic text-pattern table detection

### Image Processing
- **poppler-utils**: Contains `pdfimages` for image extraction
  - Ubuntu/Debian: `sudo apt-get install poppler-utils`
  - macOS: `brew install poppler`
  - Windows: Download from https://poppler.freedesktop.org/

### OCR (Optical Character Recognition)
- **tesseract-ocr**: For extracting text from images
  - Ubuntu/Debian: `sudo apt-get install tesseract-ocr`
  - macOS: `brew install tesseract`
  - Windows: Download from https://github.com/tesseract-ocr/tesseract

## Capabilities and Limitations

### What Works Well
- ✅ Text extraction from text-based PDFs
- ✅ Basic table detection from structured text
- ✅ PDF metadata and structure analysis
- ✅ Image extraction from PDFs
- ✅ OCR on extracted images
- ✅ Advanced table extraction with pdfplumber

### Limitations
- ❌ Complex table extraction without external tools
- ❌ Scanned PDFs require OCR for text extraction
- ❌ Image analysis (beyond OCR) is limited
- ❌ Password-protected PDFs not supported
- ❌ Very large PDFs may have memory constraints

## Error Handling

The server includes comprehensive error handling:
- File validation (existence, PDF format)
- Graceful degradation when external tools are unavailable
- Clear error messages for troubleshooting
- Proper JSON-RPC error responses

## Development

### Project Structure
```
src/
├── index.ts              # Basic PDF reader
├── enhanced-index.ts     # Full-featured version
└── ...

dist/                     # Compiled JavaScript
package.json
tsconfig.json
README.md
```

### Building
```bash
npm run build
```

### Development Mode
```bash
npm run dev  # Watch mode
```

## Troubleshooting

### Common Issues

1. **"Command not found" errors**
   - Install missing external tools (poppler-utils, tesseract-ocr)
   - Check PATH includes installed tools

2. **Python pdfplumber errors**
   - Install: `pip install pdfplumber`
   - Ensure Python 3 is available as `python3`

3. **OCR not working**
   - Install tesseract-ocr
   - Check tesseract is in PATH: `which tesseract`

4. **Large PDF memory issues**
   - Use `max_pages` parameter to limit processing
   - Process specific pages with `page_numbers` parameter

### Debug Logging
The server logs to stderr (not stdout to avoid corrupting JSON-RPC). Check your MCP client's error logs for diagnostic information.

## License

ISC
