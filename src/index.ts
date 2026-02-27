import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { createMcpHandler } from 'agents/mcp';
import { z } from 'zod';

export interface Env {
  DEFAULT_TIMEZONE?: string;
}

function formatTime(tz: string): string {
  const now = new Date();
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23'
    })
      .formatToParts(now)
      .reduce<Record<string, string>>((acc, p) => {
        if (p.type !== 'literal') acc[p.type] = p.value;
        return acc;
      }, {});

    const utc = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
    const zoned = new Date(now.toLocaleString('en-US', { timeZone: tz }));
    const offsetMinutes = (zoned.getTime() - utc.getTime()) / 60000;

    const sign = offsetMinutes >= 0 ? '+' : '-';
    const abs = Math.abs(offsetMinutes);
    const hh = String(Math.floor(abs / 60)).padStart(2, '0');
    const mm = String(abs % 60).padStart(2, '0');
    const offset = `${sign}${hh}:${mm}`;

    return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}${offset}`;
  } catch (err) {
    throw new Error('Invalid timezone');
  }
}

function createServer(env: Env): McpServer {
  const server = new McpServer({
    name: 'what-time',
    version: '0.2.0'
  });

  server.tool(
    'get_time',
    'Returns the current date and time (to the second) in a given IANA time zone. Defaults to env DEFAULT_TIMEZONE or Asia/Tokyo.',
    {
      timezone: z.string().describe('IANA time zone, e.g. Asia/Tokyo').optional()
    },
    async ({ timezone }) => {
      const tz = timezone || env.DEFAULT_TIMEZONE || 'Asia/Tokyo';
      const now = formatTime(tz);
      return {
        content: [{ type: 'text', text: now }],
        metadata: { timezone: tz }
      };
    }
  );

  return server;
}

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext): Response | Promise<Response> {
    const handler = createMcpHandler(createServer(env), {
      route: '/mcp',
      corsOptions: { origin: '*' }
    });
    return handler(request, env, ctx);
  }
};
