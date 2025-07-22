import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './worker/db/schema.ts',
  out: './migrations',
  dialect: 'sqlite',
  // For local development, we'll use wrangler d1 commands
  // No need for HTTP credentials in local development
});
