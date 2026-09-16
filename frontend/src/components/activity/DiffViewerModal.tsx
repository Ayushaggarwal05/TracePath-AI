import React from 'react';
import { Modal } from '../common/Modal';
import { parseUnifiedDiff } from '../../utils/diffViewer';
import { FileCode, Copy, Check } from 'lucide-react';

interface DiffViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  rawDiff: string;
}

export const DiffViewerModal: React.FC<DiffViewerModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  rawDiff,
}) => {
  const [copied, setCopied] = React.useState(false);
  const diffLines = parseUnifiedDiff(rawDiff);

  const handleCopy = () => {
    navigator.clipboard.writeText(rawDiff);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} subtitle={subtitle} maxWidth="4xl">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-dark-border">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <FileCode className="w-4 h-4 text-brand-400" />
          <span>Unified Documentation Diff</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy Diff'}</span>
        </button>
      </div>

      <div className="bg-slate-950 border border-dark-border rounded-xl font-mono text-xs overflow-x-auto max-h-[60vh] p-3 leading-relaxed">
        {diffLines.length === 0 ? (
          <p className="text-slate-500 italic p-4 text-center">No diff available for this execution.</p>
        ) : (
          diffLines.map((line, idx) => {
            let lineBg = '';
            let textColor = 'text-slate-300';
            let prefix = ' ';

            if (line.type === 'add') {
              lineBg = 'bg-emerald-500/10 hover:bg-emerald-500/15';
              textColor = 'text-emerald-400';
              prefix = '+';
            } else if (line.type === 'delete') {
              lineBg = 'bg-rose-500/10 hover:bg-rose-500/15';
              textColor = 'text-rose-400';
              prefix = '-';
            } else if (line.type === 'header') {
              lineBg = 'bg-indigo-500/10 text-indigo-400 py-1 font-semibold';
              prefix = '@';
            } else if (line.type === 'file') {
              lineBg = 'bg-slate-900 text-slate-400 font-bold py-1';
            }

            return (
              <div key={idx} className={`flex items-start px-2 py-0.5 rounded ${lineBg}`}>
                <span className="w-8 shrink-0 text-slate-600 text-right pr-2 select-none">
                  {line.newLineNumber || line.oldLineNumber || ''}
                </span>
                <span className="w-4 shrink-0 text-slate-500 select-none">{prefix}</span>
                <span className={`flex-1 whitespace-pre-wrap ${textColor}`}>{line.content}</span>
              </div>
            );
          })
        )}
      </div>
    </Modal>
  );
};
