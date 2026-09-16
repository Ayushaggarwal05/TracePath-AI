export type ActivityEventType =
  | 'REPOSITORY_CONNECTED'
  | 'AUTOMATION_ACTIVATED'
  | 'AUTOMATION_DEACTIVATED'
  | 'CODE_CHANGE_DETECTED'
  | 'AI_ANALYSIS_COMPLETED'
  | 'DOCUMENTATION_UPDATED'
  | 'COMMIT_CREATED'
  | 'EXECUTION_FAILED';

export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  repository_id: string;
  repository_name: string;
  execution_id?: string;
  commit_sha?: string;
  branch?: string;
  title: string;
  description: string;
  actor?: string;
  created_at: string;
  metadata?: {
    files_changed_count?: number;
    docs_updated_count?: number;
    agent_stage?: string;
    error_message?: string;
    pull_request_url?: string;
    diff?: string;
  };
}
