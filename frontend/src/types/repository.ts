export type AutomationStatus = 'ACTIVE' | 'INACTIVE';

export interface RepositoryAutomation {
  id: string;
  repository_id: string;
  status: AutomationStatus;
  target_branch: string;
  doc_paths: string[];
  auto_commit: boolean;
  create_pull_request: boolean;
  pr_target_branch: string;
  last_activated_at?: string;
  last_deactivated_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Repository {
  id: string;
  user_id?: string;
  github_repo_id: string;
  name: string;

  full_name: string;
  default_branch: string;
  is_private: boolean;
  html_url?: string;
  description?: string;
  language?: string;
  automation?: RepositoryAutomation;
  execution_count?: number;
  created_at: string;
  updated_at: string;
}

export interface RepositoryUpdatePayload {
  default_branch?: string;
  is_private?: boolean;
  description?: string;
}

export interface AutomationUpdatePayload {
  target_branch?: string;
  doc_paths?: string[];
  auto_commit?: boolean;
  create_pull_request?: boolean;
  pr_target_branch?: string;
}

export interface AutomationToggleResponse {
  repository_id: string;
  status: AutomationStatus;
  message: string;
  updated_at: string;
}
