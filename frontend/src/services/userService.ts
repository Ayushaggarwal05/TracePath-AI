import { apiClient } from '../api/client';
import { User } from '../types/user';

export const userService = {
  async getCurrentUser(): Promise<User> {
    try {
      return await apiClient.get<User>('/users/me');
    } catch {
      // Fallback developer user if backend not running
      return {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'developer@tracepath.ai',
        full_name: 'TracePath Developer',
        is_active: true,
        github_connections: [
          {
            id: 'gh-conn-1',
            user_id: '00000000-0000-0000-0000-000000000001',
            github_user_id: '123456',
            username: 'tracepath-dev',
            avatar_url: 'https://avatars.githubusercontent.com/u/9919?s=200&v=4',
            created_at: new Date().toISOString(),
          },
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
  },
};
