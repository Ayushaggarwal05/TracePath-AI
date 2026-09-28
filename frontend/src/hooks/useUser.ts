import { useAuth } from '../context/AuthContext';

export function useUser() {
  const { user, isLoading, error, refreshUser } = useAuth();
  return { user, loading: isLoading, error, refetch: refreshUser };
}
