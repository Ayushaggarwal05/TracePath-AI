import { apiClient } from '../api/client';
import { TrackedDocument, DocumentHistoryEntry } from '../types/documentation';

export const documentationService = {
  async getTrackedDocuments(repositoryId: string): Promise<TrackedDocument[]> {
    return await apiClient.get<TrackedDocument[]>(`/repositories/${repositoryId}/documents`);
  },

  async getDocumentHistory(docPath: string, repositoryId: string): Promise<DocumentHistoryEntry[]> {
    return await apiClient.get<DocumentHistoryEntry[]>(`/repositories/${repositoryId}/documents/history`, {
      params: { doc_path: docPath },
    });
  },
};
