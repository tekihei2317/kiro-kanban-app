import { initTRPC } from '@trpc/server';

// Initialize tRPC
const t = initTRPC.context<{ env: Env }>().create();

// Create router and procedure helpers
export const router = t.router;
export const publicProcedure = t.procedure;

// Utility function to generate unique IDs
export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 9)}`;
}
