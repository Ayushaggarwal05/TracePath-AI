import { apiClient } from '../api/client';
import { ActivityEvent, ActivityEventType } from '../types/activity';

export const activityService = {
  async getActivityEvents(params?: {
    repository_id?: string;
    type?: ActivityEventType;
    page?: number;
    page_size?: number;
  }): Promise<{ items: ActivityEvent[]; total: number }> {
    return await apiClient.get<{ items: ActivityEvent[]; total: number }>('/activity', {
      params,
    });
  },
};
