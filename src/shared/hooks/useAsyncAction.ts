import { useState, useCallback } from 'react';

interface AsyncActionState {
  loading: boolean;
  error: string | null;
}

type AsyncActionFn<TArgs extends unknown[]> = (...args: TArgs) => Promise<void>;

export function useAsyncAction<TArgs extends unknown[]>(
  fn: AsyncActionFn<TArgs>,
): [AsyncActionFn<TArgs>, AsyncActionState] {
  const [state, setState] = useState<AsyncActionState>({
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: TArgs) => {
      setState({ loading: true, error: null });
      try {
        await fn(...args);
        setState({ loading: false, error: null });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An error occurred';
        setState({ loading: false, error: message });
        throw err;
      }
    },
    [fn],
  );

  return [execute, state];
}
