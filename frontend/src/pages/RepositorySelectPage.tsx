import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { SearchInput } from '../components/common/SearchInput';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { githubService, GitHubAvailableRepo } from '../services/githubService';
import { repositoryService } from '../services/repositoryService';
import { useToast } from '../hooks/useToast';
import { GitBranch, Lock, Globe, Star, CheckSquare, Square, ArrowRight, RefreshCw, FolderGit2 } from 'lucide-react';

interface RepositorySelectPageProps {
  onComplete: () => void;
}

export const RepositorySelectPage: React.FC<RepositorySelectPageProps> = ({
  onComplete,
}) => {
  const [availableRepos, setAvailableRepos] = useState<GitHubAvailableRepo[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [importing, setImporting] = useState<boolean>(false);
  const { success, error } = useToast();

  const loadRepos = async () => {
    try {
      setLoading(true);
      const savedUser = localStorage.getItem('tracepath_github_user') || 'Ayushaggarwal05';
      const repos = await githubService.getAvailableRepositories(savedUser);
      setAvailableRepos(repos);
      if (repos && repos.length > 0) {
        setSelectedIds([repos[0].id]);
      }
    } catch (err: any) {
      error('Failed to load GitHub repositories', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRepos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredRepos.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRepos.map((r) => r.id));
    }
  };

  const filteredRepos = availableRepos.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.full_name.toLowerCase().includes(search.toLowerCase())
  );

  const handleImport = async () => {
    if (selectedIds.length === 0) return;
    try {
      setImporting(true);
      const selected = availableRepos.filter((r) => selectedIds.includes(r.id));
      let successCount = 0;

      for (const repo of selected) {
        let repoId: string | null = null;
        try {
          const registered = await repositoryService.registerRepository({
            github_repo_id: String(repo.id),
            name: repo.name,
            full_name: repo.full_name,
            default_branch: repo.default_branch || 'main',
            is_private: Boolean(repo.is_private),
            html_url: repo.html_url || `https://github.com/${repo.full_name}`,
            description: repo.description || undefined,
          });
          if (registered && registered.id) {
            repoId = registered.id;
          }
          successCount++;
        } catch (regErr: any) {
          // If already registered (409 Conflict), consider it connected
          if (regErr?.status === 409 || regErr?.message?.includes('already exists')) {
            successCount++;
          } else {
            console.warn(`Failed to register repo ${repo.full_name}:`, regErr);
          }
        }

        if (repoId) {
          try {
            await repositoryService.activateAutomation(repoId);
          } catch {
            // Automation already active or default
          }
        }
      }

      if (successCount > 0) {
        success('Repositories Imported', `Successfully connected ${successCount} repos with autonomous sync enabled.`);
        onComplete();
      } else {
        error('Import Failed', 'Unable to import the selected repositories. Please try again.');
      }
    } catch (err: any) {
      error('Import Failed', err.message || 'Could not import repositories.');
    } finally {
      setImporting(false);
    }
  };


  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Select Repositories</h2>
          <p className="text-sm text-slate-400 mt-1">
            Choose which repositories you want TracePath AI to monitor and keep synchronized.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="md"
            onClick={loadRepos}
            disabled={loading}
            leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            onClick={handleImport}
            isLoading={importing}
            disabled={selectedIds.length === 0}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Import & Activate ({selectedIds.length})
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="w-72">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
            placeholder="Search GitHub repositories..."
          />
        </div>

        {filteredRepos.length > 0 && (
          <button
            onClick={toggleSelectAll}
            className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-slate-200"
          >
            {selectedIds.length === filteredRepos.length ? (
              <CheckSquare className="w-4 h-4 text-brand-400" />
            ) : (
              <Square className="w-4 h-4" />
            )}
            <span>Select All ({filteredRepos.length})</span>
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner label="Fetching accessible repositories from GitHub..." />
      ) : filteredRepos.length === 0 ? (
        <Card className="p-12 text-center space-y-4 border-dashed border-dark-border">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-dark-border flex items-center justify-center mx-auto text-slate-400">
            <FolderGit2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-semibold text-slate-200">No Repositories Found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Could not find repositories for this account. Ensure your username is correct or connect a GitHub Token on the connect page.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={loadRepos}>
            Retry Fetch
          </Button>
        </Card>
      ) : (

        <div className="bg-slate-900/60 border border-dark-border rounded-xl divide-y divide-dark-border/60 overflow-hidden shadow-sm">
          {filteredRepos.map((repo) => {
            const isSelected = selectedIds.includes(repo.id);

            return (
              <div
                key={repo.id}
                onClick={() => toggleSelect(repo.id)}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:px-5 gap-3 cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-brand-500/10 border-l-4 border-l-brand-500'
                    : 'hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="w-4 h-4 mt-1 sm:mt-0 rounded bg-slate-900 border-slate-700 text-brand-500 focus:ring-brand-500/40 shrink-0 pointer-events-none"
                  />
                  <div className="p-2 rounded-lg border shrink-0 bg-slate-800/80 border-slate-700/60 text-slate-400">
                    <FolderGit2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-sm text-slate-100 truncate">
                        {repo.name}
                      </span>
                      {repo.is_private ? (
                        <span title="Private"><Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" /></span>
                      ) : (
                        <span title="Public"><Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" /></span>
                      )}
                      <span className="text-xs font-mono text-slate-500 truncate hidden sm:inline">
                        {repo.full_name}
                      </span>
                    </div>
                    {repo.description && (
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5 leading-relaxed">
                        {repo.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 text-xs text-slate-400">
                  <span className="inline-flex items-center gap-1 font-mono bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/40">
                    <GitBranch className="w-3.5 h-3.5 text-slate-500" />
                    {repo.default_branch || 'main'}
                  </span>
                  {repo.language && (
                    <Badge variant="slate" className="text-[11px] py-0 font-mono">
                      {repo.language}
                    </Badge>
                  )}
                  {repo.stars !== undefined && repo.stars > 0 && (
                    <span className="flex items-center gap-1 text-xs font-mono text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      {repo.stars}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

