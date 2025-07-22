import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { trpc } from '../lib/trpc';
import type { ReactNode } from 'react';

interface TRPCProviderProps {
  children: ReactNode;
}

export function TRPCProvider({ children }: TRPCProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // エラー時の自動リトライを設定
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            retry: (failureCount, error: any) => {
              // 4xx エラーの場合はリトライしない
              if (error?.status >= 400 && error?.status < 500) {
                return false;
              }
              // 最大3回までリトライ
              return failureCount < 3;
            },
            // 5分間キャッシュを保持
            staleTime: 5 * 60 * 1000,
            // バックグラウンドでの自動更新を無効化
            refetchOnWindowFocus: false,
          },
          mutations: {
            // ミューテーション失敗時のリトライ設定
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            retry: (failureCount, error: any) => {
              // 4xx エラーの場合はリトライしない
              if (error?.status >= 400 && error?.status < 500) {
                return false;
              }
              // 最大2回までリトライ
              return failureCount < 2;
            },
          },
        },
      })
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: '/api/trpc',
          // リクエストヘッダーの設定
          headers() {
            return {
              'Content-Type': 'application/json',
            };
          },
          // エラーハンドリング
          fetch(url, options) {
            return fetch(url, {
              ...options,
              // タイムアウト設定（30秒）
              signal: AbortSignal.timeout(30000),
            }).catch((error) => {
              // ネットワークエラーやタイムアウトエラーをハンドリング
              if (error.name === 'AbortError') {
                throw new Error('リクエストがタイムアウトしました');
              }
              if (
                error.name === 'TypeError' &&
                error.message.includes('fetch')
              ) {
                throw new Error('ネットワークエラーが発生しました');
              }
              throw error;
            });
          },
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
