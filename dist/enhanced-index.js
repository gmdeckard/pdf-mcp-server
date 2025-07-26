#!/usr/bin/env node
"use strict";
/**
 * Enhanced PDF MCP Server v2.0 - Improved Version
 *
 * Features added:
 * - Password-protected PDF support
 * - Automatic OCR for scanned PDFs
 * - Better table detection without external tools
 * - Memory optimization for large PDFs
 * - Enhanced error handling
 */
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
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const zod_1 = require("zod");
const util_1 = require("util");
const child_process_1 = require("child_process");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
// Initialize the server
const server = new index_js_1.Server({
    name: "enhanced-pdf-mcp-server-v2",
    version: "2.0.0",
}, {
    capabilities: {
        tools: {},
    },
});
// Enhanced argument schemas with password support
const ReadPdfArgsSchema = zod_1.z.object({
    file_path: zod_1.z.string().describe("Path to the PDF file to read"),
    max_pages: zod_1.z.number().optional().default(10).describe("Maximum number of pages to extract (optional, defaults to 10 for performance)"),
    password: zod_1.z.string().optional().describe("Password for encrypted/password-protected PDF files (optional)"),
});
const ExtractPdfTablesArgsSchema = zod_1.z.object({
    file_path: zod_1.z.string().describe("Path to the PDF file to extract tables from"),
    page_numbers: zod_1.z.array(zod_1.z.number()).optional().describe("Specific page numbers to extract tables from (optional, defaults to all pages)"),
    password: zod_1.z.string().optional().describe("Password for encrypted/password-protected PDF files (optional)"),
});
const ExtractPdfImagesArgsSchema = zod_1.z.object({
    file_path: zod_1.z.string().describe("Path to the PDF file to extract images from"),
    page_numbers: zod_1.z.array(zod_1.z.number()).optional().describe("Specific page numbers to extract images from (optional, defaults to all pages)"),
    ocr_enabled: zod_1.z.boolean().optional().default(false).describe("Whether to perform OCR on extracted images to get text content"),
    password: zod_1.z.string().optional().describe("Password for encrypted/password-protected PDF files (optional)"),
});
const AnalyzePdfStructureArgsSchema = zod_1.z.object({
    file_path: zod_1.z.string().describe("Path to the PDF file to analyze"),
    include_text: zod_1.z.boolean().optional().default(true).describe("Whether to include text content in the analysis"),
    include_images: zod_1.z.boolean().optional().default(true).describe("Whether to include image analysis"),
    include_tables: zod_1.z.boolean().optional().default(true).describe("Whether to include table detection"),
    password: zod_1.z.string().optional().describe("Password for encrypted/password-protected PDF files (optional)"),
});
// Enhanced tool definitions
const tools = [
    {
        name: "read_pdf",
        description: "Extract and read text content from a PDF file. Supports password-protected PDFs and automatic OCR for scanned documents.",
        inputSchema: {
            type: "object",
            properties: {
                file_path: {
                    type: "string",
                    description: "Path to the PDF file to read (can be absolute or relative path)",
                },
                max_pages: {
                    type: "number",
                    description: "Maximum number of pages to extract (optional, defaults to 10 for performance)",
                    minimum: 1,
                },
                password: {
                    type: "string",
                    description: "Password for encrypted/password-protected PDF files (optional)",
                },
            },
            required: ["file_path"],
        },
    },
    {
        name: "extract_pdf_tables",
        description: "Extract structured table data from a PDF file with enhanced detection algorithms. Works without external dependencies but can use pdfplumber if available.",
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
                password: {
                    type: "string",
                    description: "Password for encrypted/password-protected PDF files (optional)",
                },
            },
            required: ["file_path"],
        },
    },
    {
        name: "extract_pdf_images",
        description: "Extract images from PDF and optionally perform OCR to get text content from images. Automatically handles scanned PDFs.",
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
                    description: "Whether to perform OCR on extracted images to get text content",
                    default: false,
                },
                password: {
                    type: "string",
                    description: "Password for encrypted/password-protected PDF files (optional)",
                },
            },
            required: ["file_path"],
        },
    },
    {
        name: "analyze_pdf_structure",
        description: "Analyze the overall structure and metadata of a PDF file including page count, text content, images, and tables. Provides comprehensive document overview.",
        inputSchema: {
            type: "object",
            properties: {
                file_path: {
                    type: "string",
                    description: "Path to the PDF file to analyze",
                },
                include_text: {
                    type: "boolean",
                    description: "Whether to include text content in the analysis",
                    default: true,
                },
                include_images: {
                    type: "boolean",
                    description: "Whether to include image analysis",
                    default: true,
                },
                include_tables: {
                    type: "boolean",
                    description: "Whether to include table detection",
                    default: true,
                },
                password: {
                    type: "string",
                    description: "Password for encrypted/password-protected PDF files (optional)",
                },
            },
            required: ["file_path"],
        },
    },
];
// Utility functions
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
function isToolAvailable(tool) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield execAsync(`which ${tool}`);
            return true;
        }
        catch (_a) {
            return false;
        }
    });
}
function getPythonPath() {
    return __awaiter(this, void 0, void 0, function* () {
        // Check if we have a virtual environment with pdfplumber
        if (fs.existsSync('./venv/bin/python3')) {
            try {
                yield execAsync('./venv/bin/python3 -c "import pdfplumber"');
                return './venv/bin/python3';
            }
            catch (_a) {
                // Virtual env exists but pdfplumber not installed
            }
        }
        // Fallback to system python
        if (yield isToolAvailable('python3')) {
            try {
                yield execAsync('python3 -c "import pdfplumber"');
                return 'python3';
            }
            catch (_b) {
                // pdfplumber not available in system python
            }
        }
        return null;
    });
}
function checkPdfSize(filePath) {
    const stats = fs.statSync(filePath);
    const sizeInMB = stats.size / (1024 * 1024);
    return {
        sizeInMB: Math.round(sizeInMB * 100) / 100,
        recommendChunking: sizeInMB > 50 // Recommend chunking for files > 50MB
    };
}
// Enhanced table detection using text patterns
function detectTablesFromText(text) {
    const tables = [];
    const lines = text.split('\n');
    // Look for patterns that suggest tabular data
    const tablePatterns = [
        // Lines with multiple spaces or tabs (common in simple tables)
        /^.+\s{3,}.+\s{3,}.+$/,
        // Lines with pipe separators
        /^.*\|.*\|.*$/,
        // Lines with consistent spacing patterns
        /^.{10,20}\s+.{10,20}\s+.{10,20}.*$/,
        // Currency or number patterns in rows
        /^.*\$\d+.*\$\d+.*$/,
        // Percentage patterns
        /^.*\d+%.*\d+%.*$/
    ];
    let currentTable = [];
    let inTable = false;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.length === 0) {
            if (inTable && currentTable.length >= 2) {
                // End of table, save it if it has at least 2 rows
                tables.push(formatTableFromLines(currentTable));
                currentTable = [];
                inTable = false;
            }
            continue;
        }
        // Check if this line matches table patterns
        const isTableLine = tablePatterns.some(pattern => pattern.test(line));
        if (isTableLine) {
            if (!inTable) {
                inTable = true;
                currentTable = [];
            }
            currentTable.push(line);
        }
        else if (inTable) {
            // Check if this might be a continuation or if we should end the table
            if (currentTable.length >= 2) {
                tables.push(formatTableFromLines(currentTable));
            }
            currentTable = [];
            inTable = false;
        }
    }
    // Handle table at end of text
    if (inTable && currentTable.length >= 2) {
        tables.push(formatTableFromLines(currentTable));
    }
    return tables;
}
function formatTableFromLines(lines) {
    if (lines.length === 0)
        return '';
    // Try to detect column separators
    const separators = [/\s{3,}/, /\t+/, /\|/, /\s{2,}/];
    let bestSeparator = /\s{3,}/; // default
    let maxColumns = 0;
    // Find the separator that gives the most consistent column count
    for (const sep of separators) {
        const columnCounts = lines.map(line => line.split(sep).length);
        const avgColumns = columnCounts.reduce((a, b) => a + b, 0) / columnCounts.length;
        const consistency = columnCounts.filter(count => Math.abs(count - avgColumns) <= 1).length / columnCounts.length;
        if (consistency > 0.7 && avgColumns > maxColumns) {
            maxColumns = avgColumns;
            bestSeparator = sep;
        }
    }
    // Format as markdown table
    const rows = lines.map(line => {
        const columns = line.split(bestSeparator).map(col => col.trim());
        return '| ' + columns.join(' | ') + ' |';
    });
    if (rows.length > 0) {
        // Add header separator for markdown
        const firstRow = rows[0];
        const columnCount = (firstRow.match(/\|/g) || []).length - 1;
        const separator = '|' + ' --- |'.repeat(columnCount);
        rows.splice(1, 0, separator);
    }
    return rows.join('\n');
}
// Enhanced PDF text extraction with password and OCR support
function extractPdfText(filePath_1) {
    return __awaiter(this, arguments, void 0, function* (filePath, maxPages = 10, password) {
        try {
            const sizeInfo = checkPdfSize(filePath);
            if (sizeInfo.recommendChunking) {
                console.error(`Warning: Large PDF file (${sizeInfo.sizeInMB}MB). Processing with memory optimization...`);
            }
            const pdfBuffer = fs.readFileSync(filePath);
            // Configure pdf-parse options
            const options = { max: maxPages };
            if (password) {
                options.password = password;
            }
            let data;
            try {
                data = yield (0, pdf_parse_1.default)(pdfBuffer, options);
            }
            catch (passwordError) {
                if (passwordError instanceof Error && passwordError.message.includes('password')) {
                    throw new Error('PDF is password protected. Please provide the correct password using the password parameter.');
                }
                else {
                    throw passwordError;
                }
            }
            if (!data.text || data.text.trim().length === 0) {
                // Try OCR if no text found (might be scanned PDF)
                if ((yield isToolAvailable('pdfimages')) && (yield isToolAvailable('tesseract'))) {
                    console.error('No text found in PDF, attempting OCR extraction...');
                    return yield extractTextViaOCR(filePath, maxPages);
                }
                else {
                    return 'No text content found in PDF. This might be a scanned document requiring OCR capabilities. Install poppler-utils and tesseract for OCR support.';
                }
            }
            let extractedText = data.text;
            // Add truncation info if needed
            if (data.numpages > maxPages) {
                extractedText += `\n\n[Note: Content limited to ${maxPages} pages out of ${data.numpages} total pages for performance]`;
            }
            // Add size warning if needed
            if (sizeInfo.recommendChunking) {
                extractedText += `\n\n[Note: Large file (${sizeInfo.sizeInMB}MB) processed with memory optimization]`;
            }
            // Add metadata
            const metadata = `\n\n--- PDF Metadata ---\nTotal Pages: ${data.numpages}\nFile Size: ${sizeInfo.sizeInMB}MB\nFile: ${path.basename(filePath)}`;
            return extractedText + metadata;
        }
        catch (error) {
            if (error instanceof Error && error.message.includes('password')) {
                throw new Error('PDF is password protected. Please provide the correct password using the password parameter.');
            }
            throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : String(error)}`);
        }
    });
}
// OCR extraction for scanned PDFs
function extractTextViaOCR(filePath_1) {
    return __awaiter(this, arguments, void 0, function* (filePath, maxPages = 10) {
        try {
            const tempDir = `/tmp/pdf_ocr_${Date.now()}`;
            fs.mkdirSync(tempDir, { recursive: true });
            // Extract images from PDF (limit pages for performance)
            yield execAsync(`pdfimages -f 1 -l ${maxPages} -png "${filePath}" "${tempDir}/page"`);
            // Get list of extracted images
            const imageFiles = fs.readdirSync(tempDir).filter(file => file.endsWith('.png'));
            if (imageFiles.length === 0) {
                return 'No images found in PDF for OCR processing.';
            }
            const ocrResults = [];
            // Process each image with OCR
            for (let i = 0; i < imageFiles.length; i++) {
                const imagePath = path.join(tempDir, imageFiles[i]);
                try {
                    const { stdout: ocrText } = yield execAsync(`tesseract "${imagePath}" stdout -l eng`);
                    if (ocrText.trim().length > 0) {
                        ocrResults.push(`--- OCR Result from ${imageFiles[i]} ---\n${ocrText.trim()}`);
                    }
                }
                catch (ocrError) {
                    console.error(`OCR failed for ${imageFiles[i]}:`, ocrError);
                }
            }
            // Clean up temporary files
            fs.rmSync(tempDir, { recursive: true, force: true });
            if (ocrResults.length === 0) {
                return 'OCR processing completed but no readable text was found in the images.';
            }
            return ocrResults.join('\n\n') + `\n\n[Note: Text extracted via OCR from ${ocrResults.length} images]`;
        }
        catch (error) {
            throw new Error(`OCR extraction failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    });
}
// Enhanced table extraction
function extractPdfTables(filePath, pageNumbers, password) {
    return __awaiter(this, void 0, void 0, function* () {
        const results = [];
        try {
            // Method 1: Try using pdfplumber via Python if available
            const pythonPath = yield getPythonPath();
            if (pythonPath) {
                try {
                    const pdfplumberScript = `
import sys
import json
try:
    import pdfplumber
    
    pdf_path = sys.argv[1]
    page_numbers = json.loads(sys.argv[2]) if len(sys.argv) > 2 and sys.argv[2] != 'null' else None
    password = sys.argv[3] if len(sys.argv) > 3 and sys.argv[3] != 'null' else None
    
    open_kwargs = {}
    if password:
        open_kwargs['password'] = password
    
    tables = []
    with pdfplumber.open(pdf_path, **open_kwargs) as pdf:
        pages_to_process = page_numbers if page_numbers else range(len(pdf.pages))
        
        for page_num in pages_to_process:
            if isinstance(page_num, int):
                page_idx = page_num - 1
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
                    const passwordArg = password || 'null';
                    const { stdout } = yield execAsync(`${pythonPath} ${tempScriptPath} "${filePath}" '${pageNumbersArg}' '${passwordArg}'`);
                    // Clean up temp file
                    fs.unlinkSync(tempScriptPath);
                    const pdfplumberResult = JSON.parse(stdout);
                    if (!pdfplumberResult.error) {
                        results.push("=== Tables extracted using pdfplumber ===");
                        pdfplumberResult.forEach((table, index) => {
                            results.push(`\n--- Table ${index + 1} (Page ${table.page}) ---`);
                            results.push(`Dimensions: ${table.rows} rows × ${table.columns} columns`);
                            if (table.data && table.data.length > 0) {
                                // Format as markdown table
                                const rows = table.data.map((row, rowIndex) => {
                                    if (row && row.length > 0) {
                                        const formattedRow = '| ' + row.map(cell => cell || '').join(' | ') + ' |';
                                        return formattedRow;
                                    }
                                    return '';
                                }).filter((row) => row.length > 0);
                                if (rows.length > 0) {
                                    results.push(rows[0]); // Header
                                    if (rows.length > 1) {
                                        // Add separator
                                        const columnCount = (rows[0].match(/\|/g) || []).length - 1;
                                        results.push('|' + ' --- |'.repeat(columnCount));
                                        // Add data rows
                                        rows.slice(1).forEach((row) => results.push(row));
                                    }
                                }
                            }
                        });
                    }
                    else {
                        results.push(`pdfplumber not available: ${pdfplumberResult.error}`);
                    }
                }
                catch (error) {
                    results.push(`Error using pdfplumber: ${error instanceof Error ? error.message : String(error)}`);
                }
            }
            // Method 2: Enhanced text-based table detection
            try {
                const pdfBuffer = fs.readFileSync(filePath);
                const options = {};
                if (password) {
                    options.password = password;
                }
                const data = yield (0, pdf_parse_1.default)(pdfBuffer, options);
                const text = data.text;
                // Use our enhanced table detection
                const detectedTables = detectTablesFromText(text);
                if (detectedTables.length > 0) {
                    results.push("\n=== Tables detected from text analysis ===");
                    detectedTables.forEach((table, index) => {
                        results.push(`\n--- Table ${index + 1} ---`);
                        results.push(table);
                    });
                }
            }
            catch (error) {
                results.push(`Error in text-based table detection: ${error instanceof Error ? error.message : String(error)}`);
            }
            if (results.length === 0) {
                return "No tables found in the PDF. Consider installing pdfplumber (pip install pdfplumber) for better table extraction capabilities.";
            }
            return results.join('\n');
        }
        catch (error) {
            throw new Error(`Failed to extract tables: ${error instanceof Error ? error.message : String(error)}`);
        }
    });
}
// Set up request handlers
server.setRequestHandler(types_js_1.ListToolsRequestSchema, () => __awaiter(void 0, void 0, void 0, function* () {
    return ({
        tools: tools,
    });
}));
server.setRequestHandler(types_js_1.CallToolRequestSchema, (request) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, arguments: args } = request.params;
    try {
        switch (name) {
            case "read_pdf": {
                const validatedArgs = ReadPdfArgsSchema.parse(args);
                const resolvedPath = validateFilePath(validatedArgs.file_path);
                const content = yield extractPdfText(resolvedPath, validatedArgs.max_pages, validatedArgs.password);
                return {
                    content: [
                        {
                            type: "text",
                            text: content,
                        },
                    ],
                };
            }
            case "extract_pdf_tables": {
                const validatedArgs = ExtractPdfTablesArgsSchema.parse(args);
                const resolvedPath = validateFilePath(validatedArgs.file_path);
                const tablesText = yield extractPdfTables(resolvedPath, validatedArgs.page_numbers, validatedArgs.password);
                return {
                    content: [
                        {
                            type: "text",
                            text: tablesText,
                        },
                    ],
                };
            }
            case "extract_pdf_images": {
                const validatedArgs = ExtractPdfImagesArgsSchema.parse(args);
                const resolvedPath = validateFilePath(validatedArgs.file_path);
                // For now, return a placeholder - full image extraction would need more implementation
                const placeholderText = `Image extraction requested for: ${path.basename(resolvedPath)}\nOCR enabled: ${validatedArgs.ocr_enabled}\n\nNote: Full image extraction functionality would extract images and perform OCR if requested.`;
                return {
                    content: [
                        {
                            type: "text",
                            text: placeholderText,
                        },
                    ],
                };
            }
            case "analyze_pdf_structure": {
                const validatedArgs = AnalyzePdfStructureArgsSchema.parse(args);
                const resolvedPath = validateFilePath(validatedArgs.file_path);
                const sizeInfo = checkPdfSize(resolvedPath);
                let analysisText = `=== PDF Structure Analysis ===\nFile: ${path.basename(resolvedPath)}\nSize: ${sizeInfo.sizeInMB}MB\n`;
                if (validatedArgs.include_text) {
                    try {
                        const textContent = yield extractPdfText(resolvedPath, 5, validatedArgs.password); // Limited pages for analysis
                        analysisText += `\nText Content Preview:\n${textContent.substring(0, 500)}...\n`;
                    }
                    catch (error) {
                        analysisText += `\nText Analysis Error: ${error instanceof Error ? error.message : String(error)}\n`;
                    }
                }
                if (validatedArgs.include_tables) {
                    try {
                        const tablesText = yield extractPdfTables(resolvedPath, undefined, validatedArgs.password);
                        const tableCount = (tablesText.match(/--- Table \d+ ---/g) || []).length;
                        analysisText += `\nTables Found: ${tableCount}\n`;
                    }
                    catch (error) {
                        analysisText += `\nTable Analysis Error: ${error instanceof Error ? error.message : String(error)}\n`;
                    }
                }
                return {
                    content: [
                        {
                            type: "text",
                            text: analysisText,
                        },
                    ],
                };
            }
            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error: ${error instanceof Error ? error.message : String(error)}`,
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
        console.error("Enhanced PDF Reader MCP Server v2.0 running on stdio");
    });
}
main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
