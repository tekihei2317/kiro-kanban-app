import { createTRPCHandler } from './trpc';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Handle tRPC requests
    if (url.pathname.startsWith('/api/trpc')) {
      const trpcHandler = createTRPCHandler(env);
      return trpcHandler(request);
    }

    // Health check endpoint
    if (url.pathname === '/api/health') {
      try {
        // データベース接続をテスト
        const result = await env.DB.prepare('SELECT 1 as test').first();

        // テーブルの存在確認
        const tables = await env.DB.prepare(
          `SELECT name FROM sqlite_master 
           WHERE type='table' AND name IN ('boards', 'lists', 'cards')`
        ).all();

        return Response.json({
          message: 'Database connection successful',
          database: 'Connected to D1',
          testQuery: result,
          tables: tables.results || [],
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        return Response.json(
          {
            message: 'Database connection failed',
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
          },
          { status: 500 }
        );
      }
    }

    return new Response(null, { status: 404 });
  },
} satisfies ExportedHandler<Env>;
