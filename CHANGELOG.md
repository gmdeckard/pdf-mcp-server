# Changelog

All notable changes to the PDF MCP Server will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-07-26

### Added
- **Password-protected PDF support**: All tools now accept an optional `password` parameter for encrypted PDFs
- **Automatic OCR fallback**: When no text is found in PDFs (scanned documents), the server automatically attempts OCR extraction  
- **Enhanced table detection**: Improved text-based algorithms with better pattern recognition for currency, percentages, and structured data
- **Memory optimization**: Large PDF files (>50MB) are processed with memory optimization techniques and chunking recommendations
- **Dual processing methods**: Tables can be extracted using both enhanced text analysis and pdfplumber for maximum compatibility
- **Comprehensive testing**: Added `test-enhanced.js` for testing all v2.0 features
- **Enhanced documentation**: Updated README with v2.0 features, removed fancy icons, added clear examples

### Enhanced  
- **Error handling**: Better error messages and graceful degradation when optional dependencies are missing
- **Tool descriptions**: More detailed parameter descriptions and usage examples for all tools
- **File validation**: Improved file path validation and error reporting with specific PDF format checking
- **Performance**: Better handling of large files with size warnings and processing optimization
- **TypeScript implementation**: Enhanced type safety and better error handling throughout

### Fixed
- **Password error detection**: Specific handling for password-related PDF parsing errors with user-friendly messages
- **OCR integration**: More robust OCR processing with proper cleanup of temporary files and better error handling
- **Table formatting**: Better markdown table formatting from detected text structures with improved column detection
- **Memory management**: Proper cleanup of temporary directories and files after processing

### Technical Changes
- Updated server name to `enhanced-pdf-mcp-server-v2` version 2.0.0
- Enhanced TypeScript implementation with improved type definitions
- Better logging to stderr to avoid corrupting JSON-RPC messages  
- All tools now support password parameter consistently
- Improved documentation structure and examples

## [1.0.0] - 2024-12-XX

### Added
- 🎉 **Initial Release** - PDF MCP Server for GitHub Copilot integration
- **Core PDF Reading** - Extract text content from PDF files using pdf-parse
- **Enhanced Table Extraction** - Extract tables from PDFs using pdfplumber
- **Image Processing** - Extract and analyze images using poppler-utils and tesseract OCR
- **Document Structure Analysis** - Analyze PDF metadata, page count, and organization
- **MCP Protocol Compliance** - Full Model Context Protocol implementation
- **VS Code Integration** - Seamless integration with GitHub Copilot in VS Code
- **Global Installation** - NPM package for universal installation
- **TypeScript Support** - Fully typed codebase with strict type checking
- **Error Handling** - Graceful error handling for corrupted or problematic PDFs
- **Cross-Platform Support** - Works on Windows, macOS, and Linux

### Tools Provided
- `read_pdf` - Extract text content from PDF files with optional page limits
- `extract_pdf_tables` - Extract and format table data from PDFs
- `extract_pdf_images` - Extract images and perform OCR analysis
- `analyze_pdf_structure` - Get metadata and structural information

### Documentation
- **README.md** - Comprehensive usage guide and examples
- **INSTALL.md** - Universal VS Code installation instructions
- **CONTRIBUTING.md** - Developer contribution guidelines
- **LICENSE** - MIT License for open source distribution

### Configuration
- **package.json** - NPM package configuration with global binary
- **tsconfig.json** - TypeScript compilation settings
- **.gitignore** - Git ignore patterns for Node.js projects
- **.vscode/settings.json** - VS Code MCP server configuration template

## [0.2.0] - Development

### Added
- Enhanced PDF processing capabilities
- Table extraction using pdfplumber
- Image extraction and OCR analysis
- Improved error handling and validation

### Changed
- Upgraded from basic text extraction to full document analysis
- Enhanced MCP tool definitions with better schemas

## [0.1.0] - Initial Development

### Added
- Basic PDF text extraction
- MCP server implementation
- TypeScript project structure
- VS Code integration setup

---

## Version History

### Release Planning

- **v1.0.0** - Initial public release with core functionality
- **v1.1.0** - Performance optimizations and additional PDF formats
- **v1.2.0** - Enhanced table detection and extraction
- **v2.0.0** - Major architecture improvements and new features

### Breaking Changes

None yet - this is the initial release.

### Migration Guide

This is the first public release, so no migration is needed.

### Security

- All PDF processing is done locally - no data is sent to external services
- File system access is limited to the configured working directory
- Input validation using Zod schemas prevents malicious inputs

### Performance Notes

- PDF processing is done synchronously to ensure data consistency
- Memory usage scales with PDF size - monitor for very large documents
- Enhanced features (OCR, image extraction) have additional processing overhead

### Known Issues

- Very large PDFs (>100MB) may cause memory issues
- Complex table layouts may not extract perfectly
- OCR accuracy depends on image quality in PDFs
- Some encrypted PDFs may not be readable

### Upcoming Features

- Batch PDF processing
- PDF comparison tools
- Advanced text search and highlighting
- Support for more document formats (Word, PowerPoint)
- Streaming processing for large documents

---

For more details about any release, see the corresponding GitHub release notes and documentation.
