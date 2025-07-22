# 設計書

## 概要

Trello風のカンバンタスク管理アプリケーションを、React + TypeScript + Viteを使用してSPA（Single Page Application）として実装します。モダンなWeb技術を活用し、直感的なユーザーエクスペリエンスと高いパフォーマンスを実現します。

## アーキテクチャ

### 技術スタック（実装済み）

- **フロントエンド**: React 19 + TypeScript + Vite 7
- **バックエンド**: Cloudflare Workers
- **API**: tRPC 11.4.3
- **データベース**: Cloudflare D1 (SQLite)
- **ORM**: Drizzle ORM 0.44.3 + Drizzle Kit 0.31.4
- **状態管理**: React Context API + useReducer（予定）
- **ドラッグ&ドロップ**: @dnd-kit/core 6.3.1 + @dnd-kit/sortable 10.0.0
- **スタイリング**: Tailwind CSS 4.1.11
- **開発ツール**: ESLint 9.30.1 + Prettier + TypeScript 5.8.3
- **テスト**: Vitest 3.2.4 + React Testing Library 16.3.0
- **データフェッチング**: @tanstack/react-query 5.83.0

### アーキテクチャパターン（実装済み構造）

```
プロジェクトルート/
├── src/                    # フロントエンド（React）
│   ├── assets/             # 静的アセット（実装済み）
│   │   ├── Cloudflare_Logo.svg
│   │   └── react.svg
│   ├── components/         # 再利用可能なUIコンポーネント（予定）
│   │   ├── ui/             # 基本UIコンポーネント（Button, Modal, Input等）
│   │   ├── BoardCard.tsx   # ボードカード
│   │   ├── BoardHeader.tsx # ボードヘッダー
│   │   ├── List.tsx        # リスト
│   │   ├── Card.tsx        # カード
│   │   └── AddButton.tsx   # 追加ボタン
│   ├── contexts/           # React Context（予定）
│   ├── hooks/              # カスタムフック（予定）
│   ├── types/              # TypeScript型定義（実装済み）
│   │   └── index.ts        # 共通型定義
│   ├── utils/              # ユーティリティ関数（予定）
│   ├── test/               # テスト設定（実装済み）
│   │   └── setup.ts        # Vitestセットアップ
│   ├── trpc/               # tRPC client setup（予定）
│   ├── App.tsx             # メインアプリケーションコンポーネント（実装済み）
│   ├── main.tsx            # エントリーポイント（実装済み）
│   └── index.css           # グローバルスタイル（Tailwind CSS）（実装済み）
├── worker/                 # Cloudflare Workers（実装済み）
│   ├── db/                 # データベース関連（実装済み）
│   │   ├── index.ts        # データベース接続設定
│   │   └── schema.ts       # Drizzleスキーマ定義
│   └── index.ts            # Workers entry point & API endpoints
├── migrations/             # データベースマイグレーション（実装済み）
│   ├── 0000_round_silverclaw.sql
│   └── meta/
├── public/                 # 静的ファイル（実装済み）
│   └── vite.svg
├── drizzle.config.ts       # Drizzle設定（実装済み）
├── wrangler.jsonc          # Cloudflare Workers設定（実装済み）
├── vite.config.ts          # Vite設定（実装済み）
├── vitest.config.ts        # テスト設定（実装済み）
├── package.json            # 依存関係とスクリプト（実装済み）
└── tsconfig.*.json         # TypeScript設定（実装済み）
```

## コンポーネントとインターフェース

### 主要コンポーネント階層

```
App
├── BoardList           # ボード一覧画面
│   ├── BoardCard       # ボードカード
│   └── AddButton       # ボード追加ボタン
└── BoardView           # ボード詳細画面
    ├── BoardHeader     # ボードヘッダー
    ├── List            # リスト（カード一覧含む）
    │   ├── Card        # カード
    │   └── AddButton   # カード追加ボタン
    └── AddButton       # リスト追加ボタン
```

### 主要インターフェース

```typescript
interface Board {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

interface List {
  id: string;
  boardId: string;
  title: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Card {
  id: string;
  listId: string;
  title: string;
  description?: string;
  dueDate?: Date;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

interface AppState {
  boards: Board[];
  lists: List[];
  cards: Card[];
  currentBoardId: string | null;
}
```

## データモデル

### 状態管理設計

React Context + useReducerパターンを使用して、アプリケーション全体の状態を管理します。

```typescript
type AppAction =
  | { type: 'SET_BOARDS'; payload: Board[] }
  | { type: 'ADD_BOARD'; payload: Board }
  | { type: 'UPDATE_BOARD'; payload: { id: string; updates: Partial<Board> } }
  | { type: 'DELETE_BOARD'; payload: string }
  | { type: 'SET_CURRENT_BOARD'; payload: string | null }
  | { type: 'ADD_LIST'; payload: List }
  | { type: 'UPDATE_LIST'; payload: { id: string; updates: Partial<List> } }
  | { type: 'DELETE_LIST'; payload: string }
  | { type: 'REORDER_LISTS'; payload: { boardId: string; listIds: string[] } }
  | { type: 'ADD_CARD'; payload: Card }
  | { type: 'UPDATE_CARD'; payload: { id: string; updates: Partial<Card> } }
  | { type: 'DELETE_CARD'; payload: string }
  | {
      type: 'MOVE_CARD';
      payload: { cardId: string; newListId: string; newPosition: number };
    }
  | { type: 'REORDER_CARDS'; payload: { listId: string; cardIds: string[] } };
```

### データ永続化（実装済み）

Cloudflare D1データベースとDrizzle ORMを使用してデータを永続化します。

```typescript
// Drizzle Schema（実装済み - worker/db/schema.ts）
export const boards = sqliteTable('boards', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const lists = sqliteTable('lists', {
  id: text('id').primaryKey(),
  boardId: text('board_id')
    .notNull()
    .references(() => boards.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  position: integer('position').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const cards = sqliteTable('cards', {
  id: text('id').primaryKey(),
  listId: text('list_id')
    .notNull()
    .references(() => lists.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  dueDate: integer('due_date', { mode: 'timestamp' }),
  position: integer('position').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// 型定義（実装済み）
export type Board = typeof boards.$inferSelect;
export type NewBoard = typeof boards.$inferInsert;
export type List = typeof lists.$inferSelect;
export type NewList = typeof lists.$inferInsert;
export type Card = typeof cards.$inferSelect;
export type NewCard = typeof cards.$inferInsert;

// データベース接続（実装済み - worker/db/index.ts）
export function createDb(d1: D1Database) {
  return drizzle(d1, { schema });
}

// 現在のAPI実装（worker/index.ts）
// - GET /api/health - データベース接続確認
// - GET /api/boards/test - ボード作成・取得テスト
// - GET /api/boards - ボード一覧取得
// - POST /api/boards - ボード作成

// tRPC API（次のタスクで実装予定）
interface ApiService {
  boards: {
    getAll(): Promise<Board[]>;
    create(data: CreateBoardInput): Promise<Board>;
    update(id: string, data: UpdateBoardInput): Promise<Board>;
    delete(id: string): Promise<void>;
  };
  lists: {
    getByBoardId(boardId: string): Promise<List[]>;
    create(data: CreateListInput): Promise<List>;
    update(id: string, data: UpdateListInput): Promise<List>;
    delete(id: string): Promise<void>;
    reorder(boardId: string, listIds: string[]): Promise<void>;
  };
  cards: {
    getByListId(listId: string): Promise<Card[]>;
    create(data: CreateCardInput): Promise<Card>;
    update(id: string, data: UpdateCardInput): Promise<Card>;
    delete(id: string): Promise<void>;
    move(cardId: string, newListId: string, newPosition: number): Promise<void>;
  };
}
```

## エラーハンドリング

### エラー境界

React Error Boundaryを実装して、予期しないエラーをキャッチし、ユーザーフレンドリーなエラー画面を表示します。

### データ操作エラー

- localStorage操作の失敗
- 不正なデータ形式
- ネットワークエラー（将来の拡張用）

### ユーザーフィードバック

- 成功メッセージ（トースト通知）
- エラーメッセージ（インライン表示）
- ローディング状態の表示

## テスト戦略

### 単体テスト

- **コンポーネントテスト**: React Testing Libraryを使用
- **フックテスト**: カスタムフックの動作検証
- **ユーティリティテスト**: 純粋関数のテスト
- **ストレージサービステスト**: localStorage操作のテスト

### 統合テスト

- **ドラッグ&ドロップテスト**: @dnd-kit/coreの統合テスト
- **状態管理テスト**: Context + Reducerの統合テスト
- **データフローテスト**: コンポーネント間のデータ流れのテスト

### E2Eテスト（将来の拡張）

- **ユーザーシナリオテスト**: 主要なユーザーフローのテスト
- **クロスブラウザテスト**: 異なるブラウザでの動作確認

## パフォーマンス最適化

### React最適化

- **React.memo**: 不要な再レンダリングの防止
- **useMemo/useCallback**: 重い計算とコールバックのメモ化
- **仮想化**: 大量のカード表示時の仮想スクロール（将来の拡張）

### ドラッグ&ドロップ最適化

- **@dnd-kit/core**: 高性能なドラッグ&ドロップライブラリの使用
- **位置計算の最適化**: ドラッグ中の位置計算の効率化

### データ管理最適化

- **正規化**: 状態の正規化によるデータアクセスの高速化
- **バッチ更新**: 複数の状態更新のバッチ処理

## セキュリティ考慮事項

### XSS対策

- **入力サニタイゼーション**: ユーザー入力の適切なエスケープ
- **dangerouslySetInnerHTML**: 使用を避ける

### データ保護

- **ローカルストレージ**: 機密情報の保存を避ける
- **入力検証**: フロントエンドでの基本的な入力検証

## アクセシビリティ

### キーボードナビゲーション

- **Tab順序**: 論理的なTab順序の実装
- **キーボードショートカット**: 主要操作のキーボードサポート

### スクリーンリーダー対応

- **ARIA属性**: 適切なARIA属性の設定
- **セマンティックHTML**: 意味のあるHTML要素の使用

### @dnd-kit/coreのアクセシビリティ

- **キーボードドラッグ**: キーボードでのドラッグ&ドロップサポート
- **スクリーンリーダー**: ドラッグ&ドロップ操作の音声案内

## レスポンシブデザイン

### ブレークポイント

- **モバイル**: < 768px
- **タブレット**: 768px - 1024px
- **デスクトップ**: > 1024px

### モバイル最適化

- **タッチ操作**: タッチフレンドリーなUI要素
- **水平スクロール**: モバイルでのリスト表示
- **モーダル最適化**: モバイルでのカード詳細表示

## 実装状況

### 完了済み（タスク1-2）

- ✅ **プロジェクト初期化とセットアップ**
  - Cloudflare Reactテンプレートでプロジェクト作成
  - 必要な依存関係のインストール
  - TypeScript、ESLint、Prettierの設定
  - TailwindCSS V4の設定
  - Vitestテスト環境の設定

- ✅ **データベーススキーマとマイグレーション**
  - Drizzle ORMスキーマの定義（boards, lists, cards）
  - D1データベースマイグレーションファイルの生成・適用
  - データベース接続設定
  - 基本的なAPIエンドポイントの実装
  - データベース接続とCRUD操作の動作確認

### 実装済みAPIエンドポイント

```typescript
// worker/index.ts で実装済み
GET / api / health; // データベース接続確認
GET / api / boards / test; // ボード作成・取得テスト
GET / api / boards; // ボード一覧取得
POST / api / boards; // ボード作成
```

### 次の実装予定（タスク3以降）

- tRPC APIルーターの実装
- フロントエンドのtRPCクライアント設定
- 基本UIコンポーネントの実装
- 状態管理とContextの実装
- ボード一覧画面の実装

## 将来の拡張性

### バックエンド統合

- **tRPC**: 型安全なAPI通信
- **認証**: Cloudflare Access または Auth0の統合
- **リアルタイム**: Cloudflare Durable Objectsによるリアルタイム更新

### 機能拡張

- **ラベル/タグ**: カードのカテゴリ分け
- **添付ファイル**: ファイルアップロード機能
- **コメント**: カードへのコメント機能
- **通知**: タスクの期限通知

## プ

ロジェクト初期化

### Cloudflare Reactテンプレート

プロジェクトはCloudflareのReactテンプレートを使用して初期化します：

```bash
npm create cloudflare@latest -- my-react-app --framework=react
```

### 追加依存関係

```json
{
  "dependencies": {
    "@dnd-kit/core": "^6.0.8",
    "@dnd-kit/sortable": "^7.0.2",
    "@trpc/client": "^10.45.0",
    "@trpc/react-query": "^10.45.0",
    "@trpc/server": "^10.45.0",
    "drizzle-orm": "^0.29.0",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "drizzle-kit": "^0.20.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0"
  }
}
```

### 環境設定（実装済み）

```jsonc
// wrangler.jsonc
{
  "name": "kanban-task-manager",
  "main": "worker/index.ts",
  "compatibility_date": "2025-07-22",
  "assets": {
    "not_found_handling": "single-page-application",
  },
  "observability": {
    "enabled": true,
  },
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "kanban-db",
      "database_id": "your-database-id",
    },
  ],
}
```

```typescript
// drizzle.config.ts
export default defineConfig({
  schema: './worker/db/schema.ts',
  out: './migrations',
  dialect: 'sqlite',
  driver: 'd1-http',
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    databaseId: process.env.CLOUDFLARE_DATABASE_ID!,
    token: process.env.CLOUDFLARE_D1_TOKEN!,
  },
});
```
