import React from 'react';
import { Layers, ArrowDown, CornerDownLeft } from 'lucide-react';

export default function CallStackPanel({ callStack = [] }) {
  // Stack displays with top-of-stack at the top
  const reversedStack = [...callStack].reverse();

  return (
    <div className="flex flex-col h-full bg-slate-950/90 rounded-xl border border-slate-800/80 overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-900/90 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
            Call Stack (Stack Frames)
          </span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/50">
          Depth: {callStack.length}
        </span>
      </div>

      {/* Stack Frames List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
        {reversedStack.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-500 font-mono italic">
            [ Call Stack Empty ]
          </div>
        ) : (
          reversedStack.map((frame, idx) => {
            const isTop = idx === 0;
            return (
              <div
                key={frame.id || idx}
                className={`p-2.5 rounded-lg border transition-all callstack-item-enter ${
                  isTop
                    ? 'bg-purple-950/40 border-purple-500/80 shadow-lg shadow-purple-900/20'
                    : 'bg-slate-900/60 border-slate-800/80 opacity-80'
                }`}
              >
                {/* Frame Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-mono text-xs">
                    <span className="text-purple-400 font-bold">{frame.func}()</span>
                    {isTop && (
                      <span className="text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/40 px-1.5 py-0.2 rounded font-sans font-bold">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Line {frame.line || 1}
                  </span>
                </div>

                {/* Function Arguments / Scope */}
                {frame.args && Object.keys(frame.args).length > 0 && (
                  <div className="mt-1.5 pt-1.5 border-t border-slate-800/60 grid grid-cols-2 gap-1 text-[11px] font-mono">
                    {Object.entries(frame.args).map(([argName, argVal]) => (
                      <div key={argName} className="flex items-center gap-1 overflow-hidden text-ellipsis">
                        <span className="text-slate-500">{argName}:</span>
                        <span className="text-slate-300 font-semibold">{String(argVal)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Return Value if Frame is Resolving */}
                {frame.returnVal !== null && frame.returnVal !== undefined && (
                  <div className="mt-1.5 flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                    <CornerDownLeft className="w-3 h-3" />
                    <span>return {String(frame.returnVal)}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Stack Base Indicator */}
      <div className="px-3 py-1.5 bg-slate-900/60 border-t border-slate-800 text-[10px] text-slate-500 flex items-center justify-center gap-1 font-mono">
        <ArrowDown className="w-3 h-3" />
        <span>Stack Bottom (main)</span>
      </div>
    </div>
  );
}
