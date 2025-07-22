// Database types - define them here to avoid circular imports
export interface Board {
  id: string;
  title: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface NewBoard {
  id?: string;
  title: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface List {
  id: string;
  boardId: string;
  title: string;
  position: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface NewList {
  id?: string;
  boardId: string;
  title: string;
  position: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Card {
  id: string;
  listId: string;
  title: string;
  description?: string | null;
  dueDate?: Date | string | null;
  position: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface NewCard {
  id?: string;
  listId: string;
  title: string;
  description?: string | null;
  dueDate?: Date | null;
  position: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Application state types
export interface AppState {
  boards: Board[];
  lists: List[];
  cards: Card[];
  currentBoardId: string | null;
}

// Action types for state management
export type AppAction =
  | { type: 'SET_BOARDS'; payload: Board[] }
  | { type: 'ADD_BOARD'; payload: Board }
  | { type: 'UPDATE_BOARD'; payload: { id: string; updates: Partial<Board> } }
  | { type: 'DELETE_BOARD'; payload: string }
  | { type: 'SET_CURRENT_BOARD'; payload: string | null }
  | { type: 'SET_LISTS'; payload: List[] }
  | { type: 'ADD_LIST'; payload: List }
  | { type: 'UPDATE_LIST'; payload: { id: string; updates: Partial<List> } }
  | { type: 'DELETE_LIST'; payload: string }
  | { type: 'REORDER_LISTS'; payload: { boardId: string; listIds: string[] } }
  | { type: 'SET_CARDS'; payload: Card[] }
  | { type: 'ADD_CARD'; payload: Card }
  | { type: 'UPDATE_CARD'; payload: { id: string; updates: Partial<Card> } }
  | { type: 'DELETE_CARD'; payload: string }
  | {
      type: 'MOVE_CARD';
      payload: { cardId: string; newListId: string; newPosition: number };
    }
  | { type: 'REORDER_CARDS'; payload: { listId: string; cardIds: string[] } };

// API input types
export interface CreateBoardInput {
  title: string;
}

export interface UpdateBoardInput {
  title?: string;
}

export interface CreateListInput {
  boardId: string;
  title: string;
  position: number;
}

export interface UpdateListInput {
  title?: string;
  position?: number;
}

export interface CreateCardInput {
  listId: string;
  title: string;
  description?: string;
  dueDate?: Date;
  position: number;
}

export interface UpdateCardInput {
  title?: string;
  description?: string;
  dueDate?: Date;
  position?: number;
}

// tRPC API types
export interface MoveCardInput {
  cardId: string;
  newListId: string;
  newPosition: number;
}

export interface ReorderListsInput {
  boardId: string;
  listIds: string[];
}
