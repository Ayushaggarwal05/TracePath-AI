import React, { useState, useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { SearchInput } from '../components/common/SearchInput';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { githubService, GitHubAvailableRepo } from '../services/githubService';
import { repositoryService } from '../services/repositoryService';
import { useToast } from '../hooks/useToast';
import { GitBranch, Lock, Globe, Star, CheckSquare, Square, ArrowRight } from 'lucide-react';

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

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const repos = await githubService.getAvailableRepositories();
        setAvailableRepos(repos);
        // Default select first two
        setSelectedIds(repos.slice(0, 2).map((r) => r.id));
      } catch (err: any) {
        error('Failed to load GitHub repositories', err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [error]);

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

      for (const repo of selected) {
        await repositoryService.registerRepository({
          github_repo_id: repo.id,
          name: repo.name,
          full_name: repo.full_name,
          default_branch: repo.default_branch,
          is_private: repo.is_private,
          html_url: repo.html_url,
          description: repo.description,
        });
      }

      success('Repositories Imported', `Activated ${selected.length} repositories for documentation sync.`);
      onComplete();
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

      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="w-72">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
            placeholder="Search GitHub repositories..."
          />
        </div>

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
      </div>

      {loading ? (
        <LoadingSpinner label="Fetching accessible repositories from GitHub..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRepos.map((repo) => {
            const isSelected = selectedIds.includes(repo.id);

            return (
              <Card
                key={repo.id}
                onClick={() => toggleSelect(repo.id)}
                className={`p-4 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-brand-500/60 bg-brand-500/5 ring-1 ring-brand-500/30'
                    : 'hover:border-slate-700 bg-dark-card/60'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-brand-500 focus:ring-brand-500/40"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-sm text-slate-100 truncate">
                          {repo.name}
                        </span>
                        {repo.is_private ? (
                          <Lock className="w-3 h-3 text-slate-500 shrink-0" />
                        ) : (
                          <Globe className="w-3 h-3 text-slate-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] font-mono text-slate-400 truncate">
                        {repo.full_name}
                      </p>
                    </div>
                  </div>

                  {repo.stars !== undefined && repo.stars > 0 && (
                    <span className="flex items-center gap-1 text-xs font-mono text-slate-400 shrink-0">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      {repo.stars}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 mb-3 leading-relaxed">
                  {repo.description}
                </p>

                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <span className="flex items-center gap-1">
                    <GitBranch className="w-3 h-3 text-slate-500" />
                    {repo.default_branch}
                  </span>
                  {repo.language && (
                    <Badge variant="slate" className="text-[10px] py-0">
                      {repo.language}
                    </Badge>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
