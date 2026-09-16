import { useState, useEffect, useCallback } from 'react';
import { Repository } from '../types/repository';
import { repositoryService } from '../services/repositoryService';

export function useRepositories(page = 1, pageSize = 20) {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRepositories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await repositoryService.getRepositories(page, pageSize);
      setRepositories(data.items);
      setTotal(data.total);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch repositories');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchRepositories();
  }, [fetchRepositories]);

  return {
    repositories,
    setRepositories,
    total,
    loading,
    error,
    refetch: fetchRepositories,
  };
}
