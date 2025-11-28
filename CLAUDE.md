# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Cloudflare Workers-based MCP (Model Context Protocol) server that provides timezone-aware time information. The project uses the `@modelcontextprotocol/sdk` to implement an MCP server and the `agents` package to create HTTP handlers for Cloudflare Workers.

## Development Commands

### Run Development Server
```bash
npm run dev
```
Starts the Wrangler development server with hot-reload. The server will be available locally.

### Deploy to Cloudflare
```bash
npm run deploy
```
Deploys the Worker to Cloudflare's edge network.

### Deploy with Custom Timezone
```bash
wrangler deploy --var DEFAULT_TIMEZONE:America/New_York
```
Override the default timezone (defaults to `Asia/Tokyo`) during deployment.

## Architecture

### Core Components

**src/index.ts** - Main entry point containing:
- MCP server initialization with `@modelcontextprotocol/sdk`
- Single tool: `get_time` - returns current time in specified IANA timezone
- Cloudflare Workers fetch handler that processes MCP requests via HTTP
- Environment variable handling for timezone configuration

### Key Technical Details

**Timezone Handling**: Uses `Intl.DateTimeFormat` to format times in any IANA timezone. The `formatTime()` function:
- Formats date/time components using the specified timezone
- Calculates UTC offset by comparing UTC and zoned timestamps
- Returns ISO 8601-like format: `YYYY-MM-DDTHH:MM:SS±HH:MM`

**Environment Variables**:
- `DEFAULT_TIMEZONE` is configured in `wrangler.toml` and accessed via Cloudflare Workers `env` object
- Stored in module-scoped `currentEnv` variable to be accessible in MCP tool handlers

**MCP Integration**:
- Uses `createMcpHandler` from `agents/mcp` to bridge MCP server and Cloudflare Workers
- CORS is enabled with `allowOrigin: '*'` for broad client access
- Tool schema validation uses Zod

### Configuration Files

- **wrangler.toml**: Cloudflare Workers configuration including compatibility settings and environment variables
- **tsconfig.json**: TypeScript config targeting ES2021 with WebWorker libraries for Cloudflare Workers environment
- **package.json**: Dependencies include MCP SDK, agents framework for Workers integration, and Zod for validation

## Important Notes

- This project uses ES modules (`"type": "module"`)
- The Workers runtime requires `nodejs_compat` compatibility flag
- Timezone parameter is optional; falls back to env `DEFAULT_TIMEZONE` then `Asia/Tokyo`
- The MCP server exposes a single tool that can be called by any MCP client
