# Contributing

Thank you for your interest in contributing to the PDF MCP Server!

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/pdf-mcp-server.git`
3. Install dependencies: `npm install`
4. Build the project: `npm run build`
5. Make your changes
6. Test your changes
7. Submit a pull request

## Development Setup

### Required
- Node.js 16.0.0 or higher
- npm

### Optional (for enhanced features)
- Python 3 with pdfplumber: `pip install pdfplumber`
- poppler-utils: `sudo apt install poppler-utils` (Ubuntu) or `brew install poppler` (macOS)
- tesseract-ocr: `sudo apt install tesseract-ocr` (Ubuntu) or `brew install tesseract` (macOS)

## Project Structure

```
src/
├── enhanced-index.ts     # Main server implementation
└── ...

dist/                     # Compiled JavaScript
package.json
README.md
SETUP.md
```

## Pull Request Guidelines

- Keep changes focused and small
- Include tests if applicable
- Update documentation as needed
- Follow the existing code style
- Write clear commit messages

## Reporting Issues

Please use GitHub Issues to report bugs or request features. Include:
- Clear description of the issue
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Your environment details (OS, Node.js version, etc.)

## Questions?

Open a GitHub Discussion or create an issue for questions about contributing.

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
