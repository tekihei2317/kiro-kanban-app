import { z } from 'zod';
import { eq, asc } from 'drizzle-orm';
import { createDB, schema } from '../../db';
import { router, publicProcedure, generateId } from '../trpc';

// Input validation schemas
const createListSchema = z.object({
  boardId: z.string(),
  title: z.string().min(1, 'Title is required'),
  position: z.number().int().min(0),
});

const updateListSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  position: z.number().int().min(0).optional(),
});

const reorderListsSchema = z.object({
  boardId: z.string(),
  listIds: z.array(z.string()),
});

export const listsRouter = router({
  // Get lists by board ID
  getByBoardId: publicProcedure
    .input(z.object({ boardId: z.string() }))
    .query(async ({ input, ctx }) => {
      const db = createDB(ctx.env.DB);
      const lists = await db
        .select()
        .from(schema.lists)
        .where(eq(schema.lists.boardId, input.boardId))
        .orderBy(asc(schema.lists.position));
      return lists;
    }),

  // Create list
  create: publicProcedure
    .input(createListSchema)
    .mutation(async ({ input, ctx }) => {
      const db = createDB(ctx.env.DB);
      const now = new Date();

      const newList = {
        id: generateId('list'),
        boardId: input.boardId,
        title: input.title,
        position: input.position,
        createdAt: now,
        updatedAt: now,
      };

      await db.insert(schema.lists).values(newList);
      return newList;
    }),

  // Update list
  update: publicProcedure
    .input(z.object({ id: z.string(), data: updateListSchema }))
    .mutation(async ({ input, ctx }) => {
      const db = createDB(ctx.env.DB);
      const now = new Date();

      const result = await db
        .update(schema.lists)
        .set({ ...input.data, updatedAt: now })
        .where(eq(schema.lists.id, input.id))
        .returning();

      if (result.length === 0) {
        throw new Error('List not found');
      }

      return result[0];
    }),

  // Delete list
  delete: publicProcedure.input(z.object({ id: z.string() })).mutation(async ({ input, ctx }) => {
    const db = createDB(ctx.env.DB);

    const result = await db
      .delete(schema.lists)
      .where(eq(schema.lists.id, input.id))
      .returning();

    if (result.length === 0) {
      throw new Error('List not found');
    }

    return { success: true };
  }),

  // Reorder lists
  reorder: publicProcedure
    .input(reorderListsSchema)
    .mutation(async ({ input, ctx }) => {
      const db = createDB(ctx.env.DB);
      const now = new Date();

      // Update positions for each list
      const updatePromises = input.listIds.map((listId, index) =>
        db
          .update(schema.lists)
          .set({ position: index, updatedAt: now })
          .where(eq(schema.lists.id, listId))
      );

      await Promise.all(updatePromises);

      return { success: true };
    }),
});
