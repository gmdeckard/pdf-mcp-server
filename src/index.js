#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const zod_1 = require("zod");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const pdf_parse_1 = __importDefault(require("pdf-parse"));
// Server configuration
const server = new index_js_1.Server({
    name: "pdf-reader",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
    },
});
// Input schema for the read_pdf tool
const ReadPdfArgsSchema = zod_1.z.object({
    file_path: zod_1.z.string().describe("Path to the PDF file to read"),
    max_pages: zod_1.z.number().optional().describe("Maximum number of pages to extract (optional, defaults to all pages)"),
});
// Input schema for the extract_pdf_tables tool
const ExtractTablesArgsSchema = zod_1.z.object({
    file_path: zod_1.z.string().describe("Path to the PDF file to extract tables from"),
    page_numbers: zod_1.z.array(zod_1.z.number()).optional().describe("Specific page numbers to extract tables from (optional, defaults to all pages)"),
});
// Input schema for the extract_pdf_images tool
const ExtractImagesArgsSchema = zod_1.z.object({
    file_path: zod_1.z.string().describe("Path to the PDF file to extract images from"),
    page_numbers: zod_1.z.array(zod_1.z.number()).optional().describe("Specific page numbers to extract images from (optional, defaults to all pages)"),
    ocr_enabled: zod_1.z.boolean().optional().default(false).describe("Whether to perform OCR on extracted images to get text content"),
});
// Input schema for the analyze_pdf_structure tool
const AnalyzePdfStructureArgsSchema = zod_1.z.object({
    file_path: zod_1.z.string().describe("Path to the PDF file to analyze"),
    include_text: zod_1.z.boolean().optional().default(true).describe("Whether to include text content in the analysis"),
    include_images: zod_1.z.boolean().optional().default(true).describe("Whether to include image analysis"),
    include_tables: zod_1.z.boolean().optional().default(true).describe("Whether to include table detection"),
});
// Tool definitions
const tools = [
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
function validateFilePath(filePath) {
    let resolvedPath;
    if (path.isAbsolute(filePath)) {
        resolvedPath = filePath;
    }
    else {
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
function extractPdfText(filePath, maxPages) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const pdfBuffer = fs.readFileSync(filePath);
            const data = yield (0, pdf_parse_1.default)(pdfBuffer);
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
        }
        catch (error) {
            throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : String(error)}`);
        }
    });
}
// Request handlers
server.setRequestHandler(types_js_1.ListToolsRequestSchema, () => __awaiter(void 0, void 0, void 0, function* () {
    return { tools };
}));
server.setRequestHandler(types_js_1.CallToolRequestSchema, (request) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, arguments: args } = request.params;
    try {
        if (name === "read_pdf") {
            // Validate input arguments
            const validatedArgs = ReadPdfArgsSchema.parse(args);
            const { file_path, max_pages } = validatedArgs;
            // Validate file path and existence
            const resolvedPath = validateFilePath(file_path);
            // Extract text from PDF
            const extractedText = yield extractPdfText(resolvedPath, max_pages);
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
        }
        else {
            throw new Error(`Unknown tool: ${name}`);
        }
    }
    catch (error) {
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
}));
// Start the server
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const transport = new stdio_js_1.StdioServerTransport();
        yield server.connect(transport);
        // Log to stderr that the server is running
        console.error("PDF Reader MCP Server running on stdio");
    });
}
// Handle process termination gracefully
process.on('SIGINT', () => __awaiter(void 0, void 0, void 0, function* () {
    console.error('Received SIGINT, shutting down gracefully...');
    yield server.close();
    process.exit(0);
}));
process.on('SIGTERM', () => __awaiter(void 0, void 0, void 0, function* () {
    console.error('Received SIGTERM, shutting down gracefully...');
    yield server.close();
    process.exit(0);
}));
// Run the main function and handle any errors
main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
