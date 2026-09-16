import { useState, useEffect, useCallback, useRef } from 'react';
import { Execution, ExecutionStatus } from '../types/execution';
import { executionService } from '../services/executionService';

export function useExecutions(params?: {
  repository_id?: string;
  status?: ExecutionStatus;
  branch?: string;
  page?: number;
  page_size?: number;
  autoRefresh?: boolean;
}) {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const isFirstLoad = useRef(true);

  const fetchExecutions = useCallback(async (isBackground = false) => {
    try {
      if (!isBackground) {
        setLoading(true);
      }
      setError(null);
      const data = await executionService.getExecutions(params);
      setExecutions(data.items);
      setTotal(data.total);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch executions');
    } finally {
      if (!isBackground) {
        setLoading(false);
      }
    }
  }, [
    params?.repository_id,
    params?.status,
    params?.branch,
    params?.page,
    params?.page_size,
  ]);

  useEffect(() => {
    fetchExecutions();
    isFirstLoad.current = false;
  }, [fetchExecutions]);

  // Real-Time Polling for Active In-Flight Executions
  useEffect(() => {
    const hasActiveExecution = executions.some((e) =>
      ['PENDING', 'ANALYZING', 'PLANNING', 'GENERATING', 'COMMITTING'].includes(e.status)
    );

    if (!hasActiveExecution && params?.autoRefresh !== true) {
      return;
    }

    const intervalId = setInterval(() => {
      fetchExecutions(true);
    }, 2500);

    return () => clearInterval(intervalId);
  }, [executions, fetchExecutions, params?.autoRefresh]);

  return {
    executions,
    setExecutions,
    total,
    loading,
    error,
    refetch: () => fetchExecutions(false),
  };
}
