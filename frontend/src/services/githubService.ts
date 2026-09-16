export interface GitHubAvailableRepo {
  id: string;
  name: string;
  full_name: string;
  default_branch: string;
  is_private: boolean;
  html_url: string;
  description: string;
  language: string;
  stars: number;
}

export const githubService = {
  async getAvailableRepositories(): Promise<GitHubAvailableRepo[]> {
    // Mock available repositories fetched from GitHub App installation
    return [
      {
        id: 'gh-repo-101',
        name: 'tracepath-backend',
        full_name: 'tracepath-org/tracepath-backend',
        default_branch: 'main',
        is_private: false,
        html_url: 'https://github.com/tracepath-org/tracepath-backend',
        description: 'FastAPI multi-agent autonomous documentation sync platform',
        language: 'Python',
        stars: 142,
      },
      {
        id: 'gh-repo-102',
        name: 'tracepath-web',
        full_name: 'tracepath-org/tracepath-web',
        default_branch: 'main',
        is_private: false,
        html_url: 'https://github.com/tracepath-org/tracepath-web',
        description: 'React TypeScript frontend interface for TracePath AI',
        language: 'TypeScript',
        stars: 88,
      },
      {
        id: 'gh-repo-103',
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
        id: 'gh-repo-104',
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

  getGitHubAuthUrl(): string {
    // Return authorization entry point (can be overridden with real App client ID)
    return 'https://github.com/apps/tracepath-ai/installations/new';
  },
};
