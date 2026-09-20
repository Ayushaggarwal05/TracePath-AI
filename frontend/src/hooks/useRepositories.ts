import { useState, useEffect, useCallback } from 'react';
import { Repository } from '../types/repository';
import { repositoryService } from '../services/repositoryService';
import { githubService } from '../services/githubService';

export function useRepositories() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [githubCount, setGithubCount] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRepositories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const savedUser = localStorage.getItem('tracepath_github_user') || 'Ayushaggarwal05';

      // Fetch both registered DB repos and live GitHub repos in parallel
      const [dbRes, ghRepos] = await Promise.all([
        repositoryService.getRepositories(1, 100).catch(() => ({ items: [], total: 0 })),
        githubService.getAvailableRepositories(savedUser).catch(() => []),
      ]);

      const dbMap = new Map<string, Repository>();
      (dbRes.items || []).forEach((r) => {
        if (r.github_repo_id) dbMap.set(String(r.github_repo_id), r);
        if (r.full_name) dbMap.set(r.full_name.toLowerCase(), r);
        if (r.name) dbMap.set(r.name.toLowerCase(), r);
      });

      const merged: Repository[] = [];
      const seenNames = new Set<string>();

      // 1. Process live GitHub repos
      if (ghRepos && ghRepos.length > 0) {
        ghRepos.forEach((gh) => {
          const nameKey = (gh.name || '').toLowerCase();
          const fullNameKey = (gh.full_name || '').toLowerCase();
          const existing =
            dbMap.get(String(gh.id)) ||
            dbMap.get(fullNameKey) ||
            dbMap.get(nameKey);

          if (fullNameKey) seenNames.add(fullNameKey);
          if (nameKey) seenNames.add(nameKey);

          if (existing) {
            merged.push({
              ...existing,
              name: gh.name || existing.name,
              full_name: gh.full_name || existing.full_name,
              is_private: gh.is_private ?? existing.is_private,
              default_branch: gh.default_branch || existing.default_branch,
              html_url: gh.html_url || existing.html_url,
              description: gh.description || existing.description,
            });
          } else {
            merged.push({
              id: `gh_${gh.id}`,
              github_repo_id: String(gh.id),
              name: gh.name,
              full_name: gh.full_name,
              default_branch: gh.default_branch || 'main',
              is_private: Boolean(gh.is_private),
              html_url: gh.html_url,
              description: gh.description || undefined,
              language: gh.language,
              automation: {
                id: `auto_${gh.id}`,
                repository_id: `gh_${gh.id}`,
                status: 'INACTIVE',
                target_branch: gh.default_branch || 'main',
                doc_paths: ['docs/', 'README.md', 'ARCHITECTURE.md'],
                auto_commit: false,
                create_pull_request: true,
                pr_target_branch: gh.default_branch || 'main',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          }
        });
      }

      // 2. Add any custom DB repos ONLY if they don't match any live GitHub repo name
      (dbRes.items || []).forEach((r) => {
        const rName = (r.name || '').toLowerCase();
        const rFullName = (r.full_name || '').toLowerCase();
        if (!seenNames.has(rFullName) && !seenNames.has(rName)) {
          seenNames.add(rFullName);
          merged.unshift(r);
        }
      });

      setRepositories(merged);
      setTotal(merged.length);
      setGithubCount(ghRepos?.length || merged.length);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch repositories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRepositories();
  }, [fetchRepositories]);

  return {
    repositories,
    setRepositories,
    total,
    githubCount,
    loading,
    error,
    refetch: fetchRepositories,
  };
}

