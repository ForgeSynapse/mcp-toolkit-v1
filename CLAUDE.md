# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an MCP (Model Context Protocol) server for weather data, built with TypeScript and the @modelcontextprotocol/sdk. Despite the repository name "ice-cream-mcp-server", this implements a weather service that provides current weather information by city using the Open-Meteo API.

## Architecture

- **Single file application**: `server.ts` contains the entire MCP server implementation
- **MCP Server**: Uses WebSocket transport for communication with MCP clients
- **Weather API Integration**: Integrates with Open-Meteo's geocoding and weather APIs
- **Tool Registration**: Exposes a single `getWeather` tool that accepts a city name and returns weather data

## Security

This MCP server requires API key authentication for all tools. Set the `MCP_API_KEY` environment variable before running the server.

### Generate an API Key
```bash
# Generate a secure 32-character hex key
openssl rand -hex 32
```

### Set Environment Variable
```bash
export MCP_API_KEY="your_generated_api_key_here"
```

## Development Commands

Since this project has minimal npm scripts configured, use these commands:

### Running the server
```bash
# Set API key and run server
export MCP_API_KEY="your_api_key_here"
npx ts-node server.ts
```

### TypeScript compilation
```bash
npx tsc
```

### Development with auto-reload
```bash
# Set API key and run with auto-reload
export MCP_API_KEY="your_api_key_here"
npx ts-node --watch server.ts
```

## Key Components

### MCP Server Setup (server.ts:7-14)
- Server configured as "weather-mcp" with tool capabilities
- WebSocket server runs on PORT environment variable or defaults to 3000

### Weather Tool (server.ts:17-57)
- Tool name: `getWeather`
- Input: `city` (string, required)
- Process: Geocodes city → fetches weather data → returns formatted response
- Output: city name, temperature, and wind speed

### Transport Layer (server.ts:60-63)
- WebSocket server for MCP client connections
- Each connection creates a new WebSocketServerTransport instance

## Environment

- **TypeScript**: Configured with strict mode and modern ES modules
- **Runtime**: Node.js with ES modules (type: "module" in package.json)
- **Port**: Configurable via PORT environment variable, defaults to 3000