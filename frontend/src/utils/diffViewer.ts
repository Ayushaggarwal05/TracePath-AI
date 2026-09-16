export interface DiffLine {
  type: 'add' | 'delete' | 'context' | 'header' | 'file';
  content: string;
  oldLineNumber?: number;
  newLineNumber?: number;
}

export function parseUnifiedDiff(rawDiff: string): DiffLine[] {
  if (!rawDiff) return [];

  const lines = rawDiff.split('\n');
  const result: DiffLine[] = [];
  let oldLine = 1;
  let newLine = 1;

  for (const line of lines) {
    if (line.startsWith('---') || line.startsWith('+++')) {
      result.push({ type: 'file', content: line });
    } else if (line.startsWith('@@')) {
      result.push({ type: 'header', content: line });
      // Extract starting line numbers from @@ -a,b +c,d @@
      const match = line.match(/@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
      if (match) {
        oldLine = parseInt(match[1], 10);
        newLine = parseInt(match[2], 10);
      }
    } else if (line.startsWith('+')) {
      result.push({
        type: 'add',
        content: line.slice(1),
        newLineNumber: newLine++,
      });
    } else if (line.startsWith('-')) {
      result.push({
        type: 'delete',
        content: line.slice(1),
        oldLineNumber: oldLine++,
      });
    } else {
      result.push({
        type: 'context',
        content: line.startsWith(' ') ? line.slice(1) : line,
        oldLineNumber: oldLine++,
        newLineNumber: newLine++,
      });
    }
  }

  return result;
}
