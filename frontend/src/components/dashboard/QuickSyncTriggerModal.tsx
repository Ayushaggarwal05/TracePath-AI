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
      }, 900);
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
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 font-sans">
              Target Repository (Active Only)
            </label>
            {activeRepos.length === 0 ? (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-700 dark:text-amber-300">
                No active repositories found. Please activate automation on a repository in the Repositories tab first.
              </div>
            ) : (
              <select
                value={selectedRepoId}
                onChange={(e) => handleRepoChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#F4F2EB] dark:bg-slate-900/90 border border-stone-200/90 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-slate-400 dark:focus:border-slate-700 focus:bg-white dark:focus:bg-slate-950 transition-all shadow-2xs"
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
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 font-sans">
              Execution Source Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSyncMode('latest')}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-xs font-medium transition-all cursor-pointer ${
                  syncMode === 'latest'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-slate-900 dark:text-slate-100 ring-1 ring-emerald-600 shadow-xs'
                    : 'border-stone-200/90 dark:border-slate-800 bg-[#F7F5F0] dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:border-stone-300 dark:hover:border-slate-700'
                }`}
              >
                <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="font-bold font-sans">Latest Commit</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">Real GitHub HEAD</span>
              </button>

              <button
                type="button"
                onClick={() => setSyncMode('custom')}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-xs font-medium transition-all cursor-pointer ${
                  syncMode === 'custom'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-slate-900 dark:text-slate-100 ring-1 ring-emerald-600 shadow-xs'
                    : 'border-stone-200/90 dark:border-slate-800 bg-[#F7F5F0] dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:border-stone-300 dark:hover:border-slate-700'
                }`}
              >
                <GitCommit className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="font-bold font-sans">Custom SHA</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">Specific Commit</span>
              </button>

              <button
                type="button"
                onClick={() => setSyncMode('simulate')}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-xs font-medium transition-all cursor-pointer ${
                  syncMode === 'simulate'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-slate-900 dark:text-slate-100 ring-1 ring-emerald-600 shadow-xs'
                    : 'border-stone-200/90 dark:border-slate-800 bg-[#F7F5F0] dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:border-stone-300 dark:hover:border-slate-700'
                }`}
              >
                <Code className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="font-bold font-sans">Simulated Demo</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">Mock Changes</span>
              </button>
            </div>
          </div>

          {/* Mode Specific Inputs */}
          {syncMode === 'latest' && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Live GitHub Auto-Fetch Enabled</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                TracePath will fetch the latest live commit from branch <code className="text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-500/15 px-1 py-0.5 rounded font-mono text-[11px]">{targetBranch}</code> on <strong className="text-slate-900 dark:text-slate-100">{selectedRepo?.full_name || 'selected repo'}</strong>, fetch live code diffs, execute the 3 AI agents, and commit documentation updates directly to <strong className="text-emerald-700 dark:text-emerald-400">{targetBranch}</strong>!
              </p>
            </div>
          )}

          {syncMode === 'custom' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 font-sans">
                  GitHub Commit SHA (40-character hash or prefix)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 3727b3dc9ebeedafec9d0f2b58430f7b44889c1"
                  value={customCommitSha}
                  onChange={(e) => setCustomCommitSha(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F4F2EB] dark:bg-slate-900/90 border border-stone-200/90 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-slate-700 focus:bg-white dark:focus:bg-slate-950 transition-all shadow-2xs"
                />
              </div>
            </div>
          )}

          {syncMode === 'simulate' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 font-sans">
                Select Demo Scenario
              </label>
              <div className="space-y-2">
                {scenarios.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setScenario(s.id as any)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      scenario === s.id
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 text-slate-900 dark:text-slate-100 ring-1 ring-emerald-600 shadow-xs'
                        : 'border-stone-200/90 dark:border-slate-800 bg-[#F7F5F0] dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:border-stone-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Code className={`w-4 h-4 ${scenario === s.id ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                      <span className="text-xs font-bold font-sans">{s.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-sans">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="mt-8 flex justify-end gap-2.5 pt-4 border-t border-stone-100 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={onClose} disabled={triggering}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleTrigger}
              isLoading={triggering}
              disabled={triggering || activeRepos.length === 0}
              leftIcon={<Sparkles className="w-3.5 h-3.5" />}
            >
              {syncMode === 'latest' ? 'Sync Live GitHub Commit' : 'Run Multi-Agent Pipeline'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
