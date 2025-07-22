import { useState, useCallback } from 'react';

// ローディング状態の型定義
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// 複数の操作のローディング状態を管理するフック
export function useLoadingState() {
  const [loadingStates, setLoadingStates] = useState<
    Record<string, LoadingState>
  >({});

  // ローディング開始
  const startLoading = useCallback((key: string) => {
    setLoadingStates((prev) => ({
      ...prev,
      [key]: { isLoading: true, error: null },
    }));
  }, []);

  // ローディング終了（成功）
  const stopLoading = useCallback((key: string) => {
    setLoadingStates((prev) => ({
      ...prev,
      [key]: { isLoading: false, error: null },
    }));
  }, []);

  // ローディング終了（エラー）
  const setError = useCallback((key: string, error: string) => {
    setLoadingStates((prev) => ({
      ...prev,
      [key]: { isLoading: false, error },
    }));
  }, []);

  // エラーをクリア
  const clearError = useCallback((key: string) => {
    setLoadingStates((prev) => ({
      ...prev,
      [key]: { ...prev[key], error: null },
    }));
  }, []);

  // 特定のキーのローディング状態を取得
  const getLoadingState = useCallback(
    (key: string): LoadingState => {
      return loadingStates[key] || { isLoading: false, error: null };
    },
    [loadingStates]
  );

  // 任意のキーがローディング中かチェック
  const isAnyLoading = useCallback(
    (keys?: string[]): boolean => {
      const targetKeys = keys || Object.keys(loadingStates);
      return targetKeys.some((key) => loadingStates[key]?.isLoading);
    },
    [loadingStates]
  );

  return {
    loadingStates,
    startLoading,
    stopLoading,
    setError,
    clearError,
    getLoadingState,
    isAnyLoading,
  };
}

// 単一の操作のローディング状態を管理するシンプルなフック
export function useSimpleLoadingState() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startLoading = useCallback(() => {
    setIsLoading(true);
    setError(null);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  const setErrorState = useCallback((errorMessage: string) => {
    setIsLoading(false);
    setError(errorMessage);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    startLoading,
    stopLoading,
    setError: setErrorState,
    clearError,
    reset,
  };
}
