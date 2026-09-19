import { apiClient } from '../api/client';

export interface GitHubAvailableRepo {
  id: string;
  name: string;
  full_name: string;
  default_branch: string;
  is_private: boolean;
  html_url: string;
  description: string;
  language?: string;
  stars?: number;
}

export const githubService = {
  async getAvailableRepositories(username?: string): Promise<GitHubAvailableRepo[]> {
    try {
      const liveRepos = await apiClient.get<GitHubAvailableRepo[]>('/github/repositories', {
        params: username ? { username } : undefined,
      });
      if (liveRepos && Array.isArray(liveRepos)) {
        return liveRepos;
      }
    } catch (err) {
      console.warn('Could not fetch live GitHub repositories:', err);
    }
    return [];
  },

  async connectToken(token?: string, username?: string): Promise<{ username: string; avatar_url: string }> {
    return await apiClient.post('/github/connect-token', {
      token: token || undefined,
      username: username || undefined,
    });
  },

  async getGitHubAuthUrl(): Promise<string> {
    try {
      const res = await apiClient.get<{ url: string }>('/github/login');
      return res.url;
    } catch {
      return 'https://github.com/login/oauth/authorize';
    }
  },
};
