import { useState } from 'react';
import { useTRPCMutations } from '../hooks/useTRPCMutations';
import type { Board } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { ConfirmDialog } from './ui/ConfirmDialog';

interface BoardCardProps {
  board: Board;
  onClick: () => void;
}

export function BoardCard({ board, onClick }: BoardCardProps) {
  const { updateBoard, deleteBoard } = useTRPCMutations();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(board.title);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(dateObj);
  };

  const handleTitleSave = async () => {
    if (editTitle.trim() && editTitle.trim() !== board.title) {
      await updateBoard({
        id: board.id,
        title: editTitle.trim(),
      });
    }
    setIsEditing(false);
  };

  const handleTitleCancel = () => {
    setEditTitle(board.title);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    await deleteBoard(board.id);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      handleTitleCancel();
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 border border-gray-200 relative group">
        {/* 削除ボタン */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
          onClick={(e) => {
            e.stopPropagation();
            setIsDeleteDialogOpen(true);
          }}
        >
          ×
        </Button>

        {/* タイトル */}
        <div className="mb-2 pr-8">
          {isEditing ? (
            <div className="space-y-2">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={handleKeyPress}
                className="text-lg font-semibold"
                autoFocus
              />
              <div className="flex justify-end space-x-2">
                <Button variant="secondary" size="sm" onClick={handleTitleCancel}>
                  キャンセル
                </Button>
                <Button size="sm" onClick={handleTitleSave}>
                  保存
                </Button>
              </div>
            </div>
          ) : (
            <h3
              className="text-lg font-semibold text-gray-900 truncate cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
            >
              {board.title}
            </h3>
          )}
        </div>

        {/* 日付情報とクリックエリア */}
        {!isEditing && (
          <div
            className="text-sm text-gray-500 cursor-pointer"
            onClick={onClick}
          >
            <p>作成日: {formatDate(board.createdAt)}</p>
            <p>更新日: {formatDate(board.updatedAt)}</p>
          </div>
        )}
      </div>

      {/* 削除確認ダイアログ */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="ボードを削除"
        message={`"${board.title}" を削除しますか？この操作は元に戻せません。`}
        confirmText="削除"
        cancelText="キャンセル"
        variant="danger"
      />
    </>
  );
}
