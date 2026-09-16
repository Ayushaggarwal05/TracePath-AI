import { apiClient } from '../api/client';
import { PaginatedResponse } from '../types/api';
import {
  Execution,
  ExecutionCreatePayload,
  ExecutionStatus,
} from '../types/execution';

export const executionService = {
  async getExecutions(params?: {
    repository_id?: string;
    status?: ExecutionStatus;
    branch?: string;
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<Execution>> {
    return await apiClient.get<PaginatedResponse<Execution>>('/executions', {
      params: {
        repository_id: params?.repository_id,
        status: params?.status,
        branch: params?.branch,
        page: params?.page || 1,
        page_size: params?.page_size || 20,
      },
    });
  },

  async getExecution(id: string): Promise<Execution> {
    return await apiClient.get<Execution>(`/executions/${id}`);
  },

  async triggerExecution(payload: ExecutionCreatePayload): Promise<Execution> {
    return await apiClient.post<Execution>('/executions?run_pipeline=true', payload);
  },
};
