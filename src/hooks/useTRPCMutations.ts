import { useCallback } from 'react';
import { trpc } from '../lib/trpc';
import { getErrorMessage, logError } from '../lib/error-handling';
import { useLoadingState } from './useLoadingState';

// tRPCミューテーション用のカスタムフック
export function useTRPCMutations() {
  const { startLoading, stopLoading, setError, getLoadingState } =
    useLoadingState();
  const utils = trpc.useUtils();

  // ボード操作
  const createBoardMutation = trpc.boards.create.useMutation();
  const updateBoardMutation = trpc.boards.update.useMutation();
  const deleteBoardMutation = trpc.boards.delete.useMutation();

  // リスト操作
  const createListMutation = trpc.lists.create.useMutation();
  const updateListMutation = trpc.lists.update.useMutation();
  const deleteListMutation = trpc.lists.delete.useMutation();

  // カード操作
  const createCardMutation = trpc.cards.create.useMutation();
  const updateCardMutation = trpc.cards.update.useMutation();
  const deleteCardMutation = trpc.cards.delete.useMutation();
  const moveCardMutation = trpc.cards.move.useMutation();

  // ボード作成
  const createBoard = useCallback(
    async (input: { title: string }) => {
      const key = 'createBoard';
      try {
        startLoading(key);
        const result = await createBoardMutation.mutateAsync(input);

        // キャッシュを無効化してデータを再取得
        await utils.boards.getAll.invalidate();

        stopLoading(key);
        return result;
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        setError(key, errorMessage);
        logError(error, 'createBoard');
        throw error;
      }
    },
    [
      createBoardMutation,
      startLoading,
      stopLoading,
      setError,
      utils.boards.getAll,
    ]
  );

  // ボード更新
  const updateBoard = useCallback(
    async (input: { id: string; title: string }) => {
      const key = 'updateBoard';
      try {
        startLoading(key);
        const result = await updateBoardMutation.mutateAsync({
          id: input.id,
          data: { title: input.title },
        });

        // 関連するキャッシュを無効化
        await utils.boards.getAll.invalidate();
        await utils.boards.getById.invalidate(input.id);

        stopLoading(key);
        return result;
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        setError(key, errorMessage);
        logError(error, 'updateBoard');
        throw error;
      }
    },
    [updateBoardMutation, startLoading, stopLoading, setError, utils.boards]
  );

  // ボード削除
  const deleteBoard = useCallback(
    async (id: string) => {
      const key = 'deleteBoard';
      try {
        startLoading(key);
        await deleteBoardMutation.mutateAsync(id);

        // キャッシュを無効化
        await utils.boards.getAll.invalidate();

        stopLoading(key);
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        setError(key, errorMessage);
        logError(error, 'deleteBoard');
        throw error;
      }
    },
    [
      deleteBoardMutation,
      startLoading,
      stopLoading,
      setError,
      utils.boards.getAll,
    ]
  );

  // リスト作成
  const createList = useCallback(
    async (input: { boardId: string; title: string; position: number }) => {
      const key = 'createList';
      try {
        startLoading(key);
        const result = await createListMutation.mutateAsync(input);

        // 関連するキャッシュを無効化
        await utils.lists.getByBoardId.invalidate(input.boardId);

        stopLoading(key);
        return result;
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        setError(key, errorMessage);
        logError(error, 'createList');
        throw error;
      }
    },
    [
      createListMutation,
      startLoading,
      stopLoading,
      setError,
      utils.lists.getByBoardId,
    ]
  );

  // リスト更新
  const updateList = useCallback(
    async (input: { id: string; title?: string; position?: number }) => {
      const key = 'updateList';
      try {
        startLoading(key);
        const result = await updateListMutation.mutateAsync({
          id: input.id,
          data: { title: input.title, position: input.position },
        });

        // 関連するキャッシュを無効化
        await utils.lists.getByBoardId.invalidate();

        stopLoading(key);
        return result;
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        setError(key, errorMessage);
        logError(error, 'updateList');
        throw error;
      }
    },
    [
      updateListMutation,
      startLoading,
      stopLoading,
      setError,
      utils.lists.getByBoardId,
    ]
  );

  // リスト削除
  const deleteList = useCallback(
    async (id: string) => {
      const key = 'deleteList';
      try {
        startLoading(key);
        await deleteListMutation.mutateAsync(id);

        // 関連するキャッシュを無効化
        await utils.lists.getByBoardId.invalidate();
        await utils.cards.getByListId.invalidate();

        stopLoading(key);
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        setError(key, errorMessage);
        logError(error, 'deleteList');
        throw error;
      }
    },
    [
      deleteListMutation,
      startLoading,
      stopLoading,
      setError,
      utils.lists.getByBoardId,
      utils.cards.getByListId,
    ]
  );

  // カード作成
  const createCard = useCallback(
    async (input: {
      listId: string;
      title: string;
      description?: string;
      dueDate?: Date;
      position: number;
    }) => {
      const key = 'createCard';
      try {
        startLoading(key);
        const result = await createCardMutation.mutateAsync(input);

        // 関連するキャッシュを無効化
        await utils.cards.getByListId.invalidate(input.listId);

        stopLoading(key);
        return result;
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        setError(key, errorMessage);
        logError(error, 'createCard');
        throw error;
      }
    },
    [
      createCardMutation,
      startLoading,
      stopLoading,
      setError,
      utils.cards.getByListId,
    ]
  );

  // カード更新
  const updateCard = useCallback(
    async (input: {
      id: string;
      title?: string;
      description?: string;
      dueDate?: Date | null;
      position?: number;
    }) => {
      const key = 'updateCard';
      try {
        startLoading(key);
        const result = await updateCardMutation.mutateAsync({
          id: input.id,
          data: {
            title: input.title,
            description: input.description,
            dueDate: input.dueDate || undefined,
            position: input.position,
          },
        });

        // 関連するキャッシュを無効化
        await utils.cards.getByListId.invalidate();

        stopLoading(key);
        return result;
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        setError(key, errorMessage);
        logError(error, 'updateCard');
        throw error;
      }
    },
    [
      updateCardMutation,
      startLoading,
      stopLoading,
      setError,
      utils.cards.getByListId,
    ]
  );

  // カード削除
  const deleteCard = useCallback(
    async (id: string) => {
      const key = 'deleteCard';
      try {
        startLoading(key);
        await deleteCardMutation.mutateAsync(id);

        // 関連するキャッシュを無効化
        await utils.cards.getByListId.invalidate();

        stopLoading(key);
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        setError(key, errorMessage);
        logError(error, 'deleteCard');
        throw error;
      }
    },
    [
      deleteCardMutation,
      startLoading,
      stopLoading,
      setError,
      utils.cards.getByListId,
    ]
  );

  // カード移動
  const moveCard = useCallback(
    async (input: {
      cardId: string;
      newListId: string;
      newPosition: number;
    }) => {
      const key = 'moveCard';
      try {
        startLoading(key);
        await moveCardMutation.mutateAsync(input);

        // 関連するキャッシュを無効化
        await utils.cards.getByListId.invalidate();

        stopLoading(key);
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        setError(key, errorMessage);
        logError(error, 'moveCard');
        throw error;
      }
    },
    [
      moveCardMutation,
      startLoading,
      stopLoading,
      setError,
      utils.cards.getByListId,
    ]
  );

  return {
    // ボード操作
    createBoard,
    updateBoard,
    deleteBoard,

    // リスト操作
    createList,
    updateList,
    deleteList,

    // カード操作
    createCard,
    updateCard,
    deleteCard,
    moveCard,

    // ローディング状態
    getLoadingState,
  };
}
