# mcp-time-worker

A Cloudflare Workers-based MCP (Model Context Protocol) server that provides timezone-aware time information.

## Features

- Returns current date and time in any IANA timezone
- Runs on Cloudflare's global edge network
- Implements the Model Context Protocol for AI agent integration
- Configurable default timezone via environment variables
- ISO 8601-compatible time format with UTC offset

## Prerequisites

- Node.js 18 or later
- Cloudflare account (for deployment)
- Wrangler CLI (installed via npm)

## Installation

```bash
npm install
```

## Development

Start the local development server:

```bash
npm run dev
```

The MCP server will be available locally for testing with MCP clients.

## Deployment

Deploy to Cloudflare Workers:

```bash
npm run deploy
```

### Custom Timezone Configuration

Override the default timezone during deployment:

```bash
wrangler deploy --var DEFAULT_TIMEZONE:America/New_York
```

Or set it in the Cloudflare dashboard under Workers > Settings > Environment Variables.

## Usage

This MCP server exposes a single tool that can be called by any MCP client:

### Tool: `get_time`

Returns the current date and time in a specified timezone.

**Parameters:**
- `timezone` (optional): IANA timezone identifier (e.g., "Asia/Tokyo", "America/New_York", "Europe/London")
  - If not provided, uses the `DEFAULT_TIMEZONE` environment variable
  - Final fallback: "Asia/Tokyo"

**Response Format:**
```
YYYY-MM-DDTHH:MM:SS±HH:MM
```

Example: `2025-11-27T15:30:45+09:00`

### Example MCP Client Configuration

Add to your MCP client configuration (e.g., Claude Desktop):

```json
{
  "mcpServers": {
    "time": {
      "url": "https://your-worker.your-subdomain.workers.dev"
    }
  }
}
```

## Configuration

### wrangler.toml

The default timezone is configured in `wrangler.toml`:

```toml
[vars]
DEFAULT_TIMEZONE = "Asia/Tokyo"
```

Modify this value to change the default timezone for your deployment.

## Technical Details

- **Runtime**: Cloudflare Workers (Edge)
- **Protocol**: Model Context Protocol (MCP)
- **Timezone Library**: Native `Intl.DateTimeFormat` API
- **Validation**: Zod schema validation
- **CORS**: Enabled with wildcard origin (`*`)

## License

MIT License - see [LICENSE](LICENSE) file for details
