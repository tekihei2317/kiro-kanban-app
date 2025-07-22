import { useState } from 'react';
import type { Board, List, Card, AppState } from './types';
import { mockAppState } from './data/mockData';
import { BoardList } from './components/BoardList';
import { BoardView } from './components/BoardView';
import { CardDetailModal } from './components/CardDetailModal';

function App() {
  const [appState, setAppState] = useState<AppState>(mockAppState);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);

  // ボード選択
  const handleBoardSelect = (boardId: string) => {
    setAppState((prev) => ({
      ...prev,
      currentBoardId: boardId,
    }));
  };

  // ボード一覧に戻る
  const handleBackToBoards = () => {
    setAppState((prev) => ({
      ...prev,
      currentBoardId: null,
    }));
  };

  // ボード作成
  const handleBoardCreate = (title: string) => {
    const newBoard: Board = {
      id: `board-${Date.now()}`,
      title,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setAppState((prev) => ({
      ...prev,
      boards: [...prev.boards, newBoard],
    }));
  };

  // リスト作成
  const handleListCreate = (boardId: string, title: string) => {
    const newList: List = {
      id: `list-${Date.now()}`,
      boardId,
      title,
      position: appState.lists.filter((l) => l.boardId === boardId).length,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setAppState((prev) => ({
      ...prev,
      lists: [...prev.lists, newList],
    }));
  };

  // カード作成
  const handleCardCreate = (listId: string, title: string) => {
    const newCard: Card = {
      id: `card-${Date.now()}`,
      listId,
      title,
      description: null,
      dueDate: null,
      position: appState.cards.filter((c) => c.listId === listId).length,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setAppState((prev) => ({
      ...prev,
      cards: [...prev.cards, newCard],
    }));
  };

  // カードクリック
  const handleCardClick = (card: Card) => {
    setSelectedCard(card);
    setIsCardModalOpen(true);
  };

  // カード更新
  const handleCardSave = (cardId: string, updates: Partial<Card>) => {
    setAppState((prev) => ({
      ...prev,
      cards: prev.cards.map((card) =>
        card.id === cardId
          ? { ...card, ...updates, updatedAt: new Date() }
          : card
      ),
    }));
  };

  // カード削除
  const handleCardDelete = (cardId: string) => {
    setAppState((prev) => ({
      ...prev,
      cards: prev.cards.filter((card) => card.id !== cardId),
    }));
  };

  // 現在のボードを取得
  const currentBoard = appState.currentBoardId
    ? appState.boards.find((b) => b.id === appState.currentBoardId)
    : null;

  return (
    <div className="App">
      {!currentBoard ? (
        <BoardList
          boards={appState.boards}
          onBoardSelect={handleBoardSelect}
          onBoardCreate={handleBoardCreate}
        />
      ) : (
        <BoardView
          board={currentBoard}
          lists={appState.lists}
          cards={appState.cards}
          onBack={handleBackToBoards}
          onListCreate={handleListCreate}
          onCardCreate={handleCardCreate}
          onCardClick={handleCardClick}
        />
      )}

      <CardDetailModal
        card={selectedCard}
        isOpen={isCardModalOpen}
        onClose={() => {
          setIsCardModalOpen(false);
          setSelectedCard(null);
        }}
        onSave={handleCardSave}
        onDelete={handleCardDelete}
      />
    </div>
  );
}

export default App;
