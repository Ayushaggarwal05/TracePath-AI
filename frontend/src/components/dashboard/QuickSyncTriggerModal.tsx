import React, { useState } from 'react';
import { Repository } from '../../types/repository';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { executionService } from '../../services/executionService';
import { useToast } from '../../hooks/useToast';
import { Sparkles, Code } from 'lucide-react';

interface QuickSyncTriggerModalProps {
  repositories: Repository[];
  isOpen: boolean;
  onClose: () => void;
  onTriggered: () => void;
}

export const QuickSyncTriggerModal: React.FC<QuickSyncTriggerModalProps> = ({
  repositories,
  isOpen,
  onClose,
  onTriggered,
}) => {
  const [selectedRepoId, setSelectedRepoId] = useState<string>(repositories[0]?.id || '');
  const [scenario, setScenario] = useState<'billing' | 'caching' | 'bugfix'>('billing');
  const [triggering, setTriggering] = useState<boolean>(false);
  const { success, error } = useToast();

  const scenarios = [
    {
      id: 'billing',
      title: 'New Subscription Billing Feature',
      desc: 'Simulates adding Stripe endpoints and subscription tiers (affects ARCHITECTURE.md and PRD.md).',
    },
    {
      id: 'caching',
      title: 'Redis Caching Integration',
      desc: 'Simulates adding high-speed Redis query cache (affects ARCHITECTURE.md).',
    },
    {
      id: 'bugfix',
      title: 'Targeted Bugfix / Typo Correction',
      desc: 'Simulates null check fix (Agent 2 detects zero documentation impact and skips updates).',
    },
  ];

  const handleTrigger = async () => {
    if (!selectedRepoId) return;

    try {
      setTriggering(true);
      const commitSha =
        scenario === 'bugfix'
          ? 'bugfix' + Math.random().toString(16).substring(2, 10).padEnd(34, '0')
          : scenario === 'caching'
          ? 'cache' + Math.random().toString(16).substring(2, 10).padEnd(35, '0')
          : 'bill' + Math.random().toString(16).substring(2, 10).padEnd(36, '0');

      await executionService.triggerExecution({
        repository_id: selectedRepoId,
        commit_sha: commitSha.slice(0, 40),
        branch: 'main',
        event_type: 'push',
      });

      success('Pipeline Triggered', 'Multi-agent documentation sync is executing in the background.');
      onTriggered();
      onClose();
    } catch (err: any) {
      error('Trigger Failed', err.message || 'Could not start pipeline run.');
    } finally {
      setTriggering(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Trigger Autonomous Sync Execution"
      subtitle="Simulate a code change commit to watch the 3 AI agents analyze, plan, and synchronize documentation."
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Repository selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Target Repository
          </label>
          <select
            value={selectedRepoId}
            onChange={(e) => setSelectedRepoId(e.target.value)}
            className="w-full px-3.5 py-2 bg-dark-card border border-dark-border rounded-lg text-sm text-slate-100 focus:outline-none focus:border-brand-500/60"
          >
            {repositories.map((repo) => (
              <option key={repo.id} value={repo.id}>
                {repo.full_name} ({repo.automation?.status || 'INACTIVE'})
              </option>
            ))}
          </select>
        </div>

        {/* Change Scenario */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Simulated Code Change Scenario
          </label>
          <div className="space-y-2">
            {scenarios.map((s) => (
              <div
                key={s.id}
                onClick={() => setScenario(s.id as any)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  scenario === s.id
                    ? 'border-brand-500/60 bg-brand-500/10 text-slate-100'
                    : 'border-dark-border bg-dark-card/50 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Code className={`w-4 h-4 ${scenario === s.id ? 'text-brand-400' : 'text-slate-500'}`} />
                  <span className="text-xs font-semibold">{s.title}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-dark-border">
        <Button variant="outline" size="sm" onClick={onClose} disabled={triggering}>
          Cancel
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={handleTrigger}
          isLoading={triggering}
          leftIcon={<Sparkles className="w-4 h-4" />}
        >
          Run Multi-Agent Pipeline
        </Button>
      </div>
    </Modal>
  );
};
