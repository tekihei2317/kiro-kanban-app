export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/health') {
      try {
        // データベース接続をテスト - 簡単なクエリを実行
        const result = await env.DB.prepare('SELECT 1 as test').first();

        // テーブルの存在確認
        const tables = await env.DB.prepare(
          `
          SELECT name FROM sqlite_master 
          WHERE type='table' AND name IN ('boards', 'lists', 'cards')
        `
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

    if (url.pathname === '/api/boards/test') {
      try {
        // テスト用のボードを作成
        const testBoard = {
          id: 'test-board-' + Date.now(),
          title: 'Test Board',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // ボードを挿入
        await env.DB.prepare(
          `
          INSERT INTO boards (id, title, created_at, updated_at) 
          VALUES (?, ?, ?, ?)
        `
        )
          .bind(
            testBoard.id,
            testBoard.title,
            testBoard.createdAt.getTime(),
            testBoard.updatedAt.getTime()
          )
          .run();

        // ボードを取得
        const retrievedBoard = await env.DB.prepare(
          'SELECT * FROM boards WHERE id = ?'
        )
          .bind(testBoard.id)
          .first();

        return Response.json({
          message: 'Board test successful',
          inserted: testBoard,
          retrieved: retrievedBoard,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        return Response.json(
          {
            message: 'Board test failed',
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
          },
          { status: 500 }
        );
      }
    }

    if (url.pathname === '/api/boards') {
      if (request.method === 'GET') {
        try {
          // 全てのボードを取得
          const boards = await env.DB.prepare(
            'SELECT * FROM boards ORDER BY created_at DESC'
          ).all();

          return Response.json({
            message: 'Boards retrieved successfully',
            boards: boards.results || [],
            count: boards.results?.length || 0,
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          return Response.json(
            {
              message: 'Failed to retrieve boards',
              error: error instanceof Error ? error.message : 'Unknown error',
              timestamp: new Date().toISOString(),
            },
            { status: 500 }
          );
        }
      }

      if (request.method === 'POST') {
        try {
          const body = (await request.json()) as { title: string };

          if (!body.title) {
            return Response.json(
              {
                message: 'Title is required',
                timestamp: new Date().toISOString(),
              },
              { status: 400 }
            );
          }

          const newBoard = {
            id:
              'board-' +
              Date.now() +
              '-' +
              Math.random().toString(36).substr(2, 9),
            title: body.title,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          // ボードを挿入
          await env.DB.prepare(
            `
            INSERT INTO boards (id, title, created_at, updated_at) 
            VALUES (?, ?, ?, ?)
          `
          )
            .bind(
              newBoard.id,
              newBoard.title,
              newBoard.createdAt.getTime(),
              newBoard.updatedAt.getTime()
            )
            .run();

          return Response.json(
            {
              message: 'Board created successfully',
              board: newBoard,
              timestamp: new Date().toISOString(),
            },
            { status: 201 }
          );
        } catch (error) {
          return Response.json(
            {
              message: 'Failed to create board',
              error: error instanceof Error ? error.message : 'Unknown error',
              timestamp: new Date().toISOString(),
            },
            { status: 500 }
          );
        }
      }
    }

    return new Response(null, { status: 404 });
  },
} satisfies ExportedHandler<Env>;
