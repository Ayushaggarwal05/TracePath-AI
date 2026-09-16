import { useState, useCallback } from 'react';
import { automationService } from '../services/automationService';
import { AutomationStatus } from '../types/repository';
import { useToast } from './useToast';

export function useAutomation() {
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const { success, error } = useToast();

  const toggleAutomation = useCallback(
    async (
      repoId: string,
      currentStatus: AutomationStatus,
      onSuccess?: (newStatus: AutomationStatus) => void
    ) => {
      setTogglingId(repoId);
      try {
        if (currentStatus === 'ACTIVE') {
          const res = await automationService.deactivateAutomation(repoId);
          success('Automation Deactivated', 'Repository documentation sync is now paused.');
          onSuccess?.(res.status);
        } else {
          const res = await automationService.activateAutomation(repoId);
          success('Automation Activated', 'Repository is now autonomously syncing documentation.');
          onSuccess?.(res.status);
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
