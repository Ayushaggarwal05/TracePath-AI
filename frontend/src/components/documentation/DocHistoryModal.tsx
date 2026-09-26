import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { TrackedDocument, DocumentHistoryEntry } from '../../types/documentation';
import { documentationService } from '../../services/documentationService';
import { DiffViewer } from '../diff/DiffViewer';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Badge } from '../common/Badge';
import { formatShortSha, formatDate } from '../../utils/formatters';
import { GitCommit, Clock, ChevronDown, ChevronUp } from 'lucide-react';

interface DocHistoryModalProps {
  document: TrackedDocument | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DocHistoryModal: React.FC<DocHistoryModalProps> = ({
  document,
  isOpen,
  onClose,
}) => {
  const [history, setHistory] = useState<DocumentHistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && document) {
      setLoading(true);
      documentationService
        .getDocumentHistory(document.doc_path, document.repository_id)
        .then((data) => {
          setHistory(data);
          if (data.length > 0) setExpandedId(data[0].id);
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, document]);

  if (!document) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Revision History: ${document.doc_path}`}
      subtitle={`Chronological audit trail of autonomous documentation updates`}
      maxWidth="5xl"
    >
      <div className="space-y-4">
        {loading ? (
          <LoadingSpinner label="Loading document history..." />
        ) : history.length === 0 ? (
          <div className="p-8 text-center text-slate-500 dark:text-slate-400 italic">No revision history found.</div>
        ) : (
          <div className="space-y-3">
            {history.map((entry) => {
              const isExpanded = expandedId === entry.id;

              return (
                <div
                  key={entry.id}
                  className="rounded-2xl border border-stone-200/90 dark:border-slate-800 bg-[#F7F5F0] dark:bg-slate-900/60 overflow-hidden transition-all shadow-2xs"
                >
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                    className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-stone-200/50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-stone-200/80 dark:border-slate-700 shrink-0 mt-0.5 shadow-2xs">
                        <GitCommit className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100">
                            {formatShortSha(entry.commit_sha)}
                          </span>
                          <Badge variant="emerald">Validated</Badge>
                          <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                            {entry.commit_message}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300">{entry.summary_of_changes}</p>
                        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                          <span>{entry.author}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(entry.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>

                  {/* Expanded Diff Viewer */}
                  {isExpanded && (
                    <div className="p-4 border-t border-stone-200/80 dark:border-slate-800 bg-white dark:bg-slate-950/60">
                      <DiffViewer
                        rawDiff={entry.diff}
                        updatedContent={entry.updated_content}
                        docPath={entry.doc_path}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
};
