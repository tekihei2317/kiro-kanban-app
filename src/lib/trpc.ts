import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '../../worker/trpc';

// tRPC React クライアントを作成
export const trpc = createTRPCReact<AppRouter>();
