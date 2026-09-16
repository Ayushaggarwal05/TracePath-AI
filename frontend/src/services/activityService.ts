import { apiClient } from '../api/client';
import { ActivityEvent, ActivityEventType } from '../types/activity';

export const activityService = {
  async getActivityEvents(params?: {
    repository_id?: string;
    type?: ActivityEventType;
    page?: number;
    page_size?: number;
  }): Promise<{ items: ActivityEvent[]; total: number }> {
    try {
      return await apiClient.get<{ items: ActivityEvent[]; total: number }>('/activity', {
        params,
      });
    } catch {
      // Mock realistic chronological activity events
      const mockEvents: ActivityEvent[] = [
        {
          id: 'act-1',
          type: 'COMMIT_CREATED',
          repository_id: 'repo-1',
          repository_name: 'tracepath-org/tracepath-backend',
          execution_id: 'exec-101',
          commit_sha: 'c991a44e',
          branch: 'main',
          title: 'Documentation commit pushed to main',
          description: 'Synchronized ARCHITECTURE.md with Stripe webhook & subscription changes.',
          actor: 'TracePath Bot',
          created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
          metadata: {
            docs_updated_count: 1,
            pull_request_url: 'https://github.com/tracepath-org/tracepath-backend/pull/42',
          },
        },
        {
          id: 'act-2',
          type: 'DOCUMENTATION_UPDATED',
          repository_id: 'repo-1',
          repository_name: 'tracepath-org/tracepath-backend',
          execution_id: 'exec-101',
          commit_sha: 'a8f4c219',
          branch: 'main',
          title: 'Agent 3 generated documentation update',
          description: 'Created unified diff for ARCHITECTURE.md (42 additions, 4 deletions).',
          actor: 'Agent 3 (DocGenerator)',
          created_at: new Date(Date.now() - 3600000 * 2 - 5000).toISOString(),
          metadata: {
            docs_updated_count: 1,
          },
        },
        {
          id: 'act-3',
          type: 'AI_ANALYSIS_COMPLETED',
          repository_id: 'repo-1',
          repository_name: 'tracepath-org/tracepath-backend',
          execution_id: 'exec-101',
          commit_sha: 'a8f4c219',
          branch: 'main',
          title: 'Agent 1 completed code change analysis',
          description: 'Identified purpose: "Support paid enterprise plans and automated recurring billing webhooks".',
          actor: 'Agent 1 (Analysis)',
          created_at: new Date(Date.now() - 3600000 * 2 - 12000).toISOString(),
          metadata: {
            files_changed_count: 2,
          },
        },
        {
          id: 'act-4',
          type: 'CODE_CHANGE_DETECTED',
          repository_id: 'repo-1',
          repository_name: 'tracepath-org/tracepath-backend',
          execution_id: 'exec-101',
          commit_sha: 'a8f4c219',
          branch: 'main',
          title: 'GitHub webhook received: push to main',
          description: 'Commit a8f4c219 from Alex River with 2 changed files.',
          actor: 'GitHub Webhook',
          created_at: new Date(Date.now() - 3600000 * 2 - 18000).toISOString(),
          metadata: {
            files_changed_count: 2,
          },
        },
        {
          id: 'act-5',
          type: 'COMMIT_CREATED',
          repository_id: 'repo-2',
          repository_name: 'tracepath-org/payment-gateway-service',
          execution_id: 'exec-102',
          commit_sha: 'f144a899',
          branch: 'main',
          title: 'Documentation pull request opened',
          description: 'PR #18 created: "docs: update ARCHITECTURE.md with Redis Idempotency lock".',
          actor: 'TracePath Bot',
          created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
          metadata: {
            docs_updated_count: 1,
            pull_request_url: 'https://github.com/tracepath-org/payment-gateway-service/pull/18',
          },
        },
        {
          id: 'act-6',
          type: 'AUTOMATION_ACTIVATED',
          repository_id: 'repo-1',
          repository_name: 'tracepath-org/tracepath-backend',
          title: 'Automation enabled for tracepath-backend',
          description: 'Tracking branches: main | Tracking documents: ARCHITECTURE.md, README.md, docs/api.md',
          actor: 'Ayush Aggarwal',
          created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
        },
        {
          id: 'act-7',
          type: 'REPOSITORY_CONNECTED',
          repository_id: 'repo-1',
          repository_name: 'tracepath-org/tracepath-backend',
          title: 'Repository connected to TracePath AI',
          description: 'Authorized GitHub repository tracepath-org/tracepath-backend with full webhook access.',
          actor: 'Ayush Aggarwal',
          created_at: new Date(Date.now() - 3600000 * 25).toISOString(),
        },
        {
          id: 'act-8',
          type: 'AUTOMATION_DEACTIVATED',
          repository_id: 'repo-3',
          repository_name: 'tracepath-org/auth-server',
          title: 'Automation paused for auth-server',
          description: 'Automatic synchronization disabled by repository maintainer.',
          actor: 'Ayush Aggarwal',
          created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
        },
      ];

      let filtered = mockEvents;
      if (params?.repository_id) {
        filtered = filtered.filter((e) => e.repository_id === params.repository_id);
      }
      if (params?.type) {
        filtered = filtered.filter((e) => e.type === params.type);
      }

      return {
        items: filtered,
        total: filtered.length,
      };
    }
  },
};
