import { apiClient } from '../api/client';
import { TrackedDocument, DocumentHistoryEntry } from '../types/documentation';

export const documentationService = {
  async getTrackedDocuments(repositoryId: string): Promise<TrackedDocument[]> {
    try {
      return await apiClient.get<TrackedDocument[]>(`/repositories/${repositoryId}/documents`);
    } catch {
      // Mock tracked documents for repository
      const mockDocs: Record<string, TrackedDocument[]> = {
        'repo-1': [
          {
            id: 'doc-101',
            repository_id: 'repo-1',
            doc_path: 'ARCHITECTURE.md',
            title: 'System Architecture & Data Flows',
            category: 'architecture',
            last_updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
            last_commit_sha: 'a8f4c219',
            last_execution_id: 'exec-101',
            total_updates_count: 8,
            summary_of_last_change: 'Added Billing & Stripe Webhook Ingestion flow and data model topology.',
            lines_added: 42,
            lines_removed: 4,
            diff: `--- a/ARCHITECTURE.md
+++ b/ARCHITECTURE.md
@@ -15,4 +15,16 @@
 ## Core Ingestion Engine
 - Webhook receiver parses HMAC-SHA256 signature
 - Asynchronous worker queue evaluates incoming git commits
+
+## Billing & Subscription Ingestion
+- Ingests Stripe events via secure webhook signatures
+- Automatically provisions user entitlements
+- Synchronizes seat quotas with PostgreSQL state
+
+### Subscription Database Schema
+\`\`\`sql
+CREATE TABLE subscriptions (
+    id UUID PRIMARY KEY,
+    tier VARCHAR(50) NOT NULL,
+    status VARCHAR(50) NOT NULL
+);
+\`\`\``,
            current_content: `# System Architecture

## Overview
TracePath AI is an autonomous documentation synchronization engine.

## Core Ingestion Engine
- Webhook receiver parses HMAC-SHA256 signature
- Asynchronous worker queue evaluates incoming git commits

## Billing & Subscription Ingestion
- Ingests Stripe events via secure webhook signatures
- Automatically provisions user entitlements
- Synchronizes seat quotas with PostgreSQL state

### Subscription Database Schema
\`\`\`sql
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY,
    tier VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL
);
\`\`\`
`,
          },
          {
            id: 'doc-102',
            repository_id: 'repo-1',
            doc_path: 'PRD.md',
            title: 'Product Requirements & Specifications',
            category: 'prd',
            last_updated_at: new Date(Date.now() - 3600000 * 24).toISOString(),
            last_commit_sha: 'd3e9110a',
            last_execution_id: 'exec-099',
            total_updates_count: 5,
            summary_of_last_change: 'Added Enterprise multi-agent quota limits and team RBAC requirements.',
            lines_added: 18,
            lines_removed: 2,
            diff: `--- a/PRD.md
+++ b/PRD.md
@@ -30,2 +30,8 @@
 ## Plan Tiers
 - **Free**: Up to 3 active repositories
+- **Pro**: Unlimited repositories, real-time webhooks, priority AI models
+- **Enterprise**: Custom LLM keys, SLA guarantee, on-prem worker deployments`,
            current_content: `# Product Requirements Document (PRD)

## Target Audience
Software engineering teams wanting real-time accuracy in system documentation.

## Plan Tiers
- **Free**: Up to 3 active repositories
- **Pro**: Unlimited repositories, real-time webhooks, priority AI models
- **Enterprise**: Custom LLM keys, SLA guarantee, on-prem worker deployments
`,
          },
          {
            id: 'doc-103',
            repository_id: 'repo-1',
            doc_path: 'docs/api.md',
            title: 'REST API Documentation',
            category: 'api',
            last_updated_at: new Date(Date.now() - 3600000 * 72).toISOString(),
            last_commit_sha: 'e5f6120b',
            last_execution_id: 'exec-095',
            total_updates_count: 12,
            summary_of_last_change: 'Documented /api/v1/executions and /api/v1/repositories endpoints.',
            lines_added: 64,
            lines_removed: 10,
            diff: `--- a/docs/api.md
+++ b/docs/api.md
@@ -1,3 +1,15 @@
 # REST API Reference
 
+## POST /api/v1/executions
+Triggers an autonomous multi-agent analysis and sync run.
+
+### Query Parameters
+- \`run_pipeline=true\`: Run analysis pipeline synchronously.
+`,
            current_content: `# REST API Reference

## POST /api/v1/executions
Triggers an autonomous multi-agent analysis and sync run.

### Query Parameters
- \`run_pipeline=true\`: Run analysis pipeline synchronously.
`,
          },
        ],
        'repo-2': [
          {
            id: 'doc-201',
            repository_id: 'repo-2',
            doc_path: 'ARCHITECTURE.md',
            title: 'Payment Gateway Architecture',
            category: 'architecture',
            last_updated_at: new Date(Date.now() - 3600000 * 5).toISOString(),
            last_commit_sha: 'b7e21a88',
            last_execution_id: 'exec-102',
            total_updates_count: 4,
            summary_of_last_change: 'Added Redis Idempotency Lock section with 30s TTL.',
            lines_added: 24,
            lines_removed: 0,
            diff: `--- a/ARCHITECTURE.md
+++ b/ARCHITECTURE.md
@@ -20,0 +21,6 @@
+## Idempotency Lock
+- Powered by Redis distributed lock with 30s TTL
+- Prevents duplicate charge attempts on network retries
+`,
            current_content: `# Payment Service Architecture

## Overview
High-throughput payment gateway client.

## Idempotency Lock
- Powered by Redis distributed lock with 30s TTL
- Prevents duplicate charge attempts on network retries
`,
          },
        ],
      };

      return (
        mockDocs[repositoryId] || [
          {
            id: 'doc-def-1',
            repository_id: repositoryId,
            doc_path: 'README.md',
            title: 'Repository Overview',
            category: 'general',
            last_updated_at: new Date(Date.now() - 3600000 * 48).toISOString(),
            last_commit_sha: '10293847',
            last_execution_id: 'exec-default',
            total_updates_count: 1,
            summary_of_last_change: 'Initial autonomous documentation sync setup.',
            lines_added: 12,
            lines_removed: 0,
            diff: `--- a/README.md\n+++ b/README.md\n@@ -1,0 +1,5 @@\n+# Auto-tracked Repository\n+Synchronized by TracePath AI.\n`,
            current_content: '# Auto-tracked Repository\nSynchronized by TracePath AI.\n',
          },
        ]
      );
    }
  },

  async getDocumentHistory(docPath: string, repositoryId: string): Promise<DocumentHistoryEntry[]> {
    try {
      return await apiClient.get<DocumentHistoryEntry[]>(`/repositories/${repositoryId}/documents/history`, {
        params: { doc_path: docPath },
      });
    } catch {
      return [
        {
          id: 'hist-1',
          doc_path: docPath,
          execution_id: 'exec-101',
          commit_sha: 'a8f4c219904d493a772c5a14d5e9712a884c12ef',
          commit_message: 'feat(billing): add stripe webhook verification and subscription models',
          author: 'Alex River (alex@tracepath.dev)',
          action: 'update',
          summary_of_changes: 'Added Billing & Stripe Webhook Ingestion flow and data model topology.',
          diff: `--- a/${docPath}
+++ b/${docPath}
@@ -15,4 +15,16 @@
 ## Core Ingestion Engine
 - Webhook receiver parses HMAC-SHA256 signature
 - Asynchronous worker queue evaluates incoming git commits
+
+## Billing & Subscription Ingestion
+- Ingests Stripe events via secure webhook signatures
+- Automatically provisions user entitlements
+- Synchronizes seat quotas with PostgreSQL state`,
          updated_content: `# Synchronized Documentation (${docPath})\n\n## Updated Content\nAll changes verified by Agent 3.`,
          created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
          validation_passed: true,
        },
        {
          id: 'hist-2',
          doc_path: docPath,
          execution_id: 'exec-099',
          commit_sha: 'd3e9110a2233445566778899aabbccddeeff0011',
          commit_message: 'refactor(api): optimize response serialize payload formatting',
          author: 'Dev Bot (ci@tracepath.dev)',
          action: 'update',
          summary_of_changes: 'Updated API response formats and schema specifications.',
          diff: `--- a/${docPath}
+++ b/${docPath}
@@ -8,2 +8,4 @@
 - Returns HTTP 200 with JSON payload
+- Adds X-TracePath-Execution-ID header to audit responses`,
          updated_content: `# Synchronized Documentation (${docPath})\n\nPrevious revision.`,
          created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
          validation_passed: true,
        },
      ];
    }
  },
};
