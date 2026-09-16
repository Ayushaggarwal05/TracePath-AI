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
  async getAvailableRepositories(): Promise<GitHubAvailableRepo[]> {
    try {
      const liveRepos = await apiClient.get<GitHubAvailableRepo[]>('/github/repositories');
      if (liveRepos && liveRepos.length > 0) {
        return liveRepos;
      }
    } catch {
      // Fallback
    }

    return [
      {
        id: '10101',
        name: 'TracePath-AI',
        full_name: 'Ayushaggarwal05/TracePath-AI',
        default_branch: 'main',
        is_private: false,
        html_url: 'https://github.com/Ayushaggarwal05/TracePath-AI',
        description: 'FastAPI + React multi-agent autonomous documentation sync platform',
        language: 'Python',
        stars: 142,
      },
      {
        id: '10102',
        name: 'payment-gateway-service',
        full_name: 'tracepath-org/payment-gateway-service',
        default_branch: 'main',
        is_private: true,
        html_url: 'https://github.com/tracepath-org/payment-gateway-service',
        description: 'Stripe webhook ingestion and subscription billing service',
        language: 'Go',
        stars: 34,
      },
      {
        id: '10103',
        name: 'auth-server',
        full_name: 'tracepath-org/auth-server',
        default_branch: 'main',
        is_private: true,
        html_url: 'https://github.com/tracepath-org/auth-server',
        description: 'OAuth2 and JWT token session management provider',
        language: 'Rust',
        stars: 56,
      },
    ];
  },

  async getGitHubAuthUrl(): Promise<string> {
    try {
      const res = await apiClient.get<{ url: string }>('/github/login');
      return res.url;
    } catch {
      return 'https://github.com/apps/tracepath-ai/installations/new';
    }
  },
};
