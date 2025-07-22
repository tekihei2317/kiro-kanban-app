import { useState, useEffect } from 'react';
import type { Card } from '../types';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

interface CardDetailModalProps {
  card: Card | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (cardId: string, updates: Partial<Card>) => void;
  onDelete: (cardId: string) => void;
}

export function CardDetailModal({
  card,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: CardDetailModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // モーダルが開かれた時にカードデータで初期化
  useEffect(() => {
    if (card && isOpen) {
      setTitle(card.title);
      setDescription(card.description || '');
      setDueDate(
        card.dueDate ? new Date(card.dueDate).toISOString().split('T')[0] : ''
      );
    }
  }, [card, isOpen]);

  const handleSave = () => {
    if (!card || !title.trim()) return;

    const updates: Partial<Card> = {
      title: title.trim(),
      description: description.trim() || null,
      dueDate: dueDate ? new Date(dueDate) : null,
    };

    onSave(card.id, updates);
    onClose();
  };

  const handleDelete = () => {
    if (!card) return;
    onDelete(card.id);
    onClose();
    setShowDeleteConfirm(false);
  };

  const handleClose = () => {
    onClose();
    setShowDeleteConfirm(false);
  };

  if (!card) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="カード詳細">
      <div className="space-y-4">
        <Input
          label="タイトル"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="カードタイトルを入力してください"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            説明
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="カードの説明を入力してください"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <Input
          label="期限"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        {!showDeleteConfirm ? (
          <div className="flex justify-between">
            <Button variant="danger" onClick={() => setShowDeleteConfirm(true)}>
              削除
            </Button>
            <div className="flex space-x-2">
              <Button variant="secondary" onClick={handleClose}>
                キャンセル
              </Button>
              <Button onClick={handleSave} disabled={!title.trim()}>
                保存
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-800 mb-3">
              このカードを削除してもよろしいですか？この操作は取り消せません。
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
              >
                キャンセル
              </Button>
              <Button variant="danger" size="sm" onClick={handleDelete}>
                削除する
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
