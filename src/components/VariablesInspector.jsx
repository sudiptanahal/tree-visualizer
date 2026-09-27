import React from 'react';
import { Eye, Terminal, CheckCircle2, XCircle } from 'lucide-react';

export default function VariablesInspector({ variables = {}, pointers = {}, actionType = '', output = [] }) {
  const allEntries = [
    ...Object.entries(pointers).map(([k, v]) => ({ key: k, val: v, type: 'pointer' })),
    ...Object.entries(variables).map(([k, v]) => ({ key: k, val: v, type: 'variable' })),
  ];

  // Remove duplicates
  const uniqueKeys = new Set();
  const filtered = allEntries.filter(item => {
    if (uniqueKeys.has(item.key)) return false;
    uniqueKeys.add(item.key);
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-slate-950/90 rounded-xl border border-slate-800/80 overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-900/90 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
            Scope & Variables Watch
          </span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
          {filtered.length} Items
        </span>
      </div>

      {/* Variables List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 font-mono text-xs">
        {filtered.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-500 italic">
            [ No local variables in scope ]
          </div>
        ) : (
          filtered.map(({ key, val, type }) => {
            const isPointer = type === 'pointer' || (typeof val === 'string' && val.includes('Node('));
            const isBoolean = typeof val === 'boolean';
            const isArray = Array.isArray(val);

            return (
              <div
                key={key}
                className="flex items-center justify-between px-2.5 py-1.5 bg-slate-900/50 rounded-lg border border-slate-800/70 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <span className={isPointer ? 'text-rose-400 font-semibold' : 'text-sky-300'}>
                    {key}
                  </span>
                  <span className="text-slate-500">=</span>
                </div>

                <div className="font-semibold text-right max-w-[55%] truncate">
                  {isBoolean ? (
                    val ? (
                      <span className="text-emerald-400 flex items-center gap-1 justify-end">
                        <CheckCircle2 className="w-3.5 h-3.5" /> true
                      </span>
                    ) : (
                      <span className="text-rose-400 flex items-center gap-1 justify-end">
                        <XCircle className="w-3.5 h-3.5" /> false
                      </span>
                    )
                  ) : isArray ? (
                    <span className="text-amber-300 font-mono">[{val.join(', ')}]</span>
                  ) : isPointer ? (
                    <span className="text-emerald-300 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/50">
                      {String(val)}
                    </span>
                  ) : (
                    <span className="text-slate-200">{String(val)}</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Traversal / Output result strip */}
      {output && output.length > 0 && (
        <div className="p-2.5 bg-slate-900/90 border-t border-slate-800">
          <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
            <span className="text-slate-400 font-bold flex items-center gap-1">
              <Terminal className="w-3 h-3 text-sky-400" /> Output Stream:
            </span>
          </div>
          <div className="bg-slate-950 px-2 py-1 rounded border border-slate-800 font-mono text-xs text-amber-300 overflow-x-auto whitespace-nowrap">
            [{Array.isArray(output[0]) ? output.map(lvl => `[${lvl.join(',')}]`).join(', ') : output.join(', ')}]
          </div>
        </div>
      )}
    </div>
  );
}
