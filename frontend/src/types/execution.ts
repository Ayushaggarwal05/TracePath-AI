export type ExecutionStatus =
  | 'PENDING'
  | 'ANALYZING'
  | 'PLANNING'
  | 'GENERATING'
  | 'COMMITTING'
  | 'COMPLETED'
  | 'FAILED'
  | 'SKIPPED';

export type ExecutionEventType = 'push' | 'pull_request' | 'manual' | 'scheduled';

export interface ChangedFileItem {
  filename: string;
  status: 'added' | 'modified' | 'removed';
  additions: number;
  deletions: number;
  patch?: string;
}

export interface AnalysisResultData {
  summary: string;
  purpose: string;
  key_changes: string[];
  affected_components: string[];
  behavior_changes: string[];
  dependencies: string[];
  evidence: string[];
  uncertainties: string[];
}

export interface DocumentDecisionItem {
  doc_path: string;
  is_affected: boolean;
  reason: string;
  required_changes: string[];
  evidence: string[];
}

export interface DocumentationDecisionData {
  overall_decision: 'UPDATE_REQUIRED' | 'NO_UPDATE_REQUIRED';
  decision_rationale: string;
  document_decisions: DocumentDecisionItem[];
}

export interface GeneratedDocUpdateItem {
  doc_path: string;
  action: 'update' | 'create' | 'no_change';
  original_content?: string;
  updated_content: string;
  diff: string;
  summary_of_changes: string;
  validation_notes?: string;
}

export interface ErrorInformation {
  stage: string;
  error: string;
}

export interface TelemetryLogItem {
  timestamp: string;
  stage: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  message: string;
  model?: string;
  latency_ms?: number;
  status?: string;
}

export interface Execution {
  id: string;
  repository_id: string;
  repository_name?: string;
  event_type: ExecutionEventType;
  commit_sha: string;
  branch: string;
  status: ExecutionStatus;
  start_time?: string;
  completion_time?: string;
  changed_files?: ChangedFileItem[];
  analysis_result?: AnalysisResultData;
  documentation_decision?: DocumentationDecisionData;
  updated_documents?: GeneratedDocUpdateItem[];
  generated_diff?: string;
  final_commit_sha?: string;
  pull_request_url?: string;
  error_information?: ErrorInformation;
  telemetry_logs?: TelemetryLogItem[];
  created_at: string;
  updated_at: string;
}

export interface ExecutionCreatePayload {
  repository_id: string;
  event_type?: ExecutionEventType;
  commit_sha: string;
  branch?: string;
  status?: ExecutionStatus;
  changed_files?: Partial<ChangedFileItem>[];
}
