import { useCallback, useEffect, useRef, useState } from 'react';

interface ReportResourceState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  reload: () => Promise<void>;
}

export function useReportResource<T>(
  loader: () => Promise<T>,
): ReportResourceState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const requestIdRef = useRef(0);

  const load = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setIsLoading(true);
    setError(null);

    try {
      const next = await loader();

      if (requestIdRef.current !== requestId) {
        return;
      }

      setData(next);
    } catch (err) {
      if (requestIdRef.current !== requestId) {
        return;
      }

      setData(null);
      setError(err instanceof Error ? err : new Error('Failed to load report.'));
    } finally {
      if (requestIdRef.current === requestId) {
        setIsLoading(false);
      }
    }
  }, [loader]);

  useEffect(() => {
    void load();

    return () => {
      requestIdRef.current += 1;
    };
  }, [load]);

  return {
    data,
    error,
    isLoading,
    reload: load,
  };
}
