import { z } from 'zod';
import { eq, desc } from 'drizzle-orm';
import { createDB, schema } from '../../db';
import { router, publicProcedure, generateId } from '../trpc';

// Input validation schemas
const createBoardSchema = z.object({
  title: z.string().min(1, 'Title is required'),
});

const updateBoardSchema = z.object({
  title: z.string().min(1, 'Title is required'),
});

export const boardsRouter = router({
  // Get all boards
  getAll: publicProcedure.query(async ({ ctx }) => {
    const db = createDB(ctx.env.DB);
    const boards = await db
      .select()
      .from(schema.boards)
      .orderBy(desc(schema.boards.createdAt));
    return boards;
  }),

  // Get board by ID
  getById: publicProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const db = createDB(ctx.env.DB);
    const board = await db
      .select()
      .from(schema.boards)
      .where(eq(schema.boards.id, input))
      .limit(1);

    if (board.length === 0) {
      throw new Error('Board not found');
    }

    return board[0];
  }),

  // Create board
  create: publicProcedure
    .input(createBoardSchema)
    .mutation(async ({ input, ctx }) => {
      const db = createDB(ctx.env.DB);
      const now = new Date();

      const newBoard = {
        id: generateId('board'),
        title: input.title,
        createdAt: now,
        updatedAt: now,
      };

      await db.insert(schema.boards).values(newBoard);
      return newBoard;
    }),

  // Update board
  update: publicProcedure
    .input(z.object({ id: z.string(), data: updateBoardSchema }))
    .mutation(async ({ input, ctx }) => {
      const db = createDB(ctx.env.DB);
      const now = new Date();

      const result = await db
        .update(schema.boards)
        .set({ ...input.data, updatedAt: now })
        .where(eq(schema.boards.id, input.id))
        .returning();

      if (result.length === 0) {
        throw new Error('Board not found');
      }

      return result[0];
    }),

  // Delete board
  delete: publicProcedure.input(z.string()).mutation(async ({ input, ctx }) => {
    const db = createDB(ctx.env.DB);

    const result = await db
      .delete(schema.boards)
      .where(eq(schema.boards.id, input))
      .returning();

    if (result.length === 0) {
      throw new Error('Board not found');
    }

    return { success: true };
  }),
});
