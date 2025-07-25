#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";
import pdfParse from "pdf-parse";

// Server configuration
const server = new Server(
  {
    name: "pdf-reader",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Input schema for the read_pdf tool
const ReadPdfArgsSchema = z.object({
  file_path: z.string().describe("Path to the PDF file to read"),
  max_pages: z.number().optional().describe("Maximum number of pages to extract (optional, defaults to all pages)"),
});

// Input schema for the extract_pdf_tables tool
const ExtractTablesArgsSchema = z.object({
  file_path: z.string().describe("Path to the PDF file to extract tables from"),
  page_numbers: z.array(z.number()).optional().describe("Specific page numbers to extract tables from (optional, defaults to all pages)"),
});

// Input schema for the extract_pdf_images tool
const ExtractImagesArgsSchema = z.object({
  file_path: z.string().describe("Path to the PDF file to extract images from"),
  page_numbers: z.array(z.number()).optional().describe("Specific page numbers to extract images from (optional, defaults to all pages)"),
  ocr_enabled: z.boolean().optional().default(false).describe("Whether to perform OCR on extracted images to get text content"),
});

// Input schema for the analyze_pdf_structure tool
const AnalyzePdfStructureArgsSchema = z.object({
  file_path: z.string().describe("Path to the PDF file to analyze"),
  include_text: z.boolean().optional().default(true).describe("Whether to include text content in the analysis"),
  include_images: z.boolean().optional().default(true).describe("Whether to include image analysis"),
  include_tables: z.boolean().optional().default(true).describe("Whether to include table detection"),
});

// Tool definitions
const tools: Tool[] = [
  {
    name: "read_pdf",
    description: "Extract and read text content from a PDF file. Returns the extracted text content that can be used as context for analysis, summarization, or answering questions about the PDF content.",
    inputSchema: {
      type: "object",
      properties: {
        file_path: {
          type: "string",
          description: "Path to the PDF file to read (can be absolute or relative path)",
        },
        max_pages: {
          type: "number",
          description: "Maximum number of pages to extract (optional, defaults to all pages)",
          minimum: 1,
        },
      },
      required: ["file_path"],
    },
  },
  {
    name: "extract_pdf_tables",
    description: "Extract structured table data from a PDF file. Attempts to identify and extract tables in a structured format that can be analyzed or converted to other formats like CSV or JSON.",
    inputSchema: {
      type: "object", 
      properties: {
        file_path: {
          type: "string",
          description: "Path to the PDF file to extract tables from",
        },
        page_numbers: {
          type: "array",
          items: {
            type: "number",
            minimum: 1,
          },
          description: "Specific page numbers to extract tables from (optional, defaults to all pages)",
        },
      },
      required: ["file_path"],
    },
  },
  {
    name: "extract_pdf_images",
    description: "Extract images from a PDF file and optionally perform OCR to extract text from images. Useful for PDFs containing charts, diagrams, or scanned documents.",
    inputSchema: {
      type: "object",
      properties: {
        file_path: {
          type: "string", 
          description: "Path to the PDF file to extract images from",
        },
        page_numbers: {
          type: "array",
          items: {
            type: "number",
            minimum: 1,
          },
          description: "Specific page numbers to extract images from (optional, defaults to all pages)",
        },
        ocr_enabled: {
          type: "boolean",
          description: "Whether to perform OCR on extracted images to get text content (default: false)",
          default: false,
        },
      },
      required: ["file_path"],
    },
  },
  {
    name: "analyze_pdf_structure",
    description: "Perform a comprehensive analysis of a PDF's structure including text, tables, images, and document metadata. Provides an overview of the document's content organization.",
    inputSchema: {
      type: "object",
      properties: {
        file_path: {
          type: "string",
          description: "Path to the PDF file to analyze",
        },
        include_text: {
          type: "boolean",
          description: "Whether to include text content in the analysis (default: true)",
          default: true,
        },
        include_images: {
          type: "boolean", 
          description: "Whether to include image analysis (default: true)",
          default: true,
        },
        include_tables: {
          type: "boolean",
          description: "Whether to include table detection (default: true)", 
          default: true,
        },
      },
      required: ["file_path"],
    },
  },
];

// Helper function to validate file path and check if file exists
function validateFilePath(filePath: string): string {
  let resolvedPath: string;
  
  if (path.isAbsolute(filePath)) {
    resolvedPath = filePath;
  } else {
    resolvedPath = path.resolve(process.cwd(), filePath);
  }
  
  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`File not found: ${resolvedPath}`);
  }
  
  if (!resolvedPath.toLowerCase().endsWith('.pdf')) {
    throw new Error(`File is not a PDF: ${resolvedPath}`);
  }
  
  return resolvedPath;
}

// Helper function to extract text from PDF with page limit
async function extractPdfText(filePath: string, maxPages?: number): Promise<string> {
  try {
    const pdfBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(pdfBuffer);
    
    let extractedText = data.text;
    
    // If maxPages is specified, try to approximate the content
    if (maxPages && maxPages > 0 && data.numpages > maxPages) {
      // Simple approximation: divide text by number of pages and take the first portion
      const textLength = extractedText.length;
      const approximateTextPerPage = textLength / data.numpages;
      const maxLength = Math.floor(approximateTextPerPage * maxPages);
      extractedText = extractedText.substring(0, maxLength);
      
      // Add a note about truncation
      extractedText += `\n\n[Note: Content truncated to approximately ${maxPages} pages out of ${data.numpages} total pages]`;
    }
    
    // Add metadata
    const metadata = `\n\n--- PDF Metadata ---\nTotal Pages: ${data.numpages}\nFile: ${path.basename(filePath)}`;
    
    return extractedText + metadata;
  } catch (error) {
    throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Request handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  try {
    if (name === "read_pdf") {
      // Validate input arguments
      const validatedArgs = ReadPdfArgsSchema.parse(args);
      const { file_path, max_pages } = validatedArgs;
      
      // Validate file path and existence
      const resolvedPath = validateFilePath(file_path);
      
      // Extract text from PDF
      const extractedText = await extractPdfText(resolvedPath, max_pages);
      
      // Log to stderr for debugging (not stdout to avoid corrupting JSON-RPC)
      console.error(`Successfully extracted text from PDF: ${resolvedPath} (${extractedText.length} characters)`);
      
      return {
        content: [
          {
            type: "text",
            text: extractedText,
          },
        ],
      };
    } else {
      throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error in tool ${name}:`, errorMessage);
    
    return {
      content: [
        {
          type: "text",
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  // Log to stderr that the server is running
  console.error("PDF Reader MCP Server running on stdio");
}

// Handle process termination gracefully
process.on('SIGINT', async () => {
  console.error('Received SIGINT, shutting down gracefully...');
  await server.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.error('Received SIGTERM, shutting down gracefully...');
  await server.close();
  process.exit(0);
});

// Run the main function and handle any errors
main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
