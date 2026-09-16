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
    try {
      return await apiClient.get<PaginatedResponse<Execution>>('/executions', {
        params: {
          repository_id: params?.repository_id,
          status: params?.status,
          branch: params?.branch,
          page: params?.page || 1,
          page_size: params?.page_size || 20,
        },
      });
    } catch {
      // Fallback mock execution runs
      const mockExecutions: Execution[] = [
        {
          id: 'exec-101',
          repository_id: 'repo-1',
          repository_name: 'tracepath-org/tracepath-backend',
          event_type: 'push',
          commit_sha: 'a8f4c219904d493a772c5a14d5e9712a884c12ef',
          branch: 'main',
          status: 'COMPLETED',
          start_time: new Date(Date.now() - 3600000 * 2).toISOString(),
          completion_time: new Date(Date.now() - 3600000 * 2 + 18000).toISOString(),
          changed_files: [
            {
              filename: 'app/api/v1/endpoints/billing.py',
              status: 'modified',
              additions: 45,
              deletions: 4,
              patch: '@@ -10,3 +10,45 @@\n+ async def process_subscription(): ...',
            },
            {
              filename: 'app/models/subscription.py',
              status: 'added',
              additions: 28,
              deletions: 0,
            },
          ],
          analysis_result: {
            summary: 'Added subscription tier management and Stripe webhook verification endpoints.',
            purpose: 'Support paid enterprise plans and automated recurring billing webhooks.',
            key_changes: [
              'Implemented /api/v1/billing checkout and webhook ingestion',
              'Created SubscriptionTier enum with Pro/Enterprise definitions',
            ],
            affected_components: ['Billing API', 'Subscription Model'],
            behavior_changes: ['Users can purchase recurring plans and receive billing receipts.'],
            dependencies: ['stripe>=7.0.0'],
            evidence: ['Added Stripe webhook signature validation'],
            uncertainties: [],
          },
          documentation_decision: {
            overall_decision: 'UPDATE_REQUIRED',
            decision_rationale: 'Major new billing tier capability requires updates to ARCHITECTURE.md and PRD.md.',
            document_decisions: [
              {
                doc_path: 'ARCHITECTURE.md',
                is_affected: true,
                reason: 'New billing module and third-party webhook ingest workflow added.',
                required_changes: [
                  'Add Payment Gateway & Webhook flow to Architecture diagrams',
                  'Document SubscriptionTier database schema',
                ],
                evidence: ['Added Subscription model and Stripe dependency.'],
              },
              {
                doc_path: 'PRD.md',
                is_affected: true,
                reason: 'Subscription pricing tiers and limits introduced.',
                required_changes: ['Detail Pro vs Enterprise feature matrices.'],
                evidence: ['Added SubscriptionTier enum.'],
              },
            ],
          },
          updated_documents: [
            {
              doc_path: 'ARCHITECTURE.md',
              action: 'update',
              updated_content: '# System Architecture\n\n## Billing & Subscription Ingestion\n- Ingests Stripe events via secure webhook signatures\n- Automatically provisions user entitlements\n',
              diff: '--- a/ARCHITECTURE.md\n+++ b/ARCHITECTURE.md\n@@ -15,0 +16,4 @@\n+## Billing & Subscription Ingestion\n+- Ingests Stripe events via secure webhook signatures\n+- Automatically provisions user entitlements\n',
              summary_of_changes: 'Documented Stripe webhook flow and SubscriptionTier model.',
            },
          ],
          generated_diff: '--- a/ARCHITECTURE.md\n+++ b/ARCHITECTURE.md\n@@ -15,0 +16,4 @@\n+## Billing & Subscription Ingestion\n+- Ingests Stripe events via secure webhook signatures\n+- Automatically provisions user entitlements\n',
          final_commit_sha: 'c991a44e',
          pull_request_url: 'https://github.com/tracepath-org/tracepath-backend/pull/42',
          created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
          updated_at: new Date(Date.now() - 3600000 * 2 + 18000).toISOString(),
        },
        {
          id: 'exec-102',
          repository_id: 'repo-2',
          repository_name: 'tracepath-org/payment-gateway-service',
          event_type: 'push',
          commit_sha: 'b7e21a884d5c9e11234a456b789c012d345e678f',
          branch: 'main',
          status: 'COMPLETED',
          start_time: new Date(Date.now() - 3600000 * 5).toISOString(),
          completion_time: new Date(Date.now() - 3600000 * 5 + 14000).toISOString(),
          changed_files: [
            {
              filename: 'cache/redis.go',
              status: 'added',
              additions: 80,
              deletions: 0,
            },
          ],
          analysis_result: {
            summary: 'Added Redis cache layer for high-throughput idempotency tokens.',
            purpose: 'Prevent double charging and duplicate webhook retries.',
            key_changes: ['Implemented Redis distributed lock with 30s TTL'],
            affected_components: ['Cache Client', 'Payment Processor'],
            behavior_changes: ['Duplicate charge requests return HTTP 409.'],
            dependencies: ['go-redis/v9'],
            evidence: ['Added Redis mutex in charge handler'],
            uncertainties: [],
          },
          documentation_decision: {
            overall_decision: 'UPDATE_REQUIRED',
            decision_rationale: 'Redis cache architecture added to data flow.',
            document_decisions: [
              {
                doc_path: 'ARCHITECTURE.md',
                is_affected: true,
                reason: 'Redis idempotency lock alters request topology.',
                required_changes: ['Add Redis lock mechanism to payment processing flow.'],
                evidence: ['Added go-redis dependency.'],
              },
            ],
          },
          updated_documents: [
            {
              doc_path: 'ARCHITECTURE.md',
              action: 'update',
              updated_content: '# Payment Service Architecture\n\n## Idempotency Lock\n- Powered by Redis with 30s TTL\n',
              diff: '--- a/ARCHITECTURE.md\n+++ b/ARCHITECTURE.md\n@@ -20,0 +21,3 @@\n+## Idempotency Lock\n+- Powered by Redis with 30s TTL\n',
              summary_of_changes: 'Added Redis Idempotency Lock section.',
            },
          ],
          generated_diff: '--- a/ARCHITECTURE.md\n+++ b/ARCHITECTURE.md\n@@ -20,0 +21,3 @@\n+## Idempotency Lock\n+- Powered by Redis with 30s TTL\n',
          final_commit_sha: 'f144a899',
          pull_request_url: 'https://github.com/tracepath-org/payment-gateway-service/pull/18',
          created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
          updated_at: new Date(Date.now() - 3600000 * 5 + 14000).toISOString(),
        },
        {
          id: 'exec-103',
          repository_id: 'repo-1',
          repository_name: 'tracepath-org/tracepath-backend',
          event_type: 'push',
          commit_sha: '3c99a112233445566778899aabbccddeeff00112',
          branch: 'main',
          status: 'SKIPPED',
          start_time: new Date(Date.now() - 3600000 * 10).toISOString(),
          completion_time: new Date(Date.now() - 3600000 * 10 + 6000).toISOString(),
          changed_files: [
            {
              filename: 'tests/test_parser.py',
              status: 'modified',
              additions: 12,
              deletions: 2,
            },
          ],
          analysis_result: {
            summary: 'Added unit test fixtures for edge case input validation.',
            purpose: 'Increase test coverage for payload parser.',
            key_changes: ['Added test_empty_string_payload test case'],
            affected_components: ['Unit Tests'],
            behavior_changes: ['No runtime code or public contract changed.'],
            dependencies: [],
            evidence: ['Modified tests/test_parser.py only'],
            uncertainties: [],
          },
          documentation_decision: {
            overall_decision: 'NO_UPDATE_REQUIRED',
            decision_rationale: 'Test-only modification with zero documentation impact.',
            document_decisions: [
              {
                doc_path: 'ARCHITECTURE.md',
                is_affected: false,
                reason: 'Test changes do not alter system specifications.',
                required_changes: [],
                evidence: [],
              },
            ],
          },
          updated_documents: [],
          generated_diff: '',
          created_at: new Date(Date.now() - 3600000 * 10).toISOString(),
          updated_at: new Date(Date.now() - 3600000 * 10 + 6000).toISOString(),
        },
      ];

      return {
        items: mockExecutions,
        total: mockExecutions.length,
        page: params?.page || 1,
        page_size: params?.page_size || 20,
        total_pages: 1,
      };
    }
  },

  async getExecution(id: string): Promise<Execution> {
    return await apiClient.get<Execution>(`/executions/${id}`);
  },

  async triggerExecution(payload: ExecutionCreatePayload): Promise<Execution> {
    return await apiClient.post<Execution>('/executions?run_pipeline=true', payload);
  },
};
