import { useState } from 'react';
import { trpc } from '../lib/trpc';
import { useTRPCMutations } from '../hooks/useTRPCMutations';
import type { List as ListType, Card as CardType } from '../types';
import { Card } from './Card';
import { AddButton } from './AddButton';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

interface ListProps {
  list: ListType;
  onCardClick: (card: CardType) => void;
}

export function List({ list, onCardClick }: ListProps) {
  const { data: cards = [] } = trpc.cards.getByListId.useQuery({
    listId: list.id,
  });
  const { createCard } = useTRPCMutations();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');

  const handleCreateCard = async () => {
    if (newCardTitle.trim()) {
      await createCard({
        listId: list.id,
        title: newCardTitle.trim(),
        position: cards.length,
      });
      setNewCardTitle('');
      setIsCreateModalOpen(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreateCard();
    }
  };

  // カードを位置順にソート
  const sortedCards = [...cards].sort((a, b) => a.position - b.position);

  return (
    <div className="bg-gray-100 rounded-lg p-3 w-72 flex-shrink-0">
      {/* リストヘッダー */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 text-sm">{list.title}</h3>
        <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
          {sortedCards.length}
        </span>
      </div>

      {/* カード一覧 */}
      <div className="space-y-2 mb-3 max-h-96 overflow-y-auto">
        {sortedCards.map((card) => (
          <Card key={card.id} card={card} onClick={() => onCardClick(card)} />
        ))}
      </div>

      {/* カード追加ボタン */}
      <AddButton
        onClick={() => setIsCreateModalOpen(true)}
        text="カードを追加"
        className="text-gray-600 hover:bg-gray-200"
      />

      {/* 新しいカード作成モーダル */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setNewCardTitle('');
        }}
        title="新しいカードを作成"
      >
        <div className="space-y-4">
          <Input
            label="カードタイトル"
            value={newCardTitle}
            onChange={(e) => setNewCardTitle(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="カードタイトルを入力してください"
            autoFocus
          />
          <div className="flex justify-end space-x-2">
            <Button
              variant="secondary"
              onClick={() => {
                setIsCreateModalOpen(false);
                setNewCardTitle('');
              }}
            >
              キャンセル
            </Button>
            <Button onClick={handleCreateCard} disabled={!newCardTitle.trim()}>
              作成
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
