# MCP Configuration for PDF Reading

This Enhanced PDF MCP Server is now ready to use! Here's how to configure it with different MCP clients:

## What We Built

✅ **4 PDF Processing Tools**:
1. **`read_pdf`** - Extract text content from PDFs
2. **`extract_pdf_tables`** - Find and extract table data  
3. **`extract_pdf_images`** - Extract images and perform OCR
4. **`analyze_pdf_structure`** - Comprehensive document analysis

✅ **Your PDFs Analyzed**:
- **Proteith Business Plan**: 22 pages, 48,955 characters, business plan structure detected
- **Proteith SEP Document**: 16 pages, 11,533 characters, soldier readiness presentation

## Claude Desktop Configuration

Add this to your Claude Desktop config file (`~/.config/claude-desktop/config.json`):

```json
{
  "mcpServers": {
    "pdf-reader": {
      "command": "node",
      "args": ["/home/gdeckard/Documents/pdf_mcp/dist/enhanced-index.js"],
      "cwd": "/home/gdeckard/Documents/pdf_mcp",
      "env": {}
    }
  }
}
```

## VS Code with GitHub Copilot Configuration

For VS Code, you can configure the MCP server in your workspace or global settings. Add to `.vscode/settings.json`:

```json
{
  "mcp.servers": {
    "pdf-reader": {
      "command": "node",
      "args": ["/home/gdeckard/Documents/pdf_mcp/dist/enhanced-index.js"],
      "cwd": "/home/gdeckard/Documents/pdf_mcp"
    }
  }
}
```

## Usage Examples

Once configured, you can ask your AI assistant to:

### Basic Text Extraction
- "Read the first 5 pages of the Proteith business plan"
- "Extract all text from the SEP presentation" 
- "Summarize the executive summary from the business plan PDF"

### Table Analysis  
- "Find all tables in the Proteith business plan"
- "Extract financial data tables from the PDF"
- "Show me any pricing tables in the documents"

### Image Processing
- "Extract all images from the SEP presentation"
- "Use OCR to read text from charts in the PDF"
- "Find and analyze any diagrams in the business plan"

### Document Structure
- "Analyze the structure of the business plan PDF"
- "What sections are in the SEP document?"
- "Give me an overview of both PDF documents"

## Enhanced Capabilities (Optional)

To enable advanced table extraction and image OCR, install these tools:

### For Better Table Extraction
```bash
pip install pdfplumber
```

### For Image Extraction and OCR
```bash
# Ubuntu/Debian
sudo apt-get install poppler-utils tesseract-ocr

# macOS  
brew install poppler tesseract

# Or use our convenience script
npm run install-extras
```

## Testing the Server

You can test the server directly:

```bash
# Start the server
node dist/enhanced-index.js

# Or run our test script
node test-direct.js
```

## Sample MCP Requests

The server accepts these JSON-RPC requests:

### List Tools
```json
{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}
```

### Read PDF
```json
{
  "jsonrpc":"2.0",
  "id":2,
  "method":"tools/call",
  "params":{
    "name":"read_pdf",
    "arguments":{
      "file_path":"./Proteith Business Plan 6..4.2025.pdf",
      "max_pages":3
    }
  }
}
```

### Extract Tables
```json
{
  "jsonrpc":"2.0",
  "id":3,
  "method":"tools/call",
  "params":{
    "name":"extract_pdf_tables",
    "arguments":{
      "file_path":"./Proteith Business Plan 6..4.2025.pdf"
    }
  }
}
```

## Troubleshooting

### Common Issues

1. **Server not starting**: Check that Node.js and dependencies are installed
2. **PDF not found**: Use absolute paths or ensure PDFs are in the working directory
3. **Limited table extraction**: Install pdfplumber for better results
4. **No image extraction**: Install poppler-utils

### Debug Mode
The server logs to stderr, so you can see what's happening:
```bash
node dist/enhanced-index.js 2>debug.log
```

## File Structure
```
pdf_mcp/
├── src/
│   ├── index.ts              # Basic PDF reader
│   └── enhanced-index.ts     # Full-featured version ⭐
├── dist/                     # Compiled JavaScript
├── Proteith Business Plan 6..4.2025.pdf
├── Proteith SEP F 1.28.25-2.pdf  
├── package.json
├── README.md
└── test-direct.js           # Validation script
```

Your Enhanced PDF MCP Server is ready! 🎉
