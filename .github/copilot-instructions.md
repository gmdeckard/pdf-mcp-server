# GitHub Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

This is an MCP (Model Context Protocol) server project in TypeScript. The server provides tools to read and extract text content from PDF files, allowing GitHub Copilot and other MCP clients to access PDF content as context.

## Project Purpose
- Extract text content from PDF files using the pdf-parse library
- Provide PDF reading capabilities through MCP tools
- Enable GitHub Copilot to work with PDF document content

## Key Components
- **MCP Server**: Built using @modelcontextprotocol/sdk
- **PDF Processing**: Uses pdf-parse library to extract text from PDF files
- **Tools**: Provides `read_pdf` tool for extracting text from PDF files
- **TypeScript**: Fully typed codebase with proper error handling

## Development Guidelines
- Follow MCP protocol specifications for tool definitions
- Use proper error handling for file operations and PDF parsing
- Write stderr logs (not stdout) to avoid corrupting JSON-RPC messages
- Use Zod for input validation and schema definitions

You can find more info and examples at https://modelcontextprotocol.io/llms-full.txt
