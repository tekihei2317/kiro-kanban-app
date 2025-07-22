# 設計書

## 概要

Trello風のカンバンタスク管理アプリケーションを、React + TypeScript + Viteを使用してSPA（Single Page Application）として実装します。モダンなWeb技術を活用し、直感的なユーザーエクスペリエンスと高いパフォーマンスを実現します。

## アーキテクチャ

### 技術スタック

- **フロントエンド**: React 18 + TypeScript + Vite
- **バックエンド**: Cloudflare Workers
- **API**: tRPC
- **データベース**: Cloudflare D1 (SQLite)
- **ORM**: Drizzle ORM
- **状態管理**: React Context API + useReducer
- **ドラッグ&ドロップ**: @dnd-kit/core + @dnd-kit/sortable
- **スタイリング**: Tailwind CSS
- **開発ツール**: ESLint + Prettier
- **テスト**: Vitest + React Testing Library

### アーキテクチャパターン

```
src/
├── components/          # 再利用可能なUIコンポーネント
│   ├── ui/             # 基本UIコンポーネント（Button, Modal, Input等）
│   ├── BoardCard.tsx   # ボードカード
│   ├── BoardHeader.tsx # ボードヘッダー
│   ├── List.tsx        # リスト
│   ├── Card.tsx        # カード
│   └── AddButton.tsx   # 追加ボタン
├── contexts/           # React Context
├── hooks/              # カスタムフック
├── types/              # TypeScript型定義
├── utils/              # ユーティリティ関数
├── server/             # バックエンド（Cloudflare Workers）
│   ├── api/            # tRPC API routes
│   ├── db/             # Drizzle schema & migrations
│   └── index.ts        # Workers entry point
└── trpc/               # tRPC client setup
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
  | { type: 'MOVE_CARD'; payload: { cardId: string; newListId: string; newPosition: number } }
  | { type: 'REORDER_CARDS'; payload: { listId: string; cardIds: string[] } };
```

### データ永続化

Cloudflare D1データベースとDrizzle ORMを使用してデータを永続化します。

```typescript
// Drizzle Schema
export const boards = sqliteTable('boards', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const lists = sqliteTable('lists', {
  id: text('id').primaryKey(),
  boardId: text('board_id').notNull().references(() => boards.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  position: integer('position').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const cards = sqliteTable('cards', {
  id: text('id').primaryKey(),
  listId: text('list_id').notNull().references(() => lists.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  dueDate: integer('due_date', { mode: 'timestamp' }),
  position: integer('position').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// tRPC API
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

### 環境設定

```toml
# wrangler.toml
name = "kanban-task-manager"
main = "src/server/index.ts"
compatibility_date = "2024-01-01"

[[d1_databases]]
binding = "DB"
database_name = "kanban-db"
database_id = "your-database-id"
```