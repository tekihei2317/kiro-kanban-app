import type { Card as CardType } from '../types';

interface CardProps {
  card: CardType;
  onClick: () => void;
}

export function Card({ card, onClick }: CardProps) {
  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('ja-JP', {
      month: 'short',
      day: 'numeric',
    }).format(dateObj);
  };

  const isOverdue = card.dueDate && new Date(card.dueDate) < new Date();

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer p-3 border border-gray-200 mb-2"
    >
      <h4 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
        {card.title}
      </h4>

      {card.description && (
        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
          {card.description}
        </p>
      )}

      {card.dueDate && (
        <div className="flex items-center">
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              isOverdue
                ? 'bg-red-100 text-red-800'
                : 'bg-blue-100 text-blue-800'
            }`}
          >
            {formatDate(card.dueDate)}
          </span>
        </div>
      )}
    </div>
  );
}
