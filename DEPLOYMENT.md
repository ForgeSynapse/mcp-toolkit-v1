# Deployment Guide - Render

This guide explains how to deploy the Productivity Toolkit MCP Server to Render.

## Prerequisites

- GitHub account with your MCP server repository
- Render account (free tier available)
- Generated API key for your MCP server

## Step 1: Generate API Key

Before deployment, generate a secure API key:

```bash
# Generate a secure 32-character hex key
openssl rand -hex 32
```

Save this key - you'll need it for the environment configuration.

## Step 2: Prepare Your Repository

Ensure your repository has:
- `package.json` with all dependencies
- `server.ts` as the main server file
- TypeScript configuration

## Step 3: Deploy to Render

### 3.1 Create New Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account if not already connected
4. Select your MCP server repository

### 3.2 Configure Service Settings

**Basic Settings:**
- **Name**: `productivity-toolkit-mcp` (or your preferred name)
- **Region**: Choose closest to your users
- **Branch**: `main` (or your default branch)
- **Runtime**: `Node`

**Build & Deploy Settings:**
- **Build Command**: `npm install`
- **Start Command**: `npx ts-node server.ts`

### 3.3 Environment Variables

In the "Environment" section, add:

| Key | Value |
|-----|-------|
| `MCP_API_KEY` | Your generated API key from Step 1 |
| `NODE_ENV` | `production` |

### 3.4 Advanced Settings (Optional)

- **Auto-Deploy**: Enable to automatically deploy on git pushes
- **Health Check Path**: Leave empty (MCP servers don't use HTTP health checks)

## Step 4: Deploy

1. Click **"Create Web Service"**
2. Render will automatically:
   - Clone your repository
   - Run `npm install`
   - Start your server with `npx ts-node server.ts`

## Step 5: Verify Deployment

### Check Deployment Status
- Monitor the build logs in Render dashboard
- Look for "Server started" or similar success messages
- Ensure no error messages in the logs

### Test Your MCP Server
Your server will be accessible at: `https://your-service-name.onrender.com`

**Note**: MCP servers use stdio transport, so they won't respond to direct HTTP requests. The deployment is successful if:
- Build completes without errors
- Server starts without crashing
- No authentication errors in logs

## Environment Configuration

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MCP_API_KEY` | Authentication key for MCP tools | `a1b2c3d4e5f6...` |

### Optional Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Node.js environment | `development` |
| `PORT` | Server port (Render manages this) | `10000` |

## Using Your Deployed MCP Server

Once deployed, you can connect to your MCP server using:

### Server URL
```
https://your-service-name.onrender.com
```

### Authentication
All tool calls require the `apiKey` parameter with your generated API key.

### Available Tools
- `generate-password` - Generate secure passwords
- `generate-qr-data` - Create QR code data strings
- `base64-convert` - Encode/decode Base64
- `generate-uuid` - Generate UUIDs
- `generate-color-palette` - Create color palettes
- `generate-qr-code` - Generate actual QR codes

## Troubleshooting

### Common Issues

**Build Failures:**
- Check that all dependencies are in `package.json`
- Ensure TypeScript compiles without errors locally
- Verify Node.js version compatibility

**Runtime Errors:**
- Check environment variables are set correctly
- Review server logs in Render dashboard
- Ensure `MCP_API_KEY` is properly configured

**Authentication Issues:**
- Verify API key is correctly set in environment variables
- Check that API key matches exactly (no extra spaces)
- Regenerate API key if needed

### Logs and Monitoring

Access logs via:
1. Render Dashboard → Your Service → Logs tab
2. Real-time log streaming available
3. Filter by log level (info, error, etc.)

### Performance Considerations

**Free Tier Limitations:**
- Service may sleep after 15 minutes of inactivity
- First request after sleep may be slower (cold start)
- Consider upgrading to paid tier for production use

**Scaling:**
- Render automatically handles scaling
- Monitor resource usage in dashboard
- Upgrade service type if needed

## Security Best Practices

### API Key Management
- Never commit API keys to version control
- Use environment variables only
- Rotate API keys regularly
- Use strong, randomly generated keys

### Access Control
- Limit API key distribution
- Monitor usage logs for unusual activity
- Consider implementing rate limiting if needed

## Support

For deployment issues:
- Check Render documentation: https://render.com/docs
- Review MCP SDK documentation
- Check server logs for specific error messages

For MCP server issues:
- Validate tool schemas locally
- Test individual tools before deployment
- Ensure all dependencies are installed