import React, { useState } from 'react';
import { parseUnifiedDiff, DiffLine } from '../../utils/diffViewer';
import { Copy, Check, Columns, AlignLeft, Eye, Sparkles } from 'lucide-react';
import { Badge } from '../common/Badge';

interface DiffViewerProps {
  rawDiff: string;
  updatedContent?: string;
  originalContent?: string;
  docPath?: string;
  className?: string;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  rawDiff,
  updatedContent,
  docPath,
  className = '',
}) => {
  const [viewMode, setViewMode] = useState<'unified' | 'split' | 'preview'>('unified');
  const [copied, setCopied] = useState(false);

  const diffLines = parseUnifiedDiff(rawDiff);

  const additions = diffLines.filter((l) => l.type === 'add').length;
  const deletions = diffLines.filter((l) => l.type === 'delete').length;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Build pairs for split view
  const splitRows: Array<{
    left?: { line?: number; content: string; type: DiffLine['type'] };
    right?: { line?: number; content: string; type: DiffLine['type'] };
  }> = [];

  let i = 0;
  while (i < diffLines.length) {
    const line = diffLines[i];
    if (line.type === 'header' || line.type === 'file') {
      splitRows.push({
        left: { content: line.content, type: line.type },
        right: { content: line.content, type: line.type },
      });
      i++;
    } else if (line.type === 'context') {
      splitRows.push({
        left: { line: line.oldLineNumber, content: line.content, type: 'context' },
        right: { line: line.newLineNumber, content: line.content, type: 'context' },
      });
      i++;
    } else if (line.type === 'delete') {
      // Look ahead for matching add
      if (i + 1 < diffLines.length && diffLines[i + 1].type === 'add') {
        splitRows.push({
          left: { line: line.oldLineNumber, content: line.content, type: 'delete' },
          right: {
            line: diffLines[i + 1].newLineNumber,
            content: diffLines[i + 1].content,
            type: 'add',
          },
        });
        i += 2;
      } else {
        splitRows.push({
          left: { line: line.oldLineNumber, content: line.content, type: 'delete' },
          right: undefined,
        });
        i++;
      }
    } else if (line.type === 'add') {
      splitRows.push({
        left: undefined,
        right: { line: line.newLineNumber, content: line.content, type: 'add' },
      });
      i++;
    }
  }

  return (
    <div className={`flex flex-col rounded-xl border border-dark-border bg-slate-950 overflow-hidden ${className}`}>
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-900 border-b border-dark-border">
        <div className="flex items-center gap-3">
          {docPath && (
            <span className="font-mono text-xs font-semibold text-slate-200">
              {docPath}
            </span>
          )}
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <Badge variant="emerald">+{additions}</Badge>
            <Badge variant="rose">-{deletions}</Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-950 border border-dark-border text-xs">
            <button
              onClick={() => setViewMode('unified')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-medium transition-all ${
                viewMode === 'unified'
                  ? 'bg-slate-800 text-slate-100 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <AlignLeft className="w-3.5 h-3.5" />
              <span>Unified</span>
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-medium transition-all ${
                viewMode === 'split'
                  ? 'bg-slate-800 text-slate-100 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Split</span>
            </button>
            {updatedContent && (
              <button
                onClick={() => setViewMode('preview')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-medium transition-all ${
                  viewMode === 'preview'
                    ? 'bg-slate-800 text-slate-100 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Markdown Preview</span>
              </button>
            )}
          </div>

          {/* Copy Button */}
          <button
            onClick={() => handleCopy(viewMode === 'preview' && updatedContent ? updatedContent : rawDiff)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : viewMode === 'preview' ? 'Copy Markdown' : 'Copy Diff'}</span>
          </button>
        </div>
      </div>

      {/* Main Diff Content */}
      <div className="overflow-x-auto max-h-[65vh] font-mono text-xs leading-relaxed">
        {diffLines.length === 0 ? (
          <div className="p-8 text-center text-slate-500 italic">
            No documentation diff generated for this revision.
          </div>
        ) : viewMode === 'unified' ? (
          /* Unified Diff View */
          <div className="divide-y divide-slate-900/50">
            {diffLines.map((line, idx) => {
              let lineBg = 'hover:bg-slate-900/40';
              let textColor = 'text-slate-300';
              let prefix = ' ';

              if (line.type === 'add') {
                lineBg = 'bg-emerald-500/10 hover:bg-emerald-500/15 border-l-2 border-emerald-500';
                textColor = 'text-emerald-300';
                prefix = '+';
              } else if (line.type === 'delete') {
                lineBg = 'bg-rose-500/10 hover:bg-rose-500/15 border-l-2 border-rose-500';
                textColor = 'text-rose-300';
                prefix = '-';
              } else if (line.type === 'header') {
                lineBg = 'bg-indigo-500/10 text-indigo-400 font-semibold py-1';
                prefix = '@';
              } else if (line.type === 'file') {
                lineBg = 'bg-slate-900 text-slate-400 font-semibold py-1';
              }

              return (
                <div key={idx} className={`flex items-start px-3 py-0.5 select-text ${lineBg}`}>
                  <span className="w-10 shrink-0 text-slate-600 text-right pr-2 select-none text-[11px]">
                    {line.oldLineNumber || ''}
                  </span>
                  <span className="w-10 shrink-0 text-slate-600 text-right pr-3 select-none text-[11px]">
                    {line.newLineNumber || ''}
                  </span>
                  <span className="w-4 shrink-0 text-slate-500 select-none font-bold">{prefix}</span>
                  <span className={`flex-1 whitespace-pre-wrap break-all ${textColor}`}>
                    {line.content}
                  </span>
                </div>
              );
            })}
          </div>
        ) : viewMode === 'split' ? (
          /* Split Diff View */
          <div className="grid grid-cols-2 divide-x divide-dark-border">
            {/* Left Header */}
            <div className="bg-slate-900/90 px-3 py-1.5 text-[11px] font-semibold text-rose-400 border-b border-dark-border">
              Original / Removed Content
            </div>
            {/* Right Header */}
            <div className="bg-slate-900/90 px-3 py-1.5 text-[11px] font-semibold text-emerald-400 border-b border-dark-border">
              Updated / Added Content
            </div>

            {/* Split Rows */}
            {splitRows.map((row, idx) => {
              const leftBg =
                row.left?.type === 'delete'
                  ? 'bg-rose-500/10 text-rose-300'
                  : row.left?.type === 'header'
                  ? 'bg-indigo-500/10 text-indigo-400 font-semibold'
                  : 'text-slate-300';

              const rightBg =
                row.right?.type === 'add'
                  ? 'bg-emerald-500/10 text-emerald-300'
                  : row.right?.type === 'header'
                  ? 'bg-indigo-500/10 text-indigo-400 font-semibold'
                  : 'text-slate-300';

              return (
                <React.Fragment key={idx}>
                  {/* Left Column */}
                  <div className={`flex items-start px-2 py-0.5 border-b border-slate-900/40 min-h-[22px] ${leftBg}`}>
                    <span className="w-8 shrink-0 text-slate-600 text-right pr-2 select-none text-[11px]">
                      {row.left?.line || ''}
                    </span>
                    <span className="flex-1 whitespace-pre-wrap break-all">
                      {row.left?.content || ''}
                    </span>
                  </div>

                  {/* Right Column */}
                  <div className={`flex items-start px-2 py-0.5 border-b border-slate-900/40 min-h-[22px] ${rightBg}`}>
                    <span className="w-8 shrink-0 text-slate-600 text-right pr-2 select-none text-[11px]">
                      {row.right?.line || ''}
                    </span>
                    <span className="flex-1 whitespace-pre-wrap break-all">
                      {row.right?.content || ''}
                    </span>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        ) : (
          /* Rendered Markdown Preview */
          <div className="p-6 bg-slate-950 font-sans text-sm text-slate-200 max-h-[65vh] overflow-y-auto space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-dark-border text-xs text-brand-400 font-mono">
              <Sparkles className="w-4 h-4" />
              <span>Rendered Autonomous Sync Output</span>
            </div>
            <pre className="whitespace-pre-wrap font-mono text-xs bg-slate-900/80 p-4 rounded-xl border border-dark-border text-slate-200">
              {updatedContent}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
