import { useState, useEffect, useCallback } from 'react';
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

  const fetchExecutions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await executionService.getExecutions(params);
      setExecutions(data.items);
      setTotal(data.total);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch executions');
    } finally {
      setLoading(false);
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
  }, [fetchExecutions]);

  return {
    executions,
    setExecutions,
    total,
    loading,
    error,
    refetch: fetchExecutions,
  };
}
