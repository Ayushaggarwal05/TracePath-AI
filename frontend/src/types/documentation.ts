export interface TrackedDocument {
  id: string;
  repository_id: string;
  doc_path: string;
  title: string;
  category: 'architecture' | 'api' | 'prd' | 'guide' | 'adr' | 'general';
  last_updated_at: string;
  last_commit_sha: string;
  last_execution_id: string;
  total_updates_count: number;
  current_content?: string;
  summary_of_last_change?: string;
  lines_added?: number;
  lines_removed?: number;
  diff?: string;
}

export interface DocumentHistoryEntry {
  id: string;
  doc_path: string;
  execution_id: string;
  commit_sha: string;
  commit_message: string;
  author: string;
  action: 'create' | 'update' | 'no_change';
  summary_of_changes: string;
  diff: string;
  updated_content: string;
  created_at: string;
  validation_passed: boolean;
}
