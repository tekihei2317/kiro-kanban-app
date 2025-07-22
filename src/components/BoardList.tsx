import { useState } from 'react';
import { trpc } from '../lib/trpc';
import { useTRPCMutations } from '../hooks/useTRPCMutations';
import { BoardCard } from './BoardCard';
import { AddButton } from './AddButton';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

interface BoardListProps {
  onBoardSelect: (boardId: string) => void;
}

export function BoardList({ onBoardSelect }: BoardListProps) {
  const { data: boards = [], isLoading } = trpc.boards.getAll.useQuery();
  const { createBoard } = useTRPCMutations();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');

  const handleCreateBoard = async () => {
    if (newBoardTitle.trim()) {
      await createBoard({
        title: newBoardTitle.trim(),
      });
      setNewBoardTitle('');
      setIsCreateModalOpen(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreateBoard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            カンバンボード
          </h1>
          <p className="text-gray-600">
            プロジェクトを選択してタスク管理を開始しましょう
          </p>
        </header>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">読み込み中...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
            {boards.map((board) => (
              <BoardCard
                key={board.id}
                board={board}
                onClick={() => onBoardSelect(board.id)}
              />
            ))}

            {/* 新しいボード作成カード */}
            <div className="bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
              <AddButton
                onClick={() => setIsCreateModalOpen(true)}
                text="新しいボードを作成"
                className="h-full min-h-[120px] text-gray-600 hover:text-gray-800"
              />
            </div>
          </div>
        )}

        {/* 新しいボード作成モーダル */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setNewBoardTitle('');
          }}
          title="新しいボードを作成"
        >
          <div className="space-y-4">
            <Input
              label="ボード名"
              value={newBoardTitle}
              onChange={(e) => setNewBoardTitle(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="ボード名を入力してください"
              autoFocus
            />
            <div className="flex justify-end space-x-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setNewBoardTitle('');
                }}
              >
                キャンセル
              </Button>
              <Button
                onClick={handleCreateBoard}
                disabled={!newBoardTitle.trim()}
              >
                作成
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
