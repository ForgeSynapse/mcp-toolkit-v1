import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import QRCode from 'qrcode';
// API Key Authentication
const REQUIRED_API_KEY = process.env.MCP_API_KEY;
if (!REQUIRED_API_KEY) {
    console.error('Error: MCP_API_KEY environment variable is required');
    process.exit(1);
}
// Authentication helper function
function validateApiKey(apiKey) {
    return apiKey === REQUIRED_API_KEY;
}
// Function to register all tools on a server instance
function registerToolsOnServer(server) {
    // Password Generator Tool
    server.registerTool('generate-password', {
        title: 'Password Generator',
        description: 'Generate secure passwords with customizable options',
        inputSchema: {
            apiKey: z.string(),
            length: z.number().min(8).max(128).default(16),
            includeNumbers: z.boolean().default(true),
            includeSymbols: z.boolean().default(true),
            includeUppercase: z.boolean().default(true),
            includeLowercase: z.boolean().default(true),
        },
    }, async ({ apiKey, length = 16, includeNumbers = true, includeSymbols = true, includeUppercase = true, includeLowercase = true, }) => {
        if (!validateApiKey(apiKey)) {
            return {
                content: [{ type: 'text', text: 'Error: Invalid API key' }],
            };
        }
        let charset = '';
        if (includeLowercase)
            charset += 'abcdefghijklmnopqrstuvwxyz';
        if (includeUppercase)
            charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (includeNumbers)
            charset += '0123456789';
        if (includeSymbols)
            charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
        if (charset === '') {
            return {
                content: [
                    {
                        type: 'text',
                        text: 'Error: At least one character type must be selected',
                    },
                ],
            };
        }
        let password = '';
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        return {
            content: [
                {
                    type: 'text',
                    text: `Generated password: ${password}\n\nStrength: ${length >= 16 && includeNumbers && includeSymbols
                        ? 'Strong'
                        : length >= 12
                            ? 'Medium'
                            : 'Weak'}`,
                },
            ],
        };
    });
    // QR Code Data Generator Tool
    server.registerTool('generate-qr-data', {
        title: 'QR Code Data Generator',
        description: 'Generate formatted data for QR codes (WiFi, contact, URL, etc.)',
        inputSchema: {
            apiKey: z.string(),
            type: z.enum(['wifi', 'contact', 'url', 'text']),
            data: z.object({
                // WiFi fields
                ssid: z.string().optional(),
                password: z.string().optional(),
                security: z.enum(['WPA', 'WEP', 'nopass']).optional(),
                // Contact fields
                name: z.string().optional(),
                phone: z.string().optional(),
                email: z.string().optional(),
                // URL/Text fields
                content: z.string().optional(),
            }),
        },
    }, async ({ apiKey, type, data }) => {
        if (!validateApiKey(apiKey)) {
            return {
                content: [{ type: 'text', text: 'Error: Invalid API key' }],
            };
        }
        let qrString = '';
        switch (type) {
            case 'wifi':
                if (!data.ssid) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: 'Error: SSID is required for WiFi QR codes',
                            },
                        ],
                    };
                }
                qrString = `WIFI:T:${data.security || 'WPA'};S:${data.ssid};P:${data.password || ''};H:false;;`;
                break;
            case 'contact':
                qrString = `BEGIN:VCARD\nVERSION:3.0\n`;
                if (data.name)
                    qrString += `FN:${data.name}\n`;
                if (data.phone)
                    qrString += `TEL:${data.phone}\n`;
                if (data.email)
                    qrString += `EMAIL:${data.email}\n`;
                qrString += `END:VCARD`;
                break;
            case 'url':
                qrString = data.content || '';
                break;
            case 'text':
                qrString = data.content || '';
                break;
        }
        return {
            content: [
                {
                    type: 'text',
                    text: `QR Code data for ${type}:\n\n${qrString}\n\nUse this text with any QR code generator tool.`,
                },
            ],
        };
    });
    // Base64 Encoder/Decoder Tool
    server.registerTool('base64-convert', {
        title: 'Base64 Encoder/Decoder',
        description: 'Encode or decode text using Base64',
        inputSchema: {
            apiKey: z.string(),
            operation: z.enum(['encode', 'decode']),
            text: z.string(),
        },
    }, async ({ apiKey, operation, text }) => {
        if (!validateApiKey(apiKey)) {
            return {
                content: [{ type: 'text', text: 'Error: Invalid API key' }],
            };
        }
        try {
            let result = '';
            if (operation === 'encode') {
                result = btoa(text);
            }
            else {
                result = atob(text);
            }
            return {
                content: [
                    {
                        type: 'text',
                        text: `${operation === 'encode' ? 'Encoded' : 'Decoded'} result:\n\n${result}`,
                    },
                ],
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Error: Invalid ${operation === 'decode' ? 'Base64' : ''} input`,
                    },
                ],
            };
        }
    });
    // UUID Generator Tool
    server.registerTool('generate-uuid', {
        title: 'UUID Generator',
        description: 'Generate UUIDs (v4) for unique identifiers',
        inputSchema: {
            apiKey: z.string(),
            count: z.number().min(1).max(10).default(1),
        },
    }, async ({ apiKey, count = 1 }) => {
        if (!validateApiKey(apiKey)) {
            return {
                content: [{ type: 'text', text: 'Error: Invalid API key' }],
            };
        }
        const uuids = [];
        for (let i = 0; i < count; i++) {
            // Simple UUID v4 generation
            const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                const r = (Math.random() * 16) | 0;
                const v = c == 'x' ? r : (r & 0x3) | 0x8;
                return v.toString(16);
            });
            uuids.push(uuid);
        }
        return {
            content: [
                {
                    type: 'text',
                    text: count === 1
                        ? `Generated UUID: ${uuids[0]}`
                        : `Generated UUIDs:\n${uuids
                            .map((uuid, i) => `${i + 1}. ${uuid}`)
                            .join('\n')}`,
                },
            ],
        };
    });
    // Color Palette Generator Tool
    server.registerTool('generate-color-palette', {
        title: 'Color Palette Generator',
        description: 'Generate color palettes for design projects',
        inputSchema: {
            apiKey: z.string(),
            baseColor: z
                .string()
                .regex(/^#[0-9A-Fa-f]{6}$/)
                .optional(),
            type: z
                .enum(['monochromatic', 'complementary', 'triadic', 'random'])
                .default('random'),
            count: z.number().min(3).max(10).default(5),
        },
    }, async ({ apiKey, baseColor, type = 'random', count = 5 }) => {
        if (!validateApiKey(apiKey)) {
            return {
                content: [{ type: 'text', text: 'Error: Invalid API key' }],
            };
        }
        const colors = [];
        if (type === 'random' || !baseColor) {
            // Generate random colors
            for (let i = 0; i < count; i++) {
                const hex = '#' +
                    Math.floor(Math.random() * 16777215)
                        .toString(16)
                        .padStart(6, '0');
                colors.push(hex);
            }
        }
        else {
            // Parse base color
            const r = parseInt(baseColor.slice(1, 3), 16);
            const g = parseInt(baseColor.slice(3, 5), 16);
            const b = parseInt(baseColor.slice(5, 7), 16);
            colors.push(baseColor); // Add base color
            // Generate variations based on type
            for (let i = 1; i < count; i++) {
                let newR, newG, newB;
                if (type === 'monochromatic') {
                    const factor = 0.8 + i * 0.1;
                    newR = Math.min(255, Math.floor(r * factor));
                    newG = Math.min(255, Math.floor(g * factor));
                    newB = Math.min(255, Math.floor(b * factor));
                }
                else {
                    // Simple variation for other types
                    newR = Math.min(255, Math.max(0, r + (Math.random() - 0.5) * 100));
                    newG = Math.min(255, Math.max(0, g + (Math.random() - 0.5) * 100));
                    newB = Math.min(255, Math.max(0, b + (Math.random() - 0.5) * 100));
                }
                const hex = '#' +
                    Math.round(newR).toString(16).padStart(2, '0') +
                    Math.round(newG).toString(16).padStart(2, '0') +
                    Math.round(newB).toString(16).padStart(2, '0');
                colors.push(hex);
            }
        }
        const paletteText = colors
            .map((color, i) => `${i + 1}. ${color.toUpperCase()}`)
            .join('\n');
        return {
            content: [
                {
                    type: 'text',
                    text: `Generated ${type} color palette:\n\n${paletteText}\n\nCopy these hex codes for use in your design tools.`,
                },
            ],
        };
    });
    // QR Code Generator Tool
    server.registerTool('generate-qr-code', {
        title: 'QR Code Generator',
        description: 'Generate QR codes from text strings',
        inputSchema: {
            apiKey: z.string(),
            text: z.string(),
            format: z.enum(['png', 'svg', 'terminal']).default('png'),
            errorCorrectionLevel: z.enum(['L', 'M', 'Q', 'H']).default('M'),
            width: z.number().min(100).max(1000).default(200),
        },
    }, async ({ apiKey, text, format = 'png', errorCorrectionLevel = 'M', width = 200, }) => {
        if (!validateApiKey(apiKey)) {
            return {
                content: [{ type: 'text', text: 'Error: Invalid API key' }],
            };
        }
        try {
            let result = '';
            if (format === 'terminal') {
                // Generate ASCII QR code for terminal display
                result = await QRCode.toString(text, {
                    type: 'terminal',
                    errorCorrectionLevel,
                    width: Math.min(width / 10, 50), // Scale down for terminal
                });
                return {
                    content: [
                        {
                            type: 'text',
                            text: `QR Code for: "${text}"\n\n${result}\n\nScan this QR code with your mobile device.`,
                        },
                    ],
                };
            }
            else if (format === 'svg') {
                // Generate SVG QR code
                result = await QRCode.toString(text, {
                    type: 'svg',
                    errorCorrectionLevel,
                    width,
                });
                return {
                    content: [
                        {
                            type: 'text',
                            text: `QR Code SVG for: "${text}"\n\n${result}\n\nSave this as a .svg file to use the QR code.`,
                        },
                    ],
                };
            }
            else {
                // Generate PNG QR code as data URL
                result = await QRCode.toDataURL(text, {
                    errorCorrectionLevel,
                    width,
                    margin: 1,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF',
                    },
                });
                const base64Data = result.split(',')[1]; // Remove data:image/png;base64, prefix
                if (!base64Data) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: 'Error: Failed to extract base64 data from QR code',
                            },
                        ],
                    };
                }
                return {
                    content: [
                        {
                            type: 'image',
                            data: base64Data,
                            mimeType: 'image/png',
                            name: 'qr-code.png',
                            description: 'QR Code PNG',
                            size: {
                                width: 50,
                                height: 50,
                            },
                        },
                    ],
                };
            }
        }
        catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Error generating QR code: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    },
                ],
            };
        }
    });
}
// Create main MCP server instance
const server = new McpServer({
    name: 'productivity-toolkit',
    version: '1.0.0',
});
// Register tools on main server
registerToolsOnServer(server);
// HTTP API handlers that mirror MCP tool functionality
async function handlePasswordGeneration(params) {
    const { length = 16, includeNumbers = true, includeSymbols = true, includeUppercase = true, includeLowercase = true, } = params;
    let charset = '';
    if (includeLowercase)
        charset += 'abcdefghijklmnopqrstuvwxyz';
    if (includeUppercase)
        charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeNumbers)
        charset += '0123456789';
    if (includeSymbols)
        charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    if (charset === '') {
        return { error: 'At least one character type must be selected' };
    }
    let password = '';
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return {
        password,
        strength: length >= 16 && includeNumbers && includeSymbols ? 'Strong' : length >= 12 ? 'Medium' : 'Weak'
    };
}
async function handleQRCodeGeneration(params) {
    const { text, format = 'png', errorCorrectionLevel = 'M', width = 200, } = params;
    if (!text) {
        return { error: 'Text parameter is required' };
    }
    try {
        if (format === 'png') {
            const result = await QRCode.toDataURL(text, {
                errorCorrectionLevel,
                width,
                margin: 1,
                color: { dark: '#000000', light: '#FFFFFF' },
            });
            const base64Data = result.split(',')[1];
            return {
                qrCode: base64Data,
                format: 'base64',
                mimeType: 'image/png',
                text
            };
        }
        else if (format === 'svg') {
            const result = await QRCode.toString(text, {
                type: 'svg',
                errorCorrectionLevel,
                width,
            });
            return { qrCode: result, format: 'svg', text };
        }
        else {
            const result = await QRCode.toString(text, {
                type: 'terminal',
                errorCorrectionLevel,
                width: Math.min(width / 10, 50),
            });
            return { qrCode: result, format: 'terminal', text };
        }
    }
    catch (error) {
        return { error: `Failed to generate QR code: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
}
async function handleQRDataGeneration(params) {
    const { type, data } = params;
    if (!type || !data) {
        return { error: 'Type and data parameters are required' };
    }
    let qrString = '';
    switch (type) {
        case 'wifi':
            if (!data.ssid) {
                return { error: 'SSID is required for WiFi QR codes' };
            }
            qrString = `WIFI:T:${data.security || 'WPA'};S:${data.ssid};P:${data.password || ''};H:false;;`;
            break;
        case 'contact':
            qrString = `BEGIN:VCARD\nVERSION:3.0\n`;
            if (data.name)
                qrString += `FN:${data.name}\n`;
            if (data.phone)
                qrString += `TEL:${data.phone}\n`;
            if (data.email)
                qrString += `EMAIL:${data.email}\n`;
            qrString += `END:VCARD`;
            break;
        case 'url':
        case 'text':
            qrString = data.content || '';
            break;
        default:
            return { error: 'Invalid type. Supported: wifi, contact, url, text' };
    }
    return { qrData: qrString, type };
}
async function handleUUIDGeneration(params) {
    const { count = 1 } = params;
    const uuids = [];
    for (let i = 0; i < Math.min(count, 10); i++) {
        const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = (Math.random() * 16) | 0;
            const v = c == 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
        uuids.push(uuid);
    }
    return { uuids, count: uuids.length };
}
async function handleColorPaletteGeneration(params) {
    const { baseColor, type = 'random', count = 5 } = params;
    const colors = [];
    if (type === 'random' || !baseColor) {
        for (let i = 0; i < Math.min(count, 10); i++) {
            const hex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
            colors.push(hex);
        }
    }
    else {
        const r = parseInt(baseColor.slice(1, 3), 16);
        const g = parseInt(baseColor.slice(3, 5), 16);
        const b = parseInt(baseColor.slice(5, 7), 16);
        colors.push(baseColor);
        for (let i = 1; i < Math.min(count, 10); i++) {
            let newR, newG, newB;
            if (type === 'monochromatic') {
                const factor = 0.8 + i * 0.1;
                newR = Math.min(255, Math.floor(r * factor));
                newG = Math.min(255, Math.floor(g * factor));
                newB = Math.min(255, Math.floor(b * factor));
            }
            else {
                newR = Math.min(255, Math.max(0, r + (Math.random() - 0.5) * 100));
                newG = Math.min(255, Math.max(0, g + (Math.random() - 0.5) * 100));
                newB = Math.min(255, Math.max(0, b + (Math.random() - 0.5) * 100));
            }
            const hex = '#' + Math.round(newR).toString(16).padStart(2, '0') +
                Math.round(newG).toString(16).padStart(2, '0') +
                Math.round(newB).toString(16).padStart(2, '0');
            colors.push(hex);
        }
    }
    return { colors, type, count: colors.length };
}
async function handleBase64Conversion(params) {
    const { operation, text } = params;
    if (!operation || !text) {
        return { error: 'Operation and text parameters are required' };
    }
    try {
        let result = '';
        if (operation === 'encode') {
            result = btoa(text);
        }
        else if (operation === 'decode') {
            result = atob(text);
        }
        else {
            return { error: 'Invalid operation. Use "encode" or "decode"' };
        }
        return { result, operation, originalText: text };
    }
    catch (error) {
        return { error: `Invalid ${operation === 'decode' ? 'Base64' : ''} input` };
    }
}
console.log('Starting MCP Server...');
console.log('Environment:', process.env.NODE_ENV);
console.log('Render:', !!process.env.RENDER);
console.log('API Key configured:', !!REQUIRED_API_KEY);
// No session management needed - stateless MCP server
// Health check state
const healthState = {
    startTime: Date.now(),
    isReady: true,
    lastCheck: Date.now(),
    version: '1.0.0'
};
// MCP Health Check Functions
function checkMcpCapabilities() {
    try {
        // Test if we can create a new MCP server instance
        const testServer = new McpServer({
            name: 'test-server',
            version: '1.0.0'
        });
        return testServer !== null;
    }
    catch (error) {
        console.error('MCP capabilities check failed:', error);
        return false;
    }
}
function getDetailedHealthStatus() {
    const now = Date.now();
    const uptime = Math.floor((now - healthState.startTime) / 1000);
    // Check MCP server functionality
    const mcpHealthy = checkMcpCapabilities();
    // No sessions needed - stateless server
    const activeSessions = 0;
    const sessionIds = [];
    // Overall health determination
    const overall = mcpHealthy && healthState.isReady ? 'healthy' : 'unhealthy';
    return {
        status: overall,
        timestamp: new Date().toISOString(),
        service: 'productivity-toolkit-mcp-server',
        version: healthState.version,
        uptime_seconds: uptime,
        checks: {
            mcp_server: {
                status: mcpHealthy ? 'healthy' : 'unhealthy',
                capabilities: ['tools', 'logging', 'prompts', 'resources']
            },
            api_key: {
                status: !!REQUIRED_API_KEY ? 'healthy' : 'unhealthy',
                configured: !!REQUIRED_API_KEY
            },
            connection: {
                status: 'healthy',
                type: 'stateless',
                note: 'No session management required'
            },
            tools: {
                status: 'healthy',
                count: 6,
                names: ['generate-password', 'generate-qr-code', 'generate-qr-data', 'generate-uuid', 'generate-color-palette', 'base64-convert']
            }
        },
        transport: {
            stdio: 'available',
            streamable_http: 'available',
            sse: 'available'
        }
    };
}
// MCP Streamable HTTP handler
async function handleMcpStreamableHttp(req, res) {
    if (req.method === 'POST') {
        // Handle MCP command requests
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString();
        });
        req.on('end', async () => {
            try {
                const message = JSON.parse(body);
                // Handle initialization - no session required
                if (message.method === 'initialize') {
                    // Return initialization response
                    const initResult = {
                        jsonrpc: '2.0',
                        id: message.id,
                        result: {
                            protocolVersion: '2024-11-05',
                            capabilities: {
                                tools: {},
                                logging: {},
                                prompts: {},
                                resources: {}
                            },
                            serverInfo: {
                                name: 'productivity-toolkit',
                                version: '1.0.0'
                            }
                        }
                    };
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(initResult));
                    console.log('MCP initialization handled - no session required');
                    return;
                }
                // Handle tools/list request
                if (message.method === 'tools/list') {
                    const tools = [
                        {
                            name: 'generate-password',
                            description: 'Generate secure passwords with customizable options',
                            inputSchema: {
                                type: 'object',
                                properties: {
                                    apiKey: { type: 'string' },
                                    length: { type: 'number', minimum: 8, maximum: 128, default: 16 },
                                    includeNumbers: { type: 'boolean', default: true },
                                    includeSymbols: { type: 'boolean', default: true },
                                    includeUppercase: { type: 'boolean', default: true },
                                    includeLowercase: { type: 'boolean', default: true },
                                },
                                required: ['apiKey']
                            }
                        },
                        {
                            name: 'generate-qr-code',
                            description: 'Generate QR codes from text strings',
                            inputSchema: {
                                type: 'object',
                                properties: {
                                    apiKey: { type: 'string' },
                                    text: { type: 'string' },
                                    format: { type: 'string', enum: ['png', 'svg', 'terminal'], default: 'png' },
                                    errorCorrectionLevel: { type: 'string', enum: ['L', 'M', 'Q', 'H'], default: 'M' },
                                    width: { type: 'number', minimum: 100, maximum: 1000, default: 200 }
                                },
                                required: ['apiKey', 'text']
                            }
                        },
                        {
                            name: 'generate-qr-data',
                            description: 'Generate QR code data strings for WiFi, contacts, etc.',
                            inputSchema: {
                                type: 'object',
                                properties: {
                                    apiKey: { type: 'string' },
                                    type: { type: 'string', enum: ['wifi', 'contact', 'url', 'text'] },
                                    data: { type: 'object' }
                                },
                                required: ['apiKey', 'type', 'data']
                            }
                        },
                        {
                            name: 'generate-uuid',
                            description: 'Generate UUIDs (v4) for unique identifiers',
                            inputSchema: {
                                type: 'object',
                                properties: {
                                    apiKey: { type: 'string' },
                                    count: { type: 'number', minimum: 1, maximum: 10, default: 1 }
                                },
                                required: ['apiKey']
                            }
                        },
                        {
                            name: 'generate-color-palette',
                            description: 'Generate color palettes for design projects',
                            inputSchema: {
                                type: 'object',
                                properties: {
                                    apiKey: { type: 'string' },
                                    baseColor: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
                                    type: { type: 'string', enum: ['monochromatic', 'complementary', 'triadic', 'random'], default: 'random' },
                                    count: { type: 'number', minimum: 3, maximum: 10, default: 5 }
                                },
                                required: ['apiKey']
                            }
                        },
                        {
                            name: 'base64-convert',
                            description: 'Encode or decode text using Base64',
                            inputSchema: {
                                type: 'object',
                                properties: {
                                    apiKey: { type: 'string' },
                                    operation: { type: 'string', enum: ['encode', 'decode'] },
                                    text: { type: 'string' }
                                },
                                required: ['apiKey', 'operation', 'text']
                            }
                        }
                    ];
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        jsonrpc: '2.0',
                        id: message.id,
                        result: { tools }
                    }));
                    return;
                }
                // Handle tools/call request
                if (message.method === 'tools/call') {
                    const { name, arguments: args } = message.params;
                    // Validate API key (could be in args or headers)
                    const apiKeyFromArgs = args.apiKey;
                    const apiKeyFromHeader = req.headers['authorization']?.replace('Bearer ', '') ||
                        req.headers['x-api-key'];
                    const apiKey = apiKeyFromArgs || apiKeyFromHeader;
                    if (!validateApiKey(apiKey)) {
                        res.writeHead(401, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            jsonrpc: '2.0',
                            id: message.id,
                            error: { code: -32000, message: 'Invalid or missing API key' }
                        }));
                        return;
                    }
                    // Ensure args has apiKey for backwards compatibility
                    const argsWithApiKey = { ...args, apiKey };
                    let result;
                    try {
                        switch (name) {
                            case 'generate-password':
                                result = await handlePasswordGeneration(argsWithApiKey);
                                break;
                            case 'generate-qr-code':
                                result = await handleQRCodeGeneration(argsWithApiKey);
                                break;
                            case 'generate-qr-data':
                                result = await handleQRDataGeneration(argsWithApiKey);
                                break;
                            case 'generate-uuid':
                                result = await handleUUIDGeneration(argsWithApiKey);
                                break;
                            case 'generate-color-palette':
                                result = await handleColorPaletteGeneration(argsWithApiKey);
                                break;
                            case 'base64-convert':
                                result = await handleBase64Conversion(argsWithApiKey);
                                break;
                            default:
                                throw new Error(`Unknown tool: ${name}`);
                        }
                        // Handle errors in results
                        if (result && result.error) {
                            res.writeHead(400, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({
                                jsonrpc: '2.0',
                                id: message.id,
                                error: { code: -32000, message: result.error }
                            }));
                            return;
                        }
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            jsonrpc: '2.0',
                            id: message.id,
                            result: {
                                content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
                            }
                        }));
                    }
                    catch (error) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            jsonrpc: '2.0',
                            id: message.id,
                            error: { code: -32603, message: `Internal error: ${error instanceof Error ? error.message : 'Unknown error'}` }
                        }));
                    }
                    return;
                }
                // Handle unknown methods
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    jsonrpc: '2.0',
                    id: message.id,
                    error: { code: -32601, message: 'Method not found' }
                }));
            }
            catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    jsonrpc: '2.0',
                    id: null,
                    error: { code: -32700, message: 'Parse error' }
                }));
            }
        });
    }
    else if (req.method === 'GET') {
        // Handle Server-Sent Events stream - no session required
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        });
        // Send initial connection event
        res.write(`data: ${JSON.stringify({
            jsonrpc: '2.0',
            method: 'notifications/initialized',
            params: {}
        })}\n\n`);
        // Keep connection alive
        const keepAliveInterval = setInterval(() => {
            res.write(`: keepalive\n\n`);
        }, 30000);
        req.on('close', () => {
            clearInterval(keepAliveInterval);
        });
    }
    else if (req.method === 'DELETE') {
        // Handle connection termination - no session required
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'connection terminated' }));
    }
    else {
        res.writeHead(405, { 'Content-Type': 'text/plain' });
        res.end('Method not allowed');
    }
}
// Check if running in web service mode (Render) or stdio mode (local MCP)
if (process.env.RENDER || process.env.NODE_ENV === 'production' || process.env.MCP_HTTP_MODE === 'true') {
    console.log('Starting MCP server with Streamable HTTP transport');
    // HTTP server for MCP Streamable HTTP transport + REST API
    const http = await import('http');
    const httpServer = http.createServer(async (req, res) => {
        // Enable CORS for external access
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
        if (req.method === 'OPTIONS') {
            res.writeHead(200);
            res.end();
            return;
        }
        // Helper function to get request body
        const getRequestBody = () => {
            return new Promise((resolve) => {
                let body = '';
                req.on('data', chunk => {
                    body += chunk.toString();
                });
                req.on('end', () => {
                    resolve(body);
                });
            });
        };
        // Helper function to validate API key from headers or body
        const validateRequest = async () => {
            const headerApiKey = req.headers['x-api-key'];
            const authHeader = req.headers['authorization'];
            let bodyApiKey;
            let parsedBody;
            if (req.method === 'POST') {
                try {
                    const bodyStr = await getRequestBody();
                    parsedBody = JSON.parse(bodyStr);
                    bodyApiKey = parsedBody.apiKey;
                }
                catch {
                    // Invalid JSON or no body
                }
            }
            const apiKey = headerApiKey || (authHeader?.replace('Bearer ', '')) || bodyApiKey;
            return {
                isValid: validateApiKey(apiKey),
                apiKey,
                body: parsedBody
            };
        };
        const url = new URL(req.url || '/', `http://${req.headers.host}`);
        try {
            // Health check endpoints
            if (url.pathname === '/health' || url.pathname === '/health/live') {
                const basicHealth = {
                    status: 'healthy',
                    server: 'productivity-toolkit-mcp',
                    version: '1.0.0',
                    timestamp: new Date().toISOString(),
                    uptime: Math.floor((Date.now() - healthState.startTime) / 1000)
                };
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(basicHealth));
                return;
            }
            // Readiness check endpoint
            if (url.pathname === '/health/ready') {
                const mcpReady = checkMcpCapabilities();
                const apiKeyReady = !!REQUIRED_API_KEY;
                const ready = mcpReady && apiKeyReady && healthState.isReady;
                res.writeHead(ready ? 200 : 503, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    ready,
                    checks: {
                        mcp: mcpReady,
                        api_key: apiKeyReady,
                        server_ready: healthState.isReady
                    },
                    timestamp: new Date().toISOString()
                }));
                return;
            }
            // Detailed health status endpoint
            if (url.pathname === '/health/detailed') {
                const detailedHealth = getDetailedHealthStatus();
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(detailedHealth));
                return;
            }
            // MCP-specific health check endpoint
            if (url.pathname === '/mcp/health') {
                const mcpHealth = {
                    status: checkMcpCapabilities() ? 'healthy' : 'unhealthy',
                    protocol_version: '2024-11-05',
                    server_info: {
                        name: 'productivity-toolkit',
                        version: '1.0.0'
                    },
                    capabilities: {
                        tools: {},
                        logging: {},
                        prompts: {},
                        resources: {}
                    },
                    transport: 'streamable_http',
                    connection_type: 'stateless',
                    tools_available: 6,
                    timestamp: new Date().toISOString()
                };
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(mcpHealth));
                return;
            }
            // Service info endpoint
            if (url.pathname === '/info') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    service: 'productivity-toolkit-mcp',
                    version: '1.0.0',
                    transports: ['streamable_http', 'rest_api'],
                    mcp_endpoint: '/mcp',
                    tools: [
                        'generate-password',
                        'generate-qr-data',
                        'base64-convert',
                        'generate-uuid',
                        'generate-color-palette',
                        'generate-qr-code'
                    ],
                    endpoints: {
                        'POST /api/generate-password': 'Generate secure passwords',
                        'POST /api/generate-qr-code': 'Generate QR codes',
                        'POST /api/generate-qr-data': 'Generate QR data strings',
                        'POST /api/generate-uuid': 'Generate UUIDs',
                        'POST /api/generate-color-palette': 'Generate color palettes',
                        'POST /api/base64-convert': 'Encode/decode Base64',
                        'POST /mcp': 'MCP Streamable HTTP commands',
                        'GET /mcp': 'MCP Server-Sent Events stream'
                    },
                    authentication: 'API key required via X-API-Key header, Authorization header, or apiKey in request body'
                }));
                return;
            }
            // Root endpoint
            if (url.pathname === '/') {
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end('Productivity Toolkit MCP Server\n\nSupports:\n- MCP Streamable HTTP at /mcp\n- REST API at /api/*\n- Health check at /health');
                return;
            }
            // MCP Streamable HTTP endpoint
            if (url.pathname === '/mcp') {
                await handleMcpStreamableHttp(req, res);
                return;
            }
            // API endpoint routing
            if (req.url?.startsWith('/api/') && req.method === 'POST') {
                const { isValid, body } = await validateRequest();
                if (!isValid) {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Invalid or missing API key' }));
                    return;
                }
                // Route to specific tool handlers
                const endpoint = req.url.replace('/api/', '');
                let result;
                switch (endpoint) {
                    case 'generate-password':
                        result = await handlePasswordGeneration(body || {});
                        break;
                    case 'generate-qr-code':
                        result = await handleQRCodeGeneration(body || {});
                        break;
                    case 'generate-qr-data':
                        result = await handleQRDataGeneration(body || {});
                        break;
                    case 'generate-uuid':
                        result = await handleUUIDGeneration(body || {});
                        break;
                    case 'generate-color-palette':
                        result = await handleColorPaletteGeneration(body || {});
                        break;
                    case 'base64-convert':
                        result = await handleBase64Conversion(body || {});
                        break;
                    default:
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'Endpoint not found' }));
                        return;
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(result));
                return;
            }
            // 404 for all other routes
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Not Found' }));
        }
        catch (error) {
            console.error('HTTP request error:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal server error' }));
        }
    });
    const port = parseInt(process.env.PORT || '3000', 10);
    httpServer.listen(port, '0.0.0.0', () => {
        console.log(`Server running on port ${port}`);
        console.log(`- MCP Streamable HTTP: http://localhost:${port}/mcp`);
        console.log(`- REST API: http://localhost:${port}/api/*`);
        console.log(`- Health check: http://localhost:${port}/health`);
    });
    // Handle server errors
    httpServer.on('error', (err) => {
        console.error('HTTP server error:', err);
    });
}
else {
    console.log('Starting in MCP stdio mode for local development');
    // Start receiving messages on stdin and sending messages on stdout (local MCP mode)
    const transport = new StdioServerTransport();
    await server.connect(transport);
}
//# sourceMappingURL=server.js.map