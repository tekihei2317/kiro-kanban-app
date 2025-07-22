import { useState } from 'react';
import { trpc } from '../lib/trpc';
import { useTRPCMutations } from '../hooks/useTRPCMutations';
import type { Card as CardType } from '../types';
import { List } from './List';
import { AddButton } from './AddButton';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

interface BoardViewProps {
  boardId: string;
  onBack: () => void;
  onCardClick: (card: CardType) => void;
}

export function BoardView({ boardId, onBack, onCardClick }: BoardViewProps) {
  const { data: board } = trpc.boards.getById.useQuery({ id: boardId });
  const { data: lists = [] } = trpc.lists.getByBoardId.useQuery({ boardId });
  const { createList } = useTRPCMutations();
  const [isCreateListModalOpen, setIsCreateListModalOpen] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');

  const handleCreateList = async () => {
    if (newListTitle.trim()) {
      await createList({
        boardId,
        title: newListTitle.trim(),
        position: lists.length,
      });
      setNewListTitle('');
      setIsCreateListModalOpen(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreateList();
    }
  };

  // リストを位置順にソート
  const sortedLists = [...lists].sort((a, b) => a.position - b.position);

  if (!board) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="max-w-full mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-gray-600 hover:text-gray-900"
            >
              ← 戻る
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">{board.title}</h1>
          </div>
        </div>
      </header>

      {/* ボードコンテンツ */}
      <div className="p-4">
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {/* リスト一覧 */}
          {sortedLists.map((list) => (
            <List key={list.id} list={list} onCardClick={onCardClick} />
          ))}

          {/* リスト追加ボタン */}
          <div className="bg-gray-200 rounded-lg p-3 w-72 flex-shrink-0">
            <AddButton
              onClick={() => setIsCreateListModalOpen(true)}
              text="リストを追加"
              className="text-gray-600 hover:bg-gray-300"
            />
          </div>
        </div>
      </div>

      {/* 新しいリスト作成モーダル */}
      <Modal
        isOpen={isCreateListModalOpen}
        onClose={() => {
          setIsCreateListModalOpen(false);
          setNewListTitle('');
        }}
        title="新しいリストを作成"
      >
        <div className="space-y-4">
          <Input
            label="リスト名"
            value={newListTitle}
            onChange={(e) => setNewListTitle(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="リスト名を入力してください"
            autoFocus
          />
          <div className="flex justify-end space-x-2">
            <Button
              variant="secondary"
              onClick={() => {
                setIsCreateListModalOpen(false);
                setNewListTitle('');
              }}
            >
              キャンセル
            </Button>
            <Button onClick={handleCreateList} disabled={!newListTitle.trim()}>
              作成
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
