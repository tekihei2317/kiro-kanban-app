import { z } from 'zod';
import { eq, asc } from 'drizzle-orm';
import { createDB, schema } from '../../db';
import { router, publicProcedure, generateId } from '../trpc';

// Input validation schemas
const createCardSchema = z.object({
  listId: z.string(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  dueDate: z.date().optional(),
  position: z.number().int().min(0),
});

const updateCardSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().optional(),
  dueDate: z.date().optional(),
  position: z.number().int().min(0).optional(),
});

const moveCardSchema = z.object({
  cardId: z.string(),
  newListId: z.string(),
  newPosition: z.number().int().min(0),
});

export const cardsRouter = router({
  // Get cards by list ID
  getByListId: publicProcedure
    .input(z.object({ listId: z.string() }))
    .query(async ({ input, ctx }) => {
      const db = createDB(ctx.env.DB);
      const cards = await db
        .select()
        .from(schema.cards)
        .where(eq(schema.cards.listId, input.listId))
        .orderBy(asc(schema.cards.position));
      return cards;
    }),

  // Get card by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const db = createDB(ctx.env.DB);
      const card = await db
        .select()
        .from(schema.cards)
        .where(eq(schema.cards.id, input.id))
        .limit(1);

      if (card.length === 0) {
        throw new Error('Card not found');
      }

      return card[0];
    }),

  // Create card
  create: publicProcedure
    .input(createCardSchema)
    .mutation(async ({ input, ctx }) => {
      const db = createDB(ctx.env.DB);
      const now = new Date();

      const newCard = {
        id: generateId('card'),
        listId: input.listId,
        title: input.title,
        description: input.description || null,
        dueDate: input.dueDate || null,
        position: input.position,
        createdAt: now,
        updatedAt: now,
      };

      await db.insert(schema.cards).values(newCard);
      return newCard;
    }),

  // Update card
  update: publicProcedure
    .input(z.object({ id: z.string(), data: updateCardSchema }))
    .mutation(async ({ input, ctx }) => {
      const db = createDB(ctx.env.DB);
      const now = new Date();

      const result = await db
        .update(schema.cards)
        .set({ ...input.data, updatedAt: now })
        .where(eq(schema.cards.id, input.id))
        .returning();

      if (result.length === 0) {
        throw new Error('Card not found');
      }

      return result[0];
    }),

  // Delete card
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const db = createDB(ctx.env.DB);

      const result = await db
        .delete(schema.cards)
        .where(eq(schema.cards.id, input.id))
        .returning();

      if (result.length === 0) {
        throw new Error('Card not found');
      }

      return { success: true };
    }),

  // Move card to different list or position
  move: publicProcedure
    .input(moveCardSchema)
    .mutation(async ({ input, ctx }) => {
      const db = createDB(ctx.env.DB);
      const now = new Date();

      const result = await db
        .update(schema.cards)
        .set({
          listId: input.newListId,
          position: input.newPosition,
          updatedAt: now,
        })
        .where(eq(schema.cards.id, input.cardId))
        .returning();

      if (result.length === 0) {
        throw new Error('Card not found');
      }

      return result[0];
    }),
});
