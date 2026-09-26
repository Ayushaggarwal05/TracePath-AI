import React, { useState, useEffect } from 'react';
import { Repository } from '../../types/repository';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { automationService } from '../../services/automationService';
import { useToast } from '../../hooks/useToast';
import { Plus, Trash2, GitPullRequest, GitCommit, FileText } from 'lucide-react';

interface AutomationSettingsModalProps {
  repository: Repository | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (repo: Repository) => void;
}

export const AutomationSettingsModal: React.FC<AutomationSettingsModalProps> = ({
  repository,
  isOpen,
  onClose,
  onSaved,
}) => {
  const [targetBranch, setTargetBranch] = useState<string>('main');
  const [docPaths, setDocPaths] = useState<string[]>(['ARCHITECTURE.md', 'README.md']);
  const [newPathInput, setNewPathInput] = useState<string>('');
  const [createPR, setCreatePR] = useState<boolean>(true);
  const [autoCommit, setAutoCommit] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const { success, error } = useToast();

  useEffect(() => {
    if (repository?.automation) {
      setTargetBranch(repository.automation.target_branch || repository.default_branch || 'main');
      setDocPaths(repository.automation.doc_paths || ['ARCHITECTURE.md', 'README.md']);
      setCreatePR(repository.automation.create_pull_request ?? true);
      setAutoCommit(repository.automation.auto_commit ?? false);
    }
  }, [repository]);

  if (!repository) return null;

  const handleAddPath = () => {
    const trimmed = newPathInput.trim();
    if (trimmed && !docPaths.includes(trimmed)) {
      setDocPaths([...docPaths, trimmed]);
      setNewPathInput('');
    }
  };

  const handleRemovePath = (index: number) => {
    setDocPaths(docPaths.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await automationService.updateAutomation(repository.id, {
        target_branch: targetBranch,
        doc_paths: docPaths,
        create_pull_request: createPR,
        auto_commit: autoCommit,
        pr_target_branch: targetBranch,
      });

      const updatedRepo: Repository = {
        ...repository,
        automation: updated,
      };

      success('Configuration Saved', `Documentation sync rules updated for ${repository.name}.`);
      onSaved(updatedRepo);
      onClose();
    } catch (err: any) {
      error('Failed to Save', err.message || 'Could not update automation configuration.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Configure ${repository.name}`}
      subtitle="Define target documentation files, sync branch, and synchronization modes."
      maxWidth="lg"
      variant="darkBeige"
    >
      <div className="space-y-5">
        {/* Target Branch */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 font-sans">
            Target Sync Branch
          </label>
          <input
            type="text"
            value={targetBranch}
            onChange={(e) => setTargetBranch(e.target.value)}
            className="w-full px-4 py-2.5 bg-white dark:bg-slate-900/90 border border-stone-300 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:border-slate-500 dark:focus:border-slate-600 focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-700 transition-all shadow-2xs"
            placeholder="main"
          />
          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1.5 font-sans leading-normal">
            TracePath will listen for commits and pull requests against this branch.
          </p>
        </div>

        {/* Tracked Documentation Files */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-sans">
              Tracked Documentation Files & Paths
            </label>
            <span className="text-[11px] font-mono font-medium text-slate-600 dark:text-slate-400 bg-white/70 dark:bg-slate-900/60 px-2 py-0.5 rounded-md border border-stone-300/70 dark:border-slate-800">
              {docPaths.length} files
            </span>
          </div>

          <div className="space-y-2 mb-2.5 max-h-44 overflow-y-auto pr-1 custom-scrollbar">
            {docPaths.map((path, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between px-3.5 py-2.5 bg-white/95 dark:bg-slate-900/90 border border-stone-300/80 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-800 dark:text-slate-200 shadow-2xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="truncate font-semibold text-xs">{path}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemovePath(idx)}
                  className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 rounded-lg hover:bg-stone-200/70 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0 ml-2"
                  title="Remove path"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newPathInput}
              onChange={(e) => setNewPathInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPath())}
              placeholder="e.g. docs/api.md or PRD.md"
              className="flex-1 px-3.5 py-2 bg-white dark:bg-slate-900/90 border border-stone-300 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-slate-500 dark:focus:border-slate-600 transition-all shadow-2xs"
            />
            <Button size="sm" variant="secondary" onClick={handleAddPath} leftIcon={<Plus className="w-3.5 h-3.5 text-emerald-600" />}>
              Add Path
            </Button>
          </div>
        </div>

        {/* Sync Mode */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 font-sans">
            Commit Action Mode
          </label>
          <div className="grid grid-cols-2 gap-3.5">
            <div
              onClick={() => {
                setCreatePR(true);
                setAutoCommit(false);
              }}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                createPR
                  ? 'border-emerald-600 bg-white dark:bg-emerald-950/40 text-slate-900 dark:text-slate-100 ring-2 ring-emerald-600 shadow-sm'
                  : 'border-stone-300 dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 text-slate-700 dark:text-slate-400 hover:border-stone-400 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <GitPullRequest className={`w-4 h-4 ${createPR ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                <span className="text-xs font-bold font-sans">Pull Request</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal font-sans">
                Creates an automated review PR with generated documentation updates.
              </p>
            </div>

            <div
              onClick={() => {
                setAutoCommit(true);
                setCreatePR(false);
              }}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                autoCommit
                  ? 'border-emerald-600 bg-white dark:bg-emerald-950/40 text-slate-900 dark:text-slate-100 ring-2 ring-emerald-600 shadow-sm'
                  : 'border-stone-300 dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 text-slate-700 dark:text-slate-400 hover:border-stone-400 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <GitCommit className={`w-4 h-4 ${autoCommit ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                <span className="text-xs font-bold font-sans">Direct Commit</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal font-sans">
                Directly commits minimal documentation diffs back to the target branch.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-stone-300/80 dark:border-slate-800">
        <Button variant="outline" size="sm" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button variant="primary" size="sm" onClick={handleSave} isLoading={saving}>
          Save Configuration
        </Button>
      </div>
    </Modal>
  );
};
