// tRPCエラーの型定義
export interface TRPCClientError {
  message: string;
  code: string;
  data?: {
    code: string;
    httpStatus: number;
    path: string;
    stack?: string;
  };
}

// エラーメッセージを日本語に変換する関数
export function getErrorMessage(error: unknown): string {
  // tRPCエラーの場合
  if (error && typeof error === 'object' && 'message' in error) {
    const trpcError = error as TRPCClientError;

    // HTTPステータスコードに基づいたエラーメッセージ
    if (trpcError.data?.httpStatus) {
      switch (trpcError.data.httpStatus) {
        case 400:
          return '入力内容に問題があります。確認してください。';
        case 401:
          return '認証が必要です。';
        case 403:
          return 'この操作を実行する権限がありません。';
        case 404:
          return '要求されたデータが見つかりません。';
        case 409:
          return 'データの競合が発生しました。再度お試しください。';
        case 500:
          return 'サーバーエラーが発生しました。しばらく待ってから再度お試しください。';
        default:
          return trpcError.message || '予期しないエラーが発生しました。';
      }
    }

    // tRPCエラーコードに基づいたエラーメッセージ
    switch (trpcError.code) {
      case 'BAD_REQUEST':
        return '入力内容に問題があります。確認してください。';
      case 'UNAUTHORIZED':
        return '認証が必要です。';
      case 'FORBIDDEN':
        return 'この操作を実行する権限がありません。';
      case 'NOT_FOUND':
        return '要求されたデータが見つかりません。';
      case 'CONFLICT':
        return 'データの競合が発生しました。再度お試しください。';
      case 'INTERNAL_SERVER_ERROR':
        return 'サーバーエラーが発生しました。しばらく待ってから再度お試しください。';
      default:
        return trpcError.message || '予期しないエラーが発生しました。';
    }
  }

  // 一般的なエラーの場合
  if (error instanceof Error) {
    // ネットワークエラー
    if (error.message.includes('fetch') || error.message.includes('network')) {
      return 'ネットワークエラーが発生しました。インターネット接続を確認してください。';
    }

    // タイムアウトエラー
    if (
      error.message.includes('timeout') ||
      error.message.includes('タイムアウト')
    ) {
      return 'リクエストがタイムアウトしました。再度お試しください。';
    }

    return error.message;
  }

  // その他のエラー
  return '予期しないエラーが発生しました。';
}

// エラーログ出力用の関数
export function logError(error: unknown, context?: string) {
  const errorMessage = getErrorMessage(error);
  const logContext = context ? `[${context}]` : '';

  console.error(`${logContext} Error:`, {
    message: errorMessage,
    originalError: error,
    timestamp: new Date().toISOString(),
  });
}

// エラーの種類を判定する関数
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('ネットワーク')
    );
  }
  return false;
}

export function isTimeoutError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('timeout') ||
      error.message.includes('タイムアウト') ||
      error.name === 'AbortError'
    );
  }
  return false;
}

export function isServerError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'data' in error) {
    const trpcError = error as TRPCClientError;
    return trpcError.data?.httpStatus
      ? trpcError.data.httpStatus >= 500
      : false;
  }
  return false;
}
