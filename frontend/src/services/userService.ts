import { apiClient } from '../api/client';
import { User } from '../types/user';

export const userService = {
  async getCurrentUser(): Promise<User> {
    return await apiClient.get<User>('/users/me');
  },
};
