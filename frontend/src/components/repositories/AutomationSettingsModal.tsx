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
    >
      <div className="space-y-6">
        {/* Target Branch */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Target Sync Branch
          </label>
          <input
            type="text"
            value={targetBranch}
            onChange={(e) => setTargetBranch(e.target.value)}
            className="w-full px-3.5 py-2 bg-dark-card border border-dark-border rounded-lg text-sm text-slate-100 font-mono focus:outline-none focus:border-brand-500/60 focus:ring-1 focus:ring-brand-500/60"
            placeholder="main"
          />
          <p className="text-xs text-slate-500 mt-1">
            TracePath will listen for commits and pull requests against this branch.
          </p>
        </div>

        {/* Tracked Documentation Files */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Tracked Documentation Files & Paths
            </label>
            <span className="text-xs text-slate-500">{docPaths.length} files</span>
          </div>

          <div className="space-y-2 mb-3 max-h-48 overflow-y-auto pr-1">
            {docPaths.map((path, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between px-3 py-2 bg-slate-900/60 border border-dark-border rounded-lg text-xs font-mono text-slate-200"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-brand-400" />
                  <span>{path}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemovePath(idx)}
                  className="text-slate-500 hover:text-rose-400 p-1 rounded"
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
              className="flex-1 px-3 py-1.5 bg-dark-card border border-dark-border rounded-lg text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500/60"
            />
            <Button size="sm" variant="secondary" onClick={handleAddPath} leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Add Path
            </Button>
          </div>
        </div>

        {/* Sync Mode */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Commit Action Mode
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div
              onClick={() => {
                setCreatePR(true);
                setAutoCommit(false);
              }}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                createPR
                  ? 'border-brand-500/60 bg-brand-500/10 text-slate-100'
                  : 'border-dark-border bg-dark-card/60 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <GitPullRequest className={`w-4 h-4 ${createPR ? 'text-brand-400' : 'text-slate-400'}`} />
                <span className="text-xs font-semibold">Pull Request</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Creates a review PR with the generated minimal documentation updates.
              </p>
            </div>

            <div
              onClick={() => {
                setAutoCommit(true);
                setCreatePR(false);
              }}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                autoCommit
                  ? 'border-brand-500/60 bg-brand-500/10 text-slate-100'
                  : 'border-dark-border bg-dark-card/60 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <GitCommit className={`w-4 h-4 ${autoCommit ? 'text-brand-400' : 'text-slate-400'}`} />
                <span className="text-xs font-semibold">Direct Commit</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Directly commits minimal documentation diffs back to the target branch.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-dark-border">
        <Button variant="outline" size="sm" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button variant="primary" size="sm" onClick={handleSave} isLoading={saving}>
          Save Changes
        </Button>
      </div>
    </Modal>
  );
};
