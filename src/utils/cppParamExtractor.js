/**
 * C++ Function Parameter and Signature Extractor
 * Automatically extracts extra scalar parameters from any C++ function signature
 * (e.g. `int n`, `int targetSum`, `int k`, `int val`, `int key`, `int p, int q`, `int start`)
 */

export function extractCppParameters(cppCode = '') {
  if (!cppCode || typeof cppCode !== 'string') return [];

  const lines = cppCode.split('\n');
  let signatureLine = '';

  for (const rawLine of lines) {
    const line = rawLine.replace(/\/\/.*$/, '').trim();
    if (
      line.match(/^(int|bool|void|TreeNode\*|long|double|string|vector<[^>]+>)\s+([a-zA-Z0-9_]+)\s*\((.*)\)/) ||
      line.match(/^([a-zA-Z0-9_]+)\s*\((.*)\)/)
    ) {
      signatureLine = line;
      break;
    }
  }

  if (!signatureLine) {
    const fullMatch = cppCode.match(/([a-zA-Z0-9_]+)\s*\(([^)]*)\)/);
    if (fullMatch) {
      signatureLine = fullMatch[0];
    }
  }

  if (!signatureLine) return [];

  const argsMatch = signatureLine.match(/\(([^)]*)\)/);
  if (!argsMatch || !argsMatch[1]) return [];

  const rawArgs = argsMatch[1].split(',');
  const extracted = [];

  for (const rawArg of rawArgs) {
    const trimmed = rawArg.trim();
    if (!trimmed) continue;

    // Filter out tree pointers and primary array inputs which are handled separately
    const lower = trimmed.toLowerCase();
    if (
      lower.includes('treenode*') ||
      lower.includes('treenode *') ||
      lower.includes('vector<treenode*>') ||
      (lower.includes('vector<int>') && (lower.includes('arr') || lower.includes('nums')))
    ) {
      continue;
    }

    // Match type and variable name (e.g. `int targetSum`, `int n = 4`, `int k`, `int val`)
    const paramMatch = trimmed.match(/(int|double|float|long|bool|string|size_t)\s+([*&]?\s*[a-zA-Z0-9_]+)(?:\s*=\s*([^,)]+))?/);
    if (paramMatch) {
      const type = paramMatch[1];
      const name = paramMatch[2].replace(/[*&\s]/g, '');
      const defaultLiteral = paramMatch[3]?.trim();

      let defaultVal = 0;
      if (defaultLiteral !== undefined) {
        defaultVal = isNaN(Number(defaultLiteral)) ? defaultLiteral : Number(defaultLiteral);
      } else {
        // Smart defaults based on common parameter names
        const nLower = name.toLowerCase();
        if (nLower.includes('targetsum') || nLower === 'sum') defaultVal = 22;
        else if (nLower === 'n') defaultVal = 4;
        else if (nLower === 'k') defaultVal = 2;
        else if (nLower === 'val') defaultVal = 6;
        else if (nLower === 'key') defaultVal = 3;
        else if (nLower === 'target') defaultVal = 5;
        else if (nLower === 'p') defaultVal = 2;
        else if (nLower === 'q') defaultVal = 8;
        else if (nLower === 'w') defaultVal = 50;
        else if (nLower === 'start' || nLower.includes('startnode')) defaultVal = 0;
        else if (nLower.includes('depth') || nLower.includes('max')) defaultVal = 3;
        else defaultVal = 5;
      }

      extracted.push({
        name,
        type,
        label: name,
        default: defaultVal,
        min: type === 'int' ? -1000 : undefined,
        max: type === 'int' ? 1000 : undefined,
      });
    }
  }

  return extracted;
}

/**
 * Sanitizes and normalizes function call labels for the Call Tree & Stack
 * Prevents exposing internal code fragments or raw multiline statements
 */
export function formatCallLabel(funcName = 'solve', args = {}, maxLength = 24) {
  const cleanFunc = (funcName || 'solve')
    .replace(/^(int|bool|void|TreeNode\*|long|double)\s+/, '')
    .split('(')[0]
    .trim();

  const formattedArgs = Object.entries(args || {})
    .filter(([k, v]) => v !== undefined && v !== null && k !== 'this')
    .map(([k, v]) => {
      let valStr = String(v);
      if (valStr.startsWith('Node(')) {
        valStr = valStr.replace('Node(', '').replace(')', '');
      } else if (valStr.length > 8) {
        valStr = valStr.substring(0, 7) + '…';
      }
      return `${k}=${valStr}`;
    })
    .join(', ');

  const fullLabel = `${cleanFunc}(${formattedArgs})`;
  if (fullLabel.length > maxLength) {
    return fullLabel.substring(0, maxLength - 1) + '…';
  }
  return fullLabel;
}
