import { useState } from 'react';
import type { Card } from './types';
import { BoardList } from './components/BoardList';
import { BoardView } from './components/BoardView';
import { CardDetailModal } from './components/CardDetailModal';
import { TRPCProvider } from './providers/TRPCProvider';

function App() {
  const [currentBoardId, setCurrentBoardId] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);

  // ボード選択
  const handleBoardSelect = (boardId: string) => {
    setCurrentBoardId(boardId);
  };

  // ボード一覧に戻る
  const handleBackToBoards = () => {
    setCurrentBoardId(null);
  };


  // カードクリック
  const handleCardClick = (card: Card) => {
    setSelectedCard(card);
    setIsCardModalOpen(true);
  };

  // カード更新
  const handleCardSave = (cardId: string, updates: Partial<Card>) => {
    // TODO: tRPC mutation で実装
    console.log('Card update:', cardId, updates);
  };

  // カード削除
  const handleCardDelete = (cardId: string) => {
    // TODO: tRPC mutation で実装
    console.log('Card delete:', cardId);
  };

  return (
    <TRPCProvider>
      <div className="App">
        {!currentBoardId ? (
          <BoardList onBoardSelect={handleBoardSelect} />
        ) : (
          <BoardView
            boardId={currentBoardId}
            onBack={handleBackToBoards}
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
    </TRPCProvider>
  );
}

export default App;
