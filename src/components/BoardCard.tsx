import type { Board } from '../types';

interface BoardCardProps {
  board: Board;
  onClick: () => void;
}

export function BoardCard({ board, onClick }: BoardCardProps) {
  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(dateObj);
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer p-4 border border-gray-200"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
        {board.title}
      </h3>
      <div className="text-sm text-gray-500">
        <p>作成日: {formatDate(board.createdAt)}</p>
        <p>更新日: {formatDate(board.updatedAt)}</p>
      </div>
    </div>
  );
}
