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
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// Server configuration
const server = new Server(
  {
    name: "pdf-reader-enhanced",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Input schemas
const ReadPdfArgsSchema = z.object({
  file_path: z.string().describe("Path to the PDF file to read"),
  max_pages: z.number().optional().describe("Maximum number of pages to extract (optional, defaults to all pages)"),
});

const ExtractTablesArgsSchema = z.object({
  file_path: z.string().describe("Path to the PDF file to extract tables from"),
  page_numbers: z.array(z.number()).optional().describe("Specific page numbers to extract tables from (optional, defaults to all pages)"),
});

const ExtractImagesArgsSchema = z.object({
  file_path: z.string().describe("Path to the PDF file to extract images from"),
  page_numbers: z.array(z.number()).optional().describe("Specific page numbers to extract images from (optional, defaults to all pages)"),
  ocr_enabled: z.boolean().optional().default(false).describe("Whether to perform OCR on extracted images to get text content"),
});

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
    description: "Extract structured table data from a PDF file using various methods including text-based parsing and external tools like pdfplumber or tabula-py if available.",
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
    description: "Extract images from a PDF file using pdfimages (poppler-utils) and optionally perform OCR using tesseract. Useful for PDFs containing charts, diagrams, or scanned documents.",
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
    description: "Perform a comprehensive analysis of a PDF's structure including text, tables, images, and document metadata using a combination of pdf-parse and external tools.",
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

// Helper function to check if external tool is available
async function isToolAvailable(tool: string): Promise<boolean> {
  try {
    await execAsync(`which ${tool}`);
    return true;
  } catch {
    return false;
  }
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

// Helper function to extract tables using multiple approaches
async function extractPdfTables(filePath: string, pageNumbers?: number[]): Promise<string> {
  const results: string[] = [];
  
  try {
    // Method 1: Try using pdfplumber via Python if available
    if (await isToolAvailable('python3')) {
      try {
        const pdfplumberScript = `
import sys
import json
try:
    import pdfplumber
    
    pdf_path = sys.argv[1]
    page_numbers = json.loads(sys.argv[2]) if len(sys.argv) > 2 and sys.argv[2] != 'null' else None
    
    tables = []
    with pdfplumber.open(pdf_path) as pdf:
        pages_to_process = page_numbers if page_numbers else range(len(pdf.pages))
        
        for page_num in pages_to_process:
            if isinstance(page_num, int):
                page_idx = page_num - 1  # Convert to 0-based indexing
            else:
                page_idx = page_num
                
            if 0 <= page_idx < len(pdf.pages):
                page = pdf.pages[page_idx]
                page_tables = page.extract_tables()
                
                for i, table in enumerate(page_tables):
                    table_info = {
                        "page": page_idx + 1,
                        "table_index": i + 1,
                        "rows": len(table),
                        "columns": len(table[0]) if table else 0,
                        "data": table
                    }
                    tables.append(table_info)
    
    print(json.dumps(tables, indent=2))
    
except ImportError:
    print(json.dumps({"error": "pdfplumber not installed"}))
except Exception as e:
    print(json.dumps({"error": str(e)}))
`;
        
        const tempScriptPath = `/tmp/extract_tables_${Date.now()}.py`;
        fs.writeFileSync(tempScriptPath, pdfplumberScript);
        
        const pageNumbersArg = pageNumbers ? JSON.stringify(pageNumbers) : 'null';
        const { stdout } = await execAsync(`python3 ${tempScriptPath} "${filePath}" '${pageNumbersArg}'`);
        
        // Clean up temp file
        fs.unlinkSync(tempScriptPath);
        
        const pdfplumberResult = JSON.parse(stdout);
        if (!pdfplumberResult.error) {
          results.push("=== Tables extracted using pdfplumber ===");
          pdfplumberResult.forEach((table: any, index: number) => {
            results.push(`\n--- Table ${index + 1} (Page ${table.page}) ---`);
            results.push(`Dimensions: ${table.rows} rows × ${table.columns} columns`);
            
            if (table.data && table.data.length > 0) {
              // Format as a simple text table
              table.data.forEach((row: string[], rowIndex: number) => {
                if (row && row.length > 0) {
                  const formattedRow = row.map(cell => cell || '').join(' | ');
                  results.push(formattedRow);
                  
                  // Add separator after header row
                  if (rowIndex === 0) {
                    results.push('-'.repeat(formattedRow.length));
                  }
                }
              });
            }
          });
        } else {
          results.push(`pdfplumber not available: ${pdfplumberResult.error}`);
        }
      } catch (error) {
        results.push(`Error using pdfplumber: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    // Method 2: Basic text-based table detection from pdf-parse
    try {
      const pdfBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(pdfBuffer);
      const text = data.text;
      
      // Simple heuristic to detect table-like structures
      const lines = text.split('\n');
      const potentialTables: string[] = [];
      let currentTable: string[] = [];
      
      for (const line of lines) {
        // Look for lines with multiple columns (containing multiple spaces or tabs)
        if (line.match(/\s{3,}/) || line.match(/\t{2,}/)) {
          currentTable.push(line);
        } else if (currentTable.length > 0) {
          // End of potential table
          if (currentTable.length >= 2) { // At least header + one row
            potentialTables.push(currentTable.join('\n'));
          }
          currentTable = [];
        }
      }
      
      // Don't forget the last table
      if (currentTable.length >= 2) {
        potentialTables.push(currentTable.join('\n'));
      }
      
      if (potentialTables.length > 0) {
        results.push("\n=== Potential tables detected from text analysis ===");
        potentialTables.forEach((table, index) => {
          results.push(`\n--- Potential Table ${index + 1} ---`);
          results.push(table);
        });
      }
    } catch (error) {
      results.push(`Error in text-based table detection: ${error instanceof Error ? error.message : String(error)}`);
    }
    
    if (results.length === 0) {
      return "No tables found in the PDF. Consider installing pdfplumber (pip install pdfplumber) for better table extraction capabilities.";
    }
    
    return results.join('\n');
    
  } catch (error) {
    throw new Error(`Failed to extract tables: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Helper function to extract images and perform OCR
async function extractPdfImages(filePath: string, pageNumbers?: number[], ocrEnabled: boolean = false): Promise<string> {
  const results: string[] = [];
  
  try {
    // Check if pdfimages (from poppler-utils) is available
    if (await isToolAvailable('pdfimages')) {
      const tempDir = `/tmp/pdf_images_${Date.now()}`;
      fs.mkdirSync(tempDir, { recursive: true });
      
      try {
        // Extract images using pdfimages
        const pdfimagesCmd = pageNumbers && pageNumbers.length > 0 
          ? `pdfimages -f ${Math.min(...pageNumbers)} -l ${Math.max(...pageNumbers)} "${filePath}" "${tempDir}/img"`
          : `pdfimages "${filePath}" "${tempDir}/img"`;
          
        await execAsync(pdfimagesCmd);
        
        // List extracted images
        const imageFiles = fs.readdirSync(tempDir).filter(file => 
          file.match(/\.(ppm|pbm|png|jpg|jpeg)$/i)
        );
        
        results.push(`=== Found ${imageFiles.length} images ===`);
        
        if (ocrEnabled && await isToolAvailable('tesseract')) {
          results.push("\n=== OCR Results ===");
          
          for (const imageFile of imageFiles) {
            const imagePath = path.join(tempDir, imageFile);
            try {
              // Run OCR on the image
              const { stdout: ocrText } = await execAsync(`tesseract "${imagePath}" stdout`);
              
              if (ocrText.trim()) {
                results.push(`\n--- OCR from ${imageFile} ---`);
                results.push(ocrText.trim());
              } else {
                results.push(`\n--- ${imageFile}: No text detected ---`);
              }
            } catch (ocrError) {
              results.push(`\n--- ${imageFile}: OCR failed (${ocrError}) ---`);
            }
          }
        } else {
          results.push(`\nImage files extracted to: ${tempDir}`);
          results.push(`Files: ${imageFiles.join(', ')}`);
          
          if (!ocrEnabled) {
            results.push("\nOCR not requested. Set ocr_enabled=true to extract text from images.");
          } else {
            results.push("\nTesseract OCR not available. Install tesseract-ocr for text extraction from images.");
          }
        }
        
        // Clean up temp directory
        fs.rmSync(tempDir, { recursive: true, force: true });
        
      } catch (error) {
        // Clean up on error
        if (fs.existsSync(tempDir)) {
          fs.rmSync(tempDir, { recursive: true, force: true });
        }
        throw error;
      }
    } else {
      results.push("pdfimages (poppler-utils) not available. Install poppler-utils for image extraction:");
      results.push("- Ubuntu/Debian: sudo apt-get install poppler-utils");
      results.push("- macOS: brew install poppler");
      results.push("- Windows: Download from https://poppler.freedesktop.org/");
    }
    
    return results.length > 0 ? results.join('\n') : "No images could be extracted from the PDF.";
    
  } catch (error) {
    throw new Error(`Failed to extract images: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Helper function to analyze PDF structure
async function analyzePdfStructure(filePath: string, includeText: boolean, includeImages: boolean, includeTables: boolean): Promise<string> {
  const results: string[] = [];
  
  try {
    // Basic PDF metadata and structure
    const pdfBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(pdfBuffer);
    
    results.push("=== PDF Structure Analysis ===");
    results.push(`File: ${path.basename(filePath)}`);
    results.push(`File Size: ${Math.round(fs.statSync(filePath).size / 1024)} KB`);
    results.push(`Total Pages: ${data.numpages}`);
    results.push(`Text Length: ${data.text.length} characters`);
    
    // Text analysis
    if (includeText) {
      const lines = data.text.split('\n').filter(line => line.trim());
      const words = data.text.split(/\s+/).filter(word => word.trim());
      const avgWordsPerPage = Math.round(words.length / data.numpages);
      
      results.push("\n--- Text Analysis ---");
      results.push(`Total Lines: ${lines.length}`);
      results.push(`Total Words: ${words.length}`);
      results.push(`Average Words per Page: ${avgWordsPerPage}`);
      
      // Detect potential headings (lines that are short and followed by longer content)
      const potentialHeadings = lines.filter(line => 
        line.length < 80 && 
        line.length > 5 && 
        !line.match(/^\s*\d+\s*$/) && // Not just a page number
        line.match(/[A-Z]/) // Contains uppercase letters
      ).slice(0, 10);
      
      if (potentialHeadings.length > 0) {
        results.push(`\nPotential Headings (first 10):`);
        potentialHeadings.forEach(heading => {
          results.push(`  • ${heading.trim()}`);
        });
      }
    }
    
    // Table analysis
    if (includeTables) {
      results.push("\n--- Table Analysis ---");
      try {
        const tableContent = await extractPdfTables(filePath);
        if (tableContent.includes("No tables found")) {
          results.push("No structured tables detected");
        } else {
          // Count potential tables
          const tableMatches = tableContent.match(/--- (Table|Potential Table) \d+/g);
          const tableCount = tableMatches ? tableMatches.length : 0;
          results.push(`Detected ${tableCount} potential table(s)`);
          results.push("(Use extract_pdf_tables for detailed table data)");
        }
      } catch (error) {
        results.push(`Table analysis failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    // Image analysis
    if (includeImages) {
      results.push("\n--- Image Analysis ---");
      try {
        const imageContent = await extractPdfImages(filePath, undefined, false);
        if (imageContent.includes("Found 0 images")) {
          results.push("No images detected");
        } else {
          // Extract image count from the result
          const imageMatch = imageContent.match(/Found (\d+) images/);
          const imageCount = imageMatch ? imageMatch[1] : "unknown number of";
          results.push(`Detected ${imageCount} image(s)`);
          results.push("(Use extract_pdf_images for detailed image extraction and OCR)");
        }
      } catch (error) {
        results.push(`Image analysis failed: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    // Document structure hints
    results.push("\n--- Document Structure Hints ---");
    const text = data.text.toLowerCase();
    
    const structuralElements = [
      { name: "Table of Contents", keywords: ["table of contents", "contents", "index"] },
      { name: "Abstract/Summary", keywords: ["abstract", "summary", "executive summary"] },
      { name: "References/Bibliography", keywords: ["references", "bibliography", "works cited"] },
      { name: "Appendix", keywords: ["appendix", "appendices"] },
      { name: "Figures/Charts", keywords: ["figure", "chart", "graph", "diagram"] },
      { name: "Tables", keywords: ["table", "tabular"] },
    ];
    
    structuralElements.forEach(element => {
      const found = element.keywords.some(keyword => text.includes(keyword));
      results.push(`${found ? '✓' : '✗'} ${element.name}`);
    });
    
    return results.join('\n');
    
  } catch (error) {
    throw new Error(`Failed to analyze PDF structure: ${error instanceof Error ? error.message : String(error)}`);
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
      
    } else if (name === "extract_pdf_tables") {
      const validatedArgs = ExtractTablesArgsSchema.parse(args);
      const { file_path, page_numbers } = validatedArgs;
      
      const resolvedPath = validateFilePath(file_path);
      const tablesText = await extractPdfTables(resolvedPath, page_numbers);
      
      console.error(`Successfully extracted tables from PDF: ${resolvedPath}`);
      
      return {
        content: [
          {
            type: "text",
            text: tablesText,
          },
        ],
      };
      
    } else if (name === "extract_pdf_images") {
      const validatedArgs = ExtractImagesArgsSchema.parse(args);
      const { file_path, page_numbers, ocr_enabled } = validatedArgs;
      
      const resolvedPath = validateFilePath(file_path);
      const imagesText = await extractPdfImages(resolvedPath, page_numbers, ocr_enabled);
      
      console.error(`Successfully processed images from PDF: ${resolvedPath} (OCR: ${ocr_enabled})`);
      
      return {
        content: [
          {
            type: "text",
            text: imagesText,
          },
        ],
      };
      
    } else if (name === "analyze_pdf_structure") {
      const validatedArgs = AnalyzePdfStructureArgsSchema.parse(args);
      const { file_path, include_text, include_images, include_tables } = validatedArgs;
      
      const resolvedPath = validateFilePath(file_path);
      const analysisText = await analyzePdfStructure(resolvedPath, include_text ?? true, include_images ?? true, include_tables ?? true);
      
      console.error(`Successfully analyzed PDF structure: ${resolvedPath}`);
      
      return {
        content: [
          {
            type: "text",
            text: analysisText,
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
  console.error("Enhanced PDF Reader MCP Server running on stdio");
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
