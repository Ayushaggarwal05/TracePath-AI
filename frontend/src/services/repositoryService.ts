import { apiClient } from '../api/client';
import { PaginatedResponse } from '../types/api';
import {
  Repository,
  RepositoryUpdatePayload,
} from '../types/repository';

export const repositoryService = {
  async getRepositories(page = 1, pageSize = 20): Promise<PaginatedResponse<Repository>> {
    try {
      return await apiClient.get<PaginatedResponse<Repository>>('/repositories', {
        params: { page, page_size: pageSize },
      });
    } catch {
      // Fallback mock repositories for frontend development
      const mockItems: Repository[] = [
        {
          id: 'repo-1',
          user_id: '00000000-0000-0000-0000-000000000001',
          github_repo_id: 'gh-repo-101',
          name: 'tracepath-backend',
          full_name: 'tracepath-org/tracepath-backend',
          default_branch: 'main',
          is_private: false,
          html_url: 'https://github.com/tracepath-org/tracepath-backend',
          description: 'FastAPI multi-agent autonomous documentation sync platform',
          language: 'Python',
          execution_count: 14,
          automation: {
            id: 'auto-1',
            repository_id: 'repo-1',
            status: 'ACTIVE',
            target_branch: 'main',
            doc_paths: ['ARCHITECTURE.md', 'README.md', 'docs/api.md'],
            auto_commit: false,
            create_pull_request: true,
            pr_target_branch: 'main',
            last_activated_at: new Date(Date.now() - 3600000 * 24).toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'repo-2',
          user_id: '00000000-0000-0000-0000-000000000001',
          github_repo_id: 'gh-repo-102',
          name: 'payment-gateway-service',
          full_name: 'tracepath-org/payment-gateway-service',
          default_branch: 'main',
          is_private: true,
          html_url: 'https://github.com/tracepath-org/payment-gateway-service',
          description: 'Stripe webhook ingestion and subscription billing service',
          language: 'Go',
          execution_count: 6,
          automation: {
            id: 'auto-2',
            repository_id: 'repo-2',
            status: 'ACTIVE',
            target_branch: 'main',
            doc_paths: ['PRD.md', 'ARCHITECTURE.md'],
            auto_commit: false,
            create_pull_request: true,
            pr_target_branch: 'main',
            last_activated_at: new Date(Date.now() - 3600000 * 12).toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'repo-3',
          user_id: '00000000-0000-0000-0000-000000000001',
          github_repo_id: 'gh-repo-103',
          name: 'auth-server',
          full_name: 'tracepath-org/auth-server',
          default_branch: 'main',
          is_private: true,
          html_url: 'https://github.com/tracepath-org/auth-server',
          description: 'OAuth2 and JWT token session management provider',
          language: 'Rust',
          execution_count: 2,
          automation: {
            id: 'auto-3',
            repository_id: 'repo-3',
            status: 'INACTIVE',
            target_branch: 'main',
            doc_paths: ['README.md'],
            auto_commit: false,
            create_pull_request: true,
            pr_target_branch: 'main',
            last_deactivated_at: new Date(Date.now() - 3600000 * 48).toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      return {
        items: mockItems,
        total: mockItems.length,
        page,
        page_size: pageSize,
        total_pages: 1,
      };
    }
  },

  async getRepository(id: string): Promise<Repository> {
    return await apiClient.get<Repository>(`/repositories/${id}`);
  },

  async registerRepository(payload: {
    github_repo_id: string;
    name: string;
    full_name: string;
    default_branch?: string;
    is_private?: boolean;
    html_url?: string;
    description?: string;
    user_id?: string;
  }): Promise<Repository> {
    return await apiClient.post<Repository>('/repositories', payload);
  },

  async updateRepository(id: string, payload: RepositoryUpdatePayload): Promise<Repository> {
    return await apiClient.patch<Repository>(`/repositories/${id}`, payload);
  },
};
