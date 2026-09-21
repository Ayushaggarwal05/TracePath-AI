import React, { useState, useEffect, useRef } from 'react';
import { Repository } from '../../types/repository';
import { Execution } from '../../types/execution';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { LiveSyncProgressStream } from './LiveSyncProgressStream';
import { executionService } from '../../services/executionService';
import { useToast } from '../../hooks/useToast';
import { Sparkles, GitCommit, Code, Zap, RotateCcw } from 'lucide-react';

interface QuickSyncTriggerModalProps {
  repositories: Repository[];
  isOpen: boolean;
  onClose: () => void;
  onTriggered: () => void;
  initialRepoId?: string;
  onViewDetails?: (execution: Execution) => void;
}

export const QuickSyncTriggerModal: React.FC<QuickSyncTriggerModalProps> = ({
  repositories,
  isOpen,
  onClose,
  onTriggered,
  initialRepoId,
  onViewDetails,
}) => {
  const activeRepos = repositories.filter((r) => r.automation?.status === 'ACTIVE');
  const [selectedRepoId, setSelectedRepoId] = useState<string>(initialRepoId || '');
  const [syncMode, setSyncMode] = useState<'latest' | 'custom' | 'simulate'>('latest');
  const [customCommitSha, setCustomCommitSha] = useState<string>('');
  const [targetBranch, setTargetBranch] = useState<string>('main');
  const [scenario, setScenario] = useState<'billing' | 'caching' | 'bugfix'>('billing');
  const [triggering, setTriggering] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<'form' | 'streaming'>('form');
  const [currentExecution, setCurrentExecution] = useState<Execution | null>(null);

  const pollIntervalRef = useRef<any>(null);
  const { success, error } = useToast();

  const selectedRepo = repositories.find((r) => r.id === selectedRepoId);

  // Synchronize initialRepoId or first available active repository
  useEffect(() => {
    if (initialRepoId && activeRepos.some((r) => r.id === initialRepoId)) {
      setSelectedRepoId(initialRepoId);
      const repo = repositories.find((r) => r.id === initialRepoId);
      if (repo?.default_branch) setTargetBranch(repo.default_branch);
    } else if (activeRepos.length > 0 && (!selectedRepoId || !activeRepos.some((r) => r.id === selectedRepoId))) {
      setSelectedRepoId(activeRepos[0].id);
      setTargetBranch(activeRepos[0].default_branch || 'main');
    }
  }, [activeRepos, selectedRepoId, initialRepoId, repositories]);

  // Reset view when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveView('form');
      setCurrentExecution(null);
      setTriggering(false);
    } else {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    }
  }, [isOpen]);

  // Polling for live status updates while execution is in-progress
  useEffect(() => {
    if (activeView === 'streaming' && currentExecution && !['COMPLETED', 'FAILED', 'SKIPPED'].includes(currentExecution.status)) {
      pollIntervalRef.current = setInterval(async () => {
        try {
          const fresh = await executionService.getExecution(currentExecution.id);
          if (fresh) {
            setCurrentExecution(fresh);
            if (['COMPLETED', 'FAILED', 'SKIPPED'].includes(fresh.status)) {
              clearInterval(pollIntervalRef.current);
              onTriggered();
            }
          }
        } catch (err) {
          console.debug('Polling note:', err);
        }
      }, 1500);
    }
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [activeView, currentExecution?.id, currentExecution?.status, onTriggered]);

  const handleRepoChange = (repoId: string) => {
    setSelectedRepoId(repoId);
    const repo = repositories.find((r) => r.id === repoId);
    if (repo?.default_branch) {
      setTargetBranch(repo.default_branch);
    }
  };

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
      setActiveView('streaming');
      let commitSha = '';

      if (syncMode === 'latest') {
        commitSha = 'latest';
      } else if (syncMode === 'custom') {
        commitSha = customCommitSha.trim();
        if (!commitSha) {
          error('Missing Commit SHA', 'Please enter a valid GitHub commit SHA.');
          setActiveView('form');
          setTriggering(false);
          return;
        }
      } else {
        const randomHex = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
        const prefix = scenario === 'bugfix' ? 'bugf' : scenario === 'caching' ? 'cach' : 'bill';
        commitSha = (prefix + '0000' + randomHex).slice(0, 40);
      }

      const created = await executionService.triggerExecution({
        repository_id: selectedRepoId,
        commit_sha: commitSha,
        branch: targetBranch || selectedRepo?.default_branch || 'main',
        event_type: 'push',
      });

      setCurrentExecution(created);
      onTriggered();

      if (created.status === 'COMPLETED') {
        success('Pipeline Executed', 'Documentation synchronized successfully directly to main branch.');
      }
    } catch (err: any) {
      error('Trigger Failed', err.message || 'Could not start pipeline run.');
    } finally {
      setTriggering(false);
    }
  };

  const handleDone = () => {
    onTriggered();
    onClose();
  };

  const handleViewExecutionDetails = (exec: Execution) => {
    onClose();
    if (onViewDetails) {
      onViewDetails(exec);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={activeView === 'streaming' ? 'Autonomous Documentation Sync Stream' : 'Trigger Autonomous Sync Execution'}
      subtitle={
        activeView === 'streaming'
          ? 'Live 3-Agent Progression, Real-time Gemini Trace & GitHub Write-Back.'
          : 'Analyze live GitHub commits with the 3-Agent AI Pipeline (Gemini Flash Engine).'
      }
      maxWidth={activeView === 'streaming' ? 'xl' : 'lg'}
    >
      {activeView === 'streaming' ? (
        <div className="space-y-4">
          <LiveSyncProgressStream
            execution={currentExecution}
            isLoading={triggering}
            repoFullName={selectedRepo?.full_name || 'Repository'}
            onViewDetails={handleViewExecutionDetails}
            onDone={handleDone}
          />
          {currentExecution && ['COMPLETED', 'FAILED', 'SKIPPED'].includes(currentExecution.status) && (
            <div className="flex justify-start">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setActiveView('form');
                  setCurrentExecution(null);
                }}
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                Run Another Sync
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {/* Repository selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Target Repository (Active Only)
            </label>
            {activeRepos.length === 0 ? (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-300">
                No active repositories found. Please activate automation on a repository in the Repositories tab first.
              </div>
            ) : (
              <select
                value={selectedRepoId}
                onChange={(e) => handleRepoChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-dark-card border border-dark-border rounded-lg text-sm text-slate-100 focus:outline-none focus:border-brand-500/60"
              >
                {activeRepos.map((repo) => (
                  <option key={repo.id} value={repo.id}>
                    {repo.full_name} ({repo.default_branch || 'main'})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Sync Mode Tabs */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Execution Source Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSyncMode('latest')}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all ${
                  syncMode === 'latest'
                    ? 'border-brand-500/80 bg-brand-500/15 text-brand-300 ring-1 ring-brand-500/40'
                    : 'border-dark-border bg-dark-card/50 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Zap className="w-4 h-4 text-brand-400" />
                <span>Latest Commit</span>
                <span className="text-[10px] text-slate-500 font-normal">Real GitHub HEAD</span>
              </button>

              <button
                type="button"
                onClick={() => setSyncMode('custom')}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all ${
                  syncMode === 'custom'
                    ? 'border-brand-500/80 bg-brand-500/15 text-brand-300 ring-1 ring-brand-500/40'
                    : 'border-dark-border bg-dark-card/50 text-slate-400 hover:border-slate-700'
                }`}
              >
                <GitCommit className="w-4 h-4 text-sky-400" />
                <span>Custom SHA</span>
                <span className="text-[10px] text-slate-500 font-normal">Specific Commit</span>
              </button>

              <button
                type="button"
                onClick={() => setSyncMode('simulate')}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all ${
                  syncMode === 'simulate'
                    ? 'border-brand-500/80 bg-brand-500/15 text-brand-300 ring-1 ring-brand-500/40'
                    : 'border-dark-border bg-dark-card/50 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Code className="w-4 h-4 text-purple-400" />
                <span>Simulated Demo</span>
                <span className="text-[10px] text-slate-500 font-normal">Mock Changes</span>
              </button>
            </div>
          </div>

          {/* Mode Specific Inputs */}
          {syncMode === 'latest' && (
            <div className="p-3.5 bg-brand-500/5 border border-brand-500/20 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-brand-300">
                <Zap className="w-4 h-4" />
                <span>Live GitHub Auto-Fetch Enabled</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                TracePath will fetch the latest live commit from branch <code className="text-brand-300 bg-brand-500/10 px-1 py-0.5 rounded">{targetBranch}</code> on <strong className="text-slate-200">{selectedRepo?.full_name || 'selected repo'}</strong>, fetch the live code diffs, run the 3 AI agents, and commit documentation updates directly to <strong className="text-emerald-400">{targetBranch}</strong>!
              </p>
            </div>
          )}

          {syncMode === 'custom' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  GitHub Commit SHA (40-character hash or prefix)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 3727b3dc9ebeedafec9d0f2b58430f7b44889c1"
                  value={customCommitSha}
                  onChange={(e) => setCustomCommitSha(e.target.value)}
                  className="w-full px-3.5 py-2 bg-dark-card border border-dark-border rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-brand-500/60"
                />
              </div>
            </div>
          )}

          {syncMode === 'simulate' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Select Demo Scenario
              </label>
              <div className="space-y-2">
                {scenarios.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setScenario(s.id as any)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
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
          )}

          {/* Footer Actions */}
          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-dark-border">
            <Button variant="outline" size="sm" onClick={onClose} disabled={triggering}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleTrigger}
              isLoading={triggering}
              disabled={triggering || activeRepos.length === 0}
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              {syncMode === 'latest' ? 'Sync Live GitHub Commit' : 'Run Multi-Agent Pipeline'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
