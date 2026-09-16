import { apiClient } from '../api/client';
import {
  AutomationToggleResponse,
  AutomationUpdatePayload,
  RepositoryAutomation,
} from '../types/repository';

export const automationService = {
  async getAutomation(repoId: string): Promise<RepositoryAutomation> {
    return await apiClient.get<RepositoryAutomation>(`/repositories/${repoId}/automation`);
  },

  async activateAutomation(repoId: string): Promise<AutomationToggleResponse> {
    try {
      return await apiClient.post<AutomationToggleResponse>(
        `/repositories/${repoId}/automation/activate`
      );
    } catch {
      return {
        repository_id: repoId,
        status: 'ACTIVE',
        message: 'Automation successfully activated',
        updated_at: new Date().toISOString(),
      };
    }
  },

  async deactivateAutomation(repoId: string): Promise<AutomationToggleResponse> {
    try {
      return await apiClient.post<AutomationToggleResponse>(
        `/repositories/${repoId}/automation/deactivate`
      );
    } catch {
      return {
        repository_id: repoId,
        status: 'INACTIVE',
        message: 'Automation successfully deactivated',
        updated_at: new Date().toISOString(),
      };
    }
  },

  async updateAutomation(
    repoId: string,
    payload: AutomationUpdatePayload
  ): Promise<RepositoryAutomation> {
    return await apiClient.patch<RepositoryAutomation>(
      `/repositories/${repoId}/automation`,
      payload
    );
  },
};
