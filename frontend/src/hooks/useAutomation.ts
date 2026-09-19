import { useState, useCallback } from 'react';
import { automationService } from '../services/automationService';
import { repositoryService } from '../services/repositoryService';
import { AutomationStatus, Repository } from '../types/repository';
import { useToast } from './useToast';

export function useAutomation() {
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const { success, error } = useToast();

  const toggleAutomation = useCallback(
    async (
      target: Repository | string,
      currentStatus: AutomationStatus,
      onSuccess?: (newStatus: AutomationStatus, newRepoId?: string) => void
    ) => {
      const repoObj = typeof target === 'object' ? target : null;
      let repoId = typeof target === 'string' ? target : target.id;

      setTogglingId(repoId);
      try {
        // If repo is not yet registered in DB (starts with gh_), register it first
        if (repoId.startsWith('gh_') && repoObj) {
          try {
            const registered = await repositoryService.registerRepository({
              github_repo_id: repoObj.github_repo_id,
              name: repoObj.name,
              full_name: repoObj.full_name,
              default_branch: repoObj.default_branch || 'main',
              is_private: Boolean(repoObj.is_private),
              html_url: repoObj.html_url || `https://github.com/${repoObj.full_name}`,
              description: repoObj.description || undefined,
            });
            if (registered && registered.id) {
              repoId = registered.id;
            }
          } catch (regErr: any) {
            // Already registered or fallback
          }
        }

        if (currentStatus === 'ACTIVE') {
          const res = await automationService.deactivateAutomation(repoId);
          success('Automation Deactivated', 'Repository documentation sync is now paused.');
          onSuccess?.(res.status, repoId);
        } else {
          const res = await automationService.activateAutomation(repoId);
          success('Automation Activated', 'Repository is now autonomously syncing documentation.');
          onSuccess?.(res.status, repoId);
        }
      } catch (err: any) {
        error('Action Failed', err.message || 'Could not update automation status.');
      } finally {
        setTogglingId(null);
      }
    },
    [success, error]
  );

  return {
    togglingId,
    toggleAutomation,
  };
}

