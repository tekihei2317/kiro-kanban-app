import type { Board, List, Card } from '../types';

// モックボードデータ
export const mockBoards: Board[] = [
  {
    id: 'board-1',
    title: 'プロジェクト管理',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'board-2',
    title: 'マーケティング戦略',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: 'board-3',
    title: '開発タスク',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-25'),
  },
];

// モックリストデータ
export const mockLists: List[] = [
  {
    id: 'list-1',
    boardId: 'board-1',
    title: 'TODO',
    position: 0,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'list-2',
    boardId: 'board-1',
    title: '進行中',
    position: 1,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'list-3',
    boardId: 'board-1',
    title: 'レビュー',
    position: 2,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'list-4',
    boardId: 'board-1',
    title: '完了',
    position: 3,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

// モックカードデータ
export const mockCards: Card[] = [
  {
    id: 'card-1',
    listId: 'list-1',
    title: 'プロジェクト計画書作成',
    description: 'プロジェクトの全体計画を作成し、スケジュールを決定する',
    dueDate: new Date('2024-02-15'),
    position: 0,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'card-2',
    listId: 'list-1',
    title: 'チームメンバーのアサイン',
    description: '各タスクに適切なメンバーを割り当てる',
    dueDate: new Date('2024-02-10'),
    position: 1,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
  {
    id: 'card-3',
    listId: 'list-2',
    title: 'UI/UXデザイン',
    description: 'アプリケーションのユーザーインターフェースをデザインする',
    dueDate: new Date('2024-02-20'),
    position: 0,
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: 'card-4',
    listId: 'list-2',
    title: 'データベース設計',
    description: 'アプリケーションで使用するデータベースの構造を設計する',
    dueDate: null,
    position: 1,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-12'),
  },
  {
    id: 'card-5',
    listId: 'list-3',
    title: 'API実装',
    description: 'バックエンドAPIの実装とテスト',
    dueDate: new Date('2024-02-25'),
    position: 0,
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'card-6',
    listId: 'list-4',
    title: '環境構築',
    description: '開発環境とCI/CDパイプラインの構築',
    dueDate: null,
    position: 0,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-20'),
  },
];

// 初期状態のモックデータ
export const mockAppState = {
  boards: mockBoards,
  lists: mockLists,
  cards: mockCards,
  currentBoardId: 'board-1',
};
