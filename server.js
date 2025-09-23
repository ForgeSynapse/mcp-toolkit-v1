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
// Create an MCP server
const server = new McpServer({
    name: 'productivity-toolkit',
    version: '1.0.0',
});
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
console.log('Starting MCP Server...');
console.log('Environment:', process.env.NODE_ENV);
console.log('Render:', !!process.env.RENDER);
console.log('API Key configured:', !!REQUIRED_API_KEY);
// Check if running in web service mode (Render) or stdio mode (local MCP)
if (process.env.RENDER || process.env.NODE_ENV === 'production') {
    console.log('Starting in HTTP mode for web deployment');
    // HTTP server for Render deployment
    const http = await import('http');
    const httpServer = http.createServer((req, res) => {
        if (req.url === '/health') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                status: 'healthy',
                server: 'productivity-toolkit-mcp',
                tools: ['generate-password', 'generate-qr-data', 'base64-convert', 'generate-uuid', 'generate-color-palette', 'generate-qr-code']
            }));
        }
        else {
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('MCP Server is running. This is a Model Context Protocol server, not a web API.');
        }
    });
    const port = parseInt(process.env.PORT || '3000', 10);
    httpServer.listen(port, '0.0.0.0', () => {
        console.log(`HTTP server running on port ${port} for health checks`);
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