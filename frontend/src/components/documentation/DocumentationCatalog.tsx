import React, { useState } from 'react';
import { TrackedDocument } from '../../types/documentation';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { DiffViewerModal } from '../activity/DiffViewerModal';
import { formatShortSha, formatDate } from '../../utils/formatters';
import { FileCode, Clock, GitCommit, Eye, History } from 'lucide-react';

interface DocumentationCatalogProps {
  documents: TrackedDocument[];
  onOpenHistory?: (doc: TrackedDocument) => void;
}

export const DocumentationCatalog: React.FC<DocumentationCatalogProps> = ({
  documents,
  onOpenHistory,
}) => {
  const [selectedDocDiff, setSelectedDocDiff] = useState<TrackedDocument | null>(null);

  const getCategoryBadge = (category: TrackedDocument['category']) => {
    switch (category) {
      case 'architecture':
        return <Badge variant="indigo">Architecture</Badge>;
      case 'api':
        return <Badge variant="emerald">REST API</Badge>;
      case 'prd':
        return <Badge variant="amber">PRD</Badge>;
      case 'adr':
        return <Badge variant="rose">ADR</Badge>;
      default:
        return <Badge variant="slate">General Doc</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="p-5 rounded-2xl bg-white dark:bg-[#0D1526] border border-stone-200/90 dark:border-slate-800/90 hover:border-stone-300 dark:hover:border-slate-700 shadow-xs transition-all space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-stone-200 dark:border-slate-700 text-emerald-700 dark:text-emerald-400 mt-0.5 shrink-0">
                  <FileCode className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                      {doc.doc_path}
                    </span>
                    {getCategoryBadge(doc.category)}
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-stone-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-md border border-stone-200 dark:border-slate-700">
                      {doc.total_updates_count} sync revisions
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">{doc.title}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                {doc.diff && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedDocDiff(doc)}
                    leftIcon={<Eye className="w-3.5 h-3.5" />}
                  >
                    View Diff
                  </Button>
                )}
                {onOpenHistory && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onOpenHistory(doc)}
                    leftIcon={<History className="w-3.5 h-3.5" />}
                  >
                    History
                  </Button>
                )}
              </div>
            </div>

            {/* Last Change Summary */}
            {doc.summary_of_last_change && (
              <div className="p-3.5 rounded-xl bg-[#F7F5F0] dark:bg-slate-900/80 border border-stone-200/80 dark:border-slate-800 text-xs space-y-1.5">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between font-sans">
                  <span>Latest Synchronized Update</span>
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">+{doc.lines_added || 0}</span>
                    <span className="text-rose-600 dark:text-rose-400 font-bold">-{doc.lines_removed || 0}</span>
                  </div>
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-sans">{doc.summary_of_last_change}</p>
              </div>
            )}

            {/* Metadata Footer */}
            <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-slate-500 dark:text-slate-400 pt-1 border-t border-stone-100 dark:border-slate-800">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Updated {formatDate(doc.last_updated_at)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <GitCommit className="w-3.5 h-3.5 text-slate-400" />
                Commit: <code className="text-slate-700 dark:text-slate-300 font-bold">{formatShortSha(doc.last_commit_sha)}</code>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Diff Modal */}
      {selectedDocDiff && (
        <DiffViewerModal
          isOpen={!!selectedDocDiff}
          onClose={() => setSelectedDocDiff(null)}
          title={`Documentation Diff: ${selectedDocDiff.doc_path}`}
          subtitle={selectedDocDiff.summary_of_last_change}
          rawDiff={selectedDocDiff.diff || ''}
          updatedContent={selectedDocDiff.current_content}
          docPath={selectedDocDiff.doc_path}
        />
      )}
    </div>
  );
};
