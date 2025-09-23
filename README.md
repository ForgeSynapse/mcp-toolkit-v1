# Productivity Toolkit MCP Server

A comprehensive Model Context Protocol (MCP) server that provides essential productivity tools for developers and power users. This server offers secure, API-key authenticated access to password generation, QR code creation, Base64 encoding/decoding, UUID generation, and color palette tools.

## Features

🔐 **Password Generator** - Create secure passwords with customizable options
📱 **QR Code Tools** - Generate QR codes and formatted data strings
🔄 **Base64 Converter** - Encode and decode text using Base64
🆔 **UUID Generator** - Generate unique identifiers (UUID v4)
🎨 **Color Palette Generator** - Create beautiful color schemes for design projects

## Quick Start

### Prerequisites

- Node.js 16+
- npm or yarn
- OpenSSL (for API key generation)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ForgeSynapse/mcp-toolkit-v1.git
   cd mcp-toolkit-v1
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Generate API Key**
   ```bash
   openssl rand -hex 32
   ```

4. **Set environment variable**
   ```bash
   export MCP_API_KEY="your_generated_api_key_here"
   ```

5. **Run the server**
   ```bash
   npx ts-node server.ts
   ```

## Tools Reference

### 🔐 Password Generator

Generate secure passwords with customizable complexity.

**Tool**: `generate-password`

**Parameters**:
- `apiKey` (string, required) - Authentication key
- `length` (number, optional) - Password length (8-128, default: 16)
- `includeNumbers` (boolean, optional) - Include numbers (default: true)
- `includeSymbols` (boolean, optional) - Include symbols (default: true)
- `includeUppercase` (boolean, optional) - Include uppercase letters (default: true)
- `includeLowercase` (boolean, optional) - Include lowercase letters (default: true)

**Example**:
```json
{
  "apiKey": "your_api_key",
  "length": 20,
  "includeSymbols": true,
  "includeNumbers": true
}
```

### 📱 QR Code Data Generator

Create formatted data strings for various QR code types.

**Tool**: `generate-qr-data`

**Parameters**:
- `apiKey` (string, required) - Authentication key
- `type` (enum, required) - QR code type: `wifi`, `contact`, `url`, `text`
- `data` (object, required) - Type-specific data fields

**WiFi QR Data**:
```json
{
  "apiKey": "your_api_key",
  "type": "wifi",
  "data": {
    "ssid": "MyNetwork",
    "password": "mypassword",
    "security": "WPA"
  }
}
```

**Contact QR Data**:
```json
{
  "apiKey": "your_api_key",
  "type": "contact",
  "data": {
    "name": "John Doe",
    "phone": "+1234567890",
    "email": "john@example.com"
  }
}
```

### 📱 QR Code Generator

Generate actual QR codes in multiple formats.

**Tool**: `generate-qr-code`

**Parameters**:
- `apiKey` (string, required) - Authentication key
- `text` (string, required) - Text to encode
- `format` (enum, optional) - Output format: `png`, `svg`, `terminal` (default: png)
- `errorCorrectionLevel` (enum, optional) - Error correction: `L`, `M`, `Q`, `H` (default: M)
- `width` (number, optional) - QR code width in pixels (100-1000, default: 200)

**Example**:
```json
{
  "apiKey": "your_api_key",
  "text": "https://example.com",
  "format": "png",
  "width": 300
}
```

### 🔄 Base64 Converter

Encode or decode text using Base64 encoding.

**Tool**: `base64-convert`

**Parameters**:
- `apiKey` (string, required) - Authentication key
- `operation` (enum, required) - Operation type: `encode` or `decode`
- `text` (string, required) - Text to process

**Example**:
```json
{
  "apiKey": "your_api_key",
  "operation": "encode",
  "text": "Hello, World!"
}
```

### 🆔 UUID Generator

Generate unique identifiers (UUID v4).

**Tool**: `generate-uuid`

**Parameters**:
- `apiKey` (string, required) - Authentication key
- `count` (number, optional) - Number of UUIDs to generate (1-10, default: 1)

**Example**:
```json
{
  "apiKey": "your_api_key",
  "count": 5
}
```

### 🎨 Color Palette Generator

Create color palettes for design projects.

**Tool**: `generate-color-palette`

**Parameters**:
- `apiKey` (string, required) - Authentication key
- `baseColor` (string, optional) - Base color in hex format (#RRGGBB)
- `type` (enum, optional) - Palette type: `monochromatic`, `complementary`, `triadic`, `random` (default: random)
- `count` (number, optional) - Number of colors (3-10, default: 5)

**Example**:
```json
{
  "apiKey": "your_api_key",
  "baseColor": "#3498db",
  "type": "monochromatic",
  "count": 6
}
```

## Development

### Project Structure

```
ice-cream-mcp-server/
├── server.ts           # Main MCP server implementation
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
├── README.md          # This file
├── DEPLOYMENT.md      # Deployment guide
└── CLAUDE.md          # Development instructions
```

### Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment**
   ```bash
   export MCP_API_KEY="$(openssl rand -hex 32)"
   ```

3. **Run with auto-reload**
   ```bash
   npx ts-node --watch server.ts
   ```

4. **TypeScript compilation**
   ```bash
   npx tsc
   ```

### Architecture

- **MCP Server**: Built with `@modelcontextprotocol/sdk`
- **Transport**: Uses `StdioServerTransport` for communication
- **Authentication**: API key validation for all tools
- **TypeScript**: Fully typed with Zod schema validation

## Deployment

### Render (Recommended)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions.

**Quick Deploy to Render**:
1. Connect GitHub repository to Render
2. Create new Web Service
3. Set build command: `npm install`
4. Set start command: `npx ts-node server.ts`
5. Add environment variable: `MCP_API_KEY=your_key`

### Other Platforms

This MCP server can be deployed to any platform that supports:
- Node.js runtime
- Long-running processes
- Environment variables
- stdin/stdout communication

## Security

### API Key Requirements

All tools require authentication via the `apiKey` parameter. The server validates this against the `MCP_API_KEY` environment variable.

### Best Practices

- Generate strong API keys using `openssl rand -hex 32`
- Never commit API keys to version control
- Rotate API keys regularly
- Use environment variables for configuration
- Monitor server logs for suspicious activity

## Usage Examples

### Using with Claude Desktop

Add this server to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "productivity-toolkit": {
      "command": "npx",
      "args": ["ts-node", "/path/to/server.ts"],
      "env": {
        "MCP_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

### Using with MCP Client

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';

const client = new Client({
  name: "productivity-client",
  version: "1.0.0"
});

// Call password generator tool
const result = await client.callTool("generate-password", {
  apiKey: "your_api_key",
  length: 16,
  includeSymbols: true
});
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Add tests if applicable
5. Commit your changes: `git commit -am 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

- Create an issue for bugs or feature requests
- Check the [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment help
- Review server logs for troubleshooting

## Changelog

### v1.0.0
- Initial release
- Password generator tool
- QR code data generator tool
- QR code generator tool
- Base64 converter tool
- UUID generator tool
- Color palette generator tool
- API key authentication
- Render deployment support