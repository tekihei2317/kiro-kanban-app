import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { router } from './trpc';
import { boardsRouter } from './routers/boards';
import { listsRouter } from './routers/lists';
import { cardsRouter } from './routers/cards';

// Main app router
export const appRouter = router({
  boards: boardsRouter,
  lists: listsRouter,
  cards: cardsRouter,
});

export type AppRouter = typeof appRouter;

// tRPC request handler
export function createTRPCHandler(env: Env) {
  return (request: Request) =>
    fetchRequestHandler({
      endpoint: '/api/trpc',
      req: request,
      router: appRouter,
      createContext: () => ({ env }),
    });
}
