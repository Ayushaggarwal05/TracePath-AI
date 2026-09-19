import { apiClient } from '../api/client';
import { PaginatedResponse } from '../types/api';
import {
  Repository,
  RepositoryUpdatePayload,
} from '../types/repository';

export const repositoryService = {
  async getRepositories(page = 1, pageSize = 20): Promise<PaginatedResponse<Repository>> {
    return await apiClient.get<PaginatedResponse<Repository>>('/repositories', {
      params: { page, page_size: pageSize },
    });
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

  async activateAutomation(repoId: string) {
    return await apiClient.post(`/repositories/${repoId}/automation/activate`);
  },

  async deactivateAutomation(repoId: string) {
    return await apiClient.post(`/repositories/${repoId}/automation/deactivate`);
  },
};

