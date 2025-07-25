# Contributing to PDF MCP Server

Thank you for your interest in contributing to the PDF MCP Server! This project enables GitHub Copilot and other AI assistants to read and analyze PDF documents through the Model Context Protocol.

## 🤝 How to Contribute

### Types of Contributions Welcome

- **Bug fixes** - Fix issues with PDF parsing, error handling, or MCP protocol compliance
- **Feature enhancements** - Add new PDF analysis capabilities, improve text extraction, etc.
- **Documentation** - Improve setup guides, API documentation, or usage examples
- **Testing** - Add test cases, improve test coverage, or test with different PDF types
- **Performance** - Optimize PDF processing, reduce memory usage, or improve response times

## 🚀 Getting Started

### Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/pdf-mcp-server.git
   cd pdf-mcp-server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install system dependencies** (for enhanced features)
   ```bash
   # Ubuntu/Debian
   sudo apt-get install -y poppler-utils tesseract-ocr python3-pip
   pip3 install pdfplumber

   # macOS
   brew install poppler tesseract python
   pip install pdfplumber
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

5. **Test your installation**
   ```bash
   node dist/enhanced-index.js --test
   ```

### Project Structure

```
pdf-mcp-server/
├── src/
│   ├── enhanced-index.ts    # Main MCP server implementation
│   └── index.ts            # Basic PDF reader (legacy)
├── dist/                   # Compiled JavaScript output
├── test-pdfs/             # Sample PDFs for testing
├── package.json           # Node.js package configuration
├── tsconfig.json          # TypeScript configuration
└── README.md              # Main documentation
```

## 🔧 Development Guidelines

### Code Style

- **TypeScript**: Use strict typing and proper interfaces
- **Error Handling**: Always handle PDF parsing errors gracefully
- **Logging**: Use `console.error()` for debugging (never `console.log()` as it breaks JSON-RPC)
- **MCP Protocol**: Follow the official MCP specification for tool definitions

### Key Principles

1. **Fail Gracefully**: PDF parsing can be unpredictable - always provide meaningful error messages
2. **Validate Inputs**: Use Zod schemas for all tool inputs
3. **Memory Efficient**: Be mindful of memory usage when processing large PDFs
4. **Platform Compatible**: Ensure features work across Windows, macOS, and Linux

### Example Code Pattern

```typescript
import { z } from 'zod';

// Define input schema
const ReadPdfInputSchema = z.object({
  filename: z.string(),
  maxPages: z.number().optional().default(10)
});

// Implement tool handler
async function handleReadPdf(args: z.infer<typeof ReadPdfInputSchema>) {
  try {
    // Validate input
    const { filename, maxPages } = ReadPdfInputSchema.parse(args);
    
    // Process PDF
    const result = await processPdf(filename, maxPages);
    
    return {
      content: [{
        type: "text",
        text: result
      }]
    };
  } catch (error) {
    console.error(`PDF processing error: ${error.message}`);
    throw new Error(`Failed to read PDF: ${error.message}`);
  }
}
```

## 🧪 Testing

### Running Tests

```bash
# Build the project
npm run build

# Test basic PDF reading
node test-basic.js

# Test enhanced features
node test-enhanced.js
```

### Adding Tests

When adding new features, please include tests:

1. Add sample PDFs to `test-pdfs/` directory
2. Create test scripts that verify your feature works
3. Test edge cases (empty PDFs, corrupted files, large files)

### Manual Testing with VS Code

1. **Update VS Code settings** to use your local build:
   ```json
   {
     "mcp.servers": {
       "pdf-reader": {
         "command": "node",
         "args": ["/absolute/path/to/pdf-mcp-server/dist/enhanced-index.js"],
         "cwd": "/path/to/test/pdfs"
       }
     }
   }
   ```

2. **Test with GitHub Copilot** by asking it to read your test PDFs
3. **Check VS Code Developer Console** for any MCP protocol errors

## 📋 Pull Request Process

### Before Submitting

1. **Test your changes** thoroughly
2. **Update documentation** if you've added new features
3. **Follow commit message conventions**:
   ```
   feat: add table extraction with pdfplumber
   fix: handle corrupted PDF files gracefully
   docs: update installation guide for Windows
   ```

### PR Template

Please include in your pull request:

- **Description**: What does this PR do?
- **Motivation**: Why is this change needed?
- **Testing**: How did you test this change?
- **Breaking Changes**: Does this break existing functionality?

### Review Process

1. All PRs require at least one review
2. Automated tests must pass
3. New features should include documentation updates
4. Maintain backward compatibility when possible

## 🐛 Reporting Issues

### Bug Reports

Include the following information:

- **PDF Type**: What kind of PDF caused the issue?
- **Error Message**: Full error message and stack trace
- **Environment**: OS, Node.js version, VS Code version
- **Steps to Reproduce**: Minimal example to reproduce the bug

### Feature Requests

- **Use Case**: Describe the problem you're trying to solve
- **Proposed Solution**: How do you think it should work?
- **Alternatives**: What other approaches have you considered?

## 🔍 Architecture Overview

### MCP Integration

The server implements the Model Context Protocol to provide tools that AI assistants can use:

```typescript
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "read_pdf",
      description: "Extract text content from PDF files",
      inputSchema: ReadPdfInputSchema
    },
    // ... other tools
  ]
}));
```

### PDF Processing Pipeline

1. **Validation**: Check file exists and is readable
2. **Text Extraction**: Use pdf-parse for basic text
3. **Enhanced Processing**: Use pdfplumber for tables, poppler for images
4. **Result Formatting**: Return structured data to MCP client

### Error Handling Strategy

- **Graceful Degradation**: If enhanced features fail, fall back to basic text extraction
- **Detailed Logging**: Log errors to stderr for debugging
- **User-Friendly Messages**: Return helpful error messages to the AI assistant

## 📚 Resources

- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [pdf-parse Documentation](https://www.npmjs.com/package/pdf-parse)
- [pdfplumber Documentation](https://github.com/jsvine/pdfplumber)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 💬 Community

- **Discussions**: Use GitHub Discussions for questions and ideas
- **Issues**: Use GitHub Issues for bugs and feature requests
- **Discord**: Join our community Discord (link in README)

## 🎉 Recognition

Contributors will be acknowledged in:
- README.md contributor section
- Release notes for their contributions
- Special mentions for significant improvements

Thank you for helping make PDF content accessible to AI assistants everywhere! 🚀
